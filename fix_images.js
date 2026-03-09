const fs = require('fs');
const files = ['src/app/page.tsx', 'src/app/products/page.tsx', 'src/app/products/[id]/page.tsx', 'src/app/cart/page.tsx'];

files.forEach(f => {
    try {
        let s = fs.readFileSync(f, 'utf8');
        s = s.replace(/https:\/\/images\.unsplash\.com\/photo-[^"']+/g, (match, idx) => 'https://picsum.photos/seed/castile' + Math.floor(Math.random() * 1000) + '/1000/1000');
        fs.writeFileSync(f, s);
        console.log(`Updated ${f}`);
    } catch (e) {
        console.error(`Error processing ${f}:`, e);
    }
});
