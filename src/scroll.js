// Single Lenis instance + scroll target helper shared by App, SectionCTA
// and the footer back-to-top. Falls back to native scrollIntoView when
// Lenis is disabled (reduced-motion) or the target is missing.
import Lenis from 'lenis';

let lenis = null;

export const startLenis = (options) => {
  if (lenis) return lenis;
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.4, ...options });
  return lenis;
};

export const stopLenis = () => {
  lenis?.destroy();
  lenis = null;
};

// Preloader hold: freeze smooth-scroll animation during the boot overlay so
// wheel input during loading can't queue a jump right after the reveal.
export const pauseLenis = () => lenis?.stop();
export const resumeLenis = () => lenis?.start();

export const scrollToIdTarget = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (lenis && !reduced) {
    lenis.scrollTo(el, { offset: -100 });
  } else {
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
};
