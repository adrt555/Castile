const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const adminCount = await prisma.admin.count();
        console.log(`Admin count: ${adminCount}`);
        if (adminCount > 0) {
            const admin = await prisma.admin.findFirst();
            console.log(`Found admin: ${admin.email}`);
        }
    } catch (e) {
        console.error("DB Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
