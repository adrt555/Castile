"use client";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    FolderKanban,
    ChefHat,
    Users,
    Package,
    Layers,
    Bath,
    DollarSign,
    ClipboardList,
    Menu,
    X
} from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // Even if the API call fails, still redirect
        }
        router.replace("/login");
        router.refresh();
    };

    const navLinks = [
        { href: "/admin",               icon: LayoutDashboard, label: "Dashboard" },
        { href: "/admin/orders",         icon: ShoppingCart, label: "Sales Pipeline" },
        { href: "/admin/projects",       icon: FolderKanban, label: "Projects" },
        { href: "/admin/kitchen-sales", icon: ChefHat, label: "Kitchen Sales" },
        { href: "/admin/clients",        icon: Users, label: "Clients" },
        { href: "/admin/products",       icon: Package,  label: "Product Catalog" },
        { href: "/admin/products-roca-laufen", icon: Layers, label: "Product Catalog Roca + Laufen" },
        { href: "/admin/products-bathonomy", icon: Bath, label: "Product Catalog Bathonomy" },
        { href: "/admin/finance",        icon: DollarSign, label: "Accounting" },
        { href: "/admin/purchase-orders",icon: ClipboardList, label: "Purchase Orders" },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white">
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-zinc-900">Castile ERP</h1>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Admin Portal</p>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-zinc-400 p-1 hover:text-zinc-600 transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navLinks.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-amber-50 text-amber-700"
                                    : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                            }`}
                        >
                            <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-amber-600" : "text-zinc-400"}`} />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-zinc-200">
                <Link href="/" className="block w-full text-center px-3 py-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                    &larr; Exit to Storefront
                </Link>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans overflow-hidden print:overflow-visible print:h-auto print:block">
            {/* MOBILE SIDEBAR OVERLAY */}
            {isSidebarOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-300">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex w-64 bg-white border-r border-zinc-200 flex-col shrink-0 h-full print:hidden">
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-full relative print:overflow-visible print:h-auto print:block">
                <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 sm:px-8 shrink-0 relative z-40 print:hidden">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="text-sm text-zinc-500 font-medium hidden sm:block">Logged in as Administrator</div>
                        <div className="text-sm font-bold text-zinc-900 sm:hidden">Castile ERP</div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 hover:bg-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                        >
                            A
                        </button>

                        {isProfileMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg py-2 z-50">
                                    <div className="px-4 py-3 border-b border-zinc-100 mb-1">
                                        <p className="text-sm font-semibold text-zinc-900">Adrian</p>
                                        <p className="text-xs text-zinc-500 truncate mt-0.5">adrian@castileusa.com</p>
                                    </div>
                                    <div className="px-2 py-1 space-y-1 text-sm">
                                        <button onClick={() => setIsProfileMenuOpen(false)} className="w-full text-left px-3 py-2 rounded-md font-medium text-zinc-700 hover:bg-zinc-100 transition-colors">Account Settings</button>
                                        <button onClick={() => setIsProfileMenuOpen(false)} className="w-full text-left px-3 py-2 rounded-md font-medium text-zinc-700 hover:bg-zinc-100 transition-colors">Support</button>
                                    </div>
                                    <div className="border-t border-zinc-100 mt-1 pt-1 px-2">
                                        <button onClick={() => { setIsProfileMenuOpen(false); handleLogout(); }} className="w-full text-left px-3 py-2 rounded-md font-semibold text-red-600 hover:bg-red-50 transition-colors">Sign Out</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 print:p-0 print:overflow-visible print:h-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}