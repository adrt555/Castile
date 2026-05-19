import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const sku = formData.get("sku") as string;

        if (!file || !sku) {
            return NextResponse.json({ error: "Missing file or sku" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg';
        
        // Sanitize SKU for database lookup
        const safeSku = sku.replace(/[^a-zA-Z0-9_-]/g, "");

        await prisma.productImage.upsert({
            where: { sku: safeSku },
            update: { base64, mimeType },
            create: { sku: safeSku, base64, mimeType }
        });

        // Return the API endpoint URL that serves the image
        return NextResponse.json({ url: `/api/product-image/${safeSku}` });
    } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
}
