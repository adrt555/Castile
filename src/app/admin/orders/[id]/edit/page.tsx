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
    const [selectedClientId, setSelectedClientId] = useState<string>("");
    const [clientSearch, setClientSearch] = useState("");
    const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
    const [orderItems, setOrderItems] = useState<Array<{ productIdx: number, quantity: string, discount: string, discountType: '$' | '%' }>>([
        { productIdx: -1, quantity: "", discount: "0", discountType: '$' }
    ]);
    const [discount, setDiscount] = useState<string>("0");
    const [globalDiscountType, setGlobalDiscountType] = useState<'$' | '%'>('$');
    const [freight, setFreight] = useState<string>("0");
    const [shippingAddress, setShippingAddress] = useState<string>("");
    const [billingAddress, setBillingAddress] = useState<string>("");

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
        if (existingOrder) {
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
                    const pIdx = products.findIndex(p => p.id === item.productId);
                    return {
                        productIdx: pIdx,
                        quantity: item.quantitySqft.toString(),
                        discount: "0", // For simplicity, we assume line discounts aren't mapped unless stored
                        discountType: '$' as const
                    };
                });
                setOrderItems(mappedItems);
            }
        }
    }, [existingOrder?.id]);

    const handleAddItem = () => {
        setOrderItems([...orderItems, { productIdx: -1, quantity: "", discount: "0", discountType: '$' }]);
    };

    const handleRemoveItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: 'productIdx' | 'quantity' | 'discount' | 'discountType', value: string) => {
        const newItems = [...orderItems];
        if (field === 'productIdx') {
            newItems[index].productIdx = parseInt(value);
        } else if (field === 'quantity') {
            newItems[index].quantity = value;
        } else if (field === 'discount') {
            newItems[index].discount = value;
        } else if (field === 'discountType') {
            newItems[index].discountType = value as '$' | '%';
        }
        setOrderItems(newItems);
    };

    // Calculate Totals
    let subtotal = 0;
    const validItems = orderItems.filter(item => item.productIdx >= 0 && parseFloat(item.quantity) > 0);

    validItems.forEach(item => {
        const product = products[item.productIdx] as unknown as CRMProduct;
        const qty = parseFloat(item.quantity);
        const lineGross = (product.sellingPricePerSqft || 0) * qty;
        const lineDiscountInput = parseFloat(item.discount) || 0;
        const lineDiscount = item.discountType === '%' ? lineGross * (lineDiscountInput / 100) : lineDiscountInput;
        subtotal += Math.max(0, lineGross - lineDiscount); // Add the net line total to the subtotal
    });

    const parsedDiscountInput = parseFloat(discount) || 0;
    const parsedDiscount = globalDiscountType === '%' ? subtotal * (parsedDiscountInput / 100) : parsedDiscountInput;
    const parsedFreight = parseFloat(freight) || 0;
    const discountedSubtotal = Math.max(0, subtotal - parsedDiscount);
    const tax = discountedSubtotal * 0.07; // 7% mock tax
    const total = discountedSubtotal + tax + parsedFreight;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedClientId) return alert("Please select a client.");
        if (validItems.length === 0) return alert("Please add at least one valid product.");

        // Map items to the DB schema
        const mappedItems = validItems.map((item, idx) => {
            const p = products[item.productIdx] as unknown as CRMProduct;
            const q = parseFloat(item.quantity);
            const lineGross = (p.sellingPricePerSqft || 0) * q;
            const lineDiscountInput = parseFloat(item.discount) || 0;
            const lineDiscount = item.discountType === '%' ? lineGross * (lineDiscountInput / 100) : lineDiscountInput;
            const netTotalPrice = Math.max(0, lineGross - lineDiscount);

            return {
                id: undefined, // let prisma generate id on update recreation
                productId: p.id,
                productName: p.name,
                colorName: p.colors?.[0] || 'Base', // Support arrays
                size: p.sizes?.[0] || 'Standard',  // Support arrays
                quantitySqft: q,
                unitPrice: p.sellingPricePerSqft || 0,
                totalPrice: netTotalPrice
            };
        });

        // Update the Mock DB
        await updateOrder(id, {
            clientId: selectedClientId,
            items: mappedItems,
            subtotal,
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
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Edit Quote <span className="text-amber-500">#{id}</span></h1>
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
                            onClick={handleAddItem}
                            className="text-sm font-bold text-amber-600 hover:text-amber-700"
                        >
                            + Add Line Item
                        </button>
                    </div>
                    <div className="p-6">
                        {orderItems.map((item, index) => (
                            <div key={index} className="flex gap-4 items-end mb-6 pb-6 border-b border-zinc-100 last:border-0 last:mb-0 last:pb-0">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">Product</label>
                                    <select
                                        value={item.productIdx}
                                        onChange={(e) => handleItemChange(index, 'productIdx', e.target.value)}
                                        className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none"
                                        required
                                    >
                                        <option value="-1">-- Select a Product --</option>
                                        {products.map((p: any, idx) => (
                                            <option key={p.id} value={idx}>
                                                {p.name} - {p.colors?.[0] || 'Base'} - {p.sizes?.[0] || 'Standard'} (${p.sellingPricePerSqft?.toFixed(2)}/sqft)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 outline-none"
                                        placeholder="0"
                                        required
                                    />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">Discount</label>
                                    <div className="relative flex items-center">
                                        <div className="absolute inset-y-0 left-0 flex items-center">
                                            <select
                                                value={item.discountType}
                                                onChange={(e) => handleItemChange(index, 'discountType', e.target.value)}
                                                className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-zinc-500 sm:text-sm rounded-l-lg focus:ring-amber-500 focus:border-amber-500"
                                            >
                                                <option value="$">$</option>
                                                <option value="%">%</option>
                                            </select>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.discount}
                                            onChange={(e) => handleItemChange(index, 'discount', e.target.value)}
                                            className="w-full bg-white border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-3 pl-14 outline-none"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">Line Total</label>
                                    <div className="p-3 bg-zinc-50 border border-transparent text-sm font-bold text-zinc-900 rounded-lg whitespace-nowrap overflow-hidden text-ellipsis">
                                        ${item.productIdx >= 0 && item.quantity
                                            ? Math.max(0, (((products[item.productIdx] as unknown as CRMProduct)?.sellingPricePerSqft || 0) * parseFloat(item.quantity)) - (item.discountType === '%' ? (((products[item.productIdx] as unknown as CRMProduct)?.sellingPricePerSqft || 0) * parseFloat(item.quantity)) * (parseFloat(item.discount) / 100 || 0) : (parseFloat(item.discount) || 0))).toFixed(2)
                                            : "0.00"}
                                    </div>
                                </div>
                                {orderItems.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="mb-1 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        ✕
                                    </button>
                                )}
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
                                <span>${subtotal.toFixed(2)}</span>
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
