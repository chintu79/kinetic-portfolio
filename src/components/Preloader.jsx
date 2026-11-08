import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { pauseLenis, resumeLenis } from '../scroll.js';

const LABELS = {
  init: 'INITIALIZING SYSTEMS',
  type: 'LOADING TYPEFACES',
  assets: 'LOADING ASSETS',
  anim: 'PREPARING EXPERIENCE',
  ready: 'READY',
};
// Canonical stage order (mount is instant, so it never owns a label).
const ORDER = ['type', 'assets', 'anim'];
const WEIGHTS = { mount: 15, type: 45, assets: 20, anim: 20 };
const MIN_DISPLAY = 700;   // anti-flash floor, not an artificial delay
const TYPE_TIMEOUT = 2500; // slow/blocked fonts must never stall the loader
const FAILSAFE = 4000;     // the loader can never outlive this
const WORD = 'SHREEKRISHNA';
// Odometer wheels: ones roll through every unit (0-9 ×10 + trailing 0),
// tens cover 0-10, hundreds stay pinned at 0 until the very last unit —
// a real odometer's first wheel barely moves until 99→100.
const WHEELS = [
  [0, 1],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
  Array.from({ length: 101 }, (_, i) => i % 10),
];

export default function Preloader({ onDone }) {
  const rootRef = useRef(null);
  const doneRef = useRef(false);
  const [st, setSt] = useState({ resolved: [], stage: 'init' });

  useEffect(() => {
    const root = rootRef.current;
    const html = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    html.classList.add('preloading');
    pauseLenis();
    const t0 = performance.now();

    let dead = false;
    let rolled = false;
    let exited = false;
    let target = 0;
    let cell = 1;
    const resolved = { mount: false, type: false, assets: false, anim: false };
    const driver = { v: 0 };

    // One driver object, no per-tick React state: each wheel's translate is a
    // continuous percentage-true roll (ones pos = v, tens = v/10, hundreds
    // pinned until v99), the hairline bar is v/100.
    const digits = root.querySelectorAll('.pre-digit');
    const setWheel = [...digits].map((el) => gsap.quickSetter(el.querySelector('.pre-strip'), 'y', 'px'));
    const setBar = gsap.quickSetter(root.querySelector('.pre-bar'), 'scaleX');
    const measure = () => {
      const h = digits[0]?.offsetHeight;
      if (h) cell = h;
    };
    const paint = () => {
      const v = Math.min(100, driver.v);
      setWheel[0](-Math.max(0, Math.min(1, v - 99)) * cell);
      // Decade-hold: the tens wheel sits on its digit for the whole decade and
      // only rolls during the final unit of it — a continuously-swept v/10
      // instead showed the next digit early (reads "008" from ~95).
      setWheel[1](-(Math.floor(v / 10) + Math.max(0, Math.min(1, (v % 10) - 9))) * cell);
      setWheel[2](-v * cell);
      setBar(v / 100);
    };
    measure();
    paint();
    const onResize = () => { measure(); paint(); };
    window.addEventListener('resize', onResize);

    const onDoneOnce = () => {
      if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    };

    // Exit — metadata slides away, then the overlay itself becomes the
    // curtain: it sweeps up while the composition inside parallaxes slower,
    // the progress hairline riding its bottom edge out. `krishna:reveal` is
    // dispatched at curtain START so Hero, canvases and navbar enter as one
    // continuous motion instead of two sequential animations.
    let tl = null;
    const exit = () => {
      if (exited || dead) return;
      exited = true;
      html.classList.remove('preloading');
      html.classList.add('kr-revealed');
      resumeLenis();
      window.dispatchEvent(new CustomEvent('krishna:reveal'));
      if (reduced) {
        requestAnimationFrame(onDoneOnce);
        return;
      }
      tl = gsap.timeline({ onComplete: onDoneOnce });
      tl.to(root.querySelectorAll('.pre-meta, .pre-status, .pre-note'), { y: -14, opacity: 0, duration: 0.4, ease: 'power2.in', stagger: 0.008 }, 0);
      tl.to(root, { yPercent: -100, duration: 1.05, ease: 'power4.inOut' }, 0.3);
      tl.to(root.querySelector('.pre-inner'), { yPercent: 18, duration: 1.05, ease: 'power4.inOut' }, 0.3);
    };

    const maybeRoll = () => {
      if (rolled || !Object.values(resolved).every(Boolean)) return;
      const wait = MIN_DISPLAY - (performance.now() - t0);
      if (wait > 0) {
        setTimeout(() => { if (!dead) maybeRoll(); }, wait + 10);
        return;
      }
      rolled = true;
      setSt((s) => ({ ...s, stage: 'ready' }));
      gsap.to(driver, { v: 100, duration: reduced ? 0.05 : 0.6, ease: 'power3.inOut', overwrite: true, onUpdate: paint, onComplete: exit });
    };

    const once = (key) => {
      if (dead || resolved[key]) return;
      resolved[key] = true;
      target += WEIGHTS[key];
      const next = ORDER.find((k) => !resolved[k]) || 'ready';
      setSt((s) => ({ resolved: [...s.resolved, key], stage: next }));
      gsap.to(driver, { v: target, duration: reduced ? 0.05 : 0.9, ease: 'power2.out', overwrite: true, onUpdate: paint });
      maybeRoll();
    };

    // Signal 1 — React/application mounted (the preloader mounts inside it).
    once('mount');

    // Signal 2 — critical typefaces (overlay + hero). Load + error both
    // release; a timeout keeps blocked font files from stalling anything.
    if (document.fonts?.load) {
      const settle = () => { clearTimeout(typeTimer); once('type'); };
      const typeTimer = setTimeout(settle, TYPE_TIMEOUT);
      Promise.all([
        document.fonts.load('700 100px "Space Grotesk"'),
        document.fonts.load('500 16px "Space Grotesk"'),
        document.fonts.load('400 16px Inter'),
        document.fonts.load('600 16px Inter'),
        document.fonts.load('400 16px "JetBrains Mono"'),
      ]).then(() => document.fonts.ready).catch(() => {}).finally(settle);
    } else once('type');

    // Signal 3 — every eager (above-the-fold) image; lazy/below-fold assets
    // are excluded by design. Load and error both count as handled.
    const eager = [...document.images].filter((img) => img.getAttribute('loading') !== 'lazy');
    if (!eager.length) once('assets');
    else Promise.all(eager.map((img) => (img.complete ? 0 : new Promise((res) => {
      img.addEventListener('load', res, { once: true });
      img.addEventListener('error', res, { once: true });
    })))).then(() => once('assets'), () => once('assets'));

    // Signal 4 — a painted, animation-ready frame (double rAF) with timer
    // fallback for throttled/rAF-less environments.
    const animTimer = setTimeout(() => once('anim'), 400);
    requestAnimationFrame(() => requestAnimationFrame(() => { clearTimeout(animTimer); once('anim'); }));

    // Fail-safe — force every pending signal wide open.
    const failsafe = setTimeout(() => { once('type'); once('assets'); once('anim'); }, FAILSAFE);

    // Entrance — wordmark characters rise out of their clips, metadata and
    // status fade up. Skipped entirely for reduced motion.
    const tweens = [];
    if (!reduced) {
      tweens.push(
        gsap.from(root.querySelectorAll('.pre-ch-i'), { yPercent: 130, duration: 0.85, ease: 'power3.out', stagger: 0.04, delay: 0.1 }),
        gsap.from(root.querySelectorAll('.pre-fade'), { y: 12, opacity: 0, duration: 0.55, ease: 'power2.out', stagger: 0.08, delay: 0.3 })
      );
    }

    return () => {
      dead = true;
      window.removeEventListener('resize', onResize);
      clearTimeout(animTimer);
      clearTimeout(failsafe);
      tweens.forEach((t) => t.kill());
      if (tl) tl.kill();
      gsap.killTweensOf(driver);
      html.classList.remove('preloading');
    };
  }, []);

  const live = LABELS[st.stage];
  const signalOf = { init: 'mount', type: 'type', assets: 'assets', anim: 'anim' };

  return (
    <div className="pre" ref={rootRef}>
      <div className="sr-only" role="status" aria-live="polite">{live}</div>
      <div className="pre-inner">
        <div className="pre-geo" aria-hidden="true"><i /><i /></div>

        <header className="pre-top">
          <p className="pre-word" aria-label="SHREEKRISHNA®">
            {WORD.split('').map((char, i) => (
              <span className="pre-ch" key={i} aria-hidden="true"><span className="pre-ch-i">{char}</span></span>
            ))}
            <span className="pre-ch pre-reg" aria-hidden="true"><span className="pre-ch-i">®</span></span>
          </p>
          <p className="pre-status pre-fade">
            <i className="pre-dot" aria-hidden="true" />
            <span>{live}</span>
          </p>
        </header>

        <ul className="pre-meta pre-fade" aria-hidden="true">
          {Object.keys(signalOf).map((k) => (
            <li
              key={k}
              className={k === st.stage ? 'is-active' : st.resolved.includes(signalOf[k]) ? 'is-done' : ''}
            >
              {LABELS[k]}
            </li>
          ))}
        </ul>

        <div className="pre-count-row" aria-hidden="true">
          <p className="pre-note pre-fade">PERCENT LOADED</p>
          <p className="pre-count">
            {WHEELS.map((cells, w) => (
              <span className="pre-digit" key={w}>
                <span className="pre-strip">
                  {cells.map((d, i) => <span key={i}>{d}</span>)}
                </span>
              </span>
            ))}
          </p>
        </div>

        <div className="pre-bar" aria-hidden="true" />
      </div>
    </div>
  );
}
