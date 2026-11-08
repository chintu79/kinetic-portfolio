import { useEffect, useRef } from 'react';

// SHREEKRISHNA® ORBIT/PRECISION cursor — one centralized state machine, one rAF loop,
// zero React state (nothing re-renders at pointer speed). Springs are hand-rolled.
// Regions opt into labels with data-cursor="view" (or .work-card / draggable classes).

type Mode = 'default' | 'link' | 'button' | 'view' | 'drag' | 'text' | 'about';

const LABELS: Partial<Record<Mode, string>> = {
  view: 'VIEW PROJECT ↗',
  drag: 'DRAG',
};

// Buttons/CTAs get the locked-in arrow; plain anchors just expand the reticle.
const BUTTON_SEL =
  'button, a.btn, a.btn-hello, a.letstalk-btn, a.case-study-btn, .ihh-button, .footer2-cta, .term-chip, .palette-item, .skills-tab, .skill-tile, .mobile-link, .reg-mark, .footer2-backtop, .about-index, .smap-mode-btn, .smap-close, .smap-work-link, .smap-core-chip, .smap-reset-inline, .smap-row, .smap-node, .smap-core, .smap-hit, .icon-btn';

const DRAG_SEL = '.icon-cloud__canvas, [data-draggable]';
const TEXT_SEL = 'input, textarea, select, [contenteditable]';

type S = { x: number; v: number };
const spr = (s: S, goal: number, k: number, d: number, dt: number) => {
  const h = dt / 2; // two substeps — stable at fast pointer speeds
  for (let i = 0; i < 2; i++) {
    s.v += (k * (goal - s.x) - d * s.v) * h;
    s.x += s.v * h;
  }
};

const centerOf = (el: Element) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

// Generic drag affordance: any element (or ancestor) advertising cursor: grab.
const grabAncestor = (t: Element | null): Element | null => {
  let n = t;
  while (n && n !== document.body) {
    if (n instanceof HTMLElement && /^(grab|grabbing)$/.test(getComputedStyle(n).cursor)) return n;
    n = n.parentElement;
  }
  return null;
};

const modeScale: Record<Mode, number> = { default: 1, link: 1.26, button: 1.14, view: 1.42, drag: 1.42, text: 1, about: 1 };

export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

    const mount = () => {
      const el = root.current;
      if (!el || !fine.matches) return undefined;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
      document.documentElement.classList.add('custom-cursor');

      const $ = <T extends HTMLElement>(sel: string) => el.querySelector(sel) as T;
      const ret = $<HTMLDivElement>('.cur-ret');
      const track = $<HTMLDivElement>('.cur-track');
      const dot = $<HTMLDivElement>('.cur-dot');
      const label = $<HTMLDivElement>('.cur-label');
      const labelText = $<HTMLSpanElement>('.cur-label-text');
      const arrow = $<HTMLDivElement>('.cur-arrow');
      const arrowRot = $<HTMLDivElement>('.cur-arrow-rot');
      const pulse = $<HTMLDivElement>('.cur-pulse');

      let px = -100, py = -100, raf = 0, last = 0;
      let mode: Mode = 'default';
      let center: { x: number; y: number } | null = null;
      let pressed = false;
      let spin = 0.35; // radians — segment offset; slow perpetual drift
      let spinBoost = 0;
      const RX: S = { x: -100, v: 0 }, RY: S = { x: -100, v: 0 };
      const TX: S = { x: -100, v: 0 }, TY: S = { x: -100, v: 0 };
      const RS: S = { x: 1, v: 0 };
      const MG: S = { x: 0, v: 0 };

      const apply = (m: Mode) => {
        if (m === mode) return;
        mode = m;
        el.dataset.mode = m;
        labelText.textContent = LABELS[m] ?? '';
        label.classList.toggle('show', !!LABELS[m]);
        spinBoost += 1.1; // segment kick on every state change
      };

      const resolve = (t: Element | null) => {
        let m: Mode = 'default';
        center = null;
        if (t) {
          // About keeps its own TargetCursor — the global reticle goes quiet there.
          if (t.closest('.about-section')) m = 'about';
          else if (t.closest(TEXT_SEL)) m = 'text';
          else if (t.closest('.work-card, [data-cursor="view"]')) m = 'view';
          else {
            const dragEl = t.closest(DRAG_SEL) ?? grabAncestor(t);
            if (dragEl) m = 'drag';
            else if (t.closest(BUTTON_SEL)) m = 'button';
            else if (t.closest('a')) m = 'link';
          }
          // Magnetic bias only for compact CTAs — never swallow the pointer on big targets.
          if (m === 'button') center = centerOf(t.closest(BUTTON_SEL) as Element);
        }
        apply(m);
      };

      const onMove = (e: MouseEvent) => {
        px = e.clientX; py = e.clientY;
        el.classList.add('cur-on');
      };
      const onOver = (e: MouseEvent) => {
        if (e.target instanceof Element) resolve(e.target);
      };
      const onScroll = () => { center = null; };
      const onDown = (e: MouseEvent) => {
        // About's TargetCursor handles its own click squeeze.
        if ((e.target as Element)?.closest?.('.about-section')) return;
        pressed = true;
        pulse.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        pulse.classList.remove('go');
        void pulse.offsetWidth;
        pulse.classList.add('go');
      };
      const onUp = () => { pressed = false; };
      const onLeave = () => { px = -100; py = -100; el.classList.remove('cur-on'); };

      const loop = (t: number) => {
        const dt = Math.min((t - last || 16) / 1000, 0.05);
        last = t;

        // magnetic bias toward compact CTA centers
        spr(MG, center && mode === 'button' && !pressed ? 0.42 : 0, 220, 26, dt);
        const gx = px + (center ? (center.x - px) * MG.x : 0);
        const gy = py + (center ? (center.y - py) * MG.x : 0);

        // reticle: tight spring, hair of a lag; tracker: slow orbiting follow
        spr(RX, gx, 380, 34, dt); spr(RY, gy, 380, 34, dt);
        spr(TX, px, 92, 19, dt); spr(TY, py, 92, 19, dt);
        spr(RS, modeScale[mode] * (pressed ? 0.84 : 1), 250, 21, dt);

        spin += (0.32 + Math.max(0, spinBoost) + (mode === 'drag' ? 1.1 : 0)) * dt;
        spinBoost += -spinBoost * Math.min(1, dt * 2.4);

        ret.style.transform = `translate3d(${RX.x}px, ${RY.x}px, 0) rotate(${spin}rad) scale(${RS.x})`;
        track.style.transform = `translate3d(${TX.x}px, ${TY.x}px, 0)`;
        dot.style.transform = `translate3d(${px}px, ${py}px, 0)`;
        label.style.transform = `translate3d(${RX.x}px, ${RY.x + 36}px, 0)`;
        arrow.style.transform = `translate3d(${RX.x}px, ${RY.x}px, 0)`;
        if (mode === 'button' && center) {
          const a = Math.atan2(center.y - py, center.x - px);
          arrowRot.style.transform = `rotate(${a}rad)`;
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      window.addEventListener('mousemove', onMove, { passive: true });
      window.addEventListener('pointerover', onOver, { passive: true });
      window.addEventListener('pointerdown', onDown, { passive: true });
      window.addEventListener('pointerup', onUp, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
      document.documentElement.addEventListener('mouseleave', onLeave);

      return () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('pointerover', onOver);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('scroll', onScroll);
        document.documentElement.removeEventListener('mouseleave', onLeave);
        document.documentElement.classList.remove('custom-cursor');
        el.dataset.mode = 'default';
      };
    };

    let cleanup: (() => void) | undefined = mount();
    const onChange = () => { cleanup?.(); cleanup = mount(); };
    fine.addEventListener('change', onChange);
    return () => { fine.removeEventListener('change', onChange); cleanup?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="cur" ref={root} data-mode="default" aria-hidden="true">
      <div className="cur-track" />
      <div className="cur-arrow">
        <div className="cur-arrow-rot">
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2.5 3 5 7l-2.5 4" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </div>
      </div>
      <div className="cur-ret">
        <svg width="44" height="44" viewBox="0 0 44 44">
          {/* segmented bezel */}
          <circle cx="22" cy="22" r="17" fill="none" stroke="currentColor" strokeWidth="1.2"
            strokeDasharray="15.5 11.2" transform="rotate(12 22 22)" />
          {/* cardinal bearings (measurement ticks) */}
          <line x1="22" y1="1" x2="22" y2="5" stroke="var(--accent)" strokeWidth="1.2" />
          <line x1="22" y1="39" x2="22" y2="43" stroke="var(--accent)" strokeWidth="1.2" />
          <line x1="1" y1="22" x2="5" y2="22" stroke="var(--accent)" strokeWidth="1.2" />
          <line x1="39" y1="22" x2="43" y2="22" stroke="var(--accent)" strokeWidth="1.2" />
          {/* inner crosshair */}
          <line x1="22" y1="9" x2="22" y2="13" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <line x1="22" y1="31" x2="22" y2="35" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <line x1="9" y1="22" x2="13" y2="22" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <line x1="31" y1="22" x2="35" y2="22" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        </svg>
      </div>
      <div className="cur-dot" />
      <div className="cur-label"><span className="cur-label-text" /></div>
      <div className="cur-pulse" />
    </div>
  );
}
