import { useEffect, useMemo, useRef, useState } from 'react';
import { SKILLS, PROJECTS } from '../data.js';
import { ICONS } from './skillsIcons.js';
import { IconCloud } from './ui/icon-cloud';
import LogoLoop from './ui/logo-loop';
import Magnet from './ui/magnet';

const CATEGORIES = [
  { id: 'ALL', label: 'ALL' },
  { id: 'FRONTEND', label: 'FRONTEND' },
  { id: 'BACKEND', label: 'BACKEND' },
  { id: 'AI / ML', label: 'AI / ML' },
  { id: 'TOOLS', label: 'TOOLS & WORKFLOW' },
];
const TIER_GLYPH = { 1: 34, 2: 30, 3: 26 };
const MERN_ORDER = ['react', 'nodejs', 'mongodb'];

const projectTitle = (id) => PROJECTS.find((p) => p.id === id)?.title ?? id;

function BrandMark({ skill, glyph }) {
  const mark = skill.slug ? ICONS[skill.slug] : null;
  // SVG always — the IconCloud sprite pipeline decodes via data-URI <img>,
  // which requires a valid, namespaced SVG document
  if (!mark) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        width={glyph}
        height={glyph}
        aria-hidden="true"
        focusable="false"
      >
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'JetBrains Mono', monospace"
          fontWeight={600}
          fontSize="34"
          letterSpacing="2"
          fill={skill.color}
        >
          {skill.name.slice(0, 2).toUpperCase()}
        </text>
      </svg>
    );
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={glyph}
      height={glyph}
      fill={skill.color}
      aria-hidden="true"
      focusable="false"
    >
      <path d={mark.path} />
    </svg>
  );
}

export default function SkillsConstellation() {
  const mernCooldown = useRef(0);
  const fullCooldown = useRef(0);
  const [filter, setFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [seq, setSeq] = useState([]);
  const [touched, setTouched] = useState(() => new Set());
  const [fullPulse, setFullPulse] = useState(false);
  const [seed, setSeed] = useState(0);
  const [toast, setToast] = useState(null);

  const selected = SKILLS.find((s) => s.id === selectedId) ?? null;
  const hoveredSkill = hovered !== null ? SKILLS[hovered] : null;

  const matches = (s) => filter === 'ALL' || s.cat === filter;
  const dimmedIndices = useMemo(
    () => new Set(SKILLS.map((s, i) => (matches(s) ? null : i)).filter((i) => i !== null)),
    [filter]
  );
  const cloudIcons = useMemo(
    () =>
      SKILLS.map((s) => (
        <BrandMark key={s.id} skill={s} glyph={100} />
      )),
    []
  );
  const selectedIndex = useMemo(
    () => (selectedId ? SKILLS.findIndex((s) => s.id === selectedId) : null),
    [selectedId]
  );

  // Keyboard: Escape closes the detail panel
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setSelectedId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId]);

  // Easter egg: consecutive React → Node.js → MongoDB
  useEffect(() => {
    const tail = seq.slice(-3);
    if (tail.length !== 3 || tail.join(',') !== MERN_ORDER.join(',')) return;
    const now = Date.now();
    if (now < mernCooldown.current) return;
    mernCooldown.current = now + 8000;
    showToast('MERN STACK DETECTED.');
  }, [seq]);

  // Easter egg: at least one technology from every category
  useEffect(() => {
    const cats = new Set([...touched].map((id) => SKILLS.find((s) => s.id === id)?.cat));
    if (cats.size < 4) return;
    const now = Date.now();
    if (now < fullCooldown.current) return;
    fullCooldown.current = now + 8000;
    setFullPulse(true);
    showToast('FULL-STACK MODE UNLOCKED.');
    setTouched(new Set());
    const t = window.setTimeout(() => setFullPulse(false), 1700);
    return () => window.clearTimeout(t);
  }, [touched]);

  const showToast = (text) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 2400);
  };

  const pick = (s) => {
    setSelectedId((cur) => (cur === s.id ? null : s.id));
    setSeq((q) => [...q.slice(-5), s.id]);
    setTouched((t) => new Set(t).add(s.id));
  };

  const byIndex = (i) => pick(SKILLS[i]);

  const doShuffle = () => setSeed((n) => n + 1);
  const setCategory = (c) => {
    setFilter(c);
    setSeed((n) => n + 1);
  };

  const usedProjects = selected?.projects ?? [];

  return (
    <div className="skills-constellation">
      <div className="skills-layout">
        {/* ===== LEFT (35%) — heading support, categories, detail panel ===== */}
        <aside className="skills-side">
          <div className="skills-tabs" role="group" aria-label="Filter technologies by category">
            {CATEGORIES.map(({ id, label }) => (
              <button
                key={id}
                className={`skills-tab${filter === id ? ' is-active' : ''}`}
                aria-pressed={filter === id}
                onClick={() => setCategory(id)}
              >
                {label}
                <span className="skills-tab-count">{id === 'ALL' ? SKILLS.length : SKILLS.filter((s) => s.cat === id).length}</span>
              </button>
            ))}
          </div>

          <div className="skills-detail" role="region" aria-label="Selected technology" aria-live="polite">
            {selected ? (
              <>
                <div className="skills-detail-top">
                  <span className="skills-detail-glyph" style={{ '--skill-color': selected.color }}>
                    <BrandMark skill={selected} glyph={40} />
                  </span>
                  <div className="skills-detail-head">
                    <h3 className="skills-detail-name">{selected.name}</h3>
                    <span className="skills-detail-cat">{CATEGORIES.find((c) => c.id === selected.cat)?.label ?? selected.cat}</span>
                  </div>
                </div>
                <p className="skills-detail-blurb">{selected.blurb}</p>
                <div className="skills-detail-row">
                  <span className="skills-detail-label">USED IN</span>
                  {usedProjects.length > 0 ? (
                    <span className="skills-detail-projects">
                      {usedProjects.map((id) => (
                        <span key={id} className="skills-project-chip">{projectTitle(id)}</span>
                      ))}
                    </span>
                  ) : (
                    <span className="skills-detail-none">Tooling & process — no single project tie</span>
                  )}
                </div>
                <p className="skills-detail-hint">ESC to close · click again to deselect</p>
              </>
            ) : (
              <>
                <p className="skills-detail-empty">SELECT A TECHNOLOGY</p>
                <p className="skills-detail-sub">
                  Click a mark in the constellation — drag to rotate, click to select. {SKILLS.length} technologies, zero proficiency fiction.
                </p>
              </>
            )}
          </div>

          <div className="skills-side-foot">
            <Magnet padding={50} disabled={false} magnetStrength={3}>
              <button className="skills-shuffle" onClick={doShuffle} aria-label="Shuffle constellation orientation">
                <span aria-hidden="true">&#8644;</span> SHUFFLE
              </button>
            </Magnet>
            <span className="skills-indicator" aria-hidden="true">
              SYSTEM COMPONENTS <strong>/ {SKILLS.length}</strong>
            </span>
          </div>
        </aside>

        {/* ===== RIGHT (65%) — the interactive constellation ===== */}
        <div className={`skills-universe${fullPulse ? ' is-fullstack' : ''}`}>
          <div className="skills-cloud-wrap">
            <IconCloud
              icons={cloudIcons}
              seed={seed}
              dimmedIndices={dimmedIndices}
              selectedIndex={selectedIndex}
              hoveredIndex={hovered}
              onIconClick={byIndex}
              onIconHover={setHovered}
              showControl={true}
            />
            {hoveredSkill && (
              <div className="skills-hover-name" aria-hidden="true">
                {hoveredSkill.name} <span>{hoveredSkill.cat}</span>
              </div>
            )}
          </div>

          {/* Mobile — tap-friendly responsive grid of real tiles */}
          <ul className="skills-tiles" aria-label="Technologies">
            {SKILLS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={[
                    'skill-tile',
                    `skill-tile--t${s.tier}`,
                    !matches(s) ? 'is-dimmed' : '',
                    selectedId === s.id ? 'is-selected' : '',
                  ].filter(Boolean).join(' ')}
                  style={{ '--skill-color': s.color }}
                  data-skill={s.id}
                  aria-pressed={selectedId === s.id}
                  aria-label={`${s.name} — ${s.cat}`}
                  onClick={() => pick(s)}
                >
                  <BrandMark skill={s} glyph={TIER_GLYPH[2]} />
                  <span className="skill-tip" aria-hidden="true">{s.name}</span>
                </button>
              </li>
            ))}
          </ul>

          {/* Visually hidden, fully focusable equivalents for keyboard & AT */}
          <ul className="sr-only" aria-label="Technology list">
            {SKILLS.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="sr-only-btn"
                  aria-pressed={selectedId === s.id}
                  aria-label={`${s.name} — ${s.cat}`}
                  onClick={() => pick(s)}
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ===== LogoLoop secondary rail ===== */}
      <div className="skills-strip">
        <LogoLoop
          ariaLabel="Technologies used"
          logos={SKILLS.map((s) => ({ node: <BrandMark skill={s} glyph={24} />, title: s.name, hoverColor: s.color, ariaLabel: s.name }))}
          speed={64}
          direction="left"
          logoHeight={24}
          gap={44}
          pauseOnHover
          fadeOut
          fadeOutWidth={0.16}
          draggable
          aria-label="Technology strip"
        />
      </div>

      {toast && (
        <div className="egg-toast" role="status" aria-live="polite">{toast}</div>
      )}
    </div>
  );
}
