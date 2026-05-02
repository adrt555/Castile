import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/mailer';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();
        const trimmedEmail = email?.trim().toLowerCase();

        if (!trimmedEmail) {
            return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
        }

        const admin = await prisma.admin.findUnique({
            where: { email: trimmedEmail }
        });

        // Always return success even if email not found to prevent email enumeration
        if (!admin) {
            return NextResponse.json({ success: true });
        }

        // Generate a secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Token expires in 1 hour
        const resetTokenExpiry = new Date(Date.now() + 3600000); 

        await prisma.admin.update({
            where: { id: admin.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });

        const emailResult = await sendPasswordResetEmail(trimmedEmail, resetToken);

        if (!emailResult.success) {
            return NextResponse.json({ success: false, error: 'Failed to send email. Check SMTP configuration.' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { success: false, error: 'Invalid request or database error.' },
            { status: 500 }
        );
    }
}
