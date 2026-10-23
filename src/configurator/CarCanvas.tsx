import { useEffect, useRef, useState } from 'react';
import type { CarConfig, InteriorId } from './options';
import { INTERIOR, PROFILE, renderCar, renderInterior } from './renderer';

const CROP = { x: 64, y: 218, w: 1248, h: 344 };

interface CarCanvasProps {
  config: CarConfig;
  className?: string;
  label: string;
}

/** Visualização de perfil recolorida em tempo real. */
export function CarCanvas({ config, className = '', label }: CarCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const seq = useRef(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      setStatus('error');
      return;
    }
    const id = ++seq.current;
    // Renderiza fora do canvas visível e só aplica o resultado mais recente
    const off = document.createElement('canvas');
    off.width = PROFILE.width;
    off.height = PROFILE.height;
    const octx = off.getContext('2d');
    if (!octx) return;
    renderCar(octx, config)
      .then(() => {
        if (id !== seq.current) return;
        ctx.clearRect(0, 0, PROFILE.width, PROFILE.height);
        ctx.drawImage(off, 0, 0);
        setStatus('ready');
        setFlash((f) => f + 1);
      })
      .catch(() => id === seq.current && setStatus('error'));
  }, [config]);

  return (
    <div className={`relative ${className}`}>
      {/* Recorte ao redor do veículo (a fotografia tem margens transparentes amplas) */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: `${CROP.w} / ${CROP.h}` }}>
        <canvas
          ref={ref}
          width={PROFILE.width}
          height={PROFILE.height}
          role="img"
          aria-label={label}
          className={`absolute max-w-none transition-opacity duration-500 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
          style={{
            width: `${(PROFILE.width / CROP.w) * 100}%`,
            left: `${(-CROP.x / CROP.w) * 100}%`,
            top: `${(-CROP.y / CROP.h) * 100}%`,
          }}
        />
      </div>
      {/* Brilho de transição a cada alteração */}
      {flash > 1 && (
        <span
          key={flash}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-overlay"
        >
          <span className="absolute inset-y-[15%] left-0 w-1/5 bg-gradient-to-r from-transparent via-white/50 to-transparent [animation:sweep_0.9s_var(--ease-sweep)_both]" />
        </span>
      )}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center" role="status">
          <span className="micro text-mute">Preparando visualização…</span>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center" role="alert">
          
          <span className="micro absolute bottom-2 text-volt">Não foi possível gerar a pré-visualização neste navegador.</span>
        </div>
      )}
    </div>
  );
}

export function InteriorCanvas({ interior, className = '', label }: { interior: InteriorId; className?: string; label: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const seq = useRef(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const ctx = ref.current?.getContext('2d');
    if (!ctx) return;
    const id = ++seq.current;
    const off = document.createElement('canvas');
    off.width = INTERIOR.width;
    off.height = INTERIOR.height;
    const octx = off.getContext('2d');
    if (!octx) return;
    renderInterior(octx, interior)
      .then(() => {
        if (id !== seq.current) return;
        ctx.drawImage(off, 0, 0);
        setReady(true);
      })
      .catch(() => setReady(false));
  }, [interior]);
  return (
    <canvas
      ref={ref}
      width={INTERIOR.width}
      height={INTERIOR.height}
      role="img"
      aria-label={label}
      className={`block h-auto w-full bg-graphite transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'} ${className}`}
    />
  );
}
