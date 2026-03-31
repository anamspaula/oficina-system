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
  isMechanic?: boolean;
  phone?: string;
  address?: string;
  birthDate?: string;
  role: 'admin' | 'user';
}

export interface UserProfileUpdateRequest {
  name: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface CurrentUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  isMechanic: boolean;
  phone?: string;
  address?: string;
  birthDate?: string;
}

export interface AdminUserUpdateRequest {
  name: string;
  email: string;
  role: 'admin' | 'user';
  isMechanic: boolean;
  phone?: string;
  address?: string;
  birthDate?: string;
  newPassword?: string;
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
      isMechanic: Boolean(data.isMechanic),
    };

    const response = await apiService.post<LoginResponse>(
      '/auth/register',
      payload
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

  async updateProfile(data: UserProfileUpdateRequest) {
    const response = await apiService.put<unknown>('/user/me', data);

    if (response.success) {
      return {
        success: true,
      };
    }

    return {
      success: false,
      error: response.error || 'Nao foi possível atualizar o perfil',
    };
  }

  async getCurrentUser() {
    const response = await apiService.get<CurrentUserResponse>('/user/me');

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.error || 'Nao foi possível carregar o perfil do usuário',
    };
  }

  async getUsersForAdmin() {
    const response = await apiService.get<CurrentUserResponse[]>('/admin/users');

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.error || 'Nao foi possível carregar usuários',
    };
  }

  async getUserByIdAsAdmin(userId: string) {
    const response = await apiService.get<CurrentUserResponse>(`/admin/users/${userId}`);

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.error || 'Nao foi possível carregar usuário',
    };
  }

  async updateUserAsAdmin(userId: string, data: AdminUserUpdateRequest) {
    const payload = {
      ...data,
      role: data.role === 'admin' ? 'ADMIN' : 'USER',
      isMechanic: Boolean(data.isMechanic),
      newPassword: data.newPassword?.trim() ? data.newPassword : undefined,
    };

    const response = await apiService.put<CurrentUserResponse>(`/admin/users/${userId}`, payload);

    if (response.success && response.data) {
      return {
        success: true,
        data: response.data,
      };
    }

    return {
      success: false,
      error: response.error || 'Nao foi possível atualizar usuário',
    };
  }

  saveToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('@Oficina:token', token);
      localStorage.setItem('token', token);
      Cookies.set('auth_token', token, { expires: 7, sameSite: 'Lax' });
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    const cookieToken = Cookies.get('auth_token');
    if (cookieToken) return cookieToken;

    const localToken = localStorage.getItem('@Oficina:token');
    if (localToken) return localToken;

    const legacyToken = localStorage.getItem('token');
    if (legacyToken) {
      localStorage.setItem('@Oficina:token', legacyToken);
      return legacyToken;
    }

    return null;
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('@Oficina:token');
      localStorage.removeItem('token');
      Cookies.remove('auth_token');
    }
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const authService = new AuthService();
