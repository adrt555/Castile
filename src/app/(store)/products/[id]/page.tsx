import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { allProducts } from "../../../data/products";

export default async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = allProducts.find(p => p.id === id);

    if (!product) {
        notFound();
    }

    // Find some related products (just picking a few random ones for the demo)
    const relatedProducts = allProducts.filter(p => p.id !== id).slice(0, 3);

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
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="relative aspect-square bg-zinc-200 dark:bg-zinc-900 overflow-hidden">
                                <Image src={product.image} alt={product.name} fill className="object-cover scale-150 origin-top-left" />
                            </div>
                            <div className="relative aspect-square bg-zinc-200 dark:bg-zinc-900 overflow-hidden">
                                <Image src={product.image} alt={product.name} fill className="object-cover scale-125 origin-bottom-right" />
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col">
                        <div className="mb-8">
                            <p className="text-white/50 uppercase tracking-widest font-semibold text-sm mb-4">{product.category}</p>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair mb-6">{product.name}</h1>
                        </div>

                        <div className="prose prose-zinc dark:prose-invert max-w-none text-white/70 font-light text-lg leading-relaxed mb-12">
                            <p>{product.description}</p>
                        </div>

                        {/* Available Options */}
                        <div className="space-y-8 mb-12 focus:outline-none">
                            {/* Colors */}
                            <div className="pb-8 border-b border-white/10">
                                <h3 className="text-sm uppercase tracking-widest font-semibold text-white mb-4">Available Colors ({product.colors.length})</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.colors.map(color => (
                                        <div key={color} className="px-4 py-2 border border-white/20 rounded-full text-sm text-white/80 shrink-0">
                                            {color}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Sizes */}
                            <div className="pb-8 border-b border-white/10">
                                <h3 className="text-sm uppercase tracking-widest font-semibold text-white mb-4">Available Formats ({product.sizes.length})</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.sizes.map(size => (
                                        <div key={size} className="px-5 py-2.5 bg-zinc-900 border border-white/10 rounded-lg text-sm text-white/90 font-medium tracking-wider shrink-0">
                                            {size}
                                        </div>
                                    ))}
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
