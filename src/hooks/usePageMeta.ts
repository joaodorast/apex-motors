import { useEffect } from 'react';

const SITE = 'APEX MOTORS';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Título, descrição, canonical e Open Graph específicos por página. */
export function usePageMeta(title: string, description: string, image = '/og-image.jpg') {
  useEffect(() => {
    const full = title ? `${title} — ${SITE}` : `${SITE} — Hipercarros elétricos conceituais`;
    document.title = full;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', new URL(image, location.origin).href);
    setMeta('property', 'og:url', location.href);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = location.origin + location.pathname;
  }, [title, description, image]);
}
