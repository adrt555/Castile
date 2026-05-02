import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // Validate against environment variables (with fallback defaults for dev)
        const validEmail = process.env.ADMIN_EMAIL || 'adrian@castileusa.com';
        const validPassword = process.env.ADMIN_PASSWORD || 'castile2026';

        if (
            email?.toLowerCase() === validEmail.toLowerCase() &&
            password === validPassword
        ) {
            // Create a simple auth token (timestamp + secret hash)
            const authSecret = process.env.AUTH_SECRET || 'castile-default-secret-key';
            const token = Buffer.from(`${email}:${Date.now()}:${authSecret}`).toString('base64');

            const response = NextResponse.json({ success: true });

            // Set HTTP-only cookie — secure in production, works in dev too
            response.cookies.set('crm_auth_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });

            return response;
        }

        return NextResponse.json(
            { success: false, error: 'Invalid email or password.' },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { success: false, error: 'Invalid request.' },
            { status: 400 }
        );
    }
}
