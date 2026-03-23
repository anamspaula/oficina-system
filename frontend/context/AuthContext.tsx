'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Cookies from 'js-cookie';

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
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addUser: (userData: Omit<User, 'id'>) => void;
  updateProfile: (data: Partial<User>) => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  loading: boolean;
}

// --- Dados Mockados ---

const MOCK_USERS: User[] = [
  { 
    id: '1', 
    name: 'João Silva', 
    email: 'joao@oficina.com', 
    password: '123456',
    role: 'admin' as const,
    address: 'Rua das Flores, 123, São Paulo - SP',
    birthDate: '1985-05-15',
    phone: '(11) 98765-4321'
  },
  { 
    id: '2', 
    name: 'Maria Santos', 
    email: 'maria@oficina.com', 
    password: '123456',
    role: 'user' as const,
    address: 'Av. Paulista, 1000, São Paulo - SP',
    birthDate: '1990-08-20',
    phone: '(11) 97654-3210'
  }
];

// Banco de dados em memória para a sessão atual
let usersDatabase: User[] = [...MOCK_USERS];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Provider ---

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Recuperar sessão ao carregar a página
  useEffect(() => {
    const storedUser = localStorage.getItem('@Oficina:user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    const foundUser = usersDatabase.find(
      (u) => u.email === email && u.password === password
    );
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      Cookies.set('auth_token', 'true', { expires: 7 });
      localStorage.setItem('@Oficina:user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    Cookies.remove('auth_token');
    localStorage.removeItem('@Oficina:user');
  };

  // Implementação do addUser
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    // Adiciona ao "banco de dados" em memória
    usersDatabase.push(newUser);
    
    // Log para conferência no console durante o desenvolvimento
    console.log('Novo usuário cadastrado:', newUser);
    console.log('Total de usuários no banco:', usersDatabase.length);
  };

  const updateProfile = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      
      const userIndex = usersDatabase.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        usersDatabase[userIndex] = { ...usersDatabase[userIndex], ...data };
      }
      localStorage.setItem('@Oficina:user', JSON.stringify(updatedUser));
    }
  };

  const changePassword = (currentPassword: string, newPassword: string): boolean => {
    if (!user) return false;
    
    const foundUser = usersDatabase.find(u => u.id === user.id);
    if (foundUser && foundUser.password === currentPassword) {
      foundUser.password = newPassword;
      return true;
    }
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
      loading 
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
