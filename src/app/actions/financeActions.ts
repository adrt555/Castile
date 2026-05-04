"use server";

import prisma from "@/lib/prisma";
import { crmProducts } from "@/lib/crmProducts";

export async function getFinanceSummary() {
    let orders: any[] = [];
    try {
        orders = await prisma.order.findMany({
            include: { items: true }
        });
    } catch (e) {
        console.error("DB Error in getFinanceSummary:", e);
    }

    const closedOrders = orders.filter(o => o.status === 'Paid' || o.status === 'Delivered' || o.status === 'Unfulfilled');
    const quotes = orders.filter(o => o.status === 'Quote' || o.status === 'Invoice Sent');

    let totalRevenue = 0;
    let totalCosts = 0;
    let pendingInvoicesTotal = 0;

    closedOrders.forEach((order: any) => {
        totalRevenue += order.subtotal || 0;
        if (order.items) {
            order.items.forEach((item: any) => {
                const catItem = crmProducts.find(p => p.name.includes(item.productName) || p.id === item.productId);
                const costBasis = catItem ? catItem.costPricePerSqft : 2.00;
                totalCosts += (costBasis * (item.quantitySqft || 0));
            });
        }
    });

    quotes.forEach((quote: any) => {
        if (quote.status === 'Invoice Sent') {
            pendingInvoicesTotal += quote.total || 0;
        }
    });

    return {
        totalRevenue,
        totalCosts,
        netProfit: totalRevenue - totalCosts,
        pendingInvoicesTotal
    };
}
