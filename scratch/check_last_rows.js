const XLSX = require('xlsx');
const filePath = 'E:\\Download\\2026 DUNE ROCA PRICE LIST PLI.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
console.log(JSON.stringify(data.slice(230, 245), null, 2));
