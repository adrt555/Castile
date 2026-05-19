const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lib', 'crmProducts.ts');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('sellingPricePerSqft: number; // Castile retail (cost × 1.25)', 'sellingPricePerSqft: number; // Castile retail (50% margin)');

content = content.replace(/costPricePerSqft:([\d.]+),\s*sellingPricePerSqft:([\d.]+)/g, (match, costStr) => {
    const cost = parseFloat(costStr);
    // True 50% margin = Cost / (1 - 0.50) = Cost * 2
    const selling = (cost / 0.5).toFixed(2);
    return `costPricePerSqft:${costStr}, sellingPricePerSqft:${Number(selling)}`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated crmProducts.ts with new margin.');
