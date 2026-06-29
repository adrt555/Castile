import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();
        const trimmedPassword = password?.trim();
        const trimmedToken = token?.trim();

        if (!trimmedToken) {
            return NextResponse.json({ success: false, error: 'Reset token is missing.' }, { status: 400 });
        }

        if (!trimmedPassword || trimmedPassword.length < 8) {
            return NextResponse.json({ success: false, error: 'Password must be at least 8 characters.' }, { status: 400 });
        }

        // Find admin by reset token
        const admin = await prisma.admin.findFirst({
            where: {
                resetToken: trimmedToken,
                resetTokenExpiry: {
                    gt: new Date() // Token must not be expired
                }
            }
        });

        if (!admin) {
            return NextResponse.json(
                { success: false, error: 'This reset link is invalid or has expired. Please request a new one.' },
                { status: 400 }
            );
        }

        // Hash the new password and clear the reset token
        const hashedPassword = await bcrypt.hash(trimmedPassword, 10);
        await prisma.admin.update({
            where: { id: admin.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Reset password error:', error);
        return NextResponse.json(
            { success: false, error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
