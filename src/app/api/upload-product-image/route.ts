import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

        // Sanitize SKU for filename
        const safeSku = sku.replace(/[^a-zA-Z0-9_-]/g, "");
        const ext = path.extname(file.name) || '.jpg';
        const filename = `${safeSku}${ext}`;
        
        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), "public", "products");
        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // ignore
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        // Return the public URL
        return NextResponse.json({ url: `/products/${filename}` });
    } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
    }
}
