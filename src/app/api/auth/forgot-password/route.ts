import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();
        const trimmedEmail = email?.trim().toLowerCase();

        if (!trimmedEmail) {
            return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
        }

        const supabase = await createClient();
        
        // Let's use the current request URL to build the redirect URL
        // In local development this will be http://localhost:3000, in production the Vercel URL
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        
        const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
            redirectTo: `${origin}/api/auth/callback?next=/reset-password`,
        });

        if (error) {
            console.error("Supabase reset password error:", error);
            // We still return success to avoid email enumeration
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { success: false, error: error.message || 'Invalid request or database error.' },
            { status: 500 }
        );
    }
}
