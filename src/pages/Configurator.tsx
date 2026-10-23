import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CarCanvas, InteriorCanvas } from '../configurator/CarCanvas';
import {
  ACCENTS,
  CALIPERS,
  FINISHES,
  INTERIORS,
  PAINTS,
  WHEELS,
  WHEEL_FINISHES,
  findOption,
  type CarConfig,
} from '../configurator/options';
import { configCode, summaryLines, summaryText, toSearch, useConfigurator } from '../configurator/state';
import { wheelSvg } from '../configurator/wheels';
import { MODELS, MODEL_BY_SLUG } from '../data/models';
import { usePageMeta } from '../hooks/usePageMeta';

type TabId = 'paint' | 'wheels' | 'details' | 'interior' | 'summary';
const TABS: { id: TabId; label: string }[] = [
  { id: 'paint', label: 'Pintura' },
  { id: 'wheels', label: 'Rodas' },
  { id: 'details', label: 'Detalhes' },
  { id: 'interior', label: 'Interior' },
  { id: 'summary', label: 'Resumo' },
];

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Alternativa para contextos sem a API de clipboard
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

function Group({ title, value, children, id }: { title: string; value: string; children: ReactNode; id: string }) {
  return (
    <fieldset className="border-t border-silver/12 py-7" aria-labelledby={`${id}-legend`}>
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <legend id={`${id}-legend`} className="eyebrow float-left text-paper">
          {title}
        </legend>
        <span className="text-right text-sm text-silver" aria-live="polite">
          {value}
        </span>
      </div>
      <div className="clear-both">{children}</div>
    </fieldset>
  );
}

function Swatch({ selected, onClick, label, background, size = 'h-12 w-12' }: { selected: boolean; onClick: () => void; label: string; background: string; size?: string }) {
  return (
    <button
      type="button"
            aria-pressed={selected}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`relative ${size} shrink-0 rounded-full transition-transform duration-300 hover:scale-105 ${
        selected ? 'ring-2 ring-paper ring-offset-[3px] ring-offset-ink' : 'ring-1 ring-silver/30'
      }`}
      style={{ background }}
    />
  );
}

function TextOption({ selected, onClick, title, note }: { selected: boolean; onClick: () => void; title: string; note?: string }) {
  return (
    <button
      type="button"
            aria-pressed={selected}
      onClick={onClick}
      className={`flex min-h-12 w-full flex-col items-start justify-center px-4 py-3 text-left transition-[background-color,box-shadow] duration-300 ${
        selected ? 'bg-paper text-ink' : 'bg-graphite/70 text-paper shadow-[inset_0_0_0_1px_rgb(197_201_206/0.16)] hover:shadow-[inset_0_0_0_1px_rgb(197_201_206/0.45)]'
      }`}
    >
      <span className="text-sm font-semibold [font-stretch:110%]">{title}</span>
      {note && <span className={`mt-1 text-xs leading-snug ${selected ? 'text-ink/65' : 'text-mute'}`}>{note}</span>}
    </button>
  );
}

const shine = (hex: string) => `radial-gradient(circle at 32% 28%, rgb(255 255 255 / 0.4), transparent 42%), radial-gradient(circle at 70% 80%, rgb(0 0 0 / 0.45), transparent 55%), ${hex}`;

export default function Configurator() {
  const location = useLocation();
  const navigate = useNavigate();
  const { config, update, setModel, reset, isDefault } = useConfigurator(location.search);
  const [tab, setTab] = useState<TabId>('paint');
  const [view, setView] = useState<'exterior' | 'interior'>('exterior');
  const [notice, setNotice] = useState('');
  const noticeTimer = useRef<number>(0);
  const model = MODEL_BY_SLUG[config.model];
  const code = configCode(config);
  const search = toSearch(config);
  const shareUrl = `${window.location.origin}/configurador?${search}`;

  usePageMeta('Configurador', 'Configure o seu APEX: pintura, acabamento, rodas, pinças de freio, detalhes, pacote em carbono e interior. Salve, copie e compartilhe a configuração.');

  // Mantém a URL sincronizada (compartilhável) sem empilhar histórico
  useEffect(() => {
    if (location.search.slice(1) !== search) navigate({ search }, { replace: true });
  }, [search, location.search, navigate]);

  const announce = (msg: string) => {
    setNotice(msg);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(''), 3200);
  };

  const set = <K extends keyof CarConfig>(key: K, value: CarConfig[K]) => {
    update(key, value);
    setView(key === 'interior' ? 'interior' : 'exterior');
  };

  const wheelPreviews = useMemo(
    () =>
      Object.fromEntries(
        WHEELS.map((w) => [w.id, `data:image/svg+xml;charset=utf-8,${encodeURIComponent(wheelSvg(w.id, config.wheelFinish, config.caliper, { caliperAngle: 10, rotation: 12 }))}`]),
      ),
    [config.wheelFinish, config.caliper],
  );

  const paint = findOption(PAINTS, config.paint);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const onShare = async () => {
    try {
      await navigator.share({ title: `APEX MOTORS — ${model.name}`, text: `Minha configuração ${code}`, url: shareUrl });
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') announce('Não foi possível compartilhar. Use “Copiar link”.');
    }
  };

  const panelHidden = (id: TabId) => (tab === id ? '' : 'hidden lg:block');

  return (
    <div className="pt-16 lg:pt-20">
      <h1 className="sr-only">Configurador APEX — {model.name}</h1>

      <div className="lg:grid lg:min-h-[calc(100svh-5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(380px,460px)] 2xl:grid-cols-[minmax(0,1fr)_520px]">
        {/* Palco */}
        <div className="sticky top-16 z-20 border-b border-silver/10 bg-ink lg:top-20 lg:h-[calc(100svh-5rem)] lg:border-b-0 lg:border-r">
          <div className="relative flex h-full flex-col bg-[radial-gradient(80%_70%_at_50%_55%,#1c2027_0%,#070809_78%)]">
            {/* Troca de modelo */}
            <div className="flex items-center gap-1 overflow-x-auto px-4 pt-3 [scrollbar-width:none] sm:px-6 lg:px-10 lg:pt-8" role="group" aria-label="Modelo">
              {MODELS.map((m) => (
                <button
                  key={m.slug}
                  type="button"
                                    aria-pressed={config.model === m.slug}
                  onClick={() => {
                    setModel(m.slug);
                    setView('exterior');
                  }}
                  className={`micro relative shrink-0 px-3 py-3 transition-colors ${config.model === m.slug ? 'text-paper' : 'text-mute hover:text-silver'}`}
                >
                  {m.short}
                  <span className={`absolute inset-x-3 bottom-1 h-px bg-volt transition-transform duration-500 ${config.model === m.slug ? 'scale-x-100' : 'scale-x-0'}`} />
                </button>
              ))}
            </div>

            <div className="hidden px-10 pt-6 lg:block">
              <p className="micro text-volt">{model.category}</p>
              <p className="display mt-2 text-[clamp(2.6rem,4.4vw,5rem)]">
                <span className="display-light text-silver">APEX </span>
                {model.short}
              </p>
            </div>

            <div className="relative flex flex-1 items-center justify-center px-3 py-2 sm:px-8 lg:px-10 lg:py-6">
              <div className={`w-full max-w-[1100px] ${view === 'exterior' ? '' : 'hidden'}`}>
                <CarCanvas
                  config={config}
                  label={`${model.name} de perfil em ${paint.name}, acabamento ${findOption(FINISHES, config.finish).name.toLowerCase()}, rodas ${findOption(WHEELS, config.wheel).name}`}
                  className="mx-auto"
                />
                <div className="mx-auto -mt-3 h-5 w-3/4 rounded-[50%] bg-black/80 blur-xl" aria-hidden="true" />
              </div>
              {view === 'interior' && (
                <div className="w-full max-w-[1100px]">
                  <InteriorCanvas
                    interior={config.interior}
                    label={`Interior ${findOption(INTERIORS, config.interior).name}`}
                    className="mx-auto max-h-[34svh] w-auto object-contain lg:max-h-[60svh]"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-4 pb-3 sm:px-6 lg:px-10 lg:pb-8">
              <div className="flex rounded-full bg-graphite p-1 ring-1 ring-silver/15" role="group" aria-label="Vista">
                {(['exterior', 'interior'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                                        aria-pressed={view === v}
                    onClick={() => setView(v)}
                    className={`micro rounded-full px-4 py-2 transition-colors ${view === v ? 'bg-paper text-ink' : 'text-silver hover:text-paper'}`}
                  >
                    {v === 'exterior' ? 'Exterior' : 'Interior'}
                  </button>
                ))}
              </div>
              <p className="micro hidden text-mute sm:block">
                Código <span className="text-paper">{code}</span>
              </p>
            </div>

            {/* Abas (mobile/tablet) */}
            <div className="flex border-t border-silver/10 lg:hidden" role="tablist" aria-label="Seções do configurador">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={tab === t.id}
                  aria-controls={`panel-${t.id}`}
                  onClick={() => setTab(t.id)}
                  className={`micro relative flex-1 py-4 text-[0.6rem] transition-colors sm:text-[0.65rem] ${tab === t.id ? 'text-paper' : 'text-mute'}`}
                >
                  {t.label}
                  <span className={`absolute inset-x-2 bottom-0 h-0.5 bg-volt transition-transform ${tab === t.id ? 'scale-x-100' : 'scale-x-0'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Painel de opções */}
        <div className="container-x pb-20 pt-2 lg:max-w-none lg:px-10 lg:pt-6">
          <div id="panel-paint" role="tabpanel" aria-labelledby="tab-paint" className={panelHidden('paint')}>
            <Group id="paint" title="Pintura" value={paint.name}>
              <div className="flex flex-wrap gap-3" role="group" aria-label="Cor da carroceria">
                {PAINTS.map((p) => (
                  <Swatch key={p.id} selected={config.paint === p.id} onClick={() => set('paint', p.id)} label={p.name} background={shine(p.swatch)} />
                ))}
              </div>
            </Group>
            <Group id="finish" title="Acabamento" value={findOption(FINISHES, config.finish).name}>
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Acabamento da pintura">
                {FINISHES.map((f) => (
                  <TextOption key={f.id} selected={config.finish === f.id} onClick={() => set('finish', f.id)} title={f.name} />
                ))}
              </div>
              <p className="mt-3 text-sm text-mute">{findOption(FINISHES, config.finish).note}</p>
            </Group>
          </div>

          <div id="panel-wheels" role="tabpanel" aria-labelledby="tab-wheels" className={panelHidden('wheels')}>
            <Group id="wheel" title="Rodas" value={findOption(WHEELS, config.wheel).name}>
              <div className="grid grid-cols-4 gap-2" role="group" aria-label="Desenho das rodas">
                {WHEELS.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                                        aria-pressed={config.wheel === w.id}
                    onClick={() => set('wheel', w.id)}
                    className={`group flex flex-col items-center gap-2 p-2 pb-3 transition-[background-color,box-shadow] ${
                      config.wheel === w.id ? 'bg-metal shadow-[inset_0_0_0_1px_#F4F5F6]' : 'bg-graphite/70 shadow-[inset_0_0_0_1px_rgb(197_201_206/0.14)] hover:shadow-[inset_0_0_0_1px_rgb(197_201_206/0.4)]'
                    }`}
                  >
                    <img src={wheelPreviews[w.id]} alt="" width={96} height={96} className="aspect-square w-full max-w-24 transition-transform duration-700 group-hover:rotate-[30deg]" />
                    <span className="text-center text-[0.7rem] font-semibold leading-tight [font-stretch:105%]">{w.name}</span>
                  </button>
                ))}
              </div>
            </Group>
            <Group id="wheelFinish" title="Acabamento das rodas" value={findOption(WHEEL_FINISHES, config.wheelFinish).name}>
              <div className="flex flex-wrap gap-3" role="group" aria-label="Acabamento das rodas">
                {WHEEL_FINISHES.map((w) => (
                  <Swatch
                    key={w.id}
                    selected={config.wheelFinish === w.id}
                    onClick={() => set('wheelFinish', w.id)}
                    label={w.name}
                    background={w.id === 'carbon' ? 'repeating-linear-gradient(45deg,#2c2f34 0 3px,#141517 3px 6px)' : shine(w.swatch)}
                  />
                ))}
              </div>
            </Group>
            <Group id="caliper" title="Pinças de freio" value={findOption(CALIPERS, config.caliper).name}>
              <div className="flex flex-wrap gap-3" role="group" aria-label="Cor das pinças">
                {CALIPERS.map((c) => (
                  <Swatch key={c.id} selected={config.caliper === c.id} onClick={() => set('caliper', c.id)} label={`Pinças ${c.name.toLowerCase()}`} background={shine(c.swatch)} />
                ))}
              </div>
            </Group>
          </div>

          <div id="panel-details" role="tabpanel" aria-labelledby="tab-details" className={panelHidden('details')}>
            <Group id="accent" title="Linhas de detalhe" value={findOption(ACCENTS, config.accent).name}>
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Cor das linhas de detalhe">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                                        aria-pressed={config.accent === a.id}
                    onClick={() => set('accent', a.id)}
                    className={`flex min-h-12 items-center gap-3 px-4 transition-[background-color,box-shadow] ${
                      config.accent === a.id ? 'bg-paper text-ink' : 'bg-graphite/70 shadow-[inset_0_0_0_1px_rgb(197_201_206/0.16)] hover:shadow-[inset_0_0_0_1px_rgb(197_201_206/0.45)]'
                    }`}
                  >
                    <span className="h-0.5 w-6" style={{ background: a.swatch, boxShadow: `0 0 8px ${a.swatch}` }} aria-hidden="true" />
                    <span className="text-sm font-semibold [font-stretch:110%]">{a.name}</span>
                  </button>
                ))}
              </div>
            </Group>
            <Group id="carbon" title="Pacote em fibra de carbono" value={config.carbon ? 'Incluído' : 'Não incluído'}>
              <button
                type="button"
                role="switch"
                aria-checked={config.carbon}
                onClick={() => set('carbon', !config.carbon)}
                className="flex w-full items-center justify-between gap-4 bg-graphite/70 px-4 py-4 text-left shadow-[inset_0_0_0_1px_rgb(197_201_206/0.16)] hover:shadow-[inset_0_0_0_1px_rgb(197_201_206/0.45)]"
              >
                <span>
                  <span className="block text-sm font-semibold [font-stretch:110%]">Splitter, saias e difusor em carbono</span>
                  <span className="mt-1 block text-xs text-mute">Substitui os apliques inferiores em preto por trama de carbono aparente.</span>
                </span>
                <span className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${config.carbon ? 'bg-volt' : 'bg-metal'}`} aria-hidden="true">
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-paper transition-transform duration-300 ${config.carbon ? 'translate-x-6' : 'translate-x-1'}`} />
                </span>
              </button>
            </Group>
          </div>

          <div id="panel-interior" role="tabpanel" aria-labelledby="tab-interior" className={panelHidden('interior')}>
            <Group id="interior" title="Interior" value={findOption(INTERIORS, config.interior).name}>
              <div className="grid gap-2" role="group" aria-label="Ambiente interno">
                {INTERIORS.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                                        aria-pressed={config.interior === it.id}
                    onClick={() => set('interior', it.id)}
                    className={`flex items-center gap-4 px-4 py-3 text-left transition-[background-color,box-shadow] ${
                      config.interior === it.id ? 'bg-paper text-ink' : 'bg-graphite/70 shadow-[inset_0_0_0_1px_rgb(197_201_206/0.16)] hover:shadow-[inset_0_0_0_1px_rgb(197_201_206/0.45)]'
                    }`}
                  >
                    <span className="h-10 w-10 shrink-0 rounded-full ring-1 ring-silver/30" style={{ background: `linear-gradient(135deg, ${it.swatch[0]} 55%, ${it.swatch[1]} 55%)` }} aria-hidden="true" />
                    <span>
                      <span className="block text-sm font-semibold [font-stretch:110%]">{it.name}</span>
                      <span className={`mt-0.5 block text-xs ${config.interior === it.id ? 'text-ink/65' : 'text-mute'}`}>{it.note}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Group>
          </div>

          <div id="panel-summary" role="tabpanel" aria-labelledby="tab-summary" className={panelHidden('summary')}>
            <section aria-labelledby="summary-title" className="border-t border-silver/12 py-7">
              <div className="flex items-baseline justify-between gap-4">
                <h2 id="summary-title" className="eyebrow text-paper">
                  Resumo
                </h2>
                <span className="font-mono text-xs text-volt">{code}</span>
              </div>
              <dl className="mt-5">
                {summaryLines(config).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-silver/8 py-2.5 text-sm">
                    <dt className="text-mute">{k}</dt>
                    <dd className="text-right text-paper">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 grid grid-cols-2 gap-2">
                <button type="button" className="btn btn-ghost px-3" onClick={async () => announce((await copyText(shareUrl)) ? 'Link da configuração copiado.' : 'Não foi possível copiar o link.')}>
                  Copiar link
                </button>
                {canShare ? (
                  <button type="button" className="btn btn-ghost px-3" onClick={onShare}>
                    Compartilhar
                  </button>
                ) : (
                  <button type="button" className="btn btn-ghost px-3" onClick={async () => announce((await copyText(summaryText(config, shareUrl))) ? 'Resumo copiado.' : 'Não foi possível copiar o resumo.')}>
                    Copiar resumo
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-ghost px-3 disabled:opacity-40"
                  disabled={isDefault}
                  onClick={() => {
                    reset();
                    setView('exterior');
                    announce(`Configuração do ${model.name} redefinida para o padrão.`);
                  }}
                >
                  Redefinir
                </button>
                <Link to={`/contato?m=${config.model}&config=${encodeURIComponent(code)}`} className="btn btn-primary px-3">
                  Solicitar contato
                </Link>
              </div>
              <p role="status" aria-live="polite" className={`mt-4 min-h-5 text-sm transition-opacity ${notice ? 'text-paper opacity-100' : 'opacity-0'}`}>
                {notice}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-mute">
                As escolhas são salvas neste navegador para cada modelo. A visualização é uma recoloração 2D de uma fotografia de estudo com silhueta comum à linha — não há modelo 3D do veículo. Projeto conceitual, sem preços ou disponibilidade.
              </p>
            </section>
          </div>

          {/* Navegação entre abas (mobile) */}
          <div className="flex justify-between gap-3 pt-2 lg:hidden">
            {(() => {
              const i = TABS.findIndex((t) => t.id === tab);
              return (
                <>
                  <button type="button" className="btn btn-ghost px-4 disabled:opacity-30" disabled={i === 0} onClick={() => setTab(TABS[i - 1].id)}>
                    ← {i > 0 ? TABS[i - 1].label : 'Anterior'}
                  </button>
                  <button type="button" className="btn btn-primary px-4 disabled:opacity-30" disabled={i === TABS.length - 1} onClick={() => setTab(TABS[i + 1].id)}>
                    {i < TABS.length - 1 ? TABS[i + 1].label : 'Fim'} →
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
