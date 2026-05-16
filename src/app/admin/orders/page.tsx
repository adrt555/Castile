"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getClients, createClient, updateClient } from "@/app/actions/clientActions";
import { getProducts, checkRocaStock } from "@/app/actions/productActions";
import { getOrders, updateOrderStatus, updateOrder, deleteOrder } from "@/app/actions/orderActions";

import { Order, Client, OrderStatus, CRMProduct } from "@/lib/types";
import QuotePrintTemplate from "./QuotePrintTemplate";

// Extended order type for the table view
interface TableOrder extends Order {
    client?: Client;
}

export default function OrdersTablePipeline() {
    const [orders, setOrders] = useState<TableOrder[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt" | "total">("updatedAt");
    const [selectedOrder, setSelectedOrder] = useState<TableOrder | null>(null);
    const [isEditingItems, setIsEditingItems] = useState(false);
    const [editableItems, setEditableItems] = useState<Array<{ id: string, productId: string, sku: string, productName: string, colorName: string, size: string, sqftPerBox: number, boxesPerPallet: number, quantitySqft: number, unitPrice: number, totalPrice: number, discount: string, discountType: '$' | '%' }>>([]);
    const [editableDiscount, setEditableDiscount] = useState<string>("0");
    const [globalDiscountType, setGlobalDiscountType] = useState<'$' | '%'>('$');
    const [editableFreight, setEditableFreight] = useState<string>("0");
    const [editableShipping, setEditableShipping] = useState<string>("");
    const [editableBilling, setEditableBilling] = useState<string>("");
    const [editableClientId, setEditableClientId] = useState<string>("");
    const [clientSearch, setClientSearch] = useState<string>("");
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [itemStocks, setItemStocks] = useState<Record<string, { value: number | null, loading: boolean }>>({});

    const handleCheckItemStock = async (itemId: string, sku: string) => {
        if (!sku) return;
        setItemStocks(prev => ({ ...prev, [itemId]: { value: null, loading: true } }));
        const val = await checkRocaStock(sku);
        setItemStocks(prev => ({ ...prev, [itemId]: { value: val, loading: false } }));
    };

    const [skuSearchMap, setSkuSearchMap] = useState<Record<string, { query: string; open: boolean }>>({});
    const [products, setProducts] = useState<any[]>([]);
    const [allClients, setAllClients] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateClient, setShowCreateClient] = useState(false);
    const [newClientDraft, setNewClientDraft] = useState({ name: '', company: '', email: '', phone: '', type: 'Contractor' as string, address: '', billingAddress: '' });
    const [showEditClient, setShowEditClient] = useState(false);
    const [editClientDraft, setEditClientDraft] = useState<{ name: string; company: string; email: string; phone: string; type: string; address: string; billingAddress: string } | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        const [c, p, o] = await Promise.all([getClients(), getProducts(), getOrders()]);
        setAllClients(c);
        setProducts(p);
        
        // getOrders already includes the client in our Prisma schema, but let's map it for compatibility just in case
        const extendedOrders = o.map((order: any) => ({
            ...order,
            client: order.client || c.find((cl: any) => cl.id === order.clientId)
        }));
        setOrders(extendedOrders);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        await updateOrderStatus(orderId, newStatus);
        
        // Optically update the UI
        const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o);
        setOrders(updatedOrders);
        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
    };

    const handleSelectOrder = (order: TableOrder) => {
        setSelectedOrder(order);
        setEditableClientId(order.clientId);
        const client = allClients.find(c => c.id === order.clientId);
        setClientSearch(client ? `${client.name} — ${client.company}` : "");
        setEditableItems(order.items.map(item => {
            const p = products.find(p => p.id === item.productId) as any;
            return {
                ...item,
                sku: p?.sku || '',
                sqftPerBox: p?.sqftPerBox || 0,
                boxesPerPallet: p?.boxesPerPallet || 0,
                discount: "0",
                discountType: '$' as const,
            };
        }));
        setEditableDiscount(order.discount?.toString() || "0");
        setGlobalDiscountType('$');
        setEditableFreight(order.freight?.toString() || "0");
        setEditableShipping(order.shippingAddress || "");
        setEditableBilling(order.billingAddress || "");
        setIsEditingItems(false);
        setIsDirty(false);
        setIsClientDropdownOpen(false);
        // Reset SKU search map seeded with existing items
        const initMap: Record<string, { query: string; open: boolean }> = {};
        order.items.forEach(item => { initMap[item.id] = { query: '', open: false }; });
        setSkuSearchMap(initMap);
    };

    const handleEItemChange = (itemId: string, field: string, value: any) => {
        setEditableItems(prev => prev.map(item => {
            if (item.id !== itemId) return item;
            const updated: any = { ...item, [field]: value };

            // When product changes, fill in SKU, name, size, price, sqftPerBox
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
                }
            }

            const gross = (updated.quantitySqft || 0) * (updated.unitPrice || 0);
            const discAmt = updated.discountType === '%' ? gross * ((parseFloat(updated.discount) || 0) / 100) : (parseFloat(updated.discount) || 0);
            updated.totalPrice = Math.max(0, gross - discAmt);
            return updated;
        }));
        // setIsDirty must be called OUTSIDE the functional updater to avoid React anti-pattern
        setIsDirty(true);
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
        }]);
        setSkuSearchMap(prev => ({ ...prev, [newId]: { query: '', open: false } }));
        setIsDirty(true);
    };

    const handleRemoveEItem = (itemId: string) => {
        setEditableItems(prev => prev.filter(i => i.id !== itemId));
        setIsDirty(true);
    };

    // Live totals
    const eSubtotal = editableItems.reduce((s, i) => s + i.totalPrice, 0);
    const eDiscountAmt = globalDiscountType === '%' ? eSubtotal * ((parseFloat(editableDiscount) || 0) / 100) : (parseFloat(editableDiscount) || 0);
    const eFreight = parseFloat(editableFreight) || 0;
    const eTax = Math.max(0, eSubtotal - eDiscountAmt) * 0.07;
    const eTotal = Math.max(0, eSubtotal - eDiscountAmt) + eTax + eFreight;

    const handleSaveOrder = async () => {
        if (!selectedOrder) return;

        await updateOrder(selectedOrder.id, {
            clientId: editableClientId,
            items: editableItems.map(i => ({
                id: i.id.startsWith('new_') ? undefined : i.id, // Let prisma generate ID for new items
                productId: i.productId,
                productName: i.productName,
                colorName: i.colorName,
                size: i.size,
                quantitySqft: i.quantitySqft,
                unitPrice: i.unitPrice,
                totalPrice: i.totalPrice,
            })),
            subtotal: eSubtotal,
            discount: eDiscountAmt,
            freight: eFreight,
            tax: eTax,
            total: eTotal,
            shippingAddress: editableShipping,
            billingAddress: editableBilling,
        });

        await loadData();
        setIsDirty(false);
    };

    const handleDeleteOrder = async () => {
        if (!selectedOrder) return;
        if (!confirm(`Are you sure you want to delete Order ${selectedOrder.orderNumber?.toString().padStart(4, '0') || selectedOrder.id}? This action cannot be undone.`)) return;
        
        const res = await deleteOrder(selectedOrder.id);
        if (res.success) {
            setSelectedOrder(null);
            await loadData();
        } else {
            alert(res.error || "Failed to delete order");
        }
    };

    // Filtered clients for searchable dropdown

    const filteredClients = allClients.filter(c =>
        `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(clientSearch.toLowerCase())
    );

    // Global Search Logic
    const filteredOrders = orders.filter(order => {
        const query = searchQuery.toLowerCase();
        const fmtNum = order.orderNumber?.toString().padStart(4, '0') || "";
        return (
            order.id.toLowerCase().includes(query) ||
            fmtNum.includes(query) ||
            order.client?.name.toLowerCase().includes(query) ||
            order.client?.phone.includes(query) ||
            (order.shippingAddress && order.shippingAddress.toLowerCase().includes(query)) ||
            (order.billingAddress && order.billingAddress.toLowerCase().includes(query))
        );
    }).sort((a, b) => {
        if (sortBy === "updatedAt") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        if (sortBy === "createdAt") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortBy === "total") return b.total - a.total;
        return 0;
    });


    // Render the Details View instead of the Table if an order is selected
    if (selectedOrder) {
        const selectedClient = allClients.find(c => c.id === editableClientId);
        return (
            <div className="max-w-5xl mx-auto space-y-6 pb-12">
                {/* Back Button & Header */}
                <div className="flex justify-between items-center mb-8">
                    <button
                        onClick={() => setSelectedOrder(null)}
                        className="text-xs sm:text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1.5 sm:gap-2"
                    >
                        &larr; <span className="sm:inline">Back to Pipeline</span><span className="inline sm:hidden">Back</span>
                    </button>

                    <div className="flex gap-3 items-center">
                        {isDirty && (
                            <button
                                onClick={handleSaveOrder}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-1.5 animate-pulse"
                            >
                                💾 Save Changes
                            </button>
                        )}
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 border border-zinc-200 bg-white rounded-lg text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                            🖨️ Print
                        </button>
                        <select
                            value={selectedOrder.status}
                            onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                            className="bg-zinc-900 text-white border border-transparent text-sm rounded-lg focus:ring-amber-500 block px-4 py-2 outline-none font-semibold shadow-sm appearance-none cursor-pointer"
                        >
                            <option value="Quote">Status: Quote Draft</option>
                            <option value="Invoice Sent">Status: Invoice Sent</option>
                            <option value="Paid">Status: Paid / Unful.</option>
                            <option value="Delivered">Status: Delivered</option>
                        </select>
                    </div>
                </div>

                {/* Order Header Card */}
                <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-zinc-200 bg-zinc-50 flex justify-between items-start">
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 uppercase tracking-widest">
                                    Order : {selectedOrder.orderNumber?.toString().padStart(4, '0') || selectedOrder.id.slice(0,8)}
                                </h1>

                                <span className={`w-fit px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider border
                                    ${selectedOrder.status === 'Quote' ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : ''}
                                    ${selectedOrder.status === 'Invoice Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                    ${selectedOrder.status === 'Paid' || selectedOrder.status === 'Unfulfilled' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                    ${selectedOrder.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                `}>
                                    {selectedOrder.status === 'Paid' ? 'Paid / Unfulfilled' : selectedOrder.status}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-zinc-500 font-medium tracking-wide">
                                Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">${eTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                            <p className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Live Total</p>
                        </div>
                    </div>

                    <div className="p-8 space-y-10">

                        {/* 1. Client Section */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 pb-2 border-b border-zinc-100">1. Client</h3>

                            {/* Search + dropdown */}
                            <div className="relative mb-4">
                                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">Select Client</label>
                                <input
                                    type="text"
                                    value={clientSearch}
                                    onChange={(e) => { setClientSearch(e.target.value); setIsClientDropdownOpen(true); setIsDirty(true); }}
                                    onFocus={() => setIsClientDropdownOpen(true)}
                                    onBlur={() => setTimeout(() => setIsClientDropdownOpen(false), 250)}
                                    placeholder="Search by name, company, email…"
                                    className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none"
                                />
                                {isClientDropdownOpen && (
                                    <div className="absolute z-30 mt-1 w-full bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
                                        {filteredClients.length > 0 && (
                                            <ul className="max-h-52 overflow-y-auto divide-y divide-zinc-100">
                                                {filteredClients.map(c => (
                                                    <li key={c.id}>
                                                        <button type="button"
                                                            onMouseDown={() => {
                                                                setEditableClientId(c.id);
                                                                setClientSearch(`${c.name} — ${c.company}`);
                                                                setEditableShipping((c as any).address || '');
                                                                setEditableBilling((c as any).billingAddress || (c as any).address || '');
                                                                setIsClientDropdownOpen(false);
                                                                setShowCreateClient(false);
                                                                setShowEditClient(false);
                                                                setIsDirty(true);
                                                            }}
                                                            className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors">
                                                            <div className="font-semibold text-zinc-900 text-sm">{c.name}</div>
                                                            <div className="text-xs text-zinc-500">{c.company} · {c.email}</div>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {filteredClients.length === 0 && clientSearch && (
                                            <div className="px-4 py-3 text-sm text-zinc-400">No clients found for &ldquo;{clientSearch}&rdquo;</div>
                                        )}
                                        <div className="border-t border-zinc-100">
                                            <button type="button"
                                                onMouseDown={() => { setShowCreateClient(c => !c); setShowEditClient(false); }}
                                                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors">
                                                <span className="text-lg leading-none">＋</span> Create New Client
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                             {/* Selected client info card */}
                             {selectedClient && !showEditClient && !showCreateClient && (
                                 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-zinc-50 border border-zinc-200 rounded-xl p-4 mb-4">
                                     <div className="text-sm text-zinc-600 space-y-0.5">
                                         <div className="font-bold text-zinc-900 text-base">{selectedClient.name}</div>
                                         <div className="text-amber-600 font-medium">{selectedClient.company}</div>
                                         <div className="text-zinc-500 truncate max-w-[280px]">📧 {selectedClient.email}</div>
                                         <div className="text-zinc-500">📞 {selectedClient.phone}</div>
                                         {(selectedClient as any).type && <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wide mt-1">{(selectedClient as any).type}</div>}
                                     </div>
                                     <button type="button"
                                         onClick={() => {
                                             setEditClientDraft({
                                                 name:           selectedClient.name,
                                                 company:        selectedClient.company,
                                                 email:          selectedClient.email,
                                                 phone:          selectedClient.phone,
                                                 type:           (selectedClient as any).type || 'Contractor',
                                                 address:        (selectedClient as any).address || '',
                                                 billingAddress: (selectedClient as any).billingAddress || '',
                                             });
                                             setShowEditClient(true);
                                         }}
                                         className="w-full sm:w-auto text-xs font-bold text-zinc-500 hover:text-amber-600 border border-zinc-200 hover:border-amber-300 px-3 py-2 sm:py-1.5 rounded-lg transition-colors bg-white sm:bg-transparent">
                                         ✏️ Edit Client
                                     </button>
                                 </div>
                             )}

                            {/* Inline Create Client form */}
                            {showCreateClient && (
                                <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-5 space-y-4 mb-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-amber-700 uppercase tracking-wide">New Client</h4>
                                        <button type="button" onClick={() => setShowCreateClient(false)} className="text-zinc-400 hover:text-zinc-700 text-xs font-bold">✕ Cancel</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {([
                                            { label: 'Full Name *',  key: 'name',    type: 'text',  ph: 'Jane Smith' },
                                            { label: 'Company',      key: 'company', type: 'text',  ph: 'Acme Construction' },
                                            { label: 'Email *',      key: 'email',   type: 'email', ph: 'jane@company.com' },
                                            { label: 'Phone',        key: 'phone',   type: 'tel',   ph: '305-555-0100' },
                                            { label: 'Address',      key: 'address', type: 'text',  ph: '123 Main St, Miami FL' },
                                        ] as const).map(({ label, key, type, ph }) => (
                                            <div key={key}>
                                                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1">{label}</label>
                                                <input type={type} value={(newClientDraft as any)[key]}
                                                    onChange={e => setNewClientDraft(p => ({ ...p, [key]: e.target.value }))}
                                                    className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2.5 outline-none"
                                                    placeholder={ph} />
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1">Type</label>
                                            <select value={newClientDraft.type} onChange={e => setNewClientDraft(p => ({ ...p, type: e.target.value }))}
                                                className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2.5 outline-none">
                                                {['Architect','Designer','Contractor','Homeowner'].map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <button type="button" onClick={async () => {
                                            if (!newClientDraft.name.trim() || !newClientDraft.email.trim()) return alert('Name and email are required.');
                                            const created = await createClient({ ...newClientDraft, address: newClientDraft.address || undefined, billingAddress: newClientDraft.billingAddress || undefined });
                                            const refreshedClients = await getClients();
                                            setAllClients(refreshedClients as any);
                                            setEditableClientId(created.id);
                                            setClientSearch(`${created.name} — ${created.company}`);
                                            setEditableShipping((created as any).address || '');
                                            setEditableBilling((created as any).billingAddress || (created as any).address || '');
                                            setShowCreateClient(false);
                                            setNewClientDraft({ name: '', company: '', email: '', phone: '', type: 'Contractor', address: '', billingAddress: '' });
                                            setIsDirty(true);
                                        }}
                                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                                            ✓ Save &amp; Select Client
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Inline Edit Client form */}
                            {showEditClient && editClientDraft && selectedClient && (
                                <div className="border border-blue-200 bg-blue-50/40 rounded-xl p-5 space-y-4 mb-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wide">Edit: {selectedClient.name}</h4>
                                        <button type="button" onClick={() => setShowEditClient(false)} className="text-zinc-400 hover:text-zinc-700 text-xs font-bold">✕ Cancel</button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {([
                                            { label: 'Full Name *',  key: 'name',    type: 'text',  ph: 'Jane Smith' },
                                            { label: 'Company',      key: 'company', type: 'text',  ph: 'Acme Construction' },
                                            { label: 'Email *',      key: 'email',   type: 'email', ph: 'jane@company.com' },
                                            { label: 'Phone',        key: 'phone',   type: 'tel',   ph: '305-555-0100' },
                                            { label: 'Address',      key: 'address', type: 'text',  ph: '123 Main St, Miami FL' },
                                            { label: 'Billing Addr', key: 'billingAddress', type: 'text', ph: 'PO Box / billing…' },
                                        ] as const).map(({ label, key, type, ph }) => (
                                            <div key={key}>
                                                <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1">{label}</label>
                                                <input type={type} value={(editClientDraft as any)[key]}
                                                    onChange={e => setEditClientDraft(p => p ? { ...p, [key]: e.target.value } : p)}
                                                    className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-400 focus:border-blue-400 p-2.5 outline-none"
                                                    placeholder={ph} />
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-1">Type</label>
                                            <select value={editClientDraft.type} onChange={e => setEditClientDraft(p => p ? { ...p, type: e.target.value } : p)}
                                                className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-400 focus:border-blue-400 p-2.5 outline-none">
                                                {['Architect','Designer','Contractor','Homeowner'].map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => setShowEditClient(false)}
                                            className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-xl transition-colors">Cancel</button>
                                        <button type="button" onClick={async () => {
                                            if (!editClientDraft.name.trim() || !editClientDraft.email.trim()) return alert('Name and email are required.');
                                            await updateClient(selectedClient.id, { ...editClientDraft, address: editClientDraft.address || undefined, billingAddress: editClientDraft.billingAddress || undefined });
                                            const refreshedClients = await getClients();
                                            setAllClients(refreshedClients as any);
                                            setClientSearch(`${editClientDraft.name} — ${editClientDraft.company}`);
                                            setShowEditClient(false);
                                            setIsDirty(true);
                                        }}
                                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                                            ✓ Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                             {/* Addresses */}
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-2">
                                 <div>
                                     <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">Shipping Address</label>
                                     <textarea
                                         value={editableShipping}
                                         onChange={(e) => { setEditableShipping(e.target.value); setIsDirty(true); }}
                                         className="w-full text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-1 focus:ring-amber-400 leading-relaxed"
                                         rows={2}
                                         placeholder="No shipping address"
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">Billing Address</label>
                                     <textarea
                                         value={editableBilling}
                                         onChange={(e) => { setEditableBilling(e.target.value); setIsDirty(true); }}
                                         className="w-full text-sm text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-1 focus:ring-amber-400 leading-relaxed"
                                         rows={2}
                                         placeholder="No billing address"
                                     />
                                 </div>
                             </div>
                          </div>
                        {/* 2. Line Items */}
                        <div>
                            <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-100">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">2. Products & Quantities</h3>
                                <button
                                    type="button"
                                    onClick={handleAddEItem}
                                    className="text-sm font-bold text-amber-600 hover:text-amber-700"
                                >
                                    + Add Line Item
                                </button>
                            </div>
                            <div className="space-y-4">
                                {/* Desktop: Column headers — hidden on mobile */}
                                <div className="hidden md:grid items-center gap-2 px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400"
                                    style={{gridTemplateColumns: '1fr 90px auto 70px 60px 60px 80px 120px 90px 32px'}}>
                                    <span>SKU / Product</span>
                                    <span>Sqft Needed</span>
                                    <span></span>
                                    <span>Adj. Sqft</span>
                                    <span>📦 Boxes</span>
                                    <span>🏗️ Pallets</span>
                                    <span>$/sqft</span>
                                    <span>Discount</span>
                                    <span className="text-right">Line Total</span>
                                    <span></span>
                                </div>

                                {editableItems.map((item) => {
                                    const boxes    = item.sqftPerBox > 0 && item.quantitySqft > 0 ? Math.ceil(item.quantitySqft / item.sqftPerBox) : null;
                                    const adjSqft  = boxes !== null ? parseFloat((boxes * item.sqftPerBox).toFixed(2)) : null;
                                    const pallets  = boxes !== null && item.boxesPerPallet > 0 ? Math.ceil(boxes / item.boxesPerPallet) : null;
                                    const discVal  = parseFloat(item.discount) || 0;

                                    /* ── SKU search dropdown ── */
                                    const skuDropdown = skuSearchMap[item.id]?.open && (skuSearchMap[item.id]?.query?.length ?? 0) > 0 && (() => {
                                        const q = skuSearchMap[item.id].query.toLowerCase();
                                        const matches = (products as any[]).filter(p => p.sku?.toLowerCase().includes(q) || p.name?.toLowerCase().includes(q)).slice(0, 25);
                                        if (matches.length === 0) return null;
                                        return (
                                            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
                                                {matches.map((p: any) => (
                                                    <button key={p.id} type="button"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            handleEItemChange(item.id, 'productId', p.id);
                                                            setSkuSearchMap(prev => ({ ...prev, [item.id]: { query: p.sku, open: false } }));
                                                        }}
                                                        className="w-full text-left px-3 py-2 hover:bg-amber-50 border-b border-zinc-100 last:border-0 transition-colors">
                                                        <div className="font-mono text-xs font-bold text-zinc-700">{p.sku}</div>
                                                        <div className="text-xs text-zinc-600 leading-tight">{p.name}</div>
                                                        <div className="text-[10px] text-zinc-400 flex gap-2">
                                                            <span>{p.size}</span>
                                                            {p.sqftPerBox > 0 && <span>· {p.sqftPerBox} sf/box</span>}
                                                            <span className="text-amber-600 font-semibold">· ${p.sellingPricePerSqft?.toFixed(2)}/sf</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        );
                                    })();

                                    return (
                                    <div key={item.id}>
                                        {/* ═══ MOBILE: Card Layout ═══ */}
                                        <div className="md:hidden bg-white border border-zinc-200 rounded-xl p-4 shadow-sm space-y-3 relative">
                                            {editableItems.length > 1 && (
                                                <button type="button" onClick={() => handleRemoveEItem(item.id)}
                                                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors text-xs">✕</button>
                                            )}
                                            {/* SKU */}
                                            <div className="relative">
                                                <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-400 mb-1">SKU / Product</label>
                                                <input type="text" placeholder="Search SKU or name…"
                                                    value={skuSearchMap[item.id]?.query ?? item.sku}
                                                    onChange={(e) => setSkuSearchMap(prev => ({ ...prev, [item.id]: { query: e.target.value, open: true } }))}
                                                    onFocus={() => setSkuSearchMap(prev => ({ ...prev, [item.id]: { query: prev[item.id]?.query ?? '', open: true } }))}
                                                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2.5 outline-none font-mono" />
                                                {item.productName && (
                                                    <div className="text-xs text-zinc-500 mt-1">{item.productName}{item.size && <span className="ml-1 text-amber-600 font-bold">{item.size}</span>}</div>
                                                )}
                                                {skuDropdown}
                                            </div>
                                            {/* Sqft + Calc */}
                                            <div className="grid grid-cols-3 gap-2 items-end">
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-400 mb-1">Sqft Needed</label>
                                                    <input type="number" min="0" step="0.01" value={item.quantitySqft}
                                                        onChange={(e) => handleEItemChange(item.id, 'quantitySqft', parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg p-2.5 outline-none" />
                                                </div>
                                                <button type="button"
                                                    onClick={() => { if (!item.sqftPerBox) return; const b = Math.ceil((item.quantitySqft || 0) / item.sqftPerBox); handleEItemChange(item.id, 'quantitySqft', parseFloat((b * item.sqftPerBox).toFixed(4))); }}
                                                    disabled={!item.sqftPerBox}
                                                    className="px-3 py-2.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-200 disabled:text-zinc-400 rounded-lg transition-colors whitespace-nowrap">
                                                    🧮 Calc
                                                </button>
                                            </div>
                                            {/* Computed values row */}
                                            <div className="grid grid-cols-3 gap-2">
                                                <div className={`text-xs font-bold text-center p-2 rounded-lg ${adjSqft !== null ? 'bg-zinc-50 border border-zinc-200 text-zinc-800' : 'bg-zinc-50 text-zinc-300'}`}>
                                                    <div className="text-[9px] text-zinc-400 font-semibold mb-0.5">ADJ. SQFT</div>{adjSqft ?? '—'}
                                                </div>
                                                <div className={`text-xs font-bold text-center p-2 rounded-lg ${boxes !== null ? 'bg-blue-50 border border-blue-100 text-blue-700' : 'bg-zinc-50 text-zinc-300'}`}>
                                                    <div className="text-[9px] text-zinc-400 font-semibold mb-0.5">📦 BOXES</div>{boxes ?? '—'}
                                                </div>
                                                <div className={`text-xs font-bold text-center p-2 rounded-lg ${pallets !== null ? 'bg-amber-50 border border-amber-100 text-amber-700' : 'bg-zinc-50 text-zinc-300'}`}>
                                                    <div className="text-[9px] text-zinc-400 font-semibold mb-0.5">🏗️ PALLETS</div>{pallets ?? '—'}
                                                </div>
                                            </div>
                                            {/* Price + Discount */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-400 mb-1">$/sqft</label>
                                                    <input type="number" min="0" step="0.01" value={item.unitPrice}
                                                        onChange={(e) => handleEItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg p-2.5 outline-none" />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-400 mb-1">Discount</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 flex items-center pl-1.5">
                                                            <select value={item.discountType} onChange={(e) => handleEItemChange(item.id, 'discountType', e.target.value)}
                                                                className="h-full py-0 pr-4 border-transparent bg-transparent text-zinc-400 text-xs rounded-l-lg"><option value="$">$</option><option value="%">%</option></select>
                                                        </div>
                                                        <input type="number" min="0" step="0.01" value={item.discount}
                                                            onChange={(e) => handleEItemChange(item.id, 'discount', e.target.value)}
                                                            className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg p-2.5 pl-9 outline-none" placeholder="0.00" />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Line Total */}
                                            <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                                                <span className="text-xs font-bold uppercase tracking-wide text-zinc-400">Line Total</span>
                                                <span className="text-base font-black text-zinc-900">${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                            {discVal > 0 && item.quantitySqft > 0 && (
                                                <div className="text-xs font-bold text-emerald-600 text-right">≈${(item.totalPrice / item.quantitySqft).toFixed(2)}/sf after discount</div>
                                            )}
                                        </div>

                                        {/* ═══ DESKTOP: Original 10-column Grid ═══ */}
                                        <div className="hidden md:grid items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2.5 shadow-sm"
                                            style={{gridTemplateColumns: '1fr 90px auto 70px 60px 60px 80px 120px 90px 32px'}}>
                                            <div className="relative min-w-0">
                                                <input type="text" placeholder="Search SKU or name…"
                                                    value={skuSearchMap[item.id]?.query ?? item.sku}
                                                    onChange={(e) => setSkuSearchMap(prev => ({ ...prev, [item.id]: { query: e.target.value, open: true } }))}
                                                    onFocus={() => setSkuSearchMap(prev => ({ ...prev, [item.id]: { query: prev[item.id]?.query ?? '', open: true } }))}
                                                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2 outline-none font-mono" />
                                                {item.productName && (
                                                    <div className="flex items-center gap-2 mt-0.5 min-w-0">
                                                        <div className="text-[10px] text-zinc-500 truncate pl-0.5 flex-1">{item.productName}{item.size && <span className="ml-1 text-amber-600 font-bold">{item.size}</span>}</div>
                                                        <div className="flex-shrink-0">
                                                            {itemStocks[item.id]?.loading ? (
                                                                <span className="text-[9px] text-zinc-400 animate-pulse">Checking…</span>
                                                            ) : itemStocks[item.id]?.value !== undefined && itemStocks[item.id]?.value !== null ? (
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => handleCheckItemStock(item.id, item.sku)}
                                                                    className={`text-[9px] font-bold px-2 py-1 rounded-lg border shadow-sm whitespace-nowrap min-w-[85px] text-center transition-all hover:brightness-95 active:scale-95 ${itemStocks[item.id]!.value! > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                                                >
                                                                    MIA: {itemStocks[item.id]!.value!.toLocaleString(undefined, { minimumFractionDigits: 2 })} SQFT
                                                                </button>

                                                            ) : (
                                                                <button 
                                                                    type="button"
                                                                    onClick={() => handleCheckItemStock(item.id, item.sku)}
                                                                    className="text-[9px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 uppercase tracking-tighter shadow-sm transition-all hover:bg-blue-100"
                                                                >
                                                                    MIAMI STOCK
                                                                </button>
                                                            )}

                                                        </div>
                                                    </div>
                                                )}

                                                {skuDropdown}
                                            </div>
                                            <input type="number" min="0" step="0.01" value={item.quantitySqft}
                                                onChange={(e) => handleEItemChange(item.id, 'quantitySqft', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2 outline-none text-center" />
                                            <button type="button"
                                                onClick={() => { if (!item.sqftPerBox) return; const b = Math.ceil((item.quantitySqft || 0) / item.sqftPerBox); handleEItemChange(item.id, 'quantitySqft', parseFloat((b * item.sqftPerBox).toFixed(4))); }}
                                                disabled={!item.sqftPerBox}
                                                className="px-2.5 py-2 text-[10px] font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-200 disabled:text-zinc-400 rounded-lg transition-colors whitespace-nowrap">
                                                🧮 Calc
                                            </button>
                                            <div className={`text-xs font-bold text-center p-2 rounded-lg ${adjSqft !== null ? 'bg-zinc-50 border border-zinc-200 text-zinc-800' : 'text-zinc-300'}`}>{adjSqft ?? '—'}</div>
                                            <div className={`text-xs font-bold text-center p-2 rounded-lg ${boxes !== null ? 'bg-blue-50 border border-blue-100 text-blue-700' : 'text-zinc-300'}`}>{boxes ?? '—'}</div>
                                            <div className={`text-xs font-bold text-center p-2 rounded-lg ${pallets !== null ? 'bg-amber-50 border border-amber-100 text-amber-700' : 'text-zinc-300'}`}>{pallets ?? '—'}</div>
                                            <input type="number" min="0" step="0.01" value={item.unitPrice}
                                                onChange={(e) => handleEItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-xs rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2 outline-none text-center" />
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 flex items-center pl-1.5">
                                                    <select value={item.discountType} onChange={(e) => handleEItemChange(item.id, 'discountType', e.target.value)}
                                                        className="h-full py-0 pr-4 border-transparent bg-transparent text-zinc-400 text-[10px] rounded-l-lg"><option value="$">$</option><option value="%">%</option></select>
                                                </div>
                                                <input type="number" min="0" step="0.01" value={item.discount}
                                                    onChange={(e) => handleEItemChange(item.id, 'discount', e.target.value)}
                                                    className="w-full bg-zinc-50 border border-zinc-300 text-zinc-900 text-xs rounded-lg focus:ring-amber-500 focus:border-amber-500 p-2 pl-9 outline-none" placeholder="0.00" />
                                                {discVal > 0 && item.quantitySqft > 0 && (
                                                    <div className="text-[9px] font-bold text-emerald-600 mt-0.5 text-center">≈${(item.totalPrice / item.quantitySqft).toFixed(2)}/sf</div>
                                                )}
                                            </div>
                                            <div className="text-xs font-bold text-right text-zinc-900 pr-1">${item.totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                            {editableItems.length > 1 ? (
                                                <button type="button" onClick={() => handleRemoveEItem(item.id)}
                                                    className="w-7 h-7 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors text-xs">✕</button>
                                            ) : <div />}
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. Adjustments + Summary */}
                        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 justify-between">
                            <div className="flex-1 space-y-4">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 pb-2 border-b border-zinc-100">3. Final Adjustments</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Global Discount</label>
                                        <div className="relative flex items-center">
                                            <div className="absolute inset-y-0 left-0 flex items-center">
                                                <select
                                                    value={globalDiscountType}
                                                    onChange={(e) => { setGlobalDiscountType(e.target.value as '$' | '%'); setIsDirty(true); }}
                                                    className="h-full py-0 pl-1.5 pr-5 border-transparent bg-transparent text-zinc-500 text-xs rounded-l-lg focus:ring-0"
                                                >
                                                    <option value="$">$</option>
                                                    <option value="%">%</option>
                                                </select>
                                            </div>
                                            <input
                                                type="number" min="0" step="0.01"
                                                value={editableDiscount}
                                                onChange={(e) => { setEditableDiscount(e.target.value); setIsDirty(true); }}
                                                className="w-full pl-12 bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 p-2.5 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-1.5">Freight / Delivery ($)</label>
                                        <div className="relative flex items-center">
                                            <span className="absolute left-3 text-zinc-400 text-xs">$</span>
                                            <input
                                                type="number" min="0" step="0.01"
                                                value={editableFreight}
                                                onChange={(e) => { setEditableFreight(e.target.value); setIsDirty(true); }}
                                                className="w-full pl-8 bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 p-2.5 outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full lg:w-80 bg-zinc-50 p-6 rounded-xl border border-zinc-200 space-y-3 text-sm self-end">
                                <div className="flex justify-between text-zinc-500 font-medium">
                                    <span>Subtotal</span>
                                    <span className="text-zinc-900">${eSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                {eDiscountAmt > 0 && (
                                    <div className="flex justify-between text-emerald-600 font-bold">
                                        <span>Discount ({globalDiscountType === '%' ? `${editableDiscount}%` : `$${eDiscountAmt.toFixed(2)}`})</span>
                                        <span>-${eDiscountAmt.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                {eFreight > 0 && (
                                    <div className="flex justify-between text-zinc-600 font-medium">
                                        <span>Freight</span>
                                        <span className="text-zinc-900">${eFreight.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-zinc-500 font-medium">
                                    <span>Est. Tax (7%)</span>
                                    <span className="text-zinc-900">${eTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black text-zinc-900 pt-4 border-t border-zinc-200 mt-4">
                                    <span>Total</span>
                                    <span>${eTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                {isDirty && (
                                    <button
                                        onClick={handleSaveOrder}
                                        className="w-full mt-2 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        💾 Save Order Changes
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 4. Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100">
                            <button 
                                onClick={handleDeleteOrder}
                                className="w-full sm:w-auto px-6 py-2.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors"
                            >
                                Delete Order
                            </button>
                            <button className="w-full sm:w-auto px-6 py-2.5 border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 rounded-xl text-sm font-bold transition-colors shadow-sm">
                                Issue Refund
                            </button>
                            <button className="w-full sm:w-auto px-6 py-2.5 border border-zinc-300 text-zinc-700 bg-white hover:bg-zinc-50 rounded-xl text-sm font-bold transition-colors shadow-sm">
                                Process Return
                            </button>
                        </div>


                    </div>
                </div>

                {/* Print Template - hidden on screen, visible on print */}
                <QuotePrintTemplate
                    orderId={selectedOrder.orderNumber?.toString().padStart(4, '0') || selectedOrder.id}

                    status={selectedOrder.status}
                    createdAt={selectedOrder.createdAt}
                    clientName={selectedClient?.name || selectedOrder.client?.name || ""}
                    clientCompany={selectedClient?.company || selectedOrder.client?.company}
                    clientEmail={selectedClient?.email || selectedOrder.client?.email}
                    clientPhone={selectedClient?.phone || selectedOrder.client?.phone}
                    shippingAddress={editableShipping}
                    billingAddress={editableBilling}
                    items={editableItems}
                    subtotal={eSubtotal}
                    discount={eDiscountAmt}
                    freight={eFreight}
                    tax={eTax}
                    total={eTotal}
                />
            </div >
        );
    }


    return (
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end px-1 sm:px-0">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">Sales Pipeline</h1>
                    <p className="text-zinc-500 mt-1 text-xs sm:text-sm">Manage orders, issue refunds, and track fulfillment.</p>
                </div>
                <Link
                    href="/admin/orders/new"
                    className="w-full sm:w-auto bg-zinc-900 text-white text-center px-6 py-3 sm:py-2 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all shadow-lg active:scale-95"
                >
                    + Create Order
                </Link>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden flex flex-col mx-1 sm:mx-0">
                {/* Search Bar */}
                <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full max-w-2xl">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs">🔍</div>
                            <input
                                type="text"
                                placeholder="Search orders, clients, phone..."
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-zinc-300 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 bg-white shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-white border border-zinc-300 text-zinc-700 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500 font-semibold shadow-sm cursor-pointer min-w-[160px]"
                        >
                            <option value="updatedAt">Latest Activity</option>
                            <option value="createdAt">Date Created</option>
                            <option value="total">Order Total</option>
                        </select>
                    </div>
                    <span className="text-xs font-bold text-zinc-400 bg-zinc-200/50 px-3 py-1.5 rounded-full w-fit">
                        {filteredOrders.length} records
                    </span>
                </div>

                {/* Table Layout */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-600">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Order</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Client</th>
                                <th className="px-6 py-4 font-semibold hidden md:table-cell">Contact</th>
                                <th className="px-6 py-4 font-semibold hidden lg:table-cell text-right">Total Value</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredOrders.map(order => (
                                <tr
                                    key={order.id}
                                    onClick={() => handleSelectOrder(order)}
                                    className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-5 font-bold text-zinc-900 uppercase tracking-wide">
                                        Order : {order.orderNumber?.toString().padStart(4, '0') || order.id.slice(0, 8)}
                                    </td>

                                    <td className="px-6 py-5 whitespace-nowrap text-zinc-500 font-medium">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5 font-bold text-zinc-900">
                                        {order.client?.name}
                                        <div className="text-xs text-zinc-500 font-medium mt-1">{order.client?.company}</div>
                                    </td>
                                    <td className="px-6 py-5 hidden md:table-cell text-zinc-500 text-xs font-medium">
                                        {order.client?.phone}
                                    </td>
                                    <td className="px-6 py-5 hidden lg:table-cell font-black text-zinc-900 text-right">
                                        ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
                                            ${order.status === 'Quote' ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : ''}
                                            ${order.status === 'Invoice Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                            ${order.status === 'Paid' || order.status === 'Unfulfilled' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                            ${order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                        `}>
                                            {order.status === 'Paid' ? 'Paid / Unfulfilled' : order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center text-zinc-500">
                                        <div className="text-4xl mb-3">🔍</div>
                                        <div className="font-semibold text-zinc-900 text-lg">No orders found</div>
                                        <div className="text-sm mt-1">We couldn't find anything matching "{searchQuery}"</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
