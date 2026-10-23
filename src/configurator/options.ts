import type { ModelSlug } from '../data/models';

export type PaintId = 'obsidian' | 'titanium' | 'ceramic' | 'crimson' | 'midnight' | 'graphite';
export type FinishId = 'gloss' | 'matte' | 'metallic';
export type WheelId = 'aero' | 'turbine' | 'blade' | 'forged';
export type WheelFinishId = 'black' | 'graphite' | 'silver' | 'carbon';
export type CaliperId = 'red' | 'black' | 'silver';
export type AccentId = 'red' | 'silver';
export type InteriorId = 'black' | 'black-red' | 'grey';

export interface CarConfig {
  model: ModelSlug;
  paint: PaintId;
  finish: FinishId;
  wheel: WheelId;
  wheelFinish: WheelFinishId;
  caliper: CaliperId;
  accent: AccentId;
  carbon: boolean;
  interior: InteriorId;
}

export interface Option<T extends string> {
  id: T;
  name: string;
  code: string;
  note?: string;
}

export interface PaintOption extends Option<PaintId> {
  /** Cor de exibição da amostra */
  swatch: string;
  /** Cor base usada na renderização (sRGB 0–255) */
  rgb: [number, number, number];
}

export const PAINTS: PaintOption[] = [
  { id: 'obsidian', name: 'Obsidian Black', code: 'OB', swatch: '#0d0e10', rgb: [16, 17, 20] },
  { id: 'titanium', name: 'Titanium Silver', code: 'TS', swatch: '#a3a8ae', rgb: [150, 155, 162] },
  { id: 'ceramic', name: 'Ceramic White', code: 'CW', swatch: '#ecebe7', rgb: [236, 235, 230] },
  { id: 'crimson', name: 'Crimson Red', code: 'CR', swatch: '#a3111f', rgb: [160, 14, 30] },
  { id: 'midnight', name: 'Midnight Blue', code: 'MB', swatch: '#14203f', rgb: [18, 30, 66] },
  { id: 'graphite', name: 'Graphite Grey', code: 'GG', swatch: '#3c4046', rgb: [58, 62, 68] },
];

export const FINISHES: Option<FinishId>[] = [
  { id: 'gloss', name: 'Brilhante', code: 'G', note: 'Verniz de alto brilho com reflexos nítidos' },
  { id: 'matte', name: 'Fosco', code: 'M', note: 'Acetinado profundo, sem reflexos especulares' },
  { id: 'metallic', name: 'Metálico', code: 'X', note: 'Pigmento metálico com contraste acentuado' },
];

export const WHEELS: Option<WheelId>[] = [
  { id: 'aero', name: 'Aero V5', code: 'A5', note: 'Cinco raios duplos' },
  { id: 'turbine', name: 'Turbine', code: 'TB', note: 'Lâminas em espiral' },
  { id: 'blade', name: 'Monoblade 7', code: 'B7', note: 'Sete raios finos forjados' },
  { id: 'forged', name: 'Forged Y', code: 'FY', note: 'Raios em Y facetados' },
];

export const WHEEL_FINISHES: (Option<WheelFinishId> & { swatch: string })[] = [
  { id: 'black', name: 'Preto brilhante', code: 'K', swatch: '#141518' },
  { id: 'graphite', name: 'Grafite acetinado', code: 'G', swatch: '#4a4f56' },
  { id: 'silver', name: 'Prata polido', code: 'S', swatch: '#c9cdd2' },
  { id: 'carbon', name: 'Fibra de carbono', code: 'C', swatch: '#26292d' },
];

export const CALIPERS: (Option<CaliperId> & { swatch: string })[] = [
  { id: 'red', name: 'Vermelho', code: 'R', swatch: '#e0182e' },
  { id: 'black', name: 'Preto', code: 'K', swatch: '#151618' },
  { id: 'silver', name: 'Prata', code: 'S', swatch: '#b9bec4' },
];

export const ACCENTS: (Option<AccentId> & { swatch: string })[] = [
  { id: 'red', name: 'Linhas vermelhas', code: 'R', swatch: '#ff3048' },
  { id: 'silver', name: 'Linhas prateadas', code: 'S', swatch: '#d6dade' },
];

export const INTERIORS: (Option<InteriorId> & { swatch: [string, string] })[] = [
  { id: 'black', name: 'Preto minimalista', code: 'BK', swatch: ['#0b0c0e', '#3a3d42'], note: 'Alcantara preta, luz ambiente branca e discreta' },
  { id: 'black-red', name: 'Preto com detalhes vermelhos', code: 'BR', swatch: ['#0b0c0e', '#ff3048'], note: 'Alcantara preta e iluminação vermelha integrada' },
  { id: 'grey', name: 'Cinza premium', code: 'GR', swatch: ['#5c5f63', '#c9cdd2'], note: 'Revestimentos cinza claro e luz ambiente quente' },
];

export function findOption<T extends string, O extends Option<T>>(list: O[], id: T): O {
  return list.find((o) => o.id === id) ?? list[0];
}
