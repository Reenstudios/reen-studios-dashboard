import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Single shared-password protection for the whole dashboard.
// Login sets a cookie; middleware checks it on every request.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/login') || pathname.startsWith('/api/login')) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get('reen_auth')?.value;

  if (authCookie !== process.env.DASHBOARD_PASSWORD) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/((?!login).*)'],
};
