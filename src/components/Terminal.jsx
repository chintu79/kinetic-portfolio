import { useEffect, useRef, useState } from 'react';
import { PROJECTS, STACK, PROFILE } from '../data.js';
import useFocusTrap from '../hooks/useFocusTrap.js';

const CHIPS = ['help', 'about', 'projects', 'skills', 'contact', 'sudo hire-me', 'clear'];

const COMMANDS = {
  help: () => [
    'available commands:',
    '  help          show this list',
    '  about         who Shreekrishna is',
    '  projects      list selected work',
    '  skills        the technologies in the constellation',
    '  contact       how to reach me',
    '  sudo hire-me  request access',
    '  open <id>     open a project (e.g. open careeros)',
    '  clear         clear the terminal',
  ],
  about: () => [
    `${PROFILE.name} — ${PROFILE.role}.`,
    'I build intelligent digital products and scalable',
    'software systems — from schema to shipped interface.',
    'Focused on AI product engineering and honest execution.',
  ],
  projects: () => [
    'selected work:',
    ...PROJECTS.map((p) => `  ${p.index}  ${p.title} — ${p.category.toLowerCase()}`),
    '',
    'open one with: open <id>  (e.g. open careeros)',
  ],
  skills: () => STACK.flatMap(([group, list]) => [`${group.toLowerCase()}`, `  ${list}`]),
  contact: () => [
    `email     ${PROFILE.email}`,
    `github    ${PROFILE.github}`,
    `linkedin  ${PROFILE.linkedin}`,
    'scroll to the end of the page — the footer is the close.',
  ],
  socials: () => [
    `email     ${PROFILE.email}`,
    `github    ${PROFILE.github}`,
    `linkedin  ${PROFILE.linkedin}`,
  ],
  'sudo hire-me': () => ['Permission granted. Let\'s build something meaningful.'],
};

export default function Terminal({ onClose, onOpenProject, onContact }) {
  const overlayRef = useRef(null);
  useFocusTrap(overlayRef);
  const [lines, setLines] = useState([
    { id: 0, kind: 'muted', text: 'SHREEKRISHNA_TERMINAL — interactive session' },
    { id: 1, kind: 'muted', text: 'type "help" to see available commands' },
  ]);
  const [value, setValue] = useState('');
  const bodyRef = useRef(null);
  const inputRef = useRef(null);
  const idRef = useRef(2);
  const historyRef = useRef([]);
  const histIndexRef = useRef(-1);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const push = (kind, text) =>
    setLines((prev) => [...prev, ...(Array.isArray(text) ? text : [text]).map((t) => ({ id: idRef.current++, kind, text: t }))]);

  const run = (raw) => {
    const input = raw.trim();
    if (!input) return;
    historyRef.current = [...historyRef.current, input];
    histIndexRef.current = -1;
    push('prompt', `visitor@shreekrishna:~$ ${input}`);
    const lower = input.toLowerCase();

    if (lower === 'clear') {
      setLines([]);
      setValue('');
      return;
    }
    if (COMMANDS[lower]) {
      if (lower === 'sudo hire-me') {
        push('accent', COMMANDS[lower]()[0]);
        setLines((prev) => [...prev, { id: idRef.current++, kind: 'cta', text: '→ contact shreekrishna' }]);
      } else {
        push('out', COMMANDS[lower]());
      }
      setValue('');
      return;
    }
    if (lower.startsWith('open ')) {
      const target = lower.slice(5).trim();
      const project = PROJECTS.find((p) => p.id === target);
      if (project) {
        push('out', [`opening ${project.title}…`]);
        setValue('');
        onOpenProject(project.id);
        onClose();
        return;
      }
      push('error', `no project with id "${target}" — try "projects"`);
      setValue('');
      return;
    }
    push('error', `zsh: command not found: ${input} — type "help"`);
    setValue('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') { run(value); return; }
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const h = historyRef.current;
      if (!h.length) return;
      histIndexRef.current = histIndexRef.current === -1 ? h.length - 1 : Math.max(0, histIndexRef.current - 1);
      setValue(h[histIndexRef.current]);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const h = historyRef.current;
      const i = histIndexRef.current + 1;
      if (i >= h.length) { histIndexRef.current = -1; setValue(''); return; }
      histIndexRef.current = i;
      setValue(h[i]);
    }
  };

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Shreekrishna terminal" onClick={onClose} ref={overlayRef}>
      <div className="terminal" onClick={(e) => e.stopPropagation()} data-lenis-prevent>
        <div className="term-header">
          <div className="term-dots" aria-hidden="true">
            <span className="term-dot" /><span className="term-dot" /><span className="term-dot" />
          </div>
          <div className="term-title">SHREEKRISHNA_TERMINAL</div>
          <div className="term-status">INTERACTIVE SESSION</div>
          <button className="icon-btn" style={{ color: 'var(--off-white)' }} onClick={onClose} aria-label="Close terminal">✕</button>
        </div>
        <div className="term-body" ref={bodyRef}>
          {lines.map((line) =>
            line.kind === 'cta' ? (
              <button
                key={line.id}
                className="term-chip"
                style={{ marginTop: 4, background: 'var(--accent)', color: 'var(--deep-charcoal)' }}
                onClick={() => { onContact(); onClose(); }}
              >
                {line.text}
              </button>
            ) : (
              <div key={line.id} className={`term-line ${line.kind}`}>{line.text}</div>
            )
          )}
          <div className="prompt-row">
            <span className="prompt">visitor@shreekrishna:~$</span>
            <input
              ref={inputRef}
              className="term-input"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Terminal input"
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>
        <div className="term-chips">
          {CHIPS.map((chip) => (
            <button key={chip} className="term-chip" onClick={() => run(chip)}>{chip}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
