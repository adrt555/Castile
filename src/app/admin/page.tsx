import { getClients } from "@/app/actions/clientActions";
import { getOrders } from "@/app/actions/orderActions";
import { getFinanceSummary } from "@/app/actions/financeActions";
import { getKitchenQuotes } from "@/app/actions/kitchenQuoteActions";
import { getProjects } from "@/app/actions/projectActions";
import Link from "next/link";
import { 
    Sliders, 
    ArrowRight, 
    DollarSign, 
    Users, 
    Briefcase,
    LayoutDashboard,
    TrendingUp,
    CheckCircle,
    FolderKanban,
    Compass
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const finance = await getFinanceSummary();
    const clients = await getClients();
    const orders = await getOrders();
    const kitchenQuotes = await getKitchenQuotes();
    const projects = await getProjects();

    const pendingQuotes = orders.filter(o => o.status === 'Quote' || o.status === 'Invoice Sent').length;
    const unfulfilledOrders = orders.filter(o => o.status === 'Paid' || o.status === 'Unfulfilled').length;
    
    // Paid kitchen quotes are Approved, In Production, or Installed
    const paidKitchenProjects = kitchenQuotes.filter(q => q.status === 'Approved' || q.status === 'In Production' || q.status === 'Installed');

    // Paid specification projects represent paid/active projects (Approved, Paid, In Production, Installed)
    const paidProjects = projects.filter(p => p.status === 'Approved' || p.status === 'Paid' || p.status === 'In Production' || p.status === 'Installed');

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
                    <LayoutDashboard className="h-8 w-8 text-amber-600" />
                    Admin Dashboard
                </h1>
                <p className="text-zinc-500 mt-1 sm:mt-2 text-sm sm:text-base">Overview of your Castile tile orders, specification projects, and custom kitchen installations.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Total Revenue (Paid)</div>
                    <div className="text-3xl font-black text-zinc-900">
                        ${finance.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Net Profit</div>
                    <div className="text-3xl font-black text-emerald-600">
                        ${finance.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Pending Quotes</div>
                    <div className="text-3xl font-black text-amber-600">
                        {pendingQuotes}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">Total Clients</div>
                    <div className="text-3xl font-black text-zinc-900">
                        {clients.length}
                    </div>
                </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Kitchen Projects Panel */}
                    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-orange-500" />
                                Active Kitchen Projects (Paid)
                            </h2>
                            <Link href="/admin/kitchen-sales" className="text-xs text-orange-600 hover:text-orange-700 font-bold uppercase tracking-wider">Manage Pipeline &rarr;</Link>
                        </div>
                        <div className="divide-y divide-zinc-100">
                            {paidKitchenProjects.map(project => (
                                <Link 
                                    key={project.id} 
                                    href={`/admin/kitchen-sales`}
                                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 hover:bg-zinc-50 transition-colors"
                                >
                                    <div>
                                        <div className="font-bold text-zinc-955 text-sm sm:text-base">{project.clientName}</div>
                                        <div className="text-xs text-zinc-500 mt-1 flex flex-wrap items-center gap-1.5">
                                            <span className="font-medium">{project.projectAddress}</span>
                                            <span>&bull;</span>
                                            <span className="font-medium">{project.style || "Custom"}</span>
                                            <span>&bull;</span>
                                            <span className="font-semibold text-zinc-600">{project.items.length} specifications</span>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right shrink-0">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border
                                            ${project.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                            ${project.status === 'In Production' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                                            ${project.status === 'Installed' ? 'bg-teal-50 text-teal-700 border-teal-200' : ''}
                                        `}>
                                            {project.status}
                                        </span>
                                        <div className="text-xs sm:text-sm font-black text-zinc-900 mt-1">
                                            ${project.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {paidKitchenProjects.length === 0 && (
                                <div className="p-8 text-center text-zinc-500 text-sm font-medium">No active paid kitchen projects. Approve a quote in the pipeline to track progress here!</div>
                            )}
                        </div>
                    </div>

                    {/* Active Specification Projects Panel */}
                    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <FolderKanban className="h-5 w-5 text-blue-500" />
                                Active Specification Projects (Paid)
                            </h2>
                            <Link href="/admin/projects" className="text-xs text-blue-600 hover:text-blue-700 font-bold uppercase tracking-wider">Manage Pipeline &rarr;</Link>
                        </div>
                        <div className="divide-y divide-zinc-100">
                            {paidProjects.map(project => (
                                <Link 
                                    key={project.id} 
                                    href={`/admin/projects/${project.id}`}
                                    className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 hover:bg-zinc-50 transition-colors"
                                >
                                    <div>
                                        <div className="font-bold text-zinc-955 text-sm sm:text-base">{project.name || "Unnamed Project"}</div>
                                        <div className="text-xs text-zinc-500 mt-1 flex flex-wrap items-center gap-1.5">
                                            <span className="font-semibold text-zinc-700">{project.client?.name || "Guest Client"}</span>
                                            <span>&bull;</span>
                                            <span className="font-medium">{project.address || "No Address"}</span>
                                            <span>&bull;</span>
                                            <span className="font-semibold text-zinc-600">PRJ-{project.projectNumber}</span>
                                        </div>
                                    </div>
                                    <div className="text-left sm:text-right shrink-0">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border
                                            ${project.status === 'Approved' || project.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : ''}
                                            ${project.status === 'Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                            ${project.status === 'In Production' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}
                                            ${project.status === 'Installed' ? 'bg-teal-50 text-teal-700 border-teal-200' : ''}
                                            ${project.status === 'Draft' ? 'bg-zinc-50 text-zinc-600 border-zinc-200' : ''}
                                            ${project.status === 'Lost' ? 'bg-red-50 text-red-700 border-red-200' : ''}
                                        `}>
                                            {project.status}
                                        </span>
                                        <div className="text-xs sm:text-sm font-black text-zinc-900 mt-1">
                                            ${project.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {paidProjects.length === 0 && (
                                <div className="p-8 text-center text-zinc-500 text-sm font-medium">No active paid specification projects. Set a project status to Approved or Paid to track progress here!</div>
                            )}
                        </div>
                    </div>

                    {/* Action Required: Orders Panel */}
                    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-amber-500" />
                                Action Required: Tile Orders
                            </h2>
                            <Link href="/admin/orders" className="text-xs text-amber-600 hover:text-amber-700 font-bold uppercase tracking-wider">View Sales Pipeline &rarr;</Link>
                        </div>
                        <div className="divide-y divide-zinc-100">
                            {orders.filter(o => o.status !== 'Delivered').map(order => {
                                const client = (order as any).client;
                                return (
                                    <Link 
                                        key={order.id} 
                                        href={`/admin/orders?id=${order.id}`}
                                        className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 hover:bg-zinc-50 transition-colors"
                                    >
                                        <div>
                                            <div className="font-bold text-zinc-955 text-sm sm:text-base">{client?.name}</div>
                                            <div className="text-xs text-zinc-500 mt-1 flex flex-wrap items-center gap-1.5">
                                                <span className="font-semibold text-zinc-700">{client?.company || "Guest Client"}</span>
                                                <span>&bull;</span>
                                                <span>Order #{order.orderNumber?.toString().padStart(4, '0') || order.id.slice(0, 8)}</span>
                                                <span>&bull;</span>
                                                <span className="font-medium">{order.items.length} products</span>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right shrink-0">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border
                                                ${order.status === 'Quote' ? 'bg-zinc-50 text-zinc-600 border-zinc-200' : ''}
                                                ${order.status === 'Invoice Sent' ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                                                ${order.status === 'Paid' || order.status === 'Unfulfilled' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}
                                            `}>
                                                {order.status === 'Paid' ? 'Paid / Unful.' : order.status}
                                            </span>
                                            <div className="text-xs sm:text-sm font-black text-zinc-900 mt-1">
                                                ${order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                            {unfulfilledOrders === 0 && pendingQuotes === 0 && (
                                <div className="p-8 text-center text-zinc-500 text-sm font-medium">No pending tile orders requiring action.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar panel */}
                <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden h-fit">
                    <div className="px-6 py-5 border-b border-zinc-200 bg-zinc-50/50">
                        <h2 className="text-lg font-bold text-zinc-900">Quick Links</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <Link href="/admin/products" className="group flex items-center p-3 -m-3 rounded-lg hover:bg-zinc-50 transition-colors">
                            <div className="w-10 h-10 rounded bg-zinc-100 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border group-hover:border-zinc-200 transition-all font-semibold text-lg">📦</div>
                            <div className="ml-4">
                                <div className="text-sm font-bold text-zinc-900">Manage Catalog</div>
                                <div className="text-xs text-zinc-500">Update pricing and inventory</div>
                            </div>
                        </Link>
                        <Link href="/admin/projects" className="group flex items-center p-3 -m-3 rounded-lg hover:bg-zinc-50 transition-colors">
                            <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border group-hover:border-zinc-200 transition-all font-semibold text-lg">📐</div>
                            <div className="ml-4">
                                <div className="text-sm font-bold text-zinc-900">Projects Pipeline</div>
                                <div className="text-xs text-zinc-500">Manage custom specifications</div>
                            </div>
                        </Link>
                        <Link href="/admin/kitchen-sales" className="group flex items-center p-3 -m-3 rounded-lg hover:bg-zinc-50 transition-colors">
                            <div className="w-10 h-10 rounded bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border group-hover:border-zinc-200 transition-all font-semibold text-lg">🍳</div>
                            <div className="ml-4">
                                <div className="text-sm font-bold text-zinc-900">Kitchen Sales</div>
                                <div className="text-xs text-zinc-500">Manage kitchen specifications</div>
                            </div>
                        </Link>
                        <Link href="/admin/finance" className="group flex items-center p-3 -m-3 rounded-lg hover:bg-zinc-50 transition-colors">
                            <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:border group-hover:border-zinc-200 transition-all font-semibold text-lg">💳</div>
                            <div className="ml-4">
                                <div className="text-sm font-bold text-zinc-900">Accounting</div>
                                <div className="text-xs text-zinc-500">View ledgers and profit margins</div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}