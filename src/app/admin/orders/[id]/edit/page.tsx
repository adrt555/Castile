"use client";

import { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClients } from "@/app/actions/clientActions";
import { getProducts } from "@/app/actions/productActions";
import { getOrderById, updateOrder } from "@/app/actions/orderActions";
import { Client, CRMProduct } from "@/lib/types";

export default function EditOrderPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [clients, setClients] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [existingOrder, setExistingOrder] = useState<any>(null);

    // State
    const [editableItems, setEditableItems] = useState<Array<{ 
        id: string, 
        productId: string, 
        sku: string, 
        productName: string, 
        colorName: string, 
        size: string, 
        sqftPerBox: number, 
        boxesPerPallet: number, 
        quantitySqft: number, 
        unitPrice: number, 
        totalPrice: number, 
        discount: string, 
        discountType: '$' | '%',
        room: string,
        unit: 'sqft' | 'PC'
    }>>([]);
    const [discount, setDiscount] = useState<string>("0");
    const [globalDiscountType, setGlobalDiscountType] = useState<'$' | '%'>('$');
    const [freight, setFreight] = useState<string>("0");
    const [shippingAddress, setShippingAddress] = useState<string>("");
    const [billingAddress, setBillingAddress] = useState<string>("");
    const [skuSearchMap, setSkuSearchMap] = useState<Record<string, { query: string, open: boolean }>>({});

    // Fetch lookups
    useEffect(() => {
        Promise.all([getClients(), getProducts(), getOrderById(id)]).then(([c, p, o]) => {
            setClients(c);
            setProducts(p);
            setExistingOrder(o);
        });
    }, [id]);

    // Populate existing order data
    useEffect(() => {
        if (existingOrder && products.length > 0) {
            setSelectedClientId(existingOrder.clientId);
            const client = clients.find(c => c.id === existingOrder.clientId);
            if (client) {
                setClientSearch(`${client.name} - ${client.company}`);
            }
            setDiscount(existingOrder.discount?.toString() || "0");
            setFreight(existingOrder.freight?.toString() || "0");
            setShippingAddress(existingOrder.shippingAddress || "");
            setBillingAddress(existingOrder.billingAddress || "");

            if (existingOrder.items && existingOrder.items.length > 0) {
                const mappedItems = existingOrder.items.map((item: any) => {
                    const p = products.find(p => p.id === item.productId);
                    return {
                        id: Math.random().toString(36).substr(2, 9),
                        productId: item.productId,
                        sku: p?.sku || item.productName,
                        productName: item.productName,
                        colorName: item.colorName,
                        size: item.size,
                        sqftPerBox: p?.sqftPerBox || 0,
                        boxesPerPallet: p?.boxesPerPallet || 0,
                        quantitySqft: item.quantitySqft,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        discount: "0",
                        discountType: '$',
                        room: item.room || 'General',
                        unit: item.unit || 'sqft'
                    };
                });
                setEditableItems(mappedItems);
            }
        }
    }, [existingOrder?.id, products]);

    const [itemStocks, setItemStocks] = useState<Record<string, { value: number | null, loading: boolean }>>({});
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [clientSearch, setClientSearch] = useState("");
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

    const handleAddEItem = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        setEditableItems([...editableItems, {
            id: newId,
            productId: '',
            sku: '',
            productName: '',
            colorName: '',
            size: '',
            sqftPerBox: 0,
            boxesPerPallet: 0,
            quantitySqft: 0,
            unitPrice: 0,
            totalPrice: 0,
            discount: "0",
            discountType: '$',
            room: 'General',
            unit: 'sqft'
        }]);
        setSkuSearchMap(prev => ({ ...prev, [newId]: { query: '', open: false } }));
    };

    const handleRemoveEItem = (id: string) => {
        setEditableItems(editableItems.filter(i => i.id !== id));
    };

    const handleEItemChange = (id: string, field: string, value: any) => {
        setEditableItems(prev => prev.map(item => {
            if (item.id !== id) return item;
            const updated = { ...item, [field]: value };

            if (field === 'productId') {
                const p = products.find(p => p.id === value);
                if (p) {
                    updated.productName = p.name;
                    updated.sku = p.sku;
                    updated.colorName = p.collection || 'Base';
                    updated.size = p.size || 'Standard';
                    updated.sqftPerBox = p.sqftPerBox || 0;
                    updated.boxesPerPallet = p.boxesPerPallet || 0;
                    updated.unitPrice = p.sellingPricePerSqft || 0;
                }
            }

            const gross = updated.unit === 'PC' 
                ? (updated.quantitySqft || 0) * (updated.unitPrice || 0)
                : (updated.quantitySqft || 0) * (updated.unitPrice || 0);

            const discAmt = updated.discountType === '%' ? gross * ((parseFloat(updated.discount) || 0) / 100) : (parseFloat(updated.discount) || 0);
            updated.totalPrice = Math.max(0, gross - discAmt);
            return updated;
        }));
    };

    const handleCheckItemStock = async (itemId: string, sku: string) => {
        if (!sku) return;
        setItemStocks(prev => ({ ...prev, [itemId]: { value: null, loading: true } }));
        try {
            const { checkRocaStock } = await import("@/app/actions/productActions");
            const stock = await checkRocaStock(sku);
            setItemStocks(prev => ({ ...prev, [itemId]: { value: stock, loading: false } }));
        } catch (e) {
            setItemStocks(prev => ({ ...prev, [itemId]: { value: null, loading: false } }));
        }
    };

    // Calculate Totals
    const eSubtotal = editableItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const parsedDiscountInput = parseFloat(discount) || 0;
    const parsedDiscount = globalDiscountType === '%' ? eSubtotal * (parsedDiscountInput / 100) : parsedDiscountInput;
    const parsedFreight = parseFloat(freight) || 0;
    const discountedSubtotal = Math.max(0, eSubtotal - parsedDiscount);
    const tax = discountedSubtotal * 0.07;
    const total = discountedSubtotal + tax + parsedFreight;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedClientId) return alert("Please select a client.");
        if (editableItems.length === 0) return alert("Please add at least one valid product.");

        // Update the Mock DB
        await updateOrder(id, {
            clientId: selectedClientId,
            items: editableItems.map(i => ({
                productId: i.productId,
                productName: i.productName,
                colorName: i.colorName,
                size: i.size,
                quantitySqft: i.quantitySqft,
                unitPrice: i.unitPrice,
                totalPrice: i.totalPrice,
                room: i.room,
                unit: i.unit
            })),
            subtotal: eSubtotal,
            discount: parsedDiscount > 0 ? parsedDiscount : 0,
            freight: parsedFreight > 0 ? parsedFreight : 0,
            tax,
            total,
            shippingAddress,
            billingAddress
        });

        // Navigate back to pipeline
        router.push("/admin/orders");
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/admin/orders" className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-500">
                    &larr;
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Edit Quote <span className="text-amber-500">Order : {existingOrder?.orderNumber?.toString().padStart(4, '0') || id.slice(0, 8)}</span></h1>

                    <p className="text-zinc-500 mt-1">Modify the client, line items, and discounts before marking as Paid.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">

                {/* 1. Client Details Section */}
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200">
                        <h2 className="text-lg font-bold text-zinc-900">1. Client Details</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="relative">
                            <label className="block text-sm font-semibold text-zinc-700 mb-2">Search Client</label>
                            <input
                                type="text"
                                value={clientSearch}
                                onChange={(e) => {
                                    setClientSearch(e.target.value);
                                    setIsClientDropdownOpen(true);
                                    if (selectedClientId) setSelectedClientId(""); // Reset if they alter the name
                                }}
                                onFocus={() => setIsClientDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setIsClientDropdownOpen(false), 200)} // Delay to allow click
                                placeholder="Search by name, company, or email..."
                                className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none"
                                required={!selectedClientId}
                            />
                            {isClientDropdownOpen && (
                                <ul className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-xl max-h-60 overflow-auto divide-y divide-zinc-100">
                                    {clients.filter(c =>
                                        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                        c.company.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                        c.email.toLowerCase().includes(clientSearch.toLowerCase())
                                    ).length > 0 ? (
                                        clients.filter(c =>
                                            c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                            c.company.toLowerCase().includes(clientSearch.toLowerCase()) ||
                                            c.email.toLowerCase().includes(clientSearch.toLowerCase())
                                        ).map(client => (
                                            <li
                                                key={client.id}
                                                onClick={() => {
                                                    setSelectedClientId(client.id);
                                                    setClientSearch(`${client.name} - ${client.company}`);
                                                    setIsClientDropdownOpen(false);
                                                    setShippingAddress(client.address || "");
                                                    setBillingAddress(client.billingAddress || client.address || "");
                                                }}
                                                className="px-4 py-3 hover:bg-zinc-50 cursor-pointer transition-colors"
                                            >
                                                <div className="font-semibold text-zinc-900">{client.name}</div>
                                                <div className="text-xs text-zinc-500 mt-1">{client.company} ({client.email})</div>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-4 py-3 text-sm text-zinc-500">No clients found matching "{clientSearch}"</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 mb-2">Shipping Address</label>
                                <textarea
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none min-h-[100px]"
                                    placeholder="Enter shipping address or 'Will Call'..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-zinc-700 mb-2">Billing Address</label>
                                <textarea
                                    value={billingAddress}
                                    onChange={(e) => setBillingAddress(e.target.value)}
                                    className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none min-h-[100px]"
                                    placeholder="Enter billing address..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Line Items Section */}
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-zinc-900">2. Products & Quantities</h2>
                        <button
                            type="button"
                            onClick={handleAddEItem}
                            className="text-sm font-bold text-amber-600 hover:text-amber-700"
                        >
                            + Add Line Item
                        </button>
                    </div>
                    
                    <div className="p-6 space-y-8">
                        {/* Group items by Room */}
                        {Array.from(new Set(editableItems.map(i => i.room))).map((roomName) => (
                            <div key={roomName} className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-zinc-200"></div>
                                    <div className="bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Room: {roomName}</span>
                                    </div>
                                    <div className="h-px flex-1 bg-zinc-200"></div>
                                </div>
                                
                                {editableItems.filter(i => i.room === roomName).map((item) => (
                                    <div key={item.id} className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex flex-nowrap gap-3 items-start relative group">
                                        {/* Product selector — split SKU / Description */}
                                        <div className="flex-1 min-w-[300px]">
                                            <div className="flex gap-2 mb-1.5">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-400 mb-1">Room/Area</label>
                                                    <select 
                                                        value={item.room}
                                                        onChange={(e) => handleEItemChange(item.id, 'room', e.target.value)}
                                                        className="w-full bg-white border border-zinc-200 text-zinc-900 text-[11px] font-bold rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-amber-500"
                                                    >
                                                        <option value="General">Select Area...</option>
                                                        <option value="main floor">main floor</option>
                                                        <option value="Bathroom">Bathroom</option>
                                                        <option value="Powder">Powder</option>
                                                        <option value="Laundry">Laundry</option>
                                                        <option value="Cabana">Cabana</option>
                                                        <option value="Other">Other...</option>
                                                    </select>
                                                    {item.room === 'Other' && (
                                                        <input 
                                                            type="text"
                                                            onChange={(e) => handleEItemChange(item.id, 'room', e.target.value)}
                                                            className="mt-1 w-full bg-white border border-zinc-200 text-zinc-900 text-[11px] font-bold rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-amber-500"
                                                            placeholder="Type custom area..."
                                                            autoFocus
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-400 mb-1">Unit</label>
                                                    <div className="flex bg-white border border-zinc-200 rounded-lg overflow-hidden">
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleEItemChange(item.id, 'unit', 'sqft')}
                                                            className={`px-2 py-1 text-[10px] font-bold ${item.unit === 'sqft' ? 'bg-amber-500 text-white' : 'text-zinc-500 hover:bg-zinc-50'}`}
                                                        >SQFT</button>
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleEItemChange(item.id, 'unit', 'PC')}
                                                            className={`px-2 py-1 text-[10px] font-bold ${item.unit === 'PC' ? 'bg-amber-500 text-white' : 'text-zinc-500 hover:bg-zinc-50'}`}
                                                        >PC</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">SKU / Description</label>
                                            {/* Searchable SKU combobox */}
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Search SKU or product name…"
                                                    value={skuSearchMap[item.id]?.query ?? item.sku}
                                                    onChange={(e) => setSkuSearchMap(prev => ({
                                                        ...prev,
                                                        [item.id]: { query: e.target.value, open: true }
                                                    }))}
                                                    onFocus={() => setSkuSearchMap(prev => ({
                                                        ...prev,
                                                        [item.id]: { query: prev[item.id]?.query ?? '', open: true }
                                                    }))}
                                                    className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 outline-none font-mono"
                                                />
                                                {skuSearchMap[item.id]?.open && skuSearchMap[item.id]?.query.length > 0 && (() => {
                                                    const q = skuSearchMap[item.id].query.toLowerCase();
                                                    const matches = (products as any[]).filter(p =>
                                                        p.sku?.toLowerCase().includes(q) ||
                                                        p.name?.toLowerCase().includes(q)
                                                    ).slice(0, 25);
                                                    if (matches.length === 0) return null;
                                                    return (
                                                        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
                                                            {matches.map((p: any) => (
                                                                <button
                                                                    key={p.id}
                                                                    type="button"
                                                                    onMouseDown={(e) => {
                                                                        e.preventDefault();
                                                                        handleEItemChange(item.id, 'productId', p.id);
                                                                        setSkuSearchMap(prev => ({
                                                                            ...prev,
                                                                            [item.id]: { query: p.sku, open: false }
                                                                        }));
                                                                    }}
                                                                    className="w-full text-left px-3 py-2.5 hover:bg-amber-50 border-b border-zinc-100 last:border-0 transition-colors"
                                                                >
                                                                    <div className="font-mono text-xs font-bold text-zinc-700">{p.sku}</div>
                                                                    <div className="text-sm text-zinc-800 leading-tight mt-0.5">{p.name}</div>
                                                                    <div className="text-xs text-zinc-400 mt-0.5 flex gap-2">
                                                                        <span>{p.size}</span>
                                                                        {p.sqftPerBox > 0 && <span>· {p.sqftPerBox} sqft/box</span>}
                                                                        <span className="text-amber-600 font-semibold">· ${p.sellingPricePerSqft?.toFixed(2)}/sqft</span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                            {/* Selected product details */}
                                            {item.productName && (
                                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                                    <span className="text-sm font-semibold text-zinc-800 leading-tight">
                                                        {item.productName}
                                                    </span>
                                                    {item.size && (
                                                        <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded border border-amber-100">
                                                            {item.size}
                                                        </span>
                                                    )}
                                                    {item.sqftPerBox > 0 && (
                                                        <span className="text-xs text-zinc-400 font-medium">
                                                            {item.sqftPerBox} sqft/box
                                                        </span>
                                                    )}
                                                    {/* Stock Button */}
                                                    <div className="ml-auto">
                                                        {itemStocks[item.id]?.loading ? (
                                                            <span className="text-[10px] text-zinc-400 animate-pulse">Checking…</span>
                                                        ) : itemStocks[item.id]?.value !== undefined && itemStocks[item.id]?.value !== null ? (
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleCheckItemStock(item.id, item.sku)}
                                                                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border shadow-sm transition-all hover:brightness-95 active:scale-95 ${itemStocks[item.id]!.value! > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                                            >
                                                                MIA: {itemStocks[item.id]!.value!.toLocaleString(undefined, { minimumFractionDigits: 2 })} SQFT
                                                            </button>

                                                        ) : (
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleCheckItemStock(item.id, item.sku)}
                                                                className="text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 uppercase tracking-tighter shadow-sm transition-all hover:bg-blue-100 active:scale-95"
                                                            >
                                                                🔍 MIAMI STOCK
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="w-32">
                                            <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Qty ({item.unit})</label>
                                            <input
                                                type="number" min="0" step="0.01"
                                                value={item.quantitySqft}
                                                onChange={(e) => handleEItemChange(item.id, 'quantitySqft', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 outline-none"
                                            />
                                            {item.unit === 'sqft' && item.sqftPerBox > 0 && item.quantitySqft > 0 && (() => {
                                                const boxes = Math.ceil(item.quantitySqft / item.sqftPerBox);
                                                const rounded = parseFloat((boxes * item.sqftPerBox).toFixed(4));
                                                return (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEItemChange(item.id, 'quantitySqft', rounded)}
                                                        className="mt-1.5 w-full text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 rounded-lg py-1.5 px-2 transition-colors"
                                                        title={`${boxes} boxes × ${item.sqftPerBox} sqft`}
                                                    >
                                                        🧮 Calculate! → {rounded} sqft
                                                    </button>
                                                );
                                            })()}
                                        </div>
                                        <div className="w-28">
                                            <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Unit Price ($)</label>
                                            <input
                                                type="number" min="0" step="0.01"
                                                value={item.unitPrice}
                                                onChange={(e) => handleEItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 outline-none"
                                            />
                                        </div>
                                        <div className="w-36">
                                            <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Discount</label>
                                            <div className="relative flex items-center">
                                                <div className="absolute inset-y-0 left-0 flex items-center">
                                                    <select
                                                        value={item.discountType}
                                                        onChange={(e) => handleEItemChange(item.id, 'discountType', e.target.value)}
                                                        className="h-full py-0 pl-2 pr-6 border-transparent bg-transparent text-zinc-500 text-sm rounded-l-lg"
                                                    >
                                                        <option value="$">$</option>
                                                        <option value="%">%</option>
                                                    </select>
                                                </div>
                                                <input
                                                    type="number" min="0" step="0.01"
                                                    value={item.discount}
                                                    onChange={(e) => handleEItemChange(item.id, 'discount', e.target.value)}
                                                    className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2.5 pl-16 outline-none"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            {/* Effective price after discount */}
                                            {(() => {
                                                const discVal = parseFloat(item.discount) || 0;
                                                if (discVal <= 0 || item.quantitySqft <= 0) return null;
                                                const effectivePrice = item.totalPrice / item.quantitySqft;
                                                return (
                                                    <div className="mt-1.5 text-xs font-bold text-emerald-600">
                                                        ≈ ${effectivePrice.toFixed(2)}/{item.unit} after disc.
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div className="w-28 text-right">
                                            <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Line Total</label>
                                            <div className="p-2.5 bg-white border border-zinc-200 rounded-lg text-sm font-bold text-zinc-900">
                                                ${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                            {item.unit === 'sqft' && item.sqftPerBox > 0 && item.quantitySqft > 0 && (() => {
                                                const boxes = Math.ceil(item.quantitySqft / item.sqftPerBox);
                                                const pallets = item.boxesPerPallet > 0 ? Math.ceil(boxes / item.boxesPerPallet) : null;
                                                return (
                                                    <>
                                                        <div className="mt-1.5 text-xs font-bold text-blue-600 flex justify-end gap-1 items-center">
                                                            📦 {boxes} boxes
                                                        </div>
                                                        {pallets !== null && (
                                                            <div className="mt-0.5 text-xs font-bold text-amber-600 flex justify-end gap-1 items-center">
                                                                🏗️ {pallets} pallet{pallets !== 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                        {
                                            editableItems.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEItem(item.id)}
                                                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors self-end"
                                                >✕</button>
                                            )
                                        }
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Financials Section */}
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-zinc-200 bg-zinc-50/50 space-y-6">
                        <h2 className="text-lg font-bold text-zinc-900">3. Final Adjustments</h2>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">Global Discount</label>
                            <p className="text-xs text-zinc-400 mb-2 mt-[-4px]">Applied to the entire order (after line discounts).</p>
                            <div className="relative flex items-center">
                                <div className="absolute inset-y-0 left-0 flex items-center">
                                    <select
                                        value={globalDiscountType}
                                        onChange={(e) => setGlobalDiscountType(e.target.value as '$' | '%')}
                                        className="h-full py-0 pl-3 pr-7 border-transparent bg-transparent text-zinc-500 sm:text-sm rounded-l-lg focus:ring-amber-500 focus:border-amber-500"
                                    >
                                        <option value="$">$</option>
                                        <option value="%">%</option>
                                    </select>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                    className="w-full pl-16 bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">Freight / Delivery ($)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-zinc-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={freight}
                                    onChange={(e) => setFreight(e.target.value)}
                                    className="w-full pl-8 bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:w-80 bg-zinc-900 text-white flex flex-col justify-end">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-zinc-400">
                                <span>Subtotal</span>
                                <span>${eSubtotal.toFixed(2)}</span>
                            </div>
                            {parsedDiscount > 0 && (
                                <div className="flex justify-between text-emerald-400 font-medium">
                                    <span>Discount</span>
                                    <span>-${parsedDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            {parsedFreight > 0 && (
                                <div className="flex justify-between text-amber-200">
                                    <span>Freight</span>
                                    <span>${parsedFreight.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-zinc-400 pb-4 border-b border-zinc-800">
                                <span>Est. Tax (7%)</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-black pt-2">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full mt-8 bg-amber-500 text-amber-950 px-4 py-3 rounded-lg font-bold hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
}
