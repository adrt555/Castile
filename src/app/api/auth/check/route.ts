import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'castile-crm-secret-key-2026');

export async function GET(request: NextRequest) {
    const token = request.cookies.get('crm_session')?.value;

    if (!token) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
        await jwtVerify(token, JWT_SECRET);
        return NextResponse.json({ authenticated: true });
    } catch {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
