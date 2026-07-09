"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPurchaseOrders() {
    try {
        return await prisma.purchaseOrder.findMany({
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        });
    } catch (e) {
        console.error("DB Error in getPurchaseOrders:", e);
        return [];
    }
}

export async function getPurchaseOrderById(id: string) {
    try {
        return await prisma.purchaseOrder.findUnique({
            where: { id },
            include: { items: true }
        });
    } catch (e) {
        console.error("DB Error in getPurchaseOrderById:", e);
        return null;
    }
}

export async function createPurchaseOrder(data: {
    manufacturer: string;
    status: string;
    expectedDate: string;
    notes: string;
    items: Array<{
        sku: string;
        description: string;
        boxes: number;
        sqftPerBox: number;
        unitCost: number;
        totalLineCost: number;
    }>;
    subtotal: number;
    freight: number;
    tax: number;
    total: number;
}) {
    // Generate PO number
    const count = await prisma.purchaseOrder.count();
    const poNumber = `PO-2026-${(count + 1).toString().padStart(3, '0')}`;

    const po = await prisma.purchaseOrder.create({
        data: {
            poNumber,
            manufacturer: data.manufacturer,
            status: data.status,
            expectedDate: data.expectedDate,
            notes: data.notes,
            subtotal: data.subtotal,
            freight: data.freight,
            tax: data.tax,
            total: data.total,
            items: {
                create: data.items.map(item => ({
                    sku: item.sku,
                    description: item.description,
                    boxes: item.boxes,
                    sqftPerBox: item.sqftPerBox,
                    unitCost: item.unitCost,
                    totalLineCost: item.totalLineCost,
                }))
            }
        },
        include: { items: true }
    });

    revalidatePath("/admin/purchase-orders");
    return po;
}

export async function updatePurchaseOrder(id: string, data: {
    manufacturer?: string;
    status?: string;
    expectedDate?: string;
    notes?: string;
    items?: Array<{
        sku: string;
        description: string;
        boxes: number;
        sqftPerBox: number;
        unitCost: number;
        totalLineCost: number;
    }>;
    subtotal?: number;
    freight?: number;
    tax?: number;
    total?: number;
}) {
    try {
        // If items are provided, we do a full replacement of line items
        if (data.items) {
            await prisma.purchaseOrderItem.deleteMany({
                where: { purchaseOrderId: id }
            });
        }

        const po = await prisma.purchaseOrder.update({
            where: { id },
            data: {
                manufacturer: data.manufacturer,
                status: data.status,
                expectedDate: data.expectedDate,
                notes: data.notes,
                subtotal: data.subtotal,
                freight: data.freight,
                tax: data.tax,
                total: data.total,
                items: data.items ? {
                    create: data.items.map(item => ({
                        sku: item.sku,
                        description: item.description,
                        boxes: item.boxes,
                        sqftPerBox: item.sqftPerBox,
                        unitCost: item.unitCost,
                        totalLineCost: item.totalLineCost,
                    }))
                } : undefined
            },
            include: { items: true }
        });

        revalidatePath("/admin/purchase-orders");
        return po;
    } catch (e) {
        console.error("DB Error in updatePurchaseOrder:", e);
        throw e;
    }
}

export async function deletePurchaseOrder(id: string) {
    try {
        await prisma.purchaseOrder.delete({
            where: { id }
        });
        revalidatePath("/admin/purchase-orders");
        return { success: true };
    } catch (e) {
        console.error("DB Error in deletePurchaseOrder:", e);
        throw e;
    }
}

export async function updatePurchaseOrderStatus(id: string, status: string) {
    const po = await prisma.purchaseOrder.update({
        where: { id },
        data: { status }
    });
    revalidatePath("/admin/purchase-orders");
    return po;
}

export async function getPurchaseOrderByNumber(poNumber: string) {
    try {
        return await prisma.purchaseOrder.findUnique({
            where: { poNumber },
            include: { items: true }
        });
    } catch (e) {
        console.error("DB Error in getPurchaseOrderByNumber:", e);
        return null;
    }
}
