import { useEffect, useRef, useState, useCallback } from 'react';
import { PROFILE } from '../data.js';
import ShinyText from './ui/shiny-text';
import TechText from './ui/tech-text.jsx';
import { scrollToIdTarget } from '../scroll.js';
import Magnet from './ui/magnet';
import Particles from './ui/particles';

const GITHUB = `https://${PROFILE.github}`;
const LINKEDIN = `https://${PROFILE.linkedin}`;
const COARSE = typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

export default function Footer() {
  const footerRef = useRef(null);
  const eggClicks = useRef([]);
  const cooldownUntil = useRef(0);
  const eggTimer = useRef(null);
  const [simulationPaused, setSimulationPaused] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const backTopTimer = useRef(null);
  const copiedTimer = useRef(null);
  const [eggVisible, setEggVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [launching, setLaunching] = useState(false);

  // Pause the simulation when the footer is off-screen — saves the rAF cost
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = footerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => setSimulationPaused(!entries[entries.length - 1]?.isIntersecting),
      { rootMargin: '120px 0px 120px 0px' }
    );
    io.observe(el);
    const onVisibility = () => setSimulationPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(
    () => () => {
      if (eggTimer.current) window.clearTimeout(eggTimer.current);
      if (backTopTimer.current) window.clearTimeout(backTopTimer.current);
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    },
    []
  );

  // Triple-click the wordmark → the closing easter egg
  const onWordmarkClick = () => {
    const now = Date.now();
    eggClicks.current = [...eggClicks.current.filter((t) => now - t < 1400), now];
    if (eggClicks.current.length < 3) return;
    eggClicks.current = [];
    if (now < cooldownUntil.current) return;
    cooldownUntil.current = now + 8000;
    setEggVisible(true);
    if (eggTimer.current) window.clearTimeout(eggTimer.current);
    eggTimer.current = window.setTimeout(() => setEggVisible(false), 2800);
  };

  // Existing contact action — copy the email (same behaviour as the Contact CTA)
  const onCopyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PROFILE.email);
      setCopied(true);
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy your email:', PROFILE.email);
    }
  }, []);

  const onBackTop = () => {
    setLaunching(true);
    if (backTopTimer.current) window.clearTimeout(backTopTimer.current);
    backTopTimer.current = window.setTimeout(() => setLaunching(false), 900);
    scrollToIdTarget('top');
  };

  return (
    <footer className="footer2" id="footer" aria-label="Footer — SHREEKRISHNA" ref={footerRef}>
      {/* ===== GRAVITY FIELD — interactive WebGL background (React Bits Particles) ===== */}
      <div className="footer2-bg" aria-hidden="true">
        <Particles
          particleCount={COARSE ? 130 : 420}
          particleSpread={11}
          speed={0.35}
          particleColors={['#F1EFE9', '#F1EFE9', '#F1EFE9', '#F47736', '#E0612A']}
          moveParticlesOnHover
          particleHoverFactor={3.4}
          hoverRadius={2.8}
          hoverEffect="attract"
          clickBurst
          connections
          connectionDistance={130}
          particleBaseSize={COARSE ? 54 : 72}
          sizeRandomness={1}
          cameraDistance={8.5}
          glow={1.7}
          twinkle={0.5}
          opacity={0.92}
          drift="up"
          driftSpeed={0.6}
          variation={0.7}
          intro
          paused={simulationPaused}
        />
      </div>

      {/* ===== Editorial composition ===== */}
      <div className="footer2-inner">
        <div className="footer2-top">
          <button className="footer2-wordmark" onClick={onWordmarkClick} aria-label="SHREEKRISHNA registered — click three times for a surprise">
            SHREEKRISHNA<span className="footer2-reg">®</span>
          </button>
          <div className="footer2-topright">
            <span className="footer2-availability-wrap">
              <ShinyText color="#A6A39C" shineColor="#F1EFE9" speed={3.2} delay={1.5} shineWidth={90} angle={115} trigger="loop" className="footer2-availability">
                AVAILABLE FOR OPPORTUNITIES
              </ShinyText>
            </span>
            <button className={`footer2-backtop${launching ? ' is-launching' : ''}`} onClick={onBackTop} aria-label="Back to top">
              <span className="footer2-backtop-arrow" aria-hidden="true">↑</span>
              <span className="footer2-backtop-text">BACK TO TOP</span>
            </button>
          </div>
        </div>

        <div className="footer2-mid">
          <h2 className="footer2-h2" aria-label="HAVE AN IDEA? LET’S BUILD SOMETHING.">
            <TechText text="HAVE AN IDEA?" fontFamily="'Space Grotesk', sans-serif" fontWeight={700} fontSize={150} letterSpacing={-0.045} color="#F1EFE9" accentColor="#F47736" align="left" reach={190} softness={0.72} strokeWidth={1.3} dashLength={5} dashGap={2} labels selection specks={12} draggable clickKick sweep intro="none" className="fline" />
            <TechText text="LET’S BUILD" fontFamily="'Space Grotesk', sans-serif" fontWeight={700} fontSize={150} letterSpacing={-0.045} color="#F1EFE9" accentColor="#F47736" align="left" reach={190} softness={0.72} strokeWidth={1.3} dashLength={5} dashGap={2} labels selection specks={12} draggable clickKick sweep intro="none" className="fline" />
            <TechText text="SOMETHING." fontFamily="'Space Grotesk', sans-serif" fontWeight={700} fontSize={150} letterSpacing={-0.045} color="#F47736" accentColor="#F1EFE9" align="left" reach={190} softness={0.72} strokeWidth={1.3} dashLength={5} dashGap={2} labels selection specks={12} draggable clickKick sweep intro="none" className="fline" />
          </h2>
          <p className="footer2-sub">A full-stack AI engineer at the intersection of software, AI and creative engineering — currently open to meaningful work.</p>
          <div className="footer2-ctarow">
            <Magnet padding={90} disabled={false} magnetStrength={2}>
              <button className="footer2-cta" onClick={onCopyEmail} aria-live="polite">
                <span className="footer2-cta-label">{copied ? 'EMAIL COPIED ✓' : "LET'S TALK"}</span>
                <span className="footer2-cta-arrow" aria-hidden="true">↗</span>
              </button>
            </Magnet>
            <span className="footer2-email">{PROFILE.email}</span>
          </div>
          <nav className="footer2-links" aria-label="Social links">
            <Magnet padding={34} disabled={false} magnetStrength={3}>
              <a className="footer2-link" href={`mailto:${PROFILE.email}`}>EMAIL <span aria-hidden="true">↗</span></a>
            </Magnet>
            <Magnet padding={34} disabled={false} magnetStrength={3}>
              <a className="footer2-link" href={GITHUB} target="_blank" rel="noreferrer">GITHUB <span aria-hidden="true">↗</span></a>
            </Magnet>
            <Magnet padding={34} disabled={false} magnetStrength={3}>
              <a className="footer2-link" href={LINKEDIN} target="_blank" rel="noreferrer">LINKEDIN <span aria-hidden="true">↗</span></a>
            </Magnet>
            <Magnet padding={34} disabled={false} magnetStrength={3}>
              <a className="footer2-link" href={PROFILE.resumeUrl} target="_blank" rel="noreferrer">RESUMÉ <span aria-hidden="true">↗</span></a>
            </Magnet>
          </nav>
        </div>

        <div className="footer2-bottom">
          <span>© 2026 SHREEKRISHNA® — ALL SYSTEMS OPERATIONAL.</span>
          <span className="footer2-bottom-right">DESIGNED &amp; ENGINEERED WITH INTENTION.</span>
        </div>
      </div>

      {eggVisible && (
        <div className="egg-toast" role="status" aria-live="polite">END OF PAGE. BEGINNING OF SOMETHING.</div>
      )}
    </footer>
  );
}
