"use client";
import { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { PurchaseOrder, POStatus } from "@/lib/types";
import QuotePrintTemplate from "../orders/QuotePrintTemplate";

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

function poTotal(po: PurchaseOrder) {
    return po.items.reduce((sum, item) => sum + item.boxes * item.sqftPerBox * item.unitCost, 0);
}

function poTotalSqft(po: PurchaseOrder) {
    return po.items.reduce((sum, item) => sum + item.boxes * item.sqftPerBox, 0);
}

export default function PurchaseOrdersPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<POStatus | "ALL">("ALL");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [printingPO, setPrintingPO] = useState<PurchaseOrder | null>(null);
    const [refresh, setRefresh] = useState(0); // Trigger re-render on save


    const pos = db.getPurchaseOrders();

    const filtered = pos.filter(po => {
        const q = search.trim().toLowerCase();
        const matchSearch = !q || po.poNumber.toLowerCase().includes(q) || po.manufacturer.toLowerCase().includes(q) || po.items.some(i => i.sku.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
        const matchStatus = statusFilter === "ALL" || po.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalValue = pos.reduce((s, po) => s + poTotal(po), 0);
    const totalSqft  = pos.reduce((s, po) => s + poTotalSqft(po), 0);
    const inProd     = pos.filter(p => p.status === "In Production").length;
    const shipped    = pos.filter(p => p.status === "Shipped").length;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Purchase Orders</h1>
                    <p className="text-zinc-500 mt-1 text-sm">Orders placed with manufacturers</p>
                </div>
                <Link href="/admin/purchase-orders/new" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm w-full sm:w-auto">
                    <span className="text-base">＋</span> New Purchase Order
                </Link>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total POs", value: pos.length.toString(),              color: "text-zinc-900" },
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
                    <span className="text-sm text-zinc-400 font-medium sm:ml-auto">{filtered.length} of {pos.length} POs</span>
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
                                <th className="px-5 py-3 font-semibold whitespace-nowrap">Sqft</th>
                                <th className="px-5 py-3 font-semibold whitespace-nowrap">Value</th>
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
                                    <>
                                        <tr key={po.id} className="hover:bg-zinc-50/70 transition-colors cursor-pointer" onClick={() => setExpandedId(isOpen ? null : po.id)}>
                                            <td className="px-5 py-3 font-mono font-bold text-zinc-800 whitespace-nowrap">{po.poNumber}</td>
                                            <td className="px-5 py-3 font-medium text-zinc-800">{po.manufacturer}</td>
                                            <td className="px-5 py-3"><StatusBadge status={po.status} /></td>
                                            <td className="px-5 py-3 whitespace-nowrap">{po.createdAt}</td>
                                            <td className="px-5 py-3 whitespace-nowrap">{po.expectedDate}</td>
                                            <td className="px-5 py-3 font-semibold text-zinc-700 whitespace-nowrap">{sqft.toLocaleString(undefined,{maximumFractionDigits:1})} sf</td>
                                            <td className="px-5 py-3 font-bold text-zinc-900 whitespace-nowrap">${total.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPrintingPO(po);
                                                            setTimeout(() => {
                                                                window.print();
                                                                setPrintingPO(null);
                                                            }, 100);
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                                        title="Print PO"
                                                    >
                                                        <span>🖨️</span> Print
                                                    </button>
                                                    <Link
                                                        href={`/admin/purchase-orders/edit/${po.id}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold rounded-lg transition-colors shadow-sm"
                                                        title="Modify PO"
                                                    >
                                                        <span>✎</span> Modify
                                                    </Link>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); setExpandedId(isOpen ? null : po.id); }}
                                                        className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors"
                                                    >
                                                        {isOpen ? "▲" : "▼"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isOpen && (
                                            <tr key={`${po.id}-detail`}>
                                                <td colSpan={8} className="bg-zinc-50 px-3 sm:px-5 py-4 border-b border-zinc-200">
                                                    <div className="space-y-3">
                                                        {po.notes && (
                                                            <p className="text-sm text-zinc-500 italic">📝 {po.notes}</p>
                                                        )}
                                                        <div className="overflow-x-auto">
                                                        <table className="w-full text-xs text-left">
                                                            <thead>
                                                                <tr className="text-zinc-400 uppercase tracking-wide border-b border-zinc-200">
                                                                    <th className="pb-2 font-semibold">SKU</th>
                                                                    <th className="pb-2 font-semibold">Description</th>
                                                                    <th className="pb-2 font-semibold text-right">Boxes</th>
                                                                    <th className="pb-2 font-semibold text-right">Sqft/Box</th>
                                                                    <th className="pb-2 font-semibold text-right">Total Sqft</th>
                                                                    <th className="pb-2 font-semibold text-right">Unit Cost</th>
                                                                    <th className="pb-2 font-semibold text-right">Line Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-zinc-100">
                                                                {po.items.map((item, idx) => (
                                                                    <tr key={idx} className="py-1">
                                                                        <td className="py-2 font-mono font-bold text-zinc-700">{item.sku}</td>
                                                                        <td className="py-2 text-zinc-700">{item.description}</td>
                                                                        <td className="py-2 text-right">
                                                                            <input
                                                                                type="number"
                                                                                value={item.boxes}
                                                                                onChange={(e) => {
                                                                                    const boxes = parseInt(e.target.value) || 0;
                                                                                    item.boxes = boxes;
                                                                                    item.quantitySqft = boxes * item.sqftPerBox;
                                                                                    item.totalLineCost = item.quantitySqft * item.unitCost;
                                                                                    const subtotal = po.items.reduce((s, i) => s + i.totalLineCost, 0);
                                                                                    db.updatePurchaseOrder(po.id, { items: [...po.items], subtotal, total: subtotal + po.freight + po.tax });
                                                                                    setRefresh(v => v + 1);
                                                                                }}
                                                                                className="w-16 text-right border-b border-blue-200 bg-transparent focus:border-blue-500 outline-none font-bold text-blue-700"
                                                                            />
                                                                        </td>
                                                                        <td className="py-2 text-right text-zinc-500">{item.sqftPerBox} sf</td>
                                                                        <td className="py-2 text-right">
                                                                            <input
                                                                                type="number"
                                                                                step="0.01"
                                                                                value={item.quantitySqft || (item.boxes * item.sqftPerBox)}
                                                                                onChange={(e) => {
                                                                                    const sqft = parseFloat(e.target.value) || 0;
                                                                                    item.quantitySqft = sqft;
                                                                                    // Recalculate boxes (round up if needed, or just leave as is)
                                                                                    item.boxes = item.sqftPerBox ? Math.ceil(sqft / item.sqftPerBox) : 0;
                                                                                    item.totalLineCost = sqft * item.unitCost;
                                                                                    const subtotal = po.items.reduce((s, i) => s + i.totalLineCost, 0);
                                                                                    db.updatePurchaseOrder(po.id, { items: [...po.items], subtotal, total: subtotal + po.freight + po.tax });
                                                                                    setRefresh(v => v + 1);
                                                                                }}
                                                                                className="w-20 text-right border-b border-zinc-200 bg-transparent focus:border-amber-500 outline-none font-semibold text-zinc-800"
                                                                            />
                                                                        </td>
                                                                        <td className="py-2 text-right">
                                                                             <div className="flex items-center justify-end gap-1">
                                                                                <span className="text-zinc-400">$</span>
                                                                                <input
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    value={item.unitCost}
                                                                                    onChange={(e) => {
                                                                                        const cost = parseFloat(e.target.value) || 0;
                                                                                        item.unitCost = cost;
                                                                                        item.totalLineCost = (item.quantitySqft || (item.boxes * item.sqftPerBox)) * cost;
                                                                                        const subtotal = po.items.reduce((s, i) => s + i.totalLineCost, 0);
                                                                                        db.updatePurchaseOrder(po.id, { items: [...po.items], subtotal, total: subtotal + po.freight + po.tax });
                                                                                        setRefresh(v => v + 1);
                                                                                    }}
                                                                                    className="w-16 text-right border-b border-red-200 bg-transparent focus:border-red-500 outline-none font-medium text-red-600"
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                        <td className="py-2 text-right font-bold text-zinc-900">${(item.totalLineCost).toFixed(2)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        </div>

                                                        <div className="flex justify-end pt-4 gap-3">
                                                            <button
                                                                onClick={() => {
                                                                    setPrintingPO(po);
                                                                    setTimeout(() => {
                                                                        window.print();
                                                                        setPrintingPO(null);
                                                                    }, 100);
                                                                }}
                                                                className="px-4 py-2 bg-zinc-900 text-white text-xs font-bold rounded-lg hover:bg-zinc-800 flex items-center gap-2 shadow-sm"
                                                            >
                                                                🖨️ Print PO
                                                            </button>
                                                            <Link href={`/admin/purchase-orders/edit/${po.id}`} className="px-4 py-2 bg-white border border-zinc-200 text-zinc-700 text-xs font-bold rounded-lg hover:bg-zinc-50 flex items-center gap-2 shadow-sm">
                                                                ✎ Modify Full PO
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Print Template */}
            {printingPO && (
                <QuotePrintTemplate
                    orderId={printingPO.id}
                    status={printingPO.status}
                    createdAt={printingPO.createdAt}
                    clientName={printingPO.manufacturer}
                    items={printingPO.items.map(i => ({
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
            )}
        </div>
    );
}
