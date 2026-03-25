/**
 * Serviço de API genérico para comunicação com o backend.
 * Centraliza todas as requisições HTTP da aplicação.
 */

import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

class ApiService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    const localToken = localStorage.getItem('@Oficina:token');
    if (localToken) return localToken;

    return Cookies.get('auth_token') || null;
  }

  private async request<T>(
    endpoint: string,
    method: string = 'GET',
    body?: unknown,
    isPublic: boolean = false
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token && !isPublic) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      const rawResponse = await response.text();
      let data: unknown = undefined;

      if (rawResponse) {
        try {
          data = JSON.parse(rawResponse);
        } catch {
          data = rawResponse;
        }
      }

      if (!response.ok) {
        const errorMessage =
          typeof data === 'object' && data !== null && 'message' in data
            ? String((data as { message: unknown }).message)
            : typeof data === 'string' && data.length > 0
              ? data
              : `Erro ${response.status}`;

        return {
          success: false,
          error: errorMessage,
          status: response.status,
        };
      }

      return {
        success: true,
        data: data as T,
        status: response.status,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na requisição';
      return {
        success: false,
        error: errorMessage,
        status: 0,
      };
    }
  }

  // Requisições públicas
  async post<T>(endpoint: string, body: unknown, isPublic: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', body, isPublic);
  }

  async get<T>(endpoint: string, isPublic: boolean = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET', undefined, isPublic);
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', body);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE');
  }
}

export const apiService = new ApiService();
