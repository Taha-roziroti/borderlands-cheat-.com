import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

/**
 * Build fixed 1200×630 JPEG Open Graph images under public/og/ (Facebook/LinkedIn best practice).
 * Source: first-party hero/key art WebP in public/images/gameplay.
 */
const root = process.cwd();
const outDir = path.join(root, 'public', 'og');
const source = path.join(root, 'public', 'images', 'gameplay', 'borderlands-3-key-art-hero.webp');

async function writeJpeg(filename) {
  if (!fs.existsSync(source)) {
    console.error(`generate-seo-assets: missing source ${path.relative(root, source)}`);
    process.exit(1);
  }
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outPath = path.join(outDir, filename);
  await sharp(source)
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outPath);
  const meta = await sharp(outPath).metadata();
  console.log(`Wrote ${path.relative(root, outPath)} (${meta.width}×${meta.height})`);
}

await writeJpeg('default.jpg');
