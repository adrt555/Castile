"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../../../context/CartContext";
import colorFacesRaw from "../../../data/collection_color_faces.json";

interface RawVariant {
    id: string;
    sku: string;
    name: string;
    collection: string;
    size: string;
    pricePerSqft?: number;
    sqftPerBox?: number;
    piecesPerBox?: number;
    pricePerBox?: number;
    lbsPerBox?: number;
    category?: string;
    image?: string;
}

interface ParsedVariant extends RawVariant {
    color: string;
    finish: string;
    sizeClean: string;
    piecesPerBox: number;
    pricePerSqft: number;
    sqftPerBox: number;
    pricePerBox: number;
    lbsPerBox: number;
}

interface ProductShowcaseClientProps {
    product: any;
    variants: RawVariant[];
    projectImages: string[];
    relatedProducts: any[];
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

function getColorSwatchStyle(colorName: string): { background: string; isLight: boolean; borderColor?: string } {
    const name = colorName.toLowerCase().trim();
    
    // 1. Whites & Marbles
    if (name.includes("white") || name.includes("blanco") || name.includes("bianco") || name.includes("ice") || name.includes("frost") || name.includes("nieve")) {
        return { background: "linear-gradient(135deg, #FFFFFF 0%, #F5F5F2 50%, #E8E8E3 100%)", isLight: true, borderColor: "#D4D4D0" };
    }
    // 2. Arena, Sands & Beiges
    if (name.includes("arena") || name.includes("sand") || name.includes("tan") || name.includes("caliza") || name.includes("biscuit") || name.includes("cream") || name.includes("crema") || name.includes("avorio") || name.includes("almond") || name.includes("beige") || name.includes("ivory")) {
        return { background: "linear-gradient(135deg, #F3E7D7 0%, #E2D1BA 50%, #C9B294 100%)", isLight: true, borderColor: "#BFA98B" };
    }
    // 3. Greys & Concrete
    if (name.includes("gris") || name.includes("gray") || name.includes("grey") || name.includes("ash") || name.includes("silver") || name.includes("pearl") || name.includes("mist") || name.includes("niebla") || name.includes("pewter")) {
        return { background: "linear-gradient(135deg, #D1D3D4 0%, #A8ABB0 50%, #8E9196 100%)", isLight: false, borderColor: "#7D8085" };
    }
    // 4. Graphite & Steel
    if (name.includes("grafito") || name.includes("marengo") || name.includes("acero") || name.includes("steel")) {
        return { background: "linear-gradient(135deg, #575A60 0%, #3B3E44 50%, #2A2C31 100%)", isLight: false, borderColor: "#202226" };
    }
    // 5. Blacks, Anthracite & Basalt
    if (name.includes("antracita") || name.includes("carbon") || name.includes("lava") || name.includes("basalt") || name.includes("black") || name.includes("negro") || name.includes("nero") || name.includes("maurice") || name.includes("port noir")) {
        return { background: "linear-gradient(135deg, #2B2C30 0%, #1A1A1D 50%, #0E0E10 100%)", isLight: false, borderColor: "#050507" };
    }
    // 6. Woods (Fresno, Roble, Walnut, Vison, Taupe)
    if (name.includes("fresno")) return { background: "linear-gradient(135deg, #DECDB5 0%, #C8B093 100%)", isLight: true };
    if (name.includes("roble") || name.includes("oak")) return { background: "linear-gradient(135deg, #A47547 0%, #805025 100%)", isLight: false };
    if (name.includes("vison") || name.includes("taupe")) return { background: "linear-gradient(135deg, #9C8D80 0%, #766658 100%)", isLight: false };
    if (name.includes("walnut") || name.includes("nogales") || name.includes("bourbon") || name.includes("wenge")) return { background: "linear-gradient(135deg, #6B4931 0%, #432816 100%)", isLight: false };
    if (name.includes("maple") || name.includes("natural")) return { background: "linear-gradient(135deg, #DFC096 0%, #C39D6C 100%)", isLight: true };
    // 7. Blues & Waters
    if (name.includes("ocean") || name.includes("deep sea") || name.includes("marino") || name.includes("french blue") || name.includes("azul") || name.includes("blue")) {
        return { background: "linear-gradient(135deg, #2B6291 0%, #153E63 100%)", isLight: false };
    }
    if (name.includes("turquesa") || name.includes("turquoise") || name.includes("aquamarine") || name.includes("aqua") || name.includes("cielo") || name.includes("lago") || name.includes("laguna")) {
        return { background: "linear-gradient(135deg, #59B8BD 0%, #2A888F 100%)", isLight: false };
    }
    if (name.includes("teal") || name.includes("petrol") || name.includes("denim")) {
        return { background: "linear-gradient(135deg, #235F6E 0%, #133E49 100%)", isLight: false };
    }
    // 8. Greens & Botanicals
    if (name.includes("sage") || name.includes("menta") || name.includes("anise") || name.includes("moss") || name.includes("aloe")) {
        return { background: "linear-gradient(135deg, #8EA886 0%, #5E7A56 100%)", isLight: false };
    }
    if (name.includes("emerald") || name.includes("peacock") || name.includes("selva") || name.includes("verde") || name.includes("forest")) {
        return { background: "linear-gradient(135deg, #2A7352 0%, #13442E 100%)", isLight: false };
    }
    // 9. Terracottas & Warm Tones
    if (name.includes("cotto") || name.includes("terracotta") || name.includes("spanish red") || name.includes("burnt") || name.includes("spice") || name.includes("burgundy") || name.includes("wine")) {
        return { background: "linear-gradient(135deg, #C25B36 0%, #8E3517 100%)", isLight: false };
    }
    if (name.includes("pink") || name.includes("rose") || name.includes("lavender")) {
        return { background: "linear-gradient(135deg, #DDA1AB 0%, #B87380 100%)", isLight: true };
    }
    if (name.includes("gold") || name.includes("amber")) {
        return { background: "linear-gradient(135deg, #E2BD6D 0%, #B68B39 100%)", isLight: true };
    }
    // Default stone neutral
    return { background: "linear-gradient(135deg, #C8C5BD 0%, #A5A29A 100%)", isLight: true };
}

export default function ProductShowcaseClient({
    product,
    variants,
    projectImages,
    relatedProducts
}: ProductShowcaseClientProps) {
    const { addItem, setIsCartOpen } = useCart();
    const collectionSlug = product.collectionId;
    const colorFacesMap = (colorFacesRaw as Record<string, Record<string, string>>)[collectionSlug] || {};

    // 1. Process variants with official box metrics
    const parsedVariants: ParsedVariant[] = variants.map(v => {
        const color = parseColor(v.name, product.colors || []);
        const finish = parseFinish(v.name);
        const sizeInfo = parseSize(v.size || v.name);
        
        const pricePerSqft = v.pricePerSqft || 4.58;
        const sqftPerBox = v.sqftPerBox || 15.5;
        const piecesPerBox = v.piecesPerBox || Math.max(1, Math.round(sqftPerBox / sizeInfo.sqft));
        const pricePerBox = v.pricePerBox || parseFloat((pricePerSqft * sqftPerBox).toFixed(2));
        const lbsPerBox = v.lbsPerBox || 50;

        return {
            ...v,
            color,
            finish,
            sizeClean: sizeInfo.label,
            piecesPerBox,
            pricePerSqft,
            sqftPerBox,
            pricePerBox,
            lbsPerBox
        };
    });

    // 2. Extract unique options
    const uniqueColors = Array.from(new Set(parsedVariants.map(v => v.color)));
    const uniqueFinishes = Array.from(new Set(parsedVariants.map(v => v.finish)));
    const uniqueSizes = Array.from(new Set(parsedVariants.map(v => v.sizeClean)));

    // 3. Selection state
    const [selectedColor, setSelectedColor] = useState<string>("");
    const [selectedFinish, setSelectedFinish] = useState<string>("");
    const [selectedSize, setSelectedSize] = useState<string>("");
    const [viewMode, setViewMode] = useState<"tile" | "ambiance">("tile");
    const [activeAmbianceIndex, setActiveAmbianceIndex] = useState<number>(0);
    const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

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

    if (!activeVariant && selectedColor) {
        activeVariant = parsedVariants.find(v => v.color === selectedColor) || parsedVariants[0];
    }
    if (!activeVariant) {
        activeVariant = parsedVariants[0];
    }

    useEffect(() => {
        if (activeVariant) {
            if (activeVariant.color !== selectedColor) setSelectedColor(activeVariant.color);
            if (activeVariant.finish !== selectedFinish) setSelectedFinish(activeVariant.finish);
            if (activeVariant.sizeClean !== selectedSize) setSelectedSize(activeVariant.sizeClean);
        }
    }, [activeVariant]);

    // 4. Calculator State (Strictly by Full Box / Cajas Cerradas - Defaults to 0)
    const [sqftInput, setSqftInput] = useState<string>("");
    const [boxesCount, setBoxesCount] = useState<number>(0);
    const [addContingency, setAddContingency] = useState<boolean>(false);

    const sqftPerBox = activeVariant?.sqftPerBox || 15.5;
    const pricePerSqft = activeVariant?.pricePerSqft || 4.58;
    const pricePerBox = activeVariant?.pricePerBox || parseFloat((pricePerSqft * sqftPerBox).toFixed(2));
    const piecesPerBox = activeVariant?.piecesPerBox || 2;

    // Recalculate boxes whenever SQFT input or contingency changes
    useEffect(() => {
        const sqftNum = parseFloat(sqftInput);
        if (!isNaN(sqftNum) && sqftNum > 0) {
            const multiplier = addContingency ? 1.10 : 1.0;
            const targetSqft = sqftNum * multiplier;
            const neededBoxes = Math.ceil(targetSqft / sqftPerBox);
            setBoxesCount(neededBoxes);
        } else {
            setBoxesCount(0);
        }
    }, [sqftInput, addContingency, sqftPerBox]);

    const handleBoxesChange = (boxes: number) => {
        const cleanBoxes = Math.max(0, boxes);
        setBoxesCount(cleanBoxes);
        if (cleanBoxes === 0) {
            setSqftInput("");
        } else {
            const actualSqft = (cleanBoxes * sqftPerBox) / (addContingency ? 1.10 : 1.0);
            setSqftInput(actualSqft.toFixed(2));
        }
    };

    const totalDeliverableSqft = boxesCount > 0 ? parseFloat((boxesCount * sqftPerBox).toFixed(2)) : 0;
    const subtotal = boxesCount > 0 ? parseFloat((boxesCount * pricePerBox).toFixed(2)) : 0;
    const floridaTax = boxesCount > 0 ? parseFloat((subtotal * 0.07).toFixed(2)) : 0;
    const estimatedTotal = boxesCount > 0 ? parseFloat((subtotal + floridaTax).toFixed(2)) : 0;

    // Resolve the authentic tile face piece image for the currently active color
    const getTileFaceForColor = (colorName: string): string => {
        if (!colorName) return product.image;
        const clean = colorName.toLowerCase().trim();
        
        // 1. Direct match in scraped color faces
        if (colorFacesMap[clean]) return colorFacesMap[clean];
        
        // 2. Partial match
        for (const [k, url] of Object.entries(colorFacesMap)) {
            if (clean.includes(k) || k.includes(clean)) return url;
        }

        // 3. Match from extracted variants
        const varMatch = parsedVariants.find(v => v.color.toLowerCase() === clean && v.image && v.image !== "/products/placeholder.jpg");
        if (varMatch?.image) return varMatch.image;

        // 4. Default collection hero
        return product.image;
    };

    const currentTileFaceImage = getTileFaceForColor(selectedColor);
    const lifestylePhotos = projectImages.length > 0 ? projectImages : [product.image];
    const currentAmbianceImage = lifestylePhotos[activeAmbianceIndex] || lifestylePhotos[0] || product.image;
    const displayedMainImage = viewMode === "tile" ? currentTileFaceImage : currentAmbianceImage;

    const handleAddToCart = () => {
        if (!activeVariant) return;
        const finalBoxes = boxesCount > 0 ? boxesCount : 1;
        const finalSqft = parseFloat((finalBoxes * sqftPerBox).toFixed(2));

        addItem({
            id: activeVariant.id || `var_${activeVariant.sku}`,
            sku: activeVariant.sku,
            name: activeVariant.name || `${product.name} ${selectedSize}`,
            collection: product.name,
            color: selectedColor,
            finish: selectedFinish,
            size: selectedSize,
            image: currentTileFaceImage,
            pricePerSqft: pricePerSqft,
            pricePerBox: pricePerBox,
            sqftPerBox: sqftPerBox,
            piecesPerBox: piecesPerBox,
            boxes: finalBoxes,
            sqft: finalSqft,
            pieces: finalBoxes * piecesPerBox,
            lbsPerBox: activeVariant.lbsPerBox || 50,
            brand: product.brand,
        });

        setIsCartOpen(true);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-24 sm:pt-32 pb-20 sm:pb-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Breadcrumbs */}
                <nav className="flex text-[10px] sm:text-xs text-zinc-400 dark:text-white/40 mb-8 sm:mb-12 uppercase tracking-widest font-bold flex-wrap gap-y-2 px-1">
                    <Link href="/" className="hover:text-[#C5A880] transition-colors">Home</Link>
                    <span className="mx-2 sm:mx-3 opacity-30">/</span>
                    <Link href={product.brand === 'dune' ? '/products?brand=dune' : '/products?brand=roca-tiles'} className="hover:text-[#C5A880] transition-colors">
                        {product.brand === 'dune' ? 'Luxury Accents' : 'Collections'}
                    </Link>
                    <span className="mx-2 sm:mx-3 opacity-30">/</span>
                    <Link href={`/products?category=${product.collectionId}`} className="hover:text-[#C5A880] transition-colors truncate max-w-[100px] sm:max-w-none">{product.category}</Link>
                    <span className="mx-2 sm:mx-3 opacity-30">/</span>
                    <span className="text-zinc-900 dark:text-white truncate max-w-[120px] sm:max-w-none">{product.name}</span>
                </nav>

                {/* 1. PRIMARY PRODUCT SHOWCASE & CONFIGURATOR (2 Columns) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 mb-24 sm:mb-32 items-start">
                    
                    {/* LEFT COLUMN: REAL PRODUCT TILE PIECE & INSPECTION SHOWCASE (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* Main Interactive Stage */}
                        <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full bg-gradient-to-b from-zinc-100 to-zinc-200/80 dark:from-zinc-900 dark:to-zinc-950 rounded-2xl overflow-hidden border border-zinc-200/80 dark:border-white/10 shadow-2xl p-4 sm:p-6 flex flex-col justify-between group/hero">
                            
                            {/* Top Badges */}
                            <div className="relative z-10 flex items-center justify-between w-full">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-[#C5A880]/30 shadow-lg text-[10px] sm:text-xs font-mono font-bold tracking-wider text-[#C5A880]">
                                    <span className="w-2 h-2 rounded-full bg-[#C5A880] animate-pulse"></span>
                                    {viewMode === "tile" ? "REAL MATERIAL PIECE" : "IN-SITU ROOMSCENE"}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsZoomOpen(true)}
                                        className="p-2 rounded-xl bg-black/60 hover:bg-black/85 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer shadow-md"
                                        title="Inspect Surface Details"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Center Product Image (Authentic Isolated Tile Piece or Roomscene) */}
                            <div className="relative w-full h-[72%] sm:h-[78%] flex items-center justify-center my-auto cursor-zoom-in" onClick={() => setIsZoomOpen(true)}>
                                <Image
                                    key={displayedMainImage}
                                    src={displayedMainImage}
                                    alt={`${product.name} - ${selectedColor}`}
                                    fill
                                    className={`object-contain transition-all duration-700 ease-out ${viewMode === "tile" ? "drop-shadow-[0_20px_35px_rgba(0,0,0,0.35)] scale-95 hover:scale-100" : "object-cover rounded-xl shadow-inner"}`}
                                    priority
                                />
                            </div>

                            {/* Bottom Context Info Bar */}
                            <div className="relative z-10 flex items-center justify-between pt-2 border-t border-zinc-200/50 dark:border-white/10 text-[10px] sm:text-xs font-mono">
                                <div className="text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                                    <span className="font-bold uppercase tracking-wider text-zinc-900 dark:text-white">{product.name}</span>
                                    <span>•</span>
                                    <span className="text-[#C5A880] font-bold">{selectedColor}</span>
                                    <span>•</span>
                                    <span>{selectedSize || "Standard"}</span>
                                </div>
                                <span className="text-zinc-400 hidden sm:inline-block">
                                    {product.brand === 'dune' ? 'Dune Ceramics Spain' : 'Roca Tiles USA'}
                                </span>
                            </div>
                        </div>

                        {/* View Switcher: Real Tile Piece vs Roomscene */}
                        <div className="flex items-center justify-between p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-white/10">
                            <button
                                type="button"
                                onClick={() => setViewMode("tile")}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                                    viewMode === "tile"
                                        ? "bg-[#C5A880] text-zinc-950 shadow-md font-bold"
                                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                                </svg>
                                <span>Real Product Piece ({selectedColor})</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setViewMode("ambiance")}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                                    viewMode === "ambiance"
                                        ? "bg-[#C5A880] text-zinc-950 shadow-md font-bold"
                                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>In-Situ Ambiance Photo</span>
                            </button>
                        </div>

                        {/* Real Color Variant Tile Strip (Clickable Tile Faces) */}
                        {uniqueColors.length > 1 && (
                            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-mono font-bold text-zinc-500 dark:text-zinc-400">
                                        Color Variations ({uniqueColors.length} Surfaces)
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-mono">
                                        Click to switch product piece
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                                    {uniqueColors.map(color => {
                                        const tileImg = getTileFaceForColor(color);
                                        const isSelected = selectedColor === color;
                                        const swatch = getColorSwatchStyle(color);

                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedColor(color);
                                                    setViewMode("tile");
                                                }}
                                                className={`group/color relative flex flex-col items-center p-2 rounded-xl border text-center transition-all duration-300 cursor-pointer ${
                                                    isSelected
                                                        ? "border-[#C5A880] bg-white dark:bg-zinc-800 ring-2 ring-[#C5A880]/30 shadow-md"
                                                        : "border-zinc-200 dark:border-white/10 bg-white/60 dark:bg-zinc-900/80 hover:border-[#C5A880]/50"
                                                }`}
                                            >
                                                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-950 mb-2 border border-zinc-200/50 dark:border-white/5">
                                                    <Image
                                                        src={tileImg}
                                                        alt={color}
                                                        fill
                                                        className="object-contain p-1 group-hover/color:scale-105 transition-transform duration-300"
                                                    />
                                                    <div 
                                                        style={{ background: swatch.background }}
                                                        className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-white/50 shadow-sm"
                                                    />
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-tight truncate w-full ${isSelected ? "text-[#C5A880]" : "text-zinc-700 dark:text-zinc-300"}`}>
                                                    {color}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Ambiance Photo Previews Strip (if in Ambiance mode) */}
                        {viewMode === "ambiance" && lifestylePhotos.length > 1 && (
                            <div className="grid grid-cols-3 gap-3">
                                {lifestylePhotos.slice(0, 3).map((imgUrl, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveAmbianceIndex(idx)}
                                        className={`relative aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                                            activeAmbianceIndex === idx ? "border-[#C5A880] ring-2 ring-[#C5A880]/30" : "border-transparent opacity-60 hover:opacity-100"
                                        }`}
                                    >
                                        <Image src={imgUrl} alt={`Ambiance ${idx + 1}`} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: SPECIFICATIONS, CALCULATOR & PURCHASING (5 cols) */}
                    <div className="lg:col-span-5 flex flex-col space-y-6">
                        
                        {/* Header & Category Tag */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[10px] font-mono uppercase tracking-[0.25em] font-bold px-2 py-0.5 rounded bg-[#C5A880]/15 text-[#C5A880] border border-[#C5A880]/30">
                                    {product.brand === 'dune' ? 'Dune Luxury Accent' : 'Roca Architectural'}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                    {product.category}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-zinc-900 dark:text-white leading-tight">
                                {product.name}
                            </h1>
                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 font-light leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Price Display */}
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/80 rounded-2xl border border-zinc-200 dark:border-white/10 flex items-baseline justify-between">
                            <div>
                                <span className="text-3xl sm:text-4xl font-playfair font-bold text-zinc-900 dark:text-white">
                                    ${pricePerSqft.toFixed(2)}
                                </span>
                                <span className="text-zinc-400 text-xs font-light ml-1">/ SQFT</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm sm:text-base font-mono font-bold text-[#C5A880]">
                                    ${pricePerBox.toFixed(2)}
                                </span>
                                <span className="text-zinc-400 text-[10px] font-mono block">per full box ({sqftPerBox} sqft)</span>
                            </div>
                        </div>

                        {/* Color Selector */}
                        {uniqueColors.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <label className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
                                        Surface Color: <span className="text-[#C5A880] ml-1">{selectedColor}</span>
                                    </label>
                                    <span className="text-[10px] text-zinc-400 font-mono">{uniqueColors.length} options</span>
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {uniqueColors.map(color => {
                                        const swatch = getColorSwatchStyle(color);
                                        const isSelected = selectedColor === color;
                                        return (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedColor(color);
                                                    setViewMode("tile");
                                                }}
                                                className={`group flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "border-[#C5A880] bg-[#C5A880]/15 text-zinc-900 dark:text-white font-bold shadow-sm"
                                                        : "border-zinc-200 dark:border-white/10 hover:border-[#C5A880]/50 text-zinc-600 dark:text-zinc-400"
                                                }`}
                                            >
                                                <div
                                                    style={{ background: swatch.background }}
                                                    className={`w-3.5 h-3.5 rounded-full shadow-inner ${swatch.borderColor ? "border border-zinc-300 dark:border-zinc-600" : ""}`}
                                                />
                                                <span className="text-xs">{color}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Size Options */}
                        {uniqueSizes.length > 0 && (
                            <div>
                                <label className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-zinc-900 dark:text-white block mb-2.5">
                                    Available Dimensions: <span className="text-[#C5A880] ml-1">{selectedSize}</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueSizes.map(size => {
                                        const isSelected = selectedSize === size;
                                        return (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-[#C5A880] text-zinc-950 font-bold shadow-md"
                                                        : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-[#C5A880]/50"
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Finish Options */}
                        {uniqueFinishes.length > 1 && (
                            <div>
                                <label className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-zinc-900 dark:text-white block mb-2.5">
                                    Surface Treatment: <span className="text-[#C5A880] ml-1">{selectedFinish}</span>
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {uniqueFinishes.map(finish => {
                                        const isSelected = selectedFinish === finish;
                                        return (
                                            <button
                                                key={finish}
                                                type="button"
                                                onClick={() => setSelectedFinish(finish)}
                                                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                                    isSelected
                                                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-bold"
                                                        : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400"
                                                }`}
                                            >
                                                {finish}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Strict Box Calculator Area */}
                        <div className="p-4 sm:p-5 bg-zinc-50 dark:bg-zinc-900/90 rounded-2xl border border-zinc-200 dark:border-white/10 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
                                    Coverage Calculator (Full Boxes)
                                </span>
                                <span className="text-[10px] text-[#C5A880] font-mono font-bold">
                                    {sqftPerBox} SQFT / BOX
                                </span>
                            </div>

                            {/* SQFT Input */}
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={sqftInput}
                                        onChange={(e) => setSqftInput(e.target.value)}
                                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 rounded-xl p-3 text-sm font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]"
                                        placeholder="Needed Area in SQFT"
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400">
                                        SQFT
                                    </span>
                                </div>

                                {/* Box Counter */}
                                <div className="flex items-center bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-white/10 rounded-xl overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => handleBoxesChange(boxesCount - 1)}
                                        className="px-3.5 py-3 text-zinc-500 hover:text-[#C5A880] transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="px-3 text-xs font-mono font-bold text-zinc-900 dark:text-white">
                                        {boxesCount} CTS
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleBoxesChange(boxesCount + 1)}
                                        className="px-3.5 py-3 text-zinc-500 hover:text-[#C5A880] transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Contingency 10% */}
                            <label className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={addContingency}
                                    onChange={(e) => setAddContingency(e.target.checked)}
                                    className="w-4 h-4 rounded border-zinc-300 text-[#C5A880] focus:ring-[#C5A880]"
                                />
                                <span>Include recommended 10% cuts & waste buffer</span>
                            </label>

                            {/* Deliverable Totals */}
                            <div className="pt-3 border-t border-zinc-200 dark:border-white/10 space-y-1.5 text-xs font-mono">
                                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                                    <span>Deliverable Coverage:</span>
                                    <span className="font-bold text-zinc-900 dark:text-white">{totalDeliverableSqft} SQFT ({boxesCount} Boxes)</span>
                                </div>
                                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                                    <span>Subtotal:</span>
                                    <span className="font-bold text-zinc-900 dark:text-white">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                                    <span>FL Sales Tax (7%):</span>
                                    <span className="text-[#C5A880] font-bold">${floridaTax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-zinc-200/60 dark:border-white/10">
                                    <span className="text-zinc-900 dark:text-white">Estimated Total:</span>
                                    <span className="text-xl font-playfair text-[#C5A880]">${estimatedTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Add to Bag CTA */}
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                className="w-full py-4 bg-[#C5A880] hover:bg-[#B8976C] text-zinc-950 font-bold uppercase tracking-widest rounded-xl text-xs transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                <span>
                                    {boxesCount > 0 
                                        ? `Add ${boxesCount} ${boxesCount === 1 ? 'Box' : 'Boxes'} to Bag — $${subtotal.toFixed(2)}`
                                        : `Add to Bag (1 Box Minimum — $${pricePerBox.toFixed(2)})`
                                    }
                                </span>
                            </button>
                        </div>

                        {/* Specs Table */}
                        <div className="pt-2">
                            <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-900 dark:text-white mb-3">
                                Technical Specifications
                            </h3>
                            <div className="border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden text-[10px] sm:text-xs font-mono">
                                <div className="flex justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-white/10">
                                    <span className="text-zinc-400 uppercase">Manufacturer</span>
                                    <span className="font-bold text-zinc-900 dark:text-white">{product.brand === 'dune' ? 'Dune Ceramics Spain' : 'Roca Tile USA'}</span>
                                </div>
                                <div className="flex justify-between p-3 bg-white dark:bg-transparent border-b border-zinc-200 dark:border-white/10">
                                    <span className="text-zinc-400 uppercase">DCOF Dynamic Friction</span>
                                    <span className="font-bold text-zinc-900 dark:text-white">&gt;= 0.42 (Wet/Dry Rated)</span>
                                </div>
                                <div className="flex justify-between p-3 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-white/10">
                                    <span className="text-zinc-400 uppercase">Thickness</span>
                                    <span className="font-bold text-zinc-900 dark:text-white">{product.name.toUpperCase().includes('PAVER') ? '20 mm' : '9 mm'}</span>
                                </div>
                                <div className="flex justify-between p-3 bg-white dark:bg-transparent">
                                    <span className="text-zinc-400 uppercase">Packaging Unit</span>
                                    <span className="font-bold text-zinc-900 dark:text-white">{sqftPerBox} sqft / box ({piecesPerBox} pcs)</span>
                                </div>
                            </div>
                        </div>

                        {/* Downloadable Documentation */}
                        <div className="pt-2 space-y-2 text-xs font-bold font-mono">
                            <a
                                href={`/api/docs/sell-sheet/${product.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-[#C5A880]/50 hover:text-[#C5A880] transition-colors"
                            >
                                <span>📄 Download {product.name} Sell Sheet</span>
                                <span className="text-[10px] text-zinc-400">PDF ↓</span>
                            </a>
                            <a
                                href={`/api/docs/faces-graphic/${product.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-[#C5A880]/50 hover:text-[#C5A880] transition-colors"
                            >
                                <span>📐 Download Faces Graphic Sheet</span>
                                <span className="text-[10px] text-zinc-400">PDF ↓</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* 2. SECONDARY SECTION: ARCHITECTURAL AMBIANCE & IN-SITU ROOMSCENES (Background/Context) */}
                <div className="border-t border-zinc-200 dark:border-white/10 pt-16 sm:pt-24 mb-24 sm:mb-32">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 sm:mb-12 gap-4">
                        <div>
                            <span className="text-zinc-400 font-mono tracking-[0.25em] text-[10px] font-bold uppercase block mb-2">
                                In-Situ Architectural Ambiance
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-playfair font-bold text-zinc-900 dark:text-white">
                                {product.name} in Real Living Spaces
                            </h2>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md font-light">
                            Explore how the {product.name} surface series reflects natural light and coordinates with high-end interior architecture.
                        </p>
                    </div>

                    {/* 3-Photo Lifestyle Ambiance Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                        {lifestylePhotos.slice(0, 3).map((imgUrl, idx) => (
                            <div
                                key={idx}
                                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-lg"
                            >
                                <Image
                                    src={imgUrl}
                                    alt={`${product.name} Architectural Ambiance ${idx + 1}`}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
                                    <span className="text-[10px] font-mono text-[#C5A880] uppercase tracking-widest font-bold">
                                        Ambiance Scene 0{idx + 1}
                                    </span>
                                    <p className="text-white text-sm font-playfair font-medium mt-1">
                                        {product.name} Architectural Installation
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. RELATED RECOMMENDATIONS */}
                <div className="border-t border-zinc-200 dark:border-white/10 pt-16 sm:pt-20">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <span className="text-zinc-400 tracking-[0.2em] text-[10px] font-bold uppercase block mb-2">
                                Architectural Pairings
                            </span>
                            <h2 className="text-2xl sm:text-3xl font-playfair font-bold text-zinc-900 dark:text-white">
                                Complete the Aesthetic
                            </h2>
                        </div>
                        <Link href="/products" className="text-xs font-mono font-bold tracking-wider text-[#C5A880] hover:underline">
                            Explore All Collections →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                        {relatedProducts.map((related) => (
                            <Link key={related.id} href={`/products/${related.id}`} className="group block">
                                <div className="relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 mb-4 shadow-sm group-hover:shadow-xl transition-all">
                                    <Image
                                        src={related.image}
                                        alt={related.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-mono text-[#C5A880] uppercase tracking-wider font-bold">
                                        {related.brand === 'dune' ? 'Dune' : 'Roca'}
                                    </div>
                                </div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white group-hover:text-[#C5A880] transition-colors font-playfair">
                                    {related.name}
                                </h3>
                                <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-mono mt-1">
                                    {related.category}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* FULLSCREEN ZOOM MODAL */}
            {isZoomOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
                    <button
                        type="button"
                        onClick={() => setIsZoomOpen(false)}
                        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="relative w-full max-w-4xl h-[75vh] flex items-center justify-center">
                        <Image
                            src={displayedMainImage}
                            alt={`${product.name} Full View`}
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="text-center mt-6 text-white font-mono text-xs">
                        <span className="text-[#C5A880] font-bold">{product.name}</span> — {selectedColor} ({viewMode === "tile" ? "Real Material Surface Piece" : "In-Situ Scene"})
                    </div>
                </div>
            )}
        </div>
    );
}
