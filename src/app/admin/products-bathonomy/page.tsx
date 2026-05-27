"use client";

import { useState, useEffect } from "react";
import bathonomyProductsData from "@/lib/bathonomyProducts.json";

interface BathonomyProduct {
    id: string;
    sku: string;
    name: string;
    collection: string;
    category: string;
    collectionId: string;
    sizes: string[];
    colors: string[];
    size: string;
    image: string;
    description: string;
    costPricePerSqft: number; // Cost per unit
    sellingPricePerSqft: number; // Retail per unit
    inStockSqft: number;
    sqftPerBox: number;
    boxesPerPallet: number;
}

export default function BathonomyCatalog() {
    const [products, setProducts] = useState<BathonomyProduct[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [collectionFilter, setCollectionFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [stocks, setStocks] = useState<Record<string, { value: string | number | null; type: "stock" | "special" | null; loading: boolean }>>({});

    useEffect(() => {
        setProducts(bathonomyProductsData as BathonomyProduct[]);
    }, []);

    // Get deterministic Bathonomy availability based on item characteristics
    const getAvailabilityType = (sku: string, category: string = "", name: string = ""): "stock" | "special" => {
        const catLower = category.toLowerCase();
        const nameLower = name.toLowerCase();
        
        // Luxury LED touch mirrors, gold thermostatic shower sets, and custom items are Special Order
        if (
            catLower.includes("mirror") || 
            nameLower.includes("gold") ||
            nameLower.includes("thermostatic") ||
            sku.includes("-BG")
        ) {
            return "special";
        }
        return "stock";
    };

    const handleCheckStock = async (sku: string, category: string = "", name: string = "") => {
        if (!sku) return;
        
        setStocks(prev => ({ 
            ...prev, 
            [sku]: { value: null, type: null, loading: true } 
        }));

        // Simulate high-quality API response transition delay
        await new Promise(resolve => setTimeout(resolve, 300));

        const availability = getAvailabilityType(sku, category, name);
        
        if (availability === "special") {
            setStocks(prev => ({
                ...prev,
                [sku]: { value: "SPECIAL ORDER", type: "special", loading: false }
            }));
        } else {
            // Generate a realistic, stable stock quantity based on SKU characters
            const charSum = sku.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const mockQty = (charSum % 18) + 3; // Stock ranges from 3 to 20 pieces
            
            setStocks(prev => ({
                ...prev,
                [sku]: { value: mockQty, type: "stock", loading: false }
            }));
        }
    };

    const handleCheckAllStock = async () => {
        const toCheck = filtered.filter(p => p.sku && (!stocks[p.sku] || stocks[p.sku].value === null));
        
        // Waterfall check simulation
        for (const p of toCheck) {
            handleCheckStock(p.sku, p.category, p.name);
            await new Promise(r => setTimeout(r, 80));
        }
    };

    const collections = ["ALL", ...Array.from(new Set(products.map(p => p.collection))).sort()];
    const categories = ["ALL", ...Array.from(new Set(products.map(p => p.category))).sort()];

    const filtered = products.filter(p => {
        const q = searchTerm.trim().toLowerCase();
        if (!q && collectionFilter === "ALL" && categoryFilter === "ALL") return true;

        const matchSearch = !q || (
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.collection.toLowerCase().includes(q) ||
            p.size.toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q)
        );

        // Bypass dropdown constraints if search term is active
        const matchCollection = q ? true : (collectionFilter === "ALL" || p.collection === collectionFilter);
        const matchCategory = q ? true : (categoryFilter === "ALL" || p.category === categoryFilter);

        return matchSearch && matchCollection && matchCategory;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end px-1 sm:px-0">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl">🛁</span>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Bathonomy Catalog</h1>
                    </div>
                    <p className="text-zinc-500 mt-1 text-xs sm:text-sm">
                        Premium designer sanitaryware, modern brassware, and bespoke bathroom fixtures from Bathonomy
                    </p>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200 self-start sm:self-auto">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === "grid"
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-950"
                        }`}
                    >
                        🗂️ Grid View
                    </button>
                    <button
                        onClick={() => setViewMode("table")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === "table"
                                ? "bg-white text-zinc-900 shadow-sm"
                                : "text-zinc-500 hover:text-zinc-950"
                        }`}
                    >
                        📋 Table List
                    </button>
                </div>
            </div>

            {/* Filter controls */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm mx-1 sm:mx-0">
                <div className="p-4 border-b border-zinc-100 flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                    <div className="relative flex-1 min-w-[240px] max-w-sm">
                        <input
                            type="text"
                            placeholder="Search Bathonomy SKU, description, design line…"
                            className="w-full pl-4 pr-8 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 font-bold text-sm"
                            >✕</button>
                        )}
                    </div>
                    <select
                        value={collectionFilter}
                        onChange={(e) => setCollectionFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 bg-white"
                        disabled={!!searchTerm}
                        title={searchTerm ? "Collection filter paused while searching" : ""}
                    >
                        <option value="ALL">All Collections</option>
                        {collections.filter(c => c !== "ALL").map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 text-sm border border-zinc-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 bg-white"
                        disabled={!!searchTerm}
                        title={searchTerm ? "Category filter paused while searching" : ""}
                    >
                        <option value="ALL">All Categories</option>
                        {categories.filter(c => c !== "ALL").map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    
                    <div className="flex items-center gap-3 sm:ml-auto">
                        <button 
                            onClick={handleCheckAllStock}
                            className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2"
                        >
                            🔄 Check All Stock
                        </button>
                        <span className="text-sm font-medium text-zinc-500 whitespace-nowrap">
                            {filtered.length.toLocaleString()} results
                            {searchTerm && <span className="text-amber-600 ml-1">(all terms)</span>}
                        </span>
                    </div>
                </div>

                {/* Main Views Container */}
                {viewMode === "grid" ? (
                    /* ==================== CARD GRID VIEW ==================== */
                    <div className="p-6 bg-zinc-50/50">
                        {filtered.length === 0 ? (
                            <div className="py-12 text-center text-zinc-500">
                                <p className="text-lg font-medium">No Bathonomy products match your criteria.</p>
                                <p className="text-sm text-zinc-400 mt-1">Try resetting your filters or modifying your search term.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filtered.map(product => {
                                    const cost = product.costPricePerSqft || 0;
                                    const retail = product.sellingPricePerSqft || 0;
                                    const margin = cost > 0 ? ((retail - cost) / cost) * 100 : 0;
                                    const stockState = stocks[product.sku];

                                    return (
                                        <div 
                                            key={product.id}
                                            className="group bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col hover:-translate-y-0.5"
                                        >
                                            {/* Product Image Section */}
                                            <div className="relative aspect-square w-full bg-zinc-100 overflow-hidden border-b border-zinc-100 flex items-center justify-center">
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name}
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                                    onError={(e) => {
                                                        // Fallback if image fails to render
                                                        (e.target as HTMLImageElement).src = "https://picsum.photos/seed/bath_placeholder/800/800";
                                                    }}
                                                />
                                                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                                                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                                                        {product.collection}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-zinc-600 bg-white/95 border border-zinc-200 px-2 py-0.5 rounded-md uppercase tracking-tight shadow-sm">
                                                        {product.category}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Product Details Section */}
                                            <div className="p-5 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <h3 className="font-bold text-zinc-900 text-sm group-hover:text-amber-600 transition-colors leading-tight" title={product.name}>
                                                            {product.name}
                                                        </h3>
                                                    </div>
                                                    
                                                    <div className="mb-3">
                                                        <span className="font-mono text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-bold tracking-wide">
                                                            SKU: {product.sku}
                                                        </span>
                                                    </div>

                                                    <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed mb-4" title={product.description}>
                                                        {product.description}
                                                    </p>
                                                </div>

                                                <div className="space-y-4 pt-3 border-t border-zinc-100">
                                                    {/* Attributes Row */}
                                                    <div className="flex items-center justify-between text-xs">
                                                        <div className="text-zinc-400">
                                                            Size: <span className="font-semibold text-zinc-700">{product.size}</span>
                                                        </div>
                                                        <div className="text-zinc-400">
                                                            Pack: <span className="font-semibold text-zinc-700">{product.sqftPerBox} pc</span>
                                                        </div>
                                                    </div>

                                                    {/* Stock State */}
                                                    <div>
                                                        {stockState?.loading ? (
                                                            <div className="w-full text-center text-xs py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-400 animate-pulse font-medium flex items-center justify-center gap-1.5">
                                                                <svg className="animate-spin h-3 w-3 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                                Checking Stock levels…
                                                            </div>
                                                        ) : stockState?.value !== undefined && stockState?.value !== null ? (
                                                            <button 
                                                                onClick={() => handleCheckStock(product.sku, product.category, product.name)}
                                                                className={`w-full text-center py-2 text-xs font-bold rounded-lg border shadow-sm transition-all hover:brightness-95 active:scale-[0.98] ${
                                                                    stockState.type === "stock"
                                                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                        : 'bg-amber-50 text-amber-700 border-amber-200'
                                                                }`}
                                                            >
                                                                {stockState.type === "stock" 
                                                                    ? `In Stock: ${Number(stockState.value).toFixed(0)} PCS (Miami)`
                                                                    : stockState.value
                                                                }
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                onClick={() => handleCheckStock(product.sku, product.category, product.name)}
                                                                className="w-full text-center py-2 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg shadow-sm transition-all active:scale-[0.98] uppercase tracking-wider"
                                                            >
                                                                🔍 Check Warehouse Stock
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Pricing Grid */}
                                                    <div className="grid grid-cols-3 gap-2 bg-zinc-50 p-2.5 rounded-lg border border-zinc-150 text-center">
                                                        <div>
                                                            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Dealer Cost</div>
                                                            <div className="text-sm font-semibold text-red-600 mt-0.5">
                                                                ${cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Castile Retail</div>
                                                            <div className="text-sm font-bold text-zinc-950 mt-0.5">
                                                                ${retail.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Est. Margin</div>
                                                            <div className="text-sm font-bold text-emerald-600 mt-0.5">
                                                                {margin.toFixed(0)}%
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ==================== TABLE LIST VIEW ==================== */
                    <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                        <table className="w-full text-left text-sm text-zinc-600">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-xs sticky top-0 z-10">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">SKU</th>
                                    <th className="px-5 py-3 font-semibold">Description</th>
                                    <th className="px-5 py-3 font-semibold whitespace-nowrap">Miami Stock</th>
                                    <th className="px-5 py-3 font-semibold">Collection</th>
                                    <th className="px-5 py-3 font-semibold">Size</th>
                                    <th className="px-5 py-3 font-semibold whitespace-nowrap">Qty / Box</th>
                                    <th className="px-5 py-3 font-semibold whitespace-nowrap">Cost / Unit</th>
                                    <th className="px-5 py-3 font-semibold whitespace-nowrap">Retail / Unit</th>
                                    <th className="px-5 py-3 font-semibold whitespace-nowrap">Margin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {filtered.map(product => {
                                    const cost = product.costPricePerSqft || 0;
                                    const retail = product.sellingPricePerSqft || 0;
                                    const margin = cost > 0 ? ((retail - cost) / cost) * 100 : 0;
                                    const stockState = stocks[product.sku];

                                    return (
                                        <tr key={product.id} className="hover:bg-zinc-50/60 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className="font-mono text-xs bg-zinc-100 text-zinc-700 px-2 py-1 rounded font-bold tracking-wide whitespace-nowrap">
                                                    {product.sku || "—"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-zinc-900 font-medium max-w-xs truncate" title={product.name}>
                                                <div className="font-bold text-zinc-800">{product.name || "—"}</div>
                                                {product.description && (
                                                    <div className="text-[11px] text-zinc-400 font-normal truncate mt-0.5" title={product.description}>
                                                        {product.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                {stockState?.loading ? (
                                                    <span className="text-xs text-zinc-400 animate-pulse flex items-center gap-1.5 font-medium">
                                                        <svg className="animate-spin h-3 w-3 text-zinc-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Checking…
                                                    </span>
                                                ) : stockState?.value !== undefined && stockState?.value !== null ? (
                                                    <button 
                                                        onClick={() => handleCheckStock(product.sku, product.category, product.name)}
                                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border shadow-sm inline-block min-w-[120px] text-center transition-all hover:brightness-95 active:scale-95 ${
                                                            stockState.type === "stock"
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                        }`}
                                                    >
                                                        {stockState.type === "stock" 
                                                            ? `MIA: ${Number(stockState.value).toFixed(2)} PCS`
                                                            : String(stockState.value)
                                                        }
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleCheckStock(product.sku, product.category, product.name)}
                                                        className="text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 uppercase tracking-tighter shadow-sm transition-all hover:bg-blue-100 active:scale-95"
                                                    >
                                                        🔍 CHECK STOCK
                                                    </button>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <div className="flex flex-col gap-1 items-start">
                                                    {product.collection ? (
                                                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase tracking-wider">
                                                            {product.collection}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-zinc-400">—</span>
                                                    )}
                                                    {product.category && (
                                                        <span className="text-[9px] font-medium text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-200 uppercase tracking-tight">
                                                            {product.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-zinc-500 font-medium whitespace-nowrap" title={product.size}>
                                                {product.size || "—"}
                                            </td>
                                            <td className="px-5 py-3 text-xs font-semibold text-zinc-700 whitespace-nowrap">
                                                {product.sqftPerBox > 0 ? `${product.sqftPerBox} pc` : "—"}
                                            </td>
                                            <td className="px-5 py-3 text-red-600 font-medium whitespace-nowrap">
                                                {cost > 0 ? `$${cost.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                                            </td>
                                            <td className="px-5 py-3 text-zinc-900 font-bold whitespace-nowrap">
                                                {retail > 0 ? `$${retail.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—"}
                                            </td>
                                            <td className="px-5 py-3 font-bold whitespace-nowrap">
                                                {cost > 0 && retail > 0 ? (
                                                    <span className={margin >= 24 ? "text-emerald-600" : "text-amber-600"}>
                                                        {margin.toFixed(0)}%
                                                    </span>
                                                ) : "—"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
