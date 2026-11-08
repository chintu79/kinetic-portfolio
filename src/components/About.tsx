import { useCallback, useEffect, useRef, useState } from 'react';
import DecryptedText from './ui/decrypted-text.jsx';
import TargetCursor from './ui/target-cursor';
import TextCursor from './ui/text-cursor';
import { Confetti, type ConfettiRef } from './ui/confetti';
import SectionCTA from './SectionCTA.jsx';

const PHILOSOPHY = [
  {
    n: '01',
    title: 'THINK IN SYSTEMS',
    line: 'Understanding the bigger picture before building individual components.',
  },
  {
    n: '02',
    title: 'BUILD WITH INTENTION',
    line: 'Choosing the right tools and making deliberate engineering decisions.',
  },
  {
    n: '03',
    title: 'EXPERIMENT CONSTANTLY',
    line: 'Exploring new technologies, challenging assumptions and learning through implementation.',
  },
];

export default function About() {
  const [egg, setEgg] = useState(false);
  const confettiRef = useRef<ConfettiRef>(null);
  const indexClicks = useRef<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const eggTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Triple-click Easter egg on the section index marker — burst at the cursor
  const onIndexClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const now = Date.now();
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    indexClicks.current = [...indexClicks.current.filter((t) => now - t < 2500), now];
    if (indexClicks.current.length >= 3) {
      indexClicks.current = [];
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) {
        confettiRef.current?.fire({
          particleCount: 55,
          spread: 75,
          startVelocity: 26,
          colors: ['#F47736', '#F1EFE9', '#777970'],
          origin: { x, y },
        });
      }
      setEgg(true);
      clearTimeout(eggTimer.current);
      eggTimer.current = setTimeout(() => setEgg(false), 3200);
    }
  }, []);

  useEffect(() => () => clearTimeout(eggTimer.current), []);

  return (
    <section id="about" className="about-section" aria-label="About" ref={sectionRef}>
      <TargetCursor
        targetSelector=".cursor-target"
        container={sectionRef}
        cursorColor="#F47736"
        cursorColorOnTarget="#F1EFE9"
        hideDefaultCursor
        blendMode="normal"
        spinDuration={2.4}
        hoverDuration={0.25}
        parallaxOn
      />

      <div className="container">
        <div className="about-head">
          <button className="about-index cursor-target" onClick={onIndexClick} aria-label="01 / About — hidden marker, three clicks">
            01 / ABOUT
          </button>
          <DecryptedText
            text="ABOUT / PERSONAL PROFILE"
            animateOn="view"
            effect="fade"
            speed={60}
            className="about-decrypt"
          />
        </div>
        <div className="about-rule" />

        {egg && (
          <div className="egg-badge" role="status">
            <strong>CURIOSITY REWARDED.</strong>
            <span>Good things happen when you explore.</span>
          </div>
        )}

        <div className="about-grid">
          <div className="about-left">
            <h2 className="about-heading cursor-target">
              ENGINEERING<br />
              WITH <span className="hl-slug">CURIOSITY.</span>
            </h2>
          </div>

          <div className="about-right">
            <p className="about-intro cursor-target">
              I&apos;m interested in the intersection of software engineering, artificial intelligence and
              thoughtful product design. I enjoy turning complex ideas into useful, scalable and intuitive
              digital experiences.
            </p>
            <div className="think-region cursor-target" aria-hidden="true">
              <span className="think-static">THINK · BUILD · EXPERIMENT</span>
              <TextCursor
                text="THINK · BUILD · EXPERIMENT"
                mode="ribbon"
                fontSize={19}
                spacing={22}
                color="#F1EFE9"
                fontWeight={600}
                smoothing={0.4}
                fade={0.35}
                exitDuration={0.6}
              />
            </div>
            <span className="sr-only">Think · Build · Experiment</span>
          </div>
        </div>

        <div className="philosophy-region" aria-label="Engineering philosophy">
          {PHILOSOPHY.map((item) => (
            <div className="philosophy-item" key={item.n}>
              <div className="philosophy-row cursor-target">
                <span className="philosophy-index">{item.n}</span>
                <span className="philosophy-body">
                  <span className="philosophy-title">
                    {item.n === '01' || item.n === '02' ? (
                      <span className="hl-line">{item.title}</span>
                    ) : (
                      item.title
                    )}
                  </span>
                  <span className="philosophy-line">{item.line}</span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <SectionCTA target="work" label="EXPLORE SELECTED WORK" />
        <Confetti ref={confettiRef} manualstart className="about-confetti" />
      </div>
    </section>
  );
}
