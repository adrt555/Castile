import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        const trimmedEmail = email?.trim().toLowerCase();
        const trimmedPassword = password?.trim();

        if (!trimmedEmail || !trimmedPassword) {
            return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
        }

        // Check if ANY admin exists in the database
        const adminCount = await prisma.admin.count();

        if (adminCount === 0) {
            // SETUP MODE: First user to login becomes the permanent admin
            const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
            await prisma.admin.create({
                data: {
                    email: trimmedEmail,
                    password: hashedPassword,
                }
            });
            // Proceed to login them in after creation
        } else {
            // LOGIN MODE: Verify against the database
            const admin = await prisma.admin.findUnique({
                where: { email: trimmedEmail }
            });

            if (!admin) {
                return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
            }

            const isPasswordValid = await bcrypt.compare(trimmedPassword, admin.password);
            if (!isPasswordValid) {
                return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
            }
        }

        // Create a simple auth token (timestamp + secret hash)
        const authSecret = process.env.AUTH_SECRET || 'castile-default-secret-key';
        const token = Buffer.from(`${trimmedEmail}:${Date.now()}:${authSecret}`).toString('base64');

        const response = NextResponse.json({ success: true, isSetup: adminCount === 0 });

        // Set HTTP-only cookie — secure in production, works in dev too
        response.cookies.set('crm_auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;

    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, error: 'Invalid request or database error.' },
            { status: 500 }
        );
    }
}
