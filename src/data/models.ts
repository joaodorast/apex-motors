import type { ImageName } from './images.gen';
import type { CarConfig } from '../configurator/options';

export type ModelSlug = 'one' | 'spectre' | 'velocity' | 'eon';

export interface Spec {
  label: string;
  value: string;
  unit?: string;
}

export interface Feature {
  title: string;
  text: string;
}

export interface CarModel {
  slug: ModelSlug;
  index: string;
  name: string;
  short: string;
  category: string;
  tagline: string;
  intro: string;
  body: string[];
  features: Feature[];
  /** Especificações conceituais — todos os valores são fictícios. */
  specs: Spec[];
  keySpecs: Spec[];
  hero: ImageName;
  heroPosition: string;
  gallery: { image: ImageName; caption: string }[];
  defaults: Omit<CarConfig, 'model'>;
}

export const MODELS: CarModel[] = [
  {
    slug: 'one',
    index: '01',
    name: 'APEX ONE',
    short: 'ONE',
    category: 'Hipercarro elétrico · Carro-conceito principal',
    tagline: 'Luz desenhada sobre carbono.',
    intro:
      'O APEX ONE é a síntese da marca: carroceria baixa em fibra de carbono aparente, assinatura luminosa vermelha que percorre as superfícies e uma aerodinâmica pensada para colar o carro ao chão.',
    body: [
      'Cada linha de luz acompanha uma aresta estrutural. Elas não decoram — revelam por onde o ar entra, onde a carroceria se dobra e onde a energia é dissipada.',
      'Como conceito, o ONE explora até onde uma arquitetura elétrica de quatro motores pode levar a distribuição de massa, a vetorização de torque e a gestão térmica em uso prolongado.',
    ],
    features: [
      { title: 'Assinatura luminosa estrutural', text: 'Linhas de LED integradas às arestas da carroceria, desenhando o volume do carro mesmo no escuro.' },
      { title: 'Monocoque em carbono aparente', text: 'Trama de fibra de carbono exposta, com verniz de proteção UV e acabamento sem pintura.' },
      { title: 'Difusor de canal profundo', text: 'Seis canais traseiros conceituais com aletas verticais para estabilidade em alta velocidade.' },
      { title: 'Vetorização por quatro motores', text: 'Cada roda com motor dedicado, permitindo controle independente de torque em curvas.' },
    ],
    keySpecs: [
      { label: '0–100 km/h', value: '1,9', unit: 's' },
      { label: 'Potência', value: '1.420', unit: 'kW' },
      { label: 'Vel. máxima', value: '412', unit: 'km/h' },
    ],
    specs: [
      { label: 'Arquitetura', value: 'Quatro motores · AWD' },
      { label: 'Potência combinada', value: '1.420', unit: 'kW' },
      { label: 'Torque combinado', value: '2.300', unit: 'N·m' },
      { label: '0–100 km/h', value: '1,9', unit: 's' },
      { label: 'Velocidade máxima', value: '412', unit: 'km/h' },
      { label: 'Bateria', value: '118', unit: 'kWh' },
      { label: 'Autonomia estimada', value: '510', unit: 'km' },
      { label: 'Massa em ordem de marcha', value: '1.690', unit: 'kg' },
      { label: 'Distribuição de massa', value: '44 / 56', unit: '%' },
      { label: 'Downforce a 300 km/h', value: '1.150', unit: 'kg' },
    ],
    hero: 'apex-one-hero',
    heroPosition: '50% 58%',
    gallery: [
      { image: 'apex-one-hero', caption: 'Três quartos dianteiro em estúdio' },
      { image: 'apex-one-rear', caption: 'Traseira com barra de luz contínua' },
      { image: 'one-lightbar', caption: 'Detalhe da barra de luz sobre carbono' },
      { image: 'interior', caption: 'Cockpit com volante yoke e iluminação vermelha' },
      { image: 'wheel', caption: 'Roda forjada e pinça vermelha' },
    ],
    defaults: {
      paint: 'obsidian',
      finish: 'metallic',
      wheel: 'blade',
      wheelFinish: 'black',
      caliper: 'red',
      accent: 'red',
      carbon: true,
      interior: 'black-red',
    },
  },
  {
    slug: 'spectre',
    index: '02',
    name: 'APEX SPECTRE',
    short: 'SPECTRE',
    category: 'Grand tourer furtivo',
    tagline: 'Presença sem ruído.',
    intro:
      'O SPECTRE leva a linguagem APEX ao extremo da contenção: preto fosco absoluto, superfícies facetadas e uma única linha de luz que só se revela quando o carro está em movimento.',
    body: [
      'A pintura fosca absorve reflexos e transforma o carro em silhueta. A forma é lida pelas arestas, não pelo brilho.',
      'É o conceito pensado para longas distâncias noturnas: cabine silenciosa, suspensão adaptativa e uma resposta progressiva, sem exibicionismo.',
    ],
    features: [
      { title: 'Superfícies facetadas', text: 'Painéis com arestas vivas que fragmentam a luz ambiente, como uma aeronave de baixa assinatura.' },
      { title: 'Preto fosco absoluto', text: 'Acabamento acetinado profundo, sem verniz brilhante, para leitura pura da silhueta.' },
      { title: 'Lanterna em lâmina', text: 'Uma faixa de luz única e afilada que envolve a traseira de ponta a ponta.' },
      { title: 'Modo noturno de cabine', text: 'Iluminação interna reduzida ao mínimo, com informações projetadas apenas quando necessárias.' },
    ],
    keySpecs: [
      { label: '0–100 km/h', value: '2,4', unit: 's' },
      { label: 'Autonomia', value: '640', unit: 'km' },
      { label: 'Vel. máxima', value: '350', unit: 'km/h' },
    ],
    specs: [
      { label: 'Arquitetura', value: 'Dois motores · AWD' },
      { label: 'Potência combinada', value: '920', unit: 'kW' },
      { label: 'Torque combinado', value: '1.650', unit: 'N·m' },
      { label: '0–100 km/h', value: '2,4', unit: 's' },
      { label: 'Velocidade máxima', value: '350', unit: 'km/h' },
      { label: 'Bateria', value: '124', unit: 'kWh' },
      { label: 'Autonomia estimada', value: '640', unit: 'km' },
      { label: 'Massa em ordem de marcha', value: '1.840', unit: 'kg' },
      { label: 'Distribuição de massa', value: '47 / 53', unit: '%' },
    ],
    hero: 'spectre-rear',
    heroPosition: '55% 60%',
    gallery: [
      { image: 'spectre-rear', caption: 'Silhueta traseira sob concreto' },
      { image: 'spectre-tail', caption: 'Lanterna em lâmina' },
      { image: 'spectre-wheel', caption: 'Roda facetada em preto fosco' },
    ],
    defaults: {
      paint: 'obsidian',
      finish: 'matte',
      wheel: 'forged',
      wheelFinish: 'black',
      caliper: 'black',
      accent: 'silver',
      carbon: true,
      interior: 'black',
    },
  },
  {
    slug: 'velocity',
    index: '03',
    name: 'APEX VELOCITY',
    short: 'VELOCITY',
    category: 'Hipercarro de pista',
    tagline: 'Feito para o limite.',
    intro:
      'O VELOCITY é o APEX sem concessões: asa traseira ativa, splitter dianteiro agressivo e proporções que priorizam carga aerodinâmica acima de qualquer outra coisa.',
    body: [
      'Cada entrada de ar tem uma função. O capô ventilado extrai calor dos radiadores dianteiros e reduz a pressão sobre o eixo dianteiro.',
      'Como conceito de pista, o VELOCITY explora gestão térmica para voltas consecutivas — o maior desafio de um hipercarro elétrico em circuito.',
    ],
    features: [
      { title: 'Asa traseira ativa', text: 'Ângulo variável conceitual, com modo de frenagem aerodinâmica.' },
      { title: 'Capô de extração', text: 'Saídas de ar sobre o capô para aliviar pressão e evacuar calor.' },
      { title: 'Splitter em carbono', text: 'Lâmina dianteira com bordas vermelhas que guia o fluxo para o assoalho.' },
      { title: 'Arrefecimento de pista', text: 'Circuito térmico dimensionado para uso contínuo em circuito.' },
    ],
    keySpecs: [
      { label: '0–100 km/h', value: '1,8', unit: 's' },
      { label: 'Downforce', value: '1.600', unit: 'kg' },
      { label: 'Massa', value: '1.560', unit: 'kg' },
    ],
    specs: [
      { label: 'Arquitetura', value: 'Três motores · AWD' },
      { label: 'Potência combinada', value: '1.300', unit: 'kW' },
      { label: 'Torque combinado', value: '2.050', unit: 'N·m' },
      { label: '0–100 km/h', value: '1,8', unit: 's' },
      { label: 'Velocidade máxima', value: '360', unit: 'km/h' },
      { label: 'Bateria', value: '96', unit: 'kWh' },
      { label: 'Massa em ordem de marcha', value: '1.560', unit: 'kg' },
      { label: 'Distribuição de massa', value: '42 / 58', unit: '%' },
      { label: 'Downforce a 250 km/h', value: '1.600', unit: 'kg' },
    ],
    hero: 'velocity-tunnel',
    heroPosition: '55% 50%',
    gallery: [
      { image: 'velocity-tunnel', caption: 'Em movimento sob chuva' },
      { image: 'velocity-light', caption: 'Faróis em lâmina e capô ventilado' },
      { image: 'velocity-wheel', caption: 'Roda dianteira e entrada lateral' },
      { image: 'velocity-wing', caption: 'Asa traseira ativa' },
    ],
    defaults: {
      paint: 'graphite',
      finish: 'gloss',
      wheel: 'aero',
      wheelFinish: 'graphite',
      caliper: 'red',
      accent: 'red',
      carbon: true,
      interior: 'black-red',
    },
  },
  {
    slug: 'eon',
    index: '04',
    name: 'APEX EON',
    short: 'EON',
    category: 'Gran turismo de luxo',
    tagline: 'O futuro, em metal líquido.',
    intro:
      'O EON é a face mais serena da APEX: um gran turismo de superfícies contínuas em titânio escovado, com uma única linha de luz frontal e um interior pensado como sala de estar.',
    body: [
      'A carroceria é desenhada como uma peça fundida — sem vincos desnecessários, com reflexos que deslizam de ponta a ponta.',
      'O conceito explora conforto em alta velocidade: isolamento acústico, materiais nobres e rodas de turbina que reduzem arrasto.',
    ],
    features: [
      { title: 'Superfícies contínuas', text: 'Volumes fluidos, sem vincos supérfluos, para reflexos ininterruptos.' },
      { title: 'Linha de luz frontal', text: 'Uma única assinatura luminosa que atravessa toda a dianteira.' },
      { title: 'Rodas de turbina', text: 'Raios em lâmina que conduzem o ar e resfriam os freios.' },
      { title: 'Cabine 2+2', text: 'Quatro lugares com materiais metálicos, couro e iluminação indireta.' },
    ],
    keySpecs: [
      { label: 'Autonomia', value: '720', unit: 'km' },
      { label: '0–100 km/h', value: '2,9', unit: 's' },
      { label: 'Lugares', value: '2+2' },
    ],
    specs: [
      { label: 'Arquitetura', value: 'Dois motores · AWD' },
      { label: 'Potência combinada', value: '780', unit: 'kW' },
      { label: 'Torque combinado', value: '1.400', unit: 'N·m' },
      { label: '0–100 km/h', value: '2,9', unit: 's' },
      { label: 'Velocidade máxima', value: '320', unit: 'km/h' },
      { label: 'Bateria', value: '132', unit: 'kWh' },
      { label: 'Autonomia estimada', value: '720', unit: 'km' },
      { label: 'Massa em ordem de marcha', value: '2.050', unit: 'kg' },
      { label: 'Lugares', value: '2+2' },
    ],
    hero: 'eon-studio',
    heroPosition: '50% 55%',
    gallery: [
      { image: 'eon-studio', caption: 'Volume contínuo em titânio' },
      { image: 'eon-light', caption: 'Linha de luz frontal' },
      { image: 'eon-wheel', caption: 'Roda de turbina' },
    ],
    defaults: {
      paint: 'titanium',
      finish: 'metallic',
      wheel: 'turbine',
      wheelFinish: 'silver',
      caliper: 'silver',
      accent: 'silver',
      carbon: false,
      interior: 'grey',
    },
  },
];

export const MODEL_BY_SLUG: Record<ModelSlug, CarModel> = Object.fromEntries(MODELS.map((m) => [m.slug, m])) as Record<
  ModelSlug,
  CarModel
>;

export function isModelSlug(v: unknown): v is ModelSlug {
  return typeof v === 'string' && v in MODEL_BY_SLUG;
}
