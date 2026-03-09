import Image from "next/image";
import Link from "next/link";
import { allProducts, categories } from "../data/products";

export default function Home() {
  // Select some premium categories for the homepage
  const featuredCategories = categories.filter(c => ["calacata-gold", "abaco", "artesano", "avenue", "june", "zellige"].includes(c.slug));
  const newArrivals = allProducts.filter(p => p.isNew).slice(0, 4);

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-zinc-900">

      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-end justify-start overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://rocatileusa.com/uploads/2021/09/amb-01-CALACATTA-GOLD-1-400x400.jpg"
            alt="Calacata Gold Surface"
            fill
            className="object-cover animate-[kenburns_30s_ease-out_forwards]"
            priority
          />
          {/* Subtle gradient so text is readable if placed over the image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"></div>
        </div>

        <div className="relative z-10 px-8 md:px-16 pb-20 max-w-7xl mx-auto w-full flex flex-col items-start">
          <span className="text-white tracking-[0.2em] text-xs font-semibold uppercase mb-4 opacity-90">Featured Collection</span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair text-white mb-8 tracking-tight leading-tight max-w-3xl drop-shadow-lg">
            Calacata Gold
          </h1>
          <Link
            href="/products?category=calacata-gold"
            className="px-10 py-4 bg-white text-zinc-900 text-xs font-bold uppercase tracking-[0.15em] hover:bg-zinc-100 transition-colors duration-300"
          >
            Discover More
          </Link>
        </div>
      </section>

      {/* Intro / Philosophy */}
      <section className="py-24 md:py-32 px-8 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-playfair mb-8 leading-snug text-zinc-800">
          Crafting spaces that endure.<br />Premium surfaces for architectural excellence.
        </h2>
        <p className="text-lg text-zinc-500 font-light leading-relaxed max-w-2xl mx-auto">
          Castile brings you the finest selection of porcelain, ceramic, and natural stone looks.
          Inspired by global trends and manufactured with cutting-edge technology, our collections
          provide the perfect foundation for residential and commercial projects alike.
        </p>
      </section>

      {/* Featured Collections Gallery */}
      <section className="py-20 px-4 md:px-8 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6 px-4">
            <div>
              <span className="text-zinc-400 tracking-[0.2em] text-xs font-bold uppercase block mb-3">Curated</span>
              <h2 className="text-3xl md:text-5xl font-playfair text-zinc-900">Explore Collections</h2>
            </div>
            <Link href="/products" className="text-xs font-bold tracking-[0.15em] uppercase border-b border-zinc-300 pb-1 hover:border-zinc-900 transition-colors self-start md:self-end">
              View All Collections
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16">
            {featuredCategories.map((category) => (
              <Link key={category.slug} href={`/products?category=${category.slug}`} className="group block">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-200 mb-6">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="text-center px-4">
                  <h3 className="text-xl font-playfair text-zinc-900 mb-2">{category.name}</h3>
                  <span className="text-zinc-500 text-xs font-medium tracking-widest uppercase">{category.materials?.[0]} • {category.count} Products</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured / New Arrivals (Minimalist Grid) */}
      <section className="py-32 px-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-20">
          <span className="text-zinc-400 tracking-[0.2em] text-xs font-bold uppercase block mb-3">Trending</span>
          <h2 className="text-3xl md:text-5xl font-playfair text-zinc-900">New Arrivals</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {newArrivals.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group block">
              <div className="relative aspect-square overflow-hidden mb-5 bg-zinc-100 border border-zinc-200">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <h3 className="text-sm font-semibold tracking-wider uppercase text-zinc-900 mb-1">{product.name}</h3>
                <p className="text-zinc-500 text-xs">{product.colors?.[0]} Variation</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link href="/products" className="inline-block px-10 py-4 bg-zinc-900 text-white text-xs font-bold uppercase tracking-[0.15em] hover:bg-zinc-800 transition-colors duration-300">
            Shop The Look
          </Link>
        </div>
      </section>

      {/* Banner Section */}
      <section className="relative py-32 md:py-48 px-8 bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://rocatileusa.com/uploads/2021/07/ROCA_Downtown-living-min-400x400.jpg"
            alt="Downtown Collection"
            fill
            className="object-cover opacity-50"
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-playfair text-white mb-6">Redefining Urban Spaces</h2>
          <p className="text-lg text-zinc-300 font-light mb-10">Discover the DOWNTOWN collection, designed for the modern metropolis.</p>
          <Link href="/products?category=downtown" className="px-10 py-4 bg-white text-zinc-900 text-xs font-bold uppercase tracking-[0.15em] hover:bg-zinc-100 transition-colors duration-300">
            Explore Downtown
          </Link>
        </div>
      </section>

    </div>
  );
}

