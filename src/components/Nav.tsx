import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { PROFILE } from '../data.js';
import GooeyNav from './ui/gooey-nav';
import useFocusTrap from '../hooks/useFocusTrap.js';
import ClickSpark, { type ClickSparkHandle } from './ui/click-spark';

export const scrollToId = (id: string) => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
};

const LINKS: Array<[string, string]> = [
  ['about', 'About'],
  ['system', 'Systems'],
  ['work', 'Work'],
  ['experience', 'Skills'],
  ['footer', 'Contact'],
];

const WORDMARK = PROFILE.wordmark.replace(/®/g, '');

export function Nav({
  active,
  scrolled,
  onMenu,
}: {
  active: string;
  scrolled: boolean;
  onTerminal: () => void;
  onPalette: () => void;
  onMenu: () => void;
}) {
  const sparkRef = useRef<ClickSparkHandle>(null);
  const eggClicks = useRef<number[]>([]);
  const eggCooldownUntil = useRef(0);
  const eggTimer = useRef<number | null>(null);
  const [eggVisible, setEggVisible] = useState(false);

  // Scrollspy-controlled GooeyNav — negative indexes (hero = no section in the
  // watch band) render with no active pill at all.
  const activeIndex = LINKS.findIndex(([id]) => id === active);

  useEffect(
    () => () => {
      if (eggTimer.current) window.clearTimeout(eggTimer.current);
    },
    []
  );

  // Wordmark easter egg: three consecutive clicks on ® within 1.4s -> tiny
  // orange sparkle burst + one line of copy. 8s cooldown, keyboard accessible,
  // reduced-motion respected.
  const onRegMarkClick = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const now = Date.now();
    eggClicks.current = [...eggClicks.current.filter((t) => now - t < 1400), now];
    if (eggClicks.current.length < 3) return;
    eggClicks.current = [];
    if (now < eggCooldownUntil.current) return;
    eggCooldownUntil.current = now + 8000;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      const rect = e.currentTarget.getBoundingClientRect();
      sparkRef.current?.spark(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
    setEggVisible(true);
    if (eggTimer.current) window.clearTimeout(eggTimer.current);
    eggTimer.current = window.setTimeout(() => setEggVisible(false), 2600);
  };

  // Direction-aware visibility: hide upward on scroll down past ~100px,
  // reveal on scroll up past a ~10px dead-zone. rAF-throttled, and React
  // only re-renders when the boolean actually flips. The mobile menu (rendered
  // by App into #mobile-menu) pins the bar visible while open.
  // Direction-aware visibility: hide upward on scroll down, reveal on scroll
  // up. Uses signed accumulation instead of single-step deltas so Lenis's
  // sub-pixel settle easing never flips the state (a -11px settle was
  // toggling the bar back). Hidden past 100px; React renders only when
  // the boolean flips; rAF-throttled; mobile menu pins it visible.
  const [hidden, setHidden] = useState(false);
  // Entrance slide-down only on top-of-page loads; mid-page (scroll-restored)
  // loads skip it so the direction-aware hidden state applies immediately.
  const [enterCls] = useState(() => (window.scrollY <= 100 ? ' nav-enter' : ''));
  const hiddenRef = useRef(false);
  const lastY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const scrollDelta = useRef(0);
  const scrollTicking = useRef(false);
  const setHiddenBoth = (v) => {
    hiddenRef.current = v;
    setHidden(v);
  };

  useEffect(() => {
    const onScroll = () => {
      if (scrollTicking.current) return;
      scrollTicking.current = true;
      window.requestAnimationFrame(() => {
        scrollTicking.current = false;
        const y = window.scrollY || document.documentElement.scrollTop || 0;
        const menuOpen = !!document.getElementById('mobile-menu');
        if (menuOpen || y <= 100) {
          if (hiddenRef.current) setHiddenBoth(false);
          scrollDelta.current = 0;
          lastY.current = y;
          return;
        }
        const delta = y - lastY.current;
        lastY.current = y;
        if (Math.abs(delta) < 2) return;
        scrollDelta.current += delta;
        if (scrollDelta.current > 26 && !hiddenRef.current) {
          setHiddenBoth(true);
          scrollDelta.current = 0;
        } else if (scrollDelta.current < -26 && hiddenRef.current) {
          setHiddenBoth(false);
          scrollDelta.current = 0;
        } else if (Math.sign(scrollDelta.current) !== Math.sign(delta)) {
          // direction reversed — start a fresh budget
          scrollDelta.current = delta;
        }
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}${hidden ? ' nav-hidden' : ''}${enterCls}`} aria-hidden={hidden || undefined}>
      <div className="nav-inner">
        {/* Left — wordmark (® is its own keyboard-accessible control) */}
        <div className="wordmark-wrap">
          <a className="wordmark" href="#top" onClick={(e) => { e.preventDefault(); scrollToId('top'); }}>
            {WORDMARK}
          </a>
          <button className="reg-mark" onClick={onRegMarkClick} aria-label="Registered trademark — click three times for a surprise">
            ®
          </button>
        </div>

        {/* Center — scrollspy-controlled GooeyNav (active = cream pill, charcoal ink) */}
        <GooeyNav
          className="nav-gooey"
          items={LINKS.map(([id, label]) => ({ label: label.toUpperCase(), href: `#${id}` }))}
          activeIndex={activeIndex}
          onChange={(index) => scrollToId(LINKS[index][0])}
          color="#F1EFE9"
          activeTextColor="#171817"
          particleCount={9}
          spread={44}
          animationTime={520}
          timeVariance={240}
          frame={false}
          size="md"
        />

        {/* Right — menu toggle (mobile) */}
        <div className="nav-right">
          <button className="icon-btn menu-toggle" onClick={onMenu} aria-label="Open menu" aria-controls="mobile-menu">
            <span className="menu-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {/* ® easter egg toast */}
      {eggVisible && (
        <div className="egg-toast" role="status" aria-live="polite">BUILT WITH CURIOSITY.</div>
      )}

      {/* Deliberate manual trigger for the ® burst — never fires on pointerdown elsewhere.
          Portaled to body: the header's backdrop-filter rebases fixed descendants to
          the header box, spilling this full-viewport overlay 15px past the edge. */}
      {createPortal(
        <ClickSpark
          ref={sparkRef}
          className="nav-spark"
          style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none' }}
          sparkColor={['#F47736', '#F1EFE9']}
          sparkSize={10}
          sparkRadius={26}
          sparkCount={12}
          sparkWidth={2}
          duration={520}
          easing="ease-out"
          shape="streak"
          glow={0.5}
          spread={360}
          randomness={0.3}
        />,
        document.body
      )}
    </header>
  );
}

const MOBILE_LINKS: Array<[string, string, string]> = [
  ['about', '01', 'About'],
  ['system', '02', 'Systems'],
  ['work', '03', 'Work'],
  ['experience', '04', 'Skills'],
  ['footer', '05', 'Contact'],
];

export function MobileMenu({ onNavigate, onClose }: { onNavigate: (id: string) => void; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef);

  // Lock background scroll while open + move focus into the dialog
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLElement>('.mobile-close')?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const select = (id: string) => {
    onNavigate(id);
    onClose();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" id="mobile-menu" ref={panelRef} onKeyDown={onKeyDown} data-lenis-prevent>
      <div className="mobile-menu-header">
        <span className="wordmark" style={{ color: 'var(--charcoal)' }}>{WORDMARK}<span className="reg-mark reg-mark-static" aria-hidden="true">®</span></span>
        <button className="icon-btn mobile-close" onClick={onClose} aria-label="Close menu">✕</button>
      </div>
      <ul className="mobile-links">
        {MOBILE_LINKS.map(([id, num, label], i) => (
          <li key={id} className="mobile-item" style={{ animationDelay: `${i * 75 + 90}ms` }}>
            <button className="mobile-link" onClick={() => select(id)}>
              <small>{num}</small>
              <span className="mobile-link-label">{label.toUpperCase()}</span>
              <span className="mobile-link-arrow" aria-hidden="true">→</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
