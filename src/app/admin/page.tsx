import { getClients } from "@/app/actions/clientActions";
import { getOrders } from "@/app/actions/orderActions";
import { getFinanceSummary } from "@/app/actions/financeActions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const finance = await getFinanceSummary();
    const clients = await getClients();
    const orders = await getOrders();

    const pendingQuotes = orders.filter(o => o.status === 'Quote' || o.status === 'Invoice Sent').length;
    const unfulfilledOrders = orders.filter(o => o.status === 'Paid' || o.status === 'Unfulfilled').length;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
                <p className="text-zinc-500 mt-2">Overview of your Castile business operations.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                    <div className="text-sm font-medium text-zinc-500 mb-1">Total Revenue (Paid)</div>
                    <div className="text-3xl font-bold text-zinc-900">
                        ${finance.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                    <div className="text-sm font-medium text-zinc-500 mb-1">Net Profit</div>
                    <div className="text-3xl font-bold text-emerald-600">
                        ${finance.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                    <div className="text-sm font-medium text-zinc-500 mb-1">Pending Quotes</div>
                    <div className="text-3xl font-bold text-amber-600">
                        {pendingQuotes}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                    <div className="text-sm font-medium text-zinc-500 mb-1">Total Clients</div>
                    <div className="text-3xl font-bold text-zinc-900">
                        {clients.length}
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-zinc-900">Action Required: Orders</h2>
                        <Link href="/admin/orders" className="text-sm text-amber-600 hover:text-amber-700 font-medium">View Pipeline &rarr;</Link>
                    </div>
                    <div className="divide-y divide-zinc-100">
                        {orders.filter(o => o.status !== 'Delivered').map(order => {
                            const client = (order as any).client;
                            return (
                                <div key={order.id} className="p-6 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                                    <div>
                                        <div className="font-medium text-zinc-900">{client?.name} ({client?.company})</div>
                                        <div className="text-sm text-zinc-500 mt-1">Order {order.id} &bull; {order.items.length} items</div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider
                      ${order.status === 'Quote' ? 'bg-zinc-100 text-zinc-800' : ''}
                      ${order.status === 'Invoice Sent' ? 'bg-blue-100 text-blue-800' : ''}
                      ${order.status === 'Paid' || order.status === 'Unfulfilled' ? 'bg-amber-100 text-amber-800' : ''}
                    `}>
                                            {order.status}
                                        </span>
                                        <div className="text-sm font-medium text-zinc-900 mt-1">
                                            ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        {unfulfilledOrders === 0 && pendingQuotes === 0 && (
                            <div className="p-8 text-center text-zinc-500 text-sm">No pending orders or quotes requiring action.</div>
                        )}
                    </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden h-fit">
                    <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50/50">
                        <h2 className="text-lg font-semibold text-zinc-900">Quick Links</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <Link href="/admin/products" className="group flex items-center p-3 -m-3 rounded-lg hover:bg-zinc-50 transition-colors">
                            <div className="w-10 h-10 rounded bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border group-hover:border-zinc-200 transition-all text-xl">📦</div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-zinc-900">Manage Catalog</div>
                                <div className="text-xs text-zinc-500">Update pricing and inventory</div>
                            </div>
                        </Link>
                        <Link href="/admin/finance" className="group flex items-center p-3 -m-3 rounded-lg hover:bg-zinc-50 transition-colors">
                            <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border group-hover:border-zinc-200 transition-all text-xl">📈</div>
                            <div className="ml-4">
                                <div className="text-sm font-medium text-zinc-900">Accounting</div>
                                <div className="text-xs text-zinc-500">View ledgers and profit margins</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
}
