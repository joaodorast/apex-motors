import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Logo } from './Logo';

export const NAV = [
  { to: '/modelos', label: 'Modelos', index: '01' },
  { to: '/engenharia', label: 'Engenharia', index: '02' },
  { to: '/galeria', label: 'Galeria', index: '03' },
  { to: '/configurador', label: 'Configurador', index: '04' },
  { to: '/sobre', label: 'Sobre', index: '05' },
  { to: '/contato', label: 'Contato', index: '06' },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Fecha o menu ao trocar de rota
  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    const first = menuRef.current?.querySelector<HTMLElement>('a');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
      if (e.key === 'Tab' && menuRef.current) {
        const items = [toggleRef.current, ...menuRef.current.querySelectorAll<HTMLElement>('a,button')].filter(Boolean) as HTMLElement[];
        const i = items.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          items[items.length - 1].focus();
        } else if (!e.shiftKey && i === items.length - 1) {
          e.preventDefault();
          items[0].focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const solid = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`absolute inset-0 transition-[background-color,backdrop-filter,box-shadow] duration-500 ${
          solid ? 'bg-ink/80 shadow-[0_1px_0_rgb(197_201_206/0.08)] backdrop-blur-xl' : 'bg-gradient-to-b from-ink/70 to-transparent'
        }`}
        aria-hidden="true"
      />
      <div className="container-x relative flex h-16 items-center justify-between gap-6 lg:h-20">
        <Link to="/" className="relative z-10 -m-2 p-2" aria-label="APEX MOTORS — página inicial">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-8 xl:gap-10">
            {NAV.slice(0, 5).map((item) => (
              <li key={item.to}>
                <NavLink to={item.to} className="link-line micro py-2 text-silver transition-colors hover:text-paper aria-[current=page]:text-paper">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="relative z-10 flex items-center gap-3">
          <Link to="/contato" className="link-line micro hidden py-2 text-silver hover:text-paper lg:inline-block">
            Contato
          </Link>
          <Link to="/configurador" className="btn btn-primary hidden min-h-10 px-5 sm:inline-flex">
            Configurar
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="relative -mr-2 flex h-12 w-12 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-6">
              <span className={`absolute left-0 top-0 h-px w-6 bg-paper transition-transform duration-500 ${open ? 'translate-y-1.5 rotate-45' : ''}`} />
              <span className={`absolute bottom-0 right-0 h-px bg-paper transition-all duration-500 ${open ? 'w-6 -translate-y-1.5 -rotate-45' : 'w-4'}`} />
            </span>
          </button>
        </div>
      </div>

      {/* Menu mobile/tablet */}
      <div
        id="mobile-menu"
        ref={menuRef}
        className={`fixed inset-0 top-16 z-40 overflow-y-auto bg-ink transition-[opacity,visibility] duration-500 lg:hidden ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
        aria-hidden={!open}
        inert={!open}
      >
        <nav aria-label="Menu móvel" className="container-x flex min-h-full flex-col justify-between pb-[max(2rem,env(safe-area-inset-bottom))] pt-8">
          <ul className="flex flex-col">
            {NAV.map((item, i) => (
              <li
                key={item.to}
                className="border-b border-silver/10"
                style={{ transition: 'transform .7s var(--ease-apex), opacity .7s', transitionDelay: open ? `${80 + i * 45}ms` : '0ms', transform: open ? 'none' : 'translateY(16px)', opacity: open ? 1 : 0 }}
              >
                <NavLink to={item.to} className="group flex items-baseline gap-4 py-4 aria-[current=page]:text-volt">
                  <span className="micro text-mute">{item.index}</span>
                  <span className="display text-[clamp(1.7rem,7.4vw,3.5rem)] leading-none">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link to="/configurador" className="btn btn-primary">
              Configurar o seu APEX
            </Link>
            <p className="micro self-center text-mute">Marca e veículos conceituais fictícios</p>
          </div>
        </nav>
      </div>
    </header>
  );
}
