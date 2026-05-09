import Image from "next/image";
import Link from "next/link";
import { allProducts, categories } from "../data/products";

export default function Home() {
  // Select some premium categories for the homepage
  const featuredCategories = categories.filter(c => ["calacata-gold", "abaco", "artesano", "agatha", "zellige", "avenue"].includes(c.slug));
  const newArrivals = allProducts.filter(p => p.isNew).slice(0, 4);

  return (
    <div className="flex flex-col w-full min-h-screen bg-white text-zinc-900">

      {/* Hero Section */}
      <section className="relative w-full h-[85vh] sm:h-screen flex items-end justify-start overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://rocatileusa.com/uploads/2021/09/amb-01-CALACATTA-GOLD-1.jpg"
            alt="Premium Surface"
            fill
            className="object-cover animate-[kenburns_40s_ease-out_forwards]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        </div>

        <div className="relative z-10 px-6 sm:px-16 pb-12 sm:pb-20 max-w-7xl mx-auto w-full flex flex-col items-start animate-[fadeIn_1s_ease-out]">
          <span className="text-white tracking-[0.3em] text-[10px] sm:text-xs font-bold uppercase mb-3 sm:mb-4 opacity-90">Premium Surfaces</span>
          <h1 className="text-4xl sm:text-7xl lg:text-8xl font-playfair text-white mb-6 sm:mb-8 tracking-tight leading-[1.1] max-w-4xl drop-shadow-2xl">
            Architectural <br />Excellence
          </h1>
          <Link
            href="/products?brand=roca-tiles"
            className="w-full sm:w-auto text-center px-10 py-4 bg-white text-zinc-900 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all duration-300 shadow-xl active:scale-95"
          >
            Explore Roca
          </Link>
        </div>
      </section>

      {/* Brand Selection Section */}
      <section className="py-20 sm:py-32 px-6 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-zinc-400 tracking-[0.3em] text-[10px] sm:text-xs font-bold uppercase block mb-4">Our Partners</span>
          <h2 className="text-3xl sm:text-5xl font-playfair text-zinc-900">Premium Brands</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {/* Roca Tiles */}
          <Link href="/products?brand=roca-tiles" className="group flex flex-col items-center">
            <div className="relative w-full aspect-[4/5] bg-zinc-100 rounded-xl overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 border border-zinc-200">
              <Image
                src="https://rocatileusa.com/wp-content/uploads/2023/07/Roca-Tile-Collections-Header.jpg"
                alt="Roca Tiles"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[10px] font-bold uppercase tracking-[0.3em] border border-white/50 px-6 py-3 backdrop-blur-sm">Roca Tiles</span>
              </div>
            </div>
            <h3 className="mt-6 text-sm font-bold tracking-[0.2em] uppercase text-zinc-500 group-hover:text-zinc-900 transition-colors">Roca Tiles</h3>
          </Link>

          {/* Dune */}
          <Link href="/products?brand=dune" className="group flex flex-col items-center">
            <div className="relative w-full aspect-[4/5] bg-zinc-100 rounded-xl overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2 border border-zinc-200">
              <Image
                src="https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/azulejos-rosas-para-banos-1777290132PY6P3.jpg"
                alt="Dune"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[10px] font-bold uppercase tracking-[0.3em] border border-white/50 px-6 py-3 backdrop-blur-sm">Dune Ceramics</span>
              </div>
            </div>
            <h3 className="mt-6 text-sm font-bold tracking-[0.2em] uppercase text-zinc-500 group-hover:text-zinc-900 transition-colors">Dune</h3>
          </Link>
        </div>
      </section>

      {/* Featured Collections Gallery */}
      <section className="py-16 sm:py-24 px-4 sm:px-8 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 sm:mb-16 gap-4 sm:gap-6 px-2">
            <div>
              <span className="text-zinc-400 tracking-[0.2em] text-[10px] sm:text-xs font-bold uppercase block mb-2 sm:mb-3">Curated</span>
              <h2 className="text-3xl sm:text-5xl font-playfair text-zinc-900">Explore Collections</h2>
            </div>
            <Link href="/products" className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase border-b border-zinc-200 pb-1 hover:border-zinc-900 transition-colors">
              View All Collections
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12 sm:gap-y-16">
            {featuredCategories.map((category) => (
              <Link key={category.slug} href={`/products?category=${category.slug}`} className="group block px-2 sm:px-0">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-zinc-200 mb-4 sm:mb-6 rounded-sm">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                </div>
                <div className="text-center px-4">
                  <h3 className="text-xl font-playfair text-zinc-900 mb-1 sm:mb-2">{category.name}</h3>
                  <span className="text-zinc-400 text-[10px] font-bold tracking-widest uppercase">{category.materials?.[0]} • {category.count} Products</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured / New Arrivals */}
      <section className="py-20 sm:py-32 px-6 sm:px-8 max-w-[1400px] mx-auto">
        <div className="text-center mb-12 sm:mb-20">
          <span className="text-zinc-400 tracking-[0.2em] text-[10px] sm:text-xs font-bold uppercase block mb-2 sm:mb-3">Trending</span>
          <h2 className="text-3xl sm:text-5xl font-playfair text-zinc-900">New Arrivals</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {newArrivals.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group block">
              <div className="relative aspect-square overflow-hidden mb-4 sm:mb-5 bg-zinc-100 border border-zinc-100 rounded-sm">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <h3 className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-zinc-900 mb-1">{product.name}</h3>
                <p className="text-zinc-400 text-[10px] uppercase font-bold tracking-tight">{product.colors?.[0]} Variation</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <Link href="/products" className="inline-block w-full sm:w-auto px-12 py-4 bg-zinc-900 text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all duration-300 shadow-xl active:scale-95">
            Shop The Look
          </Link>
        </div>
      </section>

      {/* Banner Section */}
      <section className="relative py-24 sm:py-48 px-6 sm:px-8 bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://rocatileusa.com/uploads/2021/07/ROCA_Downtown-living-min.jpg"
            alt="Downtown Collection"
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-6xl font-playfair text-white mb-4 sm:mb-6 leading-tight">Redefining Urban Spaces</h2>
          <p className="text-base sm:text-lg text-zinc-300 font-light mb-8 sm:mb-10 leading-relaxed">Discover the DOWNTOWN collection, designed for the modern metropolis.</p>
          <Link href="/products?category=downtown" className="inline-block w-full sm:w-auto px-12 py-4 bg-white text-zinc-900 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all duration-300 shadow-xl active:scale-95">
            Explore Downtown
          </Link>
        </div>
      </section>

    </div>
  );
}

