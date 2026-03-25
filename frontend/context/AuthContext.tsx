'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService } from '@/src/services/authService';
import { getEmailFromToken, getNameFromToken, getRoleFromToken } from '@/src/utils/jwt';
import type { CurrentUserResponse } from '@/src/services/authService';

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
  updateProfile: (
    data: Partial<Pick<User, 'name' | 'address' | 'birthDate' | 'phone'>>
  ) => Promise<{ success: boolean; error?: string }>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapCurrentUserToContext(userData: CurrentUserResponse): User {
  return {
    id: userData.id,
    email: userData.email,
    name: userData.name,
    role: userData.role === 'ADMIN' ? 'admin' : 'user',
    phone: userData.phone,
    address: userData.address,
    birthDate: userData.birthDate,
  };
}

// --- Provider ---

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = authService.getToken();
    if (!token) return;

    const storedUser = localStorage.getItem('@Oficina:user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch {
        localStorage.removeItem('@Oficina:user');
      }
    }

    const refreshCurrentUser = async () => {
      const response = await authService.getCurrentUser();
      if (!response.success || !response.data) return;

      const hydratedUser = mapCurrentUserToContext(response.data);
      setUser(hydratedUser);
      localStorage.setItem('@Oficina:user', JSON.stringify(hydratedUser));
    };

    void refreshCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await authService.login(email, password);
      
      if (response.success) {
        const currentUserResponse = await authService.getCurrentUser();
        if (currentUserResponse.success && currentUserResponse.data) {
          const hydratedUser = mapCurrentUserToContext(currentUserResponse.data);
          setUser(hydratedUser);
          localStorage.setItem('@Oficina:user', JSON.stringify(hydratedUser));
          return true;
        }

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
    } catch {
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

  const updateProfile = async (
    data: Partial<Pick<User, 'name' | 'address' | 'birthDate' | 'phone'>>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return {
        success: false,
        error: 'Usuario nao autenticado',
      };
    }

    const payload = {
      name: data.name ?? user.name,
      phone: data.phone ?? user.phone,
      address: data.address ?? user.address,
      birthDate: data.birthDate ?? user.birthDate,
    };

    const response = await authService.updateProfile(payload);

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Erro ao atualizar perfil',
      };
    }

    const updatedUser = { ...user, ...payload };
    setUser(updatedUser);
    localStorage.setItem('@Oficina:user', JSON.stringify(updatedUser));

    return { success: true };
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return {
        success: false,
        error: 'Usuario nao autenticado',
      };
    }

    const response = await authService.updateProfile({
      name: user.name,
      phone: user.phone,
      address: user.address,
      birthDate: user.birthDate,
      currentPassword,
      newPassword,
    });

    if (!response.success) {
      return {
        success: false,
        error: response.error || 'Erro ao alterar senha',
      };
    }

    return { success: true };
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
