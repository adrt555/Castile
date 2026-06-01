"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProjects() {
    return await prisma.project.findMany({
        include: { client: true },
        orderBy: { createdAt: "desc" },
    });
}

export async function getProjectById(id: string) {
    return await prisma.project.findUnique({
        where: { id },
        include: {
            client: true,
            areas: {
                include: { items: true }
            }
        }
    });
}

export async function createProject(data: any) {
    const { areas, clientId, clientName, ...projectData } = data;
    
    let resolvedClientId = clientId;
    if (!resolvedClientId) {
        const nameToUse = clientName || "Project Draft Client";
        const safeName = nameToUse.toLowerCase().replace(/[^a-z0-9]/g, "");
        const emailToUse = `guest-${safeName || "client"}@castileusa.com`;
        
        const existingClient = await prisma.client.findFirst({
            where: { email: emailToUse }
        });
        if (existingClient) {
            resolvedClientId = existingClient.id;
        } else {
            const newClient = await prisma.client.create({
                data: {
                    name: nameToUse,
                    company: "Castile Guest",
                    email: emailToUse,
                    phone: "(786)-781-4383",
                    type: "Homeowner"
                }
            });
            resolvedClientId = newClient.id;
        }
    }

    const project = await prisma.project.create({
        data: {
            ...projectData,
            clientId: resolvedClientId,
            areas: {
                create: areas.map((area: any) => ({
                    name: area.name,
                    phase: area.phase,
                    items: {
                        create: area.items.map((item: any) => ({
                            code: item.code,
                            description: item.description,
                            quantity: item.quantity,
                            unit: item.unit,
                            unitPrice: item.unitPrice,
                            totalPrice: item.quantity * item.unitPrice,
                            imageUrl: item.imageUrl,
                        }))
                    }
                }))
            }
        }
    });

    revalidatePath("/admin/projects");
    return project;
}

export async function updateProject(id: string, data: any) {
    const { areas, clientId, clientName, ...projectData } = data;

    let resolvedClientId = clientId;
    if (!resolvedClientId) {
        const nameToUse = clientName || "Project Draft Client";
        const safeName = nameToUse.toLowerCase().replace(/[^a-z0-9]/g, "");
        const emailToUse = `guest-${safeName || "client"}@castileusa.com`;
        
        const existingClient = await prisma.client.findFirst({
            where: { email: emailToUse }
        });
        if (existingClient) {
            resolvedClientId = existingClient.id;
        } else {
            const newClient = await prisma.client.create({
                data: {
                    name: nameToUse,
                    company: "Castile Guest",
                    email: emailToUse,
                    phone: "(786)-781-4383",
                    type: "Homeowner"
                }
            });
            resolvedClientId = newClient.id;
        }
    }

    // Delete existing areas/items and recreate them
    await prisma.projectArea.deleteMany({
        where: { projectId: id }
    });

    const project = await prisma.project.update({
        where: { id },
        data: {
            ...projectData,
            clientId: resolvedClientId,
            areas: {
                create: areas.map((area: any) => ({
                    name: area.name,
                    phase: area.phase,
                    items: {
                        create: area.items.map((item: any) => ({
                            code: item.code,
                            description: item.description,
                            quantity: item.quantity,
                            unit: item.unit,
                            unitPrice: item.unitPrice,
                            totalPrice: item.quantity * item.unitPrice,
                            imageUrl: item.imageUrl,
                        }))
                    }
                }))
            }
        }
    });

    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}`);
    return project;
}

export async function deleteProject(id: string) {
    await prisma.project.delete({
        where: { id }
    });
    revalidatePath("/admin/projects");
}

export async function updateProjectStatus(id: string, status: string) {
    try {
        const project = await prisma.project.update({
            where: { id },
            data: { status }
        });
        revalidatePath("/admin/projects");
        revalidatePath("/admin");
        return project;
    } catch (e) {
        console.error("DB Error in updateProjectStatus:", e);
        throw e;
    }
}
