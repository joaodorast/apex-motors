import { Link } from 'react-router-dom';
import { PageIntro } from '../components/Blocks';
import { ApexMark } from '../components/Logo';
import { Picture } from '../components/Picture';
import { Reveal } from '../components/Reveal';
import { usePageMeta } from '../hooks/usePageMeta';

const PRINCIPLES = [
  { n: '01', t: 'Uma única linha', d: 'Cada carro APEX nasce de um traço contínuo. A luz, a aresta e o fluxo de ar seguem o mesmo caminho.' },
  { n: '02', t: 'Função antes do ornamento', d: 'Nenhuma entrada de ar falsa, nenhum detalhe sem propósito. Se está lá, trabalha.' },
  { n: '03', t: 'Desempenho que se repete', d: 'Velocidade só importa se puder ser sustentada. A gestão térmica é tão central quanto a potência.' },
  { n: '04', t: 'Silêncio como luxo', d: 'Um hipercarro elétrico pode ser brutal e sereno ao mesmo tempo. O silêncio é parte da experiência.' },
];

export default function About() {
  usePageMeta('Sobre a marca', 'A filosofia conceitual da APEX MOTORS: luz como estrutura, função antes do ornamento e desempenho sustentado. Marca fictícia.');

  return (
    <>
      <PageIntro eyebrow="Sobre a marca" title="Desenhada" light="no escuro.">
        A APEX MOTORS é uma marca fictícia, criada como exercício de design para imaginar como seria um fabricante de hipercarros elétricos que trata a luz como parte da estrutura.
      </PageIntro>

      <section aria-label="Imagem de abertura" className="container-x">
        <Reveal mode="mask" className="relative aspect-[16/10] overflow-hidden sm:aspect-[21/9]">
          <Picture name="spectre-rear" alt="APEX SPECTRE em preto fosco sob estrutura de concreto, com lanterna em lâmina acesa" sizes="100vw" className="block h-full w-full" imgClassName="h-full w-full object-cover [object-position:50%_62%]" />
        </Reveal>
      </section>

      <section aria-labelledby="origin-title" className="container-x grid gap-12 py-24 sm:py-32 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Reveal as="p" className="eyebrow">
            Origem do nome
          </Reveal>
          <Reveal className="mt-8">
            <ApexMark className="h-24 w-24 text-paper sm:h-32 sm:w-32" />
          </Reveal>
        </div>
        <div className="lg:col-span-8">
          <Reveal as="h2" mode="mask" className="text-balance text-[clamp(1.7rem,3.6vw,3.2rem)] font-light leading-[1.12] tracking-[-0.02em] [font-stretch:110%]">
            <span id="origin-title">
              O ápice de uma curva é o ponto em que o carro está mais perto do limite — e mais perto do controle. <span className="text-mute">É ali que a marca imaginária APEX quer viver.</span>
            </span>
          </Reveal>
          <Reveal as="p" delay={100} className="mt-10 max-w-2xl text-lg leading-relaxed text-silver">
            O símbolo é um ápice aberto, atravessado por uma linha de luz vermelha: a mesma assinatura que percorre a carroceria dos quatro modelos conceituais.
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="principles-title" className="bg-graphite py-24 sm:py-32">
        <div className="container-x">
          <Reveal as="h2" className="display text-[clamp(2.2rem,6vw,5.4rem)]">
            <span id="principles-title">Princípios</span>
          </Reveal>
          <ol className="mt-14 grid gap-px bg-silver/10 md:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <Reveal as="li" key={p.n} delay={(i % 2) * 90} className="bg-graphite p-7 sm:p-10">
                <span className="micro text-volt">{p.n}</span>
                <h3 className="mt-8 text-2xl font-semibold [font-stretch:115%] sm:text-3xl">{p.t}</h3>
                <p className="mt-4 max-w-md text-lg leading-relaxed text-silver">{p.d}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="honest-title" className="container-x grid gap-12 py-24 sm:py-32 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal mode="mask" className="aspect-square overflow-hidden">
            <Picture name="eon-wheel" alt="Roda de turbina do APEX EON em titânio escovado" sizes="(min-width: 1024px) 40vw, 100vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
          </Reveal>
        </div>
        <div className="flex flex-col justify-center lg:col-span-7">
          <Reveal as="p" className="eyebrow">
            Transparência
          </Reveal>
          <Reveal as="h2" delay={60} className="display mt-4 text-[clamp(2rem,4.4vw,4rem)]">
            <span id="honest-title">Um conceito,</span>
            <br />
            <span className="display-light text-silver">dito com clareza.</span>
          </Reveal>
          <Reveal delay={120}>
            <ul className="mt-8 space-y-4 text-lg leading-relaxed text-silver">
              <li className="flex gap-4">
                <span className="mt-3 h-px w-5 shrink-0 bg-volt" aria-hidden="true" />A APEX MOTORS não fabrica nem vende veículos. Marca, modelos e imagens fazem parte de um projeto conceitual.
              </li>
              <li className="flex gap-4">
                <span className="mt-3 h-px w-5 shrink-0 bg-volt" aria-hidden="true" />
                Todas as especificações são ilustrativas: não houve testes, homologações ou certificações.
              </li>
              <li className="flex gap-4">
                <span className="mt-3 h-px w-5 shrink-0 bg-volt" aria-hidden="true" />
                Não há parceiros, fábricas ou clientes associados à marca.
              </li>
            </ul>
          </Reveal>
          <Reveal delay={180} className="mt-10 flex flex-wrap gap-3">
            <Link to="/modelos" className="btn btn-primary">
              Ver a linha <span className="arrow" aria-hidden="true">→</span>
            </Link>
            <Link to="/contato" className="btn btn-ghost">
              Contato
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
