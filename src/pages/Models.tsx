import { Link } from 'react-router-dom';
import { PageIntro } from '../components/Blocks';
import { Picture } from '../components/Picture';
import { Reveal } from '../components/Reveal';
import { MODELS } from '../data/models';
import { usePageMeta } from '../hooks/usePageMeta';

export default function Models() {
  usePageMeta('Modelos', 'Catálogo da linha conceitual APEX MOTORS: APEX ONE, SPECTRE, VELOCITY e EON. Quatro hipercarros elétricos fictícios com identidades distintas.');

  return (
    <>
      <PageIntro eyebrow="Catálogo · 04 modelos" title="A linha" light="APEX.">
        Quatro hipercarros elétricos conceituais. Uma mesma linguagem de luz e carbono, quatro temperamentos diferentes.
      </PageIntro>

      <div className="container-x">
        <ol className="flex flex-col">
          {MODELS.map((m, i) => {
            const flip = i % 2 === 1;
            return (
              <li key={m.slug} className="border-t border-silver/10 py-14 sm:py-20 lg:py-24">
                <article aria-labelledby={`m-${m.slug}`} className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
                  <Reveal
                    mode="mask"
                    className={`relative overflow-hidden lg:col-span-8 ${flip ? 'lg:order-2' : ''} ${i === 0 ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}
                  >
                    <Link to={`/modelos/${m.slug}`} className="group block h-full w-full" tabIndex={-1} aria-hidden="true">
                      <Picture
                        name={m.hero}
                        alt=""
                        sizes="(min-width: 1024px) 66vw, 100vw"
                        className="block h-full w-full"
                        imgClassName="h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-apex)] group-hover:scale-[1.04]"
                        imgStyle={{ objectPosition: m.heroPosition }}
                      />
                    </Link>
                    <span className="micro pointer-events-none absolute left-5 top-5 text-paper/80">{m.index} / 04</span>
                  </Reveal>

                  <div className={`lg:col-span-4 ${flip ? 'lg:order-1' : ''}`}>
                    <Reveal as="p" className="micro text-volt">
                      {m.category}
                    </Reveal>
                    <Reveal as="h2" delay={60} className="display mt-4 text-[clamp(2.2rem,9vw,4.6rem)] lg:text-[clamp(2.2rem,3.2vw,4.2rem)]">
                      <span id={`m-${m.slug}`}>
                        <span className="display-light text-silver">APEX</span>
                        <br />
                        {m.short}
                      </span>
                    </Reveal>
                    <Reveal as="p" delay={120} className="mt-6 leading-relaxed text-silver">
                      {m.intro}
                    </Reveal>
                    <Reveal delay={160}>
                      <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-silver/12 py-5">
                        {m.keySpecs.map((s) => (
                          <div key={s.label}>
                            <dt className="micro text-mute">{s.label}</dt>
                            <dd className="mt-2 font-mono text-lg text-paper">
                              {s.value}
                              {s.unit && <span className="ml-1 text-[0.65rem] text-silver">{s.unit}</span>}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      <p className="micro mt-3 text-mute">Valores fictícios</p>
                      <div className="mt-8 flex flex-wrap gap-3">
                        <Link to={`/modelos/${m.slug}`} className="btn btn-primary">
                          Conhecer <span className="sr-only">o {m.name}</span> <span className="arrow" aria-hidden="true">→</span>
                        </Link>
                        <Link to={`/configurador?m=${m.slug}`} className="btn btn-ghost">
                          Configurar <span className="sr-only">o {m.name}</span>
                        </Link>
                      </div>
                    </Reveal>
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
