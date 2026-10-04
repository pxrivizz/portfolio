# Cinematic portfolio

Phase 2: Intro. Each following scene requires owner approval.

## Run

From this directory: `npm ci`, then `npm run dev`.
Development address: http://127.0.0.1:5174/experience/

`npm run build` writes the application to ../experience/ and verifies pre-rendered HTML content. From the repository root, `python3 -m http.server 4173 --bind 127.0.0.1` serves both the existing website and http://127.0.0.1:4173/experience/ with working legacy-page links. Vite alone serves the new app; root-relative links to existing HTML pages require the root static server.

Checks: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`. Existing site checks: `npm test` from the repository root.

## Architecture

Single persistent Canvas. Intro renders while visible and playing; the hub, paused view and reduced-motion view render on demand. DOM overlay owns all navigation; decorative Canvas is hidden from assistive technology. Intro → hub uses the skip-intro edge with a 1.2-second crossfade. The Intro has a 7.2-second greeting/cloud timeline, gentle star drift, pause/resume and replay. The complete graph is typed but unfinished scenes are not exposed in navigation.

Zustand stores scene and transition state. UI components select only discrete state; per-frame progress does not trigger their renders. Transition requests are locked while active. Reduced-motion preference changes cancel current motion and open the hub shell. Geometry and materials use R3F declarative ownership/disposal. Canvas, Intro and hub backdrop load separately. Cloud textures are local PNGs and are disposed when Intro unmounts. Error boundary and context-loss handling retain accessible content.

The Vite HTML transform embeds AccessibleContent into development and production HTML using the same typed data. This remains visible without JS or WebGL; it is not merely a client-rendered noscript substitute. Do not edit generated HTML by hand.

## Next review

Approve Intro before the cloud fly-through. Review the greeting, rising clouds, pause/resume, replay and mobile layout. The supplied video is analyzed in docs/REFERENCE-ANALYSIS.md; extracted frames are in ../reference/. See docs/BRIEF.md and docs/ASSETS.md.

Browser checks: `node scripts/check-intro.mjs` and `node scripts/check-browser.mjs`, with the root static server running. Screenshots and results live in docs/checks/intro/. These are local Chromium checks, not a real-phone or mid-range laptop GPU benchmark.
