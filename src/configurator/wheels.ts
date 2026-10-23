import type { CaliperId, WheelFinishId, WheelId } from './options';

/**
 * Gera rodas vetoriais (SVG) para o configurador. viewBox centrado em 0,0 com raio externo 100
 * (equivale ao aro visível na fotografia de perfil).
 */

const FINISH: Record<WheelFinishId, { hi: string; mid: string; lo: string; edge: string }> = {
  black: { hi: '#3a3d42', mid: '#16171a', lo: '#08090a', edge: '#6b7078' },
  graphite: { hi: '#858b93', mid: '#4b5057', lo: '#2a2d32', edge: '#a9aeb5' },
  silver: { hi: '#f4f6f8', mid: '#b9bec5', lo: '#6d737b', edge: '#ffffff' },
  carbon: { hi: '#3d4147', mid: '#1f2124', lo: '#0c0d0f', edge: '#7d838b' },
};

const CALIPER: Record<CaliperId, { hi: string; lo: string }> = {
  red: { hi: '#ff4a5c', lo: '#9e0b1c' },
  black: { hi: '#3b3e43', lo: '#0c0d0f' },
  silver: { hi: '#eef0f2', lo: '#80868e' },
};

const rad = (d: number) => (d * Math.PI) / 180;
const pt = (r: number, a: number) => `${(r * Math.cos(rad(a))).toFixed(2)},${(r * Math.sin(rad(a))).toFixed(2)}`;

/** Raio reto afunilado entre r0 e r1, com meia-largura w0/w1 (em graus convertidos para arco). */
function spoke(angle: number, r0: number, r1: number, w0: number, w1: number) {
  const a0 = (w0 / r0) * (180 / Math.PI);
  const a1 = (w1 / r1) * (180 / Math.PI);
  return `M${pt(r0, angle - a0)} L${pt(r1, angle - a1)} L${pt(r1, angle + a1)} L${pt(r0, angle + a0)} Z`;
}

function designPaths(design: WheelId, rot: number): string {
  const parts: string[] = [];
  switch (design) {
    case 'aero': {
      for (let i = 0; i < 5; i++) {
        const a = rot + i * 72;
        parts.push(spoke(a - 7, 20, 93, 5.5, 7.5), spoke(a + 7, 20, 93, 5.5, 7.5));
      }
      break;
    }
    case 'blade': {
      for (let i = 0; i < 7; i++) parts.push(spoke(rot + i * (360 / 7), 18, 93, 4.6, 6.4));
      break;
    }
    case 'forged': {
      for (let i = 0; i < 6; i++) {
        const a = rot + i * 60;
        parts.push(spoke(a, 18, 58, 6, 6));
        parts.push(`M${pt(56, a - 6)} L${pt(93, a - 19)} L${pt(93, a - 11)} L${pt(60, a + 1)} Z`);
        parts.push(`M${pt(56, a + 6)} L${pt(93, a + 19)} L${pt(93, a + 11)} L${pt(60, a - 1)} Z`);
      }
      break;
    }
    case 'turbine': {
      const n = 10;
      for (let i = 0; i < n; i++) {
        const a = rot + i * (360 / n);
        // Lâmina curva: borda de ataque e de fuga em curvas quadráticas
        parts.push(
          `M${pt(19, a - 6)} Q${pt(60, a + 4)} ${pt(94, a + 38)} L${pt(94, a + 50)} Q${pt(58, a + 22)} ${pt(19, a + 10)} Z`,
        );
      }
      break;
    }
  }
  return parts.join(' ');
}

function carbonPattern(id: string) {
  return `<pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="6" height="6" fill="#141517"/>
    <rect width="3" height="3" fill="#2c2f34"/>
    <rect x="3" y="3" width="3" height="3" fill="#2c2f34"/>
  </pattern>`;
}

export function wheelSvg(design: WheelId, finish: WheelFinishId, caliper: CaliperId, opts: { caliperAngle: number; rotation: number }): string {
  const f = FINISH[finish];
  const c = CALIPER[caliper];
  const spokes = designPaths(design, opts.rotation);
  const ca = opts.caliperAngle;
  const fill = finish === 'carbon' ? 'url(#cf)' : 'url(#sp)';

  // Furos do disco ventilado
  const holes: string[] = [];
  for (let ring = 0; ring < 3; ring++) {
    const r = 50 + ring * 9;
    for (let i = 0; i < 24; i++) holes.push(`<circle cx="${(r * Math.cos(rad(i * 15 + ring * 5))).toFixed(1)}" cy="${(r * Math.sin(rad(i * 15 + ring * 5))).toFixed(1)}" r="1.6"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-100 -100 200 200" width="400" height="400">
  <defs>
    <radialGradient id="disc" cx="0" cy="0" r="80" gradientUnits="userSpaceOnUse">
      <stop offset="0.3" stop-color="#25282c"/><stop offset="0.75" stop-color="#4a4e55"/><stop offset="1" stop-color="#33363b"/>
    </radialGradient>
    <linearGradient id="sp" x1="-1" y1="-1" x2="1" y2="1" gradientUnits="objectBoundingBox">
      <stop offset="0" stop-color="${f.hi}"/><stop offset="0.5" stop-color="${f.mid}"/><stop offset="1" stop-color="${f.lo}"/>
    </linearGradient>
    <linearGradient id="cal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c.hi}"/><stop offset="1" stop-color="${c.lo}"/>
    </linearGradient>
    <radialGradient id="barrel" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
      <stop offset="0.86" stop-color="#050506"/><stop offset="0.93" stop-color="${f.lo}"/><stop offset="0.975" stop-color="${f.hi}"/><stop offset="1" stop-color="${f.mid}"/>
    </radialGradient>
    <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="0.45" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    ${carbonPattern('cf')}
    <filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#000" flood-opacity="0.75"/></filter>
  </defs>
  <circle r="100" fill="url(#barrel)"/>
  <circle r="80" fill="url(#disc)"/>
  <g fill="#141517">${holes.join('')}</g>
  <circle r="40" fill="#2b2e33"/>
  <path d="M${pt(46, ca - 30)} A46 46 0 0 1 ${pt(46, ca + 30)} L${pt(76, ca + 26)} A76 76 0 0 0 ${pt(76, ca - 26)} Z" fill="url(#cal)" stroke="#000" stroke-opacity="0.35" stroke-width="0.8"/>
  <text transform="translate(${pt(63, ca)}) rotate(${ca + 90})" font-family="Arial, sans-serif" font-weight="700" font-size="6.5" letter-spacing="1" text-anchor="middle" dominant-baseline="middle" fill="${caliper === 'silver' ? '#1a1b1e' : '#f4f5f6'}" fill-opacity="0.85">APEX</text>
  <g filter="url(#sh)">
    <path d="${spokes}" fill="${fill}" stroke="${f.edge}" stroke-opacity="0.45" stroke-width="0.7" stroke-linejoin="round"/>
    <circle r="22" fill="${fill}" stroke="${f.edge}" stroke-opacity="0.5" stroke-width="0.8"/>
  </g>
  <circle r="12" fill="#0b0c0e" stroke="#4a4e55" stroke-width="0.8"/>
  <path d="M-5.2 4.2 0 -5.4 5.2 4.2" fill="none" stroke="#f4f5f6" stroke-width="1.3"/>
  <rect x="-2.4" y="1" width="4.8" height="1.1" fill="#ff3048"/>
  <circle r="99.4" fill="none" stroke="${f.edge}" stroke-opacity="0.55" stroke-width="1.2"/>
  <circle r="100" fill="url(#gloss)" opacity="${finish === 'black' || finish === 'carbon' ? 0.9 : 0.6}"/>
</svg>`;
}

export function svgToImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}
