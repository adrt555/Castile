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
    const [templateType, setTemplateType] = useState<'order' | 'project'>('order');
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [printTrigger, setPrintTrigger] = useState(0);

    const handlePrint = (chosenTemplate: 'order' | 'project', presentationMode: boolean) => {
        setTemplateType(chosenTemplate);
        setIsPresentationMode(presentationMode);
        // Increment the trigger to fire the useEffect *after* state and DOM update
        setPrintTrigger(prev => prev + 1);
    };

    useEffect(() => {
        if (printTrigger === 0) return;

        const timer = setTimeout(() => {
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
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print Document</title>
                    ${styles}
                    <style>
                        /* Force visible inside iframe since we wrap it in a hidden container on screen */
                        #quote-print-template { display: block !important; }
                    </style>
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
                    if (document.body.contains(iframe)) {
                        document.body.removeChild(iframe);
                    }
                }, 1000);
            }, 250);
        }, 150); // 150ms delay guarantees React has completely rendered the DOM with the new templateType prop

        return () => clearTimeout(timer);
    }, [printTrigger]);

    useEffect(() => {
        getOrderById(id).then(data => {
            if (data) {
                setOrder(data);
                setClient(data.client);
                setIsModalOpen(true);
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
    const printItems = order.items.map((item: any) => {
        const safeSku = item.productSku?.replace(/[^a-zA-Z0-9_-]/g, "") || "";
        return {
            productName: item.productName,
            colorName: item.colorName,
            size: item.size,
            quantitySqft: item.quantitySqft,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            room: item.room || 'General',
            unit: item.unit || 'sqft',
            imageUrl: item.imageUrl || (safeSku ? `/api/product-image/${safeSku}` : undefined),
        };
    });

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4 pt-6">
            {/* Control Header */}
            <div className="mb-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2.5 rounded-full hover:bg-zinc-100 transition-colors text-zinc-500 border border-zinc-150">
                        &larr;
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                            <span>Quote Reference:</span>
                            <span className="bg-zinc-100 text-zinc-800 text-base font-extrabold px-3 py-1 rounded-lg font-mono">
                                #{order.orderNumber?.toString().padStart(4, '0') || order.id.slice(0, 8)}
                            </span>
                        </h1>

                        <p className="text-sm font-semibold mt-1.5 text-zinc-500">
                            Status: <span className={`uppercase tracking-widest text-xs font-black ${order.status === 'Quote' ? 'text-amber-600' : 'text-emerald-600'}`}>{order.status}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-5 py-2.5 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 font-bold rounded-xl transition-all shadow-sm text-sm border border-zinc-200 flex items-center gap-2"
                    >
                        Change Template
                    </button>
                    
                    <button 
                        onClick={() => handlePrint('order', false)}
                        className="px-5 py-2.5 bg-amber-600 text-white hover:bg-amber-700 font-bold rounded-xl transition-all shadow-sm text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print Billing Style (QR)
                    </button>

                    <button 
                        onClick={() => handlePrint('project', false)}
                        className="px-5 py-2.5 bg-zinc-900 text-white hover:bg-zinc-800 font-bold rounded-xl transition-all shadow-sm text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        Print Visual Style (Spec)
                    </button>

                    <button 
                        onClick={() => handlePrint('project', true)}
                        className="px-5 py-2.5 bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-bold rounded-xl transition-all shadow-sm text-sm flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Print Presentation (No Prices)
                    </button>
                </div>
            </div>

            {/* Print View Preview Container */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-12 flex flex-col justify-center items-center h-[55vh] shadow-inner text-center">
                <div className="w-20 h-20 bg-zinc-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-zinc-200/50">
                    <svg className="w-10 h-10 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Quote Printing Dashboard</h3>
                <p className="text-zinc-500 font-medium max-w-md">
                    Choose one of the premium templates above to generate the PDF printout, or use the template switcher modal.
                </p>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="mt-6 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-md"
                >
                    Open Template Chooser Modal
                </button>
                
                {/* The Ghost Template: hidden off-screen from viewport to ensure browser computes images & SVGs perfectly */}
                <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px', visibility: 'hidden' }}>
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
                        total={order.totalAmount}
                        isPresentation={isPresentationMode}
                        templateType={templateType}
                    />
                </div>
            </div>

            {/* Template Selection Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-zinc-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-zinc-900 text-white p-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                </div>
                                <div className="text-left">
                                    <h2 className="text-xl font-black tracking-tight">Select Quote Print Template</h2>
                                    <p className="text-xs text-zinc-400 mt-0.5">Select a layout format for Quote #{order.orderNumber?.toString().padStart(4, '0') || order.id.slice(0, 8)}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Selection Grid */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Option 1: Order Template */}
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    handlePrint('order', isPresentationMode);
                                }}
                                className="flex flex-col text-left border-2 border-zinc-200 hover:border-amber-600 focus:border-amber-600 rounded-2xl p-6 transition-all hover:shadow-lg focus:outline-none group bg-zinc-50 hover:bg-white"
                            >
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 group-hover:bg-amber-50 flex items-center justify-center mb-4 transition-colors">
                                    <svg className="w-6 h-6 text-zinc-600 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                </div>
                                <span className="text-lg font-extrabold text-zinc-900 mb-2 group-hover:text-amber-600 transition-colors">Order Quote Template</span>
                                <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                                    Standard billing invoice/quote featuring Castile line art logo, online Stripe QR payment code card, subtotal calculations, and formal terms & conditions.
                                </p>
                                <span className="text-xs font-black text-amber-600 mt-auto flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                                    Use Billing Layout &rarr;
                                </span>
                            </button>

                            {/* Option 2: Project Template */}
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    handlePrint('project', isPresentationMode);
                                }}
                                className="flex flex-col text-left border-2 border-zinc-200 hover:border-amber-600 focus:border-amber-600 rounded-2xl p-6 transition-all hover:shadow-lg focus:outline-none group bg-zinc-50 hover:bg-white"
                            >
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 group-hover:bg-amber-50 flex items-center justify-center mb-4 transition-colors">
                                    <svg className="w-6 h-6 text-zinc-600 group-hover:text-amber-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                                </div>
                                <span className="text-lg font-extrabold text-zinc-900 mb-2 group-hover:text-amber-600 transition-colors">Project / Specbook Template</span>
                                <p className="text-xs text-zinc-500 leading-relaxed mb-4">
                                    Visual presentation layout grouping items room-by-room, complete with product image thumbnails, architectural design codes, and the slate summary estimate card.
                                </p>
                                <span className="text-xs font-black text-amber-600 mt-auto flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                                    Use Visual Layout &rarr;
                                </span>
                            </button>
                        </div>

                        {/* Presentation Mode Toggle */}
                        <div className="border-t border-zinc-150 px-8 py-5 bg-zinc-50 flex items-center justify-between">
                            <div className="flex flex-col text-left">
                                <span className="text-sm font-bold text-zinc-900">Presentation Mode</span>
                                <span className="text-xs text-zinc-500 mt-0.5">Hides pricing, grand totals, and Stripe QR payment cards for client presentations.</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPresentationMode(!isPresentationMode)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isPresentationMode ? 'bg-amber-600' : 'bg-zinc-200'}`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isPresentationMode ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>
                        
                        {/* Footer */}
                        <div className="bg-zinc-100 border-t border-zinc-200 p-6 flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-250 font-bold text-zinc-700 text-sm transition-colors bg-white">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
