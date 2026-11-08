import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import TechText from '../components/ui/tech-text.jsx';
import ShinyText from '../components/ui/shiny-text';
import Magnet from '../components/ui/magnet';
import { InteractiveHoverButton } from '../components/ui/interactive-hover-button';
import { PROFILE } from '../data.js';

const scrollTo = (id: string) => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
};

const MARQUEE = [
  'ENGINEERING INTELLIGENCE',
  'REACT — NODE — PYTHON — LLMS',
  'FROM SCHEMA TO SHIPPED',
];

const HEAD_FONT = "'Space Grotesk', sans-serif";
const HEAD_LETTER = -0.045;
const HEAD_CAP = 150;

// Both headline lines must render at one locked size: TechText's per-string
// auto-fit lets the shorter line render larger than the width-clamped one.
// Mirrors tech-text.jsx's fit math (width*0.9, height*0.66) with a scratch
// canvas and returns the size both lines share exactly.
const lockHeadlineSize = (width: number, height: number) => {
  const probe = document.createElement('canvas').getContext('2d');
  if (!probe) return HEAD_CAP;
  const cap = (text: string) => {
    probe.font = `700 100px ${HEAD_FONT}`;
    if ('letterSpacing' in probe) probe.letterSpacing = `${HEAD_LETTER * 100}px`;
    const m = probe.measureText(text);
    const k = (m.actualBoundingBoxLeft + m.actualBoundingBoxRight) / 100 || 1;
    const kh = (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) / 100 || 1;
    return Math.min((width * 0.9) / k, (height * 0.66) / kh);
  };
  return Math.min(HEAD_CAP, cap('ENGINEERING'), cap('INTELLIGENCE.'));
};

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [headlineSize, setHeadlineSize] = useState(HEAD_CAP);
  // Preloader coordination — false until the loader's curtain starts, then
  // one state flip drives the DOM entrance AND flips the canvases from their
  // static render into their `metrics` intro (tech-text restarts its clock
  // on intro-kind change, so both start exactly at the reveal beat).
  const [revealed, setRevealed] = useState(() => document.documentElement.classList.contains('kr-revealed'));

  // Shared size lock — re-run on resize and once webfonts land (fallback-font
  // metrics differ, so the initial measurement is provisional).
  useLayoutEffect(() => {
    const head = headRef.current;
    if (!head) return undefined;
    let alive = true;
    const apply = () => {
      const line = head.querySelector<HTMLElement>('.hline');
      if (alive && line) setHeadlineSize(lockHeadlineSize(line.clientWidth, line.clientHeight));
    };
    apply();
    const resizeObserver = new ResizeObserver(apply);
    resizeObserver.observe(head);
    document.fonts?.ready.then(apply, apply);
    return () => {
      alive = false;
      resizeObserver.disconnect();
    };
  }, []);

  // Entrance choreography — one timeline scoped to the hero, gated on the
  // preloader's reveal; the canvases self-intro via tech-text's `intro`
  // (left-to-right glyph fills with measurement markers), so GSAP never
  // animates the h1 itself. Reduced motion ignores the gate entirely:
  // content sits at rest, canvases render static (intro stays 'none').
  useLayoutEffect(() => {
    const section = heroRef.current;
    if (!section || !revealed || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('.hero2-name', { y: 16, opacity: 0, duration: 0.55 }, 0)
        .from('.hero2-sub', { y: 18, opacity: 0, duration: 0.6 }, 0.95)
        .from('.hero2-cta > *', { y: 20, opacity: 0, duration: 0.55, stagger: 0.14 }, 1.3)
        .from('.hero2-meta', { y: 12, opacity: 0, duration: 0.5 }, 1.75);
    }, section);
    return () => ctx.revert();
  }, [revealed]);

  // Listen once for the curtain's reveal event (no-op if already revealed).
  useEffect(() => {
    if (revealed || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const onReveal = () => setRevealed(true);
    window.addEventListener('krishna:reveal', onReveal, { once: true });
    return () => window.removeEventListener('krishna:reveal', onReveal);
  }, [revealed]);

  // Cursor-responsive background grid — CSS var parallax, no per-frame layout
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;
    const grid = gridRef.current;
    const section = grid?.closest('.hero2');
    if (!grid || !section) return undefined;
    const onMove = (e: Event) => {
      const pe = e as PointerEvent;
      const rect = section.getBoundingClientRect();
      const x = ((pe.clientX - rect.left) / rect.width - 0.5) * 36;
      const y = ((pe.clientY - rect.top) / rect.height - 0.5) * 24;
      grid.style.setProperty('--mx', `${x.toFixed(1)}px`);
      grid.style.setProperty('--my', `${y.toFixed(1)}px`);
    };
    section.addEventListener('pointermove', onMove, { passive: true });
    return () => section.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <section className="hero2" ref={heroRef} id="top" aria-label="Hero">
      <div className="hero2-grid" ref={gridRef} aria-hidden="true" />

      <div className="hero2-inner">
        <span className="hero2-name">
          <span className="dot" aria-hidden="true" />
          <ShinyText
            color="#A6A39C"
            shineColor="#F1EFE9"
            speed={2.6}
            delay={3.2}
            shineWidth={110}
            angle={115}
            trigger="loop"
          >
            {PROFILE.wordmark.replace('®', '')} — {PROFILE.role.toUpperCase()}
          </ShinyText>
        </span>

        <h1 className="hero2-headline" ref={headRef} aria-label="ENGINEERING INTELLIGENCE.">
          <TechText
            text="ENGINEERING"
            fontFamily={HEAD_FONT}
            fontWeight={700}
            fontSize={headlineSize}
            letterSpacing={HEAD_LETTER}
            color="#F1EFE9"
            accentColor="#F47736"
            align="left"
            alignInset={0.02}
            reach={190}
            softness={0.72}
            strokeWidth={1.3}
            dashLength={5}
            dashGap={2}
            labels
            selection
            specks={12}
            draggable
            clickKick
            sweep
            intro={revealed ? 'metrics' : 'none'}
            className="hline"
          />
          <span className="headline-line-2">
            <TechText
              text="INTELLIGENCE."
              fontFamily={HEAD_FONT}
              fontWeight={700}
              fontSize={headlineSize}
              letterSpacing={HEAD_LETTER}
              color="#F1EFE9"
              accentColor="#F47736"
              align="left"
              alignInset={0.02}
              reach={190}
              softness={0.72}
              strokeWidth={1.3}
              dashLength={5}
              dashGap={2}
              labels
              selection
              specks={12}
              draggable
              clickKick
              sweep
              intro={revealed ? 'metrics' : 'none'}
              introDelay={0.55}
              accentChars={[12]}
              className="hline"
            />
          </span>
        </h1>

        <p className="hero2-sub">
          Full-stack AI Engineer building intelligent digital products and scalable software systems —
          from schema to shipped interface.
        </p>

        <div className="hero2-cta">
          <Magnet maxOffset={5} magnetStrength={2.6} padding={120}>
            <InteractiveHoverButton onClick={() => scrollTo('work')} className="ihh-hero">
              EXPLORE PROJECTS
            </InteractiveHoverButton>
          </Magnet>
          <a className="btn-hello" href={`mailto:${PROFILE.email}`} aria-label="Say hello — email SHREEKRISHNA">
            SAY HELLO <span className="btn-hello-arrow" aria-hidden="true">↗</span>
          </a>
        </div>

        <div className="hero2-meta">
          <span>BASED IN {PROFILE.location.toUpperCase()}</span>
          <span>BUILDING FOR THE WEB</span>
          <span>SCROLL TO EXPLORE</span>
        </div>
      </div>

      <div className="hero2-marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <span key={copy} style={{ display: 'inline-flex' }}>
              {[...MARQUEE, ...MARQUEE].map((item, i) => (
                <span className="marquee-item" key={`${copy}-${i}`}>
                  {item} <i>◆</i>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
