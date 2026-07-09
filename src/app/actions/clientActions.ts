"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getClients() {
    try {
        return await prisma.client.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (e) {
        console.error("DB Error in getClients:", e);
        return [];
    }
}

export async function getClientById(id: string) {
    try {
        return await prisma.client.findUnique({
            where: { id }
        });
    } catch (e) {
        console.error("DB Error in getClientById:", e);
        return null;
    }
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
    try {
        const trimmedEmail = data.email.trim().toLowerCase();

        // Check if client with this email already exists
        const existing = await prisma.client.findUnique({
            where: { email: trimmedEmail }
        });
        if (existing) {
            throw new Error(`A client with the email "${trimmedEmail}" already exists.`);
        }

        const client = await prisma.client.create({
            data: {
                ...data,
                email: trimmedEmail,
                totalSpent: 0
            }
        });
        
        revalidatePath("/admin/clients");
        revalidatePath("/admin/orders/new");
        return client;
    } catch (e: any) {
        console.error("DB Error in createClient:", e);
        throw new Error(e.message || "Failed to create client.");
    }
}

export async function updateClient(id: string, data: any) {
    const client = await prisma.client.update({
        where: { id },
        data
    });
    
    revalidatePath("/admin/clients");
    return client;
}
