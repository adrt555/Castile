"use server";

import { crmProducts } from "@/lib/crmProducts";
import laufenProducts from "@/lib/laufenProducts.json";

export async function getProducts() {
    // Combine ROCA tiles (default 'sqft') and Laufen products (default 'PC')
    const roca = crmProducts.map(p => ({
        ...p,
        unit: 'sqft' as const
    }));
    const laufen = (laufenProducts as any[]).map(p => ({
        ...p,
        unit: 'PC' as const
    }));
    return [...roca, ...laufen];
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

