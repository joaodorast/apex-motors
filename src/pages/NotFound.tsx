import { Link, useLocation } from 'react-router-dom';
import { Picture } from '../components/Picture';
import { usePageMeta } from '../hooks/usePageMeta';

export default function NotFound() {
  usePageMeta('Página não encontrada', 'A página procurada não existe. Volte para a linha APEX MOTORS.');
  const { pathname } = useLocation();

  return (
    <section aria-labelledby="nf-title" className="relative isolate flex min-h-[100svh] items-end overflow-hidden pb-16 pt-32 sm:items-center sm:pb-0">
      <div className="absolute inset-0 -z-10">
        <Picture name="apex-one-rear" alt="" sizes="100vw" className="block h-full w-full" imgClassName="h-full w-full object-cover opacity-35 [object-position:50%_55%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      </div>
      <div className="container-x">
        <p className="micro text-volt">Erro 404 · Fora da pista</p>
        <h1 id="nf-title" className="display mt-6 text-[clamp(5rem,26vw,22rem)] leading-[0.8]">
          4<span className="text-volt">0</span>4
        </h1>
        <p className="mt-8 max-w-lg text-lg leading-relaxed text-silver">
          Não encontramos <span className="break-all font-mono text-sm text-paper">{pathname}</span>. A página pode ter mudado de lugar ou nunca ter existido.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/" className="btn btn-primary">
            Voltar ao início <span className="arrow" aria-hidden="true">→</span>
          </Link>
          <Link to="/modelos" className="btn btn-ghost">
            Ver modelos
          </Link>
        </div>
      </div>
    </section>
  );
}
