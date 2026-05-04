const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function seed() {
    const prisma = new PrismaClient({
        datasources: {
            db: { url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL }
        }
    });

    try {
        const hashedPassword = await bcrypt.hash('adrt555', 10);
        
        // Upsert: create if not exists, update if exists
        const admin = await prisma.admin.upsert({
            where: { email: 'adrian@castileusa.com' },
            update: { password: hashedPassword },
            create: {
                email: 'adrian@castileusa.com',
                password: hashedPassword,
            }
        });

        console.log('Admin user created/updated:', admin.email);
    } catch (e) {
        console.error('Error seeding admin:', e);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
