"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getPurchaseOrders } from "@/app/actions/purchaseOrderActions";
import { POStatus } from "@/lib/types";

const STATUS_CONFIG: Record<POStatus, { bg: string; text: string; dot: string }> = {
    "Pending":       { bg: "bg-zinc-100",   text: "text-zinc-600",   dot: "bg-zinc-400"   },
    "Confirmed":     { bg: "bg-blue-50",    text: "text-blue-700",   dot: "bg-blue-500"   },
    "In Production": { bg: "bg-amber-50",   text: "text-amber-700",  dot: "bg-amber-500"  },
    "Shipped":       { bg: "bg-purple-50",  text: "text-purple-700", dot: "bg-purple-500" },
    "Received":      { bg: "bg-emerald-50", text: "text-emerald-700",dot: "bg-emerald-500"},
};

function StatusBadge({ status }: { status: POStatus }) {
    const c = STATUS_CONFIG[status] || STATUS_CONFIG["Pending"];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
            {status}
        </span>
    );
}

function poTotalSqft(po: any) {
    return po.items.reduce((sum: number, item: any) => sum + (item.boxes * item.sqftPerBox), 0);
}

export default function PurchaseOrdersPage() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<POStatus | "ALL">("ALL");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [pos, setPos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getPurchaseOrders().then(data => { setPos(data); setIsLoading(false); });
    }, []);

    if (isLoading) return <div className="text-zinc-500 font-medium">Loading purchase orders...</div>;

    const filtered = pos.filter(po => {
        const q = search.trim().toLowerCase();
        const matchSearch = !q || po.poNumber.toLowerCase().includes(q) || po.manufacturer.toLowerCase().includes(q) || po.items.some((i: any) => i.sku.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
        const matchStatus = statusFilter === "ALL" || po.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const totalValue = pos.reduce((s: number, po: any) => s + (po.total || 0), 0);
    const inProd = pos.filter((p: any) => p.status === "In Production").length;
    const shipped = pos.filter((p: any) => p.status === "Shipped").length;

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Purchase Orders</h1>
                    <p className="text-zinc-500 mt-1 text-sm">Orders placed with manufacturers</p>
                </div>
                <Link href="/admin/purchase-orders/new" className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                    <span className="text-base">＋</span> New Purchase Order
                </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total POs", value: pos.length.toString(), color: "text-zinc-900" },
                    { label: "In Production", value: inProd.toString(), color: "text-amber-600" },
                    { label: "Shipped", value: shipped.toString(), color: "text-purple-600" },
                    { label: "Total Value", value: `$${totalValue.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`, color: "text-emerald-600" },
                ].map(card => (
                    <div key={card.label} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{card.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
                    </div>
                ))}
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm">
                <div className="p-4 border-b border-zinc-100 flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[220px] max-w-sm">
                        <input type="text" placeholder="Search PO #, manufacturer, SKU…" value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-4 pr-8 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900" />
                        {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 font-bold text-sm">✕</button>}
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="px-3 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 bg-white">
                        <option value="ALL">All Statuses</option>
                        {(Object.keys(STATUS_CONFIG) as POStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="text-sm text-zinc-400 font-medium ml-auto">{filtered.length} of {pos.length} POs</span>
                </div>
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
                                <th className="px-5 py-3 font-semibold"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} className="px-5 py-16 text-center text-zinc-400">
                                    <div className="text-4xl mb-3">🏭</div>
                                    <p className="font-semibold text-zinc-500">No purchase orders found</p>
                                    <p className="text-xs mt-1">Create your first PO using the button above.</p>
                                </td></tr>
                            ) : filtered.map((po: any) => {
                                const sqft = poTotalSqft(po);
                                const isOpen = expandedId === po.id;
                                return (
                                    <tr key={po.id} className="hover:bg-zinc-50/70 transition-colors cursor-pointer" onClick={() => setExpandedId(isOpen ? null : po.id)}>
                                        <td className="px-5 py-3 font-mono font-bold text-zinc-800 whitespace-nowrap">{po.poNumber}</td>
                                        <td className="px-5 py-3 font-medium text-zinc-800">{po.manufacturer}</td>
                                        <td className="px-5 py-3"><StatusBadge status={po.status as POStatus} /></td>
                                        <td className="px-5 py-3 whitespace-nowrap">{new Date(po.createdAt).toLocaleDateString()}</td>
                                        <td className="px-5 py-3 whitespace-nowrap">{po.expectedDate || 'TBD'}</td>
                                        <td className="px-5 py-3 font-semibold text-zinc-700 whitespace-nowrap">{sqft.toLocaleString(undefined,{maximumFractionDigits:1})} sf</td>
                                        <td className="px-5 py-3 font-bold text-zinc-900 whitespace-nowrap">${(po.total||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                                        <td className="px-5 py-3 text-zinc-400 text-xs font-bold">{isOpen ? "▲" : "▼"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
