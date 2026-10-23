import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MODELS } from '../data/models';
import { Picture } from './Picture';
import { Reveal } from './Reveal';

/** Índice interativo da linha: lista tipográfica que controla um palco de imagem (desktop). */
export function ModelIndex() {
  const [active, setActive] = useState(0);
  const model = MODELS[active];

  return (
    <section aria-labelledby="linha-title" className="relative py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Reveal as="p" className="eyebrow">
              A linha
            </Reveal>
            <Reveal as="h2" delay={80} className="display mt-4 text-[clamp(1.9rem,7vw,6.5rem)]">
              <span id="linha-title">Quatro leituras</span>
              <br />
              <span className="display-light text-silver">de velocidade.</span>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <Link to="/modelos" className="btn btn-ghost">
              Ver catálogo completo <span className="arrow" aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>

        {/* Desktop: lista + palco */}
        <div className="mt-16 hidden gap-10 lg:grid lg:grid-cols-12">
          <ul className="col-span-5 flex flex-col justify-center" aria-label="Modelos">
            {MODELS.map((m, i) => (
              <li key={m.slug} className="border-t border-silver/12 last:border-b">
                <Link
                  to={`/modelos/${m.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group flex items-center gap-6 py-7"
                  aria-describedby={`cat-${m.slug}`}
                >
                  <span className={`micro w-8 transition-colors ${active === i ? 'text-volt' : 'text-mute'}`}>{m.index}</span>
                  <span className="flex-1">
                    <span
                      className={`display block text-[clamp(2rem,3.6vw,3.6rem)] transition-[color,transform] duration-500 ${
                        active === i ? 'translate-x-2 text-paper' : 'text-paper/35'
                      }`}
                    >
                      {m.short}
                    </span>
                    <span id={`cat-${m.slug}`} className={`micro mt-2 block transition-colors ${active === i ? 'text-silver' : 'text-mute/70'}`}>
                      {m.category}
                    </span>
                  </span>
                  <span className={`text-xl transition-all duration-500 ${active === i ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'}`} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="relative col-span-7 aspect-[16/11] overflow-hidden bg-graphite">
            {MODELS.map((m, i) => (
              <div
                key={m.slug}
                className="absolute inset-0 transition-[opacity,transform] duration-[1100ms] ease-[var(--ease-apex)]"
                style={{ opacity: active === i ? 1 : 0, transform: active === i ? 'scale(1)' : 'scale(1.05)' }}
                aria-hidden={active !== i}
              >
                <Picture
                  name={m.hero}
                  alt=""
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="block h-full w-full"
                  imgClassName="h-full w-full object-cover"
                  imgStyle={{ objectPosition: m.heroPosition }}
                />
              </div>
            ))}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-8">
              <p className="max-w-sm text-lg leading-snug text-paper" aria-live="polite">
                {model.tagline}
              </p>
              <dl className="flex gap-8">
                {model.keySpecs.map((s) => (
                  <div key={s.label}>
                    <dt className="micro text-mute">{s.label}</dt>
                    <dd className="mt-1 font-mono text-xl text-paper">
                      {s.value}
                      {s.unit && <span className="ml-1 text-xs text-silver">{s.unit}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <span className="micro absolute right-6 top-6 text-volt/90">Valores fictícios</span>
          </div>
        </div>

        {/* Mobile / tablet: painéis empilhados */}
        <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:hidden">
          {MODELS.map((m, i) => (
            <Reveal as="li" key={m.slug} delay={(i % 2) * 90}>
              <Link to={`/modelos/${m.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-graphite">
                  <Picture
                    name={m.hero}
                    alt={`${m.name} — ${m.category}`}
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="block h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    imgStyle={{ objectPosition: m.heroPosition }}
                  />
                  <span className="micro absolute left-4 top-4 text-paper">{m.index}</span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="display text-3xl">{m.short}</h3>
                    <p className="micro mt-2 text-mute">{m.category}</p>
                  </div>
                  <span className="mt-1 text-xl text-silver transition-transform group-hover:translate-x-1" aria-hidden="true">
                    →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
