const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const filePath = 'E:\\Download\\2026 DUNE ROCA PRICE LIST PLI.xlsx';
const workbook = XLSX.readFile(filePath);
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

    // Check if it's a collection header row
    // Header rows often have the collection name in col 2 (index 2) and follow a pattern
    const col2 = String(row[2] || '');
    if (col2.includes(' - ') && !row[3]) {
        currentCollection = col2.split(' - ')[0].trim().toUpperCase();
        continue;
    }

    // Check if it's the table header row
    if (col2 === 'SKU') continue;

    // Skip empty or irrelevant rows
    const sku = row[2];
    if (!sku || isNaN(parseInt(sku)) && String(sku).length < 5) continue;

    // Extract values, fallback to previous if null
    const size = row[3] || currentSize;
    const description = row[4] || '';
    const uom = row[5] || currentUOM;
    const cost = parseFloat(row[6]) || currentPrice;
    const pieces = parseInt(row[7]) || currentPieces;
    const sqftBox = parseFloat(row[8]) || currentSqftBox;
    const boxesPallet = parseInt(row[10]) || currentBoxesPallet;

    // Update trackers for carrying over
    currentSize = size;
    currentUOM = uom;
    currentPrice = cost;
    currentPieces = pieces;
    currentSqftBox = sqftBox;
    currentBoxesPallet = boxesPallet;

    // Final check for valid product row
    if (!cost) continue;

    const id = `dune_${String(sku).toLowerCase().replace(/\s+/g, '_')}`;
    const sellingPrice = parseFloat((cost * 1.35).toFixed(2));

    products.push({
        id,
        sku: String(sku),
        name: description.toUpperCase(),
        collection: currentCollection,
        size: size.toUpperCase(),
        costPricePerSqft: cost,
        sellingPricePerSqft: sellingPrice,
        sqftPerBox: sqftBox,
        boxesPerPallet: boxesPallet,
        category: "Porcelain & Ceramic",
        image: "/products/placeholder.jpg"
    });
}

const jsonOutput = JSON.stringify(products, null, 2);
fs.writeFileSync('scratch/dune_products.json', jsonOutput, 'utf8');
console.log(`Successfully parsed ${products.length} products to scratch/dune_products.json`);

