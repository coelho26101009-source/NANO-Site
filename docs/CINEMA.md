# Cinematic 3D experience

Branch `feature/cinematic-3d-site`, built on `7cae767` (Improve NANO site image quality). Not merged, not deployed to production.

A dark, unbranded laptop becomes the stage for NANO on capable desktops. It arrives from depth, opens, shows the real NANO captures on its display, lets the voice capsule leave the window, explains LOCAL / AUTO / CLOUD around itself, turns its display into a portal for the Brain, then recedes before the calmer sections and the final download. Everything is driven by native scrolling. Everywhere else the page is the existing site, plus a static still of the same laptop.

## Principles kept

- **The product stays real.** The display only ever shows the official captures (`nano-home`, `nano-thinking`, `nano-conversation`, `nano-brain`) and the official overlay capture, unmodified (the capsule is cropped out of its light Electron demo backdrop by CSS, nothing else). No invented screens, memories, providers or features. Captions keep their existing honesty notes (demonstration profile, older internal version, simulated listening state).
- **3D is presentation and progressive enhancement.** All copy, links and headings are server-rendered DOM. The canvas and display layers are `aria-hidden`, contain nothing focusable and never receive pointer events. Without WebGL, JavaScript, motion or a desktop-sized window, the regular site is shown.
- **No scroll hijacking.** No wheel/touch listeners, no `preventDefault`, no snapping, no locked scroll. The 3D state is a pure function of `scrollY`.

## Baseline (before any change)

`7cae767`, clean tree, `origin/main` identical. `lint`, `typecheck`, `build` passed; `verify` 30/30 (external links skipped, as in CI), `verify:motion` 62/62, `verify:images` 274/274. Home-page JavaScript: 7 files, 602,567 B raw / 185,988 B gzip.

## Decisions

**Stack: three 0.186.1 + React Three Fiber 9.8.1.** R3F's peer range (`react >=19 <19.4`) covers React 19.3. R3F is hosted through `createRoot`, not `<Canvas>`: `<Canvas>` registers the whole `THREE` namespace for JSX elements (`react-three-fiber.esm.js`, `extend(THREE)`), which defeats tree-shaking, and this scene declares no JSX elements. Measured on the lazy chunk: 939,726 → 766,662 B raw, 205,357 → 169,451 B brotli. Hosting it ourselves also gives a fresh canvas per mount (clean StrictMode/teardown) and lets an intentional teardown remove the `webglcontextlost` listener before R3F forces a context loss (otherwise resizing below the desktop size would have been recorded as a WebGL failure).

**No drei, no GSAP.** drei would add ~20 transitive packages (hls.js, MediaPipe, troika, camera-controls…); the pieces needed here (rounded box, studio reflections) exist in three itself. GSAP is under a non-OSI licence and not needed: the choreography is a ~300-line deterministic keyframe module evaluated from cached chapter positions, integrated with the existing scroll-motion architecture (see below).

**Hybrid display (measured).** A headless GPU Chromium experiment compared the Home capture rendered (a) as a mipmapped, 16× anisotropic WebGL texture and (b) as a DOM `<img>` mapped by a CSS `matrix3d` homography onto the same quad. At DPR 2 the WebGL texture is only as sharp as DOM when the canvas renders at full DPR 2; at the recommended 1.5 cap it is visibly softer. A DOM image scaled down by the compositor aliases (no mipmaps) when one source pixel covers less than ~0.6 device pixels. Result: WebGL renders the laptop, environment and the panel's power glow; the captures are DOM layers whose lossless source (960 or 1920 px, from the existing `images.json` pipeline) is chosen per frame so a source pixel covers roughly one device pixel. Text stays crisp and the canvas stays at DPR ≤ 1.5. Crops: `artifacts/cinema/experiments/compare-dpr1-960.png`, `compare-dpr2.png`.

**Story order.** The brief places LOCAL / AUTO / CLOUD before the Brain, so the Modes section now precedes the Brain section in the document, for every layout (no visual reordering). Navigation order stays monotonic (Modes is not a nav target), and the Brain's AUTO/CLOUD privacy note now follows the explanation of those modes.

**Laptop: bespoke, procedural.** No external model or licence. Extruded rounded slabs for base and lid, instanced keyboard (77 keys, one draw call), glass bezel, glass trackpad, hinge barrel, webcam dot, two side ports, no logo. The display's active area has the exact 1920:1032 ratio of the captures. The lid is a group pivoting on the hinge axis at the back of the deck. Materials: anodised graphite (`MeshPhysicalMaterial`, metalness 0.86, roughness 0.32, light clearcoat), near-black keycaps, black glass. Lighting: a reflection map baked once at runtime (PMREM) from a few softbox panels — no HDR download — plus a key and a rim directional light; NANO blue appears only as a low accent and as display light. Neutral tone mapping; the captures are DOM, so never tone-mapped.

## Architecture

| File                                                                 | Role                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/cinema/boot.ts`                                      | 647-byte inline `<head>` script. Before first paint it sets `html[data-cinema="on"]` from cheap checks: ≥1100×620, no reduced motion, fine pointer, no Save-Data, ≥4 GB device memory, ≥4 cores, WebGL2 present, no remembered failure. `?cinema=0` forces the regular site; `?cinema=1` skips the power heuristics (QA on software WebGL) but never the size/motion/WebGL requirements. |
| `src/components/cinema/loader.tsx`                                   | The only cinema code in the initial bundle. After `load` + idle it probes WebGL2 (first context costs ~100 ms on a real GPU, so never on the critical path), rejects software renderers, then code-splits the stage in. Any failure, context loss or window narrowing returns to the regular site on the same content (see Fallbacks).                                                   |
| `src/components/cinema/stage.tsx`                                    | R3F host (`createRoot`, demand frame loop, DPR clamp [1, 1.5]).                                                                                                                                                                                                                                                                                                                          |
| `src/components/cinema/scene.ts`                                     | Imperative controller owning every three.js object and DOM layer; one `frame()` per rendered frame.                                                                                                                                                                                                                                                                                      |
| `src/components/cinema/timeline.ts`                                  | The sequence as a pure function of time `t` (14 beats; reused state object, no allocation per frame).                                                                                                                                                                                                                                                                                    |
| `src/components/cinema/director.ts`                                  | Maps `scrollY` → `t` from chapter positions measured only on resize/fonts/load (layout offsets, so entrance transforms never shift a beat). Critically damped follow (~110 ms); jumps over 1.5 beats land directly.                                                                                                                                                                      |
| `src/components/cinema/display.ts`                                   | Capture layers (homography, tier selection, crossfade compositing) and the voice capsule.                                                                                                                                                                                                                                                                                                |
| `src/components/cinema/laptop.ts`, `environment.ts`, `effects.ts`    | Model, studio, and the explanatory light (modes, portal).                                                                                                                                                                                                                                                                                                                                |
| `src/components/cinema/chapters.tsx`                                 | Server-rendered product chapters for the cinematic layout.                                                                                                                                                                                                                                                                                                                               |
| `src/components/laptop-still.tsx`, `scripts/render-laptop-still.mjs` | Static laptop for every non-3D layout (below).                                                                                                                                                                                                                                                                                                                                           |
| `src/app/cinema.css`                                                 | All cinematic layout, keyed to `html[data-cinema="on"]` _and_ the desktop media query.                                                                                                                                                                                                                                                                                                   |

The DOM is the source of every heading, paragraph and link. The existing tabbed gallery remains for the regular site; the cinematic layout shows four server-rendered chapters with the same copy instead (each keeps its capture description for assistive technology as `role="img"`, without a second image download, plus its "Abrir captura completa" link). Crawlers receive both; all four capture descriptions are now in the HTML (the gallery only rendered the active one).

**Integration with the existing motion system.** `ScrollMotion` keeps the hero parallax, entrance reveals (now also for chapters and the still) and the progress line. While the stage runs it yields the modes accents and the Brain tilt; the stage drives the existing `data-mode-active` accents instead. The director measures positions only on resize, never per frame, so the two systems never force layout on each other.

## Beats

`t = k` when chapter `k` is centred (the intro: when its copy sits at 20% of the viewport).

| Beat           | Chapter (DOM)                                    | Laptop / camera                                                                                 | Display                                                                                                    |
| -------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 0 hero         | Hero (unchanged)                                 | absent; stage fades in as the hero leaves                                                       | —                                                                                                          |
| 1 intro        | "Uma IA que vive contigo no teu PC."             | arrives from depth, low, turned away, lit by the rim first; settles closed, three-quarter view  | dark                                                                                                       |
| 2 home         | Home chapter                                     | lid opens on its hinge (0→104°); soft blue-white power bloom; laptop turns towards the copy     | Home fades in                                                                                              |
| 3 thinking     | Thinking chapter                                 | slightly closer                                                                                 | Home → Thinking                                                                                            |
| 4 conversation | Conversation chapter                             | small shift                                                                                     | Thinking → Conversation                                                                                    |
| 5 voice        | Voice chapter (shortcut, honesty note)           | eases back to give the capsule room                                                             | the real capsule rises out of the composer area, clears the bezel and floats beside the copy, then returns |
| 6–9 modes      | heading, LOCAL, AUTO, CLOUD                      | lower camera; composition opens outward for CLOUD                                               | dimmed Conversation                                                                                        |
| 10 brain       | Brain heading                                    | frontal                                                                                         | Conversation → Brain                                                                                       |
| 11 portal      | figure caption (3 demo nodes · 2 real relations) | display fills ~70% of the width; chassis falls into shadow                                      | Brain, with depth frames                                                                                   |
| 12 exit        | Brain details                                    | pull back, turn, lid to 64°, recede; whole stage fades while softly lit (never a black cut-out) | off                                                                                                        |
| 13 end         | Capabilities                                     | gone; calmer sections follow; Download brings the N back                                        | —                                                                                                          |

Camera: vertical FOV 30° (≈45 mm full-frame), composition by lens shift (`setViewOffset`) so the subject moves without keystoning, distance solved per viewport from the requested display width (capped to 62% of the height so navigation and captions keep room).

**LOCAL / AUTO / CLOUD are metaphors aligned with real routing** (`site.ts`): LOCAL — a thin orbit of light stays around the laptop (echoing the hero's orbits); nothing leaves. AUTO — routes become _available_ from behind the lid; the preferred one is active, the alternatives faint, and the orbit stays faintly lit because Ollama is the last resort; no claim of simultaneous routing. CLOUD — a single chosen route reaching further out; the orbit is off (no Ollama for that turn). The DOM copy carries the exact semantics, including the existing caveat.

**Brain portal** uses abstract light only: soft rounded-rectangle outlines echoing the display into depth, a blue-white glow and a slightly darker room. No nodes, particles or data are drawn.

## Fallbacks

| Situation                                                     | Result                                                                                                                                                                                                 |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phone, tablet (< 1100 px or < 620 px tall, or coarse pointer) | Regular site + static laptop still. 3D code never fetched.                                                                                                                                             |
| `prefers-reduced-motion: reduce`                              | Regular site, static still, immediate content (existing reduced-motion rules). Switching the preference live returns to it.                                                                            |
| No WebGL2 / context creation fails                            | Regular site; reason recorded on `<html>`; remembered for 7 days so the next visit lays out in 2D from first paint. 3D code never fetched.                                                             |
| Software WebGL (SwiftShader, llvmpipe, WARP…)                 | Treated as low power: regular site, 3D code never fetched.                                                                                                                                             |
| Save-Data, < 4 GB memory, < 4 cores                           | Regular site from first paint.                                                                                                                                                                         |
| WebGL context lost while running                              | Regular site on the same content.                                                                                                                                                                      |
| Window narrowed mid-page                                      | Regular layout immediately (CSS), stage unmounted, reader kept on the same content: the beat on screen maps to its 2D equivalent, and the gallery shows the same capture. Widening restores the stage. |
| No JavaScript                                                 | Complete regular site with the still.                                                                                                                                                                  |

The **static laptop** (`laptop-still.tsx`) is rendered from the live model by `scripts/render-laptop-still.mjs` (dev server, real GPU) in a fronto-parallel pose, so its display is an exact rectangle and the real Home capture sits on it as a responsive DOM image positioned in percentages (works without JS). 640/960/1280 WebP with alpha: 10,244 / 18,442 / 27,640 B. Decorative (`aria-hidden`); the gallery below carries the captures and their descriptions.

At the top of the page the two layouts are identical (same Product section top and heading position), so a switch to 2D after load shifts nothing in view. One residual: on a software-WebGL machine at exactly 1920×1080, the 2D heading's paragraph peeks 3 px into the viewport after the switch (CLS 0.00024, once, then remembered); the existing image suite's threshold is 0.001.

## Accessibility and SEO

Canvas and display layers are `aria-hidden` with nothing focusable; focus never enters them. Keyboard: the skip link is first; a full Tab walk reaches every tabbable element once, each scrolled into view, uncovered and outlined; Home/End/PageDown scroll natively; anchors (`#produto`, `#brain`, `#download`) land on the right beat with headings below the navigation. axe WCAG 2.0/2.1 A/AA: 0 violations on the cinematic layout and on the phone fallback. Automated checks do not replace an assistive-technology review.

The page is still fully static and server-rendered (no blank page before hydration). The server HTML contains no canvas, all copy, the JSON-LD and metadata unchanged; product copy is never drawn into the canvas.

## Performance

Targets: initial JS ≤ +5 KB gzip; 3D chunk ≤ ~230 KB gzip, after load + idle; no long tasks during scroll; nothing rendered while idle or off-stage; DPR ≤ 1.5.

| Measure                                                  | Result                                                                                                                                                                                                                  |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Initial JS (home page, 8 files)                          | 606,530 B raw / 187,509 B gzip (baseline 602,567 / 185,988): **+1,521 B gzip (+0.8%)**                                                                                                                                  |
| Lazy 3D chunk (three + R3F + scene)                      | 766,662 B raw / 204,638 B gzip / 169,451 B brotli; fetched only on eligible desktops, after `load` + idle                                                                                                               |
| HTML                                                     | 99,690 B raw / 20,341 B gzip (production: 85,481 / 16,858)                                                                                                                                                              |
| Full journey transfer, 1440×900                          | DPR 1: 2D 668 KB → cinematic 764 KB (images −109 KB, chunk +205 KB). DPR 2: 748 KB → 980 KB. Only the Brain loads both tiers at DPR 2 (960 for its small appearance, 1920 for the portal).                              |
| GPU textures                                             | Only small procedural ones (reflection map, gradients); captures are DOM, decoded by the browser                                                                                                                        |
| Frame cost, continuous scroll (local GTX 1660 Ti, D3D11) | 1920×1080, 1728×1117, 1366×768 @1 and 1440×900 @2 (canvas 2160×1350): median 3.6 ms, p95 3.7 ms, p99 3.7 ms; 0–2 frames over 20 ms per full pass (first appearance of a capture); real wheel input: 0 frames over 20 ms |
| Long tasks during the full scroll                        | none (cinematic and regular)                                                                                                                                                                                            |
| Rendering while idle / below the sequence                | 0 frames                                                                                                                                                                                                                |
| JS heap                                                  | 9–11 MB                                                                                                                                                                                                                 |

These are local Chromium observations on one machine (headless Chromium is not vsync-locked, so frame times are costs, not a 60 Hz cap), not guarantees for all hardware. Scripts used: `.cache/exp/perf.mjs`, `network.mjs`, `gc-compare.mjs`, `trace.mjs` (local, not committed); results in `artifacts/cinema/perf/`.

**Profiling fixes along the way.**

- Long tasks of 57–244 ms during scroll were traced to V8/Blink major GCs, themselves driven by a pre-existing cost: `ScrollMotion` wrote `--page-progress` on `<html>` every frame, and since custom properties inherit this restyled the whole document (~440 elements) per frame. It is now set on `.site-header`, its only reader. Long tasks: none afterwards, in both layouts (the regular site's slow frames went from 22–25 to 3 per full scroll).
- Per-frame garbage in the 3D path was halved (array destructuring and closures in hot loops, a reused state object).
- Entrance reveals are excluded from scroll anchoring (`overflow-anchor: none`): a mid-page reload used to land 24 px off in 4 of 5 runs, now 0 in 8 of 8.
- A beat-measurement bug (the current beat was also exposed as `data-cinema-beat` on `<html>`, so a re-measure at that beat could measure the whole document) was fixed (`data-cinema-now`, lookup scoped to `main`), with a regression check at every beat.

## Validation

All against the production build (`npm run build && npm run start`):

| Command                                              | Result                                             |
| ---------------------------------------------------- | -------------------------------------------------- |
| `npm run lint`, `npm run typecheck`, `npm run build` | pass                                               |
| `npm run verify`                                     | 30/30 (external links skipped, as in CI)           |
| `npm run verify:motion`                              | 62/62                                              |
| `npm run verify:images`                              | 274/274                                            |
| `npm run verify:cinema` (software WebGL, as in CI)   | 155/155, two consecutive passes on the final build |
| `CINEMA_GPU=1 npm run verify:cinema` (real GPU)      | 153/153 (software-only checks skipped)             |

The existing suites run unchanged; on software WebGL they exercise the regular site, which is exactly what those users get. `verify:cinema` (new, also in CI; CI timeout raised to 30 minutes) checks: server HTML (no canvas, all copy, section order); lazy loading (exactly one chunk after `load`); the stage is decorative and unfocusable; every beat's real capture, unstretched, at near 1:1 density; the capsule only in its beat; stage gone at exit; anchors stable when re-measured at every beat and after reload; fast jump = slow scroll = backward scroll (identical transforms); no frames when idle or below the sequence; anchor navigation; Home/End/PageDown; a full keyboard walk; axe; reload mid-sequence; narrowing and widening mid-page; context loss; 1920×1080, 1728×1117, 1366×768 compositions; reduced motion, 390/430 phones, 820 tablet, `?cinema=0`, no WebGL (and its memory), software WebGL, no JavaScript; no console, page or hydration errors.

## Review artifacts (ignored by Git)

- `artifacts/cinema/desktop-00-hero.png` … `desktop-14-download.png` — 1440×900: hero, intro (arrival), Home (open), Thinking, Conversation, voice capsule, LOCAL, AUTO, CLOUD, Brain, portal, end, download.
- `artifacts/cinema/1920-*.png`, `1728-*.png`, `1366-*.png` — Home, voice, AUTO and portal at the other desktop sizes.
- `artifacts/cinema/fallback-phone-390.png`, `fallback-phone-430.png`, `fallback-tablet-820.png`, `fallback-reduced-motion.png`, `fallback--cinema-0.png`.
- `artifacts/cinema/recording/cinematic-scroll-1440x900.webm` (36 s, 4.5 MB) and `contact-sheet.png`.
- `artifacts/cinema/experiments/` — WebGL vs DOM display crispness comparison.
- `artifacts/cinema/perf/` — frame, network and allocation measurements; `artifacts/cinema/verification-*.json` — suite reports.

## Dependencies

| Package            | Version | Licence | Why                                              |
| ------------------ | ------- | ------- | ------------------------------------------------ |
| three              | 0.186.1 | MIT     | WebGL renderer, scene, materials                 |
| @react-three/fiber | 9.8.1   | MIT     | React host, demand frame loop, sizing, lifecycle |
| @types/three (dev) | 0.186.0 | MIT     | Types                                            |

Transitive, runtime (via R3F): zustand, its-fine, suspend-react, react-use-measure, use-sync-external-store, @babel/runtime, buffer, base64-js, @types/react-reconciler, @types/webxr (MIT); ieee754 (BSD-3-Clause). Dev-only (via @types/three): fflate, meshoptimizer, @tweenjs/tween.js, @types/stats.js (MIT); @dimforge/rapier3d-compat (Apache-2.0). No 3D model, texture, HDR, font or other third-party asset was added. No Higgsfield or generated imagery.

## Limits and trade-offs

- Real-device coverage is Chromium on one Windows GPU machine (plus software WebGL). Safari, Firefox and physical touch devices need a manual pass before production; the cinematic layer only runs on fine-pointer desktops.
- R3F 9.8 still constructs one deprecated `THREE.Clock` (three r183+); that single warning is filtered through three's own `setConsoleFunction`, everything else passes through.
- The screen captures still show the older internal version (as already disclosed on the site).
- A 1920 px capture cannot be fully sharp when the portal shows it larger than 1920 device pixels (DPR 2); the source is shown intact, not upscaled in advance.
- The first visit on a software-WebGL machine lays out the cinematic structure until the idle-time probe (then 2D, remembered for a week); at the top of the page the two layouts are identical.
