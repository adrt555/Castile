import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { allProducts, categories } from "../../data/products";

interface FilterParams {
    category?: string;
    brand?: string;
    look?: string;
    finish?: string;
    usage?: string;
    search?: string;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<FilterParams> }) {
    const params = await searchParams;
    const { category, brand, look, finish, usage, search } = params;

    let filteredProducts = allProducts;

    if (category) filteredProducts = filteredProducts.filter(p => p.collectionId === category);
    if (brand) filteredProducts = filteredProducts.filter(p => p.brand === brand);
    if (look) filteredProducts = filteredProducts.filter(p => p.look === look);
    if (finish) filteredProducts = filteredProducts.filter(p => p.finish?.includes(finish));
    if (usage) filteredProducts = filteredProducts.filter(p => p.usage?.includes(usage));
    if (search) {
        const s = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(s) || 
            p.description?.toLowerCase().includes(s) ||
            p.brand.toLowerCase().includes(s)
        );
    }

    const brands = [
        { id: "roca-tiles", name: "Roca Tiles" },
        { id: "dune", name: "Dune" }
    ];

    const looks = ["Marble", "Stone", "Concrete", "Wood", "Modern"];
    const finishes = ["Matte", "Polished", "Lappato"];
    const usages = ["Floor", "Wall", "Indoor", "Outdoor"];

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-24 sm:pt-32 pb-20 sm:pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Expert Search & Header */}
                <div className="mb-16">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-12">
                        <div className="max-w-2xl">
                            <span className="text-amber-500 tracking-[0.3em] text-[10px] font-bold uppercase block mb-4">Official Brand Partner</span>
                            <h1 className="text-5xl sm:text-8xl font-playfair mb-6 tracking-tighter leading-[0.9]">Architectural<br />Marketplace</h1>
                            <p className="text-zinc-500 dark:text-white/60 text-sm sm:text-xl font-light leading-relaxed">
                                Expertly curated surfaces and fixtures from <span className="text-zinc-900 dark:text-white font-medium underline decoration-amber-500/30">Roca</span> and <span className="text-zinc-900 dark:text-white font-medium underline decoration-amber-500/30">Dune</span>.
                            </p>
                        </div>
                        
                        <div className="w-full lg:w-96">
                            <form action="/products" method="get" className="relative group">
                                <input 
                                    type="text" 
                                    name="search"
                                    placeholder="Search by collection, brand or material..." 
                                    defaultValue={search}
                                    className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-white/10 py-4 px-2 text-lg sm:text-xl font-playfair focus:outline-none focus:border-amber-500 transition-all placeholder:text-zinc-300"
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-amber-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                                </button>
                            </form>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {["Marble", "Polished", "Large Format", "New"].map(chip => (
                                    <Link key={chip} href={`/products?search=${chip}`} className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-full hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all">
                                        {chip}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                    {/* Advanced Filter Sidebar */}
                    <aside className="w-full lg:w-72 shrink-0 px-1">
                        <div className="lg:sticky lg:top-32 space-y-10">
                            {/* Search */}
                            <div>
                                <h2 className="text-[10px] font-bold mb-4 uppercase tracking-[0.3em] text-zinc-400">Search</h2>
                                <form action="/products" method="get" className="relative">
                                    <input 
                                        type="text" 
                                        name="search"
                                        placeholder="Search products..." 
                                        defaultValue={search}
                                        className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-100 dark:border-white/10 rounded-sm px-4 py-3 text-xs focus:outline-none focus:border-amber-500/50 transition-colors"
                                    />
                                    {brand && <input type="hidden" name="brand" value={brand} />}
                                </form>
                            </div>

                            {/* Brands */}
                            <div>
                                <h2 className="text-[10px] font-bold mb-4 uppercase tracking-[0.3em] text-zinc-400">Brand</h2>
                                <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-3">
                                    {brands.map(b => (
                                        <Link 
                                            key={b.id}
                                            href={`/products?brand=${b.id}${category ? `&category=${category}` : ''}`}
                                            className={`px-4 py-2 lg:px-0 lg:py-0 text-[10px] uppercase tracking-widest transition-colors ${brand === b.id ? 'text-amber-500 font-bold' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                                        >
                                            {b.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Looks */}
                            <div>
                                <h2 className="text-[10px] font-bold mb-4 uppercase tracking-[0.3em] text-zinc-400">Look</h2>
                                <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-3">
                                    {looks.map(l => (
                                        <Link 
                                            key={l}
                                            href={`/products?look=${l}${brand ? `&brand=${brand}` : ''}`}
                                            className={`px-4 py-2 lg:px-0 lg:py-0 text-[10px] uppercase tracking-widest transition-colors ${look === l ? 'text-amber-500 font-bold' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                                        >
                                            {l}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Finishes */}
                            <div>
                                <h2 className="text-[10px] font-bold mb-4 uppercase tracking-[0.3em] text-zinc-400">Finish</h2>
                                <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-3">
                                    {finishes.map(f => (
                                        <Link 
                                            key={f}
                                            href={`/products?finish=${f}${brand ? `&brand=${brand}` : ''}`}
                                            className={`px-4 py-2 lg:px-0 lg:py-0 text-[10px] uppercase tracking-widest transition-colors ${finish === f ? 'text-amber-500 font-bold' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                                        >
                                            {f}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Usage */}
                            <div>
                                <h2 className="text-[10px] font-bold mb-4 uppercase tracking-[0.3em] text-zinc-400">Application</h2>
                                <div className="flex flex-wrap lg:flex-col gap-2 lg:gap-3">
                                    {usages.map(u => (
                                        <Link 
                                            key={u}
                                            href={`/products?usage=${u}${brand ? `&brand=${brand}` : ''}`}
                                            className={`px-4 py-2 lg:px-0 lg:py-0 text-[10px] uppercase tracking-widest transition-colors ${usage === u ? 'text-amber-500 font-bold' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}
                                        >
                                            {u}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <main className="flex-1">
                        <Suspense fallback={<div className="text-center py-20 text-white/50 animate-pulse uppercase tracking-widest text-[10px]">Filtering Collections...</div>}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-16 gap-x-10">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="group flex flex-col">
                                        <Link href={`/products/${product.id}`} className="relative aspect-[4/5] overflow-hidden mb-6 bg-zinc-50 dark:bg-zinc-900 rounded-sm">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-all duration-1000 group-hover:scale-110 group-hover:opacity-80"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-6 text-center backdrop-blur-[2px]">
                                                <span className="text-white text-[10px] font-bold uppercase tracking-[0.3em] mb-4 border border-white/30 px-4 py-2">Quick View</span>
                                                <p className="text-white/80 text-[9px] uppercase tracking-widest max-w-[180px] line-clamp-2">{product.description}</p>
                                            </div>
                                            {product.isNew && (
                                                <div className="absolute top-4 left-4 bg-white text-black text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm shadow-xl z-20">
                                                    New
                                                </div>
                                            )}
                                        </Link>
                                        
                                        <div className="flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-1 block">{(product as any).brand.replace('-', ' ')}</span>
                                                    <h3 className="text-xl font-medium text-black dark:text-white font-playfair">{product.name}</h3>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 block">{product.look} Look</span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-2 mb-6">
                                                {product.colors.slice(0, 5).map(color => (
                                                    <div 
                                                        key={color} 
                                                        title={color}
                                                        className="w-3 h-3 rounded-full border border-zinc-200 dark:border-white/10 shadow-sm"
                                                        style={{ backgroundColor: color.toLowerCase() === 'white' ? '#fff' : color.toLowerCase() === 'black' ? '#000' : '#d4d4d8' }}
                                                    />
                                                ))}
                                                {product.colors.length > 5 && (
                                                    <span className="text-[9px] text-zinc-400 font-bold">+{product.colors.length - 5}</span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <Link 
                                                    href={`/products/${product.id}`}
                                                    className="text-center py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                                                >
                                                    Add to Quote
                                                </Link>
                                                <Link 
                                                    href={`/products/${product.id}`}
                                                    className="text-center py-3 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white text-[9px] font-bold uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
                                                >
                                                    Samples
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="text-center py-32 border border-dashed border-zinc-200 dark:border-white/20 rounded-xl">
                                    <p className="text-lg text-zinc-400 dark:text-white/40 font-light mb-8">No collections match your current filter selection.</p>
                                    <Link href="/products" className="inline-block px-10 py-4 bg-zinc-900 text-white text-[10px] font-bold tracking-[0.2em] uppercase">
                                        Reset All Filters
                                    </Link>
                                </div>
                            )}
                        </Suspense>
                    </main>
                </div>
            </div>
        </div>
    );
}
