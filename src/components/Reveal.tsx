import { createElement, useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  as?: keyof HTMLElementTagNameMap;
  className?: string;
  delay?: number;
  mode?: 'fade' | 'mask';
  style?: CSSProperties;
}

let observer: IntersectionObserver | null = null;
function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            observer?.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0 },
    );
  }
  return observer;
}

/** Revela o conteúdo ao entrar na viewport (um único IntersectionObserver compartilhado). */
export function Reveal({ children, as = 'div', className = '', delay = 0, mode = 'fade', style }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-in');
      return;
    }
    const io = getObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  return createElement(
    as,
    {
      ref,
      className: `${mode === 'mask' ? 'reveal-mask' : 'reveal'} ${className}`,
      style: { ...style, '--d': `${delay}ms` } as CSSProperties,
    },
    children,
  );
}
