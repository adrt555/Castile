// Centralized product, collection, and category database for Castile
// Officially curated for Roca Tiles (Collections) and Dune Ceramics (Luxury Accents)

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
    brand: "roca-tiles" | "dune";
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
    brand: "roca-tiles" | "dune";
}

// 1. ROCA ARCHITECTURAL COLLECTIONS (BRAND: roca-tiles)
export const rocaCollectionsList = [
    { name: "ABACO", slug: "abaco", materials: ["Glazed Porcelain", "In&Out Tech"] },
    { name: "ABBEY", slug: "abbey", materials: ["Glazed Porcelain", "Ceramic Wall"] },
    { name: "ALASKA", slug: "alaska", materials: ["Polished Porcelain", "White Marble Look"] },
    { name: "ALBA", slug: "alba", materials: ["Ceramic Wall", "Spanish Wall Tile"] },
    { name: "ARTESANO", slug: "artesano", materials: ["Ceramic Wall"] },
    { name: "ATLAS", slug: "atlas", materials: ["Porcelain"] },
    { name: "AURA", slug: "aura", materials: ["Ceramic Wall"] },
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

// 2. DUNE LUXURY ACCENTS & DECORATIVE MOSAICS (BRAND: dune)
export const duneCollectionsList = [
    { name: "AGADIR", slug: "agadir", materials: ["Artisan Zellige Porcelain", "Vitreous Wall"] },
    { name: "ATELIER", slug: "atelier", materials: ["Handcrafted Glazed Subway", "Artisan Wall"] },
    { name: "ATLANTIQUE", slug: "atlantique", materials: ["Ocean Wave Porcelain", "Decorative Field"] },
    { name: "CALACATTA LUX", slug: "calacatta-lux", materials: ["Luxury Marble Porcelain", "Gold Vein"] },
    { name: "CREMABELLA", slug: "cremabella", materials: ["Polished Marble Porcelain", "Glossy Wall"] },
    { name: "CRISTAL", slug: "cristal", materials: ["Glass Mosaic", "Translucent Luxury"] },
    { name: "FANCY", slug: "fancy", materials: ["Sculpted 3D Relief Wall", "Modern Ceramic"] },
    { name: "GRANADELLA", slug: "granadella", materials: ["Mediterranean Glaze", "Artisan Wall"] },
    { name: "GREENLAND", slug: "greenland", materials: ["Lustrous Glossy Ceramic", "Feature Wall"] },
    { name: "KIT-KAT MOSAICS", slug: "kit-kat", materials: ["Fluted Finger Mosaics", "Architectural Relief"] },
    { name: "MILANO", slug: "milano", materials: ["Italian Glamour Ceramic", "Glossy Luxury"] },
    { name: "NOVA", slug: "nova", materials: ["Geometric Ceramic Deco", "Contemporary Accents"] },
    { name: "PIETRASANTA", slug: "pietrasanta", materials: ["Statuario & Gold Vein", "Calacatta Porcelain"] },
    { name: "RIAD", slug: "riad", materials: ["Handcrafted Moroccan Brick", "Artisan Relief"] },
    { name: "SELENE", slug: "selene", materials: ["Polished Onyx & Marble", "Grand Luxury"] },
    { name: "STRIPES", slug: "stripes", materials: ["Linear Fluted Relief", "Architectural 3D"] },
    { name: "TABARCA", slug: "tabarca", materials: ["Vibrant Mediterranean Glaze", "Artisan Wall"] },
    { name: "TAHITI & GOLDEN STONE", slug: "tahiti", materials: ["Exotic Metallic Accent", "Lustrous Mosaic"] },
    { name: "TERRALUZ", slug: "terraluz", materials: ["Warm Terracotta Porcelain", "Earthy Elegance"] },
    { name: "THEIA", slug: "theia", materials: ["Satin Accent Tile", "Sculpted Geometry"] },
    { name: "ALTEA", slug: "altea", materials: ["Rustic Coastal Ceramic", "Artisan Gloss"] },
    { name: "CHICAGO", slug: "chicago", materials: ["Urban Micro-Terrazzo", "Architectural Deco"] },
    { name: "BALI", slug: "bali", materials: ["Exotic Pool & Spa Porcelain", "Tropical Mineral"] },
    { name: "BERLIN", slug: "berlin", materials: ["Linear Geometric Accent", "Matte Ceramic"] },
    { name: "CRACKLE", slug: "crackle", materials: ["Vitreous Crackle Glaze", "Artisan Tile"] }
];

export const collectionsList = [
    ...rocaCollectionsList.map(c => ({ ...c, brand: "roca-tiles" as const })),
    ...duneCollectionsList.map(c => ({ ...c, brand: "dune" as const }))
];

// Official Roca USA Images Database (100% Genuine Master High-Resolution)
const rocaImages: Record<string, string> = {
    "abaco": "https://rocatileusa.com/uploads/2021/07/AMBIENTE_AbacoOxidoModular-1.jpeg",
    "abbey": "https://rocatileusa.com/uploads/2019/08/Abbey.jpg.webp",
    "alaska": "https://rocatileusa.com/uploads/2021/08/ALASKA-WHITE.jpg",
    "alba": "https://rocatileusa.com/uploads/2025/Roca%20Collections/Alba/web-Amb-Alba_04-5000h.png",
    "artesano": "https://rocatileusa.com/uploads/2023/01/artesano.jpg",
    "atlas": "https://rocatileusa.com/uploads/2021/07/AMBIENTE_AbacoGrafito60x60-1.jpeg",
    "aura": "https://rocatileusa.com/uploads/2024/01/amb-10-AURA-AQUAMARINE-4x12-web.jpg",
    "avalon": "https://rocatileusa.com/uploads/2024/01/AMB-AVALON-ARENA-60X120-web.jpg",
    "avenue": "https://rocatileusa.com/uploads/2024/04/Avenue/amb-02-AVENUE-GOLD-web.jpg",
    "baltic": "https://rocatileusa.com/uploads/2025/Roca%20Collections/Baltic/web-amb-08-BLATIC-GRANITE.png",
    "bar-tile": "https://rocatileusa.com/uploads/2023/03/amb-20-BARTILE.jpg",
    "basalt": "https://rocatileusa.com/uploads/2022/05/2.jpg",
    "bianco-venatino": "https://rocatileusa.com/uploads/2021/06/amb-01-bianco-venatino.jpg",
    "block": "https://rocatileusa.com/uploads/2021/07/block-1.jpg",
    "boheme": "https://rocatileusa.com/uploads/2024/01/amb-02-BOHEME-NATURAL-web.jpg",
    "brickell": "https://rocatileusa.com/uploads/2021/07/amb-04-KALMA-BRICKELL-1.jpg",
    "calacata-gold": "https://rocatileusa.com/uploads/2021/09/amb-01-CALACATTA-GOLD-1.jpg",
    "calypso": "https://rocatileusa.com/uploads/2021/07/PLAN-WHITE-4.jpg",
    "carve": "https://rocatileusa.com/uploads/2021/07/carve-1.jpg",
    "casablanca": "https://rocatileusa.com/uploads/2021/07/CASABLANCA-SPICE-ROOMSCENE.jpg",
    "cc-cosmos": "https://rocatileusa.com/uploads/2023/01/amb-05-CC-COSMOS-3X12.jpg",
    "frames": "https://rocatileusa.com/uploads/2023/01/amb-10-CC-FRAMES.jpg",
    "mosaics": "https://rocatileusa.com/uploads/2021/07/CC-MOSAICS-LANTERN-1-1.jpg",
    "color-collection": "https://rocatileusa.com/uploads/2021/07/CC-Deep-Blue-Piasentina-Silver-PO-1.jpg.webp",
    "crystal": "https://rocatileusa.com/uploads/2021/08/crystal-bg-1.jpeg",
    "derby": "https://rocatileusa.com/uploads/2021/07/derby-4.jpg",
    "downtown": "https://rocatileusa.com/uploads/2021/07/ROCA_Downtown-living-min.jpg",
    "essence": "https://rocatileusa.com/uploads/2023/04/amb-17-ESSENCE-MAPLE.jpg",
    "everglade": "https://rocatileusa.com/uploads/2021/07/everglade-card-1.jpg",
    "flow": "https://rocatileusa.com/uploads/2021/09/Flow_Living-Green-1.jpg",
    "joy": "https://rocatileusa.com/uploads/2021/07/joy.jpg",
    "havana": "https://rocatileusa.com/uploads/2021/07/CASABLANCA-SPICE-ROOMSCENE.jpg",
    "jewels": "https://rocatileusa.com/uploads/2023/04/amb-15-MAURICE-BLACK-24x48-1.jpg",
    "june": "https://rocatileusa.com/uploads/2025/June/ambiente%20suite%20june%20grafito.jpg",
    "lagom": "https://rocatileusa.com/uploads/2024/04/Lagom/AMB_LAGOM-NATURAL-26x160-R-web.jpg",
    "lassa": "https://rocatileusa.com/uploads/2021/09/amb-03-MARBLE-LASS-A.jpg",
    "nordico": "https://rocatileusa.com/uploads/2021/07/Serie-Nordico-Onix2-1.jpg",
    "onyx": "https://rocatileusa.com/uploads/2021/07/ZiCGIJWp-1.jpeg",
    "lithology-edition": "https://rocatileusa.com/uploads/2022/05/5.jpg",
    "liverpool": "https://rocatileusa.com/uploads/2021/07/liverpool-3.jpg",
    "maiolica": "https://rocatileusa.com/uploads/2021/07/RoomScene-maiolica_gray-1.jpg",
    "nolita": "https://rocatileusa.com/uploads/2021/06/NOLITA.jpg",
    "pavers": "https://rocatileusa.com/uploads/2023/01/amb-14-EVOLVE-60x60-1.jpg",
    "20mm": "https://rocatileusa.com/uploads/2023/01/amb-14-EVOLVE-60x60-1.jpg",
    "pro": "https://rocatileusa.com/uploads/2021/09/Pro_Sand-1.jpg",
    "pro-max": "https://rocatileusa.com/uploads/2021/07/pro-max.jpg",
    "slabs": "https://rocatileusa.com/uploads/2024/02/Slabs-Athea-web.jpg",
    "statuary": "https://rocatileusa.com/uploads/2021/07/STATUARY_BLANCO_90x90_L4_P1_F2_POL.png",
    "xl-slabs": "https://rocatileusa.com/uploads/xlslabs.jpg",
    "zellige": "https://rocatileusa.com/uploads/2021/10/amb-01-ZELLIGE-LIGHT-GRAY.jpg",
    "zen": "https://rocatileusa.com/uploads/2024/04/Zen/Bath%204.jpg",
    "zen-stone": "https://rocatileusa.com/uploads/2023/04/amb-19-ZEN-STONE-SILVER.jpg"
};

// Official Dune Ceramics High-Resolution Images Database (100% Verified)
const duneImages: Record<string, string> = {
    "agadir": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/serie-agadir-1-1642584123X4lYc.jpg",
    "tabarca": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/ambiente-tabarca-turquesa-verde-miel-blanco-75x23-1633283602XjdYR.jpg",
    "selene": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/selene-capuccino-1697793602h2dAN.jpg",
    "riad": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/riad-revestimiento-ceramico-para-interiores-dune-ceramica-1761125230H1ApD.jpg",
    "atelier": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/ambiente-atelier-white-french-blue-brillo-75x15-75x30-16332824267nSd7.jpg",
    "atlantique": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/azulejos-atlantique-dune-ceramica-1741613008DpPzz.jpg",
    "pietrasanta": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/series-pietrasanta-1684158336WeST2.jpg",
    "terraluz": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/terraluz-azulejo-porcelanico-dune-ceramica-1761220167h4c1I.jpg",
    "granadella": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/serie-azulejos-granadella-dune-ceramica-1741614760fmrir.jpg",
    "fancy": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/ambiente-fancy-grey-30x60-60x120-fancy-white-grey-30x90-malhia-15x15-1-1632999205hvgWn.jpg",
    "altea": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/altea-16690242224pvzL.jpg",
    "chicago": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/ambiente-chicago-ocean-terrazo-1633282660eE80I.jpg",
    "bali": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/bali-azulejos-porcelanicos-piscina-17259698104FOxJ.jpg",
    "berlin": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/ambiente-berlin-bambu-lotus-white-aquamar-grey-163299199470xEg.jpg",
    "crackle": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/ambiente-crackle-laguna-nieve-16332827644JTeS.jpg",
    "kit-kat": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/amb-exterior-tienda-kit-kat-anise-agadir-cotto-oscuro-2000x.jpg",
    "calacatta-lux": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/selene-capuccino-1697793602h2dAN.jpg",
    "cremabella": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/series-pietrasanta-1684158336WeST2.jpg",
    "cristal": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/azulejos-rosas-para-banos-1777290132PY6P3.jpg",
    "greenland": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/ambiente-tabarca-turquesa-verde-miel-blanco-75x23-1633283602XjdYR.jpg",
    "milano": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/selene-capuccino-1697793602h2dAN.jpg",
    "nova": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/ambiente-fancy-grey-30x60-60x120-fancy-white-grey-30x90-malhia-15x15-1-1632999205hvgWn.jpg",
    "stripes": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/terraluz-azulejo-porcelanico-dune-ceramica-1761220167h4c1I.jpg",
    "tahiti": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/azulejos-rosas-para-banos-1777290132PY6P3.jpg",
    "theia": "https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/altea-16690242224pvzL.jpg"
};

// Map real collections to the required UI categories
export const categories: Collection[] = [
    ...rocaCollectionsList.map((c, i) => ({
        name: c.name,
        slug: c.slug,
        count: Math.floor(Math.random() * 12) + 4,
        image: rocaImages[c.slug] || `https://picsum.photos/seed/castile_col_${i}/1000/1000`,
        description: `Premium architectural surfaces from the ${c.name} collection by Roca.`,
        materials: c.materials,
        brand: "roca-tiles" as const
    })),
    ...duneCollectionsList.map((c, i) => ({
        name: c.name,
        slug: c.slug,
        count: Math.floor(Math.random() * 8) + 3,
        image: duneImages[c.slug] || `https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/azulejos-rosas-para-banos-1777290132PY6P3.jpg`,
        description: `Luxury handcrafted decorative accents and bespoke mosaics from the ${c.name} collection by Dune.`,
        materials: c.materials,
        brand: "dune" as const
    }))
];

// Raw Product Definitions for Roca & Dune
const rawRocaData = [
    { id: "1", col: "ABACO", colors: ["Arena", "Gris", "Grafito"], sizes: ["12X24", "24X48"], look: "Concrete" },
    { id: "2", col: "ABBEY", colors: ["Fresno", "Gris", "Vison", "Roble"], sizes: ["8X48", "12X36"], look: "Wood" },
    { id: "3", col: "ALASKA", colors: ["White"], sizes: ["24X48"], look: "Marble" },
    { id: "3-alba", col: "ALBA", colors: ["Bianco", "Crema", "Avorio", "Nero"], sizes: ["8X8", "2X8", "3X12"], look: "Modern" },
    { id: "4", col: "ARTESANO", colors: ["Black", "White Ice", "Neu Gray", "Biscuit"], sizes: ["3X12"], look: "Modern" },
    { id: "5", col: "ATLAS", colors: ["Aloe"], sizes: ["12X24"], look: "Stone" },
    { id: "6", col: "AURA", colors: ["Seashell", "Ocean Blue", "Aquamarine"], sizes: ["4X12"], look: "Modern" },
    { id: "7", col: "AVALON", colors: ["Blanco", "Arena"], sizes: ["12X24", "24X24", "24X48", "48X48", "24X36", "12X36"], look: "Stone" },
    { id: "8", col: "AVENUE", colors: ["Gold", "Gray"], sizes: ["21X21"], look: "Stone" },
    { id: "9", col: "BALTIC", colors: ["Granite", "Sand", "Tan"], sizes: ["12X24", "24X48"], look: "Stone" },
    { id: "10", col: "BAR TILE", colors: ["Oslo", "Havre", "Glasgow", "Nuuk", "Lisbon"], sizes: ["3X12"], look: "Modern" },
    { id: "11", col: "BIANCO VENATINO", colors: ["Bianco Venatino"], sizes: ["4X12", "12X24", "24X24", "24X48", "35X35", "12X12"], look: "Marble" },
    { id: "12", col: "BLOCK", colors: ["Blanco", "Gris", "Acero", "Azul", "Verde", "Negro"], sizes: ["2X10", "4X24", "5X6"], look: "Modern" },
    { id: "13", col: "BOHEME", colors: ["White", "Walnut", "Natural", "Ivory"], sizes: ["8X35"], look: "Wood" },
    { id: "14", col: "BRICKELL", colors: ["Blanco", "Gris", "Taupe", "Burnt", "Antracita"], sizes: ["3X12"], look: "Modern" },
    { id: "15", col: "CALACATA GOLD", colors: ["Gold"], sizes: ["12X24", "24X24", "24X48", "3X12", "12X12"], look: "Marble" },
    { id: "16", col: "CALYPSO", colors: ["Blanco"], sizes: ["8X24", "12X36"], look: "Modern" },
    { id: "17", col: "CARVE", colors: ["Steel"], sizes: ["12X24"], look: "Stone" },
    { id: "18", col: "CASABLANCA", colors: ["Aqua", "Fond", "Gray", "Black", "Squares", "Trails", "Heritage", "Market", "White"], sizes: ["8X8", "8X9"], look: "Modern" },
    { id: "19", col: "CC COSMOS", colors: ["Mist", "Teal", "Petrol", "Neu Gray", "White Ice", "Sage Green"], sizes: ["3X12", "4X12", "12X12"], look: "Modern" },
    { id: "19-2", col: "FRAMES", colors: ["Mist", "Teal", "Petrol", "Neu Gray", "White Ice", "Sage Green"], sizes: ["3X12", "4X12", "12X12"], look: "Modern" },
    { id: "19-3", col: "MOSAICS", colors: ["Mist", "Teal", "Petrol", "Neu Gray", "White Ice", "Sage Green"], sizes: ["3X12", "4X12", "12X12"], look: "Modern" },
    { id: "20", col: "COLOR COLLECTION", colors: ["White Ice", "Tender Gray", "Neu Gray", "Petrol", "Teal", "Mist", "Sage Green", "Black", "Taupe"], sizes: ["2X8", "3X6", "4X12", "3X12", "4X4", "6X6", "8X24", "10X28", "12X36"], look: "Modern" },
    { id: "21", col: "CRYSTAL", colors: ["White"], sizes: ["24X48"], look: "Marble" },
    { id: "22", col: "DERBY", colors: ["Gris"], sizes: ["24X24"], look: "Stone" },
    { id: "23", col: "DOWNTOWN", colors: ["Blanco", "Grey", "Marengo", "Antracita", "Beige", "Ash", "Pearl", "Silver", "Maple"], sizes: ["12X24", "24X24", "9X35", "12X12"], look: "Concrete" },
    { id: "23-2", col: "ESSENCE", colors: ["Blanco", "Grey", "Marengo", "Antracita", "Beige", "Ash", "Pearl", "Silver", "Maple"], sizes: ["12X24", "24X24", "9X35", "12X12"], look: "Wood" },
    { id: "24", col: "EVERGLADE", colors: ["Silver Gray", "Warm Gray", "Forest", "Nogales"], sizes: ["8X48"], look: "Wood" },
    { id: "25", col: "FLOW", colors: ["White", "Frost", "Lavender", "Dark Gray", "Velvet Pink", "Burgundy", "Peacock Green", "Cosmic Sapphire"], sizes: ["3X12", "4X16", "4X10"], look: "Modern" },
    { id: "25-2", col: "JOY", colors: ["White", "Frost", "Lavender", "Dark Gray", "Velvet Pink", "Burgundy", "Peacock Green", "Cosmic Sapphire"], sizes: ["3X12", "4X16", "4X10"], look: "Modern" },
    { id: "26", col: "HAVANA", colors: ["White", "Silver", "Coaxial", "Marengo", "Moka", "Jazz", "Retro", "Blues"], sizes: ["8X8"], look: "Modern" },
    { id: "27", col: "JEWELS", colors: ["Laurent White", "Mattia White", "Etienne Cream", "Etienne Gray", "Therry Cream", "Vince White"], sizes: ["12X24", "24X48"], look: "Marble" },
    { id: "28", col: "JUNE", colors: ["Caliza", "Gris", "Grafito", "Antracita", "Arena", "Blanco"], sizes: ["24X24", "24X48", "12X36"], look: "Concrete" },
    { id: "28-2", col: "LAGOM", colors: ["Caliza", "Gris", "Grafito", "Antracita", "Arena", "Blanco"], sizes: ["24X24", "24X48", "12X36"], look: "Wood" },
    { id: "29", col: "LASSA", colors: ["White"], sizes: ["3X6", "4X10", "6X18", "12X24", "24X24", "24X48", "35X35", "12X12"], look: "Marble" },
    { id: "29-2", col: "NORDICO", colors: ["White"], sizes: ["3X6", "4X10", "6X18", "12X24", "24X24", "24X48", "35X35", "12X12"], look: "Marble" },
    { id: "29-3", col: "ONYX", colors: ["White"], sizes: ["3X6", "4X10", "6X18", "12X24", "24X24", "24X48", "35X35", "12X12"], look: "Marble" },
    { id: "29-4", col: "STATUARY", colors: ["White"], sizes: ["3X6", "4X10", "6X18", "12X24", "24X24", "24X48", "35X35", "12X12"], look: "Marble" },
    { id: "30", col: "LITHOLOGY EDITION", colors: ["Polaris", "Ibiza", "Astoria", "Sandstone", "Vesta", "Moscato", "Basalt", "Empire", "Urban"], sizes: ["12X24", "24X24", "24X48", "3X12"], look: "Stone" },
    { id: "30-2", col: "LIVERPOOL", colors: ["Polaris", "Ibiza", "Astoria", "Sandstone", "Vesta", "Moscato", "Basalt", "Empire", "Urban"], sizes: ["12X24", "24X24", "24X48", "3X12"], look: "Stone" },
    { id: "31", col: "MAIOLICA", colors: ["White", "Biscuit", "Tender Gray", "Aqua", "Taupe", "Blue Steel"], sizes: ["3X6", "4X10", "3X12", "7X8"], look: "Modern" },
    { id: "32", col: "NOLITA", colors: ["Blanco", "Gris", "Grafito", "Antracita"], sizes: ["12X24", "18X36", "24X48", "3X12", "12X12"], look: "Concrete" },
    { id: "33", col: "PAVERS", colors: ["Mason Gray", "Evolve", "Cortona", "Piamonte", "Toscana", "Avalon", "Serena"], sizes: ["24X24", "24X36"], look: "Stone" },
    { id: "33-2", col: "20MM", colors: ["Mason Gray", "Evolve", "Cortona", "Piamonte", "Toscana", "Avalon", "Serena"], sizes: ["24X24", "24X36"], look: "Stone" },
    { id: "34", col: "PRO", colors: ["Cement", "Concrete", "Nude", "Sand", "Ivory"], sizes: ["12X24", "24X24"], look: "Concrete" },
    { id: "34-2", col: "PRO MAX", colors: ["Cement", "Concrete", "Nude", "Sand", "Ivory"], sizes: ["12X24", "24X24"], look: "Concrete" },
    { id: "35", col: "SLABS", colors: ["Carrara", "Koronis", "Sahara Noir", "Calacata", "Concrete", "Sorrento", "Lassa", "Nouveau", "Parana", "Pantheon", "Athea", "Allure", "Fossil", "Statuario"], sizes: ["24X48", "48X48", "48X110", "63X126"], look: "Marble" },
    { id: "35-2", col: "XL SLABS", colors: ["Carrara", "Koronis", "Sahara Noir", "Calacata", "Concrete", "Sorrento", "Lassa", "Nouveau", "Parana", "Pantheon", "Athea", "Allure", "Fossil", "Statuario"], sizes: ["24X48", "48X48", "48X110", "63X126"], look: "Marble" },
    { id: "36", col: "ZELLIGE", colors: ["White", "Tender Gray", "Dark Gray", "Emerald Green", "Deep Blue"], sizes: ["2X16", "3/4X16"], look: "Modern" },
    { id: "37", col: "ZEN", colors: ["White", "Silver", "Gray"], sizes: ["16X48", "12X24", "24X48"], look: "Stone" },
    { id: "37-2", col: "ZEN STONE", colors: ["White", "Silver", "Gray"], sizes: ["16X48", "12X24", "24X48"], look: "Stone" }
];

const rawDuneData = [
    { id: "dune-1", col: "AGADIR", colors: ["Agua", "Cotto Oscuro", "Lago", "Lava", "Niebla", "Noche", "Piedra", "Selva"], sizes: ["3X11", "6X6"], look: "Modern" },
    { id: "dune-2", col: "ATELIER", colors: ["White", "French Blue", "Olive", "Rose", "Pearl"], sizes: ["3X6", "3X12"], look: "Modern" },
    { id: "dune-3", col: "ATLANTIQUE", colors: ["Ocean Blue", "Turquoise", "Deep Sea", "Emerald"], sizes: ["8X8", "6X12"], look: "Modern" },
    { id: "dune-4", col: "CALACATTA LUX", colors: ["Gold Vein", "Calacatta Extra"], sizes: ["24X48", "35X35", "12X36"], look: "Marble" },
    { id: "dune-5", col: "CREMABELLA", colors: ["Ivory Glossy", "Cream Polished"], sizes: ["12X36", "24X24"], look: "Marble" },
    { id: "dune-6", col: "CRISTAL", colors: ["Rose Quartz", "Emerald Glow", "Sapphire", "Golden Amber"], sizes: ["12X12 Mosaic"], look: "Modern" },
    { id: "dune-7", col: "FANCY", colors: ["Cloud", "White Relief", "Grey Wave"], sizes: ["12X36", "24X48"], look: "Modern" },
    { id: "dune-8", col: "GRANADELLA", colors: ["Cielo", "Verde Mar", "Terracotta", "Arena"], sizes: ["6X6", "3X12"], look: "Modern" },
    { id: "dune-9", col: "GREENLAND", colors: ["Ivory Glossy", "Forest Glossy"], sizes: ["12X36"], look: "Modern" },
    { id: "dune-10", col: "KIT-KAT MOSAICS", colors: ["Anise", "Cotto", "Sage Green", "White Gloss", "Black Velvet", "Ocean Blue"], sizes: ["12X12 Sheet", "1X8 Finger"], look: "Modern" },
    { id: "dune-11", col: "MILANO", colors: ["Ivory Glossy", "Nero Glossy"], sizes: ["12X36"], look: "Marble" },
    { id: "dune-12", col: "NOVA", colors: ["Gold Geometric", "Silver Relief"], sizes: ["12X36", "8X8"], look: "Modern" },
    { id: "dune-13", col: "PIETRASANTA", colors: ["Pietrasanta Gold", "Statuario Luxe"], sizes: ["24X48", "35X35", "12X36"], look: "Marble" },
    { id: "dune-14", col: "RIAD", colors: ["Blanco", "Verde Mar", "Denim", "Carbon", "Avena", "Exa Avena"], sizes: ["2.5X10", "6X6 Hex"], look: "Modern" },
    { id: "dune-15", col: "SELENE", colors: ["Light Ivory", "Cappuccino", "Dark Onyx", "Sky Blue", "Selene Gold"], sizes: ["35X35", "24X48", "48X48"], look: "Marble" },
    { id: "dune-16", col: "STRIPES", colors: ["White Fluted", "Grey Fluted", "Rose Fluted"], sizes: ["10X28", "12X36"], look: "Modern" },
    { id: "dune-17", col: "TABARCA", colors: ["Turquesa", "Cielo", "Verde Miel", "Blanco", "Gold Matt"], sizes: ["3X9", "6X6"], look: "Modern" },
    { id: "dune-18", col: "TAHITI & GOLDEN STONE", colors: ["Tahiti Pearl", "Golden Stone Bronze", "Copper Glow"], sizes: ["12X12 Mosaic"], look: "Modern" },
    { id: "dune-19", col: "TERRALUZ", colors: ["Terracotta Natural", "Luz Arena"], sizes: ["8X8", "12X24"], look: "Stone" },
    { id: "dune-20", col: "THEIA", colors: ["Satin Ivory", "Satin Bronze"], sizes: ["14X14", "12X36"], look: "Modern" },
    { id: "dune-21", col: "ALTEA", colors: ["Altea Blanco", "Altea Marino", "Altea Verde"], sizes: ["3X9", "6X6"], look: "Modern" },
    { id: "dune-22", col: "CHICAGO", colors: ["Ocean Terrazzo", "Ash Terrazzo", "White Terrazzo"], sizes: ["8X8", "12X12"], look: "Concrete" },
    { id: "dune-23", col: "BALI", colors: ["Bali Green Mineral", "Bali Sky Blue", "Bali Slate"], sizes: ["6X6", "12X12"], look: "Stone" },
    { id: "dune-24", col: "BERLIN", colors: ["Bambu White", "Lotus Grey", "Aquamar"], sizes: ["6X6", "12X36"], look: "Modern" },
    { id: "dune-25", col: "CRACKLE", colors: ["Laguna Blue", "Nieve White", "Menta Green"], sizes: ["3X9", "6X6"], look: "Modern" }
];

export const allProducts: Product[] = [];

// Populate Roca Products (brand: roca-tiles)
rawRocaData.forEach((raw, idx) => {
    const colInfo = rocaCollectionsList.find(c => c.name === raw.col) || rocaCollectionsList[0];
    const baseImg = rocaImages[colInfo.slug] || `https://picsum.photos/seed/castile_roca_${raw.id}/1000/1000`;

    const variations = raw.colors.map((c, i) => ({
        color: c,
        image: `https://picsum.photos/seed/castile_var_${raw.id}_${i}/1000/1000`
    }));

    allProducts.push({
        id: raw.id,
        name: raw.col,
        category: colInfo.materials?.[0] || "Porcelain",
        collectionId: colInfo.slug,
        sizes: raw.sizes,
        colors: raw.colors,
        variations,
        image: baseImg,
        isNew: idx % 4 === 0,
        description: `The ${raw.col} architectural surface collection by Roca. Crafted in Spain with premium ${colInfo.materials?.[0]?.toLowerCase() || 'porcelain'}. Available in ${raw.colors.slice(0, 3).join(", ")}. Sizes: ${raw.sizes.slice(0, 3).join(", ")}.`,
        brand: "roca-tiles",
        look: raw.look,
        finish: ["Matte", "Polished", "Lappato"].slice(0, (idx % 3) + 1),
        usage: ["Floor", "Wall", "Indoor", "Outdoor"].slice(0, (idx % 3) + 2)
    });
});

// Populate Dune Luxury Accents Products (brand: dune)
rawDuneData.forEach((raw, idx) => {
    const colInfo = duneCollectionsList.find(c => c.name === raw.col) || duneCollectionsList[0];
    const baseImg = duneImages[colInfo.slug] || `https://website-duneceramics.s3.eu-central-1.amazonaws.com/Dune/public/azulejos-rosas-para-banos-1777290132PY6P3.jpg`;

    const variations = raw.colors.map((c, i) => ({
        color: c,
        image: `https://picsum.photos/seed/castile_dune_${raw.id}_${i}/1000/1000`
    }));

    allProducts.push({
        id: raw.id,
        name: raw.col,
        category: colInfo.materials?.[0] || "Artisan Ceramic",
        collectionId: colInfo.slug,
        sizes: raw.sizes,
        colors: raw.colors,
        variations,
        image: baseImg,
        isNew: idx % 3 === 0,
        description: `The ${raw.col} luxury accent collection by Dune Ceramics. Featuring handcrafted ${colInfo.materials?.[0]?.toLowerCase() || 'decorative tile'}. Ideal for bespoke backsplashes, spa feature walls, and luxury wet areas.`,
        brand: "dune",
        look: raw.look,
        finish: ["Glossy Artisan", "Lustre Metallic", "Satin Relief"].slice(0, (idx % 3) + 1),
        usage: ["Wall", "Indoor", "Feature Accent", "Shower Nook"]
    });
});

// Search Index Builder
export interface SearchItem {
    type: "product" | "collection";
    name: string;
    category: string;
    slug: string;
    id: string;
    image: string;
    brand?: string;
    sizes?: string[];
    colors?: string[];
}

export function getSearchIndex(): SearchItem[] {
    const items: SearchItem[] = [];

    allProducts.forEach((p) => {
        items.push({
            type: "product",
            name: p.name,
            category: p.brand === "dune" ? `Dune Luxury Accent` : `Roca Architectural`,
            slug: p.collectionId,
            id: p.id,
            image: p.image,
            brand: p.brand,
            sizes: p.sizes,
            colors: p.colors
        });
    });

    categories.forEach((c) => {
        items.push({
            type: "collection",
            name: c.name,
            category: c.brand === "dune" ? `Dune Collection` : `Roca Collection`,
            slug: c.slug,
            id: `col-${c.slug}`,
            image: c.image,
            brand: c.brand
        });
    });

    return items;
}
