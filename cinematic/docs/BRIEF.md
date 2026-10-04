# Cinematic portfolio: phase 1

Owner: Halil Çiftçi. Audience: recruiters and collaborators inspecting software work (inferred).
User-supplied direction: cinematic, dark starfield, serif greeting, clouds, doorway, role-word tunnel, hub, layered experience, cylindrical projects.
User-supplied structure: intro → clouds → tunnel → hub → experience/projects.
User-supplied motion: scroll with optional timed fallback; 1.2-second transitions, power3.inOut; reduced motion skips to hub.
User-supplied assets policy: original SVG/PNG placeholders only. No copied reference imagery.
Reference status: /reference is absent. No frame analysis or measured reference palette has been performed.
Approval: architecture approved by “bu skilleri install et ve projeyi kurmaya basla”. Stop after each phase for user review.

## Phase boundary
Phase 1 builds the runtime shell, persistent Canvas, lazy calibration scene, DOM navigation, state graph, one crossfade demonstration, typed content, static HTML fallback, and checks.
The visible torus geometry is a temporary calibration object, not the starfield Intro or final Hub design.
Narrative scenes, custom cursor, scroll director, camera paths, pointer drag and final transitions are subsequent phases. Do not implement them before review.

## Provisional design contract
- Palette: night #080d12, text #e9e8e2, muted #a4adb5, accent #b6c8d5, scene line #425463.
- Display: system Baskerville/Palatino/Georgia placeholder, serif explicitly requested. Body: system Helvetica/Arial placeholder.
- Quiet centered name in the opening; surrounding navigation remains restrained. The later scenes will vary their layout per brief.
- Feeling curve (proposed): intro calm → clouds anticipation → tunnel momentum → hub release → experience discovery / projects exploration.
- Intended peak: crossing the door into the typographic tunnel. Exact art direction awaits the frames and phase review.
- Design dials: variance 7, motion 8 for narrative scenes, density 2. Phase 1 stays static except for explicit navigation.
- GSAP is the only animation runtime. Scrollcraft contributes composition principles; its alternate engine is not loaded alongside GSAP.
- Genjutsu sub-skills are installed individually in Codex's skills directory. Their local paths are recorded in skill-installation.json.

## Content provenance
Profile, two experience entries and two real projects are translated from existing ../content.js. Unknown project month/year values remain null. No invented work history, metrics or external links.

## Phase 2 approved and implemented
Approval: owner said “tamam devam” after phase 1 review.
Scope: Intro only. The calibration rings are replaced with a seeded THREE.Points starfield and three original RGBA cloud planes. The 7.2-second entrance holds its end frame; it does not auto-start the next phase. “Portfolyoyu keşfet” still uses the approved skip-to-hub path.
Greeting is DOM text, faded and moved by a scoped GSAP timeline. Clouds read the same mutable progress from R3F; no per-frame React state updates. Mobile uses 420 stars and two rendered cloud layers, desktop 1100 stars and three layers. DPR remains capped at 1.25/2.
The pause control suspends both GSAP and continuous rendering. Intro also pauses offscreen and on hidden tabs. Reduced motion skips Intro and cloud downloads. Cloud load failure keeps navigation and HTML content working. TextureLoader textures are owned by the mounted Intro and explicitly disposed on unmount, including late async loads. JSX geometries/materials are owned by R3F.
Next phase remains gated: cloud fly-through and door. No /reference frames were available during phase 2 either; composition follows the written brief, not a claimed visual match.

## Reference received: 2026-10-04
Supersedes previous “reference missing” notes: owner supplied the 15.233-second MP4 and said the site should look like it. It was extracted into /reference and analyzed in REFERENCE-ANALYSIS.md. Current Intro diverges in greeting scale, cloud shape/brightness, navy tint and persistent interface density. Revise Intro before continuing the fly-through phase. Architecture remains approved; no runtime changes made during the reference analysis.

## Phase 2 reference revision: 2026-10-04
Implemented after owner said “devam et” to the reference analysis. Supersedes the provisional navy/fog/large-name composition. Opening now uses sampled neutral charcoal #1a1a1b, compact single-line serif greeting, 1800 desktop / 650 mobile stars, and three separated white alpha cloud masses with individual position, size and timing. Mobile retains all three cloud silhouettes for the reference composition but caps DPR and disables lateral sway. Greeting rises out of view during the entrance. Brand, description and social footer are removed from Intro and remain available in the hub/HTML content; navigation, pause and replay are discreet controls.
Original procedural cloud generator now produces bounded cloud masses with zero-alpha exterior, rather than full-width fog sheets. These remain placeholders, not copied reference imagery. Intro is still a time-based review preview; camera fly-through, doorway and tunnel await the next approved phase.
Validation: typecheck, ESLint, production build, six unit tests, Intro browser checks and foundation browser checks all pass. Desktop/mobile screenshots reviewed. Real-device GPU benchmark remains outstanding; Three.js bundle-size warning remains.
