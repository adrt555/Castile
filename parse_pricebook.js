// Inspect ALL sheets for cost/price columns in the ROCA price book
const XLSX = require('xlsx');
const filePath = 'C:/Users/adrian/Desktop/Castile/(COST) - ROCA USA 2026 PRICE BOOK I-JAN.xlsx';
const wb = XLSX.readFile(filePath);

console.log('SHEETS:', wb.SheetNames);

// Look at 2026 PRICING to find ALL filled columns in first 30 rows
const ws = wb.Sheets['2026 PRICING'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

console.log('\n=== First 15 rows with ALL non-empty cols ===');
rows.slice(1, 15).forEach((r, i) => {
    const nonEmpty = r.map((v, idx) => v !== '' ? `[${idx}]=${JSON.stringify(v)}` : null).filter(Boolean);
    console.log(`Row ${i + 1}:`, nonEmpty.join('  '));
});

// Look at SPECIAL ORDER sheet
const ws2 = wb.Sheets['2026 SPECIAL ORDER PRICING'];
const rows2 = XLSX.utils.sheet_to_json(ws2, { header: 1, defval: '' });
console.log('\n=== SPECIAL ORDER - first 20 rows ===');
rows2.slice(0, 20).forEach((r, i) => {
    if (r.some(v => v !== '')) console.log(`Row ${i}:`, JSON.stringify(r));
});
