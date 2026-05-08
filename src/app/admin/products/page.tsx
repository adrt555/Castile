"use client";
import { useState, useEffect } from "react";
import { getProducts } from "@/app/actions/productActions";
import { CRMProduct } from "@/lib/types";

export default function CatalogManager() {
    const [products, setProducts] = useState<CRMProduct[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [collectionFilter, setCollectionFilter] = useState("ALL");

    useEffect(() => {
        getProducts().then(data => setProducts(data as any));
    }, []);

    const collections = ["ALL", ...Array.from(new Set(products.map(p => p.collection))).sort()];

    const filtered = products.filter(p => {
        const q = searchTerm.trim().toLowerCase();
        if (!q && collectionFilter === "ALL") return true;

        const matchSearch = !q || (
            p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.collection.toLowerCase().includes(q) ||
            p.size.toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q)
        );

        // When actively searching by text, ignore the collection filter so results aren't hidden
        const matchCollection = q
            ? true
            : (collectionFilter === "ALL" || p.collection === collectionFilter);

        return matchSearch && matchCollection;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-end px-1 sm:px-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Product Catalog</h1>
                    <p className="text-zinc-500 mt-1 text-xs sm:text-sm">
                        {products.length.toLocaleString()} SKUs from the ROCA 2026 Price Book
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm mx-1 sm:mx-0">
                <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="relative flex-1 min-w-[240px] max-w-sm">
                        <input
                            type="text"
                            placeholder="Search SKU, description, collection…"
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
                        {collections.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <span className="text-sm font-medium text-zinc-500 sm:ml-auto">
                        {filtered.length.toLocaleString()} results
                        {searchTerm && <span className="text-amber-600 ml-1">(all collections)</span>}
                    </span>
                </div>

                <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                    <table className="w-full text-left text-sm text-zinc-600">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-xs sticky top-0">
                            <tr>
                                <th className="px-5 py-3 font-semibold">SKU</th>
                                <th className="px-5 py-3 font-semibold">Description</th>
                                <th className="px-5 py-3 font-semibold">Collection</th>
                                <th className="px-5 py-3 font-semibold">Size</th>
                                <th className="px-5 py-3 font-semibold whitespace-nowrap">Sqft / Box</th>
                                <th className="px-5 py-3 font-semibold whitespace-nowrap">Cost / Sqft</th>
                                <th className="px-5 py-3 font-semibold whitespace-nowrap">Retail / Sqft</th>
                                <th className="px-5 py-3 font-semibold whitespace-nowrap">Margin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filtered.map(product => {
                                const cost = product.costPricePerSqft || 0;
                                const retail = product.sellingPricePerSqft || 0;
                                const margin = cost > 0 ? ((retail - cost) / cost) * 100 : 0;
                                return (
                                    <tr key={product.id} className="hover:bg-zinc-50/60 transition-colors">
                                        <td className="px-5 py-3">
                                            <span className="font-mono text-xs bg-zinc-100 text-zinc-700 px-2 py-1 rounded font-bold tracking-wide whitespace-nowrap">
                                                {product.sku || "—"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-zinc-900 font-medium max-w-xs truncate" title={product.name}>
                                            {product.name || "—"}
                                        </td>
                                        <td className="px-5 py-3 whitespace-nowrap">
                                            {product.collection ? (
                                                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                                    {product.collection}
                                                </span>
                                            ) : "—"}
                                        </td>
                                        <td className="px-5 py-3 text-xs text-zinc-500 font-medium whitespace-nowrap">
                                            {product.size || "—"}
                                        </td>
                                        <td className="px-5 py-3 text-xs font-semibold text-zinc-700 whitespace-nowrap">
                                            {product.sqftPerBox > 0 ? `${product.sqftPerBox} sf` : "—"}
                                        </td>
                                        <td className="px-5 py-3 text-red-600 font-medium whitespace-nowrap">
                                            {cost > 0 ? `$${cost.toFixed(2)}` : "—"}
                                        </td>
                                        <td className="px-5 py-3 text-zinc-900 font-bold whitespace-nowrap">
                                            {retail > 0 ? `$${retail.toFixed(2)}` : "—"}
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
            </div>
        </div>
    );
}
