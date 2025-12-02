import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Clear all NextAuth cookies when accessing login or register page
  // This ensures no stale session data remains
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    const response = NextResponse.next();
    
    // Delete all possible NextAuth cookie variations
    const cookiesToDelete = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
      'next-auth.pkce.code_verifier',
      '__Secure-next-auth.pkce.code_verifier',
    ];
    
    cookiesToDelete.forEach(cookieName => {
      response.cookies.delete(cookieName);
      // Also delete with explicit options
      response.cookies.set(cookieName, '', {
        maxAge: 0,
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
      });
    });
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/login', '/auth/register'],
};
