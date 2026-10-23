import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CarCanvas } from '../configurator/CarCanvas';
import { PAINTS, type PaintId } from '../configurator/options';
import { defaultConfig, toSearch } from '../configurator/state';
import { Reveal } from './Reveal';

export default function ConfigTeaser() {
  const [paint, setPaint] = useState<PaintId>('obsidian');
  const config = useMemo(() => ({ ...defaultConfig('one'), paint, finish: 'gloss' as const }), [paint]);
  const current = PAINTS.find((p) => p.id === paint)!;

  return (
    <section aria-labelledby="teaser-title" className="relative overflow-hidden border-y border-silver/10 bg-[radial-gradient(70%_60%_at_50%_45%,#1b1f25_0%,#070809_75%)] py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <Reveal as="p" className="eyebrow">
              Configurador
            </Reveal>
            <Reveal as="h2" delay={80} className="display mt-4 text-[clamp(2.2rem,6vw,5.6rem)]">
              <span id="teaser-title">Seu, em</span> <span className="display-light text-silver">seis tons.</span>
            </Reveal>
          </div>
          <Reveal as="p" delay={140} className="max-w-sm leading-relaxed text-silver">
            Escolha uma pintura e veja a carroceria recolorida em tempo real. No configurador completo: acabamentos, rodas, pinças, detalhes e interior.
          </Reveal>
        </div>

        <div className="relative mx-auto mt-10 max-w-6xl">
          <CarCanvas config={config} label={`Pré-visualização de perfil em ${current.name}`} />
          <div className="mx-auto -mt-2 h-6 w-3/4 rounded-[50%] bg-black/70 blur-xl" aria-hidden="true" />
        </div>

        <div className="mt-8 flex flex-col items-center gap-8">
          <fieldset>
            <legend className="sr-only">Pintura</legend>
            <div className="flex flex-wrap justify-center gap-3">
              {PAINTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={paint === p.id}
                  aria-label={p.name}
                  title={p.name}
                  onClick={() => setPaint(p.id)}
                  className={`relative h-11 w-11 rounded-full transition-transform duration-300 hover:scale-110 ${
                    paint === p.id ? 'ring-2 ring-paper ring-offset-4 ring-offset-ink' : 'ring-1 ring-silver/30'
                  }`}
                  style={{ background: `radial-gradient(circle at 35% 30%, rgb(255 255 255 / 0.35), transparent 45%), ${p.swatch}` }}
                />
              ))}
            </div>
          </fieldset>
          <p className="micro text-silver" aria-live="polite">
            {current.name}
          </p>
          <Link to={`/configurador?${toSearch(config)}`} className="btn btn-primary">
            Abrir o configurador <span className="arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
