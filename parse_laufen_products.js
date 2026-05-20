const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function extractProducts() {
    try {
        const fileBuffer = fs.readFileSync('public/Laufen PriceList 2025-26.pdf');
        const uint8 = new Uint8Array(fileBuffer);
        const parser = new PDFParse({ data: uint8 });
        
        const textData = await parser.getText();
        const lines = textData.text.split('\n');
        
        const products = [];
        let currentProduct = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check if line starts with an SKU like H220972 or H820978
            const matchSKU = line.match(/^(H\d{6})\s+(.+)$/);
            if (matchSKU) {
                // Save the previous product
                if (currentProduct) {
                    products.push(currentProduct);
                }
                
                const sku = matchSKU[1];
                const rest = matchSKU[2].trim();
                
                // Extract collection: uppercase words at the beginning
                const matchCol = rest.match(/^([A-Z0-9\s&'-]+?)(?:\s+(\d+[\d\/\s.x"-]*["“]?)|$)/);
                let collection = "LAUFEN";
                let size = "—";
                
                if (matchCol) {
                    collection = matchCol[1].trim();
                    size = rest.replace(collection, '').trim() || "—";
                } else {
                    collection = rest;
                }
                
                // Clean up collection name if it has long lowercase terms
                if (collection.split(' ').some(w => w !== w.toUpperCase() && w.length > 2)) {
                    collection = "LAUFEN";
                }
                
                // The description is typically on the next line
                let description = "";
                if (i + 1 < lines.length && !lines[i + 1].trim().startsWith('H')) {
                    description = lines[i + 1].trim();
                }
                
                currentProduct = {
                    id: `lauf_${sku.toLowerCase()}`,
                    sku: sku,
                    name: `${collection} ${description.split(',')[0]}`,
                    collection: collection,
                    category: "Ceramic / Bathroom Furniture",
                    collectionId: collection.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                    sizes: [size],
                    colors: ["White", "Matte Black", "Caffè Matte"],
                    size: size,
                    image: "https://picsum.photos/seed/laufen_prod/800/800",
                    description: description,
                    costPricePerSqft: 0,
                    sellingPricePerSqft: 0,
                    inStockSqft: 0,
                    sqftPerBox: 1,
                    boxesPerPallet: 1
                };
                
                // Skip description line for next iterations
                i++;
            } else if (currentProduct) {
                // Scan for prices in the details lines of the current product
                // Look for price numbers like 10990.00 or 3600.00
                const priceMatches = line.match(/\b\d{3,6}\.\d{2}\b/g);
                if (priceMatches && currentProduct.sellingPricePerSqft === 0) {
                    const retail = parseFloat(priceMatches[0]);
                    if (retail > 20) {
                        currentProduct.sellingPricePerSqft = retail;
                        currentProduct.costPricePerSqft = parseFloat((retail * 0.70).toFixed(2)); // wholesale cost (30% margin)
                    }
                }
            }
        }
        
        if (currentProduct) {
            products.push(currentProduct);
        }
        
        // Filter out products with 0 prices just to have clean catalog data
        const validProducts = products.filter(p => p.sellingPricePerSqft > 0);
        
        console.log("=== EXTRACTION COMPLETE ===");
        console.log("TOTAL SKU LINES DETECTED:", products.length);
        console.log("TOTAL VALID PRICED PRODUCTS EXTRACTED:", validProducts.length);
        console.log("\n=== FIRST 5 PRODUCTS ===");
        console.log(JSON.stringify(validProducts.slice(0, 5), null, 2));
        
        // Write the extracted Laufen products to a JSON file so we can load them easily!
        fs.writeFileSync('src/lib/laufenProducts.json', JSON.stringify(validProducts, null, 2));
        console.log("Saved extracted products to src/lib/laufenProducts.json");
    } catch (e) {
        console.error("ERROR EXTRACITON:", e);
    }
}

extractProducts();
