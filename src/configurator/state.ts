import { useCallback, useEffect, useMemo, useState } from 'react';
import { MODEL_BY_SLUG, isModelSlug, type ModelSlug } from '../data/models';
import {
  ACCENTS,
  CALIPERS,
  FINISHES,
  INTERIORS,
  PAINTS,
  WHEELS,
  WHEEL_FINISHES,
  findOption,
  type CarConfig,
} from './options';

const STORAGE_KEY = 'apex.configurator.v1';

interface Stored {
  current: ModelSlug;
  byModel: Partial<Record<ModelSlug, CarConfig>>;
}

export function defaultConfig(model: ModelSlug): CarConfig {
  return { model, ...MODEL_BY_SLUG[model].defaults };
}

const has = <T extends string>(list: { id: T }[], v: unknown): v is T => typeof v === 'string' && list.some((o) => o.id === v);

/** Valida um objeto qualquer e devolve uma configuração segura. */
export function sanitize(raw: Partial<Record<keyof CarConfig, unknown>>, fallbackModel: ModelSlug = 'one'): CarConfig {
  const model = isModelSlug(raw.model) ? raw.model : fallbackModel;
  const d = defaultConfig(model);
  return {
    model,
    paint: has(PAINTS, raw.paint) ? raw.paint : d.paint,
    finish: has(FINISHES, raw.finish) ? raw.finish : d.finish,
    wheel: has(WHEELS, raw.wheel) ? raw.wheel : d.wheel,
    wheelFinish: has(WHEEL_FINISHES, raw.wheelFinish) ? raw.wheelFinish : d.wheelFinish,
    caliper: has(CALIPERS, raw.caliper) ? raw.caliper : d.caliper,
    accent: has(ACCENTS, raw.accent) ? raw.accent : d.accent,
    carbon: typeof raw.carbon === 'boolean' ? raw.carbon : d.carbon,
    interior: has(INTERIORS, raw.interior) ? raw.interior : d.interior,
  };
}

function readStorage(): Stored | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    if (!parsed || !isModelSlug(parsed.current)) return null;
    const byModel: Stored['byModel'] = {};
    for (const [k, v] of Object.entries(parsed.byModel ?? {})) {
      if (isModelSlug(k) && v && typeof v === 'object') byModel[k] = sanitize({ ...(v as object), model: k }, k);
    }
    return { current: parsed.current, byModel };
  } catch {
    return null;
  }
}

function writeStorage(s: Stored) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* armazenamento indisponível (modo privado etc.) — segue em memória */
  }
}

const PARAMS: [keyof CarConfig, string][] = [
  ['model', 'm'],
  ['paint', 'p'],
  ['finish', 'f'],
  ['wheel', 'w'],
  ['wheelFinish', 'wf'],
  ['caliper', 'c'],
  ['accent', 'a'],
  ['carbon', 'cf'],
  ['interior', 'i'],
];

export function toSearch(c: CarConfig): string {
  const sp = new URLSearchParams();
  for (const [key, short] of PARAMS) {
    const v = c[key];
    sp.set(short, typeof v === 'boolean' ? (v ? '1' : '0') : v);
  }
  return sp.toString();
}

export function fromSearch(search: string): { model: ModelSlug | null; full: CarConfig | null } {
  const sp = new URLSearchParams(search);
  const m = sp.get('m');
  const model = isModelSlug(m) ? m : null;
  if (!model || !sp.has('p')) return { model, full: null };
  const raw: Partial<Record<keyof CarConfig, unknown>> = {};
  for (const [key, short] of PARAMS) {
    const v = sp.get(short);
    if (v === null) continue;
    raw[key] = key === 'carbon' ? v === '1' : v;
  }
  return { model, full: sanitize(raw, model) };
}

export function configCode(c: CarConfig): string {
  const model = MODEL_BY_SLUG[c.model];
  return [
    'APX',
    model.short.slice(0, 3),
    findOption(PAINTS, c.paint).code + findOption(FINISHES, c.finish).code,
    findOption(WHEELS, c.wheel).code + findOption(WHEEL_FINISHES, c.wheelFinish).code,
    findOption(CALIPERS, c.caliper).code + findOption(ACCENTS, c.accent).code + (c.carbon ? 'C' : 'N'),
    findOption(INTERIORS, c.interior).code,
  ].join('-');
}

export function summaryLines(c: CarConfig): [string, string][] {
  return [
    ['Modelo', MODEL_BY_SLUG[c.model].name],
    ['Pintura', findOption(PAINTS, c.paint).name],
    ['Acabamento', findOption(FINISHES, c.finish).name],
    ['Rodas', findOption(WHEELS, c.wheel).name],
    ['Acabamento das rodas', findOption(WHEEL_FINISHES, c.wheelFinish).name],
    ['Pinças de freio', findOption(CALIPERS, c.caliper).name],
    ['Detalhes', findOption(ACCENTS, c.accent).name],
    ['Pacote em carbono', c.carbon ? 'Incluído' : 'Não incluído'],
    ['Interior', findOption(INTERIORS, c.interior).name],
  ];
}

export function summaryText(c: CarConfig, url: string): string {
  const lines = summaryLines(c).map(([k, v]) => `${k}: ${v}`);
  return [`APEX MOTORS — Configuração ${configCode(c)}`, ...lines, '', `Ver configuração: ${url}`, '(Projeto conceitual fictício)'].join('\n');
}

/** Estado do configurador com persistência em localStorage e sincronização com a URL. */
export function useConfigurator(search: string) {
  const [state, setState] = useState<Stored>(() => {
    const stored = readStorage();
    const fromUrl = fromSearch(search);
    const base: Stored = stored ?? { current: 'one', byModel: {} };
    if (fromUrl.full) {
      return { current: fromUrl.full.model, byModel: { ...base.byModel, [fromUrl.full.model]: fromUrl.full } };
    }
    if (fromUrl.model) return { ...base, current: fromUrl.model };
    return base;
  });

  const config = useMemo(() => state.byModel[state.current] ?? defaultConfig(state.current), [state]);

  useEffect(() => {
    writeStorage(state);
  }, [state]);

  const update = useCallback(<K extends keyof CarConfig>(key: K, value: CarConfig[K]) => {
    setState((s) => {
      const current = s.byModel[s.current] ?? defaultConfig(s.current);
      return { ...s, byModel: { ...s.byModel, [s.current]: { ...current, [key]: value } } };
    });
  }, []);

  const setModel = useCallback((model: ModelSlug) => setState((s) => ({ ...s, current: model })), []);

  const reset = useCallback(() => {
    setState((s) => {
      const byModel = { ...s.byModel };
      delete byModel[s.current];
      return { ...s, byModel };
    });
  }, []);

  const isDefault = useMemo(() => {
    const d = defaultConfig(config.model);
    return (Object.keys(d) as (keyof CarConfig)[]).every((k) => d[k] === config[k]);
  }, [config]);

  return { config, update, setModel, reset, isDefault };
}
