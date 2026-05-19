import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { sku: string } }
) {
    try {
        const sku = params.sku;
        
        const image = await prisma.productImage.findUnique({
            where: { sku }
        });

        if (!image) {
            return new NextResponse("Image not found", { status: 404 });
        }

        const buffer = Buffer.from(image.base64, 'base64');

        return new NextResponse(buffer, {
            headers: {
                "Content-Type": image.mimeType,
                "Cache-Control": "public, max-age=31536000, immutable"
            }
        });
    } catch (error) {
        console.error("Error serving image:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
