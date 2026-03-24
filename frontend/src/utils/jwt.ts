/**
 * Utilitários para trabalhar com JWT (JSON Web Token)
 */

export interface JWTPayload {
  email?: string;
  name?: string;
  role?: string;
  sub?: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

/**
 * Decodifica um token JWT e retorna o payload
 * Nota: Isso NÃO valida a assinatura do token. Use apenas para extrair informações.
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    const binary = atob(paddedBase64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const decodedJson = new TextDecoder('utf-8').decode(bytes);
    const decoded = JSON.parse(decodedJson);

    return decoded;
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error);
    return null;
  }
}

/**
 * Verifica se um token JWT expirou
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;

  const expirationTime = payload.exp * 1000; // Converter para ms
  return Date.now() >= expirationTime;
}

/**
 * Extrai o email do token JWT
 */
export function getEmailFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.email || payload?.sub || null;
}

/**
 * Extrai o nome do token JWT
 */
export function getNameFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.name || null;
}

/**
 * Extrai e normaliza a role do token JWT para o formato usado no frontend.
 */
export function getRoleFromToken(token: string): 'admin' | 'user' | null {
  const payload = decodeJWT(token);
  const rawRole = payload?.role;

  if (typeof rawRole !== 'string') return null;

  if (rawRole.toUpperCase() === 'ADMIN') return 'admin';
  if (rawRole.toUpperCase() === 'USER') return 'user';

  return null;
}
