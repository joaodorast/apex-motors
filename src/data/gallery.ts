import type { ImageName } from './images.gen';
import type { ModelSlug } from './models';

export type GalleryCategory = 'frontal' | 'lateral' | 'traseira' | 'rodas' | 'interior' | 'luz' | 'materiais';

export const CATEGORIES: { id: GalleryCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Tudo' },
  { id: 'frontal', label: 'Frontal' },
  { id: 'lateral', label: 'Lateral' },
  { id: 'traseira', label: 'Traseira' },
  { id: 'rodas', label: 'Rodas' },
  { id: 'interior', label: 'Interior' },
  { id: 'luz', label: 'Luz' },
  { id: 'materiais', label: 'Materiais' },
];

export interface GalleryItem {
  image: ImageName;
  title: string;
  model: ModelSlug | null;
  categories: GalleryCategory[];
  /** proporção do bloco no mosaico */
  shape: 'wide' | 'tall' | 'square';
}

export const GALLERY: GalleryItem[] = [
  { image: 'apex-one-hero', title: 'APEX ONE — três quartos dianteiro', model: 'one', categories: ['frontal', 'luz', 'materiais'], shape: 'wide' },
  { image: 'spectre-rear', title: 'APEX SPECTRE — silhueta traseira', model: 'spectre', categories: ['traseira', 'lateral'], shape: 'wide' },
  { image: 'wheel', title: 'Roda forjada e pinça vermelha', model: 'one', categories: ['rodas', 'materiais'], shape: 'square' },
  { image: 'velocity-tunnel', title: 'APEX VELOCITY — em movimento', model: 'velocity', categories: ['frontal'], shape: 'wide' },
  { image: 'apex-one-rear', title: 'APEX ONE — traseira e difusor', model: 'one', categories: ['traseira', 'luz', 'materiais'], shape: 'square' },
  { image: 'interior', title: 'Cockpit com volante yoke', model: 'one', categories: ['interior', 'luz', 'materiais'], shape: 'wide' },
  { image: 'eon-studio', title: 'APEX EON — volume em titânio', model: 'eon', categories: ['lateral', 'frontal'], shape: 'wide' },
  { image: 'spectre-tail', title: 'Lanterna em lâmina', model: 'spectre', categories: ['traseira', 'luz'], shape: 'wide' },
  { image: 'velocity-wheel', title: 'Roda dianteira do VELOCITY', model: 'velocity', categories: ['rodas', 'lateral'], shape: 'tall' },
  { image: 'eon-light', title: 'Linha de luz frontal do EON', model: 'eon', categories: ['luz', 'frontal'], shape: 'wide' },
  { image: 'profile', title: 'Estudo de perfil — linha APEX', model: null, categories: ['lateral'], shape: 'wide' },
  { image: 'spectre-wheel', title: 'Roda facetada do SPECTRE', model: 'spectre', categories: ['rodas'], shape: 'square' },
  { image: 'velocity-wing', title: 'Asa traseira ativa', model: 'velocity', categories: ['traseira', 'materiais'], shape: 'wide' },
  { image: 'eon-wheel', title: 'Roda de turbina do EON', model: 'eon', categories: ['rodas'], shape: 'square' },
  { image: 'one-lightbar', title: 'Barra de luz sobre carbono', model: 'one', categories: ['luz', 'materiais', 'traseira'], shape: 'wide' },
  { image: 'velocity-light', title: 'Faróis em lâmina do VELOCITY', model: 'velocity', categories: ['frontal', 'luz'], shape: 'wide' },
];
