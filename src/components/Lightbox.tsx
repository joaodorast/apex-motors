import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ImageName } from '../data/images.gen';
import { imageManifest } from '../data/images.gen';
import { srcSet } from './Picture';

export interface LightboxItem {
  image: ImageName;
  caption: string;
  meta?: string;
}

interface Props {
  items: LightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}

/** Visualização ampliada acessível: teclado (← → Esc), toque (deslizar), foco preso e restaurado. */
export function Lightbox({ items, index, onClose, onIndex }: Props) {
  const open = index !== null && items.length > 0;
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [loaded, setLoaded] = useState(false);

  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      setLoaded(false);
      onIndex((index + d + items.length) % items.length);
    },
    [index, items.length, onIndex],
  );

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.documentElement.style.overflow = prev;
      returnFocus.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab' && dialogRef.current) {
        const f = [...dialogRef.current.querySelectorAll<HTMLElement>('button')];
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && i === f.length - 1) {
          e.preventDefault();
          f[0].focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go, onClose]);

  // Pré-carrega vizinhas
  useEffect(() => {
    if (index === null) return;
    for (const d of [1, -1]) {
      const it = items[(index + d + items.length) % items.length];
      const m = imageManifest[it.image];
      const img = new Image();
      img.src = `/img/${it.image}-${m.widths[m.widths.length - 1]}.webp`;
    }
  }, [index, items]);

  if (!open || index === null) return null;
  const item = items[index];
  const m = imageManifest[item.image];

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Imagem ${index + 1} de ${items.length}: ${item.caption}`}
      className="fixed inset-0 z-[80] flex flex-col bg-ink/97 backdrop-blur-md [animation:fade-in_.35s_both]"
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        if (!touch.current) return;
        const dx = e.changedTouches[0].clientX - touch.current.x;
        const dy = e.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) onClose();
        touch.current = null;
      }}
    >
      <div className="container-x flex h-16 shrink-0 items-center justify-between">
        <p className="micro text-silver" aria-live="polite">
          <span className="text-paper">{String(index + 1).padStart(2, '0')}</span> / {String(items.length).padStart(2, '0')}
        </p>
        <button ref={closeRef} type="button" onClick={onClose} className="micro -mr-3 flex h-12 items-center gap-3 px-3 text-paper" aria-label="Fechar visualização">
          Fechar
          <span aria-hidden="true" className="relative block h-4 w-4">
            <span className="absolute left-0 top-1/2 h-px w-4 rotate-45 bg-paper" />
            <span className="absolute left-0 top-1/2 h-px w-4 -rotate-45 bg-paper" />
          </span>
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <picture key={item.image} className="relative flex max-h-full max-w-full items-center justify-center">
          <source type="image/avif" srcSet={srcSet(item.image, 'avif')} sizes="100vw" />
          <source type="image/webp" srcSet={srcSet(item.image, 'webp')} sizes="100vw" />
          <img
            src={`/img/${item.image}-${m.widths[m.widths.length - 1]}.webp`}
            alt={item.caption}
            width={m.width}
            height={m.height}
            onLoad={() => setLoaded(true)}
            className={`max-h-[calc(100svh-11rem)] w-auto max-w-full object-contain transition-[opacity,transform] duration-500 ${loaded ? 'scale-100 opacity-100' : 'scale-[0.985] opacity-0'}`}
            style={{ backgroundImage: `url(${m.lqip})`, backgroundSize: 'cover' }}
          />
        </picture>
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center text-2xl text-paper ring-1 ring-silver/25 transition hover:bg-paper/10 sm:flex"
              aria-label="Imagem anterior"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 hidden h-14 w-14 -translate-y-1/2 items-center justify-center text-2xl text-paper ring-1 ring-silver/25 transition hover:bg-paper/10 sm:flex"
              aria-label="Próxima imagem"
            >
              →
            </button>
          </>
        )}
      </div>

      <div className="container-x flex shrink-0 items-center justify-between gap-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
        <div className="min-w-0">
          <p className="truncate text-paper">{item.caption}</p>
          {item.meta && <p className="micro mt-1 text-mute">{item.meta}</p>}
        </div>
        {items.length > 1 && (
          <div className="flex gap-2 sm:hidden">
            <button type="button" onClick={() => go(-1)} className="flex h-12 w-12 items-center justify-center ring-1 ring-silver/25" aria-label="Imagem anterior">
              ←
            </button>
            <button type="button" onClick={() => go(1)} className="flex h-12 w-12 items-center justify-center ring-1 ring-silver/25" aria-label="Próxima imagem">
              →
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
