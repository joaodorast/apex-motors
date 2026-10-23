import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Picture } from './Picture';
import { canUseRichGraphics } from '../hooks/useMedia';

const NAME = ['APEX', 'ONE'];

/**
 * Hero cinematográfico: a luz revela o veículo, a tipografia sobe em sequência e a composição
 * ganha profundidade com parallax (cursor + rolagem). Tudo via transform/opacity em rAF.
 */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const dustRef = useRef<HTMLCanvasElement>(null);

  // Parallax por cursor e rolagem
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const fine = window.matchMedia('(pointer: fine)').matches;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let sy = -1;
    let raf = 0;
    let visible = true;
    let dust: { setMouse: (x: number, y: number) => void } | null = null;

    const tick = () => {
      raf = 0;
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      const p = Math.min(window.scrollY / Math.max(el.offsetHeight, 1), 1);
      if (p !== sy || Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001) {
        sy = p;
        el.style.setProperty('--mx', x.toFixed(4));
        el.style.setProperty('--my', y.toFixed(4));
        el.style.setProperty('--sp', p.toFixed(4));
        dust?.setMouse(x * 0.6, -y * 0.6);
      }
      if (visible && (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001)) raf = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      schedule();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    io.observe(el);
    window.addEventListener('scroll', schedule, { passive: true });
    if (fine) window.addEventListener('pointermove', onMove, { passive: true });
    schedule();

    // Poeira WebGL carregada sob demanda, depois da primeira pintura e só em dispositivos capazes
    let disposed = false;
    let cleanupDust: (() => void) | null = null;
    const startDust = async () => {
      if (disposed || !dustRef.current || window.innerWidth < 768 || !canUseRichGraphics()) return;
      const { HeroDust } = await import('../three/HeroDust');
      if (disposed || !dustRef.current) return;
      const d = new HeroDust(dustRef.current, window.innerWidth > 1600 ? 1100 : 800);
      dust = d;
      const vis = new IntersectionObserver(([en]) => (en.isIntersecting && !document.hidden ? d.start() : d.stop()));
      vis.observe(el);
      const onVis = () => (document.hidden ? d.stop() : d.start());
      document.addEventListener('visibilitychange', onVis);
      dustRef.current.classList.add('opacity-100');
      cleanupDust = () => {
        vis.disconnect();
        document.removeEventListener('visibilitychange', onVis);
        d.dispose();
      };
    };
    const hasIdle = 'requestIdleCallback' in window;
    const idleId = hasIdle ? window.requestIdleCallback(() => void startDust(), { timeout: 2500 }) : window.setTimeout(() => void startDust(), 1500);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('pointermove', onMove);
      if (hasIdle) window.cancelIdleCallback(idleId);
      else clearTimeout(idleId);
      cleanupDust?.();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="hero-title"
      className="grain relative isolate h-[100svh] min-h-[640px] overflow-hidden bg-ink [--mx:0] [--my:0] [--sp:0] md:min-h-[680px]"
    >
      {/* Camada da imagem */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          transform: 'translate3d(calc(var(--mx) * -14px), calc(var(--my) * -8px + var(--sp) * 14svh), 0) scale(calc(1 + var(--sp) * 0.08))',
          willChange: 'transform',
        }}
      >
        <div className="absolute left-1/2 top-[31%] aspect-[1376/768] w-[178vw] -translate-x-1/2 -translate-y-1/2 [mask-image:linear-gradient(180deg,transparent_0%,#000_14%,#000_72%,transparent_100%)] sm:top-[40%] sm:w-[140vw] md:inset-0 md:top-0 md:aspect-auto md:w-auto md:translate-x-0 md:translate-y-0 md:[mask-image:none]">
          <Picture
            name="apex-one-hero"
            alt="APEX ONE em estúdio escuro: carroceria em fibra de carbono com linhas de luz vermelhas refletidas no piso"
            priority
            placeholder={false}
            className="block h-full w-full"
            imgClassName="h-full w-full object-cover [object-position:50%_58%] md:scale-[1.16] lg:scale-[1.12] [animation:light-reveal_2.4s_var(--ease-apex)_both]"
          />
        </div>
        {/* Feixe de luz que acompanha o cursor */}
        <div
          className="pointer-events-none absolute inset-0 hidden mix-blend-screen md:block"
          style={{
            background:
              'radial-gradient(38vmax 30vmax at calc(50% + var(--mx) * 22%) calc(42% + var(--my) * 16%), rgb(197 201 206 / 0.09), transparent 70%)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Poeira no feixe (WebGL, opcional) */}
      <canvas ref={dustRef} className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-0 transition-opacity duration-[2000ms]" aria-hidden="true" />

      {/* Vinhetas para legibilidade */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(7_8_9/0.75)_0%,transparent_22%,transparent_52%,rgb(7_8_9/0.6)_74%,#070809_100%)] md:bg-[linear-gradient(180deg,rgb(7_8_9/0.6)_0%,transparent_26%,transparent_62%,rgb(7_8_9/0.55)_82%,#070809_100%)]"
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 -z-10 hidden w-1/3 bg-gradient-to-r from-ink/70 to-transparent md:block" aria-hidden="true" />

      <div
        className="container-x relative flex h-full flex-col pb-6 pt-20 md:pb-8 md:pt-28 lg:pt-32"
        style={{ opacity: 'calc(1 - var(--sp) * 1.6)', transform: 'translate3d(0, calc(var(--sp) * -6svh), 0)' }}
      >
        {/* Faixa superior: editorial + especificações */}
        <div className="flex items-start justify-between gap-8">
          <div className="max-w-md">
            <p className="eyebrow flex items-center gap-3 [animation:fade-in_1s_0.5s_both]">
              <span className="inline-block h-px w-8 origin-left bg-volt [animation:line-grow_1s_0.6s_var(--ease-apex)_both]" />
              Hipercarro elétrico conceitual
            </p>
            <p className="mt-5 hidden text-pretty text-lg leading-relaxed text-silver md:block lg:text-xl [animation:fade-in_1.2s_1s_both]">
              Carbono aparente, quatro motores e uma assinatura de luz que desenha o carro no escuro.
            </p>
            <div className="mt-8 hidden flex-wrap gap-3 md:flex [animation:fade-in_1s_1.2s_both]">
              <Link to="/modelos/one" className="btn btn-primary">
                Explorar o ONE <span className="arrow" aria-hidden="true">→</span>
              </Link>
              <Link to="/configurador?m=one" className="btn btn-ghost">
                Configurar
              </Link>
            </div>
          </div>

          <dl className="hidden min-w-56 lg:block" aria-label="Especificações conceituais (fictícias)">
            {[
              ['0–100 km/h', '1,9 s'],
              ['Potência', '1.420 kW'],
              ['Velocidade máx.', '412 km/h'],
            ].map(([k, v], i) => (
              <div key={k} className="relative flex items-baseline justify-between gap-8 py-3 [animation:fade-in_1s_both]" style={{ animationDelay: `${1.3 + i * 0.12}s` }}>
                <span
                  className="absolute inset-x-0 bottom-0 h-px origin-left bg-silver/20 [animation:line-grow_1.2s_var(--ease-apex)_both]"
                  style={{ animationDelay: `${1.2 + i * 0.12}s` }}
                />
                <dt className="micro text-mute">{k}</dt>
                <dd className="font-mono text-sm text-paper">{v}</dd>
              </div>
            ))}
            <p className="micro mt-3 text-right text-volt/80 [animation:fade-in_1s_1.7s_both]">Valores fictícios</p>
          </dl>
        </div>

        {/* Nome monumental */}
        <div className="mt-auto">
          <h1 id="hero-title" className="display relative text-[clamp(3.6rem,19.5vw,9rem)] sm:text-[min(15.2vw,16rem)]">
            <span className="sr-only">APEX ONE — hipercarro elétrico conceitual</span>
            <span aria-hidden="true" className="flex flex-col sm:flex-row sm:gap-[0.22em]">
              {NAME.map((word, w) => (
                <span key={word} className="block overflow-hidden pb-[0.04em]">
                  <span className="flex">
                    {word.split('').map((ch, i) => (
                      <span
                        key={i}
                        className="inline-block bg-gradient-to-b from-paper from-40% to-paper/25 bg-clip-text text-transparent [animation:rise_1.1s_var(--ease-apex)_both]"
                        style={{ animationDelay: `${0.55 + w * 0.18 + i * 0.05}s` }}
                      >
                        {ch}
                      </span>
                    ))}
                  </span>
                </span>
              ))}
            </span>
            {/* Varredura de luz sobre a tipografia */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-overlay">
              <span className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-transparent via-white/70 to-transparent [animation:sweep_1.8s_1.5s_var(--ease-sweep)_both]" />
            </span>
          </h1>

          {/* Mobile: editorial + CTAs abaixo do nome */}
          <div className="mt-5 md:hidden [animation:fade-in_1s_1.1s_both]">
            <p className="max-w-sm text-pretty text-base leading-relaxed text-silver">
              Carbono aparente, quatro motores e uma assinatura de luz que desenha o carro no escuro.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link to="/modelos/one" className="btn btn-primary px-3">
                Explorar
              </Link>
              <Link to="/configurador?m=one" className="btn btn-ghost px-3">
                Configurar
              </Link>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-6 border-t border-silver/15 pt-4 md:mt-4">
            <p className="micro text-mute">
              <span className="text-paper">01</span> / 04 &nbsp;·&nbsp; Linha APEX 2030
            </p>
            <a href="#manifesto" className="group micro flex items-center gap-3 text-silver hover:text-paper" aria-label="Rolar para o conteúdo">
              <span className="hidden sm:inline">Rolar</span>
              <span className="relative block h-9 w-px overflow-hidden bg-silver/20">
                <span className="absolute inset-x-0 top-0 h-1/2 bg-volt [animation:scroll-cue_2.2s_var(--ease-sweep)_infinite]" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
