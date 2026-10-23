import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageIntro } from '../components/Blocks';
import { Lightbox } from '../components/Lightbox';
import { Picture } from '../components/Picture';
import { CATEGORIES, GALLERY, type GalleryCategory } from '../data/gallery';
import { MODELS, MODEL_BY_SLUG, isModelSlug } from '../data/models';
import { usePageMeta } from '../hooks/usePageMeta';

const SHAPE: Record<string, string> = {
  wide: 'col-span-2 aspect-[16/10]',
  tall: 'col-span-1 row-span-2',
  square: 'col-span-1 aspect-square',
};

export default function Gallery() {
  usePageMeta('Galeria', 'Galeria APEX MOTORS: vistas frontais, laterais e traseiras, rodas, interiores, materiais e detalhes de luz da linha conceitual.');
  const [params, setParams] = useSearchParams();
  const cat = (CATEGORIES.some((c) => c.id === params.get('c')) ? params.get('c') : 'all') as GalleryCategory | 'all';
  const modelParam = params.get('m');
  const model = isModelSlug(modelParam) ? modelParam : null;
  const [open, setOpen] = useState<number | null>(null);

  const items = useMemo(
    () => GALLERY.filter((g) => (cat === 'all' || g.categories.includes(cat)) && (!model || g.model === model)),
    [cat, model],
  );

  const setFilter = (key: 'c' | 'm', value: string | null) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true, preventScrollReset: true });
  };

  return (
    <>
      <PageIntro eyebrow={`Galeria · ${GALLERY.length} imagens`} title="Luz," light="carbono e metal.">
        Vistas, rodas, interiores, materiais e detalhes luminosos de toda a linha. Filtre por tema ou por modelo e toque em uma imagem para ampliar.
      </PageIntro>

      <div className="sticky top-16 z-30 border-y border-silver/10 bg-ink/85 backdrop-blur-xl lg:top-20">
        <div className="container-x flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filtrar por tema">
            {CATEGORIES.map((c) => (
              <button key={c.id} type="button" className="chip shrink-0" aria-pressed={cat === c.id} onClick={() => setFilter('c', c.id)}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0" role="group" aria-label="Filtrar por modelo">
            <button type="button" className="chip shrink-0" aria-pressed={!model} onClick={() => setFilter('m', null)}>
              Todos os modelos
            </button>
            {MODELS.map((m) => (
              <button key={m.slug} type="button" className="chip shrink-0" aria-pressed={model === m.slug} onClick={() => setFilter('m', m.slug)}>
                {m.short}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section aria-label="Imagens" className="container-x py-10 sm:py-14">
        <p className="micro mb-6 text-mute" role="status" aria-live="polite">
          {items.length} {items.length === 1 ? 'imagem' : 'imagens'}
          {cat !== 'all' && ` · ${CATEGORIES.find((c) => c.id === cat)?.label}`}
          {model && ` · ${MODEL_BY_SLUG[model].name}`}
        </p>

        {items.length === 0 ? (
          <div className="flex flex-col items-start gap-6 border border-silver/10 p-10">
            <p className="text-lg text-silver">Nenhuma imagem combina com esses filtros.</p>
            <button type="button" className="btn btn-ghost" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Limpar filtros
            </button>
          </div>
        ) : (
          <ul className="grid grid-flow-dense grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 2xl:grid-cols-6">
            {items.map((g, i) => (
              <li key={g.image} className={`relative overflow-hidden bg-graphite [animation:route-in_.6s_var(--ease-apex)_both] ${SHAPE[g.shape]}`} style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                <button type="button" onClick={() => setOpen(i)} className="group block h-full w-full text-left" aria-label={`Ampliar: ${g.title}`}>
                  <Picture
                    name={g.image}
                    alt={g.title}
                    sizes={g.shape === 'wide' ? '(min-width: 768px) 50vw, 100vw' : '(min-width: 768px) 25vw, 50vw'}
                    className={`block h-full w-full ${g.image === 'profile' ? 'bg-[radial-gradient(70%_60%_at_50%_55%,#2a2f37,#111418)]' : ''}`}
                    imgClassName={`h-full w-full transition-transform duration-[900ms] ease-[var(--ease-apex)] group-hover:scale-[1.05] ${g.image === 'profile' ? 'object-contain p-4' : 'object-cover'}`}
                  />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-3 pt-12 sm:p-4 sm:pt-14">
                    <span className="text-sm leading-snug text-paper">{g.title}</span>
                    <span className="micro hidden shrink-0 text-silver sm:inline">{g.model ? MODEL_BY_SLUG[g.model].short : 'Linha'}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Lightbox
        items={items.map((g) => ({ image: g.image, caption: g.title, meta: g.categories.map((c) => CATEGORIES.find((x) => x.id === c)?.label).join(' · ') }))}
        index={open}
        onClose={() => setOpen(null)}
        onIndex={setOpen}
      />
    </>
  );
}
