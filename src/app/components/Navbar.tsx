"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SearchOverlay from "./SearchOverlay";

export default function Navbar() {
    const [searchOpen, setSearchOpen] = useState(false);

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

    return (
        <>
            <nav className="fixed w-full z-50 bg-[#454545] border-b border-white/10 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link href="/" className="flex items-center gap-4">
                            <div className="relative w-[74px] h-[74px] md:w-[92px] md:h-[92px]">
                                <Image src="/logo_new.png" alt="Castile Logo" fill className="object-contain" />
                            </div>
                            <span className="text-3xl md:text-4xl font-bold tracking-widest text-white" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                                CASTILE
                            </span>
                        </Link>
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
                            <Link href="/products" className="hover:text-white transition-colors">Collections</Link>
                            <Link href="/about" className="hover:text-white transition-colors">Our Story</Link>
                            <Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link>
                            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="text-white/70 hover:text-white transition-colors relative group"
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

            <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
