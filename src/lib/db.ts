import { Client, Order, CRMProduct, FinanceSummary } from './types';
import { crmProducts } from './crmProducts';

// Mock DB Storage
let _clients: Client[] = [
    {
        id: "cl_1001",
        name: "Sarah Jenkins",
        company: "Jenkins Interior Design",
        email: "sarah@jenkinsdesign.com",
        phone: "305-555-0192",
        type: "Designer",
        totalSpent: 12450.00,
        createdAt: "2026-01-15T08:00:00Z",
        address: "4500 Biscayne Blvd, Miami FL 33137",
        billingAddress: "4500 Biscayne Blvd, Miami FL 33137"
    },
    {
        id: "cl_1002",
        name: "Marcus Rodriguez",
        company: "Apex Contractor Group",
        email: "m.rodriguez@apexbuild.com",
        phone: "786-555-8831",
        type: "Contractor",
        totalSpent: 45000.00,
        createdAt: "2025-11-20T09:30:00Z",
        address: "1200 Brickell Ave, Miami FL 33131",
        billingAddress: "PO Box 9800, Miami FL 33101"
    }
];

let _orders: Order[] = [
    {
        id: "ord_5099",
        clientId: "cl_1001",
        status: "Quote",
        items: [
            {
                id: "item_1",
                productId: "calacata-gold", // linking roughly to slug
                productName: "Calacata Gold",
                colorName: "Arena",
                size: "24x48",
                quantitySqft: 500,
                unitPrice: 5.50,
                totalPrice: 2750.00
            }
        ],
        subtotal: 2750.00,
        discount: 250.00,
        tax: 175.00, // 7% tax on (2750 - 250)
        total: 2675.00,
        createdAt: "2026-03-01T14:20:00Z",
        updatedAt: "2026-03-01T14:20:00Z",
        shippingAddress: "4500 Biscayne Blvd, Miami FL 33137",
        billingAddress: "4500 Biscayne Blvd, Miami FL 33137"
    },
    {
        id: "ord_5100",
        clientId: "cl_1002",
        status: "Delivered",
        items: [
            {
                id: "item_2",
                productId: "abaco",
                productName: "Abaco",
                colorName: "Grafito",
                size: "12x24",
                quantitySqft: 2000,
                unitPrice: 3.20,
                totalPrice: 6400.00
            }
        ],
        subtotal: 6400.00,
        tax: 448.00,
        total: 6848.00,
        createdAt: "2026-02-10T10:00:00Z",
        updatedAt: "2026-02-15T15:30:00Z",
        shippingAddress: "1200 Brickell Ave, Miami FL 33131",
        billingAddress: "PO Box 9800, Miami FL 33101"
    }
];

// Real CRM product catalog from ROCA 2026 Cost Price Book
let _products: CRMProduct[] = crmProducts.map(p => ({
    ...p,
    collectionId: p.collection.toLowerCase().replace(/\s+/g, '-'),
    colors: [],
    sizes: [p.size],
    description: p.name,
    // costPricePerSqft and sellingPricePerSqft come directly from crmProducts (price book)
    inStockSqft: 0,
}));


export const db = {
    // Clients
    getClients: () => [..._clients],
    getClientById: (id: string) => _clients.find(c => c.id === id),

    // Orders/Quotes
    getOrders: () => [..._orders],
    getOrderById: (id: string) => _orders.find(o => o.id === id),
    updateOrderStatus: (id: string, status: Order['status']) => {
        const order = _orders.find(o => o.id === id);
        if (order) {
            order.status = status;
            order.updatedAt = new Date().toISOString();
        }
    },
    createOrder: (orderInput: Omit<Order, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
        const newOrder: Order = {
            ...orderInput,
            id: `ord_${5100 + _orders.length + 1}`,
            status: 'Quote',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        _orders.push(newOrder);
        return newOrder;
    },
    updateOrder: (id: string, updates: Partial<Order>) => {
        const index = _orders.findIndex(o => o.id === id);
        if (index !== -1) {
            _orders[index] = { ..._orders[index], ...updates, updatedAt: new Date().toISOString() };
            return _orders[index];
        }
        return null;
    },

    // Products
    getProducts: () => [..._products],

    // Basic Finance Helper
    getFinanceSummary: (): FinanceSummary => {
        // Only count 'Paid' or 'Delivered' toward actual revenue/costs
        const closedOrders = _orders.filter(o => o.status === 'Paid' || o.status === 'Delivered' || o.status === 'Unfulfilled');
        const quotes = _orders.filter(o => o.status === 'Quote' || o.status === 'Invoice Sent');

        let totalRevenue = 0;
        let totalCosts = 0;
        let pendingInvoicesTotal = 0;

        closedOrders.forEach(order => {
            totalRevenue += order.subtotal; // Pre-tax revenue
            order.items.forEach(item => {
                // Look up cost in catalog
                const catItem = _products.find(p => p.name.includes(item.productName) || p.id === item.productId);
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
};
