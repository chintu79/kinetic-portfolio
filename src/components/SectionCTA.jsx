import Magnet from './ui/magnet';
import { scrollToIdTarget } from '../scroll.js';

// Shared section CTA — the navbar LET' TALK button's visual language applied
// to every section so the page ends each chapter with the same invitation.
// Funnel-aware: early sections point at the work, late sections point at the footer closer.
export default function SectionCTA({ target = 'footer', label }) {
  return (
    <div className="section-cta">
      <Magnet padding={70} maxOffset={5} strength={4} spring={{ stiffness: 220, damping: 16, mass: 0.9 }}>
        <a className="letstalk-btn section-cta-btn" href={`#${target}`} onClick={(e) => { e.preventDefault(); scrollToIdTarget(target); }}>
          {label} <span className="letstalk-arrow" aria-hidden="true">↗</span>
        </a>
      </Magnet>
    </div>
  );
}
