"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClients, createClient } from "@/app/actions/clientActions";
import { getProducts, checkRocaStock } from "@/app/actions/productActions";

import { createOrder, updateOrderStatus } from "@/app/actions/orderActions";
import { CRMProduct, OrderStatus } from "@/lib/types";
import QuotePrintTemplate from "../QuotePrintTemplate";

export default function CreateOrderPage() {
    const router = useRouter();

    // State
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [clientSearch, setClientSearch] = useState("");
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [orderStatus, setOrderStatus] = useState<OrderStatus>('Quote');
    const [isPresentationMode, setIsPresentationMode] = useState(false);
    const [templateType, setTemplateType] = useState<'order' | 'project'>('order');
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printTrigger, setPrintTrigger] = useState(0);
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
    const [editableDiscount, setEditableDiscount] = useState<string>("0");
    const [globalDiscountType, setGlobalDiscountType] = useState<'$' | '%'>('$');
    const [editableFreight, setEditableFreight] = useState<string>("0");
    const [editableShipping, setEditableShipping] = useState<string>("");
    const [editableBilling, setEditableBilling] = useState<string>("");
    const [skuSearchMap, setSkuSearchMap] = useState<Record<string, { query: string; open: boolean }>>({});
    const [itemStocks, setItemStocks] = useState<Record<string, { value: number | null, loading: boolean }>>({});

    const handleCheckItemStock = async (itemId: string, sku: string) => {
        if (!sku) return;
        setItemStocks(prev => ({ ...prev, [itemId]: { value: null, loading: true } }));
        const val = await checkRocaStock(sku);
        setItemStocks(prev => ({ ...prev, [itemId]: { value: val, loading: false } }));
    };


    // Create Client Modal State
    const [showCreateClient, setShowCreateClient] = useState(false);
    const [newClientFirstName, setNewClientFirstName] = useState("");
    const [newClientLastName, setNewClientLastName] = useState("");
    const [newClientPhone, setNewClientPhone] = useState("");
    const [newClientCompany, setNewClientCompany] = useState("");
    const [newClientEmail, setNewClientEmail] = useState("");
    const [newClientDelivery, setNewClientDelivery] = useState("");
    const [newClientBilling, setNewClientBilling] = useState("");
    const [clientListVersion, setClientListVersion] = useState(0);

    // Send Order Modal State
    const [showSendModal, setShowSendModal] = useState(false);
    const [sendFromEmail, setSendFromEmail] = useState("sales@castile.com");
    const [sendToEmail, setSendToEmail] = useState("");
    const [sendSuccess, setSendSuccess] = useState(false);

    const [clients, setClients] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    
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

    // Fetch lookups
    // Fetch lookups
    useEffect(() => {
        Promise.all([getClients(), getProducts()]).then(([c, p]) => {
            setClients(c);
            setProducts(p);
        });
    }, [clientListVersion]);

    const handleCreateClient = async () => {
        const fullName = `${newClientFirstName} ${newClientLastName}`.trim() || 'New Client';
        const created = await createClient({
            name: fullName,
            company: newClientCompany || "",
            email: newClientEmail || "",
            phone: newClientPhone || "",
            type: "Homeowner", // Default
            address: newClientDelivery || undefined,
            billingAddress: newClientBilling || undefined,
        });
        setSelectedClientId(created.id);
        setClientSearch(`${created.name}${created.company ? ` — ${created.company}` : ''}`);
        setEditableShipping(created.address || '');
        setEditableBilling(created.billingAddress || created.address || '');
        // Reset modal
        setShowCreateClient(false);
        setNewClientFirstName('');
        setNewClientLastName('');
        setNewClientPhone('');
        setNewClientCompany('');
        setNewClientEmail('');
        setNewClientDelivery('');
        setNewClientBilling('');
        setClientListVersion(v => v + 1);
    };

    const handleAddEItem = () => {
        const firstP = products[0] as any;
        const newId = `new_${Date.now()}`;
        setEditableItems(prev => [...prev, {
            id: newId,
            productId: firstP?.id || '',
            sku: firstP?.sku || '',
            productName: firstP?.name || '',
            colorName: '',
            size: firstP?.size || '',
            sqftPerBox: firstP?.sqftPerBox || 0,
            boxesPerPallet: firstP?.boxesPerPallet || 0,
            quantitySqft: 0,
            unitPrice: firstP?.sellingPricePerSqft || 0,
            totalPrice: 0,
            discount: "0",
            discountType: '$',
            room: 'General',
            unit: 'sqft'
        }]);
        setSkuSearchMap(prev => ({ ...prev, [newId]: { query: '', open: false } }));
    };

    const handleRemoveEItem = (itemId: string) => {
        setEditableItems(prev => prev.filter(i => i.id !== itemId));
    };

    const handleEItemChange = (itemId: string, field: string, value: any) => {
        setEditableItems(prev => prev.map(item => {
            if (item.id !== itemId) return item;
            const updated: any = { ...item, [field]: value };

            if (field === 'productId') {
                const p = products.find(p => p.id === value);
                if (p) {
                    updated.sku = (p as any).sku || '';
                    updated.productName = p.name;
                    updated.colorName = '';
                    updated.size = (p as any).size || '';
                    updated.sqftPerBox = (p as any).sqftPerBox || 0;
                    updated.boxesPerPallet = (p as any).boxesPerPallet || 0;
                    updated.unitPrice = (p as any).sellingPricePerSqft || 0;
                    updated.unit = (p as any).unit || 'sqft';
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

    // Live totals
    const eSubtotal = editableItems.reduce((s, i) => s + i.totalPrice, 0);
    const eDiscountAmt = globalDiscountType === '%' ? eSubtotal * ((parseFloat(editableDiscount) || 0) / 100) : (parseFloat(editableDiscount) || 0);
    const eFreight = parseFloat(editableFreight) || 0;
    const eTax = Math.max(0, eSubtotal - eDiscountAmt) * 0.07;
    const eTotal = Math.max(0, eSubtotal - eDiscountAmt) + eTax + eFreight;

    const handleSave = async (action: 'pipeline' | 'print') => {
        if (!selectedClientId) return alert("Please select a client.");
        if (editableItems.length === 0) return alert("Please add at least one line item.");

        const createdOrder = await createOrder({
            clientId: selectedClientId,
            items: editableItems.map(i => ({
                id: undefined, // Let prisma generate
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
            status: orderStatus,
            subtotal: eSubtotal,
            discount: eDiscountAmt,
            freight: eFreight,
            tax: eTax,
            total: eTotal,
            shippingAddress: editableShipping,
            billingAddress: editableBilling
        });

        if (action === 'print') {
            window.open(`/admin/orders/${createdOrder.id}`, '_blank');
            router.push("/admin/orders");
        } else {
            router.push("/admin/orders");
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2">
                        &larr; Back to Pipeline
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Create New Quote</h1>
                        <p className="text-zinc-500 mt-1">Generate a quote, assign a client, and apply discounts.</p>
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    <button
                        type="button"
                        onClick={() => {
                            if (!selectedClientId) return alert('Please select a client first.');
                            if (editableItems.length === 0) return alert('Please add at least one line item.');
                            // Pre-fill client email
                            const cl = clients.find(c => c.id === selectedClientId);
                            setSendToEmail(cl?.email || '');
                            setSendSuccess(false);
                            setShowSendModal(true);
                        }}
                        className="px-4 py-2 border border-blue-200 bg-blue-50 rounded-lg text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                        ✉️ Send Order
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (!selectedClientId) return alert('Please select a client first.');
                            if (editableItems.length === 0) return alert('Please add at least one line item.');
                            setIsPrintModalOpen(true);
                        }}
                        className="px-4 py-2 border border-zinc-200 bg-white rounded-lg text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                        🖨️ Print
                    </button>
                    <select
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                        className="bg-zinc-900 text-white border border-transparent text-sm rounded-lg focus:ring-amber-500 block px-4 py-2 outline-none font-semibold shadow-sm appearance-none cursor-pointer"
                    >
                        <option value="Quote">Status: Quote Draft</option>
                        <option value="Invoice Sent">Status: Invoice Sent</option>
                        <option value="Paid">Status: Paid / Unful.</option>
                        <option value="Delivered">Status: Delivered</option>
                    </select>
                </div>
            </div>

            <div className="space-y-8">
                {/* 1. Client Details Section */}
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200">
                        <h2 className="text-lg font-bold text-zinc-900 text-zinc-400 text-xs tracking-widest uppercase mb-0">1. Client DETAILS</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="relative">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500">Select Client</label>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateClient(true)}
                                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                                >
                                    + Create New Client
                                </button>
                            </div>
                            <input
                                type="text"
                                value={clientSearch}
                                onChange={(e) => {
                                    setClientSearch(e.target.value);
                                    setIsClientDropdownOpen(true);
                                    if (selectedClientId) setSelectedClientId("");
                                }}
                                onFocus={() => setIsClientDropdownOpen(true)}
                                onBlur={() => setTimeout(() => setIsClientDropdownOpen(false), 200)}
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
                                                    setClientSearch(`${client.name} — ${client.company}`);
                                                    setIsClientDropdownOpen(false);
                                                    setEditableShipping(client.address || "");
                                                    setEditableBilling(client.billingAddress || client.address || "");
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
                                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">Shipping Address</label>
                                <textarea
                                    value={editableShipping}
                                    onChange={(e) => setEditableShipping(e.target.value)}
                                    className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none min-h-[80px]"
                                    placeholder="Enter shipping address or 'Will Call'..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">Billing Address</label>
                                <textarea
                                    value={editableBilling}
                                    onChange={(e) => setEditableBilling(e.target.value)}
                                    className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none min-h-[80px]"
                                    placeholder="Enter billing address..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Line Items */}
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm">
                    <div className="bg-zinc-50 px-6 py-4 border-b border-zinc-200 flex justify-between items-center rounded-t-xl">
                        <h2 className="text-lg font-bold text-zinc-900 text-zinc-400 text-xs tracking-widest uppercase mb-0">2. Products & Quantities</h2>
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
                                                    const words = q.split(/\s+/).filter(Boolean);
                                                    const matches = words.length === 0 ? [] : (products as any[]).filter(p => {
                                                        const searchStr = `${p.sku || ''} ${p.name || ''} ${p.collection || ''} ${p.category || ''} ${p.size || ''} ${p.description || ''}`.toLowerCase();
                                                        return words.every(word => searchStr.includes(word));
                                                    }).slice(0, 25);
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
                    <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-zinc-200 bg-zinc-50/50 space-y-6 flex flex-col justify-center">
                        <h2 className="text-lg font-bold text-zinc-900 text-zinc-400 text-xs tracking-widest uppercase mb-0">3. Final Adjustments</h2>

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
                                    value={editableDiscount}
                                    onChange={(e) => setEditableDiscount(e.target.value)}
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
                                    value={editableFreight}
                                    onChange={(e) => setEditableFreight(e.target.value)}
                                    className="w-full pl-8 bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:w-80 bg-zinc-50 text-zinc-900 flex flex-col justify-end">
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-zinc-500">
                                <span>Subtotal</span>
                                <span>${eSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            {eDiscountAmt > 0 && (
                                <div className="flex justify-between text-emerald-600 font-medium font-bold">
                                    <span>Discount ({globalDiscountType === '%' ? `${editableDiscount}%` : `$${eDiscountAmt.toFixed(2)}`})</span>
                                    <span>-${eDiscountAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {eFreight > 0 && (
                                <div className="flex justify-between text-zinc-500">
                                    <span>Freight</span>
                                    <span>${eFreight.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-zinc-500 pb-4 border-b border-zinc-200">
                                <span>Est. Tax (7%)</span>
                                <span>${eTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-black pt-2 text-zinc-900">
                                <span>Total</span>
                                <span>${eTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="mt-8 space-y-3">
                            <button
                                type="button"
                                onClick={() => handleSave('pipeline')}
                                className="w-full bg-white border border-zinc-300 text-zinc-700 px-4 py-3 rounded-lg font-bold hover:bg-zinc-50 transition-colors shadow-sm"
                            >
                                Save to Pipeline
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSave('print')}
                                className="w-full bg-amber-500 text-amber-950 px-4 py-3 rounded-lg font-bold hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                Save & Print Document
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Print Template — hidden on screen, visible on print */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '800px', visibility: 'hidden' }}>
                <QuotePrintTemplate
                    orderId="DRAFT"
                    status={orderStatus}
                    createdAt={new Date().toISOString()}
                    clientName={clients.find(c => c.id === selectedClientId)?.name || ''}
                    clientCompany={clients.find(c => c.id === selectedClientId)?.company}
                    clientEmail={clients.find(c => c.id === selectedClientId)?.email}
                    clientPhone={clients.find(c => c.id === selectedClientId)?.phone}
                    shippingAddress={editableShipping}
                    billingAddress={editableBilling}
                    items={editableItems.map(item => {
                        const safeSku = item.sku?.replace(/[^a-zA-Z0-9_-]/g, "") || "";
                        return {
                            productName: item.productName,
                            colorName: item.colorName,
                            size: item.size,
                            quantitySqft: item.quantitySqft,
                            unitPrice: item.unitPrice,
                            totalPrice: item.totalPrice,
                            room: item.room || 'General',
                            unit: item.unit || 'sqft',
                            imageUrl: safeSku ? `/api/product-image/${safeSku}` : undefined
                        };
                    })}
                    subtotal={eSubtotal}
                    discount={eDiscountAmt}
                    freight={eFreight}
                    tax={eTax}
                    total={eTotal}
                    isPresentation={isPresentationMode}
                    templateType={templateType}
                />
            </div>

            {/* Template Selection Modal */}
            {isPrintModalOpen && (
                <div className="fixed inset-0 bg-zinc-950/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 text-left">
                        {/* Header */}
                        <div className="bg-zinc-900 text-white p-6 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                    <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                                </div>
                                <div className="text-left">
                                    <h2 className="text-xl font-black tracking-tight">Select Quote Print Template</h2>
                                    <p className="text-xs text-zinc-400 mt-0.5">Select a layout format for this new quote draft</p>
                                </div>
                            </div>
                            <button onClick={() => setIsPrintModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        {/* Selection Grid */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Option 1: Order Template */}
                            <button
                                onClick={() => {
                                    setIsPrintModalOpen(false);
                                    handlePrint('order', isPresentationMode);
                                }}
                                className="flex flex-col text-left border-2 border-zinc-200 hover:border-amber-600 focus:border-amber-600 rounded-2xl p-6 transition-all hover:shadow-lg focus:outline-none group bg-zinc-50 hover:bg-white"
                            >
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 group-hover:bg-amber-55 flex items-center justify-center mb-4 transition-colors">
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
                                    setIsPrintModalOpen(false);
                                    handlePrint('project', isPresentationMode);
                                }}
                                className="flex flex-col text-left border-2 border-zinc-200 hover:border-amber-600 focus:border-amber-600 rounded-2xl p-6 transition-all hover:shadow-lg focus:outline-none group bg-zinc-50 hover:bg-white"
                            >
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 group-hover:bg-amber-55 flex items-center justify-center mb-4 transition-colors">
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
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isPresentationMode ? 'bg-amber-650' : 'bg-zinc-200'}`}
                            >
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isPresentationMode ? 'translate-x-5' : 'translate-x-0'}`}
                                />
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="bg-zinc-100 border-t border-zinc-200 p-6 flex justify-end gap-3">
                            <button onClick={() => setIsPrintModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-zinc-300 hover:bg-zinc-200 font-bold text-zinc-700 text-sm transition-colors bg-white">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create New Client Modal */}
            {showCreateClient && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowCreateClient(false); }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-zinc-900 px-8 py-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-white font-bold text-lg tracking-tight">Create New Client</h2>
                                <p className="text-zinc-400 text-xs mt-0.5">All fields are optional</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateClient(false)}
                                className="text-zinc-400 hover:text-white transition-colors text-xl leading-none"
                            >✕</button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">First Name</label>
                                    <input
                                        type="text"
                                        value={newClientFirstName}
                                        onChange={(e) => setNewClientFirstName(e.target.value)}
                                        placeholder="John"
                                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Last Name</label>
                                    <input
                                        type="text"
                                        value={newClientLastName}
                                        onChange={(e) => setNewClientLastName(e.target.value)}
                                        placeholder="Smith"
                                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={newClientPhone}
                                        onChange={(e) => setNewClientPhone(e.target.value)}
                                        placeholder="305-555-0100"
                                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Company Name</label>
                                    <input
                                        type="text"
                                        value={newClientCompany}
                                        onChange={(e) => setNewClientCompany(e.target.value)}
                                        placeholder="Acme Corp"
                                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    value={newClientEmail}
                                    onChange={(e) => setNewClientEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Delivery Address</label>
                                <textarea
                                    value={newClientDelivery}
                                    onChange={(e) => setNewClientDelivery(e.target.value)}
                                    placeholder="123 Main St, Miami FL 33101"
                                    rows={2}
                                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Billing Address <span className="text-zinc-400 normal-case font-normal">(leave blank to use delivery)</span></label>
                                <textarea
                                    value={newClientBilling}
                                    onChange={(e) => setNewClientBilling(e.target.value)}
                                    placeholder="Same as delivery address..."
                                    rows={2}
                                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none resize-none"
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowCreateClient(false)}
                                className="px-5 py-2.5 border border-zinc-200 text-zinc-700 bg-white rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateClient}
                                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-lg text-sm font-bold transition-colors shadow-sm"
                            >
                                ✓ Create &amp; Select Client
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Send Order Modal */}
            {showSendModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowSendModal(false); }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-blue-700 px-8 py-5 flex justify-between items-center">
                            <div>
                                <h2 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
                                    ✉️ Send Order to Client
                                </h2>
                                <p className="text-blue-200 text-xs mt-0.5">Confirm the addresses before sending</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setShowSendModal(false); setSendSuccess(false); }}
                                className="text-blue-200 hover:text-white transition-colors text-xl leading-none"
                            >✕</button>
                        </div>

                        {/* Success Banner */}
                        {sendSuccess && (
                            <div className="bg-emerald-50 border-b border-emerald-200 px-8 py-4 flex items-center gap-3">
                                <span className="text-2xl">✅</span>
                                <div>
                                    <div className="font-bold text-emerald-800 text-sm">Order sent successfully!</div>
                                    <div className="text-emerald-600 text-xs mt-0.5">A copy was sent to <strong>{sendToEmail}</strong></div>
                                </div>
                            </div>
                        )}

                        {/* Modal Body */}
                        {!sendSuccess && (
                            <div className="p-8 space-y-5">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">
                                        From (Your Email)
                                    </label>
                                    <input
                                        type="email"
                                        value={sendFromEmail}
                                        onChange={(e) => setSendFromEmail(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1.5">
                                        Send To (Client Email)
                                    </label>
                                    <input
                                        type="email"
                                        value={sendToEmail}
                                        onChange={(e) => setSendToEmail(e.target.value)}
                                        placeholder="client@example.com"
                                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
                                    />
                                    {!sendToEmail && (
                                        <p className="mt-1.5 text-xs text-amber-600 font-medium">⚠ No email on record for this client. Please enter one above.</p>
                                    )}
                                </div>

                                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-xs text-zinc-500 space-y-1">
                                    <div className="font-bold text-zinc-700 text-sm mb-2">📋 Order Summary</div>
                                    <div className="flex justify-between"><span>Client</span><span className="font-semibold text-zinc-800">{clients.find(c => c.id === selectedClientId)?.name}</span></div>
                                    <div className="flex justify-between"><span>Items</span><span className="font-semibold text-zinc-800">{editableItems.length} line item{editableItems.length !== 1 ? 's' : ''}</span></div>
                                    <div className="flex justify-between border-t border-zinc-200 pt-2 mt-2"><span className="font-bold text-zinc-700">Total</span><span className="font-black text-zinc-900">${eTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                </div>
                            </div>
                        )}

                        {/* Modal Footer */}
                        <div className="px-8 py-5 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => { setShowSendModal(false); setSendSuccess(false); }}
                                className="px-5 py-2.5 border border-zinc-200 text-zinc-700 bg-white rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-colors"
                            >
                                {sendSuccess ? 'Close' : 'Cancel'}
                            </button>
                            {!sendSuccess && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!sendToEmail) return alert('Please enter a recipient email address.');
                                        // In a real app: POST to /api/send-order with the order details
                                        // For now, simulate success
                                        setSendSuccess(true);
                                    }}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                                >
                                    ✉️ Send Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
