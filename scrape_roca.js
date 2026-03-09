const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

const collections = [
    "ABACO", "ABBEY", "ALASKA", "ARTESANO", "ATLAS", "AURA", "AVALON", "AVENUE",
    "BALTIC", "BAR TILE", "BIANCO VENATINO", "BLOCK", "BOHEME", "BRICKELL",
    "CALACATA GOLD", "CALYPSO", "CARVE", "CASABLANCA", "CC COSMOS", "FRAMES",
    "MOSAICS", "COLOR COLLECTION", "CRYSTAL", "DERBY", "DOWNTOWN", "ESSENCE",
    "EVERGLADE", "FLOW", "JOY", "HAVANA", "JEWELS", "JUNE", "LAGOM", "LASSA",
    "NORDICO", "ONYX", "STATUARY", "LITHOLOGY EDITION", "LIVERPOOL", "MAIOLICA",
    "NOLITA", "PAVERS", "20MM", "PRO", "PRO MAX", "SLABS", "XL SLABS",
    "ZELLIGE", "ZEN", "ZEN STONE"
];

const results = {};

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    for (const collection of collections) {
        try {
            const query = encodeURIComponent(collection);
            const searchUrl = `https://rocatileusa.com/?s=${query}&post_type=product`;
            console.log(`Searching for: ${collection}`);

            await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

            // Wait for results
            await page.waitForSelector('.products .product, .no-results', { timeout: 10000 }).catch(() => { });

            const image = await page.evaluate(() => {
                const img = document.querySelector('.products .product img');
                return img ? (img.getAttribute('src') || img.getAttribute('data-src')) : null;
            });

            if (image) {
                console.log(`✅ Found image for ${collection}: ${image}`);
                results[collection] = { image };
            } else {
                console.log(`❌ No image found for ${collection}`);
                results[collection] = { image: null };
            }

        } catch (error) {
            console.error(`Error processing ${collection}: ${error.message}`);
            results[collection] = { image: null };
        }
    }

    fs.writeFileSync('roca_images.json', JSON.stringify(results, null, 2));
    console.log('Saved to roca_images.json');
    await browser.close();
})();
