import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'castile-crm-secret-key-2026');

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        const trimmedEmail = email?.trim().toLowerCase();
        const trimmedPassword = password?.trim();

        if (!trimmedEmail || !trimmedPassword) {
            return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
        }

        // Look up admin in our own database
        const admin = await prisma.admin.findUnique({
            where: { email: trimmedEmail }
        });

        if (!admin) {
            return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
        }

        // Verify password
        const isValid = await bcrypt.compare(trimmedPassword, admin.password);
        if (!isValid) {
            return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
        }

        // Create JWT token
        const token = await new SignJWT({ adminId: admin.id, email: admin.email })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(JWT_SECRET);

        // Set HTTP-only cookie
        const response = NextResponse.json({ success: true });
        response.cookies.set('crm_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;

    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
