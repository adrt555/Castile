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
        <div className="min-h-screen bg-zinc-50 dark:bg-black pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6">

                {/* Breadcrumbs */}
                <nav className="flex text-sm text-zinc-500 dark:text-white/50 mb-12 uppercase tracking-widest font-semibold flex-wrap gap-y-2">
                    <Link href="/" className="hover:text-amber-500 transition-colors">Home</Link>
                    <span className="mx-3">/</span>
                    <Link href="/products" className="hover:text-amber-500 transition-colors">Collections</Link>
                    <span className="mx-3">/</span>
                    <Link href={`/products?category=${product.collectionId}`} className="hover:text-amber-500 transition-colors">{product.category}</Link>
                    <span className="mx-3">/</span>
                    <span className="text-white">{product.name}</span>
                </nav>

                {/* Product Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
                    {/* Images */}
                    <div className="space-y-6">
                        <div className="relative aspect-[4/5] md:aspect-square w-full bg-zinc-200 dark:bg-zinc-900 overflow-hidden">
                            <Image
                                src={galleryImages[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="relative aspect-square bg-zinc-200 dark:bg-zinc-900 overflow-hidden">
                                <Image src={galleryImages[1]} alt={product.name} fill className="object-cover scale-150 origin-top-left" />
                            </div>
                            <div className="relative aspect-square bg-zinc-200 dark:bg-zinc-900 overflow-hidden">
                                <Image src={galleryImages[2]} alt={product.name} fill className="object-cover scale-125 origin-bottom-right" />
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col">
                        <div className="mb-8">
                            <p className="text-zinc-500 dark:text-white/50 uppercase tracking-widest font-semibold text-sm mb-4">{product.category}</p>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair mb-6 text-zinc-900 dark:text-white">{product.name}</h1>
                        </div>

                        <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-white/70 font-light text-lg leading-relaxed mb-12">
                            <p>{product.description}</p>
                        </div>

                        {/* Available Options */}
                        <div className="space-y-8 mb-12 focus:outline-none">
                            <VariationCards variants={uniqueVariants} product={product} />

                            {/* Sizes */}
                            <div className="pb-8 border-b border-zinc-200 dark:border-white/10">
                                <h3 className="text-sm uppercase tracking-widest font-semibold text-zinc-900 dark:text-white mb-4">Available Formats ({product.sizes.length})</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.sizes.map(size => (
                                        <div key={size} className="px-5 py-2.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 rounded-lg text-sm text-zinc-900 dark:text-white/90 font-medium tracking-wider shrink-0 cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shadow-sm">
                                            {size}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Technical Specs Table */}
                            <div className="pb-12 pt-6">
                                <h3 className="text-[1.1rem] uppercase tracking-widest font-black text-zinc-900 dark:text-white mb-6 border-b-2 border-zinc-900 dark:border-white pb-1 inline-block">Technical Specifications</h3>
                                <div className="overflow-x-auto w-full mb-12">
                                    <table className="w-full text-sm text-left border-collapse border border-zinc-200 dark:border-zinc-800">
                                        <thead className="bg-[#f0f0f0] dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-400 font-medium">
                                            <tr>
                                                <th className="px-5 py-4 border border-zinc-300 dark:border-zinc-800 font-medium w-1/3">Title</th>
                                                <th className="px-5 py-4 border border-zinc-300 dark:border-zinc-800 font-medium">DCOF</th>
                                                <th className="px-5 py-4 border border-zinc-300 dark:border-zinc-800 font-medium">Tile Thickness</th>
                                                <th className="px-5 py-4 border border-zinc-300 dark:border-zinc-800 font-medium w-32">Download</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr className="bg-white dark:bg-transparent text-zinc-900 dark:text-white/90">
                                                <td className="px-5 py-5 border border-zinc-300 dark:border-zinc-800 capitalize">{product.name.toLowerCase()}</td>
                                                <td className="px-5 py-5 border border-zinc-300 dark:border-zinc-800">&gt;=0.42</td>
                                                <td className="px-5 py-5 border border-zinc-300 dark:border-zinc-800">9 mm</td>
                                                <td className="px-5 py-5 border border-zinc-300 dark:border-zinc-800 text-left">
                                                    <svg className="w-5 h-5 inline-block text-zinc-800 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-white cursor-pointer transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v6m-3-3h6"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l3 3 3-3"></path></svg>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Brochures */}
                                <div className="mt-8">
                                    <h3 className="text-3xl font-sans lg:text-4xl text-zinc-900 dark:text-white mb-8 tracking-wide capitalize">{product.name.toLowerCase()} Brochures</h3>
                                    <ul className="space-y-4 text-[13px] font-bold text-zinc-900 dark:text-white/90 tracking-wide">
                                        <li className="flex items-center gap-3 cursor-pointer hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                            Download {product.name.split(' ')[0] || product.name} Sell Sheet
                                        </li>
                                        <li className="flex items-center gap-3 cursor-pointer hover:text-amber-600 dark:hover:text-amber-500 transition-colors">
                                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                            Download {product.name.split(' ')[0] || product.name} Faces Graphic
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto flex flex-col sm:flex-row gap-4">
                            <button className="flex-1 bg-black dark:bg-white text-white dark:text-black py-5 px-8 text-sm font-semibold uppercase tracking-widest hover:bg-black/90 dark:hover:bg-white/90 transition-all duration-300">
                                Order Sample
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                <div className="border-t border-white/10 pt-24">
                    <div className="flex justify-between items-end mb-12">
                        <h2 className="text-3xl font-playfair">Complete the Look</h2>
                        <Link href="/products" className="text-sm font-semibold tracking-widest uppercase border-b border-white pb-1 hover:text-amber-500 hover:border-amber-500 transition-colors">
                            View All
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                        {relatedProducts.map((related) => (
                            <Link key={related.id} href={`/products/${related.id}`} className="group block">
                                <div className="relative aspect-square overflow-hidden mb-5 bg-zinc-900 rounded-xl">
                                    <Image
                                        src={related.image}
                                        alt={related.name}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-white mb-1 font-playfair">{related.name}</h3>
                                    <p className="text-white/50 text-sm tracking-wide uppercase">{related.category}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
