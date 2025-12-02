import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Aggressive cache busting and session cleanup for auth pages
  if (pathname.startsWith('/auth')) {
    const response = NextResponse.next();
    
    // Set aggressive no-cache headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    // Only clear cookies on login and register pages (not on other auth pages like callback)
    if (pathname === '/auth/login' || pathname === '/auth/register') {
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
        response.cookies.set(cookieName, '', {
          maxAge: 0,
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
        });
      });
    }
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/auth/:path*'],
};
