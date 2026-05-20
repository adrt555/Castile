const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function runFullParser() {
    try {
        console.log("Reading Laufen PDF...");
        const fileBuffer = fs.readFileSync('public/Laufen PriceList 2025-26.pdf');
        const uint8 = new Uint8Array(fileBuffer);
        const parser = new PDFParse({ data: uint8 });
        
        console.log("Extracting text from PDF...");
        const textData = await parser.getText();
        const lines = textData.text.split('\n');
        
        console.log("Analyzing and grouping lines into unified product blocks...");
        const blocksMap = new Map();
        let currentBlock = null;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Check if line starts with an SKU like H220972 or H820978
            const matchSKU = line.match(/^(H\d{6})\s+(.+)$/);
            if (matchSKU) {
                const sku = matchSKU[1];
                const rest = matchSKU[2].trim();
                
                // Filter out index entries or noise
                if (rest.includes("INDEX") || rest.match(/^\d+/) || rest.includes(",")) {
                    continue;
                }
                
                if (!blocksMap.has(sku)) {
                    blocksMap.set(sku, {
                        baseSku: sku,
                        collection: "",
                        size: "—",
                        description: "",
                        lines: []
                    });
                }
                currentBlock = blocksMap.get(sku);
                currentBlock.lines.push(line);
                
                // Extract collection name & size
                if (!currentBlock.collection) {
                    const matchCol = rest.match(/^([A-Z0-9\s&'-•+]+?)(?:\s+(\d+[\d\/\s.x"-]*["“]?)|$)/);
                    if (matchCol) {
                        currentBlock.collection = matchCol[1].trim();
                        currentBlock.size = rest.replace(currentBlock.collection, '').trim() || "—";
                    } else {
                        currentBlock.collection = rest;
                    }
                    if (currentBlock.collection.split(' ').some(w => w !== w.toUpperCase() && w.length > 2)) {
                        currentBlock.collection = "LAUFEN";
                    }
                }
                
                // Description is typically on the next line
                if (i + 1 < lines.length && !lines[i + 1].trim().startsWith('H') && !currentBlock.description) {
                    currentBlock.description = lines[i + 1].trim();
                }
            } else if (currentBlock) {
                currentBlock.lines.push(line);
            }
        }
        
        console.log(`Extracted ${blocksMap.size} base Laufen products. Exploding variants...`);
        const finalProducts = [];
        
        for (const block of blocksMap.values()) {
            const baseSku = block.baseSku;
            
            // Normalize collection names
            let collection = block.collection || "LAUFEN";
            if (collection.includes("KARTELL") || collection.includes("Kartell")) {
                collection = "KARTELL • LAUFEN";
            } else if (collection.includes("ILBAGNOALESSI") || collection.includes("Alessi")) {
                collection = "ILBAGNOALESSI";
            } else if (collection.includes("LIVING") || collection.includes("Living")) {
                if (collection.includes("CITY")) collection = "LIVING CITY";
                else if (collection.includes("SQUARE")) collection = "LIVING SQUARE";
                else collection = "LIVING";
            } else if (collection.includes("PRO S")) {
                collection = "LAUFEN PRO S";
            } else if (collection.includes("PRO")) {
                collection = "LAUFEN PRO";
            }
            
            const size = block.size || "—";
            const description = block.description || "";
            
            // 1. Extract colors listed in this unified block
            const colors = [];
            let colorsBlockStarted = false;
            for (const l of block.lines) {
                if (l.includes("Colours:") || l.includes("Compatible with:") || l.includes("Compatible Tubs") || l.includes("Required Seat")) {
                    colorsBlockStarted = true;
                }
                if (colorsBlockStarted) {
                    const parts = l.split('|');
                    for (const part of parts) {
                        const m = part.match(/\b(\d{3})\s+(.+)$/);
                        if (m) {
                            const code = m[1];
                            let name = m[2].trim();
                            
                            // Strip noise
                            name = name
                                .replace(/in stock/gi, '')
                                .replace(/special order/gi, '')
                                .replace(/glossy finish/gi, '')
                                .replace(/matte finish/gi, '')
                                .replace(/matt finish/gi, '')
                                .replace(/active/gi, '')
                                .replace(/usd/gi, '')
                                .replace(/lb\.?/gi, '')
                                .replace(/[,|.]/g, '')
                                .trim();
                                
                            if (name && name.length > 2 && !name.includes("Option") && !name.match(/^\d+$/)) {
                                if (!colors.some(c => c.code === code)) {
                                    colors.push({ code, name });
                                }
                            }
                        }
                    }
                }
            }
            
            // Default color is White 000 if nothing else is specified
            if (colors.length === 0) {
                colors.push({ code: '000', name: 'White' });
            }
            
            // 2. Extract options and prices from the block
            const options = [];
            for (const l of block.lines) {
                const matchOption = l.match(/(?:(H\d{6})\s+\.\.\.\s+(\w+)|(H\d{13}))\s+\.(\d{3})\s+([\d.,\s]+)$/);
                if (matchOption) {
                    const fullSku = matchOption[3];
                    const optionCode = matchOption[4];
                    const priceStr = matchOption[5];
                    const prices = priceStr.match(/\b\d{1,6}[.,]\d{2}\b/g).map(p => parseFloat(p.replace(',', '')));
                    options.push({ fullSku, optionCode, prices });
                }
            }
            
            // Fallback for simple price formats without formal options
            if (options.length === 0) {
                let foundPrice = 0;
                for (const l of block.lines) {
                    const priceMatches = l.match(/\b\d{1,6}[.,]\d{2}\b/g);
                    if (priceMatches) {
                        for (const pm of priceMatches) {
                            const pVal = parseFloat(pm.replace(',', ''));
                            if (pVal > 20 && pVal !== 99 && pVal !== 100) {
                                foundPrice = pVal;
                                break;
                            }
                        }
                    }
                    if (foundPrice > 0) break;
                }
                
                if (foundPrice > 0) {
                    options.push({
                        fullSku: null,
                        optionCode: "000",
                        prices: [foundPrice]
                    });
                }
            }
            
            // 3. Explode into individual 13-character variants
            for (const opt of options) {
                const optCode = opt.optionCode;
                const prices = opt.prices;
                
                for (let idx = 0; idx < prices.length; idx++) {
                    const price = prices[idx];
                    
                    let colorObj = colors[idx];
                    if (!colorObj) {
                        // fallback to last known color or standard White
                        colorObj = colors[colors.length - 1] || { code: '000', name: 'White' };
                    }
                    
                    const colorCode = colorObj.code;
                    const colorName = colorObj.name;
                    
                    let finalSku = opt.fullSku;
                    if (!finalSku) {
                        finalSku = `${baseSku}${colorCode}${optCode}1`;
                    }
                    
                    let finalDesc = description;
                    if (colorName) {
                        finalDesc = `${description} | Finish: ${colorName}`;
                    }
                    
                    let finalName = `${collection} ${finalDesc.split(',')[0].split('|')[0].trim()}`;
                    if (colorName) {
                        finalName += ` (${colorName})`;
                    }
                    
                    const p = {
                        id: `lauf_${finalSku.toLowerCase()}`,
                        sku: finalSku,
                        name: finalName,
                        collection: collection,
                        category: "Ceramic / Bathroom Fixtures",
                        collectionId: collection.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        sizes: [size],
                        colors: [colorName],
                        size: size,
                        image: "https://picsum.photos/seed/laufen_prod/800/800",
                        description: finalDesc,
                        costPricePerSqft: parseFloat((price * 0.70).toFixed(2)),
                        sellingPricePerSqft: price,
                        inStockSqft: 0,
                        sqftPerBox: 1,
                        boxesPerPallet: 1
                    };
                    
                    // 4. Clean up categorization
                    const descLower = finalDesc.toLowerCase();
                    const nameLower = finalName.toLowerCase();
                    
                    if (descLower.includes("bathtub") || descLower.includes("bath") || nameLower.includes("bathtub")) {
                        p.category = "Bathtubs";
                    } else if (descLower.includes("water closet") || descLower.includes("toilet") || descLower.includes("urinal") || descLower.includes("wc bowl") || nameLower.includes("toilet") || nameLower.includes("urinal")) {
                        p.category = "Toilets & Urinals";
                    } else if (descLower.includes("washbasin") || descLower.includes("basin") || descLower.includes("bidet") || nameLower.includes("washbasin") || nameLower.includes("bidet")) {
                        p.category = "Washbasins & Bidets";
                    } else if (descLower.includes("vanity") || descLower.includes("cabinet") || descLower.includes("drawer") || descLower.includes("furniture") || nameLower.includes("vanity") || nameLower.includes("cabinet")) {
                        p.category = "Bathroom Furniture";
                    } else if (descLower.includes("mirror") || descLower.includes("towel") || descLower.includes("hanger") || descLower.includes("holder") || descLower.includes("shelf") || descLower.includes("accessory") || nameLower.includes("shelf") || nameLower.includes("holder")) {
                        p.category = "Accessories";
                    } else {
                        p.category = "Ceramic / Bathroom Fixtures";
                    }
                    
                    finalProducts.push(p);
                }
            }
        }
        
        // Deduplicate final list by full SKU
        const uniqueProductsMap = new Map();
        for (const p of finalProducts) {
            if (!uniqueProductsMap.has(p.sku)) {
                uniqueProductsMap.set(p.sku, p);
            }
        }
        const deduplicatedProducts = Array.from(uniqueProductsMap.values());
        
        // Write the finalized list to src/lib/laufenProducts.json
        fs.writeFileSync('src/lib/laufenProducts.json', JSON.stringify(deduplicatedProducts, null, 2));
        
        console.log("=== PARSING & SAVING SUCCESSFUL ===");
        console.log("TOTAL EXTRACTED & EXPLODED LAUFEN PRODUCTS:", deduplicatedProducts.length);
        
        // Print distribution by category
        const catDistribution = {};
        for (const p of deduplicatedProducts) {
            catDistribution[p.category] = (catDistribution[p.category] || 0) + 1;
        }
        console.log("\nProducts per Category:", JSON.stringify(catDistribution, null, 2));
        
        // Print distribution by collection
        const colDistribution = {};
        for (const p of deduplicatedProducts) {
            colDistribution[p.collection] = (colDistribution[p.collection] || 0) + 1;
        }
        console.log("\nProducts per Collection (top 15):", 
            JSON.stringify(Object.fromEntries(Object.entries(colDistribution).sort((a,b) => b[1] - a[1]).slice(0, 15)), null, 2)
        );
        
    } catch (e) {
        console.error("FATAL ERROR IN RUNNING FULL PARSER:", e);
    }
}

runFullParser();
