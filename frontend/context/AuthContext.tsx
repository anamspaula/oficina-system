'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authService } from '@/src/services/authService';
import { getEmailFromToken, getNameFromToken, getRoleFromToken } from '@/src/utils/jwt';

// --- Interfaces ---

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  address?: string;
  birthDate?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (userData: Omit<User, 'id'>) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ---

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recuperar sessão ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem('@Oficina:user');
    const hasToken = authService.getToken();
    
    if (storedUser && hasToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('@Oficina:user');
        authService.clearToken();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await authService.login(email, password);
      
      if (response.success) {
        // Extrair informações do token JWT
        const token = authService.getToken();
        let userData: User;
        
        if (token) {
          // Tentar extrair informações do JWT
          const tokenEmail = getEmailFromToken(token);
          const tokenName = getNameFromToken(token);
          const tokenRole = getRoleFromToken(token);
          
          userData = {
            id: tokenEmail || email,
            email: tokenEmail || email,
            name: tokenName || email.split('@')[0],
            role: tokenRole || 'user',
          };
        } else {
          // Fallback se não conseguir extrair do token
          userData = {
            id: email,
            email,
            name: email.split('@')[0],
            role: 'user',
          };
        }
        
        setUser(userData);
        localStorage.setItem('@Oficina:user', JSON.stringify(userData));
        return true;
      } else {
        setError(response.error || 'Erro ao fazer login');
        return false;
      }
    } catch (err) {
      setError('Nao foi possível concluir o login. Tente novamente.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    authService.clearToken();
    localStorage.removeItem('@Oficina:user');
    setError(null);
  };

  const addUser = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await authService.register({
        email: userData.email,
        password: userData.password || '',
        name: userData.name,
        phone: userData.phone,
        address: userData.address,
        birthDate: userData.birthDate,
        role: userData.role,
      });

      if (!response.success) {
        setError(response.error || 'Erro ao registrar usuário');
        return false;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('@Oficina:user', JSON.stringify(updatedUser));
    }
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    // TODO: Implementar chamada para backend quando disponível
    console.warn('changePassword ainda não implementado no backend');
    return false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      addUser,
      updateProfile, 
      changePassword, 
      loading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}
