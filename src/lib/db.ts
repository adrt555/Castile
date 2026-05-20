import { Client, Order, CRMProduct, FinanceSummary, PurchaseOrder } from './types';
import { crmProducts } from './crmProducts';
import laufenProducts from './laufenProducts.json';

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
        billingAddress: "4500 Biscayne Blvd, Miami FL 33137",
        commissionCredits: 0
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
        billingAddress: "PO Box 9800, Miami FL 33101",
        commissionCredits: 0
    },
    {
        id: "cl_1003",
        name: "Jonnifer Obregon",
        company: "",
        email: "jonyobregon82@hotmail.com",
        phone: "",
        type: "Homeowner",
        totalSpent: 0,
        createdAt: "2026-04-16T12:00:00Z",
        address: "",
        billingAddress: "",
        commissionCredits: 0
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
                totalPrice: 2750.00,
                unit: "sqft"
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
                totalPrice: 6400.00,
                unit: "sqft"
            }
        ],
        subtotal: 6400.00,
        tax: 448.00,
        total: 6848.00,
        createdAt: "2026-02-10T10:00:00Z",
        updatedAt: "2026-02-15T15:30:00Z",
        shippingAddress: "1200 Brickell Ave, Miami FL 33131",
        billingAddress: "PO Box 9800, Miami FL 33101"
    },
    {
        id: "ord_5103",
        clientId: "cl_1003",
        status: "Quote",
        items: [
            {
                id: "item_3",
                productId: "liverpool-blanco",
                productName: "LIVERPOOL BLANCO PO 24X24 R",
                colorName: "",
                size: "24X24 FIELD",
                quantitySqft: 971.65,
                unitPrice: 1.69,
                totalPrice: 1642.088,
                unit: "sqft"
            }
        ],
        subtotal: 1642.088,
        discount: 0,
        tax: 114.946,
        freight: 150.00,
        total: 1907.035,
        createdAt: "2026-04-16T10:00:00Z",
        updatedAt: "2026-04-16T10:00:00Z",
        shippingAddress: "",
        billingAddress: ""
    }
];

let _purchaseOrders: PurchaseOrder[] = [
    {
        id: "po_001",
        poNumber: "PO-2026-001",
        manufacturer: "ROCA USA",
        status: "In Production",
        createdAt: "2026-04-01",
        expectedDate: "2026-05-15",
        notes: "Priority order for Avalon collection",
        items: [
            { sku: "FWM7M57371", description: "ABACO ARENA 12\"x24\" R", boxes: 48, sqftPerBox: 19.375, quantitySqft: 48 * 19.375, unitCost: 2.65, totalLineCost: 48 * 19.375 * 2.65 },
            { sku: "FWM7N54371", description: "ABACO ARENA IN&OUT 24\"x48\" R", boxes: 24, sqftPerBox: 23.25, quantitySqft: 24 * 23.25, unitCost: 3.35, totalLineCost: 24 * 23.25 * 3.35 },
        ],
        subtotal: (48 * 19.375 * 2.65) + (24 * 23.25 * 3.35),
        freight: 120.00,
        tax: 0,
        total: (48 * 19.375 * 2.65) + (24 * 23.25 * 3.35) + 120.00
    },
    {
        id: "po_002",
        poNumber: "PO-2026-002",
        manufacturer: "ROCA USA",
        status: "Shipped",
        createdAt: "2026-03-20",
        expectedDate: "2026-04-20",
        notes: "Avalon Espresso restock",
        items: [
            { sku: "FWM6A57101", description: "ABACO GRAFITO 12\"x24\" R", boxes: 60, sqftPerBox: 17.44, quantitySqft: 60 * 17.44, unitCost: 2.65, totalLineCost: 60 * 17.44 * 2.65 },
        ],
        subtotal: 60 * 17.44 * 2.65,
        freight: 150.00,
        tax: 0,
        total: (60 * 17.44 * 2.65) + 150.00
    }
];

// Real CRM product catalog from ROCA 2026 Cost Price Book & Laufen Catalogs
let _products: CRMProduct[] = [
    ...crmProducts.map(p => ({
        ...p,
        collectionId: p.collection.toLowerCase().replace(/\s+/g, '-'),
        colors: [],
        sizes: [p.size],
        description: p.name,
        // costPricePerSqft and sellingPricePerSqft come directly from crmProducts (price book)
        inStockSqft: 0,
        unit: 'sqft' as const,
    })),
    ...(laufenProducts as any[]).map(p => ({
        ...p,
        collectionId: p.collection.toLowerCase().replace(/\s+/g, '-'),
        colors: p.colors || [],
        sizes: [p.size],
        description: p.description || p.name,
        inStockSqft: 0,
        unit: 'PC' as const,
    }))
];


export const db = {
    // Clients
    getClients: () => [..._clients],
    getClientById: (id: string) => _clients.find(c => c.id === id),
    createClient: (input: Omit<Client, 'id' | 'totalSpent' | 'createdAt'>): Client => {
        const newClient: Client = {
            ...input,
            id: `cl_${Date.now()}`,
            totalSpent: 0,
            createdAt: new Date().toISOString(),
        };
        _clients.push(newClient);
        return newClient;
    },
    updateClient: (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt' | 'totalSpent'>>): Client | null => {
        const idx = _clients.findIndex(c => c.id === id);
        if (idx === -1) return null;
        _clients[idx] = { ..._clients[idx], ...updates };
        return _clients[idx];
    },

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
            pendingInvoicesTotal,
            totalCommissions: 0
        };
    },

    // Purchase Orders
    getPurchaseOrders: () => [..._purchaseOrders],
    getPurchaseOrderById: (id: string) => _purchaseOrders.find(po => po.id === id),
    createPurchaseOrder: (input: Omit<PurchaseOrder, 'id' | 'poNumber' | 'createdAt'>): PurchaseOrder => {
        const id = "po_" + (Date.now() % 1000000).toString();
        const num = _purchaseOrders.length + 1;
        const po: PurchaseOrder = {
            id,
            poNumber: `PO-2026-${num.toString().padStart(3, '0')}`,
            createdAt: new Date().toISOString().split('T')[0],
            ...input
        };
        _purchaseOrders = [po, ..._purchaseOrders];
        return po;
    },
    updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => {
        const index = _purchaseOrders.findIndex(p => p.id === id);
        if (index !== -1) {
            _purchaseOrders[index] = { ..._purchaseOrders[index], ...updates };
            return _purchaseOrders[index];
        }
        return null;
    }
};
