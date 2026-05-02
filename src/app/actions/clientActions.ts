"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClients() {
    return await prisma.client.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function getClientById(id: string) {
    return await prisma.client.findUnique({
        where: { id }
    });
}

export async function createClient(data: {
    name: string;
    company: string;
    email: string;
    phone: string;
    type: string;
    address?: string;
    billingAddress?: string;
}) {
    const client = await prisma.client.create({
        data: {
            ...data,
            totalSpent: 0
        }
    });
    
    revalidatePath("/admin/clients");
    revalidatePath("/admin/orders/new");
    return client;
}

export async function updateClient(id: string, data: any) {
    const client = await prisma.client.update({
        where: { id },
        data
    });
    
    revalidatePath("/admin/clients");
    return client;
}
