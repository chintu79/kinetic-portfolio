# KRISHNA® — INTERACTIVE PROTOTYPE — INTERACTION MAP
**Status: SPEC v1 — for manual wiring in Figma (MCP cannot set prototype reactions)**
**File:** https://www.figma.com/design/UyM4rhsTM7Xxkz6C0fAR4B (`UyM4rhsTM7Xxkz6C0fAR4B`)
**Session pointer:** page consolidations forced by Starter 3-page cap — see §11

---

## 0. How to use this document

This is the complete interaction blueprint for the KRISHNA® portfolio prototype. Figma's Plugin API (and therefore the Figma MCP) **cannot create prototype reactions**. Every connection below must be wired in the Figma UI (prototype panel, click → target frame → transition). This map names every frame, every source node, every trigger and every destination so the wiring pass is mechanical.

Legend for §10 column "Type":
- **WORKING (Figma)** = create as a Figma prototype reaction between frames.
- **SIMULATED (Figma)** = approximate with frames/variants; real behavior impossible in-canvas.
- **NEEDS REACT** = cannot exist in Figma at all; production implementation only.

---

## 1. What already exists on canvas (as of writing)

| Page | Content | Notes |
|---|---|---|
| `01 — DESIGN SYSTEM & COMPONENTS` | Variables (color 12 / spacing 12), 11 text styles, 2 effect styles, foundation spec sheets, component library below (buttons ×4 states sets, nav/link, nav bar desktop, project card ×3 states, terminal header/window, footer, scroll indicator…) | Components named semantically, e.g. `Button / Primary`, `Project / Card`, `Terminal / Window` |
| `02 — WEBSITE (DESKTOP · TABLET · MOBILE)` | `DESKTOP — KRISHNA® 1440 (SCROLL)` — full scroll frame with Nav instance, Hero, About, Selected Work (4 project card instances), Playground, Contact (dark), Footer instance | Tablet 768 and Mobile 390 frames were **not** built; Starter paywall blocked further calls |
| `03 — PROTOTYPE & HANDOFF` | Empty | Place reserved by consolidation |

**Missing from canvas:** tablet/mobile frames, all prototype screens (§3–§8), interactions, the `PROTOTYPE — INTERACTION MAP` frame (§12), command palette, Konami flow, case-study template.

---

## 2. Working environment constraints

1. **Starter plan paywall** — `use_figma`/`get_screenshot` return "tool call limit on the Starter plan" until upgrade (Professional / Education / Organization / Enterprise) or monthly reset. Upgrade link: https://www.figma.com/files/team/1245248198393368291/all-projects?upgrade=mcp_rate_limit_paywall
2. **3-page cap on Starter** — intended 7 pages were consolidated to 3.
3. **MCP/Plugin API cannot wire reactions** — all click-through connections in this document are manual Figma UI work.
4. **Reads are rate-limited separately** — even after upgrade, budget screenshot verification.
5. Fonts available in file: Space Grotesk (Bold/Light/Medium/Regular), Inter, JetBrains Mono. Heading 650 maps to `Space Grotesk — Medium` (no Semi Bold exists).

---

## 3. Frame inventory (create on new page `06 — INTERACTIVE PROTOTYPE` after upgrade)

Order roughly follows build order; all frames 1440×900 unless noted.

### 3.1 Desktop
| # | Frame name | Base | Purpose |
|---|---|---|---|
| D1 | `Desktop / Home` | copy of DESKTOP scroll frame, clipped to hero viewport height (or a captured hero frame) | Default start |
| D2 | `Desktop / About` | About section as standalone frame | Nav scroll target |
| D3 | `Desktop / Selected Work` | Work section standalone | Nav scroll target |
| D4 | `Desktop / Playground` | Playground section standalone | Nav scroll target |
| D5 | `Desktop / Contact` | Contact section standalone | Nav scroll target |
| D6 | `Desktop / Project Detail — CareerOS` | case-study template instance | |
| D7 | `Desktop / Project Detail — GramMitra AI` | | |
| D8 | `Desktop / Project Detail — Developer Second Brain` | | |
| D9 | `Desktop / Project Detail — Interactive 3D Experience` | | |
| D10 | `Desktop / Terminal Open` | D1 + dim overlay + `Terminal / Window` (help state) centered | Terminal entry |
| D11 | `Desktop / Command Palette` | D1 + dim overlay + palette panel (default) | CMD+K entry |
| D12 | `Desktop / Email Copied` | D5 + COPIED pill on email CTA | 2s microstate |

### 3.2 Terminal state screens (each = D10 base + window variant, ONLY the output lines differ)
| # | Frame name | Terminal body content |
|---|---|---|
| T1 | `Desktop / Terminal — Empty` | `visitor@krishna:~$ █` |
| T2 | `Desktop / Terminal — Help` | help list (`help/whoami/projects/stack/socials/resume/sudo hire-me/clear`) |
| T3 | `Desktop / Terminal — Whoami` | "Krishna — Full-stack AI Engineer." + one-line identity + stack summary (no bio invented) |
| T4 | `Desktop / Terminal — Projects` | `01 CAREEROS 02 GRAMMITRA AI 03 DEVELOPER SECOND BRAIN 04 INTERACTIVE 3D EXPERIENCE` + "→ open project: <name>" hints |
| T5 | `Desktop / Terminal — Stack` | FRONTEND/BACKEND/AI-ML/TOOLS groups |
| T6 | `Desktop / Terminal — Socials` | editable placeholders: `email — [your-email]` / `github — [github-handle]` / `linkedin — [linkedin-handle]` / `resume — [resume-url]` (**do not invent URLs**) |
| T7 | `Desktop / Terminal — Resume` | `resume — [resume-url]` + "press R to download (placeholder)" |
| T8 | `Desktop / Terminal — sudo hire-me` | `Permission granted. Let's build something meaningful.` + `→ contact: [email]` + accent CTA chip |
| T9 | `Desktop / Terminal — Invalid Command` | `zsh: command not found: <input> — type help` |
| T10 | `Desktop / Terminal — Cleared` | = T1 (empty) but explicitly a distinct frame for click-map clarity; or reuse T1 to avoid duplicates |

### 3.3 Command palette states
| # | Frame | Content |
|---|---|---|
| P1 | `Desktop / Palette — Default` | icon+logo search field, actions list below |
| P2 | `Desktop / Palette — Search: "term"` | filtered list |
| P3 | `Desktop / Palette — No Results` | `No results for "<query>"` |
| P4 | `Desktop / Palette — Selected: Action` | one action highlighted with accent left bar |

Actions (each needs its own connection): `Go to Home` · `Go to About` · `Go to Work` · `Go to Playground` · `Go to Contact` · `Open Terminal` · `View Resume` (placeholder link).

### 3.4 Tablet / Mobile
| # | Frame name | Notes |
|---|---|---|
| TB1 | `Tablet / Home` | 768×1024 portrait; stacked hero |
| TB2 | `Tablet / Navigation Open` | compact overlay menu (even though brief lists it) |
| TB3 | `Tablet / Terminal Open` | 620px window scaled to fit |
| TB4 | `Tablet / Project Detail` | template instance |
| MB1 | `Mobile / Home` | 390×844 |
| MB2 | `Mobile / Menu Open` | full-screen charcoal overlay, links 32px Inter Medium, availability row, close ✕ top-right |
| MB3 | `Mobile / About` | |
| MB4 | `Mobile / Selected Work` | full-width cards |
| MB5 | `Mobile / Project Detail` | |
| MB6 | `Mobile / Terminal Open` | 358px-wide window, 12px mono |
| MB7 | `Mobile / Email Copied` | |

### 3.5 Easter eggs & extras
| # | Frame | Content |
|---|---|---|
| E1 | `Desktop / Konami — Secret Theme` | D1 with "darkroom" token swap (off-black bg `#1C1C1A`, off-white text, accent unchanged) + corner ribbon `konamiMode` |
| E2 | `Desktop / Konami — Message` | E1 + centered mono line: `"there is a tomato in the machine. — k."` (placeholder copy, edit in review) |
| E3 | `Desktop / Idle — Default Object` | hero object normal |
| E4 | `Desktop / Idle — Idle Object` | accent dot enlarged/haloed; caption `IDLE 0.5Hz` |
| E5 | `Desktop / Hire-Me Flow End` | terminal T8 + accent CTA visible |

### 3.6 Flow overview (for `PROTOTYPE — INTERACTION MAP` frame, §12)
One wide canvas frame (~3200×1600) with swimlanes: `NAV FLOW` · `PROJECT FLOW` · `TERMINAL FLOW` · `PALETTE FLOW` · `EASTER EGGS` · `MOBILE FLOW`. Boxes = frames from this document (grouped symbols), arrows = connections. This frame is a documentation artifact on-page, not a wired prototype target.

---

## 4. Global connections (wire once, reuse)

### 4.1 Navigation (all breakpoints)
| Source node | Trigger | Target | Transition | Type |
|---|---|---|---|---|
| `Nav / Link — About` | click | `Desktop / About` (or tablet/mobile equivalent) | Move in, up 24px, 350ms, ease-out | WORKING |
| `Nav / Link — Work` | click | `Desktop / Selected Work` | same | WORKING |
| `Nav / Link — Playground` | click | `Desktop / Playground` | same | WORKING |
| `Nav / Link — Contact` | click | `Desktop / Contact` | same | WORKING |
| Active underline state | (enter frame) | Nav between Default↔Active via smart animate on `underline` layer | 200ms | SIMULATED |
| `Back to top ↑` (footer + back-top fab if added) | click | `Desktop / Home` | Move in, 350ms | WORKING |

### 4.2 Hero (Desktop / Mobile / Tablet)
| Source node | Trigger | Target | Type |
|---|---|---|---|
| `Button / Primary — EXPLORE MY WORK` | click | `Desktop / Selected Work` | WORKING |
| `Button / Secondary — MORE ABOUT ME` | click | `Desktop / About` | WORKING |
| `Scroll / Indicator` | click | `Desktop / About` | WORKING |
| `OBJ.01` placeholder | click (hover demo) | `Desktop / Idle — Idle Object` ↔ back | SIMULATED |
| `Terminal icon` (footer + nav, proto only — place instance of terminal icon on both) | click | `Desktop / Terminal Open` | WORKING |
| `Palette icon` (nav) | click | `Desktop / Command Palette` | WORKING |

### 4.3 Email CTA (Contact)
| Source node | Trigger | Target | Transition | Type |
|---|---|---|---|---|
| `Email CTA` | click | `Desktop / Email Copied` | dissolve 200ms | WORKING |
| `Desktop / Email Copied` | click or auto-after-2s | back to `Desktop / Contact` | dissolve 150ms | WORKING |

---

## 5. Project detail flows

Each detail frame shares the case-study skeleton: title, category, overview, problem, solution, architecture, key decisions, stack, gallery, live/source links, prev/next nav.

| Source node (in detail frame) | Trigger | Target | Type |
|---|---|---|---|
| `← Back to work` | click | `Desktop / Selected Work` | WORKING |
| `Live demo ↗` | click | no-op frame `Desktop / Link — Placeholder` ("Add live URL") or external-url placeholder | NEEDS REACT |
| `Source ↗` | click | same placeholder | NEEDS REACT |
| `Next project — <name>` | click | next detail frame (T6→T7→T8→T9→T6) | WORKING |
| `Previous project — <name>` | click | previous detail frame | WORKING |
| gallery screenshot | click | full-screen lightbox frame (optional `Desktop / Gallery — Expanded`) | SIMULATED |

Project → detail mapping (from desktop frame):
`CAREEROS → D6 · GRAMMITRA AI → D7 · DEVELOPER SECOND BRAIN → D8 · INTERACTIVE 3D EXPERIENCE → D9`

Hover states on cards already exist as component variants (`Project / Card — Hover`, `Active`). Wire card clicks from the **instance level** to the appropriate D6–D9. Hover preview is best done in-code; in Figma set `Card_HOVER` instance as the `After delay` target of the card's default state if Smart Animate cooperates. **Do not** attempt 60-frame fake cursor tracking.

---

## 6. Terminal flow (state machine)

```
T1 Empty --(click suggestion: help)--> T2 Help
T1/T2 --(whoami)--> T3      --(projects)--> T4      --(stack)--> T5
T1 --(socials)--> T6        --(resume)--> T7        --(sudo hire-me)--> T8
any state --(clear)--> T1 (or T10)
any state --(invalid)--> T9 --(help)--> T2
T4 projects output --(click a project name)--> D6/D7/D8/D9   (per command list mapping)
T8 sudo hire-me --(accent CTA)--> D5 (Contact)
T10/T1 --(close ✕)--> back to launch frame (D1 or D10-source)
```

Entry points: nav/footer terminal icon → opens **T2 Help** (Empty is boring for demo; use T2 as the specified open state). Place a tiny "sample command chips" row on T2/T1 (`help · whoami · projects · stack · socials · resume · hire-me · clear`) so every command is clickable without keyboard.

Open transition: 250ms, fade + rise 16px, overlay instant. Close: fade out 180ms, target = launch frame.

**Limitation (state explicitly in frame annotation):** Figma cannot parse typed input; chips simulate it. Production: React state machine, `visitor@krishna:~$` prompt, command registry, history via ↑/↓.

---

## 7. Command palette flow

```
D1 --(palette icon click)--> P1
P1 --(type/simulate "about")--> P2 (search: about)
P2 --(enter / click)--> Desktop / About, close palette
P1 --(no match)--> P3
any P* --(item)--> destination per action:
    Go to Home → D1 · About → D2 · Work → D3 · Playground → D4 · Contact → D5
    Open Terminal → T2 · View Resume → T7-style resume output or external placeholder
```

Each action needs its connection on both its **list item node** and its **highlighted variant** (P4 states). Provide 1 P2/P4 per action or a single P4 reusable with renamed caption — prefer one P4 per action to keep the map mechanical.

Open/close: 250ms fade + 0.96→1 scale, overlay fade. Close button returns to launch frame. Placeholder destinations are UI work only.

---

## 8. Easter eggs

### 8.1 Konami (`↑ ↑ ↓ ↓ ← → ← → B A`)
```
D1 --(konami trigger frame E3)--> E1 Secret Theme
E1 --(any nav/CTA)--> stays in secret skin (smart-animate swap of bg/text tokens on E1↔)
E1 --(konami again or ESC key chip)--> D1
E1 --(hidden dot bottom-right)--> E2 Secret message --> E1
```
Secret-theme frames: clone D1/D2/D3/D5 in secret tokens (near-black `#1C1C1A`, paper `#F1EFE9` text, accent unchanged), plus badge `KONAMI MODE — ON` in JetBrains Mono 10 accent. **Restrained:** same layout, same components; only the color variables differ (create local mode `KONAMI` in the `Color` collection).

### 8.2 `sudo hire-me`
```
D1 --(terminal icon)--> T2 --(chip hire-me)--> T8 (Permission granted. … + accent CTA)
T8 --(accent CTA)--> D5 Contact
```

### 8.3 Idle (30 s)
```
D1/Hero --(idle spec annotation only)--> E3 Default -> E4 Idle (accent dot halo + caption IDLE 0.5 Hz)
E4 --(any interaction)--> D1 / Hero default
```
No timed logic exists in Figma prototypes; the frames demonstrate the state, the **annotation** documents the 30 s trigger for React. Do not fake a timer with duplicated frames.

---

## 9. Microinteraction & transition reference

### 9.1 Durations & easing (all ease-out, no bounce)
| Element | Duration | Transition |
|---|---|---|
| Buttons hover/press/focus | 180–220ms | dissolve or color smart-animate |
| Nav underline | 200ms | smart animate on `underline` |
| Nav background fade (sticky) | 250ms | dissolve on backdrop frame |
| Cards hover (image scale 1.03, arrow +4px) | 300ms | smart animate on gallery + arrow layers |
| Page/section navigation | 300–450ms | move in, up 24px |
| Overlay/palette fade | 250–300ms | fade + scale 0.96→1 |
| Terminal open/close | 200–250ms | fade + rise 16px / fade out 180ms |
| Email COPIED swap | 150–200ms dissolve | — |
| Section reveals (in-code) | 500–700ms staggered | opacity + translateY 16px |

### 9.2 Variant coverage checklist
`Button/Primary` Default·Hover·Pressed·Focus · `Button/Secondary` ×4 · `Button/TextLink` ×2 · `Button/Icon` ×2 (hover to add) · `Nav/Link` Default·Hover·Active · `Nav/Availability` (default) · `Project/Card` Default·Hover·Active · `Email CTA` Default·Copied · `Konami badge` · `Scroll Indicator` Default·Scrolled.

---

## 10. Master connection table (slot for spot checks)
| # | Source frame | Node | Trigger | Destination | Transition | Type |
|---|---|---|---|---|---|---|
| 1 | Desktop / Home | Nav — About | tap | Desktop / About | 350ms up 24 | WORKING |
| 2 | … | … | … | … | … | … |

(Fill from §4–§8 during wiring; keep one row per wired connection. Incomplete rows = QA FAIL.)

---

## 11. Consolidation & naming debt
- 7-page intended file → 3 pages (Starter cap at creation time). After upgrade, move sections to the original 7-page layout (`01 DESIGN SYSTEM` / `02 COMPONENT LIBRARY` / `03 DESKTOP` / `04 TABLET` / `05 MOBILE` / `06 PROTOTYPE` / `07 HANDOFF`) as a non-destructive re-org.
- `PROTOTYPE — INTERACTION MAP` = §3.6 frame, lives on `06 — INTERACTIVE PROTOTYPE`.
- Names are load-bearing: instances/connections break on rename. Rename **before** wiring, never after.

---

## 12. `PROTOTYPE — INTERACTION MAP` frame (final deliverable on-page)
Single 3200×1600 canvas; six swimlanes with label chips `NAV` · `PROJECT` · `TERMINAL` · `PALETTE` · `KONAMI` · `MOBILE`. Boxes = the §3 frames (grouped as symbols). Arrows = §10 rows, colored by Type (orange = WORKING, grey = SIMULATED, dashed = NEEDS REACT). Caption bottom-right:

> **KRISHNA® PROTOTYPE — MODES:** `orange solid` = Figma prototype reaction · `grey solid` = simulated (frame swap) · `grey dashed` = requires React (search, real timers, file downloads, theme tokens).

---

## 13. User journeys → wired paths (acceptance)
- **A — Recruiter:** D1 → EXPLORE MY WORK → D3 → CareerOS card → D6 → ← back → D3 → Nav Contact → D5 → Email CTA → D12 → back to D5. ✔
- **B — Developer:** D1 → terminal icon → T2 → projects chip → T4 → pick CAREEROS → D6 → back → terminal → stack chip → T5 → `sudo hire-me` chip → T8 → accent CTA → D5. ✔
- **C — Curious:** D1 → OBJ.01 → E4 (idle) → back → Playground nav → D4 → a card → project detail (or experiment placeholder) → terminal icon → T2 → Konami badge appears (if convention added) → T8 → D5. ✔
- **D — Mobile:** MB1 → menu icon → MB2 → About (menu closes) → MB3 → Work → MB4 → CareerOS → MB5 → terminal icon → MB6 → nav → Contact (MB4-analogue contact frame MB7). ✔
All four journeys must be walkable start-to-finish with zero dead ends.

---

## 14. QA checklist (manual, in Figma UI)
- [ ] All nav links reach correct sections on all three breakpoints
- [ ] Desktop active-link state persists per destination
- [ ] Both hero CTAs and scroll indicator navigate correctly
- [ ] 4 project cards + next/prev + back-to-work all wired
- [ ] Terminal opens via footer icon, T1–T10 all reachable and return to launch
- [ ] Palette P1–P4 items all navigate; open/close works; no dead ends
- [ ] Mobile menu opens/closes; selection navigates and auto-closes
- [ ] Back-to-top restores D1 with default nav state
- [ ] Konami E1/E2/E3 show and revert
- [ ] Email COPIED state appears and reverts
- [ ] No overlay traps (every overlay has an exit)
- [ ] Frame names match this doc (no renames post-wiring)
- [ ] `PROTOTYPE — INTERACTION MAP` reflects final state
- [ ] Reduced-motion: production spec must respect `prefers-reduced-motion` (in-code, not Figma)

---

## 15. Explicit "not implemented" ledger (paste into HANDOFF frame)
1. Real command parsing, history, tab-completion — NEEDS REACT
2. Real clipboard write + COPIED toast — NEEDS REACT (Figma shows the state only)
3. 30 s inactivity timer — NEEDS REACT
4. Konami listener — NEEDS REACT (frames demonstrate reward state)
5. Live demo/source URLs — placeholders only; **no URLs provided, none invented**
6. 3D object — Three.js + R3F; Figma holds static/rotational placeholder frames
7. Real scroll-snap "scroll to section" semantics — prototype uses move-in transitions per destination frame

---

## 16. Immediate blockers & next actions
- **Upgrade required** at https://www.figma.com/files/team/1245248198393368291/all-projects?upgrade=mcp_rate_limit_paywall (Professional $12–16/mo class, Full seat) — or wait for monthly MCP reset.
- **After upgrade:** (1) rebuild 7-page structure; (2) create TB/MB frames per §3.4; (3) case-study template instance ×4; (4) palette + terminal screens; (5) wire §10 in UI; (6) build §12 map; (7) run §14; (8) fix failures; (9) assign starting points: `Desktop / Home` (default), `Mobile / Home`, `Desktop / Terminal — Help`, `Desktop / Project Detail — CareerOS`.
- **Estimate honesty:** wiring alone is ~60–90 min in Figma UI; frame creation for the missing 20+ screens is another ~1.5–3 h; can be split across sessions.
