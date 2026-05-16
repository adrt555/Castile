import { getPurchaseOrderById } from "@/app/actions/purchaseOrderActions";
import EditPurchaseOrderClient from "./EditPurchaseOrderClient";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function EditPurchaseOrderPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const po = await getPurchaseOrderById(id);

    if (!po) {
        notFound();
    }

    // Serialize data for client
    const serializedPO = {
        ...po,
        createdAt: po.createdAt.toISOString(),
        updatedAt: po.updatedAt.toISOString(),
        items: po.items.map(item => ({
            ...item
        }))
    };

    return <EditPurchaseOrderClient po={serializedPO} />;
}
