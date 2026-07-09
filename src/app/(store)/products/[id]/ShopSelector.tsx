"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface RawVariant {
    id: string;
    sku: string;
    name: string;
    collection: string;
    size: string;
    pricePerSqft?: number;
    sqftPerBox?: number;
    category?: string;
    image?: string;
}

interface ParsedVariant extends RawVariant {
    color: string;
    finish: string;
    sizeClean: string;
    sqftPerPiece: number;
    pricePerPiece: number;
    piecesPerBox: number;
    pricePerSqft: number;
    sqftPerBox: number;
}

function parseColor(name: string, colorsList: string[]): string {
    const upperName = name.toUpperCase();
    for (const color of colorsList) {
        if (upperName.includes(color.toUpperCase())) {
            return color;
        }
    }
    return colorsList[0] || "Standard";
}

function parseFinish(name: string): string {
    const upperName = name.toUpperCase();
    if (upperName.includes(" PO") || upperName.includes("POLISHED")) return "Polished";
    if (upperName.includes(" ABS")) return "ABS";
    if (upperName.includes(" LAP") || upperName.includes("LAPPATO")) return "Lappato";
    return "Matte";
}

function parseSize(sizeStr: string): { label: string; sqft: number } {
    const clean = sizeStr.toUpperCase().replace(/"/g, '').replace(/FIELD/g, '').trim();
    const match = clean.match(/(\d+(?:\.\d+)?)\s*X\s*(\d+(?:\.\d+)?)/);
    if (match) {
        const w = parseFloat(match[1]);
        const h = parseFloat(match[2]);
        const sqft = (w * h) / 144;
        return { label: `${w} x ${h}`, sqft };
    }
    return { label: sizeStr, sqft: 2.0 };
}

export default function ShopSelector({ variants, product }: { variants: RawVariant[], product: any }) {
    // 1. Process variants
    const parsedVariants: ParsedVariant[] = variants.map(v => {
        const color = parseColor(v.name, product.colors || []);
        const finish = parseFinish(v.name);
        const sizeInfo = parseSize(v.size || v.name);
        
        const pricePerSqft = v.pricePerSqft || 2.99;
        const sqftPerBox = v.sqftPerBox || 15.0;
        
        const sqftPerPiece = sizeInfo.sqft;
        const piecesPerBox = Math.max(1, Math.round(sqftPerBox / sqftPerPiece));
        const pricePerPiece = pricePerSqft * sqftPerPiece;

        return {
            ...v,
            color,
            finish,
            sizeClean: sizeInfo.label,
            sqftPerPiece,
            pricePerPiece,
            piecesPerBox,
            pricePerSqft,
            sqftPerBox
        };
    });

    // 2. Extract options
    const uniqueColors = Array.from(new Set(parsedVariants.map(v => v.color)));
    const uniqueFinishes = Array.from(new Set(parsedVariants.map(v => v.finish)));
    const uniqueSizes = Array.from(new Set(parsedVariants.map(v => v.sizeClean)));

    // 3. Selection state
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedFinish, setSelectedFinish] = useState<string>("");
    const [selectedSize, setSelectedSize] = useState<string>("");

    // Initialize state
    useEffect(() => {
        if (uniqueColors.length > 0) setSelectedColor(uniqueColors[0]);
        if (uniqueFinishes.length > 0) setSelectedFinish(uniqueFinishes[0]);
        if (uniqueSizes.length > 0) setSelectedSize(uniqueSizes[0]);
    }, [variants]);

    // Find active variant
    let activeVariant = parsedVariants.find(v => 
        v.color === selectedColor && 
        v.finish === selectedFinish && 
        v.sizeClean === selectedSize
    );

    // Fallbacks if combination is missing
    if (!activeVariant && selectedColor) {
        // Fallback to same color, any finish/size
        activeVariant = parsedVariants.find(v => v.color === selectedColor) || parsedVariants[0];
    }
    if (!activeVariant) {
        activeVariant = parsedVariants[0];
    }

    // Sync selected options if fallback was active
    useEffect(() => {
        if (activeVariant) {
            if (activeVariant.color !== selectedColor) setSelectedColor(activeVariant.color);
            if (activeVariant.finish !== selectedFinish) setSelectedFinish(activeVariant.finish);
            if (activeVariant.sizeClean !== selectedSize) setSelectedSize(activeVariant.sizeClean);
        }
    }, [activeVariant]);

    // 4. Calculator State
    const [sqftInput, setSqftInput] = useState<string>("");
    const [piecesCount, setPiecesCount] = useState<number>(1);
    const [addContingency, setAddContingency] = useState<boolean>(false);

    const sqftPerPiece = activeVariant?.sqftPerPiece || 2.0;
    const pricePerSqft = activeVariant?.pricePerSqft || 2.99;
    const pricePerPiece = activeVariant?.pricePerPiece || 5.98;

    // Handle SqFt Input Change
    const handleSqftChange = (val: string) => {
        setSqftInput(val);
        const sqftNum = parseFloat(val);
        if (!isNaN(sqftNum) && sqftNum > 0) {
            const multiplier = addContingency ? 1.1 : 1.0;
            const neededPieces = Math.ceil((sqftNum * multiplier) / sqftPerPiece);
            setPiecesCount(neededPieces);
        } else {
            setPiecesCount(1);
        }
    };

    // Handle Pieces Count Change
    const handlePiecesChange = (count: number) => {
        const cleanCount = Math.max(1, count);
        setPiecesCount(cleanCount);
        
        // Calculate matching SqFt
        const multiplier = addContingency ? 1.1 : 1.0;
        const matchingSqft = (cleanCount * sqftPerPiece) / multiplier;
        setSqftInput(matchingSqft.toFixed(2));
    };

    // Recalculate if Contingency toggles
    useEffect(() => {
        const sqftNum = parseFloat(sqftInput);
        if (!isNaN(sqftNum) && sqftNum > 0) {
            const multiplier = addContingency ? 1.1 : 1.0;
            const neededPieces = Math.ceil((sqftNum * multiplier) / sqftPerPiece);
            setPiecesCount(neededPieces);
        }
    }, [addContingency, sqftPerPiece]);

    // Subtotal
    const subtotal = piecesCount * pricePerPiece;

    return (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            {/* Pricing Summary */}
            <div className="pb-6 border-b border-zinc-100 dark:border-white/10">
                <div className="flex items-baseline gap-4">
                    <span className="text-4xl sm:text-5xl font-playfair font-semibold text-zinc-900 dark:text-white">
                        ${pricePerSqft.toFixed(2)}
                    </span>
                    <span className="text-zinc-400 text-sm font-light">/ sqft</span>
                    <span className="text-zinc-600 dark:text-zinc-400 text-lg font-medium ml-2">
                        (${pricePerPiece.toFixed(2)} / piece)
                    </span>
                </div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-2">
                    Price may vary according to the selected variations • SKU: <span className="font-bold text-zinc-700 dark:text-white">{activeVariant?.sku || "N/A"}</span>
                </p>
            </div>

            {/* Swatch Color Selector */}
            {uniqueColors.length > 0 && (
                <div className="pb-6 border-b border-zinc-100 dark:border-white/10">
                    <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-900 dark:text-white mb-4">
                        Color: <span className="text-zinc-500 font-normal">{selectedColor}</span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {uniqueColors.map(color => {
                            // Find the first variant matching this color to show its tile thumbnail
                            const match = parsedVariants.find(v => v.color === color);
                            const img = match?.image && match.image !== "/products/placeholder.jpg" ? match.image : product.image;
                            
                            return (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-300 ${
                                        selectedColor === color 
                                            ? "border-amber-500 scale-110 shadow-lg ring-2 ring-amber-500/20" 
                                            : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                                    }`}
                                    title={color}
                                >
                                    <Image
                                        src={img}
                                        alt={color}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Finishes */}
            {uniqueFinishes.length > 0 && (
                <div className="pb-6 border-b border-zinc-100 dark:border-white/10">
                    <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-900 dark:text-white mb-4">
                        Finish: <span className="text-zinc-500 font-normal">{selectedFinish}</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {uniqueFinishes.map(finish => {
                            const isAvailable = parsedVariants.some(v => v.color === selectedColor && v.finish === finish);
                            return (
                                <button
                                    key={finish}
                                    disabled={!isAvailable}
                                    onClick={() => setSelectedFinish(finish)}
                                    className={`px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                                        !isAvailable 
                                            ? "border-zinc-100 text-zinc-300 dark:border-zinc-900 dark:text-zinc-700 cursor-not-allowed"
                                            : selectedFinish === finish
                                                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white scale-[1.02]"
                                                : "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                                    }`}
                                >
                                    {finish}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Sizes / Formats */}
            {uniqueSizes.length > 0 && (
                <div className="pb-6 border-b border-zinc-100 dark:border-white/10">
                    <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-900 dark:text-white mb-4">
                        Size: <span className="text-zinc-500 font-normal">{selectedSize}</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {uniqueSizes.map(size => {
                            const isAvailable = parsedVariants.some(v => 
                                v.color === selectedColor && 
                                v.finish === selectedFinish && 
                                v.sizeClean === size
                            );
                            return (
                                <button
                                    key={size}
                                    disabled={!isAvailable}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-5 py-2.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                                        !isAvailable 
                                            ? "border-zinc-100 text-zinc-300 dark:border-zinc-900 dark:text-zinc-700 cursor-not-allowed"
                                            : selectedSize === size
                                                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white scale-[1.02]"
                                                : "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                                    }`}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Project Calculator Module */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-xl p-6 border border-zinc-150 dark:border-white/5 space-y-6">
                <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 dark:text-white/40 mb-1">Project Calculator</h4>
                    <span className="text-sm font-semibold text-zinc-800 dark:text-white/80">How much do you need?</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Size input */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Size of your project</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={sqftInput}
                                onChange={(e) => handleSqftChange(e.target.value)}
                                placeholder="0"
                                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-lg py-3 px-4 text-zinc-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold">SQFT</span>
                        </div>
                    </div>

                    {/* Pieces input */}
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Number of pieces</label>
                        <div className="flex items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-lg overflow-hidden">
                            <button
                                onClick={() => handlePiecesChange(piecesCount - 1)}
                                className="px-4 py-3 text-zinc-500 hover:text-amber-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors font-bold text-lg"
                            >
                                −
                            </button>
                            <input
                                type="number"
                                value={piecesCount}
                                onChange={(e) => handlePiecesChange(parseInt(e.target.value) || 1)}
                                className="w-full bg-transparent text-center font-bold text-zinc-900 dark:text-white focus:outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                                onClick={() => handlePiecesChange(piecesCount + 1)}
                                className="px-4 py-3 text-zinc-500 hover:text-amber-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors font-bold text-lg"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contingency */}
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="contingency"
                        checked={addContingency}
                        onChange={(e) => setAddContingency(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-300 text-amber-500 focus:ring-amber-500 bg-white dark:bg-zinc-950"
                    />
                    <label htmlFor="contingency" className="text-xs text-zinc-500 dark:text-white/60 font-semibold cursor-pointer">
                        Add 10% for contingency / waste (Recommended)
                    </label>
                </div>

                {/* Helper text */}
                <div className="text-[10px] text-zinc-400 dark:text-white/30 space-y-1">
                    <p>1 piece = {sqftPerPiece.toFixed(3)} sqft</p>
                    {activeVariant && (
                        <p>{activeVariant.piecesPerBox} pieces per box ({activeVariant.sqftPerBox.toFixed(2)} sqft total)</p>
                    )}
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center pt-4 border-t border-zinc-150 dark:border-white/5">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Subtotal</span>
                    <span className="text-3xl font-playfair font-bold text-zinc-900 dark:text-white">
                        ${subtotal.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-4 px-6 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-xl active:scale-[0.98]">
                    Add to Quote
                </button>
                <button className="flex-1 bg-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-900 dark:text-white py-4 px-6 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] border border-zinc-200 dark:border-white/10 transition-all active:scale-[0.98]">
                    Order Sample Kit
                </button>
            </div>
        </div>
    );
}
