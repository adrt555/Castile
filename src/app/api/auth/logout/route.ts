import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear the session cookie
    response.cookies.set('crm_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });

    // Also clear legacy cookie
    response.cookies.set('crm_auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });

    return response;
}
