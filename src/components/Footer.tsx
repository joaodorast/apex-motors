import { Link } from 'react-router-dom';
import { MODELS } from '../data/models';
import { ApexMark } from './Logo';
import { NAV } from './Header';

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-silver/10 bg-ink pt-20 sm:pt-28">
      <div className="container-x">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <ApexMark className="h-10 w-10 text-paper" />
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-silver">
              Hipercarros elétricos conceituais. Engenharia, luz e velocidade — desenhadas como uma única linha.
            </p>
          </div>
          <nav aria-label="Modelos" className="md:col-span-3">
            <p className="eyebrow text-mute">Linha</p>
            <ul className="mt-5 space-y-3">
              {MODELS.map((m) => (
                <li key={m.slug}>
                  <Link to={`/modelos/${m.slug}`} className="link-line text-paper/90 hover:text-paper">
                    {m.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Rodapé" className="md:col-span-4">
            <p className="eyebrow text-mute">Explorar</p>
            <ul className="mt-5 grid grid-cols-2 gap-3">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="link-line text-paper/90 hover:text-paper">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-20 select-none" aria-hidden="true">
          <p className="display bg-gradient-to-b from-silver/25 to-transparent bg-clip-text text-[23vw] leading-[0.78] text-transparent 3xl:text-[22rem]">APEX</p>
        </div>

        <div className="flex flex-col gap-4 border-t border-silver/10 py-8 text-sm text-mute sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} APEX MOTORS · Projeto conceitual.</p>
          <p className="max-w-xl sm:text-right">
            APEX MOTORS é uma marca fictícia. Veículos, especificações e valores apresentados são conceituais e não representam produtos reais.
          </p>
        </div>
      </div>
    </footer>
  );
}
