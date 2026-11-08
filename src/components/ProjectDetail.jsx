import { useEffect, useRef } from 'react';
import { PROJECTS } from '../data.js';
import useFocusTrap from '../hooks/useFocusTrap.js';

export default function ProjectDetail({ project, onClose, onPrev, onNext }) {
  const index = PROJECTS.findIndex((p) => p.id === project.id);
  const prev = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(index + 1) % PROJECTS.length];
  const backRef = useRef(null);
  const overlayRef = useRef(null);
  useFocusTrap(overlayRef);

  // Overlay owns its environment: lock background scroll (body + html — the
  // header scrollbar otherwise stays live), contain overscroll, focus the exit
  // control on open, restore focus to the invoker on close.
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    backRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return (
    <div className="detail" role="dialog" aria-modal="true" aria-label={`Project — ${project.title}`} ref={overlayRef} data-lenis-prevent>
      <div className="detail-inner">
        <div className="detail-topbar">
          <button className="btn-textlink" ref={backRef} onClick={onClose}>← Back to work</button>
          <span className="mono detail-count">{project.index} / 0{PROJECTS.length}</span>
        </div>

        <h1 className="detail-h1">{project.title}</h1>
        <div className="detail-meta">
          <span>{project.category}</span>
          <span>{project.stack}</span>
        </div>

        <div className="detail-preview work-preview" aria-hidden="true">
          <div className="work-preview-grid" />
          <span className="work-preview-index">{project.index}</span>
          <span className="work-preview-name">{project.title}</span>
          <span className="work-preview-tick work-preview-tick--tl" />
          <span className="work-preview-tick work-preview-tick--br" />
          <span className="work-preview-dot" />
        </div>

        <div className="detail-cols">
          <div>
            <div className="detail-block">
              <h3>PROBLEM</h3>
              <p>{project.problem}</p>
            </div>
            <div className="detail-block" style={{ marginTop: 28 }}>
              <h3>SOLUTION</h3>
              <p>{project.solution}</p>
            </div>
            <div className="detail-block" style={{ marginTop: 28 }}>
              <h3>KEY ENGINEERING DECISIONS</h3>
              <ul>{project.decisions.map((d) => <li key={d}>{d}</li>)}</ul>
            </div>
          </div>
          <div>
            <div className="detail-block">
              <h3>TECHNICAL ARCHITECTURE</h3>
              <p>{project.architecture}</p>
            </div>
            <div className="detail-block" style={{ marginTop: 28 }}>
              <h3>TECHNOLOGY STACK</h3>
              <p>{project.stack.split(' · ').join('  ·  ')}</p>
            </div>
            <div className="detail-links">
              <span className="detail-link-unavailable" aria-disabled="true" title="Live URL has not been published yet">
                DEMO — UNAVAILABLE
              </span>
              <span className="detail-link-unavailable" aria-disabled="true" title="Repository URL has not been published yet">
                SOURCE — UNAVAILABLE
              </span>
            </div>
          </div>
        </div>

        <div className="detail-nav">
          <button className="btn-textlink" onClick={() => onPrev(prev.id)}>← {prev.title}</button>
          <button className="btn-textlink" onClick={() => onNext(next.id)}>{next.title} →</button>
        </div>
      </div>
    </div>
  );
}
