const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const logoDir = 'C:\\Users\\adrian\\Desktop\\Castile\\Logo';
const publicDir = path.join(__dirname, 'public');

const files = [
    { name: '1c740ce1-6e2f-4f7d-b850-762155b51820.jfif', out: 'logo_qr_1.png' },
    { name: '8fd4685d-1356-4223-b9a3-7e26fbadfbc4.jfif', out: 'logo_qr_2.png' },
    { name: 'ff2cd254-5280-4c2d-881a-2548cedb1e67.jfif', out: 'logo_qr_3.png' }
];

async function convert() {
    for (const f of files) {
        const inPath = path.join(logoDir, f.name);
        const outPath = path.join(publicDir, f.out);
        try {
            console.log(`Converting ${inPath} -> ${outPath}...`);
            await sharp(inPath)
                .png()
                .toFile(outPath);
            console.log(`Successfully converted ${f.name} to ${f.out}`);
        } catch (err) {
            console.error(`Error converting ${f.name}:`, err);
        }
    }
}

convert();
