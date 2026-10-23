import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import Home from './pages/Home';

const Models = lazy(() => import('./pages/Models'));
const ModelDetail = lazy(() => import('./pages/ModelDetail'));
const Configurator = lazy(() => import('./pages/Configurator'));
const Engineering = lazy(() => import('./pages/Engineering'));
const Gallery = lazy(() => import('./pages/Gallery'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}

function PageFallback() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center" role="status" aria-live="polite">
      <span className="micro flex items-center gap-3 text-mute">
        <span className="h-px w-10 origin-left bg-volt [animation:line-grow_1.2s_var(--ease-sweep)_infinite_alternate]" />
        Carregando
      </span>
    </div>
  );
}

function Layout() {
  const { pathname } = useLocation();
  return (
    <>
      <a href="#conteudo" className="btn btn-primary fixed left-4 top-4 z-[100] -translate-y-24 focus:translate-y-0">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Suspense fallback={<PageFallback />}>
          <div key={pathname} className="route-in">
            <Outlet />
          </div>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="modelos" element={<Models />} />
          <Route path="modelos/:slug" element={<ModelDetail />} />
          <Route path="configurador" element={<Configurator />} />
          <Route path="engenharia" element={<Engineering />} />
          <Route path="galeria" element={<Gallery />} />
          <Route path="sobre" element={<About />} />
          <Route path="contato" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
