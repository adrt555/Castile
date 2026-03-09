const fs = require('fs');
const data = fs.readFileSync('roca_home.html', 'utf8');
const abbey = data.match(/abbey/ig);
console.log('Abbey found:', !!abbey);
const block = data.match(/block/ig);
console.log('Block found:', !!block);
const regex = /https:\/\/rocatileusa\.com\/[^\"]+/g;
const links = data.match(regex) || [];
console.log('Unique Links:', [...new Set(links)].slice(0, 50));
