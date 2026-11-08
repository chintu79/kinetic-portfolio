import SystemMap from './SystemMap.tsx';
import AnimatedContent from './ui/animated-content';
import SkillsConstellation from './SkillsConstellation.jsx';

import SectionCTA from './SectionCTA.jsx';

// System architecture map section
export function System({ onOpenProject }) {
  return (
    <section id="system" aria-label="System architecture map">
      <div className="container">
        <div className="section-head">
          <span className="section-label">02 / SYSTEM MAP · THE ENGINEERING ECOSYSTEM</span>
          <h2 className="h2">EVERYTHING<br />CONNECTS.</h2>
          <p className="section-support">A map of the technologies, disciplines and systems I bring together to build complete products.</p>
        </div>
        <SystemMap onOpenProject={onOpenProject} />
        <SectionCTA target="work" label="EXPLORE SELECTED WORK" />
      </div>
    </section>
  );
}

// Experience & skills
export function Experience() {
  return (
    <section id="experience" aria-label="Skills and technologies">
      <div className="container">
        <div className="section-head">
          <span className="section-label">04 / EXPERIENCE & SKILLS</span>
          <h2 className="h2">THE TOOLS BEHIND<br />THE THINKING.</h2>
          <p className="section-support">A collection of technologies, frameworks and tools I use to turn ideas into working systems.</p>
        </div>
        <SkillsConstellation />
        <SectionCTA target="footer" label="LET'S TALK" />
      </div>
    </section>
  );
}
