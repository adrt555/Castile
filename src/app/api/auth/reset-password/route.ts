import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { token, password } = await request.json();
        const trimmedPassword = password?.trim();

        if (!token || !trimmedPassword) {
            return NextResponse.json({ success: false, error: 'Token and new password are required.' }, { status: 400 });
        }

        const admin = await prisma.admin.findFirst({
            where: { 
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date() // Must not be expired
                }
            }
        });

        if (!admin) {
            return NextResponse.json({ success: false, error: 'Invalid or expired reset token.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

        await prisma.admin.update({
            where: { id: admin.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { success: false, error: 'Invalid request or database error.' },
            { status: 500 }
        );
    }
}
