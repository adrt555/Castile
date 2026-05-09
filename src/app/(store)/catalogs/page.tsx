import Image from "next/image";
import Link from "next/link";

const catalogs = [
    {
        title: "Roca Tile Book 2026",
        brand: "Roca Tiles",
        description: "The complete 2026 collection of porcelain, ceramic, and natural stone surfaces.",
        image: "https://rocatileusa.com/wp-content/uploads/2023/07/Roca-Tile-Collections-Header.jpg",
        url: "https://rocatileusa.com/uploads/catalogs/18/ROCA%20Tile_Book_2026%20-%20WEB.pdf"
    },
    {
        title: "Dune General Catalog 2026",
        brand: "Dune",
        description: "Artistic and decorative tile collections, mosaics, and unique surfaces.",
        image: "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/azulejos-rosas-para-banos-1777290132PY6P3.jpg",
        url: "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/catalogo-general-dune-2026-1768480392gLl8K.pdf"
    },
    {
        title: "2026 DUNE Program (US)",
        brand: "Dune / Roca",
        description: "Specific program detailing US stock availability and architectural patterns.",
        image: "https://rocatileusa.com/wp-content/uploads/2021/01/Alaska-Header.jpg",
        url: "https://rocatileusa.com/uploads/catalogs/19/2026%20DUNE%20program%20JAN.pdf"
    }
];

export default function CatalogsPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-24 sm:pt-32 pb-20 sm:pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="mb-16 sm:mb-24 px-1 text-center lg:text-left">
                    <span className="text-amber-500 tracking-[0.3em] text-[10px] sm:text-xs font-bold uppercase block mb-4">Resources</span>
                    <h1 className="text-4xl sm:text-7xl font-playfair mb-6 sm:mb-8 tracking-tight leading-tight">Digital Catalogs</h1>
                    <p className="text-zinc-500 dark:text-white/60 max-w-2xl text-sm sm:text-lg font-light leading-relaxed mx-auto lg:mx-0">
                        Explore our latest collections and technical specifications through our official digital catalogs.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                    {catalogs.map((catalog, i) => (
                        <div key={i} className="group relative bg-zinc-50 dark:bg-white/5 rounded-2xl overflow-hidden border border-zinc-100 dark:border-white/10 transition-all duration-500 hover:shadow-2xl">
                            <div className="flex flex-col lg:flex-row h-full">
                                {/* Thumbnail */}
                                <div className="relative w-full lg:w-1/2 aspect-[4/3] lg:aspect-auto">
                                    <Image
                                        src={catalog.image}
                                        alt={catalog.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                                </div>

                                {/* Content */}
                                <div className="p-8 lg:w-1/2 flex flex-col justify-center">
                                    <span className="text-amber-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{catalog.brand}</span>
                                    <h2 className="text-xl sm:text-2xl font-playfair mb-4 text-zinc-900 dark:text-white group-hover:text-amber-500 transition-colors">{catalog.title}</h2>
                                    <p className="text-zinc-500 dark:text-white/50 text-sm font-light mb-8 leading-relaxed">
                                        {catalog.description}
                                    </p>
                                    <Link 
                                        href={catalog.url} 
                                        target="_blank"
                                        className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-900 dark:text-white hover:text-amber-500 transition-colors group/btn"
                                    >
                                        <span>View Catalog</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/btn:translate-x-1"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="mt-20 sm:mt-32 p-12 sm:p-20 bg-zinc-900 rounded-3xl text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <Image src="https://rocatileusa.com/wp-content/uploads/2021/01/Alaska-Header.jpg" alt="Background" fill className="object-cover" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-2xl sm:text-4xl font-playfair text-white mb-6">Need Architectural Samples?</h2>
                        <p className="text-zinc-400 max-w-xl mx-auto mb-10 text-sm sm:text-base font-light">Contact our sales team to request physical samples for your next residential or commercial project.</p>
                        <Link href="/contact" className="inline-block px-12 py-4 bg-white text-zinc-900 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-100 transition-colors shadow-xl">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
