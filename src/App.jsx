import { useCallback, useEffect, useRef, useState } from 'react';
import { PROJECTS } from './data.js';
import {
  System,
  Experience,
} from './components/Sections.jsx';
import Footer from './components/Footer.jsx';
import Work from './components/SelectedWork.jsx';
import { Nav, MobileMenu } from './components/Nav.tsx';
import Preloader from './components/Preloader.jsx';
import { startLenis, stopLenis, scrollToIdTarget } from './scroll.js';
import About from './components/About.tsx';
import Hero from './hero/Hero.tsx';
import Cursor from './components/Cursor.tsx';
import ProjectDetail from './components/ProjectDetail.jsx';
import Terminal from './components/Terminal.jsx';
import Palette from './components/Palette.jsx';

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('home');
  const [projectId, setProjectId] = useState(null);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [konami, setKonami] = useState(false);
  // True once per full page entry; Preloader unmounts itself via onDone.
  const [booting, setBooting] = useState(true);

  const idleTimer = useRef(null);
  const konamiProgress = useRef(0);

  // Lenis — whole-page smooth scroll (skipped under reduced-motion)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const instance = startLenis();
    let raf = 0;
    const loop = (time) => {
      instance.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      stopLenis();
    };
  }, []);

  const scrollToId = useCallback((id) => {
    scrollToIdTarget(id);
  }, []);

  // Nav shrink + scrollspy. Hysteresis on the compact toggle so scrollY
  // oscillating around the threshold can't thrash the layout.
  useEffect(() => {
    const onScroll = () =>
      setScrolled((cur) => {
        if (window.scrollY > 140) return true;
        if (window.scrollY < 100) return false;
        return cur;
      });
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const observer = new IntersectionObserver(
      (entries) => {
        // Last intersecting section wins; when the watch band is empty again
        // (hero) no section is active and the navbar shows no pill.
        let next = '';
        for (const entry of entries) {
          if (entry.isIntersecting) next = entry.target.id;
        }
        setActive(next || 'home');
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    for (const id of ['about', 'system', 'work', 'experience', 'footer']) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  // Idle easter egg — 30s without input dims the grid and flares the availability dot
  useEffect(() => {
    const reset = () => {
      document.documentElement.classList.remove('idle-mode');
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => document.documentElement.classList.add('idle-mode'), 30000);
    };
    reset();
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(idleTimer.current);
      document.documentElement.classList.remove('idle-mode');
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, []);

  // Global keys: ~ terminal, CMD/CTRL+K palette, ESC closes overlays / Konami
  useEffect(() => {
    const onKey = (e) => {
      const metaK = (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K');
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setTerminalOpen((v) => !v);
        return;
      }
      if (metaK) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape') {
        setTerminalOpen(false);
        setPaletteOpen(false);
        setMenuOpen(false);
        setProjectId(null);
        if (konami) setKonami(false);
        return;
      }
      // Konami sequence
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expected = KONAMI[konamiProgress.current];
      if (key === expected) {
        konamiProgress.current += 1;
        if (konamiProgress.current === KONAMI.length) {
          konamiProgress.current = 0;
          setKonami((v) => !v);
        }
      } else {
        konamiProgress.current = key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [konami]);

  useEffect(() => {
    document.documentElement.classList.toggle('konami', konami);
    return () => document.documentElement.classList.remove('konami');
  }, [konami]);

  const paletteAction = useCallback(
    (id) => {
      if (id === 'terminal') { setTerminalOpen(true); return; }
      scrollToId(id === 'home' ? 'top' : id);
    },
    [scrollToId]
  );

  const activeProject = projectId ? PROJECTS_BY_ID[projectId] : null;

  return (
    <>
      <a href="#about" className="mono" style={{ position: 'absolute', left: -9999, top: 8 }} onFocus={(e) => (e.target.style.left = '8px')} onBlur={(e) => (e.target.style.left = '-9999px')}>
        Skip to content
      </a>

      <Nav
        active={active}
        scrolled={scrolled}
        onTerminal={() => setTerminalOpen(true)}
        onPalette={() => setPaletteOpen(true)}
        onMenu={() => setMenuOpen(true)}
      />

      <main>
        <Hero />
        <About />
        <System onOpenProject={setProjectId} />
        <Work onOpenProject={setProjectId} />
        <Experience />
      </main>
      <Footer />

      {booting && <Preloader onDone={() => setBooting(false)} />}

      {activeProject && (
        <ProjectDetail
          project={activeProject}
          onClose={() => setProjectId(null)}
          onPrev={setProjectId}
          onNext={setProjectId}
        />
      )}
      {terminalOpen && (
        <Terminal
          onClose={() => setTerminalOpen(false)}
          onOpenProject={setProjectId}
          onContact={() => scrollToId('footer')}
        />
      )}
      {paletteOpen && <Palette onAction={paletteAction} onClose={() => setPaletteOpen(false)} />}
      {menuOpen && <MobileMenu onNavigate={scrollToId} onClose={() => setMenuOpen(false)} />}
      <Cursor />

      {konami && <div className="konami-badge">KONAMI MODE — ON · ESC TO EXIT</div>}
    </>
  );
}

const PROJECTS_BY_ID = Object.fromEntries(PROJECTS.map((p) => [p.id, p]));
