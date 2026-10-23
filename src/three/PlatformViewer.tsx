import { useEffect, useRef, useState } from 'react';
import { Picture } from '../components/Picture';
import type { LayerId, PlatformScene } from './PlatformScene';

const LAYERS: { id: LayerId; label: string; text: string }[] = [
  { id: 'all', label: 'Visão geral', text: 'A plataforma conceitual completa: estrutura, bateria, motores, circuito térmico e fluxo de ar sobre o envelope da carroceria.' },
  { id: 'structure', label: 'Estrutura', text: 'Monocoque em fibra de carbono com subchassis dianteiro e traseiro e arco de proteção integrado ao habitáculo.' },
  { id: 'battery', label: 'Bateria', text: 'Módulos no assoalho formam um elemento estrutural: rigidez torcional extra e centro de gravidade muito baixo.' },
  { id: 'motors', label: 'Motores', text: 'Um motor por roda, alimentado por barramento de alta tensão, permite distribuir torque de forma independente.' },
  { id: 'thermal', label: 'Térmico', text: 'Um único circuito leva calor da bateria e dos motores aos radiadores dianteiros, com fluxo contínuo em uso intenso.' },
  { id: 'aero', label: 'Aerodinâmica', text: 'O ar acompanha o envelope da carroceria e sai pelo difusor traseiro, gerando carga sem asas expostas no ONE.' },
];

type Status = 'idle' | 'loading' | 'ready' | 'fallback';

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/** Visualizador 3D da plataforma, carregado sob demanda e pausado fora da tela. */
export function PlatformViewer() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PlatformScene | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [layer, setLayer] = useState<LayerId>('all');
  const [exploded, setExploded] = useState(false);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let disposed = false;
    let cleanup: (() => void) | null = null;

    const init = async () => {
      if (!webglAvailable()) {
        setStatus('fallback');
        return;
      }
      setStatus('loading');
      try {
        const { PlatformScene } = await import('./PlatformScene');
        if (disposed || !canvasRef.current || !labelRef.current) return;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const scene = new PlatformScene(canvasRef.current, labelRef.current, { reducedMotion: reduced, onInteract: () => setHint(false) });
        sceneRef.current = scene;
        let inView = false;
        const sync = () => (inView && !document.hidden ? scene.start() : scene.stop());
        const vis = new IntersectionObserver(
          ([e]) => {
            inView = e.isIntersecting;
            sync();
          },
          { threshold: 0.01 },
        );
        vis.observe(wrap);
        const onVis = sync;
        document.addEventListener('visibilitychange', onVis);
        cleanup = () => {
          vis.disconnect();
          document.removeEventListener('visibilitychange', onVis);
          scene.dispose();
          sceneRef.current = null;
        };
        setStatus('ready');
      } catch {
        if (!disposed) setStatus('fallback');
      }
    };

    // Só carrega o Three.js quando o visualizador se aproxima da viewport
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          near.disconnect();
          void init();
        }
      },
      { rootMargin: '300px 0px' },
    );
    near.observe(wrap);
    return () => {
      disposed = true;
      near.disconnect();
      cleanup?.();
    };
  }, []);

  useEffect(() => sceneRef.current?.setLayer(layer), [layer, status]);
  useEffect(() => sceneRef.current?.setExploded(exploded), [exploded, status]);

  const info = LAYERS.find((l) => l.id === layer)!;

  return (
    <div className="relative">
      <div ref={wrapRef} className="relative h-[68svh] min-h-[420px] overflow-hidden bg-ink md:h-[78svh] md:min-h-[560px]">
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full touch-pan-y transition-opacity duration-1000 ${status === 'ready' ? 'opacity-100' : 'opacity-0'}`}
          role="img"
          aria-label={`Diagrama 3D interativo da plataforma conceitual do APEX ONE — camada: ${info.label}. Arraste para girar.`}
        />
        <div ref={labelRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true" />

        {status !== 'ready' && status !== 'fallback' && (
          <div className="absolute inset-0 flex items-center justify-center" role="status">
            <span className="micro flex items-center gap-3 text-mute">
              <span className="h-px w-10 origin-left bg-volt [animation:line-grow_1.2s_var(--ease-sweep)_infinite_alternate]" />
              Carregando diagrama 3D
            </span>
          </div>
        )}
        {status === 'fallback' && (
          <div className="absolute inset-0">
            <Picture name="apex-one-rear" alt="Traseira do APEX ONE (alternativa estática ao diagrama 3D)" sizes="100vw" className="block h-full w-full" imgClassName="h-full w-full object-cover opacity-60" />
            <p className="micro absolute inset-x-0 bottom-24 px-6 text-center text-silver">Seu navegador não oferece WebGL. Exibindo uma alternativa estática.</p>
          </div>
        )}

        {status === 'ready' && hint && (
          <p className="micro pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 rounded-full bg-graphite/80 px-4 py-2 text-silver backdrop-blur [animation:fade-in_1s_1s_both]">
            Arraste para girar
          </p>
        )}
        <p className="micro pointer-events-none absolute right-4 top-5 hidden text-mute sm:block">Diagrama conceitual · fora de escala</p>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent" />
      </div>

      {/* Controles */}
      <div className="container-x relative -mt-14 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="min-w-0 lg:col-span-8">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Camadas do diagrama">
            {LAYERS.map((l) => (
              <button key={l.id} type="button" className="chip shrink-0 backdrop-blur aria-[pressed=false]:bg-ink/70" aria-pressed={layer === l.id} onClick={() => setLayer(l.id)}>
                {l.label}
              </button>
            ))}
            <button
              type="button"
              className="chip shrink-0 backdrop-blur aria-[pressed=false]:bg-ink/70"
              aria-pressed={exploded}
              onClick={() => setExploded((v) => !v)}
              disabled={status !== 'ready'}
            >
              {exploded ? 'Montar' : 'Vista explodida'}
            </button>
          </div>
        </div>
        <p className="min-h-[4.5rem] min-w-0 leading-relaxed text-silver lg:col-span-4" aria-live="polite">
          <span className="micro mb-2 block text-volt">{info.label}</span>
          {info.text}
        </p>
      </div>
    </div>
  );
}
