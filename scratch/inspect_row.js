const XLSX = require('xlsx');
const filePath = 'E:\\Download\\2026 DUNE ROCA PRICE LIST PLI.xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row && row[2] == '187521N') {
        console.log(JSON.stringify(row, null, 2));
    }
}
