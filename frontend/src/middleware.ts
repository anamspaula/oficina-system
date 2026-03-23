import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Se o usuário estiver logado e tentar acessar o login, manda para o dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Se o usuário NÃO estiver logado e tentar acessar rotas privadas
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configuração de quais rotas o middleware deve monitorar
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};