import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Clear all NextAuth cookies when accessing login page
  // This ensures no stale session data remains
  if (pathname === '/auth/login') {
    const response = NextResponse.next();
    
    // Delete all possible NextAuth cookie variations
    const cookiesToDelete = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.csrf-token',
      '__Host-next-auth.csrf-token',
      'next-auth.callback-url',
      '__Secure-next-auth.callback-url',
    ];
    
    cookiesToDelete.forEach(cookieName => {
      response.cookies.delete(cookieName);
      // Also delete with explicit options
      response.cookies.set(cookieName, '', {
        maxAge: 0,
        path: '/',
      });
    });
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/login'],
};
