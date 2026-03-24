/**
 * Serviço de autenticação que centraliza toda a lógica de login, registro e token.
 */

import { apiService } from './api';
import Cookies from 'js-cookie';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  role: 'admin' | 'user';
}

class AuthService {
  private getSecureLoginMessage(status: number): string {
    // Evita enumeração de usuários: mesma mensagem para credenciais inválidas.
    if (status === 400 || status === 401 || status === 403) {
      return 'Credenciais inválidas. Verifique email e senha.';
    }

    if (status === 429) {
      return 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.';
    }

    if (status >= 500) {
      return 'Nao foi possível autenticar no momento. Tente novamente em instantes.';
    }

    if (status === 0) {
      return 'Nao foi possível conectar ao servidor. Verifique sua conexao e tente novamente.';
    }

    return 'Nao foi possível concluir o login. Tente novamente.';
  }

  async login(email: string, password: string) {
    const response = await apiService.post<LoginResponse>(
      '/auth/login',
      { email, password },
      true // É uma rota pública
    );

    if (response.success && response.data?.token) {
      this.saveToken(response.data.token);
      return {
        success: true,
        token: response.data.token,
      };
    }

    return {
      success: false,
      error: this.getSecureLoginMessage(response.status),
    };
  }

  async register(data: RegisterRequest) {
    const payload = {
      ...data,
      role: data.role === 'admin' ? 'ADMIN' : 'USER',
    };

    const response = await apiService.post<LoginResponse>(
      '/auth/register',
      payload,
      true // É uma rota pública
    );

    if (response.success) {
      return {
        success: true,
      };
    }

    return {
      success: false,
      error: response.error || 'Falha no registro',
    };
  }

  saveToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('@Oficina:token', token);
      Cookies.set('auth_token', token, { expires: 7, sameSite: 'Lax' });
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('@Oficina:token');
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('@Oficina:token');
      Cookies.remove('auth_token');
    }
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const authService = new AuthService();
