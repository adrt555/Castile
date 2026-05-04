import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Disable authentication check for now
    // We only protect /admin and redirect /login
    // if (!pathname.startsWith('/admin') && pathname !== '/login') {
    //     return NextResponse.next();
    // }

    // let supabaseResponse = NextResponse.next({
    //     request,
    // })

    // const supabase = createServerClient(
    //     process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    //     {
    //         cookies: {
    //             getAll() {
    //                 return request.cookies.getAll()
    //             },
    //             setAll(cookiesToSet) {
    //                 cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
    //                 supabaseResponse = NextResponse.next({
    //                     request,
    //                 })
    //                 cookiesToSet.forEach(({ name, value, options }) =>
    //                     supabaseResponse.cookies.set(name, value, options)
    //                 )
    //             },
    //         },
    //     }
    // )

    // const {
    //     data: { user },
    // } = await supabase.auth.getUser()

    // if (pathname.startsWith('/admin')) {
    //     if (!user) {
    //         const loginUrl = new URL('/login', request.url);
    //         loginUrl.searchParams.set('redirect', pathname);
    //         return NextResponse.redirect(loginUrl);
    //     }
    // }

    // if (pathname === '/login' && user) {
    //     return NextResponse.redirect(new URL('/admin', request.url));
    // }

    // return supabaseResponse;
    
    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/login'],
};
