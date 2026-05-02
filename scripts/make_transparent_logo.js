const sharp = require('sharp');
const path = require('path');

const input = path.join(__dirname, '../public/new_castile_logo.png');
const output = path.join(__dirname, '../public/castile_logo_transparent.png');

console.log('Reading:', input);

sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
    .then(({ data, info }) => {
        const { width, height } = info;
        console.log(`Image: ${width}x${height}, channels: ${info.channels}`);

        for (let i = 0; i < width * height; i++) {
            const r = data[i * 4];
            const g = data[i * 4 + 1];
            const b = data[i * 4 + 2];
            // Make near-black pixels transparent (threshold: brightness < 40)
            const brightness = (r + g + b) / 3;
            if (brightness < 40) {
                data[i * 4 + 3] = 0; // transparent
            }
        }

        return sharp(data, { raw: { width, height, channels: 4 } })
            .png()
            .toFile(output);
    })
    .then(() => {
        console.log('Saved to:', output);
    })
    .catch(err => {
        console.error('Error:', err.message);
    });
