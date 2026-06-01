"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getKitchenQuotes() {
    try {
        return await prisma.kitchenQuote.findMany({
            include: { items: true },
            orderBy: { createdAt: "desc" },
        });
    } catch (e) {
        console.error("DB Error in getKitchenQuotes:", e);
        return [];
    }
}

export async function getKitchenQuoteById(id: string) {
    try {
        return await prisma.kitchenQuote.findUnique({
            where: { id },
            include: { items: true }
        });
    } catch (e) {
        console.error("DB Error in getKitchenQuoteById:", e);
        return null;
    }
}

export async function createKitchenQuote(data: any) {
    const { items, ...quoteData } = data;
    try {
        const quote = await prisma.kitchenQuote.create({
            data: {
                ...quoteData,
                items: {
                    create: items.map((i: any) => ({
                        productId: i.productId,
                        productName: i.productName,
                        sku: i.sku,
                        quantity: i.quantity,
                        unit: i.unit || 'each',
                        unitPrice: i.unitPrice,
                        totalPrice: i.quantity * i.unitPrice,
                        area: i.area,
                        notes: i.notes
                    }))
                }
            },
            include: { items: true }
        });
        revalidatePath("/admin/kitchen-sales");
        return quote;
    } catch (e) {
        console.error("DB Error in createKitchenQuote:", e);
        throw e;
    }
}

export async function updateKitchenQuote(id: string, data: any) {
    const { items, ...quoteData } = data;
    try {
        const quote = await prisma.kitchenQuote.update({
            where: { id },
            data: {
                ...quoteData,
                items: {
                    deleteMany: {},
                    create: items.map((i: any) => ({
                        productId: i.productId,
                        productName: i.productName,
                        sku: i.sku,
                        quantity: i.quantity,
                        unit: i.unit || 'each',
                        unitPrice: i.unitPrice,
                        totalPrice: i.quantity * i.unitPrice,
                        area: i.area,
                        notes: i.notes
                    }))
                }
            },
            include: { items: true }
        });
        revalidatePath("/admin/kitchen-sales");
        return quote;
    } catch (e) {
        console.error("DB Error in updateKitchenQuote:", e);
        throw e;
    }
}

export async function updateKitchenQuoteStatus(id: string, status: string) {
    try {
        const quote = await prisma.kitchenQuote.update({
            where: { id },
            data: { status }
        });
        revalidatePath("/admin/kitchen-sales");
        return quote;
    } catch (e) {
        console.error("DB Error in updateKitchenQuoteStatus:", e);
        throw e;
    }
}

export async function deleteKitchenQuote(id: string) {
    try {
        await prisma.kitchenQuote.delete({
            where: { id }
        });
        revalidatePath("/admin/kitchen-sales");
        return { success: true };
    } catch (e) {
        console.error("DB Error in deleteKitchenQuote:", e);
        return { success: false, error: "Could not delete kitchen quote" };
    }
}