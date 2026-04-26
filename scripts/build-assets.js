#!/usr/bin/env node
/**
 * Render brand SVGs in assets/source/ to the PNG sizes Expo expects in
 * assets/images/. Idempotent — re-run any time you tweak the source SVGs.
 *
 *   icon.svg            -> images/icon.png            1024x1024 (iOS app icon)
 *   icon-foreground.svg -> images/adaptive-icon.png   1024x1024 (Android FG)
 *   splash.svg          -> images/splash.png          1284x2778 (Expo splash)
 *
 * No CLI flags. Sharp is a devDependency; install it once with
 *   npm install -D sharp
 * then run with `npm run build:assets`.
 */
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets', 'source');
const OUT = path.join(ROOT, 'assets', 'images');

const TARGETS = [
  { in: 'icon.svg',            out: 'icon.png',           width: 1024, height: 1024 },
  { in: 'icon-foreground.svg', out: 'adaptive-icon.png',  width: 1024, height: 1024 },
  { in: 'splash.svg',          out: 'splash.png',         width: 1284, height: 2778 },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const t of TARGETS) {
    const srcPath = path.join(SRC, t.in);
    const outPath = path.join(OUT, t.out);
    const buf = fs.readFileSync(srcPath);
    await sharp(buf, { density: 384 })
      .resize(t.width, t.height, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    const { size } = fs.statSync(outPath);
    console.log(`✓ ${t.out}  (${(size / 1024).toFixed(1)} KB)`);
  }
}

main().catch((err) => {
  console.error('build-assets failed:', err);
  process.exit(1);
});
