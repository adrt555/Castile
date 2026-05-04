const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: process.env.POSTGRES_PRISMA_URL
            }
        }
    });
    try {
        console.log("Testing connection to:", process.env.POSTGRES_PRISMA_URL);
        const adminCount = await prisma.admin.count();
        console.log(`Admin count: ${adminCount}`);
    } catch (e) {
        console.error("DB Error:", e.message);
    } finally {
        await prisma.$disconnect();
    }
}
main();
