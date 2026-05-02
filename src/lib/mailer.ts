import nodemailer from 'nodemailer';

export const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.office365.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

export const sendPasswordResetEmail = async (to: string, resetToken: string) => {
    const transporter = getTransporter();
    
    // In local development, the URL will be localhost. In production, it will be the real domain.
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.NODE_ENV === 'production' ? 'https://castileusa.com' : 'http://localhost:3000');
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from: `"Castile Admin" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Password Reset Request',
        html: `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
                <h2 style="color: #18181b;">Castile Password Reset</h2>
                <p style="color: #52525b; line-height: 1.5;">You recently requested to reset your password for your Castile CRM Admin account. Click the button below to reset it. <strong>This link is only valid for 1 hour.</strong></p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #f59e0b; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset My Password</a>
                </div>
                <p style="color: #71717a; font-size: 12px; margin-top: 20px;">If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next hour.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error("Error sending email:", error);
        return { success: false, error };
    }
};
