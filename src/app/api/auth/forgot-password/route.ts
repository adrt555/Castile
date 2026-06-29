import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();
        const trimmedEmail = email?.trim().toLowerCase();

        if (!trimmedEmail) {
            return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
        }

        // Look up admin in our own database
        const admin = await prisma.admin.findUnique({
            where: { email: trimmedEmail }
        });

        // Always return success to avoid email enumeration
        if (!admin) {
            console.log(`Password reset requested for unknown email: ${trimmedEmail}`);
            return NextResponse.json({ success: true });
        }

        // Generate a secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Store token hash in database (store the raw token, compare on reset)
        await prisma.admin.update({
            where: { email: trimmedEmail },
            data: {
                resetToken,
                resetTokenExpiry,
            }
        });

        // Send the email via nodemailer
        const result = await sendPasswordResetEmail(trimmedEmail, resetToken);
        
        if (!result.success) {
            console.error('Failed to send reset email');
            // Don't expose the error to the client
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { success: false, error: 'Something went wrong. Please try again.' },
            { status: 500 }
        );
    }
}
