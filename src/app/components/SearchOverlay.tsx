"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSearchIndex, type SearchItem } from "../data/products";

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<(SearchItem & { score: number })[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchIndex = useRef<SearchItem[]>([]);

    // Build index once
    useEffect(() => {
        searchIndex.current = getSearchIndex();
    }, []);

    // Focus input when overlay opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 150);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            setQuery("");
            setResults([]);
            setSelectedIndex(-1);
        }
    }, [isOpen]);

    // Escape to close
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    // Perform search with ranking
    const performSearch = useCallback((q: string) => {
        const term = q.toLowerCase().trim();
        if (!term) {
            setResults([]);
            setSelectedIndex(-1);
            return;
        }

        const scored: (SearchItem & { score: number })[] = [];

        searchIndex.current.forEach((item) => {
            const nameLower = item.name.toLowerCase();
            const catLower = item.category.toLowerCase();
            let score = 0;

            if (nameLower === term) score = 100;
            else if (nameLower.startsWith(term)) score = 80;
            else if (nameLower.split(/\s+/).some((w) => w.startsWith(term))) score = 60;
            else if (nameLower.includes(term)) score = 40;
            else if (catLower.includes(term)) score = 20;
            else if (item.slug.includes(term)) score = 15;

            if (score > 0) {
                scored.push({ ...item, score });
            }
        });

        scored.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (a.type !== b.type) return a.type === "product" ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        setResults(scored);
        setSelectedIndex(-1);
    }, []);

    // Debounced search on input
    useEffect(() => {
        const timer = setTimeout(() => performSearch(query), 60);
        return () => clearTimeout(timer);
    }, [query, performSearch]);

    // Navigate to result
    const navigateTo = useCallback(
        (item: SearchItem) => {
            onClose();
            if (item.type === "product") {
                router.push(`/products/${item.id}`);
            } else {
                router.push(`/products?category=${item.slug}`);
            }
        },
        [onClose, router]
    );

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedIndex((prev) => Math.max(prev - 1, -1));
        } else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
            e.preventDefault();
            navigateTo(results[selectedIndex]);
        }
    };

    // Scroll selected item into view
    useEffect(() => {
        if (selectedIndex >= 0 && resultsRef.current) {
            const items = resultsRef.current.querySelectorAll("[data-search-item]");
            items[selectedIndex]?.scrollIntoView({ block: "nearest" });
        }
    }, [selectedIndex]);

    // Highlight matching text
    function highlightMatch(text: string, q: string) {
        if (!q.trim()) return text;
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const parts = text.split(new RegExp(`(${escaped})`, "gi"));
        return parts.map((part, i) =>
            part.toLowerCase() === q.toLowerCase() ? (
                <mark key={i} className="bg-transparent text-amber-400 font-bold">
                    {part}
                </mark>
            ) : (
                part
            )
        );
    }

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex flex-col items-center pt-[12vh] md:pt-[14vh]"
            style={{
                background: "rgba(0, 0, 0, 0.85)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-5 right-6 md:top-6 md:right-8 text-white/60 hover:text-white transition-colors w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 text-2xl"
                aria-label="Close search"
            >
                ✕
            </button>

            {/* Search input */}
            <div className="w-[90%] max-w-[680px] relative">
                <svg
                    className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.5" y1="16.5" x2="21" y2="21" />
                </svg>
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search products & collections…"
                    autoComplete="off"
                    className="w-full py-5 pl-14 pr-5 text-lg bg-white/10 text-white rounded-2xl border-none outline-none placeholder:text-white/40 focus:bg-white/15 focus:ring-2 focus:ring-amber-500/50 transition-all font-[inherit]"
                />
            </div>

            {/* Results */}
            <div
                ref={resultsRef}
                className="w-[90%] max-w-[680px] mt-4 max-h-[55vh] overflow-y-auto scrollbar-thin"
                style={{ scrollbarColor: "#c9a96e transparent" }}
            >
                {query.trim() === "" && (
                    <div className="text-center text-white/30 py-8 text-sm tracking-wide">
                        Start typing to search products and collections
                    </div>
                )}

                {query.trim() !== "" && results.length === 0 && (
                    <div className="text-center text-white/40 py-12">
                        <span className="block text-4xl mb-3">🔍</span>
                        <p className="text-lg">No results found for &ldquo;{query}&rdquo;</p>
                        <p className="text-sm mt-2 text-white/25">Try a different keyword or check the spelling</p>
                    </div>
                )}

                {results.map((item, index) => (
                    <div
                        key={`${item.type}-${item.id}`}
                        data-search-item
                        onClick={() => navigateTo(item)}
                        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl cursor-pointer transition-all mb-1 ${selectedIndex === index
                                ? "bg-white/15"
                                : "hover:bg-white/10"
                            }`}
                    >
                        {/* Thumbnail */}
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-zinc-800 shadow-lg">
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-semibold text-[1.05rem] truncate">
                                {highlightMatch(item.name, query)}
                            </div>
                            <div className="text-white/40 text-xs uppercase tracking-wider mt-0.5">
                                {highlightMatch(item.category, query)}
                            </div>
                        </div>

                        {/* Price (products only) */}
                        {item.price && (
                            <span className="text-white/50 text-sm font-medium flex-shrink-0 hidden sm:block">
                                {item.price}
                            </span>
                        )}

                        {/* Type badge */}
                        <span
                            className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold uppercase tracking-wider flex-shrink-0 ${item.type === "product"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-white/10 text-white/60"
                                }`}
                        >
                            {item.type === "product" ? "Product" : "Collection"}
                        </span>
                    </div>
                ))}
            </div>

            {/* Keyboard hints */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/20 text-xs tracking-wide">
                <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/30 font-mono text-[10px]">↑↓</kbd>
                    navigate
                </span>
                <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/30 font-mono text-[10px]">Enter</kbd>
                    select
                </span>
                <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/30 font-mono text-[10px]">Esc</kbd>
                    close
                </span>
            </div>
        </div>
    );
}
