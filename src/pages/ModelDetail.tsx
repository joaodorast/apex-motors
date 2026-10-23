import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SpecSheet } from '../components/Blocks';
import { Lightbox } from '../components/Lightbox';
import { Picture } from '../components/Picture';
import { Reveal } from '../components/Reveal';
import { MODELS, MODEL_BY_SLUG, isModelSlug } from '../data/models';
import { usePageMeta } from '../hooks/usePageMeta';
import NotFound from './NotFound';

export default function ModelDetail() {
  const { slug } = useParams();
  if (!isModelSlug(slug)) return <NotFound />;
  return <ModelView key={slug} slug={slug} />;
}

function ModelView({ slug }: { slug: keyof typeof MODEL_BY_SLUG }) {
  const m = MODEL_BY_SLUG[slug];
  const i = MODELS.indexOf(m);
  const next = MODELS[(i + 1) % MODELS.length];
  const [lightbox, setLightbox] = useState<number | null>(null);
  usePageMeta(m.name, `${m.name} — ${m.category}. ${m.tagline} Conceito fictício da APEX MOTORS com galeria, características e ficha técnica ilustrativa.`, `/img/${m.hero}-1080.webp`);

  const items = m.gallery.map((g) => ({ image: g.image, caption: g.caption, meta: m.name }));

  return (
    <>
      {/* Abertura */}
      <section aria-labelledby="model-title" className="relative isolate flex min-h-[88svh] flex-col justify-end overflow-hidden pb-12 pt-28 sm:min-h-[100svh] sm:pb-16">
        <div className="absolute inset-0 -z-10">
          <Picture
            name={m.hero}
            alt={`${m.name}: ${m.gallery[0].caption.toLowerCase()}`}
            priority
            placeholder={false}
            className="block h-full w-full"
            imgClassName="h-full w-full object-cover [animation:light-reveal_2s_var(--ease-apex)_both]"
            imgStyle={{ objectPosition: m.heroPosition }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_8_9/0.6)_0%,transparent_25%,transparent_50%,rgb(7_8_9/0.85)_85%,#070809_100%)]" />
        </div>
        <div className="container-x">
          <nav aria-label="Trilha" className="micro mb-6 text-silver [animation:fade-in_1s_.4s_both]">
            <Link to="/modelos" className="link-line hover:text-paper">
              Modelos
            </Link>
            <span className="mx-3 text-mute" aria-hidden="true">
              /
            </span>
            <span aria-current="page" className="text-paper">
              {m.short}
            </span>
          </nav>
          <p className="micro text-volt [animation:fade-in_1s_.5s_both]">
            {m.index} · {m.category}
          </p>
          <h1 id="model-title" className="display mt-4 text-[clamp(2.6rem,11.5vw,12rem)]">
            <span className="block overflow-hidden">
              <span className="block [animation:rise_1.1s_.5s_var(--ease-apex)_both]">
                <span className="display-light text-silver">APEX </span>
                {m.short}
              </span>
            </span>
          </h1>
          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between [animation:fade-in_1s_.9s_both]">
            <p className="max-w-xl text-xl leading-snug text-paper sm:text-2xl">{m.tagline}</p>
            <div className="flex flex-wrap gap-3">
              <Link to={`/configurador?m=${m.slug}`} className="btn btn-primary">
                Configurar <span className="arrow" aria-hidden="true">→</span>
              </Link>
              <a href="#ficha" className="btn btn-ghost">
                Ficha técnica
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Visão geral */}
      <section aria-label="Visão geral" className="container-x grid gap-12 py-24 sm:py-32 lg:grid-cols-12">
        <Reveal as="p" className="eyebrow lg:col-span-3">
          Visão geral
        </Reveal>
        <div className="lg:col-span-9">
          <Reveal as="p" mode="mask" className="text-balance text-[clamp(1.6rem,3.4vw,3rem)] font-light leading-[1.15] tracking-[-0.02em] [font-stretch:110%]">
            {m.intro}
          </Reveal>
          <div className="mt-12 grid gap-8 text-lg leading-relaxed text-silver md:grid-cols-2">
            {m.body.map((p, k) => (
              <Reveal as="p" key={k} delay={k * 100}>
                {p}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria do modelo */}
      <section aria-labelledby="g-title" className="container-x pb-24 sm:pb-32">
        <div className="mb-8 flex items-end justify-between gap-6">
          <h2 id="g-title" className="eyebrow text-paper">
            Galeria · {m.gallery.length} imagens
          </h2>
          <Link to="/galeria" className="micro link-line text-silver hover:text-paper">
            Galeria completa →
          </Link>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
          {m.gallery.map((g, k) => {
            const span = k === 0 ? 'col-span-2 lg:col-span-4 lg:row-span-2 aspect-[16/10] lg:aspect-auto' : k % 3 === 0 ? 'col-span-2 lg:col-span-2 aspect-[16/10]' : 'col-span-1 lg:col-span-2 aspect-square lg:aspect-[16/10]';
            return (
              <Reveal as="li" key={g.image} delay={(k % 3) * 80} className={`relative overflow-hidden bg-graphite ${span}`}>
                <button type="button" onClick={() => setLightbox(k)} className="group block h-full w-full text-left" aria-label={`Ampliar: ${g.caption}`}>
                  <Picture
                    name={g.image}
                    alt={g.caption}
                    sizes={k === 0 ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 33vw, 50vw'}
                    className="block h-full w-full"
                    imgClassName="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-4 pt-10 text-sm text-paper opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                    {g.caption}
                  </span>
                </button>
              </Reveal>
            );
          })}
        </ul>
      </section>

      {/* Características */}
      <section aria-labelledby="f-title" className="bg-graphite py-24 sm:py-32">
        <div className="container-x">
          <Reveal as="h2" className="display text-[clamp(1.55rem,6.6vw,4.4rem)]">
            <span id="f-title">Características</span> <span className="display-light text-silver">conceituais</span>
          </Reveal>
          <ol className="mt-14 grid gap-px bg-silver/10 sm:grid-cols-2 lg:grid-cols-4">
            {m.features.map((f, k) => (
              <Reveal as="li" key={f.title} delay={k * 90} className="bg-graphite p-6 pb-10 sm:p-8">
                <span className="micro text-volt">{String(k + 1).padStart(2, '0')}</span>
                <h3 className="mt-6 text-xl font-semibold leading-tight [font-stretch:112%]">{f.title}</h3>
                <p className="mt-4 leading-relaxed text-silver">{f.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Ficha técnica */}
      <section id="ficha" aria-label="Ficha técnica" className="container-x scroll-mt-24 py-24 sm:py-32">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal as="p" className="eyebrow">
              Ficha técnica
            </Reveal>
            <Reveal as="h2" delay={60} className="display mt-4 text-[clamp(1.55rem,7.4vw,3.6rem)]">
              {m.short}
              <br />
              <span className="display-light text-silver">em números.</span>
            </Reveal>
          </div>
          <Reveal delay={120} className="lg:col-span-8">
            <SpecSheet specs={m.specs} />
          </Reveal>
        </div>
      </section>

      {/* Próximo modelo */}
      <section aria-label="Próximo modelo" className="border-t border-silver/10">
        <Link to={`/modelos/${next.slug}`} className="group relative isolate block overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-40 transition-opacity duration-700 group-hover:opacity-70">
            <Picture name={next.hero} alt="" sizes="100vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" imgStyle={{ objectPosition: next.heroPosition }} />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/20" />
          </div>
          <div className="container-x flex items-end justify-between gap-6 py-20 sm:py-28">
            <div>
              <p className="micro text-silver">Próximo modelo · {next.index}</p>
              <p className="display mt-4 text-[clamp(2.4rem,8vw,7rem)]">{next.short}</p>
            </div>
            <span className="text-4xl transition-transform duration-500 group-hover:translate-x-2" aria-hidden="true">
              →
            </span>
          </div>
        </Link>
      </section>

      <Lightbox items={items} index={lightbox} onClose={() => setLightbox(null)} onIndex={setLightbox} />
    </>
  );
}
