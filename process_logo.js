const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'logo.png');
const outputPath = path.join(__dirname, 'public', 'logo_transparent.png');

async function makeTransparent() {
    try {
        // We want to make the black background transparent.
        // Sharp's composite or extract operations can be complex for simple color keying,
        // so we'll manipulate the raw pixel data.
        const { data, info } = await sharp(inputPath)
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        // Loop through pixels. If it's pure/dark black, make it transparent.
        // The logo has a black background #000000.
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Threshold for "black"
            if (r < 15 && g < 15 && b < 15) {
                data[i + 3] = 0; // Alpha = 0 (transparent)
            }
        }

        await sharp(data, {
            raw: {
                width: info.width,
                height: info.height,
                channels: 4
            }
        })
            .png()
            .toFile(outputPath);

        console.log('Successfully created transparent logo!');
    } catch (err) {
        console.error('Error processing image:', err);
    }
}

makeTransparent();
