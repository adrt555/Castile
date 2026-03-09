const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        console.log("Navigating to Roca collections page...");
        await page.goto("https://rocatileusa.com/category/all", { waitUntil: 'networkidle2', timeout: 60000 });

        console.log("Scrolling to load all items...");
        let previousHeight = 0;
        let attempts = 0;
        while (attempts < 50) {
            previousHeight = await page.evaluate('document.body.scrollHeight');
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await new Promise(r => setTimeout(r, 1000));
            const newHeight = await page.evaluate('document.body.scrollHeight');
            if (newHeight === previousHeight) {
                // Try clicking "Load More" if it exists
                const loadMoreBtn = await page.$('.load-more, .ajax-load-more, a[href*="page/"]');
                if (loadMoreBtn) {
                    await loadMoreBtn.click().catch(() => { });
                    await new Promise(r => setTimeout(r, 2000));
                } else {
                    break;
                }
            }
            attempts++;
        }

        console.log("Extracting data...");
        const items = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('.elementor-post, article, .item, .collection, a[href*="/collections/"]')).map(el => {
                const titleEl = el.querySelector('.elementor-post__title, h2, h3, .collection-title') || el;
                const imgEl = el.querySelector('img');
                return {
                    name: titleEl.innerText ? titleEl.innerText.trim().toUpperCase() : '',
                    img: imgEl ? (imgEl.getAttribute('data-src') || imgEl.getAttribute('src')) : ''
                };
            }).filter(i => i.name && i.img);
        });

        console.log(`Extracted ${items.length} items.`);
        const mapping = {};
        for (const item of items) {
            mapping[item.name] = item.img;
        }

        fs.writeFileSync('roca_all_images.json', JSON.stringify(mapping, null, 2));
        console.log("Saved to roca_all_images.json");
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
})();
