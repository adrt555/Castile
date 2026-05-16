"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QuotePrintTemplate from "../../../orders/QuotePrintTemplate";
import { updatePurchaseOrder } from "@/app/actions/purchaseOrderActions";
import { crmProducts } from "@/lib/crmProducts";

interface NewItem {
    id: string;
    productId: string;
    sku: string;
    description: string;
    size: string;
    sqftPerBox: number;
    boxesPerPallet: number;
    boxes: number;
    quantitySqft: number;
    unitCost: number;
    totalLineCost: number;
}

const makeItem = (): NewItem => ({
    id: `item_${Date.now()}_${Math.random()}`,
    productId: '', sku: '', description: '', size: '',
    sqftPerBox: 0, boxesPerPallet: 0, boxes: 0, quantitySqft: 0,
    unitCost: 0, totalLineCost: 0,
});

export default function EditPurchaseOrderClient({ po }: { po: any }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const [manufacturer, setManufacturer] = useState(po.manufacturer);
    const [notes, setNotes] = useState(po.notes || '');
    const [expectedDate, setExpectedDate] = useState(po.expectedDate || '');
    const [status, setStatus] = useState<any>(po.status);
    const [freight, setFreight] = useState(po.freight.toString());
    
    const [items, setItems] = useState<NewItem[]>(po.items.map((i: any) => ({
        id: i.id,
        productId: crmProducts.find(p => p.sku === i.sku)?.id || 'unknown',
        sku: i.sku,
        description: i.description,
        size: crmProducts.find(p => p.sku === i.sku)?.size || '',
        sqftPerBox: i.sqftPerBox,
        boxesPerPallet: crmProducts.find(p => p.sku === i.sku)?.boxesPerPallet || 0,
        boxes: i.boxes,
        quantitySqft: i.boxes * i.sqftPerBox, // Assuming boxes * sqftPerBox if not explicitly stored
        unitCost: i.unitCost,
        totalLineCost: i.totalLineCost
    })));

    const [skuMap, setSkuMap] = useState<Record<string, { query: string; open: boolean }>>({});
    const [showPrint, setShowPrint] = useState(false);

    const products = crmProducts;

    const updateItem = (itemId: string, changes: Partial<NewItem>) => {
        setItems(prev => prev.map(item => {
            if (item.id !== itemId) return item;
            const updated = { ...item, ...changes };
            if (changes.quantitySqft !== undefined) {
                updated.boxes = updated.sqftPerBox ? Math.ceil(updated.quantitySqft / updated.sqftPerBox) : 0;
            } else if (changes.boxes !== undefined) {
                updated.quantitySqft = updated.boxes * updated.sqftPerBox;
            }
            updated.totalLineCost = (updated.quantitySqft || 0) * (updated.unitCost || 0);
            return updated;
        }));
    };

    const calcRound = (item: NewItem) => {
        if (!item.sqftPerBox) return;
        const boxes = Math.ceil((item.quantitySqft || 0) / item.sqftPerBox);
        const rounded = parseFloat((boxes * item.sqftPerBox).toFixed(4));
        updateItem(item.id, { quantitySqft: rounded });
    };

    const setProduct = (itemId: string, p: any) => {
        updateItem(itemId, {
            productId: p.id,
            sku: p.sku || '',
            description: p.name,
            size: p.size || '',
            sqftPerBox: p.sqftPerBox || 1,
            boxesPerPallet: p.boxesPerPallet || 0,
            unitCost: p.costPricePerSqft || 0,
        });
    };

    const subtotal = items.reduce((s, i) => s + i.totalLineCost, 0);
    const parsedFreight = parseFloat(freight) || 0;
    const tax = 0;
    const total = subtotal + tax + parsedFreight;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!manufacturer.trim()) return alert('Please enter a manufacturer.');
        const valid = items.filter(i => i.productId && (i.boxes > 0 || i.quantitySqft > 0));
        if (!valid.length) return alert('Please add at least one line item.');

        startTransition(async () => {
            await updatePurchaseOrder(po.id, {
                manufacturer,
                status,
                expectedDate: expectedDate || "TBD",
                notes,
                items: valid.map(i => ({
                    sku: i.sku,
                    description: i.description,
                    boxes: i.boxes,
                    sqftPerBox: i.sqftPerBox,
                    unitCost: i.unitCost,
                    totalLineCost: i.totalLineCost,
                })),
                subtotal,
                freight: parsedFreight,
                tax,
                total,
            });
            router.push("/admin/purchase-orders");
        });
    };

    if (showPrint) {
        return (
            <div className="max-w-4xl mx-auto py-12">
                <div className="flex items-center justify-between mb-8 border-b border-zinc-200 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900">Purchase Order: {po.poNumber}</h1>
                        <p className="text-zinc-500">Ready for printing.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => window.print()} className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-semibold flex items-center gap-2">
                            🖨️ Print / Save PDF
                        </button>
                        <button onClick={() => setShowPrint(false)} className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-semibold">
                            Back to Editing
                        </button>
                    </div>
                </div>
                <div className="bg-white border shadow-sm print:shadow-none print:border-none p-12 relative">
                    <QuotePrintTemplate
                        orderId={po.poNumber}
                        status={status}
                        createdAt={po.createdAt}
                        clientName={manufacturer}
                        items={items.filter(i => i.productId && (i.boxes > 0 || i.quantitySqft > 0)).map(i => ({
                            productName: i.description,
                            size: i.size,
                            quantitySqft: i.quantitySqft,
                            unitPrice: i.unitCost,
                            totalPrice: i.totalLineCost,
                        }))}
                        subtotal={subtotal}
                        discount={0}
                        freight={parsedFreight}
                        tax={tax}
                        total={total}
                        documentType="PURCHASE ORDER"
                    />
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-[1400px] mx-auto space-y-8 pb-32">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-6">
                <div>
                    <Link href="/admin/purchase-orders" className="text-amber-600 hover:text-amber-700 font-medium text-sm mb-2 inline-block">← Back to Purchase Orders</Link>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Modify Purchase Order</h1>
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest mt-1">PO: {po.poNumber}</p>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={() => setShowPrint(true)} className="px-5 py-2.5 border border-zinc-200 bg-white text-zinc-700 font-bold hover:bg-zinc-50 rounded-xl transition-colors flex items-center gap-2">
                       🖨️ Print View
                    </button>
                    <Link href="/admin/purchase-orders" className="px-5 py-2.5 text-zinc-600 font-bold hover:bg-zinc-100 rounded-xl transition-colors">Cancel</Link>
                    <button type="submit" disabled={isPending} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-sm transition-colors disabled:bg-zinc-300">
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1 space-y-6">
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-zinc-900 mb-4">Vendor Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Manufacturer / Vendor</label>
                                <input
                                    type="text"
                                    value={manufacturer}
                                    onChange={e => setManufacturer(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Order Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value as any)}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 font-bold text-zinc-900 appearance-none"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="In Production">In Production</option>
                                    <option value="Shipped">Shipped</option>
                                    <option value="Received">Received</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Expected Date</label>
                                <input
                                    type="date"
                                    value={expectedDate}
                                    onChange={e => setExpectedDate(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 font-medium h-24"
                                    placeholder="Internal notes or vendor instructions..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-span-2 space-y-6">
                    <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm">
                        <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 rounded-t-2xl">
                            <h2 className="text-lg font-bold text-zinc-900">Materials (At Cost)</h2>
                            <button type="button" onClick={() => setItems([...items, makeItem()])} className="text-amber-600 hover:text-amber-700 font-bold text-sm bg-amber-50 px-3 py-1.5 rounded-lg">
                                + Add Row
                            </button>
                        </div>
                        <div className="p-0 overflow-visible relative z-10 w-full min-h-[300px]">
                            <table className="w-full text-left text-sm relative">
                                <thead className="bg-white text-xs uppercase tracking-wider text-zinc-400 border-b border-zinc-100">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold w-5/12">Product & SKU</th>
                                        <th className="px-6 py-4 font-semibold text-center">Sqft Qty</th>
                                        <th className="px-6 py-4 font-semibold text-center">Logistics</th>
                                        <th className="px-6 py-4 font-semibold text-right">Unit Cost</th>
                                        <th className="px-6 py-4 font-semibold text-right">Ext Cost</th>
                                        <th className="px-6 py-4 font-semibold w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {items.map((item, idx) => (
                                        <tr key={item.id} className="group relative">
                                            <td className="px-6 py-4 relative z-50">
                                                <div className="relative w-full">
                                                    <input
                                                        type="text"
                                                        placeholder="Search product (SKU/Name)..."
                                                        value={skuMap[item.id]?.query ?? item.sku}
                                                        onChange={e => {
                                                            setSkuMap(prev => ({ ...prev, [item.id]: { query: e.target.value, open: true } }));
                                                        }}
                                                        onFocus={() => {
                                                            setSkuMap(prev => ({ ...prev, [item.id]: { query: prev[item.id]?.query ?? item.sku, open: true } }));
                                                        }}
                                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-amber-500 font-bold text-zinc-900"
                                                    />
                                                    {item.productId && (
                                                        <div className="text-xs text-amber-600 font-bold truncate mt-1.5 pl-1">
                                                            {item.description} {item.size && <span className="text-zinc-500 font-medium">({item.size})</span>}
                                                        </div>
                                                    )}
                                                    {skuMap[item.id]?.open && (
                                                        <>
                                                            <div className="fixed inset-0 z-40" onClick={() => setSkuMap(prev => ({ ...prev, [item.id]: { ...prev[item.id], open: false } }))} />
                                                            <div className="absolute top-full left-0 mt-1 w-[400px] bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                                                <div className="max-h-64 overflow-y-auto p-2">
                                                                    {products
                                                                        .filter(p => !skuMap[item.id]?.query || p.name.toLowerCase().includes(skuMap[item.id].query.toLowerCase()) || p.sku.toLowerCase().includes(skuMap[item.id].query.toLowerCase()))
                                                                        .slice(0, 8)
                                                                        .map(p => (
                                                                            <button
                                                                                key={p.id}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setProduct(item.id, p);
                                                                                    setSkuMap(prev => ({ ...prev, [item.id]: { query: '', open: false } }));
                                                                                }}
                                                                                className="w-full text-left px-3 py-2 hover:bg-amber-50 rounded-lg flex flex-col"
                                                                            >
                                                                                <span className="font-bold text-zinc-900 border-b border-zinc-100 pb-1">{p.name} <span className="text-zinc-400 font-normal ml-1">({p.sku})</span></span>
                                                                                <span className="text-xs text-amber-600 font-semibold pt-1">Cost: ${p.costPricePerSqft.toFixed(2)}/sf <span className="text-zinc-400 font-normal ml-2">Retail: ${p.sellingPricePerSqft.toFixed(2)} <span className="ml-2">Pkg: {p.sqftPerBox}sf/box</span></span></span>
                                                                            </button>
                                                                        ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="Sqft"
                                                        value={item.quantitySqft || ''}
                                                        onChange={e => updateItem(item.id, { quantitySqft: parseFloat(e.target.value) || 0 })}
                                                        className="w-28 bg-white border border-zinc-200 rounded-lg px-3 py-2 text-center outline-none focus:border-amber-500 font-bold text-zinc-800"
                                                    />
                                                    <button type="button" onClick={() => calcRound(item)} disabled={!item.sqftPerBox} className="text-[10px] font-bold text-white bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-200 disabled:text-zinc-400 rounded transition-colors px-2 py-1 w-full max-w-[112px]">
                                                        🧮 Round up
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-2 py-4">
                                                <div className="flex flex-col gap-1 items-center justify-center">
                                                    <div className={`text-xs font-bold px-2 py-1.5 rounded w-full max-w-[100px] text-center ${item.productId && item.boxes > 0 ? 'bg-blue-50 border border-blue-100 text-blue-700' : 'text-zinc-300'}`}>
                                                        📦 {item.boxes} Boxes
                                                    </div>
                                                    <div className={`text-xs font-bold px-2 py-1.5 rounded w-full max-w-[100px] text-center ${item.productId && item.boxes > 0 && item.boxesPerPallet > 0 ? 'bg-amber-50 border border-amber-100 text-amber-700' : 'text-zinc-300'}`}>
                                                        🏗️ {item.boxesPerPallet ? Math.ceil(item.boxes / item.boxesPerPallet) : 0} Pallets
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                                                    <input
                                                        type="number"
                                                        value={item.unitCost || ''}
                                                        onChange={e => updateItem(item.id, { unitCost: parseFloat(e.target.value) || 0 })}
                                                        className="w-28 bg-white border border-zinc-200 rounded-lg pl-8 pr-3 py-2 text-right outline-none focus:border-amber-500 ml-auto block text-red-600 font-bold"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-zinc-900">
                                                ${item.totalLineCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4">
                                                {items.length > 1 && (
                                                    <button type="button" onClick={() => setItems(items.filter(i => i.id !== item.id))} className="text-zinc-300 hover:text-red-500 p-1">✖</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 bg-zinc-50/50 rounded-b-2xl border-t border-zinc-100 mt-12 grid grid-cols-2">
                            <div></div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-zinc-500 font-medium">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-zinc-500 font-medium">Freight</span>
                                    <div className="relative w-32">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">$</span>
                                        <input
                                            type="number"
                                            value={freight}
                                            onChange={e => setFreight(e.target.value)}
                                            className="w-full bg-white border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 text-right outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between text-xl font-black text-zinc-900 pt-3 border-t border-zinc-200">
                                    <span>Total Value</span>
                                    <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
