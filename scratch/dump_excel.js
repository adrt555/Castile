const XLSX = require('xlsx');
const fs = require('fs');

const filePath = 'E:\\Download\\2026 DUNE ROCA PRICE LIST PLI.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

const output = data.slice(0, 100).map(row => row.join('\t')).join('\n');
fs.writeFileSync('scratch/excel_dump.txt', output, 'utf8');
console.log('Dumped 100 rows to scratch/excel_dump.txt');
