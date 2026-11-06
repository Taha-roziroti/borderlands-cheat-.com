import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const dir = path.join(root, 'public', 'images', 'gameplay');

const placeholders = [
  {
    file: 'borderlands-3-cheats-gameplay-hero.png',
    width: 1200,
    height: 675,
    rgb: { r: 45, g: 28, b: 62 },
  },
  {
    file: 'borderlands-3-enemy-esp-showcase.png',
    width: 1200,
    height: 675,
    rgb: { r: 62, g: 32, b: 28 },
  },
  {
    file: 'borderlands-3-loot-esp-showcase.png',
    width: 1200,
    height: 675,
    rgb: { r: 28, g: 42, b: 55 },
  },
  {
    file: 'borderlands-3-soft-aim-showcase.png',
    width: 1200,
    height: 675,
    rgb: { r: 42, g: 48, b: 32 },
  },
];

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

for (const p of placeholders) {
  const outPath = path.join(dir, p.file);
  const webpPath = outPath.replace(/\.png$/i, '.webp');
  if (fs.existsSync(outPath) || fs.existsSync(webpPath)) continue;

  await sharp({
    create: {
      width: p.width,
      height: p.height,
      channels: 3,
      background: p.rgb,
    },
  })
    .png()
    .toFile(outPath);
  console.log(`Created placeholder ${path.relative(root, outPath)}`);
}
