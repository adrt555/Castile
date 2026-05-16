import { getPurchaseOrders } from "@/app/actions/purchaseOrderActions";
import PurchaseOrdersClient from "./PurchaseOrdersClient";

export const dynamic = 'force-dynamic';

export default async function PurchaseOrdersPage() {
    const pos = await getPurchaseOrders();
    
    // Convert dates to strings for client component if necessary
    const serializedPOs = pos.map(po => ({
        ...po,
        id: po.id,
        createdAt: po.createdAt.toISOString(),
        updatedAt: po.updatedAt.toISOString(),
        items: po.items.map(item => ({
            ...item,
            id: item.id
        }))
    }));

    return <PurchaseOrdersClient initialPOs={serializedPOs} />;
}
