import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes
    if (pathname.startsWith('/admin')) {
        // Check for the auth cookie
        const token = request.cookies.get('crm_auth_token');

        if (!token?.value) {
            // Not authenticated — redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // If user is on /login and already authenticated, redirect to admin
    if (pathname === '/login') {
        const token = request.cookies.get('crm_auth_token');
        if (token?.value) {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
