import type { ReactNode } from 'react';
import type { Spec } from '../data/models';
import { Reveal } from './Reveal';

/** Cabeçalho editorial das páginas internas. */
export function PageIntro({ eyebrow, title, light, children }: { eyebrow: string; title: string; light?: string; children?: ReactNode }) {
  return (
    <header className="container-x pb-14 pt-32 sm:pb-20 sm:pt-44">
      <Reveal as="p" className="eyebrow flex items-center gap-3">
        <span className="inline-block h-px w-8 bg-volt" aria-hidden="true" />
        {eyebrow}
      </Reveal>
      <Reveal as="h1" delay={80} className="display mt-6 text-[clamp(2.8rem,10vw,10rem)]">
        {title}
        {light && (
          <>
            <br />
            <span className="display-light text-silver">{light}</span>
          </>
        )}
      </Reveal>
      {children && (
        <Reveal delay={160} className="mt-8 max-w-2xl text-lg leading-relaxed text-silver sm:text-xl">
          {children}
        </Reveal>
      )}
    </header>
  );
}

/** Ficha técnica conceitual — sempre identificada como fictícia. */
export function SpecSheet({ specs, title = 'Especificações conceituais' }: { specs: Spec[]; title?: string }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h3 className="eyebrow text-paper">{title}</h3>
        <span className="fictional-badge">Valores fictícios</span>
      </div>
      <dl className="mt-6 grid sm:grid-cols-2 sm:gap-x-12">
        {specs.map((s) => (
          <div key={s.label} className="flex items-baseline justify-between gap-6 border-b border-silver/12 py-4">
            <dt className="text-silver">{s.label}</dt>
            <dd className="text-right font-mono text-paper">
              {s.value}
              {s.unit && <span className="ml-1.5 text-xs text-mute">{s.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-sm leading-relaxed text-mute">
        Projeto conceitual. Os valores acima são ilustrativos e não derivam de testes, homologações ou certificações.
      </p>
    </div>
  );
}
