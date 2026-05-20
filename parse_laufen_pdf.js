const fs = require('fs');
const { PDFParse } = require('pdf-parse');

async function testParse() {
    try {
        const fileBuffer = fs.readFileSync('public/Laufen PriceList 2025-26.pdf');
        const uint8 = new Uint8Array(fileBuffer);
        const parser = new PDFParse({ data: uint8 });
        
        const textData = await parser.getText();
        const pages = textData.text.split(/-- \d+ of 124 --/);
        
        console.log("=== TOTAL PAGES DETECTED:", pages.length);
        
        for (let pageNum of [10, 15, 20, 25, 30]) {
            if (pages[pageNum]) {
                console.log(`\n=== PAGE ${pageNum} ===`);
                console.log(pages[pageNum].substring(0, 1500));
            }
        }
    } catch (e) {
        console.error("ERROR:", e);
    }
}

testParse();
