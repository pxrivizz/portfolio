# Asset replacement contract

Current cloud textures are original procedural 1024 × 512 RGBA PNG placeholders, rendered in Intro. They were generated from deterministic noise and simple cloud envelopes by scripts/generate-cloud-placeholders.py; no reference imagery was used. A 32 × 32 radial PNG is the star sprite. Other illustrations remain simple staged SVG placeholders.

| Supply | Expected files | Guidance |
|---|---|---|
| Clouds | clouds/far.png, middle.png, near.png | Transparent RGBA, approximately 2048 × 1024, soft alpha edges, no baked background |
| Layered landscape | artwork/background.png, far.png, middle.png, foreground.png | Four aligned 2400 × 1600 exports; background opaque, foreground layers transparent; same camera and crop |
| Door | door/frame.png | Transparent opening and outside, approximately 1024 × 1600 |
| Hub covers | projects/experience.webp, projects/projects.webp | Two owned/licensed 3:2 images |
| Project covers | projects/qr-yoklama.webp, projects/pxrivizz.webp | Owned screenshots, 3:2 crop; dates supplied separately |
| Fonts | fonts/display-regular.woff2, fonts/body-regular.woff2, fonts/body-medium.woff2 | Web-licensed fonts covering Turkish characters |

Cloud paths already use PNG. Update the remaining paths in src/config/assets.ts from SVG to PNG/WebP and add local @font-face definitions in src/styles/globals.css with font-display: swap. For projects update image paths in src/data/projects.ts. Compress assets before production. No font downloads are currently required.

Reference frames from the supplied video are saved in ../reference/frame_01.png through frame_30.png. They are for analysis, never served as portfolio assets.

Reference revision: clouds are now bounded neutral-white masses with transparent exterior. Three source textures are rendered on both desktop and mobile with responsive placement. The previous blue-gray sheet composition has been replaced.
