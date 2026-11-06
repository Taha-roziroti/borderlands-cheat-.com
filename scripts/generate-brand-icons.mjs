import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Raster favicons + touch icon from `public/brand/favicon-source.png`.
 * Center-crop to square (wide banners → Vault mark in the middle).
 */
const root = process.cwd();
const publicDir = path.join(root, 'public');
const sourcePng = path.join(publicDir, 'brand', 'favicon-source.png');

if (!fs.existsSync(sourcePng)) {
  console.error(`generate-brand-icons: missing ${path.relative(root, sourcePng)}`);
  process.exit(1);
}

const base = sharp(sourcePng).rotate().resize(512, 512, { fit: 'cover', position: 'centre' });

await base.clone().resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
await base.clone().resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32.png'));
await base.clone().resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16.png'));
/** .ico here is 32×32 PNG bytes (same pattern as before; browsers accept it). */
await base.clone().resize(32, 32).png().toFile(path.join(publicDir, 'favicon.ico'));

console.log(
  'Brand icons generated from brand/favicon-source.png: apple-touch-icon.png, favicon.ico, favicon-16/32.png',
);
