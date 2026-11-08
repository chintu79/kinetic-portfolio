// Edit in one place — these replace placeholders at the top of each file.
export const PROFILE = {
  name: 'Shreekrishna',
  wordmark: 'SHREEKRISHNA®',
  role: 'Full-stack AI Engineer',
  // Your own address — swap if different.
  email: 'shrikrishnachinta79@gmail.com',
  location: 'India',
  github: 'github.com/chintu79',
  linkedin: 'linkedin.com/in/shreekrishna-chinta',
  resumeUrl: '/resume.pdf',
};

export const STACK = [
  ['FRONTEND', 'React · Next.js · TypeScript · JavaScript · Three.js · Tailwind CSS'],
  ['BACKEND', 'Node.js · Express · FastAPI · PostgreSQL · MongoDB · Socket.io'],
  ['AI / ML', 'Python · LangChain · TensorFlow · Ollama · Whisper · OpenAI'],
  ['TOOLS', 'Git · GitHub · Docker · Linux · Figma · Vite'],
];

// System architecture map — illustrative, not a live dashboard.

// Skills constellation — inventory verified against project data + existing site content.
// Categories: FRONTEND, BACKEND, AI / ML, TOOLS. `projects` ties are the only ones
// claimed verbatim from project stacks/architectures.
export const SKILLS = [
  // FRONTEND
  { id: 'react', name: 'React', cat: 'FRONTEND', tier: 1, slug: 'siReact', color: '#61DAFB',
    blurb: 'Component architecture for product shells — from career workspace UI to the 3D experience hero.',
    projects: ['careeros', 'developer-second-brain', 'interactive-3d-experience'] },
  { id: 'nextjs', name: 'Next.js', cat: 'FRONTEND', tier: 1, slug: 'siNextdotjs', color: '#FFFFFF',
    blurb: 'App Router, API routes and SSR for CAREEROS — the framework this site does not use, on purpose.',
    projects: ['careeros'] },
  { id: 'typescript', name: 'TypeScript', cat: 'FRONTEND', tier: 1, slug: 'siTypescript', color: '#3178C6',
    blurb: 'Typed contracts from schema to surface — the default on anything that has to be maintained.',
    projects: ['careeros'] },
  { id: 'threejs', name: 'Three.js', cat: 'FRONTEND', tier: 2, slug: 'siThreedotjs', color: '#FFFFFF',
    blurb: 'Sculpture-grade 3D for the interactive experience — GPU-budgeted, reduced-motion safe.',
    projects: ['interactive-3d-experience'] },
  { id: 'javascript', name: 'JavaScript', cat: 'FRONTEND', tier: 2, slug: 'siJavascript', color: '#F7DF1E',
    blurb: 'The language every interface on this page runs on — idiomatic, tested, readable.',
    projects: ['developer-second-brain', 'interactive-3d-experience', 'careeros'] },
  { id: 'tailwind', name: 'Tailwind CSS', cat: 'FRONTEND', tier: 2, slug: 'siTailwindcss', color: '#06B6D4',
    blurb: 'Utility-first styling where speed of iteration matters — design tokens first, utilities second.',
    projects: [] },
  // BACKEND
  { id: 'nodejs', name: 'Node.js', cat: 'BACKEND', tier: 1, slug: 'siNodedotjs', color: '#5FA04E',
    blurb: 'API surfaces and service composition — TypeScript contracts over bare wire.',
    projects: ['developer-second-brain'] },
  { id: 'express', name: 'Express', cat: 'BACKEND', tier: 2, slug: 'siExpress', color: '#FFFFFF',
    blurb: 'Minimal HTTP layer under the Second Brain API — deliberately boring, fully tested paths.',
    projects: ['developer-second-brain'] },
  { id: 'postgresql', name: 'PostgreSQL', cat: 'BACKEND', tier: 1, slug: 'siPostgresql', color: '#4169E1',
    blurb: 'Relational rigor where it pays — schema, migrations, tsvector full-text recall.',
    projects: ['careeros', 'developer-second-brain'] },
  { id: 'mongodb', name: 'MongoDB', cat: 'BACKEND', tier: 2, slug: 'siMongodb', color: '#47A248',
    blurb: 'Document storage where shape wins over relational discipline — mapped, not sprinkled.',
    projects: ['careeros', 'developer-second-brain'] },
  { id: 'fastapi', name: 'FastAPI', cat: 'BACKEND', tier: 2, slug: 'siFastapi', color: '#009688',
    blurb: 'AI-heavy backend for GRAMMITRA AI — validation at the edge, async by default.',
    projects: ['grammitra-ai'] },
  { id: 'socketio', name: 'Socket.io', cat: 'BACKEND', tier: 2, slug: 'siSocketdotio', color: '#FFFFFF',
    blurb: 'Bidirectional realtime channels — live sync without the polling tax.',
    projects: [] },
  // AI / ML
  { id: 'python', name: 'Python', cat: 'AI / ML', tier: 1, slug: 'siPython', color: '#3776AB',
    blurb: 'The language of the model layer — RAG pipelines and prompt engineering.',
    projects: ['grammitra-ai', 'careeros'] },
  { id: 'langchain', name: 'LangChain', cat: 'AI / ML', tier: 2, slug: 'siLangchain', color: '#7FC8FF',
    blurb: 'Retrieval and tool-use graph for GRAMMITRA AI — chunking, prompts, evaluation loops.',
    projects: ['grammitra-ai'] },
  { id: 'ollama', name: 'Ollama', cat: 'AI / ML', tier: 3, slug: 'siOllama', color: '#FFFFFF',
    blurb: 'Local model runtime — run the assistant offline, private by default.',
    projects: [] },
  { id: 'tensorflow', name: 'TensorFlow', cat: 'AI / ML', tier: 3, slug: 'siTensorflow', color: '#FF6F00',
    blurb: 'Model-side fundamentals — tensors, training loops and evaluation vocabulary.',
    projects: [] },
  { id: 'openai', name: 'OpenAI', cat: 'AI / ML', tier: 2, slug: null, color: '#F1EFE9',
    blurb: 'Drafting assistance inside CAREEROS — scoped to support, never autonomous decisions.',
    projects: ['careeros'] },
  { id: 'whisper', name: 'Whisper', cat: 'AI / ML', tier: 3, slug: null, color: '#F1EFE9',
    blurb: 'Whisper-family speech recognition — the STT backbone in the GRAMMITRA voice flow.',
    projects: ['grammitra-ai'] },
  // TOOLS
  { id: 'git', name: 'Git', cat: 'TOOLS', tier: 3, slug: 'siGit', color: '#F03C2E',
    blurb: 'Version control as habit — small commits, legible history.',
    projects: [] },
  { id: 'github', name: 'GitHub', cat: 'TOOLS', tier: 3, slug: 'siGithub', color: '#FFFFFF',
    blurb: 'Where the work lives and the receipts are kept — krishna.github.io included.',
    projects: [] },
  { id: 'docker', name: 'Docker', cat: 'TOOLS', tier: 3, slug: 'siDocker', color: '#2496ED',
    blurb: 'Containerised services and repeatable deploys — nothing snowflaked.',
    projects: ['careeros', 'grammitra-ai', 'interactive-3d-experience'] },
  { id: 'linux', name: 'Linux', cat: 'TOOLS', tier: 3, slug: 'siLinux', color: '#FCC624',
    blurb: 'Daily driver for build, deploy and host — the CLI is the IDE half the time.',
    projects: [] },
  { id: 'figma', name: 'Figma', cat: 'TOOLS', tier: 3, slug: 'siFigma', color: '#F24E1E',
    blurb: 'From wireframe to tokens — the design system before the CSS.',
    projects: [] },
  { id: 'vite', name: 'Vite', cat: 'TOOLS', tier: 3, slug: 'siVite', color: '#9135FF',
    blurb: 'The build tool under this very site — cold start in milliseconds.',
    projects: [] },
];

// System architecture map — illustrative, not a live dashboard.
export const SYSTEM_NODES = [
  {
    id: 'frontend',
    label: 'FRONTEND',
    tech: ['React', 'Next.js', 'TypeScript'],
    blurb: 'Interactive interfaces and typed application architecture — component systems to production builds.',
    projects: ['careeros', 'developer-second-brain', 'interactive-3d-experience'],
    pos: { x: 205, y: 150 },
  },
  {
    id: 'backend',
    label: 'BACKEND',
    tech: ['Node.js', 'Express', 'FastAPI'],
    blurb: 'API surfaces, auth flows and service composition — Node for product velocity, FastAPI for AI-heavy workloads.',
    projects: ['developer-second-brain', 'careeros'],
    pos: { x: 600, y: 92 },
  },
  {
    id: 'data',
    label: 'DATA',
    tech: ['PostgreSQL', 'MongoDB'],
    blurb: 'Schema design, migrations and query performance — relational rigor where it pays, documents where it fits.',
    projects: ['careeros', 'developer-second-brain'],
    pos: { x: 995, y: 150 },
  },
  {
    id: 'ai',
    label: 'AI / ML',
    tech: ['Python', 'LLMs', 'AI integrations'],
    blurb: 'Practical model integration — RAG, evaluation and tool use, wired into real product workflows.',
    projects: ['careeros', 'grammitra-ai'],
    pos: { x: 245, y: 470 },
  },
  {
    id: 'infra',
    label: 'INFRASTRUCTURE',
    tech: ['APIs', 'Docker', 'Deployment'],
    blurb: 'Containerised services, versioned APIs and repeatable deploys — shipped, not snowflaked.',
    projects: ['careeros', 'grammitra-ai', 'interactive-3d-experience'],
    pos: { x: 955, y: 470 },
  },
];

export const PROJECTS = [
  {
    id: 'careeros',
    index: '01',
    title: 'CAREEROS',
    category: 'AI / FULL-STACK APPLICATION',
    description:
      'An intelligent career platform designed to streamline career development workflows.',
    stack: 'NEXT.JS · TYPESCRIPT · OPENAI',
    problem:
      'Career decisions are scattered across documents, spreadsheets and chat threads — hard to compare, revisit or act on.',
    solution:
      'A structured workspace that captures roles, feedback and plans in one place, with AI assistance for drafting and prioritisation.',
    decisions: [
      'Normalised schema for roles, applications and feedback cycles',
      'AI assistant scoped to drafting support, not autonomous decisions',
      'Server-side rendering for first paint; optimistic UI for edits',
    ],
    architecture:
      'Next.js app router → API routes → Postgres via Prisma · OpenAI for drafting · edge caching for static surfaces',
  },
  {
    id: 'grammitra-ai',
    index: '02',
    title: 'GRAMMITRA AI',
    category: 'APPLIED AI / PRODUCT ENGINEERING',
    description:
      'A voice-first intelligent assistant concept for livestock farmers.',
    stack: 'PYTHON · LANGCHAIN · VOICE',
    problem:
      'Rural farmers often work without reliable literacy, typing or data connectivity — yet livestock care is information-dense.',
    solution:
      'A voice-first assistant that understands regional speech patterns and answers livestock-health questions offline-ish.',
    decisions: [
      'Voice-first interaction model — no keyboard dependency',
      'RAG over curated livestock-health content, not free-form generation',
      'Graceful degradation to SMS-like flows on weak networks',
    ],
    architecture:
      'FastAPI · LangChain RAG · Whisper-family STT · regional-language TTS · curated agronomy knowledge base',
  },
  {
    id: 'developer-second-brain',
    index: '03',
    title: 'DEVELOPER SECOND BRAIN',
    category: 'FULL-STACK / PRODUCTIVITY',
    description:
      'A personal knowledge management environment for developers.',
    stack: 'REACT · NODE.JS · POSTGRESQL',
    problem:
      'Engineering knowledge is fragmented across notes, tabs and repos, making recall during deep work expensive.',
    solution:
      'A quiet, keyboard-driven capture-and-retrieve environment with full-text search and tagging.',
    decisions: [
      'Local-first writes with sync, not sync-first',
      'Full-text search via Postgres tsvector — no extra service',
      'Zero-modal capture to keep the thinking flow uninterrupted',
    ],
    architecture: 'React SPA · Node/Express API · Postgres with tsvector search · JWT sessions',
  },
  {
    id: 'interactive-3d-experience',
    index: '04',
    title: 'INTERACTIVE 3D EXPERIENCE',
    category: 'CREATIVE DEVELOPMENT / WEBGL',
    description:
      'An immersive web experience combining interactive 3D and modern frontend engineering.',
    stack: 'THREE.JS · REACT · WEBGL',
    problem:
      'Static portfolios fail to communicate how something feels — especially motion, depth and interaction craft.',
    solution:
      'A real-time 3D scene as the hero of the experience, engineered for performance and reduced-motion safety.',
    decisions: [
      'One signature sculpture, driven by scroll + cursor, never by scroll-jacking',
      'Strict GPU budget; geometry and materials kept minimal',
      'prefers-reduced-motion falls back to a curated static frame',
    ],
    architecture: 'React · Three.js · custom camera rig · rAF-driven render loop · lazy-loaded 3D chunk',
  },
];
