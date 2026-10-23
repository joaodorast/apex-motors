import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from '../components/Hero';
import { ModelIndex } from '../components/ModelIndex';
import { Picture } from '../components/Picture';
import { Reveal } from '../components/Reveal';
import { usePageMeta } from '../hooks/usePageMeta';

const ConfigTeaser = lazy(() => import('../components/ConfigTeaser'));

function InView({ children, minHeight }: { children: React.ReactNode; minHeight: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setShow(true), { rootMargin: '400px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ minHeight: show ? undefined : minHeight }}>
      {show && children}
    </div>
  );
}

const PILLARS = [
  { n: '01', t: 'Luz como estrutura', d: 'As linhas luminosas seguem arestas reais da carroceria — revelam a forma em vez de decorá-la.' },
  { n: '02', t: 'Massa no lugar certo', d: 'Bateria estrutural no assoalho e motores junto às rodas: centro de gravidade baixo e neutro.' },
  { n: '03', t: 'Silêncio que acelera', d: 'Arquitetura elétrica de alta tensão pensada para entrega de torque instantânea e progressiva.' },
];

export default function Home() {
  usePageMeta('', 'APEX MOTORS: marca fictícia de hipercarros elétricos conceituais. Conheça o APEX ONE, SPECTRE, VELOCITY e EON e configure o seu.');

  return (
    <>
      <Hero />

      {/* Manifesto */}
      <section id="manifesto" aria-labelledby="manifesto-title" className="relative scroll-mt-0 py-24 sm:py-36">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <Reveal as="p" className="eyebrow lg:col-span-3">
            Manifesto
          </Reveal>
          <div className="lg:col-span-9">
            <Reveal as="h2" mode="mask" className="text-balance text-[clamp(1.9rem,4.6vw,4.4rem)] font-light leading-[1.06] tracking-[-0.025em] [font-stretch:110%]">
              <span id="manifesto-title">
                Um hipercarro elétrico não precisa imitar o passado. <span className="text-mute">Ele precisa de uma nova linguagem — feita de</span>{' '}
                <span className="text-volt">luz</span>, <span className="text-paper">carbono</span>{' '}
                <span className="text-mute">e</span> silêncio.
              </span>
            </Reveal>
            <div className="mt-16 grid gap-10 sm:grid-cols-3">
              {PILLARS.map((p, i) => (
                <Reveal key={p.n} delay={i * 110} className="border-t border-silver/15 pt-6">
                  <p className="micro text-volt">{p.n}</p>
                  <h3 className="mt-4 text-xl font-semibold [font-stretch:115%]">{p.t}</h3>
                  <p className="mt-3 leading-relaxed text-silver">{p.d}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ModelIndex />

      {/* Engenharia — teaser com diagrama */}
      <section aria-labelledby="eng-title" className="relative overflow-hidden bg-graphite py-24 sm:py-32">
        <div className="container-x grid items-center gap-14 lg:grid-cols-12">
          <div className="relative lg:col-span-7">
            <Reveal mode="mask" className="relative aspect-square overflow-hidden sm:aspect-[5/4]">
              <Picture
                name="apex-one-rear"
                alt="Traseira do APEX ONE com barra de luz vermelha contínua e difusor em fibra de carbono"
                sizes="(min-width: 1024px) 56vw, 100vw"
                className="block h-full w-full"
                imgClassName="h-full w-full object-cover [object-position:50%_45%]"
              />
              {/* Anotações técnicas */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
                <g stroke="#F4F5F6" strokeOpacity="0.55" strokeWidth="0.15" fill="none" vectorEffect="non-scaling-stroke">
                  <path d="M50 40 L50 14 L72 14" vectorEffect="non-scaling-stroke" />
                  <path d="M30 60 L14 74 L8 74" vectorEffect="non-scaling-stroke" />
                  <path d="M66 62 L84 80 L92 80" vectorEffect="non-scaling-stroke" />
                </g>
                <g fill="#FF3048">
                  <circle cx="50" cy="40" r="0.7" />
                  <circle cx="30" cy="60" r="0.7" />
                  <circle cx="66" cy="62" r="0.7" />
                </g>
              </svg>
              <span className="micro absolute left-[52%] top-[10%] text-paper sm:left-[73%] sm:top-[12%]">Barra de luz contínua</span>
              <span className="micro absolute left-[3%] top-[76%] text-paper">Difusor de 6 canais</span>
              <span className="micro absolute right-[3%] top-[82%] text-right text-paper">Monocoque em carbono</span>
            </Reveal>
          </div>
          <div className="lg:col-span-5">
            <Reveal as="p" className="eyebrow">
              Engenharia
            </Reveal>
            <Reveal as="h2" delay={80} className="display mt-4 text-[clamp(2.2rem,4vw,4.2rem)]">
              <span id="eng-title">Forma que</span>
              <br />
              <span className="display-light text-silver">obedece ao ar.</span>
            </Reveal>
            <Reveal as="p" delay={160} className="mt-8 max-w-md text-lg leading-relaxed text-silver">
              Explore a arquitetura conceitual do APEX ONE em 3D interativo: bateria estrutural, quatro motores, circuito térmico e fluxo aerodinâmico.
            </Reveal>
            <Reveal delay={220} className="mt-10">
              <Link to="/engenharia" className="btn btn-primary">
                Abrir a engenharia <span className="arrow" aria-hidden="true">→</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Atelier: interior e materiais */}
      <section aria-labelledby="atelier-title" className="py-24 sm:py-32">
        <div className="container-x">
          <div className="grid gap-6 md:grid-cols-12 md:gap-8">
            <div className="md:col-span-8">
              <Reveal mode="mask" className="aspect-[16/10] overflow-hidden">
                <Picture
                  name="interior"
                  alt="Cockpit APEX com volante tipo yoke em carbono, bancos em alcantara e linhas de luz vermelha"
                  sizes="(min-width: 768px) 66vw, 100vw"
                  className="block h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </Reveal>
            </div>
            <div className="flex flex-col justify-between gap-8 md:col-span-4">
              <div>
                <Reveal as="p" className="eyebrow">
                  Atelier
                </Reveal>
                <Reveal as="h2" delay={80} className="display mt-4 text-[clamp(2rem,2.9vw,3.2rem)]">
                  <span id="atelier-title">Feito à mão,</span>
                  <br />
                  <span className="display-light text-silver">lido pela luz.</span>
                </Reveal>
                <Reveal as="p" delay={140} className="mt-6 leading-relaxed text-silver">
                  Alcantara, carbono forjado e metal usinado. A iluminação interna segue as mesmas linhas da carroceria — o carro é um só desenho, por dentro e por fora.
                </Reveal>
              </div>
              <Reveal mode="mask" delay={120} className="aspect-square overflow-hidden">
                <Picture
                  name="wheel"
                  alt="Roda forjada escura com disco de freio ventilado e pinça vermelha, ao lado de painel em fibra de carbono"
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="block h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <InView minHeight="80svh">
        <Suspense fallback={<div style={{ minHeight: '80svh' }} />}>
          <ConfigTeaser />
        </Suspense>
      </InView>

      {/* Chamada final */}
      <section aria-labelledby="cta-title" className="relative overflow-hidden py-28 sm:py-40">
        <div className="absolute inset-0 -z-10">
          <Picture
            name="eon-studio"
            alt=""
            sizes="100vw"
            className="block h-full w-full"
            imgClassName="h-full w-full object-cover opacity-45 [object-position:50%_60%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/40 to-ink" />
        </div>
        <div className="container-x text-center">
          <Reveal as="p" className="eyebrow">
            Contato
          </Reveal>
          <Reveal as="h2" delay={80} className="display mx-auto mt-6 max-w-5xl text-[clamp(2.4rem,7vw,7rem)]">
            <span id="cta-title">Converse com o atelier</span>
          </Reveal>
          <Reveal delay={160} className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/contato" className="btn btn-primary">
              Falar com a APEX <span className="arrow" aria-hidden="true">→</span>
            </Link>
            <Link to="/galeria" className="btn btn-ghost">
              Ver galeria
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
