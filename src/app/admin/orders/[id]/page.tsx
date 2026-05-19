"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getOrderById } from "@/app/actions/orderActions";
import QuotePrintTemplate from "../QuotePrintTemplate";

export default function OrderPrintPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [client, setClient] = useState<any>(null);
    const [isPresentationMode, setIsPresentationMode] = useState(false);

    const handlePrint = (presentationMode: boolean) => {
        setIsPresentationMode(presentationMode);
        
        setTimeout(() => {
            const printContent = document.getElementById("quote-print-template");
            if (!printContent) {
                // Fallback to normal print if template not found
                window.print();
                return;
            }

            const iframe = document.createElement("iframe");
            iframe.style.position = "absolute";
            iframe.style.width = "0px";
            iframe.style.height = "0px";
            iframe.style.border = "none";
            document.body.appendChild(iframe);

            const iframeDoc = iframe.contentWindow?.document;
            if (!iframeDoc) return;

            const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
                .map(s => s.outerHTML)
                .join('\n');

            iframeDoc.open();
            iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print Document</title>
                    ${styles}
                </head>
                <body style="background: white !important;">
                    ${printContent.outerHTML}
                </body>
                </html>
            `);
            iframeDoc.close();

            setTimeout(() => {
                iframe.contentWindow?.focus();
                iframe.contentWindow?.print();
                
                setTimeout(() => {
                    if (document.body.contains(iframe)) document.body.removeChild(iframe);
                }, 1000);
            }, 500);
        }, 100);
    };

    useEffect(() => {
        getOrderById(id).then(data => {
            if (data) {
                setOrder(data);
                setClient(data.client);
                // Automatically trigger the native print dialog popup as requested
                setTimeout(() => {
                    handlePrint(false);
                }, 500);
            }
        });
    }, [id]);

    if (!order || !client) {
        return (
            <div className="p-12 text-center">
                <h1 className="text-2xl font-bold text-zinc-900 mb-4">Quote Not Found</h1>
                <p className="text-zinc-500 mb-8">The quote or order you are looking for does not exist in the database.</p>
                <Link href="/admin/orders" className="text-amber-600 hover:text-amber-700 font-semibold underline">
                    Return to Sales Pipeline
                </Link>
            </div>
        );
    }

    // Adapt db items to the PrintItem interface
    const printItems = order.items.map((item: any) => ({
        productName: item.productName,
        colorName: item.colorName,
        size: item.size,
        quantitySqft: item.quantitySqft,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        // Since we removed explicit discount fields per item in the db for the mock, we can omit it or calculate it
    }));

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Control Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-500">
                        &larr;
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
                            {order.status === "Quote" ? "Quote" : "Order"} : {order.orderNumber?.toString().padStart(4, '0') || order.id.slice(0, 8)}
                        </h1>

                        <p className="text-sm font-semibold mt-1">
                            Status: <span className={`uppercase tracking-widest ${order.status === 'Quote' ? 'text-amber-600' : 'text-emerald-600'}`}>{order.status}</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Link href="/admin/orders" className="px-5 py-2.5 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 font-semibold rounded-lg transition-colors text-sm">
                        Back to Pipeline
                    </Link>
                    <button 
                        onClick={() => handlePrint(false)}
                        className="px-5 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 font-semibold rounded-lg transition-colors shadow-sm text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print PDF
                    </button>
                    <button 
                        onClick={() => handlePrint(true)}
                        className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-semibold rounded-lg transition-colors shadow-sm text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Print Presentation
                    </button>
                </div>
            </div>

            {/* Print View Preview Container */}
            <div className="bg-zinc-100 p-8 rounded-2xl border border-zinc-200 flex flex-col justify-center items-center h-[50vh]">
                <svg className="w-16 h-16 text-zinc-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                <p className="text-zinc-500 font-medium">The print dialog should pop up automatically.</p>
                <p className="text-zinc-400 text-sm mt-2">If it didn't, click "Print PDF" above.</p>
                
                {/* The Ghost Template: completely invisible until window.print() */}
                <QuotePrintTemplate 
                    orderId={order.orderNumber?.toString().padStart(4, '0') || order.id}

                    status={order.status}
                    createdAt={order.createdAt}
                    clientName={client.name}
                    clientCompany={client.company}
                    clientEmail={client.email}
                    clientPhone={client.phone}
                    shippingAddress={order.shippingAddress || client.address}
                    billingAddress={order.billingAddress || client.billingAddress || client.address}
                    items={printItems}
                    subtotal={order.subtotal}
                    discount={order.discount || 0}
                    freight={order.freight || 0}
                    tax={order.tax || 0}
                    total={order.total}
                    isPresentation={isPresentationMode}
                />
            </div>
        </div>
    );
}
