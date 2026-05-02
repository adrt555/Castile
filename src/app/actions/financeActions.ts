"use server";

import prisma from "@/lib/prisma";
import { crmProducts } from "@/lib/crmProducts";

export async function getFinanceSummary() {
    const orders = await prisma.order.findMany({
        include: { items: true }
    });

    const closedOrders = orders.filter(o => o.status === 'Paid' || o.status === 'Delivered' || o.status === 'Unfulfilled');
    const quotes = orders.filter(o => o.status === 'Quote' || o.status === 'Invoice Sent');

    let totalRevenue = 0;
    let totalCosts = 0;
    let pendingInvoicesTotal = 0;

    closedOrders.forEach(order => {
        totalRevenue += order.subtotal;
        order.items.forEach(item => {
            const catItem = crmProducts.find(p => p.name.includes(item.productName) || p.id === item.productId);
            const costBasis = catItem ? catItem.costPricePerSqft : 2.00;
            totalCosts += (costBasis * item.quantitySqft);
        });
    });

    quotes.forEach(quote => {
        if (quote.status === 'Invoice Sent') {
            pendingInvoicesTotal += quote.total;
        }
    });

    return {
        totalRevenue,
        totalCosts,
        netProfit: totalRevenue - totalCosts,
        pendingInvoicesTotal
    };
}
