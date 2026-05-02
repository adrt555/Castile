import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();
        const trimmedPassword = password?.trim();

        if (!trimmedPassword) {
            return NextResponse.json({ success: false, error: 'New password is required.' }, { status: 400 });
        }

        const supabase = await createClient();
        
        const { data, error } = await supabase.auth.updateUser({
            password: trimmedPassword
        });

        if (error) {
            console.error("Supabase update password error:", error);
            return NextResponse.json({ success: false, error: error.message || 'Invalid or expired session.' }, { status: 400 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { success: false, error: error.message || 'Invalid request or database error.' },
            { status: 500 }
        );
    }
}
