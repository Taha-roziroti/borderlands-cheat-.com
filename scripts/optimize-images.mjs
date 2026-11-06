import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { spawnSync } from 'node:child_process';

const root = process.cwd();

spawnSync(process.execPath, [path.join(root, 'scripts', 'generate-bl3-placeholders.mjs')], {
  stdio: 'inherit',
});
const widths = [320, 400, 512, 640, 960];
const dirs = ['public/images/gameplay'];

async function optimizeDir(relativeDir) {
  const dir = path.join(root, relativeDir);
  if (!fs.existsSync(dir)) return;

  /** Source rasters (PNG or WebP). Skip already-generated `-{width}.webp` derivatives. */
  const candidates = fs
    .readdirSync(dir)
    .filter((file) => /\.(png|webp)$/i.test(file) && !/-\d+\.webp$/i.test(file));

  /** If both `name.png` and `name.webp` exist, prefer WebP as the resize source. */
  const byBase = new Map();
  for (const file of candidates) {
    const base = file.replace(/\.(png|webp)$/i, '');
    const prev = byBase.get(base);
    if (!prev || /\.webp$/i.test(file)) {
      byBase.set(base, file);
    }
  }

  for (const file of byBase.values()) {
    const input = path.join(dir, file);
    const base = file.replace(/\.(png|webp)$/i, '');

    for (const width of widths) {
      const output = path.join(dir, `${base}-${width}.webp`);
      await sharp(input)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(output);
      console.log(`Wrote ${path.relative(root, output)}`);
    }
  }
}

for (const dir of dirs) {
  await optimizeDir(dir);
}

console.log('Image optimization complete.');
