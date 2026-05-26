"use client";
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { PurchaseOrder, POStatus } from "@/lib/types";
import QuotePrintTemplate from "../orders/QuotePrintTemplate";
import { updatePurchaseOrder, deletePurchaseOrder, updatePurchaseOrderStatus } from "@/app/actions/purchaseOrderActions";
import { useRouter } from "next/navigation";

const STATUS_CONFIG: Record<POStatus, { bg: string; text: string; dot: string }> = {
    "Pending":       { bg: "bg-zinc-100",   text: "text-zinc-600",   dot: "bg-zinc-400"   },
    "Confirmed":     { bg: "bg-blue-50",    text: "text-blue-700",   dot: "bg-blue-500"   },
    "In Production": { bg: "bg-amber-50",   text: "text-amber-700",  dot: "bg-amber-500"  },
    "Shipped":       { bg: "bg-purple-50",  text: "text-purple-700", dot: "bg-purple-500" },
    "Received":      { bg: "bg-emerald-50", text: "text-emerald-700",dot: "bg-emerald-500"},
};

function StatusBadge({ status }: { status: POStatus }) {
    const c = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {status}
        </span>
    );
}

function poTotal(po: any) {
    return po.items.reduce((sum: number, item: any) => sum + item.boxes * item.sqftPerBox * item.unitCost, 0);
}

function poTotalSqft(po: any) {
    return po.items.reduce((sum: number, item: any) => sum + item.boxes * item.sqftPerBox, 0);
}

export default function PurchaseOrdersClient({ initialPOs }: { initialPOs: any[] }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<POStatus | "ALL">("ALL");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [printingPO, setPrintingPO] = useState<any | null>(null);

    const filtered = initialPOs.filter(po => {
        const q = search.trim().toLowerCase();
        const matchSearch = !q || po.poNumber.toLowerCase().includes(q) || po.manufacturer.toLowerCase().includes(q) || po.items.some((i: any) => i.sku.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
        const matchStatus = statusFilter === "ALL" || po.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalValue = initialPOs.reduce((s, po) => s + poTotal(po), 0);
    const inProd     = initialPOs.filter(p => p.status === "In Production").length;
    const shipped    = initialPOs.filter(p => p.status === "Shipped").length;

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this purchase order?")) return;
        await deletePurchaseOrder(id);
        router.refresh();
    };

    const handleQuickUpdate = async (poId: string, itemIdx: number, field: string, value: any) => {
        const po = initialPOs.find(p => p.id === poId);
        if (!po) return;

        const newItems = [...po.items];
        const item = { ...newItems[itemIdx] };

        if (field === 'boxes') {
            item.boxes = parseInt(value) || 0;
            item.quantitySqft = item.boxes * item.sqftPerBox;
        } else if (field === 'quantitySqft') {
            item.quantitySqft = parseFloat(value) || 0;
            item.boxes = item.sqftPerBox ? Math.ceil(item.quantitySqft / item.sqftPerBox) : 0;
        } else if (field === 'unitCost') {
            item.unitCost = parseFloat(value) || 0;
        }

        item.totalLineCost = item.quantitySqft * item.unitCost;
        newItems[itemIdx] = item;

        const subtotal = newItems.reduce((s, i) => s + i.totalLineCost, 0);
        
        startTransition(async () => {
            await updatePurchaseOrder(poId, {
                items: newItems,
                subtotal,
                total: subtotal + po.freight + po.tax
            });
            router.refresh();
        });
    };

    const handlePrintPO = (po: any) => {
        setPrintingPO(po);
        setTimeout(() => {
            const printContent = document.getElementById("quote-print-template");
            if (!printContent) {
                window.print();
                setPrintingPO(null);
                return;
            }

            const iframe = document.createElement("iframe");
            iframe.style.position = "absolute";
            iframe.style.width = "0px";
            iframe.style.height = "0px";
            iframe.style.border = "none";
            document.body.appendChild(iframe);

            const iframeDoc = iframe.contentWindow?.document;
            if (!iframeDoc) {
                setPrintingPO(null);
                return;
            }

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
                    setPrintingPO(null);
                }, 1000);
            }, 500);
        }, 150);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 print:max-w-full print:p-0 print:m-0 print:space-y-0">
            <div className="print:hidden space-y-6">
                {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Purchase Orders</h1>
                    <p className="text-zinc-500 mt-1 text-sm">Orders placed with manufacturers (Sync with Production)</p>
                </div>
                <Link href="/admin/purchase-orders/new" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm w-full sm:w-auto">
                    <span className="text-base">＋</span> New Purchase Order
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total POs", value: initialPOs.length.toString(),              color: "text-zinc-900" },
                    { label: "In Production", value: inProd.toString(),               color: "text-amber-600" },
                    { label: "Shipped",       value: shipped.toString(),              color: "text-purple-600" },
                    { label: "Total Value",   value: `$${totalValue.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, color: "text-emerald-600" },
                ].map(card => (
                    <div key={card.label} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{card.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm">
                <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
                    <div className="relative flex-1 min-w-0 w-full sm:min-w-[220px] sm:max-w-sm">
                        <input
                            type="text"
                            placeholder="Search PO #, manufacturer, SKU…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-4 pr-8 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900"
                        />
                        {search && (
                            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 font-bold text-sm">✕</button>
                        )}
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as any)}
                        className="px-3 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 bg-white"
                    >
                        <option value="ALL">All Statuses</option>
                        {(Object.keys(STATUS_CONFIG) as POStatus[]).map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    <span className="text-sm text-zinc-400 font-medium sm:ml-auto">{filtered.length} of {initialPOs.length} POs</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-zinc-600">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-5 py-3 font-semibold">PO #</th>
                                <th className="px-5 py-3 font-semibold">Manufacturer</th>
                                <th className="px-5 py-3 font-semibold">Status</th>
                                <th className="px-5 py-3 font-semibold whitespace-nowrap">Created</th>
                                <th className="px-5 py-3 font-semibold whitespace-nowrap">Expected</th>
                                <th className="px-5 py-3 font-semibold whitespace-nowrap text-right">Sqft</th>
                                <th className="px-5 py-3 font-semibold whitespace-nowrap text-right">Value</th>
                                <th className="px-5 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-16 text-center text-zinc-400">
                                        <div className="text-4xl mb-3">🏭</div>
                                        <p className="font-semibold text-zinc-500">No purchase orders found</p>
                                        <p className="text-xs mt-1">Create your first PO using the button above.</p>
                                    </td>
                                </tr>
                            ) : filtered.map(po => {
                                const total = poTotal(po);
                                const sqft  = poTotalSqft(po);
                                const isOpen = expandedId === po.id;
                                return (
                                    <React.Fragment key={po.id}>
                                        <tr 
                                            className={`hover:bg-zinc-50/70 transition-colors cursor-pointer ${isOpen ? 'bg-zinc-50' : ''}`} 
                                            onClick={() => router.push(`/admin/purchase-orders/edit/${po.id}`)}
                                        >
                                            <td className="px-5 py-3 font-mono font-bold text-zinc-800 whitespace-nowrap">{po.poNumber}</td>
                                            <td className="px-5 py-3 font-medium text-zinc-800">{po.manufacturer}</td>
                                            <td className="px-5 py-3"><StatusBadge status={po.status} /></td>
                                            <td className="px-5 py-3 whitespace-nowrap text-xs">{new Date(po.createdAt).toLocaleDateString()}</td>
                                            <td className="px-5 py-3 whitespace-nowrap text-xs">{po.expectedDate || "TBD"}</td>
                                            <td className="px-5 py-3 font-semibold text-zinc-700 whitespace-nowrap text-right">{sqft.toLocaleString(undefined,{maximumFractionDigits:1})} sf</td>
                                            <td className="px-5 py-3 font-bold text-zinc-900 whitespace-nowrap text-right">${total.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => handlePrintPO(po)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                                    >
                                                        🖨️ Print
                                                    </button>
                                                    <Link
                                                        href={`/admin/purchase-orders/edit/${po.id}`}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                                    >
                                                        ✎ Modify
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(po.id)}
                                                        className="p-1.5 text-zinc-300 hover:text-red-600 transition-colors"
                                                        title="Delete PO"
                                                    >
                                                        🗑️
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setExpandedId(isOpen ? null : po.id);
                                                        }}
                                                        className={`p-1.5 rounded-lg transition-colors ${isOpen ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'}`}
                                                        title={isOpen ? "Collapse" : "Expand Details"}
                                                    >
                                                        {isOpen ? "▲" : "▼"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isOpen && (
                                            <tr>
                                                <td colSpan={8} className="bg-zinc-50 px-3 sm:px-5 py-4 border-b border-zinc-200 shadow-inner">
                                                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                                                        <div className="flex justify-between items-start">
                                                            {po.notes ? (
                                                                <p className="text-sm text-zinc-500 bg-white px-3 py-2 rounded-lg border border-zinc-100 italic flex-1 max-w-2xl">📝 {po.notes}</p>
                                                            ) : (
                                                                <div className="flex-1" />
                                                            )}
                                                            <div className="flex gap-2">
                                                                <select 
                                                                    value={po.status}
                                                                    onChange={async (e) => {
                                                                        await updatePurchaseOrderStatus(po.id, e.target.value);
                                                                        router.refresh();
                                                                    }}
                                                                    className="text-xs font-bold bg-white border border-zinc-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-amber-500"
                                                                >
                                                                    <option value="Pending">Pending</option>
                                                                    <option value="Confirmed">Confirmed</option>
                                                                    <option value="In Production">In Production</option>
                                                                    <option value="Shipped">Shipped</option>
                                                                    <option value="Received">Received</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
                                                            <table className="w-full text-xs text-left">
                                                                <thead className="bg-zinc-50 text-zinc-400 uppercase tracking-wide border-b border-zinc-100">
                                                                    <tr>
                                                                        <th className="px-4 py-2.5 font-semibold">SKU</th>
                                                                        <th className="px-4 py-2.5 font-semibold">Description</th>
                                                                        <th className="px-4 py-2.5 font-semibold text-right">Boxes</th>
                                                                        <th className="px-4 py-2.5 font-semibold text-right">Sqft/Box</th>
                                                                        <th className="px-4 py-2.5 font-semibold text-right">Total Sqft</th>
                                                                        <th className="px-4 py-2.5 font-semibold text-right">Unit Cost</th>
                                                                        <th className="px-4 py-2.5 font-semibold text-right">Line Total</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-zinc-50">
                                                                    {po.items.map((item: any, idx: number) => (
                                                                        <tr key={idx} className="hover:bg-zinc-50/50">
                                                                            <td className="px-4 py-3 font-mono font-bold text-zinc-700">{item.sku}</td>
                                                                            <td className="px-4 py-3 text-zinc-600">{item.description}</td>
                                                                            <td className="px-4 py-3 text-right">
                                                                                <input
                                                                                    type="number"
                                                                                    defaultValue={item.boxes}
                                                                                    onBlur={(e) => handleQuickUpdate(po.id, idx, 'boxes', e.target.value)}
                                                                                    className="w-16 text-right border-b border-transparent hover:border-blue-200 focus:border-blue-500 outline-none font-bold text-blue-700 transition-colors"
                                                                                />
                                                                            </td>
                                                                            <td className="px-4 py-3 text-right text-zinc-400">{item.sqftPerBox} sf</td>
                                                                            <td className="px-4 py-3 text-right">
                                                                                <input
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    defaultValue={item.quantitySqft || (item.boxes * item.sqftPerBox)}
                                                                                    onBlur={(e) => handleQuickUpdate(po.id, idx, 'quantitySqft', e.target.value)}
                                                                                    className="w-20 text-right border-b border-transparent hover:border-zinc-200 focus:border-amber-500 outline-none font-semibold text-zinc-800 transition-colors"
                                                                                />
                                                                            </td>
                                                                            <td className="px-4 py-3 text-right">
                                                                                <div className="flex items-center justify-end gap-1">
                                                                                    <span className="text-zinc-300">$</span>
                                                                                    <input
                                                                                        type="number"
                                                                                        step="0.01"
                                                                                        defaultValue={item.unitCost}
                                                                                        onBlur={(e) => handleQuickUpdate(po.id, idx, 'unitCost', e.target.value)}
                                                                                        className="w-16 text-right border-b border-transparent hover:border-red-200 focus:border-red-500 outline-none font-medium text-red-600 transition-colors"
                                                                                    />
                                                                                </div>
                                                                            </td>
                                                                            <td className="px-4 py-3 text-right font-bold text-zinc-900">${(item.totalLineCost).toFixed(2)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>

                                                        <div className="flex justify-end items-center gap-4 pt-2">
                                                            {isPending && <span className="text-[10px] text-amber-600 font-bold animate-pulse">Updating...</span>}
                                                            <button
                                                                onClick={() => handlePrintPO(po)}
                                                                className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 flex items-center gap-2 shadow-sm transition-all active:scale-95"
                                                            >
                                                                🖨️ Print Purchase Order
                                                            </button>
                                                            <Link href={`/admin/purchase-orders/edit/${po.id}`} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg hover:bg-zinc-50 flex items-center gap-2 shadow-sm">
                                                                ✎ Full Editor
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
            </div>

            {/* Print Template Overlay */}
            {printingPO && (
                <div className="fixed inset-0 z-[100] bg-white print:static print:z-auto print:p-0 print:m-0">
                     <QuotePrintTemplate
                        orderId={printingPO.poNumber}
                        status={printingPO.status}
                        createdAt={printingPO.createdAt}
                        clientName={printingPO.manufacturer}
                        items={printingPO.items.map((i: any) => ({
                            productName: i.description,
                            quantitySqft: i.quantitySqft || (i.boxes * i.sqftPerBox),
                            unitPrice: i.unitCost,
                            totalPrice: i.totalLineCost
                        }))}
                        subtotal={printingPO.subtotal}
                        discount={0}
                        freight={printingPO.freight}
                        tax={printingPO.tax}
                        total={printingPO.total}
                        documentType="PURCHASE ORDER"
                    />
                </div>
            )}
        </div>
    );
}
