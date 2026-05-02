import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        const trimmedEmail = email?.trim().toLowerCase();
        const trimmedPassword = password?.trim();

        if (!trimmedEmail || !trimmedPassword) {
            return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
        }

        const supabase = await createClient();

        const { data, error } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password: trimmedPassword,
        });

        if (error || !data.user) {
            return NextResponse.json({ success: false, error: error?.message || 'Invalid email or password.' }, { status: 401 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, error: error.message || 'Invalid request or database error.' },
            { status: 500 }
        );
    }
}
