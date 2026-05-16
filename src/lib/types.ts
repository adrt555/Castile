// Shared Types for the Castile CRM & ERP system

export type OrderStatus = 'Quote' | 'Invoice Sent' | 'Paid' | 'Unfulfilled' | 'Delivered';

export interface Client {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    type: 'Architect' | 'Designer' | 'Contractor' | 'Homeowner';
    totalSpent: number;
    createdAt: string;
    address?: string;
    billingAddress?: string;
    commissionCredits: number;
}

export interface OrderItem {
    id: string;
    productId: string;
    productName: string;
    colorName: string;
    size: string;
    quantitySqft: number;
    unitPrice: number;
    totalPrice: number;
}

export interface Order {
    id: string;
    orderNumber?: number;
    clientId: string;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    discount?: number;
    freight?: number;
    tax: number;
    total: number;
    createdAt: string;
    updatedAt: string;
    shippingAddress?: string;
    billingAddress?: string;
}

export type POStatus = "Pending" | "Confirmed" | "In Production" | "Shipped" | "Received";

export interface PurchaseOrderItem {
    sku: string;
    description: string;
    boxes: number;
    sqftPerBox: number;
    quantitySqft: number;
    unitCost: number;
    totalLineCost: number;
}

export interface PurchaseOrder {
    id: string;
    poNumber: string;
    manufacturer: string;
    status: POStatus;
    createdAt: string;
    expectedDate: string;
    items: PurchaseOrderItem[];
    notes: string;
    subtotal: number;
    freight: number;
    tax: number;
    total: number;
}

// Extending our existing product type for the CRM/Accounting side
export interface CRMProduct {
    id: string;
    sku: string;              // e.g. "FWM7M57371"
    name: string;
    collection: string;       // e.g. "ABACO"
    category: string;
    collectionId: string;
    sizes: string[];
    colors: string[];
    size: string;             // e.g. "12X24 FIELD"
    image: string;
    description: string;
    // Pricing & inventory
    costPricePerSqft: number;
    sellingPricePerSqft: number;
    inStockSqft: number;
    sqftPerBox: number;       // SQFT per carton from price book
    boxesPerPallet: number;   // BXS per pallet from price book
}

export interface FinanceSummary {
    totalRevenue: number;
    totalCosts: number;
    totalCommissions: number;
    netProfit: number;
    pendingInvoicesTotal: number;
}
