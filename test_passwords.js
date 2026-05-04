const { PrismaClient } = require('@prisma/client');
const passwords = ['23792990Adrt', '23792990Ac*', 'castile2026', 'adrt555', 'Castile2026db', 'Castile2026db!'];

async function testPasswords() {
    for (const pwd of passwords) {
        const encodedPwd = encodeURIComponent(pwd);
        const url = `postgresql://postgres:${encodedPwd}@db.ufjhktejyxxtczkwuowr.supabase.co:5432/postgres?sslmode=require`;
        const prisma = new PrismaClient({
            datasources: {
                db: {
                    url: url
                }
            }
        });
        
        try {
            await prisma.$connect();
            await prisma.admin.count();
            console.log('SUCCESS with password:', pwd);
            await prisma.$disconnect();
            return;
        } catch(e) {
            console.log('Failed with:', pwd, '-', e.message.split('\n')[0]);
        } finally {
            await prisma.$disconnect();
        }
    }
}
testPasswords();
