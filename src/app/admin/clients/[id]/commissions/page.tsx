"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getClientById } from "@/app/actions/clientActions";
import { getCreditHistory, addCredit, subtractCredit } from "@/app/actions/commissionActions";

export default function ClientCommissionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [client, setClient] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        const [c, h] = await Promise.all([
            getClientById(id),
            getCreditHistory(id)
        ]);
        setClient(c);
        setHistory(h);
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [id]);

    const handleTransaction = async (type: 'ADD' | 'SUBTRACT') => {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) return alert("Please enter a valid amount");
        if (!reason) return alert("Please enter a reason");

        setIsSubmitting(true);
        const res = type === 'ADD' 
            ? await addCredit(id, numAmount, reason)
            : await subtractCredit(id, numAmount, reason);

        if (res.success) {
            setAmount("");
            setReason("");
            loadData();
        } else {
            alert("Error: " + res.error);
        }
        setIsSubmitting(false);
    };

    if (isLoading) return <div className="p-8 text-zinc-500">Loading commission data...</div>;
    if (!client) return <div className="p-8 text-red-500">Client not found</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/clients" className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-900">
                    &larr;
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Manage Commissions & Credits</h1>
                    <p className="text-zinc-500 text-sm mt-1">Client: <span className="font-bold text-zinc-700">{client.name}</span> &bull; {client.company}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Balance Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-zinc-900 rounded-2xl p-8 text-white shadow-xl border border-zinc-800">
                        <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Available Credit</div>
                        <div className="text-4xl font-black tracking-tight">${client.commissionCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm space-y-4">
                        <h3 className="font-bold text-zinc-900 text-sm border-b border-zinc-100 pb-3">Adjust Balance</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-400 mb-1">Amount ($)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00" 
                                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg p-3 outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-wide text-zinc-400 mb-1">Reason / Note</label>
                                <textarea 
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="e.g. Sales commission for Order #1234" 
                                    rows={3}
                                    className="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 text-sm rounded-lg p-3 outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button 
                                    onClick={() => handleTransaction('SUBTRACT')}
                                    disabled={isSubmitting}
                                    className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                                >
                                    - Subtract
                                </button>
                                <button 
                                    onClick={() => handleTransaction('ADD')}
                                    disabled={isSubmitting}
                                    className="bg-amber-500 hover:bg-amber-400 text-amber-950 py-3 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm disabled:opacity-50"
                                >
                                    + Add Credit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Card */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-zinc-900 text-sm">Transaction History</h2>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase bg-zinc-100 px-2 py-1 rounded-full">{history.length} records</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-zinc-100">
                        {history.map((log) => (
                            <div key={log.id} className="p-4 flex justify-between items-center hover:bg-zinc-50 transition-colors">
                                <div className="space-y-1">
                                    <div className="text-sm font-bold text-zinc-900">{log.reason || "No reason provided"}</div>
                                    <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">{new Date(log.createdAt).toLocaleString()}</div>
                                </div>
                                <div className={`text-sm font-black ${log.type === 'ADD' ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {log.type === 'ADD' ? '+' : '-'}${log.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                        {history.length === 0 && (
                            <div className="p-12 text-center text-zinc-400 text-sm">No transactions yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
