"use client";
import { useState, useEffect } from "react";
import { getFinanceSummary } from "@/app/actions/financeActions";
import { getOrders } from "@/app/actions/orderActions";
import { FinanceSummary, Order } from "@/lib/types";

export default function FinanceDashboard() {
    const [finance, setFinance] = useState<FinanceSummary | null>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getFinanceSummary(),
            getOrders()
        ]).then(([financeData, ordersData]) => {
            setFinance(financeData as any);
            const allInvoices = ordersData.filter(o => o.status !== "Quote").sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setInvoices(allInvoices);
            setIsLoading(false);
        });
    }, []);

    if (isLoading || !finance) {
        return <div className="text-zinc-500 font-medium">Loading financial data...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Accounting & Finance</h1>
                <p className="text-zinc-500 mt-2">Track your margins, revenue, and generate exportable invoices.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 rounded-xl p-6 text-white shadow-md">
                    <div className="text-sm font-medium text-zinc-400 mb-1">Total Sales Revenue</div>
                    <div className="text-4xl font-bold">${finance.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                    <div className="text-sm font-medium text-zinc-500 mb-1">Total Cost of Goods (COGS)</div>
                    <div className="text-3xl font-bold text-zinc-900">${finance.totalCosts.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 shadow-sm">
                    <div className="text-sm font-medium text-emerald-800 mb-1">Net Profit</div>
                    <div className="text-3xl font-bold text-emerald-600">${finance.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    <div className="text-xs text-emerald-700/70 mt-2 font-medium">Margin: {((finance.netProfit / finance.totalRevenue) * 100).toFixed(1)}%</div>
                </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-zinc-900">Invoice Ledger</h2>
                    <button className="text-sm font-medium text-zinc-600 bg-white border border-zinc-300 px-3 py-1.5 rounded-md hover:bg-zinc-50 transition-colors">
                        Export CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-600">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Invoice #</th>
                                <th className="px-6 py-4 font-semibold">Client</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {invoices.map(inv => {
                                const client = inv.client;
                                return (
                                    <tr key={inv.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-zinc-900">INV-{inv.id.split('_')[1]}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-900">{client?.name}</div>
                                            <div className="text-xs text-zinc-500">{client?.company}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-zinc-900">${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider
                                        ${inv.status === 'Invoice Sent' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}
                                        `}>
                                                {inv.status === 'Invoice Sent' ? 'Unpaid' : 'Paid'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-blue-600 font-medium hover:text-blue-800 text-sm">Print PDF</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
