import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { allProducts, categories } from "../../data/products";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
    const params = await searchParams;
    const currentCategory = params.category;

    const filteredProducts = currentCategory
        ? allProducts.filter(p => p.collectionId === currentCategory) // Changed to match the collectionId slug
        : allProducts;

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-24 sm:pt-32 pb-20 sm:pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="mb-10 sm:mb-16 px-1">
                    <h1 className="text-3xl sm:text-6xl font-playfair mb-4 sm:mb-6 tracking-tight leading-tight">Discover Our Collections</h1>
                    <p className="text-zinc-500 dark:text-white/60 max-w-2xl text-sm sm:text-lg font-light leading-relaxed">
                        Browse our carefully curated selection of the finest surfaces for timeless architectural projects.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Sidebar / Filters - Mobile Horizontal Scroll */}
                    <aside className="w-full lg:w-64 shrink-0 px-1 overflow-x-auto lg:overflow-visible no-scrollbar">
                        <div className="lg:sticky lg:top-32 lg:max-h-[calc(100vh-8rem)]">
                            <h2 className="hidden lg:block text-[10px] font-bold mb-6 uppercase tracking-[0.3em] text-zinc-400">Collections</h2>
                            <ul className="flex lg:flex-col gap-3 lg:gap-4 text-zinc-600 dark:text-white/60 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] whitespace-nowrap pb-4 lg:pb-0">
                                <li>
                                    <Link href="/products" className={`px-4 py-2 lg:px-0 lg:py-0 border border-zinc-100 lg:border-none rounded-full block ${!currentCategory ? 'text-amber-500 bg-amber-50 lg:bg-transparent' : 'hover:text-black dark:hover:text-white'}`}>
                                        All Collections
                                    </Link>
                                </li>
                                {categories.map(cat => (
                                    <li key={cat.slug}>
                                        <Link
                                            href={`/products?category=${cat.slug}`}
                                            className={`px-4 py-2 lg:px-0 lg:py-0 border border-zinc-100 lg:border-none rounded-full block ${currentCategory === cat.slug ? 'text-amber-500 bg-amber-50 lg:bg-transparent font-black' : 'hover:text-black dark:hover:text-white'}`}
                                        >
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <main className="flex-1">
                        <Suspense fallback={<div className="text-center py-20 text-white/50">Loading collection...</div>}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {filteredProducts.map((product) => (
                                    <Link key={product.id} href={`/products/${product.id}`} className="group block px-1 sm:px-0">
                                        <div className="relative aspect-square overflow-hidden mb-4 sm:mb-5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-white/5 rounded-sm">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                            />
                                            {product.isNew && (
                                                <div className="absolute top-3 left-3 bg-white text-black text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm shadow-xl">
                                                    New
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <h3 className="text-lg sm:text-xl font-medium text-black dark:text-white mb-1 sm:mb-2 font-playfair">{product.name}</h3>
                                            <p className="text-zinc-400 dark:text-white/40 text-[10px] tracking-widest uppercase mb-1 sm:mb-1">{product.category}</p>
                                            <p className="text-zinc-400 dark:text-white/40 text-[10px] uppercase font-bold tracking-tight">
                                                {product.colors.length} Colors • {product.sizes.length} Sizes
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="text-center py-24 sm:py-32 border border-dashed border-zinc-200 dark:border-white/20 rounded-xl">
                                    <p className="text-lg text-zinc-400 dark:text-white/40 font-light">No products found for this category.</p>
                                    <Link href="/products" className="mt-6 inline-block text-[10px] border-b border-black dark:border-white pb-1 font-bold tracking-widest uppercase">
                                        Clear Filters
                                    </Link>
                                </div>
                            )}
                        </Suspense>
                    </main >
                </div >
            </div >
        </div >
    );
}
