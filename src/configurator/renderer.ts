import { ACCENTS, PAINTS, findOption, type CarConfig, type FinishId, type InteriorId } from './options';
import { svgToImage, wheelSvg } from './wheels';

/**
 * Renderizador 2D do configurador.
 * Não existe modelo 3D do veículo: a visualização recolore, pixel a pixel, a fotografia de perfil
 * enviada como referência, usando máscaras pré-calculadas (carroceria, linhas de luz e apliques
 * inferiores). As rodas são vetoriais e redesenhadas sobre o aro original.
 */

export const PROFILE = { width: 1376, height: 768 } as const;
const WHEELS = [
  { cx: 320, cy: 440, caliper: 8, rotation: 12 },
  { cx: 1104, cy: 440, caliper: 172, rotation: 37 },
];
const RIM_R = 82;

interface ProfileData {
  base: Uint8ClampedArray;
  lum: Uint8Array;
  body: Uint8Array;
  line: Uint8Array;
  trim: Uint8Array;
}

let profilePromise: Promise<ProfileData> | null = null;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    img.src = src;
  });
}

function pixels(img: HTMLImageElement): Uint8ClampedArray {
  const c = document.createElement('canvas');
  c.width = PROFILE.width;
  c.height = PROFILE.height;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D indisponível');
  ctx.drawImage(img, 0, 0, PROFILE.width, PROFILE.height);
  return ctx.getImageData(0, 0, PROFILE.width, PROFILE.height).data;
}

export function loadProfile(): Promise<ProfileData> {
  if (!profilePromise) {
    profilePromise = Promise.all([loadImage('/img/profile.webp'), loadImage('/img/profile-masks.png')]).then(([p, m]) => {
      const base = pixels(p);
      const masks = pixels(m);
      const n = PROFILE.width * PROFILE.height;
      const lum = new Uint8Array(n);
      const body = new Uint8Array(n);
      const line = new Uint8Array(n);
      const trim = new Uint8Array(n);
      for (let i = 0, j = 0; i < n; i++, j += 4) {
        lum[i] = (base[j] * 0.299 + base[j + 1] * 0.587 + base[j + 2] * 0.114) | 0;
        body[i] = masks[j];
        line[i] = masks[j + 1];
        trim[i] = masks[j + 2];
      }
      return { base, lum, body, line, trim };
    });
    profilePromise.catch(() => {
      profilePromise = null;
    });
  }
  return profilePromise;
}

const toLin = (v: number) => Math.pow(v / 255, 2.2);
const toSrgb = (v: number) => Math.round(Math.pow(Math.min(Math.max(v, 0), 1), 1 / 2.2) * 255);

const FINISH_PARAMS: Record<FinishId, { contrast: number; reflect: number; spec: number; lift: number; flake: number }> = {
  gloss: { contrast: 1.25, reflect: 0.16, spec: 1.0, lift: 0, flake: 0 },
  metallic: { contrast: 1.75, reflect: 0.14, spec: 0.6, lift: 0, flake: 0.022 },
  matte: { contrast: 0.62, reflect: 0.035, spec: 0, lift: 0.01, flake: 0 },
};

/** Tabela de cor por luminância (256 níveis × RGB) para a pintura escolhida. */
function paintLut(rgb: [number, number, number], finish: FinishId): Uint8ClampedArray {
  const p = FINISH_PARAMS[finish];
  const C = rgb.map(toLin);
  const lut = new Uint8ClampedArray(256 * 3);
  for (let l = 0; l < 256; l++) {
    const L = l / 255;
    const shade = Math.pow(Math.min(L / 0.8, 2), p.contrast);
    const refl = p.reflect * Math.pow(L, 4);
    const s = Math.min(Math.max((L - 0.84) / 0.12, 0), 1);
    const spec = s * s * p.spec;
    for (let k = 0; k < 3; k++) {
      let v = C[k] * shade + refl + spec;
      if (finish === 'matte') v = v * 0.92 + p.lift;
      lut[l * 3 + k] = toSrgb(v);
    }
  }
  return lut;
}

export async function renderCar(ctx: CanvasRenderingContext2D, config: CarConfig): Promise<void> {
  const data = await loadProfile();
  const paint = findOption(PAINTS, config.paint);
  const lut = paintLut(paint.rgb, config.finish);
  const flake = FINISH_PARAMS[config.finish].flake;
  const accent = findOption(ACCENTS, config.accent).id;
  const { width: W, height: H } = PROFILE;
  const out = new ImageData(W, H);
  const o = out.data;
  const { base, lum, body, line, trim } = data;
  let seed = 1337;

  for (let i = 0, j = 0, n = W * H; i < n; i++, j += 4) {
    const a = base[j + 3];
    if (a === 0) continue;
    let r = base[j];
    let g = base[j + 1];
    let b = base[j + 2];
    const L = lum[i];

    const bm = body[i];
    if (bm) {
      const t = bm / 255;
      let pr = lut[L * 3];
      let pg = lut[L * 3 + 1];
      let pb = lut[L * 3 + 2];
      if (flake) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        const f = 1 + ((seed / 0x7fffffff) - 0.5) * flake * 2;
        pr *= f;
        pg *= f;
        pb *= f;
      }
      r = r + (pr - r) * t;
      g = g + (pg - g) * t;
      b = b + (pb - b) * t;
    }

    const lm = line[i];
    if (lm && accent === 'silver') {
      const t = lm / 255;
      const v = Math.max(base[j], 140) / 255; // intensidade da linha original
      const sr = 214 * v + 30;
      const sg = 219 * v + 30;
      const sb = 224 * v + 32;
      r = r + (sr - r) * t;
      g = g + (sg - g) * t;
      b = b + (sb - b) * t;
    }

    const tm = trim[i];
    if (tm) {
      const t = tm / 255;
      let tr: number;
      let tg: number;
      let tb: number;
      if (config.carbon) {
        const x = i % W;
        const y = (i / W) | 0;
        const weave = (((x + y) >> 2) + ((x - y + 4096) >> 2)) & 1;
        const v = L * (weave ? 0.95 : 0.62) * 0.75 + 6;
        tr = v * 0.96;
        tg = v;
        tb = v * 1.08;
      } else {
        tr = L * 0.45;
        tg = L * 0.46;
        tb = L * 0.48;
      }
      r = r + (tr - r) * t;
      g = g + (tg - g) * t;
      b = b + (tb - b) * t;
    }

    o[j] = r;
    o[j + 1] = g;
    o[j + 2] = b;
    o[j + 3] = a;
  }

  // Rodas vetoriais (geradas antes de tocar no canvas visível para evitar cintilação)
  const wheelImgs = await Promise.all(
    WHEELS.map((w) => svgToImage(wheelSvg(config.wheel, config.wheelFinish, config.caliper, { caliperAngle: w.caliper, rotation: w.rotation }))),
  );

  ctx.clearRect(0, 0, W, H);
  ctx.putImageData(out, 0, 0);
  WHEELS.forEach((w, k) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(w.cx, w.cy, RIM_R, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(wheelImgs[k], w.cx - RIM_R, w.cy - RIM_R, RIM_R * 2, RIM_R * 2);
    ctx.restore();
  });
}

/* ---------------- Interior ---------------- */

export const INTERIOR = { width: 1600, height: 907 } as const;

interface InteriorData {
  base: Uint8ClampedArray;
  mask: Uint8Array;
}
let interiorPromise: Promise<InteriorData> | null = null;

export function loadInterior(): Promise<InteriorData> {
  if (!interiorPromise) {
    interiorPromise = Promise.all([loadImage('/img/interior-1600.webp'), loadImage('/img/interior-mask.png')]).then(([img, m]) => {
      const c = document.createElement('canvas');
      c.width = INTERIOR.width;
      c.height = INTERIOR.height;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas 2D indisponível');
      ctx.drawImage(img, 0, 0, INTERIOR.width, INTERIOR.height);
      const base = ctx.getImageData(0, 0, INTERIOR.width, INTERIOR.height).data;
      ctx.clearRect(0, 0, INTERIOR.width, INTERIOR.height);
      ctx.drawImage(m, 0, 0, INTERIOR.width, INTERIOR.height);
      const md = ctx.getImageData(0, 0, INTERIOR.width, INTERIOR.height).data;
      const mask = new Uint8Array(INTERIOR.width * INTERIOR.height);
      for (let i = 0, j = 0; i < mask.length; i++, j += 4) mask[i] = md[j];
      return { base, mask };
    });
    interiorPromise.catch(() => {
      interiorPromise = null;
    });
  }
  return interiorPromise;
}

export async function renderInterior(ctx: CanvasRenderingContext2D, id: InteriorId): Promise<void> {
  const { base, mask } = await loadInterior();
  const out = new ImageData(INTERIOR.width, INTERIOR.height);
  const o = out.data;
  for (let i = 0, j = 0; i < mask.length; i++, j += 4) {
    let r = base[j];
    let g = base[j + 1];
    let b = base[j + 2];
    const t = mask[i] / 255;
    if (id === 'black' && t > 0) {
      // Luz ambiente branca fria e discreta no lugar do vermelho
      const v = r * 0.62;
      r = r + (v * 0.92 - r) * t;
      g = g + (v * 0.97 - g) * t;
      b = b + (v - b) * t;
    } else if (id === 'grey') {
      // Revestimentos clareados em cinza (só abaixo da linha do painel) e luz ambiente quente
      const y = (i / INTERIOR.width) / INTERIOR.height;
      const wy = Math.min(Math.max((y - 0.3) / 0.16, 0), 1);
      const L = r * 0.299 + g * 0.587 + b * 0.114;
      const lifted = L + (34 + L * 1.75 - L) * wy;
      const cr = lifted * 1.0;
      const cg = lifted * 0.99;
      const cb = lifted * 0.97;
      const lr = r * 0.95;
      const lg = r * 0.66;
      const lb = r * 0.42;
      r = cr + (lr - cr) * t;
      g = cg + (lg - cg) * t;
      b = cb + (lb - cb) * t;
    }
    o[j] = r;
    o[j + 1] = g;
    o[j + 2] = b;
    o[j + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);
}
