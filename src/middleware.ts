import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // We only want to protect /admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {

        // Check if the user is already on the login page
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next();
        }

        // Since this is a mock CRM without a real backend session yet,
        // we would normally look for a Secure HttpOnly token here.
        // Because we are relying on a Client Component to set localStorage in our mock, 
        // the true auth guard happens in the Layout on the client side for this demo.

        // However, we can stub this out for when a real DB (like Supabase) is added:
        const token = request.cookies.get('crm_auth_token');

        // If we wanted to strictly enforce a server-side token:
        // if (!token) {
        //   return NextResponse.redirect(new URL('/admin/login', request.url));
        // }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/admin/:path*',
};
