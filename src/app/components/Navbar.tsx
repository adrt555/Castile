"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchOverlay from "./SearchOverlay";

export default function Navbar() {
    const [searchOpen, setSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Ctrl+K / Cmd+K shortcut to toggle search
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                setSearchOpen((prev) => !prev);
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    const navLinks = [
        { href: "/products", label: "Collections" },
        { href: "/about", label: "Our Story" },
        { href: "/gallery", label: "Gallery" },
        { href: "/contact", label: "Contact" },
    ];

    return (
        <>
            <nav className="fixed w-full z-50 bg-[#454545] border-b border-white/10 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4 sm:gap-12">
                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="md:hidden text-white/70 hover:text-white p-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                        </button>

                        <Link href="/" className="flex items-center gap-2 sm:gap-4">
                            <div className="relative w-[48px] h-[48px] sm:w-[92px] sm:h-[92px]">
                                <Image src="/logo_new.png" alt="Castile Logo" fill className="object-contain" priority />
                            </div>
                            <span className="text-xl sm:text-4xl font-bold tracking-widest text-white" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                                CASTILE
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
                            {navLinks.map(link => (
                                <Link key={link.href} href={link.href} className="hover:text-white transition-colors uppercase tracking-widest">{link.label}</Link>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="text-white/70 hover:text-white transition-colors relative group p-1"
                            aria-label="Search products and collections"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            <span className="hidden md:inline-flex absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-white/30 tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                Ctrl+K
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Nav Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-[80%] max-w-[300px] bg-[#222] shadow-2xl border-r border-white/10 p-8 flex flex-col animate-[slideInRight_0.3s_ease-out]">
                        <div className="flex justify-between items-center mb-12">
                            <span className="text-white font-bold tracking-widest text-xl">MENU</span>
                            <button onClick={() => setIsMenuOpen(false)} className="text-white/50 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="flex flex-col gap-6">
                            {navLinks.map(link => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-2xl font-bold text-white/90 hover:text-white uppercase tracking-widest"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-auto pt-8 border-t border-white/10">
                            <p className="text-xs text-white/30 uppercase tracking-[0.2em]">Crafted in Europe</p>
                            <p className="text-xs text-white/30 uppercase tracking-[0.2em] mt-2">© 2026 Castile</p>
                        </div>
                    </div>
                </div>
            )}

            <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
