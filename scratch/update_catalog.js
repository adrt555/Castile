const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = 'E:\\Download\\2026 DUNE ROCA PRICE LIST PLI.xlsx';
const TS_FILE_PATH = 'D:\\Castile\\web\\src\\lib\\crmProducts.ts';

function parseExcel() {
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    const products = [];
    let currentCollection = 'DUNE';
    let currentSize = '';
    let currentUOM = 'SF';
    let currentPrice = 0;
    let currentPieces = 0;
    let currentSqftBox = 0;
    let currentBoxesPallet = 0;

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 5) continue;

        // Check for collection header
        const col2 = String(row[2] || '');
        if (col2.includes(' - ') && !row[3]) {
            currentCollection = col2.split(' - ')[0].trim().toUpperCase();
            continue;
        }

        // Skip table headers
        if (col2 === 'SKU') continue;

        // Extract SKU - usually at index 2
        const sku = row[2];
        if (!sku) continue;
        
        // If it's a row with just garbage or category names like "CARTON", skip
        if (String(sku).includes('SKU') || String(sku).includes('CARTON')) continue;

        // Carry over logic
        const size = row[3] || currentSize;
        const description = row[4] || '';
        const uom = row[5] || currentUOM;
        const price = parseFloat(row[6]) || currentPrice;
        const pieces = parseInt(row[7]) || currentPieces;
        const sqftBox = parseFloat(row[8]) || currentSqftBox;
        const boxesPallet = parseInt(row[10]) || currentBoxesPallet;

        // Update trackers
        currentSize = size;
        currentUOM = uom;
        currentPrice = price;
        currentPieces = pieces;
        currentSqftBox = sqftBox;
        currentBoxesPallet = boxesPallet;

        // Skip rows that are clearly not products (e.g. category titles in index 2)
        if (isNaN(price)) continue;

        // Price calculation
        let costPerSqft = price;
        if (uom === 'PC' && sqftBox > 0) {
            // If it's sold per piece, we convert to per SF for the catalog if SF is provided
            // Actually, for tile lists, if UOM is PC, and it's a field tile, Price is usually per SF anyway?
            // But if it's a mosaic/trim, Price is per piece.
            // Let's check row 48: Price 41, UOM PC, PC 7, SF 6.78. 
            // 41 * 7 = 287 per box. 287 / 6.78 = 42.3 per SF.
            // If it were per SF, it would be 41. 
            // I'll assume if UOM is PC, the price is per piece.
            costPerSqft = (price * pieces) / sqftBox;
        }

        // Selling Price with 35% margin: Cost / 0.65
        const sellingPrice = parseFloat((costPerSqft / 0.65).toFixed(2));
        const roundedCost = parseFloat(costPerSqft.toFixed(4));

        const id = `dune_${String(sku).toLowerCase().trim().replace(/[^a-z0-9]/g, '_')}`;
        
        products.push({
            id,
            sku: String(sku).trim(),
            name: description.trim().toUpperCase(),
            collection: currentCollection,
            size: size.trim().toUpperCase(),
            costPricePerSqft: roundedCost,
            sellingPricePerSqft: sellingPrice,
            sqftPerBox: sqftBox || 0,
            boxesPerPallet: boxesPallet || 0,
            category: "Porcelain & Ceramic",
            image: "/products/placeholder.jpg"
        });
    }
    return products;
}

function updateTsFile(newProducts) {
    let content = fs.readFileSync(TS_FILE_PATH, 'utf8');
    
    // Find existing SKUs to avoid duplicates
    const existingSkus = new Set();
    const skuMatches = content.match(/sku:"([^"]+)"/g) || [];
    skuMatches.forEach(m => {
        const s = m.match(/sku:"([^"]+)"/)[1];
        existingSkus.add(s);
    });

    const filtered = newProducts.filter(p => !existingSkus.has(p.sku));
    if (filtered.length === 0) {
        console.log('No new products to add.');
        return;
    }

    // Prepare the string
    const newLines = filtered.map(p => `    ${JSON.stringify(p).replace(/"([^"]+)":/g, '$1:')},`).join('\n');

    // Find the last closing bracket of the array
    const lastBracketIndex = content.lastIndexOf('];');
    if (lastBracketIndex === -1) {
        console.error('Could not find end of crmProducts array');
        return;
    }

    const newContent = content.slice(0, lastBracketIndex) + newLines + '\n' + content.slice(lastBracketIndex);
    fs.writeFileSync(TS_FILE_PATH, newContent, 'utf8');
    console.log(`Added ${filtered.length} new products to ${TS_FILE_PATH}`);
}

const products = parseExcel();
updateTsFile(products);
