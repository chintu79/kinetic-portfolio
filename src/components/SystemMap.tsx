import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import { gsap } from 'gsap';
import Particles from './ui/particles';
import ClickSpark, { type ClickSparkHandle } from './ui/click-spark';
import { AnimatedBeam } from './ui/animated-beam';
import { MagicCard } from './ui/magic-card';
import { SYSTEM_NODES, PROJECTS } from '../data.js';


const CORE = { x: 600, y: 330, r: 58 };
const VB = { w: 1200, h: 640 };

// AnimatedBeam draws in DOM pixels, the base SVG renders scaled — one viewBox
// ratio keeps every coordinate system aligned.
const coreCurvature = (n: (typeof SYSTEM_NODES)[number]) => (CORE.y - n.pos.y) / 2 + 40;
// Cross-domain links carry real information between domains (frontend serves the
// UI, backend answers, AI inference lands on infra). Labels describe the hop,
// not invented guarantees.
const CROSS_LINKS = [
  { a: 'frontend', b: 'backend', curvature: 128, tip: 'REQUEST / RESPONSE' },
  { a: 'backend', b: 'data', curvature: 70, tip: 'READS / WRITES' },
  { a: 'ai', b: 'infra', curvature: 70, tip: 'INFERENCE / DEPLOY' },
] as const;
const CORE_LINK_TIP: Record<string, string> = {
  frontend: 'REQUESTS',
  backend: 'ORCHESTRATION',
  data: 'PERSISTENCE',
  ai: 'INFERENCE',
  infra: 'DEPLOYMENT',
};
const EGG_SEQUENCE = ['frontend', 'backend', 'data', 'ai', 'infra'];

type Mode = 'overview' | 'dataflow' | 'dependencies';
const MODES: Array<{ id: Mode; label: string }> = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'dataflow', label: 'DATA FLOW' },
  { id: 'dependencies', label: 'DEPENDENCIES' },
];

const nodeById = (id: string) => SYSTEM_NODES.find((n) => n.id === id)!;
const crossPathD = (l: (typeof CROSS_LINKS)[number]) => {
  const A = nodeById(l.a).pos;
  const B = nodeById(l.b).pos;
  return `M ${A.x} ${A.y} Q ${(A.x + B.x) / 2} ${A.y - l.curvature} ${B.x} ${B.y}`;
};
const corePathD = (n: (typeof SYSTEM_NODES)[number]) =>
  `M ${CORE.x} ${CORE.y} Q ${(CORE.x + n.pos.x) / 2} ${CORE.y - coreCurvature(n)} ${n.pos.x} ${n.pos.y}`;
// Quadratic bezier point at t for HTML overlay positioning (percent coords).
const quadAt = (p0: number, pc: number, p2: number, t: number) =>
  (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * pc + t * t * p2;

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
};

export default function SystemMap({ onOpenProject }: { onOpenProject: (id: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('overview');
  const [sync, setSync] = useState(false);
  const [sequence, setSequence] = useState<string[]>([]);
  const [corePulse, setCorePulse] = useState(0);
  const [announce, setAnnounce] = useState('');
  const [stageSize, setStageSize] = useState({ w: VB.w, h: VB.h });

  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [mapPaused, setMapPaused] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sparkRef = useRef<ClickSparkHandle>(null);
  const coreBeamRef = useRef<SVGGElement>(null);
  const nodeRefMap = useRef(new Map<string, RefObject<SVGGElement | null>>());
  const getNodeRef = (id: string) => {
    let r = nodeRefMap.current.get(id);
    if (!r) {
      r = { current: null };
      nodeRefMap.current.set(id, r);
    }
    return r;
  };

  const scale = stageSize.w / VB.w;
  const activeId = hovered ?? (selected === 'system' ? null : selected);
  const coreActive = selected === 'system' || hovered === 'system';

  // ---- measurement (pixel-perfect beam/overlay alignment) ----
  useLayoutEffect(() => {
    if (!isDesktop) return undefined;
    const el = stageRef.current;
    if (!el) return undefined;
    const measure = () => {
      const w = el.clientWidth;
      if (w > 0) setStageSize({ w, h: Math.round((w * VB.h) / VB.w) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isDesktop]);

  // ---- GSAP boot: lines draw, nodes activate, core lands ----
  // Driven by one IntersectionObserver — ScrollTrigger could starve on
  // font-settle reflows / pre-mount jumps and strand the map at its
  // from-state (observed empty on fresh loads). Paused timeline + single
  // intersection trigger = deterministic; from-state renders at creation,
  // so there is no flash of the finished map before the boot plays.
  useEffect(() => {
    if (!isDesktop || reducedMotion || !wrapRef.current) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });
      tl.from('.smap-line', { strokeDashoffset: 1, duration: 0.9, stagger: 0.07, ease: 'power2.inOut' })
        .from('.smap-node', { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.6, stagger: 0.11, ease: 'back.out(1.6)' }, '-=0.55')
        .from('.smap-core', { scale: 0.6, opacity: 0, transformOrigin: '50% 50%', duration: 0.55, ease: 'power2.out' }, '-=0.45')
        .add(() => setCorePulse((p) => p + 1), '-=0.15');
      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          if (tl.progress() === 0) tl.play();
          io.disconnect();
        },
        { rootMargin: '160px 0px 160px 0px', threshold: 0 }
      );
      io.observe(wrapRef.current);
      // Cleanup: disconnect observer + revert tweens to natural state
      return () => io.disconnect();
    }, wrapRef);
    return () => ctx.revert();
  }, [isDesktop, reducedMotion]);

  // Off-screen / hidden-tab pause — the map's WebGL particles shouldn't
  // burn frames while the section isn't visible
  useEffect(() => {
    if (reducedMotion) return undefined;
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      (entries) => setMapPaused(!entries[entries.length - 1]?.isIntersecting),
      { rootMargin: '120px 0px 120px 0px' }
    );
    io.observe(el);
    const onVisibility = () => setMapPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion]);

  // ---- synchronized easter egg — temporary and reversible ----
  useEffect(() => {
    if (!sync) return undefined;
    const t = window.setTimeout(() => setSync(false), 3400);
    return () => window.clearTimeout(t);
  }, [sync]);

  const sparkAt = (clientX: number, clientY: number) => {
    if (!isDesktop) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    sparkRef.current?.spark(clientX - rect.left, clientY - rect.top);
  };
  const sparkAtNode = (id: string) => {
    if (!isDesktop) return;
    const el = id === 'system' ? coreBeamRef.current : nodeRefMap.current.get(id)?.current;
    const stage = stageRef.current?.getBoundingClientRect();
    if (!el || !stage) return;
    const r = el.getBoundingClientRect();
    sparkRef.current?.spark(r.left + r.width / 2 - stage.left, r.top + r.height / 2 - stage.top);
  };

  const selectNode = (id: string, viaEvent?: { clientX: number; clientY: number }) => {
    setSelected((cur) => {
      const next = cur === id ? null : id;
      if (next) {
        setCorePulse((p) => p + 1);
        setAnnounce(`${nodeById(next).label} selected`);
        if (next !== 'system') {
          setSequence((seq) => {
            const arr = [...seq, next].slice(-EGG_SEQUENCE.length);
            if (arr.join('>') === EGG_SEQUENCE.join('>')) {
              setSync(true);
              setAnnounce('System synchronized.');
              return [];
            }
            return arr;
          });
        }
      } else {
        setAnnounce('Selection cleared');
      }
      return next;
    });
    if (viaEvent) sparkAt(viaEvent.clientX, viaEvent.clientY);
    else sparkAtNode(id);
  };

  const selectCore = (viaEvent?: { clientX: number; clientY: number }) => {
    setSelected((cur) => {
      const next = cur === 'system' ? null : 'system';
      setAnnounce(next ? 'System overview selected' : 'Selection cleared');
      return next;
    });
    if (viaEvent) sparkAt(viaEvent.clientX, viaEvent.clientY);
    else sparkAtNode('system');
    setCorePulse((p) => p + 1);
  };

  const resetAll = () => {
    setSelected(null);
    setMode('overview');
    setSync(false);
    setSequence([]);
    setAnnounce('Map reset to overview');
  };

  // ---- which beams render ----
  const beamKeys = new Set<string>();
  const addCore = (id: string) => beamKeys.add(`core-${id}`);
  const addCross = (a: string, b: string) => beamKeys.add(`cross-${a}-${b}`);
  if (mode === 'dataflow') {
    SYSTEM_NODES.forEach((n) => addCore(n.id));
    addCross('frontend', 'backend');
    addCross('backend', 'data');
  } else if (mode === 'dependencies') {
    CROSS_LINKS.forEach((l) => addCross(l.a, l.b));
  }
  if (activeId && activeId !== 'system') {
    addCore(activeId);
    CROSS_LINKS.forEach((l) => {
      if (l.a === activeId || l.b === activeId) addCross(l.a, l.b);
    });
  }
  if (hoveredLine) beamKeys.add(hoveredLine);
  if (selected === 'system' || sync || hovered === 'system') {
    SYSTEM_NODES.forEach((n) => addCore(n.id));
    CROSS_LINKS.forEach((l) => addCross(l.a, l.b));
  }
  const lineHot = (key: string) => beamKeys.has(key);
  const lineDim = (key: string) => mode !== 'overview' && !lineHot(key) && !selected && !hovered;

  const coreD = (n: (typeof SYSTEM_NODES)[number]) => corePathD(n);

  // tip positioning (percent of stage)
  const tip = (() => {
    if (hoveredLine) {
      if (hoveredLine.startsWith('core-')) {
        const n = nodeById(hoveredLine.slice(5));
        const x = quadAt(CORE.x, (CORE.x + n.pos.x) / 2, n.pos.x, 0.5) / VB.w;
        const y = quadAt(CORE.y, CORE.y - coreCurvature(n), n.pos.y, 0.5) / VB.h;
        return { x: x * 100, y: y * 100, text: `CORE · ${CORE_LINK_TIP[n.id]}` };
      }
      const [a, b] = hoveredLine.replace('cross-', '').split('-');
      const l = CROSS_LINKS.find((cl) => cl.a === a && cl.b === b)!;
      const A = nodeById(l.a).pos;
      const B = nodeById(l.b).pos;
      const x = quadAt(A.x, (A.x + B.x) / 2, B.x, 0.5) / VB.w;
      const y = quadAt(A.y, A.y - l.curvature, B.y, 0.5) / VB.h;
      return { x: x * 100, y: y * 100, text: l.tip };
    }
    if (hovered && hovered !== 'system' && selected !== hovered) {
      const n = nodeById(hovered);
      return { x: (n.pos.x / VB.w) * 100, y: (n.pos.y / VB.h) * 100, text: `${n.label} — CLICK TO INSPECT` };
    }
    if (hovered === 'system' && selected !== 'system') {
      return { x: (CORE.x / VB.w) * 100, y: ((CORE.y - CORE.r) / VB.h) * 100, text: 'FULL-STACK AI · SYSTEM — EXPAND' };
    }
    return null;
  })();

  const onWrapKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setSelected(null);
  };

  // Clicking empty stage space closes the panel (v1 behavior) — never swallow
  // clicks on nodes, the panel itself, or the controls.
  const onWrapPointerDown = (e: React.PointerEvent) => {
    const t = e.target as HTMLElement;
    if (
      t.closest('.smap-panel-wrap') ||
      t.closest('.smap-node') ||
      t.closest('.smap-core') ||
      t.closest('.smap-controls') ||
      t.closest('.smap-list')
    ) {
      return;
    }
    setSelected(null);
  };

  const onNodeKeyDown = (id: string) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectNode(id);
    }
  };
  const onCoreKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      selectCore();
    }
  };

  // ---- shared detail content ----
  const sel = selected && selected !== 'system' ? nodeById(selected) : null;

  const projectLinks = (projects: string[]) => (
    <div className="smap-panel-projects">
      <div className="smap-panel-label">RELATED WORK</div>
      {projects.map((pid) => {
        const p = PROJECTS.find((pr) => pr.id === pid);
        return p ? (
          <button key={pid} className="smap-work-link" onClick={() => onOpenProject(pid)}>
            {p.title} →
          </button>
        ) : null;
      })}
    </div>
  );

  const panelInner = (
    <div className="smap-panel-body">
      <button className="smap-close" onClick={() => setSelected(null)} aria-label="Close panel">
        ✕
      </button>
      {sel ? (
        <>
          <h3>{sel.label}</h3>
          <p>{sel.blurb}</p>
          <div>{sel.tech.map((t) => <span key={t} className="smap-tag">{t}</span>)}</div>
          {projectLinks(sel.projects)}
        </>
      ) : (
        <>
          <h3>FULL-STACK AI · SYSTEM</h3>
          <p>
            One discipline, five domains. Everything shipped in the selected work travels the same
            path — interface, service, schema, model, deploy — composed as a single system rather
            than five separate skills.
          </p>
          <div className="smap-core-jump" role="group" aria-label="Jump to a domain">
            {SYSTEM_NODES.map((n) => (
              <button key={n.id} className="smap-core-chip" onClick={() => selectNode(n.id)}>
                {n.label}
              </button>
            ))}
          </div>
          <button className="smap-reset-inline" onClick={resetAll}>
            RESET TO OVERVIEW ↺
          </button>
        </>
      )}
    </div>
  );

  // Offset from the node's edge, not its center; clamp keeps every panel inside
  // the stage. At 310px wide, each side panel clears the neighbouring node's
  // click target (worst case is ~28px of edge).
  const panelTop = sel ? Math.min(Math.max(sel.pos.y, 205), 445) : 0;
  const nodeEdge = Math.round(52 * scale + 24);
  const panelStyle = sel
    ? {
        left: `${(sel.pos.x / VB.w) * 100}%`,
        top: `${(panelTop / VB.h) * 100}%`,
        transform:
          sel.pos.x >= VB.w / 2
            ? `translate(calc(-100% - ${nodeEdge}px), -50%)`
            : `translate(${nodeEdge}px, -50%)`,
      }
    : selected === 'system'
      ? { left: '12px', top: '40%', transform: 'translate(0, -50%)', width: 'min(330px, 88%)' }
      : undefined;

  const glowProps = isDesktop
    ? { mode: 'orb' as const, glowFrom: '#F47736', glowTo: '#F47736', glowOpacity: 0.5, glowSize: 340, glowBlur: 70 }
    : { mode: 'gradient' as const, gradientOpacity: 0, gradientFrom: '#F47736', gradientTo: '#3A3B36' };

  return (
    <div className="smap-wrap" ref={wrapRef} onKeyDown={onWrapKeyDown} onPointerDown={onWrapPointerDown}>
      {/* ======== DESKTOP STAGE — hidden below 1024px ======== */}
      {isDesktop && (
        <div
          className={`smap-stage${sync ? ' is-sync' : ''}`}
          ref={stageRef}
          aria-label="Interactive architecture map"
        >
          {/* Atmosphere — React Bits Particles (below everything, decorative) */}
          {!reducedMotion && (
            <Particles
              className="smap-particles"
              particleCount={85}
              particleSpread={9}
              speed={0.12}
              particleColors={['#F47736', '#F1EFE9']}
              moveParticlesOnHover
              particleHoverFactor={0.5}
              particleBaseSize={58}
              sizeRandomness={0.9}
              cameraDistance={20}
              glow={0.45}
              twinkle={0.22}
              depthOfField={0.15}
              connections
              connectionDistance={115}
              hoverEffect="parallax"
              hoverRadius={150}
              clickBurst={false}
              intro
              opacity={0.55}
              paused={mapPaused}
            />
          )}

          {/* Links layer — static connections, GSAP draw-on */}
          <svg
            className="smap-svg smap-svg-links"
            viewBox={`0 0 ${stageSize.w} ${stageSize.h}`}
            role="presentation"
            aria-hidden="true"
          >
            <g transform={`scale(${scale})`}>
              {SYSTEM_NODES.map((n) => {
                const key = `core-${n.id}`;
                return (
                  <path
                    key={key}
                    className={`smap-line${lineHot(key) ? ' hot' : ''}${lineDim(key) ? ' dim' : ''}`}
                    d={coreD(n)}
                    pathLength={1}
                    strokeDasharray={1}
                  />
                );
              })}
              {CROSS_LINKS.map((l) => {
                const key = `cross-${l.a}-${l.b}`;
                return (
                  <path
                    key={key}
                    className={`smap-line${lineHot(key) ? ' hot' : ''}${lineDim(key) ? ' dim' : ''}`}
                    d={crossPathD(l)}
                    pathLength={1}
                    strokeDasharray={1}
                  />
                );
              })}
              {/* fat invisible hit areas for connection hover */}
              {SYSTEM_NODES.map((n) => (
                <path
                  key={`hit-core-${n.id}`}
                  className="smap-hit"
                  d={coreD(n)}
                  onPointerEnter={() => setHoveredLine(`core-${n.id}`)}
                  onPointerLeave={() => setHoveredLine(null)}
                />
              ))}
              {CROSS_LINKS.map((l) => (
                <path
                  key={`hit-cross-${l.a}-${l.b}`}
                  className="smap-hit"
                  d={crossPathD(l)}
                  onPointerEnter={() => setHoveredLine(`cross-${l.a}-${l.b}`)}
                  onPointerLeave={() => setHoveredLine(null)}
                />
              ))}
            </g>
          </svg>

          {/* Active paths — Magic UI AnimatedBeam overlays the hot lines exactly */}
          {!reducedMotion &&
            [...beamKeys].map((key, i) => {
              if (key.startsWith('core-')) {
                const n = SYSTEM_NODES.find((node) => node.id === key.slice(5));
                if (!n) return null;
                return (
                  <AnimatedBeam
                    key={key}
                    containerRef={stageRef}
                    fromRef={coreBeamRef}
                    toRef={getNodeRef(n.id)}
                    curvature={coreCurvature(n) * scale}
                    pathWidth={2.1}
                    pathColor="#F47736"
                    pathOpacity={0.32}
                    gradientStartColor="#F47736"
                    gradientStopColor="#F1EFE9"
                    duration={2.1}
                    delay={i * 0.18}
                    repeatDelay={0.55}
                  />
                );
              }
              const [a, b] = key.replace('cross-', '').split('-');
              const l = CROSS_LINKS.find((cl) => cl.a === a && cl.b === b);
              if (!l) return null;
              return (
                <AnimatedBeam
                  key={key}
                  containerRef={stageRef}
                  fromRef={getNodeRef(l.a)}
                  toRef={getNodeRef(l.b)}
                  curvature={l.curvature * scale}
                  pathWidth={2.1}
                  pathColor="#F47736"
                  pathOpacity={0.32}
                  gradientStartColor="#F47736"
                  gradientStopColor="#F1EFE9"
                  duration={2.1}
                  delay={i * 0.18}
                  repeatDelay={0.55}
                />
              );
            })}

          {/* Nodes + core layer — sits above the beams so beam ends hide under nodes */}
          <svg
            className="smap-svg smap-svg-nodes"
            viewBox={`0 0 ${stageSize.w} ${stageSize.h}`}
            role="group"
            aria-label="System architecture map"
          >
            <g transform={`scale(${scale})`}>
              {/* core */}
              <g
                className={`smap-core${coreActive ? ' hot' : ''}`}
                transform={`translate(${CORE.x} ${CORE.y})`}
                role="button"
                tabIndex={0}
                aria-pressed={selected === 'system'}
                aria-label="Full-stack AI system — show system overview"
                ref={coreBeamRef}
                onClick={(e) => selectCore({ clientX: e.clientX, clientY: e.clientY })}
                onKeyDown={onCoreKeyDown}
                onPointerEnter={() => setHovered('system')}
                onPointerLeave={() => setHovered(null)}
              >
                {corePulse > 0 && <circle key={corePulse} className="smap-core-ring" r={CORE.r} />}
                <g className="node-inner">
                  <circle r={CORE.r} />
                  <text y="-4" textAnchor="middle" fontSize="12" letterSpacing="1.5">FULL-STACK</text>
                  <text y="12" textAnchor="middle" fontSize="12" letterSpacing="1.5">AI</text>
                  <text className="smap-sub" y="30" textAnchor="middle" fontSize="7" letterSpacing="2">SYSTEM</text>
                </g>
              </g>

              {/* domain nodes */}
              {SYSTEM_NODES.map((n) => (
                <g
                  key={n.id}
                  className={`smap-node${activeId === n.id ? ' hot' : ''}${sync ? ' sync' : ''}`}
                  transform={`translate(${n.pos.x} ${n.pos.y})`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selected === n.id}
                  aria-label={`${n.label}: ${n.tech.join(', ')}`}
                  ref={getNodeRef(n.id)}
                  onClick={(e) => selectNode(n.id, { clientX: e.clientX, clientY: e.clientY })}
                  onKeyDown={onNodeKeyDown(n.id)}
                  onPointerEnter={() => setHovered(n.id)}
                  onPointerLeave={() => setHovered(null)}
                >
                  <g className="node-inner">
                    <circle r="52" />
                    <text y="-4" textAnchor="middle" fontSize="10" letterSpacing="1.2">{n.label}</text>
                    <text className="smap-sub" y="12" textAnchor="middle" fontSize="7">
                      {n.tech.slice(0, 2).join(' · ').toUpperCase()}
                    </text>
                  </g>
                </g>
              ))}
            </g>
          </svg>

          {/* Click feedback — React Bits ClickSpark, fires only on selection */}
          <ClickSpark
            ref={sparkRef}
            className="smap-spark"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            sparkColor={['#F47736', '#F1EFE9']}
            sparkSize={11}
            sparkRadius={30}
            sparkCount={9}
            sparkWidth={2}
            duration={480}
            easing="ease-out"
            shape="streak"
            glow={0.4}
            randomness={0.25}
            disabled={false}
          />

          {/* Mode controls */}
          <div className="smap-controls" role="group" aria-label="Visualization mode">
            {MODES.map((m) => (
              <button
                key={m.id}
                className="smap-mode-btn"
                aria-pressed={mode === m.id}
                onClick={() => setMode((cur) => (cur === m.id ? 'overview' : m.id))}
              >
                {m.label}
              </button>
            ))}
            {(mode !== 'overview' || selected) && (
              <button className="smap-mode-btn smap-reset-btn" onClick={resetAll} aria-label="Reset map to overview">
                RESET ↺
              </button>
            )}
          </div>

          {/* Legend */}
          <div className="smap-legend" aria-hidden="true">
            <span className="smap-legend-item"><i className="lg lg-core" />CORE LINK</span>
            <span className="smap-legend-item"><i className="lg lg-cross" />DOMAIN LINK</span>
            <span className="smap-legend-item"><i className="lg lg-node" />DOMAIN</span>
            <span className="smap-legend-item smap-legend-hint">CLICK A NODE TO INSPECT</span>
          </div>

          {/* Contextual hover label */}
          {tip && (
            <div className="smap-tip" style={{ left: `${tip.x}%`, top: `${tip.y}%` }} aria-hidden="true">
              {tip.text}
            </div>
          )}

          {/* Easter egg — SYSTEM SYNCHRONIZED. */}
          {sync && <div className="smap-sync-badge" role="status">SYSTEM SYNCHRONIZED.</div>}

          {/* Desktop detail panel — Magic UI MagicCard (orb glow follows the pointer) */}
          {selected && (
            <div className="smap-panel-wrap" style={panelStyle} role="dialog" aria-label={sel ? `${sel.label} details` : 'System overview'}>
              <MagicCard {...glowProps} className="smap-panel-card">
                {panelInner}
              </MagicCard>
            </div>
          )}
        </div>
      )}

      {/* ======== MOBILE / TABLET LIST — preserved, restyled ======== */}
      {!isDesktop && (
        <div className="smap-list">
          {SYSTEM_NODES.map((n) => (
            <button
              key={n.id}
              className={`smap-row${selected === n.id ? ' active' : ''}`}
              onClick={() => selectNode(n.id)}
              aria-expanded={selected === n.id}
            >
              <span className="smap-row-label">{n.label}</span>
              <span className="smap-row-tech">{n.tech.join(' · ')}</span>
            </button>
          ))}
          {selected && (
            <MagicCard {...glowProps} className="smap-panel-card smap-panel-mobile-card">
              {panelInner}
            </MagicCard>
          )}
        </div>
      )}

      <p className="sr-only" role="status" aria-live="polite">{announce}</p>
    </div>
  );
}
