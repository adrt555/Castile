import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'castile-crm-secret-key-2026');

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes
    if (pathname.startsWith('/admin')) {
        const token = request.cookies.get('crm_session')?.value;

        if (!token) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.next();
        } catch {
            // Token expired or invalid — redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            const response = NextResponse.redirect(loginUrl);
            // Clear the bad cookie
            response.cookies.set('crm_session', '', { maxAge: 0, path: '/' });
            return response;
        }
    }

    // If user is already logged in and visits /login, redirect to admin
    if (pathname === '/login') {
        const token = request.cookies.get('crm_session')?.value;
        if (token) {
            try {
                await jwtVerify(token, JWT_SECRET);
                return NextResponse.redirect(new URL('/admin/orders', request.url));
            } catch {
                // Token invalid, let them see login
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
