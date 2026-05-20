// Centralized product and category data

export interface Variation {
    color: string;
    image?: string;
}

export interface Product {
    id: string;
    name: string;
    category: string;
    collectionId: string;
    sizes: string[];
    colors: string[];
    variations?: Variation[];
    image: string;
    isNew?: boolean;
    description?: string;
    brand: string;
    look: string;
    finish?: string[];
    usage?: string[];
}

export interface Collection {
    name: string;
    slug: string;
    count: number;
    image: string;
    description?: string;
    materials?: string[];
}

export const collectionsList = [
    { name: "ABACO", slug: "abaco", materials: ["Glazed Porcelain"] },
    { name: "ABBEY", slug: "abbey", materials: ["Glazed Porcelain", "Ceramic Wall"] },
    { name: "ALASKA", slug: "alaska", materials: ["Polished Porcelain"] },
    { name: "ARTESANO", slug: "artesano", materials: ["Ceramic Wall"] },
    { name: "ATLAS", slug: "atlas", materials: ["Porcelain"] },
    { name: "AURA", slug: "aura", materials: ["Ceramic"] },
    { name: "AVALON", slug: "avalon", materials: ["Porcelain"] },
    { name: "AVENUE", slug: "avenue", materials: ["Porcelain"] },
    { name: "BALTIC", slug: "baltic", materials: ["Porcelain"] },
    { name: "BAR TILE", slug: "bar-tile", materials: ["Ceramic Wall"] },
    { name: "BIANCO VENATINO", slug: "bianco-venatino", materials: ["Marble Look Porcelain"] },
    { name: "BLOCK", slug: "block", materials: ["Ceramic Wall"] },
    { name: "BOHEME", slug: "boheme", materials: ["Wood Look Porcelain"] },
    { name: "BRICKELL", slug: "brickell", materials: ["Ceramic Wall"] },
    { name: "CALACATA GOLD", slug: "calacata-gold", materials: ["Marble Look Porcelain"] },
    { name: "CALYPSO", slug: "calypso", materials: ["Ceramic Wall"] },
    { name: "CARVE", slug: "carve", materials: ["Porcelain"] },
    { name: "CASABLANCA", slug: "casablanca", materials: ["Patterned Porcelain"] },
    { name: "CC COSMOS", slug: "cc-cosmos", materials: ["Ceramic Wall", "Mosaics"] },
    { name: "FRAMES", slug: "frames", materials: ["Ceramic Wall", "Mosaics"] },
    { name: "MOSAICS", slug: "mosaics", materials: ["Ceramic Wall", "Mosaics"] },
    { name: "COLOR COLLECTION", slug: "color-collection", materials: ["Ceramic Wall"] },
    { name: "CRYSTAL", slug: "crystal", materials: ["Polished Porcelain"] },
    { name: "DERBY", slug: "derby", materials: ["Porcelain"] },
    { name: "DOWNTOWN", slug: "downtown", materials: ["Porcelain"] },
    { name: "ESSENCE", slug: "essence", materials: ["Porcelain"] },
    { name: "EVERGLADE", slug: "everglade", materials: ["Wood Look Porcelain"] },
    { name: "FLOW", slug: "flow", materials: ["Ceramic Wall"] },
    { name: "JOY", slug: "joy", materials: ["Ceramic Wall"] },
    { name: "HAVANA", slug: "havana", materials: ["Patterned Porcelain"] },
    { name: "JEWELS", slug: "jewels", materials: ["Marble Look Porcelain"] },
    { name: "JUNE", slug: "june", materials: ["Stone Look Porcelain"] },
    { name: "LAGOM", slug: "lagom", materials: ["Stone Look Porcelain"] },
    { name: "LASSA", slug: "lassa", materials: ["White Marble Looks"] },
    { name: "NORDICO", slug: "nordico", materials: ["White Marble Looks"] },
    { name: "ONYX", slug: "onyx", materials: ["White Marble Looks"] },
    { name: "STATUARY", slug: "statuary", materials: ["White Marble Looks"] },
    { name: "LITHOLOGY EDITION", slug: "lithology-edition", materials: ["Stone Look"] },
    { name: "LIVERPOOL", slug: "liverpool", materials: ["Stone Look"] },
    { name: "MAIOLICA", slug: "maiolica", materials: ["Ceramic Wall"] },
    { name: "NOLITA", slug: "nolita", materials: ["Porcelain"] },
    { name: "PAVERS", slug: "pavers", materials: ["Outdoor Pavers"] },
    { name: "20MM", slug: "20mm", materials: ["Outdoor Pavers"] },
    { name: "PRO", slug: "pro", materials: ["Concrete Look Porcelain"] },
    { name: "PRO MAX", slug: "pro-max", materials: ["Concrete Look Porcelain"] },
    { name: "SLABS", slug: "slabs", materials: ["Large Format Porcelain"] },
    { name: "XL SLABS", slug: "xl-slabs", materials: ["Large Format Porcelain"] },
    { name: "ZELLIGE", slug: "zellige", materials: ["Ceramic Wall"] },
    { name: "ZEN", slug: "zen", materials: ["Porcelain"] },
    { name: "ZEN STONE", slug: "zen-stone", materials: ["Porcelain"] }
];

// Official Roca USA Images Database
const rocaImages: Record<string, string> = {
    "abaco": "https://rocatileusa.com/uploads/2021/07/AMBIENTE_AbacoGrafito60x60-1-768x543.jpeg.webp",
    "abbey": "https://rocatileusa.com/uploads/2019/08/Abbey-400x400.jpg.webp",
    "alaska": "https://rocatileusa.com/uploads/2021/07/ehz3-NTv-1-400x400.jpeg.webp",
    "artesano": "https://rocatileusa.com/uploads/2023/01/artesano-400x400.jpg.webp",
    "aura": "https://rocatileusa.com/uploads/2024/01/amb-08-AURA-SEASHELL-4x12.jpg-web-thumbnail.jpg",
    "avalon": "https://rocatileusa.com/uploads/2024/01/amb-04-AVALON-ARENA-web-thumbnail.jpg",
    "avenue": "https://rocatileusa.com/uploads/2024/04/Avenue/amb-02-AVENUE-GOLD-thumbnail.jpg",
    "baltic": "https://rocatileusa.com/uploads/2025/Roca%20Collections/Baltic/thumbnail-amb-08-BLATIC-GRANITE.png",
    "bar-tile": "https://rocatileusa.com/uploads/2023/03/amb-20-BARTILE-400x400.jpg.webp",
    "basalt": "https://rocatileusa.com/uploads/2022/05/2-400x400.jpg.webp",
    "block": "https://rocatileusa.com/uploads/2021/07/block-1-400x400.jpg.webp",
    "calacata-gold": "https://rocatileusa.com/uploads/2021/09/amb-01-CALACATTA-GOLD-1-400x400.jpg",
    "cc-cosmos": "https://rocatileusa.com/uploads/2023/01/amb-05-CC-COSMOS-3X12-400x400.jpg.webp",
    "downtown": "https://rocatileusa.com/uploads/2021/07/ROCA_Downtown-living-min-400x400.jpg",
    "essence": "https://rocatileusa.com/uploads/2023/04/amb-17-ESSENCE-MAPLE-400x400.jpg",
    "june": "https://rocatileusa.com/uploads/2025/June/thumbnail-AMBIENTE_HD_Suite-June-Grafito-30x90,2-R_Block-Flower-Acero-20x20.png",
    "lagom": "https://rocatileusa.com/uploads/2024/04/Lagom/AMB_LAGOM-NATURAL-26x160-R-thumbnail.jpg",
    "lassa": "https://rocatileusa.com/uploads/2021/09/amb-03-MARBLE-LASS-A-400x400.jpg.webp",
    "nordico": "https://rocatileusa.com/uploads/2021/07/nordico-400x400.jpg",
    "onyx": "https://rocatileusa.com/uploads/2021/07/ZiCGIJWp-1-400x400.jpeg.webp",
    "statuary": "https://rocatileusa.com/uploads/2021/06/Statuary-400x400.png.webp",
    "xl-slabs": "https://rocatileusa.com/uploads/xlslabs.jpg",
    "zen-stone": "https://rocatileusa.com/uploads/2023/04/amb-19-ZEN-STONE-SILVER-400x400.jpg.webp"
};

// Map real collections to the required UI format, adding official images when available
export const categories: Collection[] = collectionsList.map((c, i) => ({
    name: c.name,
    slug: c.slug,
    count: Math.floor(Math.random() * 15) + 3,
    image: rocaImages[c.slug] || `https://picsum.photos/seed/castile_col_${i}/1000/1000`,
    description: `Premium ${c.materials?.[0] || 'surfaces'} from the ${c.name} collection.`
}));

const rawProductsData = [
    { id: "1", col: "ABACO", colors: ["Arena", "Gris", "Grafito"], sizes: ["12X24", "24X48"] },
    { id: "2", col: "ABBEY", colors: ["Fresno", "Gris", "Vison", "Roble"], sizes: ["8X48", "12X36"] },
    { id: "3", col: "ALASKA", colors: ["White"], sizes: ["24X48"] },
    { id: "4", col: "ARTESANO", colors: ["Black", "White Ice", "Neu Gray", "Biscuit"], sizes: ["3X12"] },
    { id: "5", col: "ATLAS", colors: ["Aloe"], sizes: ["12X24"] },
    { id: "6", col: "AURA", colors: ["Seashell", "Ocean Blue", "Aquamarine"], sizes: ["4X12"] },
    { id: "7", col: "AVALON", colors: ["Blanco", "Arena"], sizes: ["12X24", "24X24", "24X48", "48X48", "24X36", "12X36"] },
    { id: "8", col: "AVENUE", colors: ["Gold", "Gray"], sizes: ["21X21"] },
    { id: "9", col: "BALTIC", colors: ["Granite", "Sand", "Tan"], sizes: ["12X24", "24X48"] },
    { id: "10", col: "BAR TILE", colors: ["Oslo", "Havre", "Glasgow", "Nuuk", "Lisbon"], sizes: ["3X12"] },
    { id: "11", col: "BIANCO VENATINO", colors: ["Bianco Venatino"], sizes: ["4X12", "12X24", "24X24", "24X48", "35X35", "12X12"] },
    { id: "12", col: "BLOCK", colors: ["Blanco", "Gris", "Acero", "Azul", "Verde", "Negro"], sizes: ["2X10", "4X24", "5X6"] },
    { id: "13", col: "BOHEME", colors: ["White", "Walnut", "Natural", "Ivory"], sizes: ["8X35"] },
    { id: "14", col: "BRICKELL", colors: ["Blanco", "Gris", "Taupe", "Burnt", "Antracita"], sizes: ["3X12"] },
    { id: "15", col: "CALACATA GOLD", colors: ["Gold"], sizes: ["12X24", "24X24", "24X48", "3X12", "12X12"] },
    { id: "16", col: "CALYPSO", colors: ["Blanco"], sizes: ["8X24", "12X36"] },
    { id: "17", col: "CARVE", colors: ["Steel"], sizes: ["12X24"] },
    { id: "18", col: "CASABLANCA", colors: ["Aqua", "Fond", "Gray", "Black", "Squares", "Trails", "Heritage", "Market", "White"], sizes: ["8X8", "8X9"] },
    { id: "19", col: "CC COSMOS", colors: ["Mist", "Teal", "Petrol", "Neu Gray", "White Ice", "Sage Green"], sizes: ["3X12", "4X12", "12X12"] },
    { id: "19-2", col: "FRAMES", colors: ["Mist", "Teal", "Petrol", "Neu Gray", "White Ice", "Sage Green"], sizes: ["3X12", "4X12", "12X12"] },
    { id: "19-3", col: "MOSAICS", colors: ["Mist", "Teal", "Petrol", "Neu Gray", "White Ice", "Sage Green"], sizes: ["3X12", "4X12", "12X12"] },
    { id: "20", col: "COLOR COLLECTION", colors: ["White Ice", "Tender Gray", "Neu Gray", "Petrol", "Teal", "Mist", "Sage Green", "Black", "Taupe", "Snow White", "Cocoa", "Cobalt", "Deep Blue", "Olive Green"], sizes: ["2X8", "3X6", "4X12", "3X12", "4X4", "6X6", "8X24", "10X28", "12X36"] },
    { id: "21", col: "CRYSTAL", colors: ["White"], sizes: ["24X48"] },
    { id: "22", col: "DERBY", colors: ["Gris"], sizes: ["24X24"] },
    { id: "23", col: "DOWNTOWN", colors: ["Blanco", "Grey", "Marengo", "Antracita", "Beige", "Ash", "Pearl", "Silver", "Maple"], sizes: ["12X24", "24X24", "9X35", "12X12"] },
    { id: "23-2", col: "ESSENCE", colors: ["Blanco", "Grey", "Marengo", "Antracita", "Beige", "Ash", "Pearl", "Silver", "Maple"], sizes: ["12X24", "24X24", "9X35", "12X12"] },
    { id: "24", col: "EVERGLADE", colors: ["Silver Gray", "Warm Gray", "Forest", "Nogales"], sizes: ["8X48"] },
    { id: "25", col: "FLOW", colors: ["White", "Frost", "Lavender", "Dark Gray", "Velvet Pink", "Burgundy", "Peacock Green", "Cosmic Sapphire"], sizes: ["3X12", "4X16", "4X10"] },
    { id: "25-2", col: "JOY", colors: ["White", "Frost", "Lavender", "Dark Gray", "Velvet Pink", "Burgundy", "Peacock Green", "Cosmic Sapphire"], sizes: ["3X12", "4X16", "4X10"] },
    { id: "26", col: "HAVANA", colors: ["White", "Silver", "Coaxial", "Marengo", "Moka", "Jazz", "Retro", "Blues"], sizes: ["8X8"] },
    { id: "27", col: "JEWELS", colors: ["Laurent White", "Mattia White", "Etienne Cream", "Etienne Gray", "Therry Cream", "Vince White"], sizes: ["12X24", "24X48"] },
    { id: "28", col: "JUNE", colors: ["Caliza", "Gris", "Grafito", "Antracita", "Arena", "Blanco"], sizes: ["24X24", "24X48", "12X36"] },
    { id: "28-2", col: "LAGOM", colors: ["Caliza", "Gris", "Grafito", "Antracita", "Arena", "Blanco"], sizes: ["24X24", "24X48", "12X36"] },
    { id: "29", col: "LASSA", colors: ["White"], sizes: ["3X6", "4X10", "6X18", "12X24", "24X24", "24X48", "35X35", "12X12"] },
    { id: "29-2", col: "NORDICO", colors: ["White"], sizes: ["3X6", "4X10", "6X18", "12X24", "24X24", "24X48", "35X35", "12X12"] },
    { id: "29-3", col: "ONYX", colors: ["White"], sizes: ["3X6", "4X10", "6X18", "12X24", "24X24", "24X48", "35X35", "12X12"] },
    { id: "29-4", col: "STATUARY", colors: ["White"], sizes: ["3X6", "4X10", "6X18", "12X24", "24X24", "24X48", "35X35", "12X12"] },
    { id: "30", col: "LITHOLOGY EDITION", colors: ["Polaris", "Ibiza", "Astoria", "Sandstone", "Vesta", "Moscato", "Basalt", "Empire", "Urban"], sizes: ["12X24", "24X24", "24X48", "3X12"] },
    { id: "30-2", col: "LIVERPOOL", colors: ["Polaris", "Ibiza", "Astoria", "Sandstone", "Vesta", "Moscato", "Basalt", "Empire", "Urban"], sizes: ["12X24", "24X24", "24X48", "3X12"] },
    { id: "31", col: "MAIOLICA", colors: ["White", "Biscuit", "Tender Gray", "Aqua", "Taupe", "Blue Steel"], sizes: ["3X6", "4X10", "3X12", "7X8"] },
    { id: "32", col: "NOLITA", colors: ["Blanco", "Gris", "Grafito", "Antracita"], sizes: ["12X24", "18X36", "24X48", "3X12", "12X12"] },
    { id: "33", col: "PAVERS", colors: ["Mason Gray", "Evolve", "Cortona", "Piamonte", "Toscana", "Avalon", "Serena"], sizes: ["24X24", "24X36"] },
    { id: "33-2", col: "20MM", colors: ["Mason Gray", "Evolve", "Cortona", "Piamonte", "Toscana", "Avalon", "Serena"], sizes: ["24X24", "24X36"] },
    { id: "34", col: "PRO", colors: ["Cement", "Concrete", "Nude", "Sand", "Ivory"], sizes: ["12X24", "24X24"] },
    { id: "34-2", col: "PRO MAX", colors: ["Cement", "Concrete", "Nude", "Sand", "Ivory"], sizes: ["12X24", "24X24"] },
    { id: "35", col: "SLABS", colors: ["Carrara", "Koronis", "Sahara Noir", "Calacata", "Concrete", "Sorrento", "Lassa", "Nouveau", "Parana", "Pantheon", "Athea", "Allure", "Fossil", "Statuario"], sizes: ["24X48", "48X48", "48X110", "63X126"] },
    { id: "35-2", col: "XL SLABS", colors: ["Carrara", "Koronis", "Sahara Noir", "Calacata", "Concrete", "Sorrento", "Lassa", "Nouveau", "Parana", "Pantheon", "Athea", "Allure", "Fossil", "Statuario"], sizes: ["24X48", "48X48", "48X110", "63X126"] },
    { id: "36", col: "ZELLIGE", colors: ["White", "Tender Gray", "Dark Gray", "Emerald Green", "Deep Blue"], sizes: ["2X16", "3/4X16"] },
    { id: "37", col: "ZEN", colors: ["White", "Silver", "Gray"], sizes: ["16X48", "12X24", "24X48"] },
    { id: "37-2", col: "ZEN STONE", colors: ["White", "Silver", "Gray"], sizes: ["16X48", "12X24", "24X48"] },
];

export const allProducts: Product[] = [];

// Generate fully structured products for the UI
rawProductsData.forEach((raw, idx) => {
    const collectionInfo = collectionsList.find(c => c.name === raw.col) || collectionsList[0];
    const baseImage = rocaImages[collectionInfo.slug] || `https://picsum.photos/seed/castile_prod_${raw.id}/1000/1000`;

    const variations = raw.colors.map((c, i) => ({
        color: c,
        // Fallback to random picsum image for color variations currently if not available
        image: `https://picsum.photos/seed/castile_var_${raw.id}_${i}/1000/1000`
    }));

    allProducts.push({
        id: raw.id,
        name: raw.col,
        category: collectionInfo.materials?.[0] || "Porcelain",
        collectionId: collectionInfo.slug,
        sizes: raw.sizes,
        colors: raw.colors,
        variations,
        image: baseImage,
        isNew: idx % 4 === 0,
        description: `The ${raw.col} collection features premium ${collectionInfo.materials?.[0]?.toLowerCase() || 'surfaces'}. Available in beautiful ${raw.colors.slice(0, 3).join(", ")}${raw.colors.length > 3 ? ' and more' : ''}. Sizes include ${raw.sizes.slice(0, 3).join(", ")}.`,
        brand: "roca-tiles",
        look: ["Marble", "Stone", "Concrete", "Wood", "Modern"][idx % 5],
        finish: ["Matte", "Polished", "Lappato"].slice(0, (idx % 3) + 1),
        usage: ["Floor", "Wall", "Indoor", "Outdoor"].slice(0, (idx % 3) + 2)
    });
});

// Build a combined search index
export interface SearchItem {
    type: "product" | "collection";
    name: string;
    category: string;
    slug: string;
    id: string;
    image: string;
    sizes?: string[];
    colors?: string[];
    price?: string;
}

export function getSearchIndex(): SearchItem[] {
    const items: SearchItem[] = [];

    // Add all products (treating the collection main entry as the product here since UI maps collections -> products)
    allProducts.forEach((p) => {
        items.push({
            type: "product",
            name: p.name,
            category: p.category,
            slug: p.collectionId,
            id: p.id,
            image: p.image,
            sizes: p.sizes,
            colors: p.colors
        });

        // Option: could also add individual color variations as searchable items
        p.colors.forEach(color => {
            items.push({
                type: "product",
                name: `${p.name} - ${color}`,
                category: `Color Variant`,
                slug: p.collectionId,
                id: `${p.id}-${color}`,
                image: p.image,
                sizes: p.sizes,
                colors: [color]
            });
        });
    });

    // Add unique categories based on materials
    const materialCategories = new Map<string, number>();
    collectionsList.forEach(c => {
        if (c.materials) {
            c.materials.forEach(m => {
                materialCategories.set(m, (materialCategories.get(m) || 0) + 1);
            });
        }
    });

    materialCategories.forEach((count, material) => {
        const slug = material.toLowerCase().replace(/\s+/g, '-');
        items.push({
            type: "collection",
            name: material,
            category: `${count} collections`,
            slug: slug,
            id: `mat-${slug}`,
            image: `https://picsum.photos/seed/castile_mat_${slug}/1000/1000`,
        });
    });

    return items;
}
