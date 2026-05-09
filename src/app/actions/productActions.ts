"use server";

import { crmProducts } from "@/lib/crmProducts";

export async function getProducts() {
    // For now, products are static to match the public catalog
    return crmProducts;
}

export async function checkRocaStock(sku: string) {
    if (!sku) return null;
    try {
        const response = await fetch(`https://rocatileusa.com/roca-stock?search=${encodeURIComponent(sku)}&format=json`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });
        
        if (!response.ok) return null;
        
        const data = await response.json();
        if (!Array.isArray(data)) return null;

        // Filter for Miami warehouse and match SKU (sometimes the search returns partial matches)
        const miamiItem = data.find((item: any) => 
            item.warehouse === "MIAMI" && 
            (item.sku === sku || item.sku.includes(sku))
        );

        return miamiItem ? parseFloat(miamiItem.sqft_available) : 0;
    } catch (error) {
        console.error('Error fetching Roca stock:', error);
        return null;
    }
}

