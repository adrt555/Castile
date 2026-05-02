"use client";

import { useState } from "react";
import Image from "next/image";

export default function VariationCards({ variants, product }: { variants: any[], product: any }) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <>
            {/* Variation Cards */}
            <div className="pb-8 border-b border-zinc-200 dark:border-white/10">
                <h3 className="text-lg uppercase tracking-widest font-bold text-zinc-900 dark:text-white mb-6 border-b-2 border-zinc-900 dark:border-white pb-2 inline-block">Colors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {variants.length > 0 ? (
                        variants.map((variant: any) => (
                            <div key={variant.sku} className="bg-white dark:bg-zinc-900/50 overflow-hidden shadow-sm hover:shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1)] transition-shadow group flex flex-col border border-zinc-200 dark:border-white/10">
                                <div
                                    className="relative aspect-[4/3] w-full bg-zinc-100 dark:bg-black/50 overflow-hidden cursor-pointer"
                                    onClick={() => setSelectedImage(variant.image !== "/products/placeholder.jpg" ? variant.image : product.image)}
                                >
                                    <Image
                                        src={variant.image !== "/products/placeholder.jpg" ? variant.image : product.image}
                                        alt={variant.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-1">
                                    <h4 className="text-[1.1rem] font-medium text-zinc-900 dark:text-white mb-4 leading-snug">{variant.name}</h4>
                                    <div className="mt-auto flex flex-col gap-1">
                                        <span className="text-[10px] font-semibold text-zinc-900 dark:text-white/60 tracking-wider uppercase">{variant.size}</span>
                                        <span className="text-[10px] font-semibold text-zinc-500 dark:text-white/40 tracking-wider uppercase">{variant.sku}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-zinc-500">No specific variations found.</div>
                    )}
                </div>
            </div>

            {/* Zoom Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-12 cursor-zoom-out"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative w-full h-full max-w-6xl max-h-[90vh] bg-zinc-900">
                        <Image
                            src={selectedImage}
                            alt="Zoomed Color Swatch"
                            fill
                            className="object-contain"
                            quality={100}
                        />
                        <button
                            className="absolute top-4 right-4 text-white hover:text-amber-500 transition-colors bg-black/50 rounded-full p-2"
                            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
