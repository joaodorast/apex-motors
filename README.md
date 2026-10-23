# APEX MOTORS — site conceitual

Site de uma marca **fictícia** de hipercarros elétricos. React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Three.js.

## Rodar localmente (Prompt de Comando do Windows)

```cmd
cd apex-motors
npm install
npm run dev
```

Abra http://localhost:5173. Para o build de produção:

```cmd
npm run build
npm run preview
```

Requer Node.js 20.19+ (testado com Node 22).

## Páginas

| Rota | Conteúdo |
| --- | --- |
| `/` | Hero cinematográfico, manifesto, índice da linha, engenharia, atelier, prévia do configurador |
| `/modelos` | Catálogo dos quatro modelos |
| `/modelos/:slug` | `one`, `spectre`, `velocity`, `eon` — galeria, características e ficha técnica (fictícia) |
| `/configurador` | Configurador com persistência (localStorage) e URL compartilhável |
| `/engenharia` | Diagrama 3D interativo da plataforma + sistemas |
| `/galeria` | Filtros por tema e por modelo, visualização ampliada |
| `/sobre` | Filosofia conceitual da marca |
| `/contato` | Formulário validado |
| qualquer outra | 404 personalizada |

## Decisões importantes (e limites honestos)

- **Não há modelo 3D dos carros.** O 3D (`src/three/PlatformScene.ts`) é uma maquete técnica procedural da plataforma (bateria, motores, circuito térmico, fluxo de ar). O hero usa a fotografia enviada com uma camada WebGL opcional de partículas.
- **Configurador:** recolore pixel a pixel a foto de perfil (`assets-src/profile.png`) usando máscaras pré-calculadas (`profile-masks.png`: R = carroceria, G = linhas vermelhas, B = apliques inferiores). As rodas são SVG gerados em `src/configurator/wheels.ts`. A silhueta é a mesma para os quatro modelos — isso é informado na interface. Para trocar por um modelo 3D no futuro, substitua `CarCanvas` mantendo a mesma interface (`config: CarConfig`).
- **Formulário de contato:** não existe backend. Defina `VITE_CONTACT_ENDPOINT` (veja `.env.example`) para enviar um POST JSON real. Sem ela, o site valida, **não envia nada** e avisa o usuário.
- Todas as especificações são marcadas como fictícias.

## Imagens

Originais em `assets-src/`. Para regenerar as variantes AVIF/WebP, recortes de detalhe e o manifesto `src/data/images.gen.ts`:

```cmd
node scripts/optimize-images.mjs
```

## Performance e acessibilidade

- Rotas divididas por código; Three.js (≈133 KB gzip) só carrega na Engenharia ou, no hero, em dispositivos capazes (≥4 núcleos, sem economia de dados, sem `prefers-reduced-motion`, largura ≥768 px).
- A cena 3D pausa fora da tela e com a aba oculta, reduz a resolução automaticamente em GPUs lentas e libera o contexto WebGL ao sair da página.
- `prefers-reduced-motion` desliga animações, atrasos e o loop 3D contínuo.
- Navegação por teclado, link "pular para o conteúdo", foco visível, menu e lightbox com foco preso e `Esc`.

## Deploy

`vercel.json` já inclui o rewrite de SPA e cache longo para `/img` e `/assets`.
