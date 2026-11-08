import { useEffect, useRef, useState } from 'react';
import { PROJECTS } from '../data.js';
import SpotlightCard from './ui/spotlight-card';
import TiltedCard from './ui/tilted-card';
import { BentoGrid } from './ui/bento-grid';
import { BorderBeam } from './ui/border-beam';
import { Marquee } from './ui/marquee';
import SectionCTA from './SectionCTA.jsx';

const STACK_STRIP = [
  'REACT', 'NEXT.JS', 'TYPESCRIPT', 'OPENAI', 'PYTHON',
  'LANGCHAIN', 'VOICE', 'NODE.JS', 'POSTGRESQL', 'THREE.JS', 'WEBGL',
];
const ids = PROJECTS.map((p) => p.id);
const byId = (id) => PROJECTS.find((p) => p.id === id);

// Blueprint-plate preview — CSS-drawn, no invented imagery. Ghost index + name
// on a hairline grid; actual screenshots would replace the plate later.
function GhostPreview({ project, className }) {
  return (
    <div className={`work-preview ${className ?? ''}`} aria-hidden="true">
      <div className="work-preview-grid" />
      <span className="work-preview-index">{project.index}</span>
      <span className="work-preview-name">{project.title}</span>
      <span className="work-preview-tick work-preview-tick--tl" />
      <span className="work-preview-tick work-preview-tick--br" />
      <span className="work-preview-dot" />
    </div>
  );
}

export default function Work({ onOpenProject }) {
  const sectionRef = useRef(null);
  const spamGuard = useRef(0);
  const eggClicks = useRef([]);
  const eggTimer = useRef(null);
  const [highlight, setHighlight] = useState(null);
  const [eggVisible, setEggVisible] = useState(false);

  const move = (dir) =>
    setHighlight((cur) => {
      const i = cur ? ids.indexOf(cur) : -1;
      return ids[(i + dir + ids.length) % ids.length];
    });

  // Section keyboard model: P/N cycle the highlighted card, Enter opens its
  // case study, Escape clears. Native button activation is left alone.
  const onKeyDown = (e) => {
    const t = e.target;
    if (t instanceof HTMLElement) {
      const tag = t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable) return;
      const interactive = tag === 'BUTTON' || tag === 'A';
      if (e.key === 'p' || e.key === 'P') { e.preventDefault(); move(-1); return; }
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); move(1); return; }
      if (e.key === 'Enter' && highlight && !interactive) { e.preventDefault(); onOpenProject(highlight); return; }
      if (e.key === 'Escape') setHighlight(null);
    }
  };

  useEffect(() => () => { if (eggTimer.current) window.clearTimeout(eggTimer.current); }, []);

  // Triple-click the featured index number → BUILT, NOT IMAGINED.
  const onIndexEgg = () => {
    const now = Date.now();
    eggClicks.current = [...eggClicks.current.filter((t) => now - t < 1400), now];
    if (eggClicks.current.length < 3) return;
    eggClicks.current = [];
    if (now < spamGuard.current) return;
    spamGuard.current = now + 8000;
    setEggVisible(true);
    if (eggTimer.current) window.clearTimeout(eggTimer.current);
    eggTimer.current = window.setTimeout(() => setEggVisible(false), 2600);
  };

  const secondary = ['grammitra-ai', 'developer-second-brain'];
  const wide = byId('interactive-3d-experience');

  return (
    <section
      id="work"
      className="work-section"
      aria-label="Selected work"
      ref={sectionRef}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="container">
        <div className="section-head">
          <span className="section-label">03 / SELECTED WORK</span>
          <h2 className="h2">IDEAS, ENGINEERED<br />INTO REALITY.</h2>
          <p className="section-support">Selected projects at the intersection of software, AI and creative engineering.</p>
        </div>

        <BentoGrid>
          {/* ===== FEATURED — CAREEROS ===== */}
          <article className="work-card work-featured" data-highlighted={highlight === 'careeros' ? '' : undefined}>
            <BorderBeam
              className="work-beam"
              size={90}
              duration={7}
              delay={0.4}
              borderWidth={1}
              colorFrom="#F47736"
              colorTo="#E0612A"
              initialOffset={15}
            />
            <TiltedCard
              className="work-featured-tilt"
              containerHeight="var(--featured-h, 340px)"
              containerWidth="100%"
              imageHeight="var(--featured-h, 340px)"
              imageWidth="100%"
              rotateAmplitude={6}
              scaleOnHover={1.035}
              smoothness={0.72}
              glare={0.38}
              glareColor="#F47736"
              shadow={0.6}
              parallax={1.2}
              axis="both"
              gyroscope={false}
              trackWindow={false}
              floating={false}
              flipOnClick={false}
              intro={false}
              radius={4}
              onClick={() => onOpenProject('careeros')}
              captionText="Open the CAREEROS case study"
              showTooltip={false}
              altText="CAREEROS — project preview"
            >
              <GhostPreview project={byId('careeros')} featured />
            </TiltedCard>
            <div className="work-featured-body">
              <div className="work-featured-head">
                <button
                  className="work-index-btn"
                  onClick={onIndexEgg}
                  aria-label="Featured project number — click three times for a surprise"
                >
                  01
                </button>
                <div className="work-featured-title">
                  <h3 className="work-title">CAREEROS</h3>
                  <p className="work-cat">{byId('careeros').category}</p>
                </div>
                <span className="work-flag">FEATURED</span>
              </div>
              <p className="work-desc">{byId('careeros').description}</p>
              <p className="work-stack">{byId('careeros').stack.split(' · ').join('  ·  ')}</p>
              <div className="work-featured-foot">
                <button className="case-study-btn" onClick={() => onOpenProject('careeros')}>
                  CASE STUDY <span aria-hidden="true">↗</span>
                </button>
                <span className="work-kbd-hint" aria-hidden="true"><kbd>P</kbd> PREV <kbd>N</kbd> NEXT <kbd>↵</kbd> OPEN</span>
              </div>
            </div>
          </article>

          {/* ===== SECONDARY PAIR ===== */}
          {secondary.map((id) => {
            const p = byId(id);
            return (
              <button
                key={id}
                className={`work-card work-secondary work-${id === 'grammitra-ai' ? 'grammitra' : 'brain'}`}
                data-highlighted={highlight === id ? '' : undefined}
                onClick={() => onOpenProject(id)}
                aria-label={`Open the ${p.title} case study`}
              >
                <SpotlightCard
                  className="work-spotlight"
                  spotlightColor="#F47736"
                  intensity={0.24}
                  spotlightSize={300}
                  softness={0.72}
                  borderGlow={0.55}
                  proximity={110}
                  theme="dark"
                >
                  <GhostPreview project={p} />
                </SpotlightCard>
                <div className="work-secondary-body">
                  <div className="work-secondary-top">
                    <span className="work-index">{p.index}</span>
                    <span className="work-secondary-titlerow">
                      <span className="work-title">{p.title}</span>
                      <span className="work-cat">{p.category}</span>
                    </span>
                    <span className="work-arrow" aria-hidden="true">↗</span>
                  </div>
                  <span className="work-desc">{p.description}</span>
                  <span className="work-stack">{p.stack.split(' · ').join('  ·  ')}</span>
                </div>
              </button>
            );
          })}

          {/* ===== WIDE FINALE — INTERACTIVE 3D EXPERIENCE ===== */}
          <button
            className="work-card work-wide"
            data-highlighted={highlight === wide.id ? '' : undefined}
            onClick={() => onOpenProject(wide.id)}
            aria-label={`Open the ${wide.title} case study`}
          >
            <span className="work-wide-info">
              <span className="work-wide-head">
                <span className="work-index">{wide.index}</span>
                <span className="work-wide-title">
                  <span className="work-title">{wide.title}</span>
                  <span className="work-cat">{wide.category}</span>
                </span>
                <span className="work-arrow" aria-hidden="true">↗</span>
              </span>
              <span className="work-desc">{wide.description}</span>
              <span className="work-stack">{wide.stack.split(' · ').join('  ·  ')}</span>
            </span>
            <SpotlightCard
              className="work-spotlight work-wide-preview"
              spotlightColor="#F47736"
              intensity={0.24}
              spotlightSize={320}
              softness={0.72}
              borderGlow={0.55}
              proximity={120}
              theme="dark"
            >
              <GhostPreview project={wide} />
            </SpotlightCard>
          </button>
        </BentoGrid>

        {/* Tech strip — only technologies actually used above */}
        <div className="work-foot">
          <Marquee pauseOnHover repeat={3} className="work-foot-marquee">
            {STACK_STRIP.map((t) => (
              <span key={t} className="work-marquee-item">{t}<i aria-hidden="true">◆</i></span>
            ))}
          </Marquee>
          <span className="work-kbd-hint work-foot-hint" aria-hidden="true"><kbd>P</kbd> PREV <kbd>N</kbd> NEXT <kbd>↵</kbd> OPEN <kbd>ESC</kbd> CLOSE</span>
        </div>

        <SectionCTA target="footer" label="LET'S TALK" />
      </div>

      {eggVisible && <div className="egg-toast" role="status" aria-live="polite">BUILT, NOT IMAGINED.</div>}
    </section>
  );
}
