"use client";
import Link from "next/link";
import { ReactNode, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Middleware already handles auth — if we reach this component, user is authenticated.
    // No need for client-side auth check anymore.

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
        { href: "/admin",               icon: "📊", label: "Dashboard" },
        { href: "/admin/orders",         icon: "📋", label: "Sales Pipeline" },
        { href: "/admin/clients",        icon: "👥", label: "Clients" },
        { href: "/admin/products",       icon: "🗂️",  label: "Product Catalog" },
        { href: "/admin/finance",        icon: "💰", label: "Accounting" },
        { href: "/admin/purchase-orders",icon: "🏭", label: "Purchase Orders", indent: true },
    ];

    return (
        <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col">
                <div className="p-6 border-b border-zinc-200">
                    <h1 className="text-xl font-bold tracking-tight text-zinc-900">Castile ERP</h1>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-semibold">Admin Portal</p>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navLinks.map(({ href, icon, label, indent }) => {
                        const isActive = pathname === href;
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-2.5 ${indent ? "pl-7 pr-3" : "px-3"} py-2.5 rounded-md text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-amber-50 text-amber-700"
                                        : indent
                                            ? "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                                            : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                                }`}
                            >
                                <span className="text-base leading-none">{icon}</span>
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
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-8 shrink-0 relative">
                    <div className="text-sm text-zinc-500 font-medium">Logged in as Administrator</div>

                    <div className="relative">
                        <button
                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                            title="Account Menu"
                            className="h-8 w-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-600 hover:bg-zinc-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                        >
                            A
                        </button>

                        {isProfileMenuOpen && (
                            <>
                                {/* Invisible overlay to close dropdown when clicking outside */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsProfileMenuOpen(false)}
                                ></div>

                                <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg py-2 z-50">
                                    <div className="px-4 py-3 border-b border-zinc-100 mb-1">
                                        <p className="text-sm font-semibold text-zinc-900">Adrian</p>
                                        <p className="text-xs text-zinc-500 truncate mt-0.5">adrian@castileusa.com</p>
                                    </div>
                                    <div className="px-2 py-1 space-y-1">
                                        <button
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                                        >
                                            Account Settings
                                        </button>
                                        <button
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                                        >
                                            Support
                                        </button>
                                    </div>
                                    <div className="border-t border-zinc-100 mt-1 pt-1 px-2">
                                        <button
                                            onClick={() => {
                                                setIsProfileMenuOpen(false);
                                                handleLogout();
                                            }}
                                            className="w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
