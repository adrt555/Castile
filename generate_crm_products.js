// Generates src/lib/crmProducts.ts from the ROCA 2026 COST price book
// The PRICE column = dealer cost (what Castile pays ROCA)
// sellingPricePerSqft = cost * markup (to be overridden per product)
const XLSX = require('xlsx');
const fs = require('fs');

const filePath = 'C:/Users/adrian/Desktop/Castile/(COST) - ROCA USA 2026 PRICE BOOK I-JAN.xlsx';
const wb = XLSX.readFile(filePath);
const ws = wb.Sheets['2026 PRICING'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

const products = [];
let currentCollection = '';
let currentCost = null;
let currentSfPerBox = null;
let currentBoxesPerPallet = null;
let currentSize = '';

const clean = (v) => String(v || '').trim();
const num = (v) => parseFloat(String(v).replace(/[^0-9.]/g, '')) || 0;

for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const col2 = clean(row[2]);
    const col3 = clean(row[3]);
    const col4 = clean(row[4]);
    const col6 = row[6];  // PRICE = dealer cost
    const col8 = row[8];  // SF / carton
    const col10 = row[10]; // BXS per pallet

    // Detect section header
    if (col2 && col2.includes(' - ') && !col4) {
        currentCollection = col2.split(' - ')[0].trim().toUpperCase();
        currentCost = null;
        currentSfPerBox = null;
        currentBoxesPerPallet = null;
        currentSize = '';
        continue;
    }

    if (col2 === 'SKU') continue;

    if (!col2) continue;
    if (col2.length > 20 && !col4) continue;

    const looksLikeSku = /^[A-Z0-9_\-*]{4,}$/i.test(col2) || /^[A-Z]{2,}[0-9]/.test(col2) || /^[A-Z0-9]{6,}/.test(col2);
    if (!looksLikeSku) continue;

    const sku = col2.replace(/\*/g, '');
    const description = clean(col4);
    if (!description) continue;

    if (col3 && col3.length < 40 &&
        !col3.startsWith('FLOOR') && !col3.startsWith('WALL') &&
        !col3.startsWith('CERAMIC') && !col3.startsWith('NEW') && !col3.startsWith('TRIM')) {
        currentSize = col3;
    }

    // Update cost if this row has one (PRICE col = dealer cost)
    if (col6 && typeof col6 === 'number' && col6 > 0) {
        currentCost = col6;
    }
    if (col8 && col8 !== '' && !isNaN(num(col8)) && num(col8) > 0) {
        currentSfPerBox = num(col8);
    }
    if (col10 && col10 !== '' && !isNaN(num(col10)) && num(col10) > 0) {
        currentBoxesPerPallet = num(col10);
    }

    if (!sku) continue;

    const cost = currentCost || 0;
    // Standard retail markup: 25% above dealer cost
    const retail = parseFloat((cost * 1.25).toFixed(2));

    products.push({
        id: `roca_${sku.toLowerCase()}`,
        sku,
        name: description,
        collection: currentCollection || 'GENERAL',
        size: currentSize,
        costPricePerSqft: parseFloat(cost.toFixed(4)),
        sellingPricePerSqft: retail,
        sqftPerBox: currentSfPerBox || 0,
        boxesPerPallet: currentBoxesPerPallet || 0,
        category: 'Porcelain & Ceramic',
        image: '/products/placeholder.jpg',
    });
}

console.log(`Extracted ${products.length} products`);
console.log('Sample:');
products.slice(0, 5).forEach(p => {
    console.log(`  ${p.sku} | cost=$${p.costPricePerSqft} | retail=$${p.sellingPricePerSqft} | ${p.sqftPerBox}sf/box | ${p.name}`);
});

// Generate TypeScript
const lines = [];
lines.push(`// AUTO-GENERATED from ROCA USA 2026 COST Price Book`);
lines.push(`// PRICE column = dealer cost (what Castile pays ROCA)`);
lines.push(`// Generated: ${new Date().toISOString()}`);
lines.push(``);
lines.push(`export interface CRMProductSKU {`);
lines.push(`    id: string;`);
lines.push(`    sku: string;`);
lines.push(`    name: string;`);
lines.push(`    collection: string;`);
lines.push(`    size: string;`);
lines.push(`    costPricePerSqft: number;   // Dealer cost from ROCA price book`);
lines.push(`    sellingPricePerSqft: number; // Castile retail (cost × 1.25)`);
lines.push(`    sqftPerBox: number;`);
lines.push(`    boxesPerPallet: number;      // BXS column from price book`);
lines.push(`    category: string;`);
lines.push(`    image: string;`);
lines.push(`}`);
lines.push(``);
lines.push(`export function calcBoxQuantity(requestedSqft: number, sqftPerBox: number): {`);
lines.push(`    boxes: number; actualSqft: number;`);
lines.push(`} {`);
lines.push(`    if (!sqftPerBox || sqftPerBox <= 0) return { boxes: 0, actualSqft: requestedSqft };`);
lines.push(`    const boxes = Math.ceil(requestedSqft / sqftPerBox);`);
lines.push(`    return { boxes, actualSqft: parseFloat((boxes * sqftPerBox).toFixed(4)) };`);
lines.push(`}`);
lines.push(``);
lines.push(`export const crmProducts: CRMProductSKU[] = [`);

products.filter(p => p.sku && p.name.length > 3).forEach(p => {
    const e = (s) => JSON.stringify(s);
    lines.push(`    { id:${e(p.id)}, sku:${e(p.sku)}, name:${e(p.name)}, collection:${e(p.collection)}, size:${e(p.size)}, costPricePerSqft:${p.costPricePerSqft}, sellingPricePerSqft:${p.sellingPricePerSqft}, sqftPerBox:${p.sqftPerBox}, boxesPerPallet:${p.boxesPerPallet}, category:${e(p.category)}, image:"/products/placeholder.jpg" },`);
});

lines.push(`];`);
lines.push(`export default crmProducts;`);

fs.writeFileSync('./src/lib/crmProducts.ts', lines.join('\n'));
console.log('Wrote src/lib/crmProducts.ts');
