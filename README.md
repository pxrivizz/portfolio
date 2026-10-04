# pxrivizz — portfolio

Static HTML, CSS and JavaScript. No framework, package install or build step.

## Run

Open `index.html` with Live Server. Alternatively, from this folder run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`. GSAP 3.13.0, ScrollTrigger 3.13.0, Lenis 1.3.11 and Google Fonts load from the internet. If the animation libraries are unavailable, content remains in normal document flow.

## Content

Edit `content.js` for the name, country, email, portrait, About facts, expertise descriptions, four projects and contact links. Unknown personal details remain `[PLACEHOLDER]`.

- The supplied portrait is stored at `assets/images/halil-ciftci.jpeg`; the original is unchanged.
- The QR Yoklama case study uses the owner's public repository, README, package manifest and QR token source at commit `a7b059376eb0289f0ce853213c7c4505ab22a6cc`. The two screenshots were copied unchanged from its `docs/screenshots/` folder. No production metrics or live deployment claims were added.
- The portfolio itself is the second case study. The two remaining slots are unpublished and show an honest coming-soon state.
- Give each project a real `http://` or `https://` `url` to enable its live-demo link. If only `repository` is available, the orbit action opens GitHub and is explicitly labelled as source code.
- Enter an email address and LinkedIn URL to enable the contact links.
- The Journal menu opens an empty state; no articles have been invented.

## Project details and quick profile

- `project.html?id=qr-yoklama` opens the QR Yoklama story. Stable project IDs belong in `content.js`; every card title and “Explore project” link opens its own page.
- Detail fields: `category`, `status`, `role`, `problem`, `solution`, `architecture` (title/description objects), `highlights` (strings), `outcome`, and `sources` (label/URL objects). Missing fields are omitted rather than invented.
- `screenshots` accepts local asset records such as `{ src: "assets/images/example.png", alt: "Describe the screen", caption: "Optional caption" }`. Missing/broken images have readable fallback messages.
- `profile.html` is a direct, native-scroll profile with education, technical focus, published projects and contact links. It loads GSAP only for its Back pill, without Lenis, the custom cursor or the intro loader. A fixed homepage shortcut remains usable during the intro, and the expanded menu also links to it.
- “Download CV” and “View CV” use the supplied, unchanged PDF at `assets/documents/halil-ciftci-cv.pdf`, configured through `profile.cvUrl`. The view action opens a new tab; download saves the original document. The supplied PDF still says “2nd Year Student”; the website retains the owner's newer correction to third year.
- The CV's actual content is also represented in `content.js`: Sabancı University internship, APECTRA software leadership, GPA, languages, skills and eight CV-listed projects. `js/resume.js` renders shared experience records in both About and the quick profile. The CV-only project list does not invent repository links or detailed case studies. React/Flutter and the user's AI focus remain from their earlier instructions.
- The quick profile prints the expanded CV-derived information in normal document flow; it can span multiple pages. The downloadable original PDF is kept unchanged.
- “Print / Save PDF” separately prints the quick profile with an A4-friendly layout; it does not replace or modify the supplied CV. If `profile.cvUrl` is missing or invalid, the two original-CV actions stay hidden.
- CSS and JS URLs have explicit cache revisions. Bump the affected revision in each HTML entry point after subsequent edits to prevent old cached content from appearing.

Run the dependency-free rendering/data checks with:

```sh
node --test tests/portfolio-pages.test.cjs
```

The tests use a minimal DOM harness and do not substitute for browser layout, print-preview or interaction testing.

## Contact form

Validation runs locally, without requests, storage or email delivery. Valid input produces an explicit **not sent** message. A backend or mail service must be connected before publishing a working contact form. Do not place private service credentials in frontend JavaScript.

## Motion and navigation

### Pill playground and site integration

About now enhances the homepage desktop/expanded navigation: SVG pupils track window pointer/touch events through reusable `quickTo` tweens, clamped to 3px horizontally/4px vertically and centered after 1000ms idle. Process appears in a published project's header only when its `#solution` section exists; its asterisk rotates 75° and scales to 1.15 over .25s (`back.out(1.7)`). Back replaces header return links on project/profile pages, preserving immediate native navigation. The demo Back button instead toggles on tap/keyboard activation.

Each has its own initializer/cleanup in `js/pills/{about,process,back}.mjs`, assembled by `extras.mjs`. `css/motion-pills.css` provides scoped styling and variables. Editable eye/back SVG templates are in `shared.mjs` because their internal parts must be animated; Process uses `assets/icons/pill-asterisk.svg`. All original placeholder drawings remain in `assets/icons/`.

Back uses the installed GSAP 3.13.0 MorphSVG plugin, copied locally by the vendor build. Its .45s `power2.inOut` morph is the agreed SVG-path exception to transform/opacity-only animation. Extension is up to 180 CSS pixels and clamped near the viewport edge. Reduced motion disables movement, leaving color feedback. Profile/project pages still use native scroll without Lenis or the intro loader, but now load GSAP for these small interactions. Test all three on `pills.html`, then the real navigation links; browser/real-device visual review remains necessary.

Open `pills.html` using **Motion playground** in the expanded menu. Work is also integrated into the homepage's desktop navigation and mobile/expanded menu as real `#work` anchors. A single click/tap navigates immediately; the hammer is decorative, never a navigation prerequisite. Leaving/defocusing the link, closing the menu or scrolling the link offscreen resets it. Scoped `css/navigation-pills.css` preserves the site's existing palette and layout. `js/pills/navigation.mjs` reuses the same Work initializer and cleans up listeners/observers on pagehide, restoring them on pageshow. All four animation demos are enabled. Heart stays demo-only with a local, non-persistent pressed state.

Run `npm install` to install pinned GSAP 3.13.0 and copy its browser runtime into `assets/vendor/` via the postinstall build step. Both homepage and demo load this local runtime once per page; the homepage's ScrollTrigger and Lenis remain on their existing CDNs. No bundler or framework migration is required. Use `npm run vendor` to refresh vendored files and `npm test` for all checks.

`js/pills/work.mjs` exports `initWorkPill(button, options)`, returning an idempotent cleanup function with `.reset()`. Cleanup removes listeners, kills owned animations and restores original inline styles. Demo pagehide/pageshow support includes back-forward cache restoration. Hits are locked until the current strike finishes, so fast pointer events cannot flood animation creation. No idle animation loop or pointer-time layout measurements are used.

Tunable parameters in `WORK_DEFAULTS`: `totalHitsToShatter: 14`, `windup: .1`, `strike: .08`, `wobble: .18`, `recover: .24`, `fall: .55`, `resetDelay: 1.5`, `assemble: .45`, `ease: 'back.out(1.7)'` (durations in seconds). Override these through initializer options. Wobble uses `elastic.out(1, .45)`; gravity uses `power2.in`. CSS variables in `css/pills.css` control paper/pill/hover/ink colors, height, radius, gap, font, font size and texture. Replace the clearly named `assets/icons/pill-*.svg` drawings to restyle icons.

Work uses only transforms/opacity. Pointer hover/movement is fine-mouse-only; taps and native keyboard clicks trigger hits. Reduced motion disables movement entirely and keeps hover/focus color. Changes to the preference or hiding the tab reset pending animations. Back's SVG morph is the only geometry-animation exception.

Manual review: move over Work, pause (no repeated idle hits), reach 14 hits, observe falling/reassembly, reset midway, test keyboard focus + Enter/Space, tap on a phone, enable reduced motion, scroll the pill row and navigate away/back. Automated tests exercise real GSAP timelines against plain-object targets; browser rendering and real-device performance still require manual review.

- Loader: counter, sequential handwriting strokes and grid reveal.
- Hero: lightweight letter transforms respond to the pointer.
- About: layered 3D portrait/name reveal (hover, tap or Enter; Escape closes), elastic SVG line, responsive line reveals. Reduced motion uses a static name reveal.
- Expertise: hover/focus previews; tap to expand on mobile; visibility-gated floating logos and pause control.
- WORK: scroll-scrubbed gooey drops and velocity-responsive marquees with pause control.
- Projects: four pinned stacking cards on screens at least 768px wide and 650px high; normal full-height cards on smaller screens and with reduced motion.
- Contact: pointer-responsive light and magnetic submit button, disabled with reduced motion.
- Dialog menus support Escape, keyboard focus containment and return focus. Project navigation buttons allow keyboard browsing of the pinned stack.

## Manual checks

1. Reload and watch the complete loader; move across both AI and DEVELOPER, then stop moving. All 11 letters should respond and settle.
2. Scroll through About; use Enter and Escape on the portrait card. On a mouse, move across the photo: it follows by at most 4° per axis and returns to its resting angle on leave. Touch and reduced-motion users get no pointer-follow tilt.
3. Open all four Expertise previews with the pointer, keyboard and mobile tap; pause/resume the floating logos.
4. Scroll WORK slowly, quickly and backwards; confirm the marquee has no gap and drops reverse with scroll.
5. Scroll all four project cards forwards/backwards and use Previous/Next. Confirm unavailable demos are disabled.
6. Submit empty, invalid and valid form values. Verify errors focus the first invalid field and valid input explicitly says nothing was sent.
7. Open/close the hamburger menu, Journal and all section links. Resize to mobile and enable the OS/browser reduced-motion preference.
8. Open Quick profile / CV before the loader finishes. Check 360px and desktop widths; use Print / Save PDF and inspect the print preview.
9. Open QR Yoklama from a project card and the quick profile. Check both screenshots, the source link, the sidebar anchors, and next-project navigation. Try `project.html?id=missing` and an unpublished project ID for fallback states.

The implementation has passed syntax, local asset/link checks and standalone contact-validation checks. Final browser rendering/performance verification remains outstanding because browser automation access was denied during development.
