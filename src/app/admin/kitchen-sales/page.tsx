"use client";

import { useState, useMemo, useEffect } from "react";
import kitchenProducts from "@/lib/kitchenProducts";
import { KitchenProduct, KitchenQuote, KitchenQuoteStatus, KitchenQuoteItem } from "@/lib/types";
import { 
    getKitchenQuotes, 
    createKitchenQuote, 
    updateKitchenQuote, 
    deleteKitchenQuote, 
    updateKitchenQuoteStatus 
} from "@/app/actions/kitchenQuoteActions";
import { 
    LayoutDashboard, 
    Plus, 
    Search, 
    Grid, 
    ListFilter, 
    Calendar, 
    DollarSign, 
    Briefcase, 
    User, 
    Phone, 
    Mail, 
    MapPin, 
    Clock, 
    Trash2, 
    Check, 
    Printer,
    Edit3,
    Sparkles,
    Trash,
    Maximize2,
    Sliders,
    ArrowRight,
    Clipboard
} from "lucide-react";

const INITIAL_PIPELINE: any[] = [];

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

const AREA_OPTIONS = ["Kitchen", "Laundry", "Closet", "Bathroom"];

function blankQuote() {
    return {
        clientName: "", clientEmail: "", clientPhone: "", projectAddress: "",
        status: "Lead" as KitchenQuoteStatus, style: "",
        subtotal: 0, tax: 0, installationFee: 0, total: 0, notes: "", salesRep: "Adrian", discount: 0
    };
}

export default function KitchenSalesPage() {
    const [activeTab, setActiveTab] = useState<"pipeline" | "catalog">("pipeline");
    const [pipeline, setPipeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuote, setSelectedQuote] = useState<any | null>(null);
    const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);
    const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

    const handleCloseModal = () => {
        setShowNewQuoteModal(false);
        setEditingQuoteId(null);
        setNewQuote(blankQuote());
        setQuoteItems([]);
    };
    const [pipelineSearch, setPipelineSearch] = useState("");
    const [catalogSearch, setCatalogSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("All");
    const [inStockFilter, setInStockFilter] = useState(false);

    // New quote creation states
    const [newQuote, setNewQuote] = useState(blankQuote());
    const [quoteItems, setQuoteItems] = useState<any[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<KitchenProduct | null>(null);
    const [itemQty, setItemQty] = useState(1);
    const [selectedArea, setSelectedArea] = useState("Kitchen");

    // Fetch and seed data on load
    useEffect(() => {
        loadQuotes();
    }, []);

    const loadQuotes = async () => {
        setLoading(true);
        try {
            const data = await getKitchenQuotes();
            setPipeline(data);
        } catch (e) {
            console.error("Error loading quotes:", e);
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals automatically
    const totals = useMemo(() => {
        const sub = quoteItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
        const disc = newQuote.discount || 0;
        const inst = newQuote.installationFee || 0;
        const subAfterDisc = Math.max(0, sub - disc);
        const taxVal = parseFloat((subAfterDisc * 0.07).toFixed(2));
        const grand = parseFloat((subAfterDisc + inst + taxVal).toFixed(2));
        return { subtotal: sub, tax: taxVal, total: grand };
    }, [quoteItems, newQuote.discount, newQuote.installationFee]);

    // Apply totals to state
    useEffect(() => {
        setNewQuote(q => ({
            ...q,
            subtotal: totals.subtotal,
            tax: totals.tax,
            total: totals.total
        }));
    }, [totals]);

    // Product search results
    const productSearchResults = useMemo(() => {
        if (!productSearch.trim()) return [];
        const term = productSearch.toLowerCase();
        return kitchenProducts.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.sku.toLowerCase().includes(term)
        ).slice(0, 5);
    }, [productSearch]);

    // Filter catalog products
    const filteredCatalog = useMemo(() => {
        return kitchenProducts.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(catalogSearch.toLowerCase()) || p.sku.toLowerCase().includes(catalogSearch.toLowerCase());
            const matchesCategory = categoryFilter === "All" || p.category === categoryFilter;
            const matchesStock = !inStockFilter || p.inStock;
            return matchesSearch && matchesCategory && matchesStock;
        });
    }, [catalogSearch, categoryFilter, inStockFilter]);

    // Pipeline metrics
    const pipelineSummary = useMemo(() => {
        const active = pipeline.filter(q => q.status !== "Lost" && q.status !== "Installed");
        const totalVal = active.reduce((acc, q) => acc + q.total, 0);
        const byStatus: Record<string, number> = {};
        pipeline.forEach(q => {
            byStatus[q.status] = (byStatus[q.status] || 0) + 1;
        });
        return { totalValue: totalVal, activeCount: active.length, byStatus };
    }, [pipeline]);

    // Add product to quote
    const addItemToQuote = () => {
        if (!selectedProduct) return;
        const newItem = {
            id: `ki_new_${Date.now()}`,
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            sku: selectedProduct.sku,
            quantity: itemQty,
            unit: selectedProduct.unit,
            unitPrice: selectedProduct.unitPrice,
            totalPrice: itemQty * selectedProduct.unitPrice,
            area: selectedArea,
            notes: ""
        };
        setQuoteItems(prev => [...prev, newItem]);
        setProductSearch("");
        setSelectedProduct(null);
        setItemQty(1);
    };

    // Add a custom write-in item line
    const addCustomLine = () => {
        const newItem = {
            id: `ki_new_${Date.now()}`,
            productId: "custom_line",
            productName: "Custom Material Line Item",
            sku: "CAB-CUSTOM",
            quantity: 1,
            unit: "each",
            unitPrice: 100,
            totalPrice: 100,
            area: selectedArea,
            notes: ""
        };
        setQuoteItems(prev => [...prev, newItem]);
    };

    // Remove item from quote
    const removeQuoteItem = (id: string) => {
        setQuoteItems(prev => prev.filter(item => item.id !== id));
    };

    // Handle modification of fields inside editable grid
    const handleUpdateItemField = (index: number, field: string, value: any) => {
        setQuoteItems(prev => {
            const copy = [...prev];
            copy[index] = {
                ...copy[index],
                [field]: value
            };
            if (field === "quantity" || field === "unitPrice") {
                const qty = field === "quantity" ? value : copy[index].quantity;
                const price = field === "unitPrice" ? value : copy[index].unitPrice;
                copy[index].totalPrice = qty * price;
            }
            return copy;
        });
    };

    const handleDiscountChange = (val: number) => {
        setNewQuote(q => ({ ...q, discount: val }));
    };

    const handleFeeChange = (val: number) => {
        setNewQuote(q => ({ ...q, installationFee: val }));
    };

    // Create or update quote on database
    const submitNewQuote = async () => {
        try {
            const dataToSave = {
                clientName: newQuote.clientName,
                clientEmail: newQuote.clientEmail,
                clientPhone: newQuote.clientPhone,
                projectAddress: newQuote.projectAddress,
                status: newQuote.status,
                style: newQuote.style,
                subtotal: newQuote.subtotal,
                discount: newQuote.discount || 0,
                tax: newQuote.tax,
                installationFee: newQuote.installationFee,
                total: newQuote.total,
                notes: newQuote.notes,
                salesRep: newQuote.salesRep,
                items: quoteItems
            };
            if (editingQuoteId) {
                await updateKitchenQuote(editingQuoteId, dataToSave);
            } else {
                await createKitchenQuote(dataToSave);
            }
            await loadQuotes();
            handleCloseModal();
        } catch (e) {
            console.error("Error saving quote:", e);
        }
    };

    // Update quote status
    const updateQuoteStatusInDb = async (id: string, status: KitchenQuoteStatus) => {
        try {
            await updateKitchenQuoteStatus(id, status);
            await loadQuotes();
            setSelectedQuote((q: any) => q?.id === id ? { ...q, status } : q);
        } catch (e) {
            console.error("Error updating status:", e);
        }
    };

    // Delete quote
    const handleDeleteQuote = async (id: string) => {
        if (!confirm("Are you sure you want to delete this kitchen quote?")) return;
        try {
            await deleteKitchenQuote(id);
            setSelectedQuote(null);
            await loadQuotes();
        } catch (e) {
            console.error("Error deleting quote:", e);
        }
    };

    // Search filter pipeline
    const filteredPipeline = useMemo(() => {
        if (!pipelineSearch.trim()) return pipeline;
        const term = pipelineSearch.toLowerCase();
        return pipeline.filter(q => 
            q.clientName.toLowerCase().includes(term) ||
            q.projectAddress.toLowerCase().includes(term) ||
            (q.style || '').toLowerCase().includes(term)
        );
    }, [pipeline, pipelineSearch]);

    // Group active pipeline columns
    const columns = useMemo(() => {
        const cols: Record<KitchenQuoteStatus, any[]> = {
            "Lead": [], "Measuring": [], "Design": [], "Quote Sent": [],
            "Approved": [], "In Production": [], "Installed": [], "Lost": []
        };
        filteredPipeline.forEach(q => {
            if (cols[q.status as KitchenQuoteStatus]) {
                cols[q.status as KitchenQuoteStatus].push(q);
            }
        });
        return cols;
    }, [filteredPipeline]);

    if (loading) {
        return <div className="p-8 text-center text-zinc-500 font-semibold animate-pulse">Loading Kitchen Pipeline...</div>;
    }

    return (
        <div className="max-w-[1400px] mx-auto min-h-screen">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                        <Sliders className="h-8 w-8 text-orange-600" />
                        Kitchen Sales Pipeline
                    </h1>
                    <p className="text-zinc-500 mt-1">Manage kitchen specifications, database quotes, and client installations.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            setEditingQuoteId(null);
                            setNewQuote(blankQuote());
                            setQuoteItems([]);
                            setShowNewQuoteModal(true);
                        }} 
                        className="bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-orange-700 transition-all shadow-md flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" /> New Kitchen Quote
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 print:hidden">
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
                    <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Pipeline Value</span>
                    <p className="text-2xl font-black text-zinc-900 mt-1">${pipelineSummary.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Active quotes in pipeline</span>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
                    <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Quotes Sent</span>
                    <p className="text-2xl font-black text-zinc-900 mt-1">{pipelineSummary.byStatus["Quote Sent"] || 0}</p>
                    <span className="text-[10px] text-amber-600 font-bold mt-1 block">Awaiting customer approval</span>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
                    <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">In Production</span>
                    <p className="text-2xl font-black text-zinc-900 mt-1">{pipelineSummary.byStatus["In Production"] || 0}</p>
                    <span className="text-[10px] text-orange-600 font-bold mt-1 block">Active material builds</span>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
                    <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Total Sales Closed</span>
                    <p className="text-2xl font-black text-zinc-900 mt-1">{pipelineSummary.byStatus["Installed"] || 0}</p>
                    <span className="text-[10px] text-teal-600 font-bold mt-1 block">Successfully installed spaces</span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-200 mb-6 gap-6 print:hidden">
                <button 
                    onClick={() => setActiveTab("pipeline")} 
                    className={`pb-3 font-semibold text-sm border-b-2 transition-all ${activeTab === "pipeline" ? "border-orange-600 text-orange-600 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-900"}`}
                >
                    Sales Pipeline
                </button>
                <button 
                    onClick={() => setActiveTab("catalog")} 
                    className={`pb-3 font-semibold text-sm border-b-2 transition-all ${activeTab === "catalog" ? "border-orange-600 text-orange-600 font-bold" : "border-transparent text-zinc-500 hover:text-zinc-900"}`}
                >
                    Product Catalog
                </button>
            </div>

            {/* PIPELINE TAB */}
            {activeTab === "pipeline" && (
                <div className="space-y-4 print:hidden">
                    <div className="flex gap-2 max-w-md bg-white border border-zinc-200 rounded-lg px-3 py-1.5 items-center">
                        <Search className="h-4 w-4 text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="Filter pipeline by client or address..." 
                            value={pipelineSearch}
                            onChange={e => setPipelineSearch(e.target.value)}
                            className="bg-transparent text-zinc-900 text-sm outline-none w-full"
                        />
                    </div>

                    <div className="overflow-x-auto pb-4">
                        <div className="flex gap-4 min-w-[1400px]">
                            {PIPELINE_STAGES.map(stage => {
                                const stageQuotes = columns[stage] || [];
                                const config = STATUS_CONFIG[stage];
                                return (
                                    <div key={stage} className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl p-3 h-[70vh] flex flex-col">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${config.bg} ${config.border} ${config.color}`}>
                                                {stage}
                                            </span>
                                            <span className="text-xs font-semibold text-zinc-400 bg-white px-2 py-0.5 rounded-full border border-zinc-150">{stageQuotes.length}</span>
                                        </div>
                                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                                            {stageQuotes.map(q => (
                                                <div 
                                                    key={q.id}
                                                    onClick={() => setSelectedQuote(q)}
                                                    className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs hover:border-orange-400 hover:shadow-sm cursor-pointer transition-all space-y-2"
                                                >
                                                    <div className="flex justify-between items-start gap-1">
                                                        <h4 className="font-bold text-zinc-900 text-xs truncate flex-1">{q.clientName}</h4>
                                                        <span className="text-[10px] text-zinc-400 font-semibold">#{q.quoteNumber || "—"}</span>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-500 font-medium truncate flex items-center gap-1">
                                                        <MapPin className="h-3 w-3 text-zinc-400 shrink-0" />
                                                        {q.projectAddress}
                                                    </p>
                                                    <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                                                        <span className="text-[10px] text-zinc-400 font-semibold truncate max-w-[80px]">{q.style || "Custom"}</span>
                                                        <span className="text-xs font-black text-zinc-900">${q.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {stageQuotes.length === 0 && (
                                                <div className="h-full border border-dashed border-zinc-200 rounded-xl flex items-center justify-center p-4">
                                                    <p className="text-[10px] text-zinc-400 text-center font-medium">No active leads</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* CATALOG TAB */}
            {activeTab === "catalog" && (
                <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden print:hidden">
                    <div className="p-4 border-b border-zinc-200 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex gap-2 max-w-xs bg-white border border-zinc-200 rounded-lg px-3 py-1.5 items-center flex-1">
                            <Search className="h-4 w-4 text-zinc-400" />
                            <input 
                                type="text" 
                                placeholder="Search catalog products..." 
                                value={catalogSearch}
                                onChange={e => setCatalogSearch(e.target.value)}
                                className="bg-transparent text-zinc-900 text-sm outline-none w-full"
                            />
                        </div>
                        <div className="flex flex-wrap gap-3 items-center text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-500 font-semibold">Category:</span>
                                <select 
                                    value={categoryFilter} 
                                    onChange={e => setCategoryFilter(e.target.value)}
                                    className="bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 outline-none"
                                >
                                    <option value="All">All Categories</option>
                                    <option value="Cabinet">Cabinets</option>
                                    <option value="Countertop">Countertops</option>
                                    <option value="Hardware">Hardware</option>
                                    <option value="Appliance">Appliances</option>
                                    <option value="Accessory">Accessories</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-2 font-semibold text-zinc-700 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={inStockFilter} 
                                    onChange={e => setInStockFilter(e.target.checked)}
                                    className="accent-orange-600"
                                />
                                In Stock Only
                            </label>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
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

            {/* QUOTE DETAIL DRAWER */}
            {selectedQuote && (
                <div className="fixed inset-0 z-50 flex print:hidden animate-in fade-in duration-200">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedQuote(null)} />
                    <div className="relative ml-auto w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-350">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-gradient-to-r from-orange-600 to-amber-500">
                            <div>
                                <h2 className="text-lg font-bold text-white">Quote #{selectedQuote.quoteNumber || "—"}</h2>
                                <p className="text-orange-100 text-sm">{selectedQuote.clientName}</p>
                            </div>
                            <button onClick={() => setSelectedQuote(null)} className="text-white/80 hover:text-white text-2xl leading-none font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">&#215;</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Update status options */}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-2.5">Pipeline Stage</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {PIPELINE_STAGES.map(s => {
                                        const c = STATUS_CONFIG[s];
                                        const isActive = selectedQuote.status === s;
                                        return (
                                            <button 
                                                key={s} 
                                                onClick={() => updateQuoteStatusInDb(selectedQuote.id, s)}
                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${isActive ? `${c.bg} ${c.border} ${c.color} ring-2 ring-offset-1 ring-orange-500` : `${c.bg} ${c.border} ${c.color} opacity-60 hover:opacity-100`}`}
                                            >
                                                {s}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Client card */}
                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5"><User className="h-4 w-4 text-zinc-400" /> Client & Project Info</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><span className="text-zinc-400 text-xs">Name</span><p className="font-semibold text-zinc-900">{selectedQuote.clientName}</p></div>
                                    <div><span className="text-zinc-400 text-xs">Phone</span><p className="font-semibold text-zinc-900">{selectedQuote.clientPhone}</p></div>
                                    <div className="col-span-2"><span className="text-zinc-400 text-xs">Email</span><p className="font-semibold text-zinc-900">{selectedQuote.clientEmail}</p></div>
                                    <div className="col-span-2"><span className="text-zinc-400 text-xs">Project Address</span><p className="font-semibold text-zinc-900">{selectedQuote.projectAddress}</p></div>
                                    <div><span className="text-zinc-400 text-xs">Kitchen Style</span><p className="font-semibold text-zinc-900">{selectedQuote.style || "Custom"}</p></div>
                                    {selectedQuote.estimatedInstallDate && <div><span className="text-zinc-400 text-xs">Est. Install</span><p className="font-semibold text-zinc-900">{new Date(selectedQuote.estimatedInstallDate).toLocaleDateString()}</p></div>}
                                </div>
                            </div>

                            {/* Grouped Room Items */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-zinc-400" /> Grouped Specifications</h3>
                                {selectedQuote.items.length === 0 ? (
                                    <div className="text-center p-6 border border-dashed border-zinc-200 rounded-xl text-zinc-400 text-xs">No specifications added yet</div>
                                ) : (
                                    <div className="space-y-4">
                                        {AREA_OPTIONS.map(areaName => {
                                            const areaItems = selectedQuote.items.filter((item: any) => (item.area || "Kitchen") === areaName);
                                            if (areaItems.length === 0) return null;
                                            return (
                                                <div key={areaName} className="border border-zinc-200 rounded-xl p-4 bg-zinc-50/50 animate-in fade-in duration-200">
                                                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 mb-3 pb-1.5 border-b border-zinc-200 flex items-center justify-between">
                                                        <span>{areaName} Space</span>
                                                        <span className="text-[10px] text-zinc-400 font-bold">{areaItems.length} items</span>
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {areaItems.map((item: any) => (
                                                            <div key={item.id} className="flex items-start justify-between bg-white border border-zinc-150 rounded-lg px-3 py-2.5 gap-2 shadow-xs">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold text-zinc-900 text-xs truncate">{item.productName}</p>
                                                                    <p className="text-[10px] text-zinc-400 mt-0.5">
                                                                        <code className="bg-zinc-100 text-zinc-600 px-1 rounded font-mono text-[9px]">{item.sku}</code>
                                                                        {" · "}{item.quantity} {item.unit} x ${item.unitPrice.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                                <span className="font-black text-zinc-900 text-xs whitespace-nowrap">${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Financial totals */}
                            {selectedQuote.total > 0 && (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-1.5">
                                    <div className="flex justify-between text-xs text-zinc-600"><span>Subtotal</span><span>${selectedQuote.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    {selectedQuote.discount ? <div className="flex justify-between text-xs text-emerald-700 font-semibold"><span>Discount</span><span>-${selectedQuote.discount.toFixed(2)}</span></div> : null}
                                    <div className="flex justify-between text-xs text-zinc-600"><span>Installation</span><span>${selectedQuote.installationFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between text-xs text-zinc-600"><span>Tax (7%)</span><span>${selectedQuote.tax.toFixed(2)}</span></div>
                                    <div className="border-t border-orange-300 pt-2 flex justify-between font-black text-zinc-900 text-sm"><span>Total</span><span>${selectedQuote.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                </div>
                            )}

                            {/* Notes card */}
                            {selectedQuote.notes && (
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Special Notes</h3>
                                    <p className="text-xs text-zinc-600 bg-zinc-50 rounded-lg p-3 border border-zinc-200 leading-relaxed">{selectedQuote.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-zinc-200 flex gap-2">
                            <button 
                                onClick={() => handleDeleteQuote(selectedQuote.id)} 
                                className="px-3.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl flex items-center justify-center transition-colors"
                                title="Delete Quote"
                            >
                                <Trash className="h-4 w-4" />
                            </button>
                            <button 
                                onClick={() => {
                                    setEditingQuoteId(selectedQuote.id);
                                    setNewQuote({
                                        clientName: selectedQuote.clientName,
                                        clientEmail: selectedQuote.clientEmail || "",
                                        clientPhone: selectedQuote.clientPhone || "",
                                        projectAddress: selectedQuote.projectAddress || "",
                                        status: selectedQuote.status,
                                        style: selectedQuote.style || "",
                                        subtotal: selectedQuote.subtotal,
                                        tax: selectedQuote.tax,
                                        installationFee: selectedQuote.installationFee || 0,
                                        total: selectedQuote.total,
                                        notes: selectedQuote.notes || "",
                                        salesRep: selectedQuote.salesRep || "Adrian",
                                        discount: selectedQuote.discount || 0
                                    });
                                    setQuoteItems(selectedQuote.items.map((i: any) => ({
                                        id: i.id,
                                        productId: i.productId,
                                        productName: i.productName,
                                        sku: i.sku,
                                        quantity: i.quantity,
                                        unit: i.unit,
                                        unitPrice: i.unitPrice,
                                        totalPrice: i.totalPrice,
                                        area: i.area,
                                        notes: i.notes || ""
                                    })));
                                    setShowNewQuoteModal(true);
                                    setSelectedQuote(null);
                                }}
                                className="px-5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                                <Edit3 className="h-4 w-4" /> Edit Quote
                            </button>
                            <button 
                                onClick={() => window.print()} 
                                className="px-5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                                <Printer className="h-4 w-4" /> Print Presentation
                            </button>
                            <button 
                                onClick={() => setSelectedQuote(null)} 
                                className="flex-1 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* NEW QUOTE MODAL */}
            {showNewQuoteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => handleCloseModal()} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-in scale-in duration-300">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-gradient-to-r from-orange-600 to-amber-500 rounded-t-2xl">
                            <div>
                                <h2 className="text-lg font-bold text-white">{editingQuoteId ? "Modify Kitchen Quote" : "Create Kitchen Quote"}</h2>
                                <p className="text-orange-100 text-xs">{editingQuoteId ? "Modify client details and specifications" : "Fill in client details and manage specifications"}</p>
                            </div>
                            <button onClick={() => handleCloseModal()} className="text-white/80 hover:text-white text-2xl leading-none font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors">&#215;</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Client Information */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Client & Space Information</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">Client Name *</label>
                                        <input type="text" placeholder="Jane Smith" value={newQuote.clientName} onChange={e => setNewQuote(q => ({ ...q, clientName: e.target.value }))} className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">Phone</label>
                                        <input type="text" placeholder="(305) 555-0000" value={newQuote.clientPhone} onChange={e => setNewQuote(q => ({ ...q, clientPhone: e.target.value }))} className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">Email</label>
                                        <input type="email" placeholder="client@email.com" value={newQuote.clientEmail} onChange={e => setNewQuote(q => ({ ...q, clientEmail: e.target.value }))} className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">Kitchen Style</label>
                                        <input type="text" placeholder="Shaker Modern, Traditional..." value={newQuote.style} onChange={e => setNewQuote(q => ({ ...q, style: e.target.value }))} className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                    </div>
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">Project Address</label>
                                        <input type="text" placeholder="123 Main St, Miami FL 33101" value={newQuote.projectAddress} onChange={e => setNewQuote(q => ({ ...q, projectAddress: e.target.value }))} className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                    </div>
                                </div>
                            </div>

                            {/* Add Products bar */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Add Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-zinc-50 p-4 border border-zinc-200 rounded-xl">
                                    <div className="col-span-1">
                                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">Space Area</label>
                                        <select 
                                            value={selectedArea}
                                            onChange={e => setSelectedArea(e.target.value)}
                                            className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900 font-bold"
                                        >
                                            {AREA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 relative">
                                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">Catalog Product Search</label>
                                        <input 
                                            type="text" 
                                            placeholder="Search product name or SKU..." 
                                            value={productSearch}
                                            onChange={e => { setProductSearch(e.target.value); setSelectedProduct(null); }}
                                            className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900"
                                        />
                                        {productSearchResults.length > 0 && !selectedProduct && (
                                            <div className="absolute top-full left-0 right-0 bg-white border border-zinc-200 rounded-xl shadow-xl z-20 mt-1 overflow-hidden max-h-52 overflow-y-auto">
                                                {productSearchResults.map(p => (
                                                    <button key={p.id} type="button" onClick={() => { setSelectedProduct(p); setProductSearch(p.name); }} className="w-full text-left px-3 py-2.5 hover:bg-orange-50 transition-colors text-xs border-b border-zinc-100 last:border-0 flex justify-between items-center">
                                                        <div>
                                                            <span className="font-semibold text-zinc-900">{p.name}</span>
                                                            <span className="text-[10px] text-zinc-400 block font-mono mt-0.5">{p.sku}</span>
                                                        </div>
                                                        <span className="font-bold text-zinc-700 text-xs">${p.unitPrice.toFixed(2)}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-1 flex gap-2 items-end">
                                        <div className="w-20">
                                            <label className="text-[10px] font-bold text-zinc-500 block mb-1">Qty</label>
                                            <input type="number" min={1} value={itemQty} onChange={e => setItemQty(parseFloat(e.target.value) || 1)} className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900 text-center font-bold" />
                                        </div>
                                        <button type="button" onClick={addItemToQuote} disabled={!selectedProduct} className="bg-orange-600 text-white rounded-lg text-xs font-bold disabled:opacity-40 hover:bg-orange-700 transition-colors py-2 px-3 flex-1 h-[36px]">Add</button>
                                        <button type="button" onClick={addCustomLine} className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-lg text-xs font-bold py-2 px-2.5 h-[36px] flex items-center justify-center border border-zinc-200" title="Add Custom Material Line">+ Custom Line</button>
                                    </div>
                                </div>
                            </div>

                            {/* Editable Items Grid */}
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Specifications Grid (Double Click to edit SKU/Description)</h3>
                                {quoteItems.length === 0 ? (
                                    <div className="text-center p-8 border border-dashed border-zinc-200 rounded-xl text-zinc-400 text-xs">No line items added. Search the catalog or click "+ Custom Line" above.</div>
                                ) : (
                                    <div className="border border-zinc-250 rounded-xl overflow-hidden shadow-xs">
                                        <table className="w-full text-left text-xs bg-white">
                                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider font-semibold">
                                                <tr>
                                                    <th className="px-4 py-2.5">Area Space</th>
                                                    <th className="px-4 py-2.5">SKU / Code</th>
                                                    <th className="px-4 py-2.5">Description</th>
                                                    <th className="px-4 py-2.5 text-center" style={{ width: '75px' }}>Qty</th>
                                                    <th className="px-4 py-2.5 text-right" style={{ width: '105px' }}>Price</th>
                                                    <th className="px-4 py-2.5 text-right" style={{ width: '105px' }}>Total</th>
                                                    <th className="px-4 py-2.5 text-center" style={{ width: '40px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-100 animate-in fade-in duration-150">
                                                {quoteItems.map((item, index) => (
                                                    <tr key={item.id} className="hover:bg-zinc-50/50">
                                                        <td className="p-2" style={{ width: '130px' }}>
                                                            <select
                                                                value={item.area || "Kitchen"}
                                                                onChange={e => handleUpdateItemField(index, "area", e.target.value)}
                                                                className="w-full bg-white border border-zinc-200 rounded-md px-1.5 py-1 text-xs outline-none focus:ring-1 focus:ring-orange-400 text-zinc-800 font-bold"
                                                            >
                                                                {AREA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                                                            </select>
                                                        </td>
                                                        <td className="p-2" style={{ width: '140px' }}>
                                                            <input
                                                                type="text"
                                                                value={item.sku}
                                                                onChange={e => handleUpdateItemField(index, "sku", e.target.value)}
                                                                className="w-full border border-zinc-200 rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-orange-400 text-zinc-900 font-mono"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="text"
                                                                value={item.productName}
                                                                onChange={e => handleUpdateItemField(index, "productName", e.target.value)}
                                                                className="w-full border border-zinc-200 rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-orange-400 text-zinc-900"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={item.quantity}
                                                                onChange={e => handleUpdateItemField(index, "quantity", parseFloat(e.target.value) || 0)}
                                                                className="w-full border border-zinc-200 rounded-md px-1 py-1 text-xs outline-none focus:ring-1 focus:ring-orange-400 text-zinc-900 text-center font-bold"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                value={item.unitPrice}
                                                                onChange={e => handleUpdateItemField(index, "unitPrice", parseFloat(e.target.value) || 0)}
                                                                className="w-full border border-zinc-200 rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-orange-400 text-zinc-900 text-right font-black text-amber-900"
                                                            />
                                                        </td>
                                                        <td className="p-2 text-right text-zinc-900 font-black pr-4">
                                                            ${(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-2 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => removeQuoteItem(item.id)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <Trash className="h-3.5 w-3.5" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Additional Fees and Notes */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="col-span-1 space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">Installation Fee ($)</label>
                                        <input type="number" min={0} step={50} value={newQuote.installationFee} onChange={e => handleFeeChange(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-zinc-500 block mb-1">Discount ($)</label>
                                        <input type="number" min={0} step={50} value={newQuote.discount || 0} onChange={e => handleDiscountChange(parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900" />
                                    </div>
                                </div>
                                <div className="col-span-1 md:col-span-2">
                                    <label className="text-[10px] font-bold text-zinc-500 block mb-1">Estimate Description / Terms Notes</label>
                                    <textarea rows={4} placeholder="Add specific client preferences, terms, warranties..." value={newQuote.notes} onChange={e => setNewQuote(q => ({ ...q, notes: e.target.value }))} className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-400 text-zinc-900 resize-none h-[116px]" />
                                </div>
                            </div>

                            {/* Live calculations preview card */}
                            {newQuote.total > 0 && (
                                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-1.5 max-w-sm ml-auto">
                                    <div className="flex justify-between text-xs text-zinc-600"><span>Subtotal</span><span>${newQuote.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    {(newQuote.discount || 0) > 0 && <div className="flex justify-between text-xs text-emerald-700 font-semibold"><span>Discount</span><span>-${(newQuote.discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>}
                                    <div className="flex justify-between text-xs text-zinc-600"><span>Installation</span><span>${newQuote.installationFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    <div className="flex justify-between text-xs text-zinc-600"><span>Tax (7%)</span><span>${newQuote.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                    <div className="border-t border-orange-300 pt-2 flex justify-between font-black text-zinc-900 text-sm"><span>Grand Total</span><span>${newQuote.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                </div>
                            )}
                        </div>

                        <div className="p-5 border-t border-zinc-200 flex gap-3 rounded-b-2xl">
                            <button onClick={() => handleCloseModal()} className="flex-1 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors">Cancel</button>
                            <button id="btn-submit-kitchen-quote" onClick={submitNewQuote} disabled={!newQuote.clientName.trim()} className="flex-1 px-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white rounded-xl text-xs font-black shadow-md transition-all uppercase tracking-wider">
                                {editingQuoteId ? "Save Changes" : "Create Kitchen Quote"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HIGH-END PRINT-ONLY CLIENT ESTIMATE TEMPLATE */}
            {selectedQuote && (
                <div id="print-template" className="hidden print:block bg-white text-zinc-900 font-sans">
                    <div className="space-y-8">
                        {/* Print Header */}
                        <div className="flex justify-between items-start pb-6 border-b-2 border-orange-600">
                            <div className="flex flex-col">
                                <img src="/castile_logo_new.png" alt="Castile Logo" className="h-20 w-auto mb-3" />
                                <p className="text-xs text-zinc-500 uppercase tracking-widest font-black">Kitchen Design Studio</p>
                                <p className="text-sm text-zinc-500 mt-1">123 Design Blvd, Suite 100<br/>City, ST 12345</p>
                            </div>
                            <div className="text-right">
                                <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">Estimate</h1>
                                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                    <span className="text-zinc-500 font-semibold text-right">Date:</span>
                                    <span className="font-bold text-zinc-900">{new Date(selectedQuote.createdAt).toLocaleDateString()}</span>
                                    <span className="text-zinc-500 font-semibold text-right">Quote #:</span>
                                    <span className="font-bold text-zinc-900">{selectedQuote.quoteNumber || "—"}</span>
                                    <span className="text-zinc-500 font-semibold text-right">Valid For:</span>
                                    <span className="font-bold text-zinc-900">30 Days</span>
                                </div>
                            </div>
                        </div>

                        {/* Client details & project info */}
                        <div className="grid grid-cols-2 gap-8 text-sm break-inside-avoid">
                            <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200">
                                <h3 className="font-bold text-orange-700 uppercase tracking-widest mb-3 text-xs border-b border-orange-200 pb-2">Billed To</h3>
                                <p className="font-black text-zinc-900 text-base mb-1">{selectedQuote.clientName}</p>
                                {selectedQuote.clientPhone && <p className="text-zinc-700">{selectedQuote.clientPhone}</p>}
                                {selectedQuote.clientEmail && <p className="text-zinc-700">{selectedQuote.clientEmail}</p>}
                            </div>
                            <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200">
                                <h3 className="font-bold text-orange-700 uppercase tracking-widest mb-3 text-xs border-b border-orange-200 pb-2">Project Details</h3>
                                <p className="font-semibold text-zinc-900 mb-1">{selectedQuote.projectAddress}</p>
                                {selectedQuote.style && <p className="text-zinc-700">Style: <span className="font-semibold">{selectedQuote.style}</span></p>}
                                <p className="text-zinc-700 mt-0.5">Sales Rep: <span className="font-semibold">{selectedQuote.salesRep || "Adrian"}</span></p>
                            </div>
                        </div>

                        {/* Line items grouped room by room */}
                        <div className="space-y-8">
                            {AREA_OPTIONS.map(areaName => {
                                const areaItems = selectedQuote.items.filter((item: any) => (item.area || "Kitchen") === areaName);
                                if (areaItems.length === 0) return null;
                                return (
                                    <div key={areaName} className="space-y-3 break-inside-avoid">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-white bg-zinc-800 px-4 py-2 rounded-t-lg">
                                            {areaName}
                                        </h3>
                                        <table className="w-full text-left text-sm border-x border-b border-zinc-200 rounded-b-lg overflow-hidden">
                                            <thead className="bg-zinc-100">
                                                <tr className="text-zinc-500 font-bold">
                                                    <th className="py-3 px-4 w-28 uppercase text-xs tracking-wider">SKU</th>
                                                    <th className="py-3 px-4 uppercase text-xs tracking-wider">Description</th>
                                                    <th className="py-3 px-4 text-center w-16 uppercase text-xs tracking-wider">Qty</th>
                                                    <th className="py-3 px-4 text-right w-28 uppercase text-xs tracking-wider">Price</th>
                                                    <th className="py-3 px-4 text-right w-32 uppercase text-xs tracking-wider">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-zinc-200 bg-white">
                                                {areaItems.map((item: any) => (
                                                    <tr key={item.id} className="text-zinc-900 break-inside-avoid">
                                                        <td className="py-3 px-4 font-mono text-xs text-zinc-500">{item.sku}</td>
                                                        <td className="py-3 px-4 font-semibold">{item.productName}</td>
                                                        <td className="py-3 px-4 text-center">{item.quantity}</td>
                                                        <td className="py-3 px-4 text-right">${item.unitPrice.toFixed(2)}</td>
                                                        <td className="py-3 px-4 text-right font-black">${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Notes block in print layout */}
                        {selectedQuote.notes && (
                            <div className="border border-amber-200 bg-amber-50 rounded-xl p-5 text-sm text-zinc-900 break-inside-avoid">
                                <h4 className="font-bold uppercase tracking-widest text-amber-800 mb-2 text-xs">Special Notes & Specifications</h4>
                                <p className="whitespace-pre-line leading-relaxed font-medium">{selectedQuote.notes}</p>
                            </div>
                        )}

                        {/* Estimate Financial summary */}
                        <div className="flex justify-between items-start gap-12 mt-8 break-inside-avoid">
                            <div className="flex-1 text-xs text-zinc-500 leading-relaxed pr-8">
                                <h4 className="font-bold uppercase tracking-widest mb-3 text-zinc-700">Terms & Conditions</h4>
                                <ol className="list-decimal list-inside space-y-1.5">
                                    <li>This estimate is valid for 30 days from the date of issuance.</li>
                                    <li>Custom cabinetry and countertop materials require a 50% deposit before production begins.</li>
                                    <li>Installation fees are estimates and subject to change based on final on-site measurements and conditions.</li>
                                    <li>Balance is due upon completion of installation.</li>
                                </ol>
                            </div>
                            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 space-y-3 w-80 shrink-0 text-sm text-zinc-700">
                                <div className="flex justify-between"><span>Subtotal</span><span className="font-semibold">${selectedQuote.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                {selectedQuote.discount ? <div className="flex justify-between text-emerald-600 font-bold"><span>Discount</span><span>-${selectedQuote.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div> : null}
                                <div className="flex justify-between"><span>Installation Fee</span><span className="font-semibold">${selectedQuote.installationFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                <div className="flex justify-between"><span>Tax (7%)</span><span className="font-semibold">${selectedQuote.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                <div className="border-t border-zinc-300 pt-3 flex justify-between items-center font-black text-zinc-900 text-lg"><span>Total</span><span>${selectedQuote.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                            </div>
                        </div>
                        
                        {/* Signature Block */}
                        <div className="mt-16 pt-8 border-t border-zinc-200 flex justify-between gap-12 break-inside-avoid">
                            <div className="flex-1">
                                <div className="border-b border-zinc-400 h-8 mb-2"></div>
                                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">Accepted By (Client Signature)</p>
                            </div>
                            <div className="w-48">
                                <div className="border-b border-zinc-400 h-8 mb-2"></div>
                                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest text-center">Date</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Print Styles Injection */}
            <style jsx global>{`
                @media print {
                    @page {
                        size: auto;
                        margin: 0mm;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        margin: 15mm !important;
                    }
                    header, aside, main > header, main > div > .print\:hidden, .print\:hidden, #active-drawer {
                        display: none !important;
                    }
                    main, .max-w-\[1400px\] {
                        max-width: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        overflow: visible !important;
                        height: auto !important;
                        min-height: 0 !important;
                    }
                    #print-template {
                        display: block !important;
                        visibility: visible !important;
                        position: static !important;
                        width: 100% !important;
                    }
                    .break-inside-avoid {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
}
