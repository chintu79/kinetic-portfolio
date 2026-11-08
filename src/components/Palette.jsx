import { useEffect, useMemo, useRef, useState } from 'react';
import useFocusTrap from '../hooks/useFocusTrap.js';
import { PROFILE } from '../data.js';

const ACTIONS = [
  { id: 'home', label: 'Go to Home', hint: 'top' },
  { id: 'about', label: 'Go to About', hint: '01' },
  { id: 'system', label: 'Go to System Map', hint: '02' },
  { id: 'work', label: 'Go to Work', hint: '03' },
  { id: 'experience', label: 'Go to Skills', hint: '04' },
  { id: 'footer', label: 'Go to Contact', hint: '05' },
  { id: 'terminal', label: 'Open Terminal', hint: '~' },
  { id: 'resume', label: 'View Resume', hint: 'PDF' },
];

export default function Palette({ onAction, onClose }) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);
  const overlayRef = useRef(null);
  useFocusTrap(overlayRef);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACTIONS;
    return ACTIONS.filter((a) => a.label.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    setIndex(0);
  }, [filtered.length]);

  const execute = (action) => {
    if (!action) return;
    if (action.id === 'resume') {
      window.open(PROFILE.resumeUrl, '_blank', 'noopener');
      onClose();
      return;
    }
    onAction(action.id);
    onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); execute(filtered[index]); }
    else if (e.key === 'Escape') onClose();
  };

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Command palette" onClick={onClose} ref={overlayRef}>
      <div className="palette" onClick={(e) => e.stopPropagation()} data-lenis-prevent>
        <input
          ref={inputRef}
          className="palette-input"
          placeholder="Type a command or search…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="Command input"
          autoComplete="off"
          spellCheck="false"
        />
        <div className="palette-list" role="listbox">
          {filtered.length === 0 && <div className="palette-empty">No results for “{query}”</div>}
          {filtered.map((action, i) => (
            <button
              key={action.id}
              role="option"
              aria-selected={i === index}
              className={`palette-item ${i === index ? 'selected' : ''}`}
              onMouseEnter={() => setIndex(i)}
              onClick={() => execute(action)}
            >
              <span>{action.label}</span>
              <span className="hint">{action.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
