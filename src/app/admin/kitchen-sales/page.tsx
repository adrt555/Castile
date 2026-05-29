"use client";
import { useState, useMemo } from "react";
import kitchenProducts from "@/lib/kitchenProducts";
import { KitchenProduct, KitchenQuote, KitchenQuoteStatus, KitchenQuoteItem } from "@/lib/types";

const INITIAL_PIPELINE: KitchenQuote[] = [
    { id: "kq_001", clientName: "Maria Gonzalez", clientEmail: "maria@gmail.com", clientPhone: "(305) 555-0101", projectAddress: "4500 Biscayne Blvd, Miami FL 33137", status: "Measuring", style: "Shaker Modern", items: [{ id: "ki_1", productId: "kp_001", productName: "30in x 24in Wall Cabinet", sku: "CAB-W3024", quantity: 6, unit: "each", unitPrice: 189, totalPrice: 1134 }, { id: "ki_2", productId: "kp_011", productName: "Calacatta Quartz Countertop", sku: "CTR-QTZ-CALACATTA", quantity: 42, unit: "sq ft", unitPrice: 85, totalPrice: 3570 }], subtotal: 4704, discount: 200, tax: 329.28, installationFee: 1800, total: 6633.28, notes: "Client prefers soft-close on all doors", createdAt: "2026-05-10T09:00:00Z", updatedAt: "2026-05-20T14:00:00Z", estimatedInstallDate: "2026-07-15", salesRep: "Adrian" },
    { id: "kq_002", clientName: "Robert Chen", clientEmail: "rchen@designstudio.com", clientPhone: "(786) 555-0202", projectAddress: "1200 Brickell Ave, Miami FL 33131", status: "Design", style: "Contemporary", items: [{ id: "ki_3", productId: "kp_014", productName: "Midnight Black Quartz", sku: "CTR-QTZ-MIDNIGHT", quantity: 55, unit: "sq ft", unitPrice: 92, totalPrice: 5060 }, { id: "ki_4", productId: "kp_008", productName: "72in Kitchen Island", sku: "CAB-ISLAND-72", quantity: 1, unit: "each", unitPrice: 1290, totalPrice: 1290 }], subtotal: 6350, tax: 444.5, installationFee: 2200, total: 8994.5, notes: "High-end renovation", createdAt: "2026-05-15T11:00:00Z", updatedAt: "2026-05-22T09:00:00Z", estimatedInstallDate: "2026-08-01", salesRep: "Adrian" },
    { id: "kq_003", clientName: "Sarah Johnson", clientEmail: "sarah.j@homemail.com", clientPhone: "(954) 555-0303", projectAddress: "700 Collins Ave, Miami Beach FL 33139", status: "Quote Sent", style: "Traditional", items: [{ id: "ki_5", productId: "kp_012", productName: "Carrara Quartz Countertop", sku: "CTR-QTZ-CARRARA", quantity: 38, unit: "sq ft", unitPrice: 78, totalPrice: 2964 }], subtotal: 2964, discount: 100, tax: 207.48, installationFee: 1200, total: 4271.48, notes: "Follow up next week", createdAt: "2026-05-01T08:00:00Z", updatedAt: "2026-05-18T16:00:00Z", salesRep: "Adrian" },
    { id: "kq_004", clientName: "David Park", clientEmail: "dpark@arc.com", clientPhone: "(305) 555-0404", projectAddress: "9999 NW 4th Ave, Doral FL 33172", status: "Lead", style: "Modern", items: [], subtotal: 0, tax: 0, installationFee: 0, total: 0, notes: "Referred by Maria Gonzalez, interested in full kitchen remodel", createdAt: "2026-05-28T10:00:00Z", updatedAt: "2026-05-28T10:00:00Z", salesRep: "Adrian" },
    { id: "kq_005", clientName: "Emily Torres", clientEmail: "emily.t@email.com", clientPhone: "(786) 555-0505", projectAddress: "3221 SW 8th St, Miami FL 33135", status: "Approved", style: "Farmhouse", items: [{ id: "ki_6", productId: "kp_015", productName: "Walnut Butcher Block", sku: "CTR-BUTCH-WALNUT", quantity: 30, unit: "sq ft", unitPrice: 62, totalPrice: 1860 }, { id: "ki_7", productId: "kp_009", productName: "30in Drawer Base", sku: "CAB-B30-DRAWER", quantity: 3, unit: "each", unitPrice: 349, totalPrice: 1047 }], subtotal: 2907, tax: 203.49, installationFee: 1400, total: 4510.49, notes: "Production starts next Monday", createdAt: "2026-04-20T09:00:00Z", updatedAt: "2026-05-25T12:00:00Z", estimatedInstallDate: "2026-06-30", salesRep: "Adrian" },
    { id: "kq_006", clientName: "James Wilson", clientEmail: "jwilson@buildco.net", clientPhone: "(305) 555-0606", projectAddress: "550 NE 2nd Ave, Miami FL 33132", status: "In Production", style: "Industrial", items: [{ id: "ki_8", productId: "kp_013", productName: "Emerald Pearl Granite", sku: "CTR-GRN-EMERALD", quantity: 65, unit: "sq ft", unitPrice: 95, totalPrice: 6175 }], subtotal: 6175, discount: 300, tax: 412.25, installationFee: 2500, total: 8787.25, notes: "Commercial kitchen, extra ventilation needed", createdAt: "2026-04-05T09:00:00Z", updatedAt: "2026-05-10T11:00:00Z", estimatedInstallDate: "2026-06-15", salesRep: "Adrian" },
    { id: "kq_007", clientName: "Ana Reyes", clientEmail: "areyes@gmail.com", clientPhone: "(786) 555-0707", projectAddress: "1 SE Ocean Blvd, Stuart FL 34994", status: "Installed", style: "Coastal", items: [{ id: "ki_9", productId: "kp_003", productName: "36in Base Cabinet", sku: "CAB-B36", quantity: 4, unit: "each", unitPrice: 279, totalPrice: 1116 }], subtotal: 1116, tax: 78.12, installationFee: 800, total: 1994.12, notes: "Completed successfully, client very happy", createdAt: "2026-03-01T09:00:00Z", updatedAt: "2026-05-01T16:00:00Z", salesRep: "Adrian" },
];

const PIPELINE_STAGES: KitchenQuoteStatus[] = ["Lead", "Measuring", "Design", "Quote Sent", "Approved", "In Production", "Installed", "Lost"];

const STATUS_CONFIG: Record<KitchenQuoteStatus, { color: string; bg: string; border: string; dot: string }> = {
    "Lead":          { color: "text-zinc-600",   bg: "bg-zinc-100",   border: "border-zinc-300",   dot: "bg-zinc-400" },
    "Measuring":     { color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",   dot: "bg-blue-500" },
    "Design":        { color: "text-violet-700",  bg: "bg-violet-50",  border: "border-violet-200", dot: "bg-violet-500" },
    "Quote Sent":    { color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",  dot: "bg-amber-500" },
    "Approved":      { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200",dot: "bg-emerald-500" },
    "In Production": { color: "text-orange-700",  bg: "bg-orange-50",  border: "border-orange-200", dot: "bg-orange-500" },
    "Installed":     { color: "text-teal-700",    bg: "bg-teal-50",    border: "border-teal-200",   dot: "bg-teal-500" },
    "Lost":          { color: "text-red-600",     bg: "bg-red-50",     border: "border-red-200",    dot: "bg-red-400" },
};

const CATEGORY_COLORS: Record<string, string> = {
    "Cabinet":    "text-amber-700 bg-amber-50 border-amber-200",
    "Countertop": "text-slate-700 bg-slate-50 border-slate-200",
    "Hardware":   "text-zinc-700 bg-zinc-100 border-zinc-200",
    "Appliance":  "text-blue-700 bg-blue-50 border-blue-200",
    "Accessory":  "text-purple-700 bg-purple-50 border-purple-200",
};

function blankQuote() {
    return {
        clientName: "", clientEmail: "", clientPhone: "", projectAddress: "",
        status: "Lead" as KitchenQuoteStatus, style: "", items: [] as KitchenQuoteItem[],
        subtotal: 0, tax: 0, installationFee: 0, total: 0, notes: "", salesRep: "Adrian", discount: 0
    };
}

export default function KitchenSalesPage() {
    const [activeTab, setActiveTab] = useState<"pipeline" | "catalog">("pipeline");
    const [pipeline, setPipeline] = useState<KitchenQuote[]>(INITIAL_PIPELINE);
    const [selectedQuote, setSelectedQuote] = useState<KitchenQuote | null>(null);
    const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);
    const [pipelineSearch, setPipelineSearch] = useState("");
    const [catalogSearch, setCatalogSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("All");
    const [inStockFilter, setInStockFilter] = useState(false);
    const [newQuote, setNewQuote] = useState(blankQuote());
    const [quoteItems, setQuoteItems] = useState<KitchenQuoteItem[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<KitchenProduct | null>(null);
    const [itemQty, setItemQty] = useState(1);

    const filteredCatalog = useMemo(() => kitchenProducts.filter(p => {
        const q = catalogSearch.toLowerCase();
        return (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) || p.finish.toLowerCase().includes(q)) &&
            (categoryFilter === "All" || p.category === categoryFilter) && (!inStockFilter || p.inStock);
    }), [catalogSearch, categoryFilter, inStockFilter]);

    const filteredPipeline = useMemo(() => {
        const q = pipelineSearch.toLowerCase();
        return pipeline.filter(kq => !q || kq.clientName.toLowerCase().includes(q) ||
            kq.projectAddress.toLowerCase().includes(q) || kq.style.toLowerCase().includes(q));
    }, [pipeline, pipelineSearch]);

    const pipelineSummary = useMemo(() => {
        const active = pipeline.filter(q => !["Lost", "Installed"].includes(q.status));
        return {
            active: active.length,
            totalValue: active.reduce((s, q) => s + q.total, 0),
            byStatus: PIPELINE_STAGES.reduce((acc, s) => {
                acc[s] = pipeline.filter(q => q.status === s).length;
                return acc;
            }, {} as Record<string, number>)
        };
    }, [pipeline]);

    function calcTotals(items: KitchenQuoteItem[], fee: number, discount = 0) {
        const sub = items.reduce((s, i) => s + i.totalPrice, 0);
        const tax = (sub - (discount || 0)) * 0.07;
        return { subtotal: sub, tax: parseFloat(tax.toFixed(2)), total: parseFloat((sub - (discount || 0) + tax + fee).toFixed(2)) };
    }

    function addItemToQuote() {
        if (!selectedProduct) return;
        const item: KitchenQuoteItem = {
            id: `ki_${Date.now()}`, productId: selectedProduct.id, productName: selectedProduct.name,
            sku: selectedProduct.sku, quantity: itemQty, unit: selectedProduct.unit,
            unitPrice: selectedProduct.unitPrice, totalPrice: parseFloat((selectedProduct.unitPrice * itemQty).toFixed(2))
        };
        const updated = [...quoteItems, item];
        setQuoteItems(updated);
        setSelectedProduct(null); setItemQty(1); setProductSearch("");
        const t = calcTotals(updated, newQuote.installationFee, newQuote.discount);
        setNewQuote(q => ({ ...q, ...t }));
    }

    function removeQuoteItem(id: string) {
        const updated = quoteItems.filter(i => i.id !== id);
        setQuoteItems(updated);
        const t = calcTotals(updated, newQuote.installationFee, newQuote.discount);
        setNewQuote(q => ({ ...q, ...t }));
    }

    function handleFeeChange(fee: number) {
        const t = calcTotals(quoteItems, fee, newQuote.discount);
        setNewQuote(q => ({ ...q, installationFee: fee, ...t }));
    }

    function handleDiscountChange(discount: number) {
        const t = calcTotals(quoteItems, newQuote.installationFee, discount);
        setNewQuote(q => ({ ...q, discount, ...t }));
    }

    function submitNewQuote() {
        if (!newQuote.clientName.trim()) return;
        const quote: KitchenQuote = {
            ...newQuote, items: quoteItems,
            id: `kq_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setPipeline(p => [quote, ...p]);
        setShowNewQuoteModal(false); setNewQuote(blankQuote()); setQuoteItems([]);
    }

    function updateQuoteStatus(id: string, status: KitchenQuoteStatus) {
        setPipeline(p => p.map(q => q.id === id ? { ...q, status, updatedAt: new Date().toISOString() } : q));
        setSelectedQuote(q => q?.id === id ? { ...q, status } : q);
    }

    const productSearchResults = useMemo(() => {
        if (!productSearch) return [];
        return kitchenProducts.filter(p =>
            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            p.sku.toLowerCase().includes(productSearch.toLowerCase())
        ).slice(0, 8);
    }, [productSearch]);

    return (
        <div className="max-w-full space-y-6">
            {/* Page Header */}
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Kitchen Sales</h1>
                    <p className="text-zinc-500 mt-1">Manage kitchen projects, catalog products, and client quotes.</p>
                </div>
                <button
                    id="btn-new-kitchen-quote"
                    onClick={() => { setNewQuote(blankQuote()); setQuoteItems([]); setShowNewQuoteModal(true); }}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all hover:shadow-lg active:scale-95"
                >
                    + Create Kitchen Quote
                </button>
            </div>

            {/* KPI Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Active Projects", value: pipelineSummary.active, sub: "in pipeline", color: "bg-orange-50 border-orange-200" },
                    { label: "Pipeline Value", value: `$${pipelineSummary.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: "active quotes", color: "bg-emerald-50 border-emerald-200" },
                    { label: "Quotes Sent", value: pipelineSummary.byStatus["Quote Sent"] || 0, sub: "awaiting approval", color: "bg-amber-50 border-amber-200" },
                    { label: "In Production", value: (pipelineSummary.byStatus["In Production"] || 0) + (pipelineSummary.byStatus["Approved"] || 0), sub: "approved / production", color: "bg-blue-50 border-blue-200" },
                ].map(kpi => (
                    <div key={kpi.label} className={`${kpi.color} border rounded-xl p-4`}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{kpi.label}</p>
                        <p className="text-2xl font-black text-zinc-900 mt-1">{kpi.value}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{kpi.sub}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl w-fit">
                {(["pipeline", "catalog"] as const).map(tab => (
                    <button
                        key={tab}
                        id={`tab-kitchen-${tab}`}
                        onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
                    >
                        {tab === "pipeline" ? "Kitchen Pipeline" : "Product Catalog"}
                    </button>
                ))}
            </div>

            {/* Pipeline Tab */}
            {activeTab === "pipeline" && (
                <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex flex-wrap items-center gap-3">
                        <input
                            type="text" placeholder="Search client, address, style..."
                            value={pipelineSearch} onChange={e => setPipelineSearch(e.target.value)}
                            className="flex-1 min-w-48 px-4 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white text-zinc-900"
                        />
                        <div className="flex flex-wrap gap-2">
                            {PIPELINE_STAGES.slice(0, 6).map(s => {
                                const c = STATUS_CONFIG[s];
                                return (
                                    <span key={s} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.border} ${c.color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                                        {s} ({pipelineSummary.byStatus[s] || 0})
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-600">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Quote</th>
                                    <th className="px-5 py-3 font-semibold">Client</th>
                                    <th className="px-5 py-3 font-semibold hidden md:table-cell">Project Address</th>
                                    <th className="px-5 py-3 font-semibold hidden lg:table-cell">Style</th>
                                    <th className="px-5 py-3 font-semibold text-right">Total</th>
                                    <th className="px-5 py-3 font-semibold">Status</th>
                                    <th className="px-5 py-3 font-semibold hidden xl:table-cell">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredPipeline.map(kq => {
                                    const c = STATUS_CONFIG[kq.status];
                                    return (
                                        <tr key={kq.id} onClick={() => setSelectedQuote(kq)} className="hover:bg-orange-50/40 transition-colors cursor-pointer">
                                            <td className="px-5 py-4 font-bold text-zinc-900"><span className="text-orange-500">#</span>{kq.id.replace("kq_", "")}</td>
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-zinc-900">{kq.clientName}</div>
                                                <div className="text-xs text-zinc-400 mt-0.5">{kq.clientPhone}</div>
                                            </td>
                                            <td className="px-5 py-4 hidden md:table-cell text-zinc-500 max-w-xs truncate">{kq.projectAddress}</td>
                                            <td className="px-5 py-4 hidden lg:table-cell text-zinc-500">{kq.style || "—"}</td>
                                            <td className="px-5 py-4 text-right font-black text-zinc-900">
                                                {kq.total > 0 ? `$${kq.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : <span className="text-zinc-300 font-normal">TBD</span>}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${c.bg} ${c.border} ${c.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />{kq.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 hidden xl:table-cell text-zinc-400 text-xs">{new Date(kq.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    );
                                })}
                                {filteredPipeline.length === 0 && (
                                    <tr><td colSpan={7} className="px-5 py-16 text-center text-zinc-400">
                                        <div className="font-semibold text-zinc-600 text-lg mb-1">No kitchen projects found</div>
                                        <div className="text-sm">Try a different search or create a new quote</div>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Catalog Tab */}
            {activeTab === "catalog" && (
                <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50 flex flex-wrap items-center gap-3">
                        <input
                            type="text" placeholder="Search by name, SKU, brand, finish..."
                            value={catalogSearch} onChange={e => setCatalogSearch(e.target.value)}
                            className="flex-1 min-w-48 px-4 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white text-zinc-900"
                        />
                        <div className="flex flex-wrap gap-2">
                            {["All", "Cabinet", "Countertop", "Hardware", "Accessory"].map(cat => (
                                <button key={cat} onClick={() => setCategoryFilter(cat)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${categoryFilter === cat ? "bg-orange-600 text-white border-orange-600" : "bg-white text-zinc-600 border-zinc-300 hover:border-orange-400"}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <label className="flex items-center gap-2 text-sm font-medium text-zinc-600 cursor-pointer">
                            <input type="checkbox" checked={inStockFilter} onChange={e => setInStockFilter(e.target.checked)} className="w-4 h-4 rounded border-zinc-300 accent-orange-600" />
                            In Stock Only
                        </label>
                        <span className="text-sm font-medium text-zinc-400 bg-zinc-200 px-3 py-1 rounded-full">{filteredCatalog.length} items</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-600">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">SKU / Code</th>
                                    <th className="px-5 py-3 font-semibold">Item Name</th>
                                    <th className="px-5 py-3 font-semibold hidden md:table-cell">Category</th>
                                    <th className="px-5 py-3 font-semibold hidden lg:table-cell">Style</th>
                                    <th className="px-5 py-3 font-semibold hidden lg:table-cell">Finish</th>
                                    <th className="px-5 py-3 font-semibold text-right">Unit Price</th>
                                    <th className="px-5 py-3 font-semibold hidden xl:table-cell">Lead Time</th>
                                    <th className="px-5 py-3 font-semibold">Stock</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filteredCatalog.map(p => (
                                    <tr key={p.id} className="hover:bg-orange-50/30 transition-colors">
                                        <td className="px-5 py-3.5"><code className="text-xs font-mono bg-zinc-100 text-zinc-700 px-2 py-1 rounded font-bold">{p.sku}</code></td>
                                        <td className="px-5 py-3.5">
                                            <div className="font-semibold text-zinc-900">{p.name}</div>
                                            <div className="text-xs text-zinc-400 mt-0.5">{p.brand}</div>
                                        </td>
                                        <td className="px-5 py-3.5 hidden md:table-cell">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${CATEGORY_COLORS[p.category] || ""}`}>{p.category}</span>
                                        </td>
                                        <td className="px-5 py-3.5 hidden lg:table-cell text-zinc-500">{p.style}</td>
                                        <td className="px-5 py-3.5 hidden lg:table-cell text-zinc-500">{p.finish}</td>
                                        <td className="px-5 py-3.5 text-right font-black text-zinc-900">
                                            ${p.unitPrice.toFixed(2)}<span className="text-xs text-zinc-400 font-normal ml-1">/{p.unit}</span>
                                        </td>
                                        <td className="px-5 py-3.5 hidden xl:table-cell text-zinc-500 text-xs">{p.leadTimeDays} days</td>
                                        <td className="px-5 py-3.5">
                                            {p.inStock
                                                ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />In Stock</span>
                                                : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />Order</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quote Detail Drawer */}
            {selectedQuote && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedQuote(null)} />
                    <div className="relative ml-auto w-full max-w-xl bg-white h-full flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-gradient-to-r from-orange-600 to-amber-500">
                            <div>
                                <h2 className="text-lg font-bold text-white">Quote #{selectedQuote.id.replace("kq_", "")}</h2>
                                <p className="text-orange-100 text-sm">{selectedQuote.clientName}</p>
                            </div>
                            <button onClick={() => setSelectedQuote(null)} className="text-white/80 hover:text-white text-2xl leading-none font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">&#215;</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2">Update Status</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {PIPELINE_STAGES.map(s => {
                                        const c = STATUS_CONFIG[s];
                                        const isActive = selectedQuote.status === s;
                                        return (
                                            <button key={s} onClick={() => updateQuoteStatus(selectedQuote.id, s)}
                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isActive ? `${c.bg} ${c.border} ${c.color} ring-2 ring-offset-1 ring-orange-400` : `${c.bg} ${c.border} ${c.color} opacity-60 hover:opacity-100`}`}>
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="bg-zinc-50 rounded-xl p-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Client Information</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div><span className="text-zinc-400 text-xs">Name</span><p className="font-semibold text-zinc-900">{selectedQuote.clientName}</p></div>
                                    <div><span className="text-zinc-400 text-xs">Phone</span><p className="font-semibold text-zinc-900">{selectedQuote.clientPhone}</p></div>
                                    <div className="col-span-2"><span className="text-zinc-400 text-xs">Email</span><p className="font-semibold text-zinc-900">{selectedQuote.clientEmail}</p></div>
                                    <div className="col-span-2"><span className="text-zinc-400 text-xs">Project Address</span><p className="font-semibold text-zinc-900">{selectedQuote.projectAddress}</p></div>
                                    <div><span className="text-zinc-400 text-xs">Style</span><p className="font-semibold text-zinc-900">{selectedQuote.style || "—"}</p></div>
                                    {selectedQuote.estimatedInstallDate && <div><span className="text-zinc-400 text-xs">Est. Install</span><p className="font-semibold text-zinc-900">{new Date(selectedQuote.estimatedInstallDate).toLocaleDateString()}</p></div>}
                                </div>
                            </div>
                            {selectedQuote.items.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Line Items</h3>
                                    <div className="space-y-2">
                                        {selectedQuote.items.map(item => (
                                            <div key={item.id} className="flex items-start justify-between bg-zinc-50 rounded-lg px-3 py-2.5 gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-zinc-900 text-sm truncate">{item.productName}</p>
                                                    <p className="text-xs text-zinc-400 mt-0.5">
                                                        <code className="bg-zinc-200 px-1 rounded">{item.sku}</code>
                                                        {" · "}{item.quantity} {item.unit} x ${item.unitPrice.toFixed(2)}
                                                    </p>
                                                </div>
                                                <span className="font-black text-zinc-900 text-sm whitespace-nowrap">${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {selectedQuote.total > 0 && (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-1.5">
                                    <div className="flex justify-between text-sm text-zinc-600"><span>Subtotal</span><span>${selectedQuote.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    {selectedQuote.discount ? <div className="flex justify-between text-sm text-emerald-700"><span>Discount</span><span>-${selectedQuote.discount.toFixed(2)}</span></div> : null}
                                    <div className="flex justify-between text-sm text-zinc-600"><span>Installation</span><span>${selectedQuote.installationFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between text-sm text-zinc-600"><span>Tax (7%)</span><span>${selectedQuote.tax.toFixed(2)}</span></div>
                                    <div className="border-t border-orange-300 pt-2 flex justify-between font-black text-zinc-900 text-base"><span>Total</span><span>${selectedQuote.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                </div>
                            )}
                            {selectedQuote.notes && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Notes</h3>
                                    <p className="text-sm text-zinc-600 bg-zinc-50 rounded-lg p-3">{selectedQuote.notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-zinc-200 flex gap-3">
                            <button onClick={() => { setSelectedQuote(null); setActiveTab("catalog"); }} className="flex-1 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-sm font-semibold transition-colors">View Catalog</button>
                            <button onClick={() => setSelectedQuote(null)} className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold transition-colors">Done</button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Quote Modal */}
            {showNewQuoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowNewQuoteModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-gradient-to-r from-orange-600 to-amber-500 rounded-t-2xl">
                            <div>
                                <h2 className="text-lg font-bold text-white">Create Kitchen Quote</h2>
                                <p className="text-orange-100 text-sm">Fill in client details and add products</p>
                            </div>
                            <button onClick={() => setShowNewQuoteModal(false)} className="text-white/80 hover:text-white text-2xl leading-none font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">&#215;</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Client Information</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-600 block mb-1">Client Name *</label>
                                        <input type="text" placeholder="Jane Smith" value={newQuote.clientName} onChange={e => setNewQuote(q => ({ ...q, clientName: e.target.value }))} className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-600 block mb-1">Phone</label>
                                        <input type="text" placeholder="(305) 555-0000" value={newQuote.clientPhone} onChange={e => setNewQuote(q => ({ ...q, clientPhone: e.target.value }))} className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-600 block mb-1">Email</label>
                                        <input type="email" placeholder="client@email.com" value={newQuote.clientEmail} onChange={e => setNewQuote(q => ({ ...q, clientEmail: e.target.value }))} className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-600 block mb-1">Kitchen Style</label>
                                        <input type="text" placeholder="Shaker Modern, Contemporary..." value={newQuote.style} onChange={e => setNewQuote(q => ({ ...q, style: e.target.value }))} className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-semibold text-zinc-600 block mb-1">Project Address</label>
                                        <input type="text" placeholder="123 Main St, Miami FL 33101" value={newQuote.projectAddress} onChange={e => setNewQuote(q => ({ ...q, projectAddress: e.target.value }))} className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Add Products</h3>
                                <div className="flex gap-2 relative">
                                    <div className="flex-1 relative">
                                        <input type="text" placeholder="Search product by name or SKU..." value={productSearch}
                                            onChange={e => { setProductSearch(e.target.value); setSelectedProduct(null); }}
                                            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                        {productSearchResults.length > 0 && !selectedProduct && (
                                            <div className="absolute top-full left-0 right-0 bg-white border border-zinc-200 rounded-xl shadow-xl z-10 mt-1 overflow-hidden max-h-52 overflow-y-auto">
                                                {productSearchResults.map(p => (
                                                    <button key={p.id} type="button" onClick={() => { setSelectedProduct(p); setProductSearch(p.name); }} className="w-full text-left px-3 py-2.5 hover:bg-orange-50 transition-colors text-sm border-b border-zinc-100 last:border-0">
                                                        <span className="font-semibold text-zinc-900">{p.name}</span>
                                                        <span className="text-xs text-zinc-400 ml-2">{p.sku} — ${p.unitPrice.toFixed(2)}/{p.unit}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <input type="number" min={1} value={itemQty} onChange={e => setItemQty(parseFloat(e.target.value) || 1)} className="w-20 px-3 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900 text-center" placeholder="Qty" />
                                    <button type="button" onClick={addItemToQuote} disabled={!selectedProduct} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-bold disabled:opacity-40 hover:bg-orange-700 transition-colors">Add</button>
                                </div>
                                {quoteItems.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {quoteItems.map(item => (
                                            <div key={item.id} className="flex items-center gap-3 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-zinc-900 text-sm truncate">{item.productName}</p>
                                                    <p className="text-xs text-zinc-500">{item.quantity} {item.unit} x ${item.unitPrice.toFixed(2)}</p>
                                                </div>
                                                <span className="font-black text-zinc-900 text-sm">${item.totalPrice.toFixed(2)}</span>
                                                <button onClick={() => removeQuoteItem(item.id)} className="text-red-400 hover:text-red-600 text-xl leading-none font-bold">&#215;</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-600 block mb-1">Installation Fee ($)</label>
                                    <input type="number" min={0} step={50} value={newQuote.installationFee} onChange={e => handleFeeChange(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-zinc-600 block mb-1">Discount ($)</label>
                                    <input type="number" min={0} step={50} value={newQuote.discount || 0} onChange={e => handleDiscountChange(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-zinc-600 block mb-1">Notes</label>
                                <textarea rows={3} placeholder="Client preferences, special requirements..." value={newQuote.notes} onChange={e => setNewQuote(q => ({ ...q, notes: e.target.value }))} className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900 resize-none" />
                            </div>
                            {newQuote.total > 0 && (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-1">
                                    <div className="flex justify-between text-sm text-zinc-600"><span>Subtotal</span><span>${newQuote.subtotal.toFixed(2)}</span></div>
                                    {(newQuote.discount || 0) > 0 && <div className="flex justify-between text-sm text-emerald-700"><span>Discount</span><span>-${(newQuote.discount || 0).toFixed(2)}</span></div>}
                                    <div className="flex justify-between text-sm text-zinc-600"><span>Installation</span><span>${newQuote.installationFee.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-sm text-zinc-600"><span>Tax (7%)</span><span>${newQuote.tax.toFixed(2)}</span></div>
                                    <div className="border-t border-orange-300 pt-2 flex justify-between font-black text-zinc-900"><span>Total</span><span>${newQuote.total.toFixed(2)}</span></div>
                                </div>
                            )}
                        </div>
                        <div className="p-5 border-t border-zinc-200 flex gap-3">
                            <button onClick={() => setShowNewQuoteModal(false)} className="flex-1 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                            <button id="btn-submit-kitchen-quote" onClick={submitNewQuote} disabled={!newQuote.clientName.trim()} className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold shadow-md transition-all">Create Kitchen Quote</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
