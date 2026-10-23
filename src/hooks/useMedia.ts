import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string, server = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => server,
  );
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');

/** Heurística conservadora para decidir se vale a pena ativar efeitos WebGL. */
export function canUseRichGraphics(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  if (nav.connection?.saveData) return false;
  if (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4) return false;
  if ((navigator.hardwareConcurrency ?? 8) < 4) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
