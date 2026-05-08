import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allProducts } from "../../../data/products";
import rawData from "../../../data/extracted_products.json";
import projectDataRaw from "../../../data/collection_projects.json";
import VariationCards from "./VariationCards";

export default async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = allProducts.find(p => p.id === id);

    if (!product) {
        notFound();
    }

    // Find some related products (just picking a few random ones for the demo)
    const relatedProducts = allProducts.filter(p => p.id !== id).slice(0, 3);

    // Get exact variation SKUs from the raw extraction data for this collection
    const collectionSkus = rawData.filter((item: any) => item.collection === product.name);

    // Deduplicate logic to show unique color/size combos if necessary, or just show all
    // For the UI, we'll try to match the screenshot showing large variation cards
    const uniqueVariants = Array.from(new Map(collectionSkus.map((item: any) => [item.sku, item])).values()).slice(0, 6); // Limit to 6 for layout

    // Compile 3 distinct images for the top masonry gallery (Projects -> Main Image -> Top Variations)
    const collectionSlug = product.collectionId;
    const projectImages = (projectDataRaw as Record<string, string[]>)[collectionSlug] || [];

    // 1. Prioritize the scraped "Projects" lifestyle images
    const galleryImages = [...projectImages.slice(0, 3)];

    // 2. Add the main hero image
    if (galleryImages.length < 3 && !galleryImages.includes(product.image)) {
        galleryImages.push(product.image);
    }

    // 3. Fallback to distinct high-res variant textures for remaining slots
    for (const variant of uniqueVariants) {
        if (galleryImages.length >= 3) break;
        if (variant.image && variant.image !== "/products/placeholder.jpg" && !galleryImages.includes(variant.image)) {
            galleryImages.push(variant.image);
        }
    }

    // Safeguard to ensure we always have 3 elements to render (fallback to repeat main image if absolutely necessary)
    while (galleryImages.length < 3) {
        galleryImages.push(product.image);
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-24 sm:pt-32 pb-20 sm:pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* Breadcrumbs */}
                <nav className="flex text-[10px] sm:text-xs text-zinc-400 dark:text-white/40 mb-8 sm:mb-12 uppercase tracking-widest font-bold flex-wrap gap-y-2 px-1">
                    <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
                    <span className="mx-2 sm:mx-3 opacity-30">/</span>
                    <Link href="/products" className="hover:text-amber-500 transition-colors">Collections</Link>
                    <span className="mx-2 sm:mx-3 opacity-30">/</span>
                    <Link href={`/products?category=${product.collectionId}`} className="hover:text-amber-500 transition-colors truncate max-w-[100px] sm:max-w-none">{product.category}</Link>
                    <span className="mx-2 sm:mx-3 opacity-30">/</span>
                    <span className="text-zinc-900 dark:text-white truncate max-w-[120px] sm:max-w-none">{product.name}</span>
                </nav>

                {/* Product Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 mb-20 sm:mb-32">
                    {/* Images */}
                    <div className="space-y-4 sm:space-y-6">
                        <div className="relative aspect-[4/5] sm:aspect-square w-full bg-zinc-50 dark:bg-zinc-900 overflow-hidden rounded-sm">
                            <Image
                                src={galleryImages[0]}
                                alt={product.name}
                                fill
                                className="object-cover animate-[fadeIn_0.8s_ease-out]"
                                priority
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 sm:gap-6">
                            <div className="relative aspect-square bg-zinc-50 dark:bg-zinc-900 overflow-hidden rounded-sm">
                                <Image src={galleryImages[1]} alt={product.name} fill className="object-cover scale-150 origin-top-left" />
                            </div>
                            <div className="relative aspect-square bg-zinc-50 dark:bg-zinc-900 overflow-hidden rounded-sm">
                                <Image src={galleryImages[2]} alt={product.name} fill className="object-cover scale-125 origin-bottom-right" />
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col px-1">
                        <div className="mb-6 sm:mb-8">
                            <p className="text-zinc-400 dark:text-white/40 uppercase tracking-[0.2em] font-bold text-[10px] sm:text-xs mb-3 sm:mb-4">
                                {product.category} • Premium Surface
                            </p>
                            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-playfair mb-4 sm:mb-6 text-zinc-900 dark:text-white leading-[1.1]">
                                {product.name}
                            </h1>
                        </div>

                        <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-500 dark:text-white/60 font-light text-base sm:text-lg leading-relaxed mb-10 sm:mb-12">
                            <p>{product.description}</p>
                        </div>

                        {/* Available Options */}
                        <div className="space-y-8 sm:space-y-12 mb-12">
                            <VariationCards variants={uniqueVariants} product={product} />

                            {/* Sizes */}
                            <div className="pb-8 border-b border-zinc-100 dark:border-white/10">
                                <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-900 dark:text-white mb-6">Available Formats ({product.sizes.length})</h3>
                                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
                                    {product.sizes.map(size => (
                                        <div key={size} className="px-4 py-3 sm:px-5 sm:py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-sm text-[10px] sm:text-xs text-zinc-900 dark:text-white/90 font-bold tracking-widest text-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer">
                                            {size}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Technical Specs Table */}
                            <div className="pt-4">
                                <h3 className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-zinc-900 dark:text-white mb-6 border-b-2 border-zinc-900 dark:border-white pb-2 inline-block">Technical Specifications</h3>
                                <div className="overflow-x-auto w-full no-scrollbar mb-8">
                                    <table className="w-full text-[10px] sm:text-xs text-left border-collapse min-w-[500px]">
                                        <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400 font-bold uppercase tracking-widest">
                                            <tr>
                                                <th className="px-5 py-4 border border-zinc-100 dark:border-zinc-800 w-1/3">Series</th>
                                                <th className="px-5 py-4 border border-zinc-100 dark:border-zinc-800">DCOF</th>
                                                <th className="px-5 py-4 border border-zinc-100 dark:border-zinc-800">Thickness</th>
                                                <th className="px-5 py-4 border border-zinc-100 dark:border-zinc-800 text-center">Docs</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-white dark:bg-transparent text-zinc-900 dark:text-white font-medium">
                                                <td className="px-5 py-5 border border-zinc-100 dark:border-zinc-800 capitalize font-bold">{product.name.toLowerCase()}</td>
                                                <td className="px-5 py-5 border border-zinc-100 dark:border-zinc-800">&gt;=0.42</td>
                                                <td className="px-5 py-5 border border-zinc-100 dark:border-zinc-800">9 mm</td>
                                                <td className="px-5 py-5 border border-zinc-100 dark:border-zinc-800 text-center">
                                                    <svg className="w-5 h-5 mx-auto text-zinc-400 hover:text-amber-500 cursor-pointer transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v6m-3-3h6"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l3 3 3-3"></path></svg>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Brochures */}
                                <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-white/10">
                                    <h3 className="text-2xl sm:text-3xl font-playfair text-zinc-900 dark:text-white mb-6">Documentation</h3>
                                    <ul className="space-y-4 text-[10px] sm:text-xs font-bold text-zinc-500 dark:text-white/60 tracking-[0.1em] uppercase">
                                        <li className="flex items-center gap-4 cursor-pointer hover:text-amber-600 transition-colors group">
                                            <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                            </div>
                                            Download {product.name.split(' ')[0] || product.name} Sell Sheet
                                        </li>
                                        <li className="flex items-center gap-4 cursor-pointer hover:text-amber-600 transition-colors group">
                                            <div className="w-8 h-8 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                            </div>
                                            Download {product.name.split(' ')[0] || product.name} Faces Graphic
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-8">
                            <button className="w-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-5 px-8 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-2xl active:scale-[0.98]">
                                Order Sample Kit
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="border-t border-zinc-100 dark:border-white/10 pt-16 sm:pt-24 px-1">
                    <div className="flex justify-between items-end mb-10 sm:mb-12">
                        <div>
                            <span className="text-zinc-400 tracking-[0.2em] text-[10px] font-bold uppercase block mb-2 sm:mb-3">Recommendation</span>
                            <h2 className="text-3xl sm:text-4xl font-playfair">Complete the Look</h2>
                        </div>
                        <Link href="/products" className="text-[10px] font-bold tracking-[0.2em] uppercase border-b border-zinc-200 pb-1 hover:border-zinc-900 transition-colors">
                            View All
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {relatedProducts.map((related) => (
                            <Link key={related.id} href={`/products/${related.id}`} className="group block">
                                <div className="relative aspect-square overflow-hidden mb-5 bg-zinc-50 dark:bg-zinc-900 rounded-sm">
                                    <Image
                                        src={related.image}
                                        alt={related.name}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h3 className="text-xl font-medium text-zinc-900 dark:text-white mb-1 font-playfair">{related.name}</h3>
                                    <p className="text-zinc-400 dark:text-white/40 text-[10px] tracking-widest uppercase font-bold">{related.category}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
