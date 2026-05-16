"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClientCredits(clientId: string) {
    try {
        const client = await prisma.client.findUnique({
            where: { id: clientId },
            select: { commissionCredits: true }
        });
        return client?.commissionCredits || 0;
    } catch (e) {
        console.error("Error fetching credits:", e);
        return 0;
    }
}

export async function getCreditHistory(clientId: string) {
    try {
        return await prisma.creditHistory.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' }
        });
    } catch (e) {
        console.error("Error fetching credit history:", e);
        return [];
    }
}

export async function addCredit(clientId: string, amount: number, reason: string) {
    try {
        const transaction = await prisma.$transaction([
            prisma.client.update({
                where: { id: clientId },
                data: {
                    commissionCredits: { increment: amount }
                }
            }),
            prisma.creditHistory.create({
                data: {
                    clientId,
                    amount,
                    type: 'ADD',
                    reason
                }
            })
        ]);
        
        revalidatePath("/admin/clients");
        revalidatePath(`/admin/clients/${clientId}/commissions`);
        return { success: true, data: transaction[0] };
    } catch (e) {
        console.error("Error adding credit:", e);
        return { success: false, error: "Failed to add credit" };
    }
}

export async function subtractCredit(clientId: string, amount: number, reason: string) {
    try {
        const transaction = await prisma.$transaction([
            prisma.client.update({
                where: { id: clientId },
                data: {
                    commissionCredits: { decrement: amount }
                }
            }),
            prisma.creditHistory.create({
                data: {
                    clientId,
                    amount,
                    type: 'SUBTRACT',
                    reason
                }
            })
        ]);
        
        revalidatePath("/admin/clients");
        revalidatePath(`/admin/clients/${clientId}/commissions`);
        return { success: true, data: transaction[0] };
    } catch (e) {
        console.error("Error subtracting credit:", e);
        return { success: false, error: "Failed to subtract credit" };
    }
}
