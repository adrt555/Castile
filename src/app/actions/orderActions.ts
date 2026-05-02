"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getOrders() {
    return await prisma.order.findMany({
        include: {
            client: true,
            items: true
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getOrderById(id: string) {
    return await prisma.order.findUnique({
        where: { id },
        include: {
            client: true,
            items: true
        }
    });
}

export async function createOrder(data: any) {
    const { items, ...orderData } = data;
    
    const order = await prisma.order.create({
        data: {
            ...orderData,
            items: {
                create: items
            }
        },
        include: {
            client: true,
            items: true
        }
    });

    // Update client total spent
    if (order.status === 'Paid' || order.status === 'Delivered') {
        await prisma.client.update({
            where: { id: order.clientId },
            data: {
                totalSpent: { increment: order.total }
            }
        });
    }
    
    revalidatePath("/admin/orders");
    revalidatePath("/admin/finance");
    return order;
}

export async function updateOrderStatus(id: string, status: string) {
    const order = await prisma.order.update({
        where: { id },
        data: { status }
    });
    
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/finance");
    return order;
}

export async function updateOrder(id: string, data: any) {
    const { items, ...orderData } = data;

    // We must delete old items and recreate them to safely handle line item changes
    const order = await prisma.order.update({
        where: { id },
        data: {
            ...orderData,
            items: {
                deleteMany: {},
                create: items
            }
        },
        include: {
            client: true,
            items: true
        }
    });
    
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/finance");
    return order;
}
