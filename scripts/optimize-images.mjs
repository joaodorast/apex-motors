// Gera variantes responsivas (AVIF + WebP) e placeholders LQIP a partir de assets-src/.
// Uso: node scripts/optimize-images.mjs
import sharp from 'sharp';
import { readdir, writeFile, mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'assets-src';
const OUT = 'public/img';
const PHOTOS = ['profile', 'apex-one-hero', 'apex-one-rear', 'spectre-rear', 'velocity-tunnel', 'eon-studio', 'interior', 'wheel'];
const STEPS = [480, 768, 1080, 1440, 1920];
// Recortes de detalhe derivados das referências (left, top, width, height em px da origem).
const CROPS = {
  'spectre-tail': ['spectre-rear', [150, 330, 600, 300]],
  'spectre-wheel': ['spectre-rear', [660, 440, 320, 320]],
  'velocity-light': ['velocity-tunnel', [1250, 380, 600, 260]],
  'velocity-wheel': ['velocity-tunnel', [420, 330, 360, 390]],
  'velocity-wing': ['velocity-tunnel', [180, 150, 440, 210]],
  'eon-light': ['eon-studio', [1280, 470, 520, 210]],
  'eon-wheel': ['eon-studio', [920, 500, 310, 320]],
  'one-lightbar': ['apex-one-rear', [240, 420, 800, 220]],
};

await mkdir(OUT, { recursive: true });
const manifest = {};

for (const name of PHOTOS) {
  const input = path.join(SRC, `${name}.png`);
  const meta = await sharp(input).metadata();
  const widths = STEPS.filter((w) => w < meta.width).concat(meta.width);
  for (const w of widths) {
    const pipe = sharp(input).resize({ width: w });
    await pipe.clone().avif({ quality: 52, effort: 4 }).toFile(path.join(OUT, `${name}-${w}.avif`));
    await pipe.clone().webp({ quality: 78, effort: 6 }).toFile(path.join(OUT, `${name}-${w}.webp`));
  }
  const lqip = await sharp(input).resize({ width: 24 }).blur(1).webp({ quality: 40 }).toBuffer();
  manifest[name] = {
    width: meta.width,
    height: meta.height,
    widths,
    lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
  };
}

for (const [name, [src, [left, top, width, height]]] of Object.entries(CROPS)) {
  const input = path.join(SRC, `${src}.png`);
  const base = () => sharp(input).extract({ left, top, width, height });
  const widths = [480].filter((w) => w < width).concat(width);
  for (const w of widths) {
    await base().resize({ width: w }).avif({ quality: 56, effort: 4 }).toFile(path.join(OUT, `${name}-${w}.avif`));
    await base().resize({ width: w }).webp({ quality: 80, effort: 6 }).toFile(path.join(OUT, `${name}-${w}.webp`));
  }
  const lqip = await base().resize({ width: 24 }).blur(1).webp({ quality: 40 }).toBuffer();
  manifest[name] = { width, height, widths, lqip: `data:image/webp;base64,${lqip.toString('base64')}` };
}

// Recursos do configurador: perfil com alpha + máscaras (lossless).
await sharp(path.join(SRC, 'profile.png')).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(path.join(OUT, 'profile.webp'));
await sharp(path.join(SRC, 'profile-masks.png')).png({ compressionLevel: 9, palette: false }).toFile(path.join(OUT, 'profile-masks.png'));
await sharp(path.join(SRC, 'interior.png')).resize({ width: 1600 }).webp({ quality: 82 }).toFile(path.join(OUT, 'interior-1600.webp'));
await sharp(path.join(SRC, 'interior-mask.png')).extractChannel(0).png({ compressionLevel: 9 }).toFile(path.join(OUT, 'interior-mask.png'));
// Imagem social (Open Graph)
await sharp(path.join(SRC, 'apex-one-hero.png')).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 82, mozjpeg: true }).toFile('public/og-image.jpg');

const ts = `// Arquivo gerado por scripts/optimize-images.mjs — não editar manualmente.\nexport const imageManifest = ${JSON.stringify(manifest, null, 2)} as const;\n\nexport type ImageName = keyof typeof imageManifest;\n`;
await writeFile('src/data/images.gen.ts', ts);
console.log('ok', Object.keys(manifest).length, 'imagens');
