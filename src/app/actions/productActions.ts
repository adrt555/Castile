"use server";

import { crmProducts } from "@/lib/crmProducts";

export async function getProducts() {
    // For now, products are static to match the public catalog
    return crmProducts;
}
