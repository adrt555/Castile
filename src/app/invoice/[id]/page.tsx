"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getOrderById } from "@/app/actions/orderActions";
import QuotePrintTemplate from "../../admin/orders/QuotePrintTemplate";

export default function PublicInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [order, setOrder] = useState<any>(null);
    const [client, setClient] = useState<any>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
            setIsSuccess(true);
        }

        getOrderById(id).then(data => {
            if (data) {
                setOrder(data);
                setClient(data.client);
            }
        });
    }, [id]);

    if (!order || !client) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-zinc-200 text-center">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <h1 className="text-xl font-bold text-zinc-900 mb-2">Invoice Not Found</h1>
                    <p className="text-zinc-500 mb-8">We couldn't find the invoice you're looking for. Please check the link and try again.</p>
                    <a href="mailto:Adrian@castileusa.com" className="text-amber-600 hover:text-amber-700 font-semibold underline">
                        Contact Support
                    </a>
                </div>
            </div>
        );
    }

    const printItems = order.items.map((item: any) => ({
        productName: item.productName,
        colorName: item.colorName,
        size: item.size,
        quantitySqft: item.quantitySqft,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        discount: item.discount,
        discountType: item.discountType
    }));

    const handlePrint = () => {
        const printContent = document.getElementById("quote-print-template");
        if (!printContent) {
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
            <html>
                <head>
                    ${styles}
                    <style>
                        @media print {
                            body { margin: 0; padding: 0; }
                            #quote-print-template { display: block !important; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.outerHTML}
                </body>
            </html>
        `);
        iframeDoc.close();

        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
            }, 1000);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-zinc-50 pb-20 print:bg-white print:pb-0">
            {/* Success Header */}
            {isSuccess && (
                <div className="bg-emerald-600 text-white py-4 px-6 text-center animate-in fade-in slide-in-from-top duration-700 print:hidden">
                    <div className="max-w-5xl mx-auto flex items-center justify-center gap-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <p className="font-bold tracking-wide">PAYMENT SUCCESSFUL! YOUR ORDER IS NOW BEING PROCESSED.</p>
                    </div>
                </div>
            )}

            <div className="max-w-5xl mx-auto px-6 pt-12 print:px-0 print:pt-0 print:max-w-full">
                {/* Action Bar */}
                <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm print:hidden">
                    <div>
                        <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">
                            {isSuccess ? "Receipt" : "Invoice"} Details
                        </h2>
                        <h1 className="text-3xl font-black text-zinc-900">
                            #{order.orderNumber?.toString().padStart(4, '0') || order.id.slice(0, 8)}
                        </h1>
                    </div>

                    <div className="flex gap-4 w-full sm:w-auto">
                        <button 
                            onClick={handlePrint}
                            className="flex-1 sm:flex-none px-8 py-4 bg-zinc-900 text-white hover:bg-zinc-800 font-black rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                            DOWNLOAD PDF
                        </button>
                    </div>
                </div>

                {/* Invoice Preview */}
                <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden relative min-h-[800px] flex flex-col items-center justify-center p-12 print:p-0 print:border-none print:shadow-none print:rounded-none print:min-h-0">
                    <div className="text-center mb-8 print:hidden">
                        <svg className="w-12 h-12 text-zinc-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        <p className="text-zinc-400 font-medium">PREVIEWING YOUR {isSuccess ? 'RECEIPT' : 'INVOICE'}</p>
                        <p className="text-zinc-300 text-xs mt-1 italic">Click Download PDF to save or print a copy</p>
                    </div>

                    {/* The Template - Hidden on screen via QuotePrintTemplate styles, but visible during print */}
                    <QuotePrintTemplate 
                        orderId={order.orderNumber?.toString().padStart(4, '0') || order.id}
                        status={isSuccess ? 'Paid' : order.status}
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
                        documentType={isSuccess ? 'INVOICE' : 'QUOTE'}
                    />
                </div>
            </div>
        </div>
    );
}
