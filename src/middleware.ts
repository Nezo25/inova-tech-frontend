import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('inova.token')?.value;

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');

  if (!token && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // A rota '/' agora é pública (Landing Page)
  // Fix: cache buster for vercel edge middleware redirect loop
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login'],
};
