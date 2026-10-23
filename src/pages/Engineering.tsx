import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { PageIntro, SpecSheet } from '../components/Blocks';
import { Picture } from '../components/Picture';
import { Reveal } from '../components/Reveal';
import { MODEL_BY_SLUG } from '../data/models';
import { usePageMeta } from '../hooks/usePageMeta';
import { PlatformViewer } from '../three/PlatformViewer';

function PowerDiagram() {
  const wheels = [
    [70, 60],
    [330, 60],
    [70, 200],
    [330, 200],
  ];
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" role="img" aria-label="Diagrama: a bateria central alimenta quatro inversores, um para cada motor junto às rodas">
      <rect x="140" y="95" width="120" height="70" fill="#111418" stroke="#FF3048" strokeWidth="1.2" />
      <text x="200" y="126" textAnchor="middle" className="fill-paper font-mono text-[10px] tracking-[0.15em]">BATERIA</text>
      <text x="200" y="142" textAnchor="middle" className="fill-mute font-mono text-[8px] tracking-[0.15em]">800 V*</text>
      {wheels.map(([x, y], i) => (
        <g key={i}>
          <path d={`M${x < 200 ? 140 : 260} ${y < 130 ? 108 : 152} L${x < 200 ? 110 : 290} ${y} L${x < 200 ? 96 : 304} ${y}`} fill="none" stroke="#c5c9ce" strokeOpacity="0.55" strokeWidth="1" strokeDasharray="4 5" className="[animation:dash_1.6s_linear_infinite]" />
          <circle cx={x} cy={y} r="24" fill="#111418" stroke="#c5c9ce" strokeOpacity="0.7" />
          <circle cx={x} cy={y} r="10" fill="#FF3048" fillOpacity="0.85" />
          <text x={x} y={y + 42} textAnchor="middle" className="fill-mute font-mono text-[8px] tracking-[0.12em]">
            M{i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ThermalDiagram() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" role="img" aria-label="Diagrama: circuito térmico em laço entre radiadores dianteiros, bateria e motores">
      <defs>
        <linearGradient id="hot" x1="0" x2="1">
          <stop offset="0" stopColor="#c5c9ce" />
          <stop offset="1" stopColor="#FF3048" />
        </linearGradient>
      </defs>
      <rect x="60" y="70" width="280" height="120" rx="60" fill="none" stroke="url(#hot)" strokeWidth="2.4" strokeDasharray="10 8" className="[animation:dash_2.4s_linear_infinite]" />
      <rect x="20" y="105" width="34" height="50" fill="#111418" stroke="#c5c9ce" />
      <text x="37" y="176" textAnchor="middle" className="fill-mute font-mono text-[8px]">RAD</text>
      <rect x="160" y="110" width="80" height="40" fill="#111418" stroke="#FF3048" />
      <text x="200" y="134" textAnchor="middle" className="fill-paper font-mono text-[8px] tracking-[0.12em]">BATERIA</text>
      <circle cx="340" cy="130" r="18" fill="#111418" stroke="#c5c9ce" />
      <text x="340" y="164" textAnchor="middle" className="fill-mute font-mono text-[8px]">MOTORES</text>
      <text x="200" y="58" textAnchor="middle" className="fill-mute font-mono text-[8px] tracking-[0.12em]">FLUXO CONTÍNUO →</text>
    </svg>
  );
}

function WeightDiagram() {
  return (
    <div className="flex h-full flex-col justify-center gap-6 p-6 sm:p-10" role="img" aria-label="Distribuição de massa conceitual: 44% no eixo dianteiro e 56% no traseiro">
      <div className="flex justify-between font-mono text-sm">
        <span>
          <span className="text-3xl text-paper">44</span>
          <span className="text-mute"> % diant.</span>
        </span>
        <span>
          <span className="text-3xl text-paper">56</span>
          <span className="text-mute"> % tras.</span>
        </span>
      </div>
      <div className="flex h-2 overflow-hidden bg-metal">
        <span className="h-full w-[44%] bg-silver" />
        <span className="h-full w-[56%] bg-volt" />
      </div>
      <div className="relative h-24">
        <svg viewBox="0 0 400 90" className="h-full w-full" aria-hidden="true">
          <path d="M20 62 Q60 34 140 30 L250 26 Q330 24 380 50 L384 62 Z" fill="none" stroke="#c5c9ce" strokeOpacity="0.6" />
          <circle cx="96" cy="66" r="18" fill="#070809" stroke="#c5c9ce" />
          <circle cx="314" cy="66" r="18" fill="#070809" stroke="#c5c9ce" />
          <rect x="120" y="54" width="170" height="8" fill="#FF3048" fillOpacity="0.6" />
          <path d="M218 20 L218 50" stroke="#FF3048" strokeDasharray="3 3" />
          <circle cx="218" cy="50" r="3.5" fill="#FF3048" />
          <text x="226" y="18" className="fill-mute font-mono text-[9px]">CG</text>
        </svg>
      </div>
    </div>
  );
}

function SoftwareDiagram() {
  const t = [
    ['FE', '18%'],
    ['FD', '22%'],
    ['TE', '26%'],
    ['TD', '34%'],
  ];
  return (
    <div className="grid h-full grid-cols-2 gap-px bg-silver/10 p-px" role="img" aria-label="Exemplo ilustrativo de vetorização de torque em curva: cada roda recebe uma parcela diferente">
      {t.map(([k, v], i) => (
        <div key={k} className="flex flex-col justify-between bg-graphite p-5">
          <span className="micro text-mute">Roda {k}</span>
          <span className="font-mono text-3xl text-paper">{v}</span>
          <span className="mt-3 block h-1 bg-metal">
            <span className="block h-full bg-volt" style={{ width: v, transitionDelay: `${i * 80}ms` }} />
          </span>
        </div>
      ))}
    </div>
  );
}

const TOPICS: { n: string; title: string; text: string; visual: ReactNode }[] = [
  {
    n: '01',
    title: 'Aerodinâmica',
    text: 'Superfícies desenhadas para conduzir o ar, não para enfeitá-lo. O assoalho plano acelera o fluxo sob o carro e o difusor traseiro recupera pressão, gerando carga com menos arrasto.',
    visual: <Picture name="velocity-wing" alt="Asa traseira e espelho aerodinâmico do APEX VELOCITY" sizes="(min-width: 1024px) 40vw, 100vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" />,
  },
  {
    n: '02',
    title: 'Arquitetura elétrica',
    text: 'Bateria central de alta tensão, quatro inversores e quatro motores. Cada roda é controlada de forma independente, sem eixos mecânicos entre elas.',
    visual: <PowerDiagram />,
  },
  {
    n: '03',
    title: 'Construção leve',
    text: 'Monocoque em fibra de carbono, subchassis em liga leve e painéis em carbono aparente. A massa economizada na estrutura compensa o peso da bateria.',
    visual: <Picture name="one-lightbar" alt="Detalhe da traseira em fibra de carbono com barra de luz vermelha" sizes="(min-width: 1024px) 40vw, 100vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" />,
  },
  {
    n: '04',
    title: 'Gerenciamento térmico',
    text: 'Um circuito único integra bateria, motores e eletrônica de potência. O objetivo conceitual: manter desempenho constante volta após volta, sem degradação por temperatura.',
    visual: <ThermalDiagram />,
  },
  {
    n: '05',
    title: 'Distribuição de peso',
    text: 'Bateria no assoalho e motores junto às rodas resultam em um centro de gravidade baixo e uma distribuição ligeiramente traseira, pensada para tração na saída de curva.',
    visual: <WeightDiagram />,
  },
  {
    n: '06',
    title: 'Materiais',
    text: 'Carbono forjado nas rodas e no habitáculo, alcantara nos pontos de contato e metal usinado nos comandos. Cada material aparece onde tem função.',
    visual: <Picture name="wheel" alt="Roda em carbono forjado com disco ventilado e pinça vermelha" sizes="(min-width: 1024px) 40vw, 100vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" />,
  },
  {
    n: '07',
    title: 'Software e veículo',
    text: 'Um controlador central decide, milhares de vezes por segundo, quanto torque cada roda recebe. Os valores ao lado ilustram uma curva à direita — são exemplos, não medições.',
    visual: <SoftwareDiagram />,
  },
];

export default function Engineering() {
  usePageMeta('Engenharia e tecnologia', 'Arquitetura conceitual do APEX ONE em 3D interativo: bateria estrutural, quatro motores, gerenciamento térmico, aerodinâmica, materiais e software. Valores fictícios.');
  const one = MODEL_BY_SLUG.one;

  return (
    <>
      <PageIntro eyebrow="Engenharia e tecnologia" title="Forma que" light="obedece ao ar.">
        Uma visão técnica da plataforma conceitual do APEX ONE. Gire o diagrama, isole cada sistema e abra a vista explodida.
      </PageIntro>

      <section aria-label="Diagrama 3D da plataforma">
        <PlatformViewer />
      </section>

      <section aria-labelledby="topics-title" className="container-x py-24 sm:py-32">
        <h2 id="topics-title" className="sr-only">
          Sistemas
        </h2>
        <ol className="flex flex-col">
          {TOPICS.map((t) => (
            <li key={t.n} className="grid gap-8 border-t border-silver/10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-14">
              <Reveal className="lg:col-span-1">
                <span className="micro text-volt">{t.n}</span>
              </Reveal>
              <div className="lg:col-span-5">
                <Reveal as="h3" className="display text-[clamp(1.5rem,7vw,3.2rem)] lg:text-[clamp(1.8rem,2.8vw,3.2rem)]">
                  {t.title}
                </Reveal>
                <Reveal as="p" delay={80} className="mt-6 max-w-lg text-lg leading-relaxed text-silver">
                  {t.text}
                </Reveal>
              </div>
              <Reveal mode="mask" delay={100} className="relative aspect-[16/10] overflow-hidden bg-graphite lg:col-span-6">
                {t.visual}
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Especificações do APEX ONE" className="border-t border-silver/10 bg-graphite py-24 sm:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Reveal as="p" className="eyebrow">
              APEX ONE
            </Reveal>
            <Reveal as="h2" delay={60} className="display mt-4 text-[clamp(1.55rem,7.4vw,3.6rem)]">
              Especificações
              <br />
              <span className="display-light text-silver">conceituais.</span>
            </Reveal>
            <Reveal delay={120} className="mt-8">
              <Link to="/configurador?m=one" className="btn btn-primary">
                Configurar o ONE <span className="arrow" aria-hidden="true">→</span>
              </Link>
            </Reveal>
          </div>
          <Reveal delay={120} className="lg:col-span-8">
            <SpecSheet specs={[...one.specs, { label: 'Tensão do sistema', value: '800', unit: 'V' }]} title="Ficha técnica — APEX ONE" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
