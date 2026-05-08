import Link from "next/link";

export default function Footer() {
    return (
        <footer className="bg-[#454545] text-white/60 border-t border-white/10 pt-12 sm:pt-20 pb-10 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div className="sm:col-span-2">
                    <Link href="/" className="text-2xl font-bold tracking-widest text-white uppercase mb-6 block">
                        Castile.
                    </Link>
                    <p className="max-w-md text-sm leading-relaxed">
                        Elevating spaces with premium surfaces. Our collection of tiles brings timeless elegance, modern durability, and unmatched quality to environments across the globe.
                    </p>
                </div>
                <div>
                    <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Explore</h3>
                    <ul className="space-y-4 text-sm">
                        <li><Link href="/products" className="hover:text-white transition-colors">All Collections</Link></li>
                        <li><Link href="/products?category=marble" className="hover:text-white transition-colors">Marble Finish</Link></li>
                        <li><Link href="/products?category=wood" className="hover:text-white transition-colors">Wood Look</Link></li>
                        <li><Link href="/products?category=concrete" className="hover:text-white transition-colors">Concrete Style</Link></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Company</h3>
                    <ul className="space-y-4 text-sm">
                        <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                        <li><Link href="/sustainability" className="hover:text-white transition-colors">Sustainability</Link></li>
                        <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                        <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto text-xs text-center border-t border-white/10 pt-8">
                <p>&copy; {new Date().getFullYear()} Castile. All rights reserved.</p>
            </div>
        </footer>
    );
}
