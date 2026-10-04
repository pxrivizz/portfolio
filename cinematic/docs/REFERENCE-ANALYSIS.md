# Video reference analysis

Reviewed 2026-10-04. Source: user-supplied SaveClip.App_AQOvgIQyf2yXGrYAbYk8hACi2rXeMY47nL02KiGVIKaoQ6z29bZ158RcLJKIEMVeiZlCNXS6RTYRqlhfRZwwuaWYdFd56gB35qkBYY4.mp4.
15.233 seconds, 720 × 720, 30 fps. Thirty frames extracted at 2 fps to /reference; contact sheets and enlarged scene crops accompany them. Final frame also extracted at 14.9 seconds. Times below are approximate clip positions, not verified website transition durations or scroll distances.

## What belongs to the portfolio
The inner landscape viewport (approximately x72..650, y154..497) is the portfolio. The outer white square, @CodeZenithAI label, arrow and “Awwwards Portfolio (React, GSAP, Tailwind)” caption belong to the video's presentation layout. Do not reproduce them as the site shell. Rounded corners may also belong to the video presentation rather than the actual website.

## Observed sequence

| Clip time | Visible behavior | Implementation direction |
|---|---|---|
| 0–1 s | Small, centered, narrow high-contrast serif greeting on a dense neutral-black starfield. Greeting moves upward as a bright isolated cloud rises. | Much smaller greeting; minimal surrounding UI. Keep accessible controls discreet. |
| 1–2.7 s | Multiple white cloud masses occupy separate depths, with visible black gaps. Their apparent scale and relative position change as the view advances. Tiny white doorway appears in the central distance. | Separate alpha billboards with deliberate open space; combine cloud parallax and forward camera movement in phase 3. |
| 2.7–3.3 s | Doorway grows into a dimensional white frame, open door angled to the right; typographic corridor visible inside. | Model jamb and door geometry rather than only enlarging a flat image. |
| 3.3–4.1 s | Repeated oversized white serif role words make up four corridor planes. View rolls as it travels forward, then opens back into stars. | Perspective text planes and camera roll, tightly staged through a single controller. |
| 4.1–5.8 s | Widely spaced heading letters descend along a curved/diagonal arrangement and settle. Two overlapping rectangular artwork cards. Hovered card advances, gains a thin dimensional outline and large stacked serif title. Tiny social links at bottom. | DOM letter choreography and keyboard-equivalent card focus; reuse card artwork as scene entry. |
| 5.8–9.3 s | Left artwork expands to fill the view. Curved horizon, foreground/midground separation, thin white path and dated work labels. View travels through the image composition. | Layered original artwork, curve-following camera, typed timeline data. Exact projection cannot be established from video alone. |
| 9.3–10.3 s | Artwork contracts/crossfades back to its hub card; the other card becomes the entry. | Preserve spatial relationship between card and destination. |
| 10.3–15.2 s | Light landscape with foreground figure. Project panels span an enclosing curved band. Horizontal movement reveals more panels. Hovered card grows, boundary becomes solid, description and VIEW appear. | Cylindrical card arrangement with damped horizontal input and touch/keyboard equivalents. |

## Corrections to our current Intro

1. Current full-width name is far too large. In the reference, the entire greeting is approximately one fifth of the inner viewport width and its glyph height is only a few percent of the scene height.
2. Current blue-gray fog sheets wash across the frame. Reference clouds are bright, self-contained billowing masses with transparent space between them. Replace the cloud placeholder composition, not just its color.
3. Reference opening is visually sparse: greeting, stars, entering clouds. The main CTA, description, brand navigation and social links should not dominate that opening. Keep necessary accessibility controls discreet; social navigation belongs primarily to hub.
4. Greeting moves out of the way as the journey begins. Current intro holds large text over a settled fog field.
5. Starfield is neutral charcoal, not tinted navy. Measured compressed-frame dominant background is #1a1a1b; text cluster #f4f3f5. These are sampled video colors, not claimed original CSS values.
6. Current 7.2-second autoplay is a phase preview. The video suggests a user-driven journey but does not prove event wiring. The agreed scroll-driven architecture remains the implementation requirement.

## Scope and next checkpoint
Keep the existing React/R3F/GSAP/Zustand foundation. Next implementation should revise phase 2 Intro to this composition before building phase 3. Maintain phase review gates. No runtime code changed during this analysis.

## What cannot be verified from this recording
Exact font family, original source assets, shader/rendering technology, timings/easing values, real scroll distance, keyboard behavior, mobile layouts, reduced-motion behavior and performance. The 15-second clip may be edited or accelerated; do not equate its timestamps to site timeline settings.

## Asset direction
Use original/licensed replacement artwork and original cloud placeholders. Recreate the spatial composition and motion language. Do not ship the extracted reference frames as website textures. Cloud placeholders need soft detailed edges, a luminous body and genuine alpha gaps; the existing noise-sheet assets are not visually equivalent.
