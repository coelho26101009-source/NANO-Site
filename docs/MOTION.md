# Scroll-motion pass

## Audit and motion map (before implementation)

| Section      | Existing                                                          | Enhancement                                                                                                              | Cost                                                                    |
| ------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Hero         | CSS entrance; fine-pointer N tilt                                 | Keep entrance/tilt; separate shallow scroll translation and illumination opacity into product                            | Two transforms, one opacity; only while visible                         |
| Product      | Static heading; screenshot entrance on tab mount                  | Heading then image with a one-time depth entrance                                                                        | Shared observer, transforms/opacity                                     |
| Showcase     | Four accessible manual tabs                                       | Desktop sticky composition with a short natural-scroll runway, four discrete states; manual interaction takes precedence | React update only when the selected step changes; no scroll capture     |
| Brain        | Fixed perspective; details have replaying view-timeline animation | One-time visual entrance, small perspective correction and blue light opacity, then details                              | Bounded visible-only scroll work; original image unchanged              |
| Modes        | Static three columns                                              | Sequential entrance, one gently accented mode at a time as the row passes                                                | Three bounded state changes; independent accents, not a routing diagram |
| Capabilities | Replaying view-timeline                                           | Once-only editorial rows                                                                                                 | Shared observer                                                         |
| Privacy      | Replaying view-timeline                                           | Slower, shorter once-only reveals; stable controls                                                                       | Shared observer, no blur                                                |
| Story        | Static                                                            | Staged paragraphs and a quiet vertical progression line                                                                  | Shared observer plus one scaleY                                         |
| Development  | Static current/open-work panels                                   | Current item, then documented pending work, with short stagger                                                           | Shared observer; no status/content changes                              |
| Download     | Static final CTA                                                  | Symbol, headline and action settle in; restrained light, then installation information                                   | Shared observer, bounded light opacity                                  |
| Navigation   | React setter on every scroll event                                | Shared frame scheduler updates the scroll class and a one-pixel progress accent                                          | No per-frame React updates                                              |

## Architecture

`ScrollMotion` is a small client enhancement beside the server-rendered page. A declarative reveal registry, one IntersectionObserver for entrances, one observer for active scenes, and one passive scroll listener with a requestAnimationFrame gate coordinate motion. Reads precede writes. There is no perpetual animation loop.

Content is visible by default. JavaScript only arms below-viewport entries; already-visible content and restored/hashed positions start settled. Reveals unobserve after entry and never rearm. Containers with interactive content retain full opacity, and focus/hash navigation settles their relevant reveals immediately. No `inert`, visibility hiding or focus trapping.

The showcase uses one native scroll runway on sufficiently wide/tall desktop viewports. Only boundary crossings update its React state. Clicking/focusing its controls suspends automatic selection until the section is left. No live-region announcements are made for automatic scroll selection. Mobile, short windows, reduced motion and no-JavaScript use the original compact tab layout.

Reduced motion removes the runway, transforms, entrance delays, lighting interpolation and progress indicator, including when the preference changes live. Mobile uses 10px entrances and no scroll-linked depth. No new runtime or development dependencies.

No copy, product claims, identity, release links, images or SEO changes. No Vercel deployment in this pass.

## Review and validation — 2026-10-01

- Production Chromium review: 1920×1080, 1440×1000, 1440×900, 1280×760; mobile 390×844, 360×800 and 430×932. The general suite also covers 1280, 1024 and 768px widths. No horizontal overflow.
- Natural slow/fast scroll in both directions; all four automatic gallery states; manual selection; arrow-key navigation; focused panel protection; automatic selection resuming after leaving; anchor navigation; mid-page reload/scroll restoration; fresh-page fast jumps; direct keyboard focus; independent mode emphasis.
- Reduced motion tested at page load and by changing the preference live. All reveals settle, the gallery returns to compact manual tabs, and scroll depth disappears. No-JavaScript desktop fallback has visible content and no unused scroll runway; mobile navigation still works without JavaScript.
- Axe WCAG A/AA automated audits passed at desktop/mobile sizes with normal and reduced motion. Visible focus, accessible tabs, mobile menu and skip link checked. Automated checks do not substitute for a complete assistive-technology audit.
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm run verify` (40 checks), and `npm run verify:motion` (62 checks) passed. No browser or hydration errors. Ten official external links returned HTTP 200. CI now runs the motion suite as well as the existing checks.
- JavaScript referenced by the production home page: 7 script files before and after; 593,765 → 599,886 bytes raw; 183,309 → 185,237 bytes gzip. Difference: **6,121 bytes raw / 1,928 bytes gzip (+1.05%)**. These are local per-file gzip measurements, not a network/CDN benchmark. No dependencies added.
- Local recorded scroll observation: 777 frames, median 16.7ms, p95 16.8ms, no observed long tasks. This is a Chromium observation on this machine with recording enabled, not a real-device performance guarantee.

The visual review caught and fixed a sticky containment issue: its scroll space now uses an in-flow pseudo-element rather than parent padding. The voice panel spacing also adapts to the shortest sticky viewport. Section staggers restart independently for Brain details, modes and capabilities.

### Local review artifacts (ignored by Git)

`artifacts/motion/` contains 26 screenshots: desktop hero/full page, each of the four gallery states, Brain, modes, privacy, story, development, download; 1920/1440/1280 hero and voice views; 360/390/430 heroes; mobile Brain/modes/download/full page; reduced-motion download. The full-page desktop screenshot includes the sticky gallery's scroll space; the live scrolling recording shows how the gallery occupies it while moving.

- `scroll-review.webm`: short local desktop scroll demonstration, approximately 3 MB.
- `verification.json`: motion checks and screenshot inventory.
- `bundle-before.json` / `bundle-after.json`: production script size comparison.
- `frame-observation.json`: local recording frame observations.
- `../verification.json`: general accessibility, metadata, navigation, responsive and link checks.

Run against a production server (`npm run build`, then `npm run start`):

```sh
npm run verify
npm run verify:motion
```

`VERIFY_URL` can override the local address. `PLAYWRIGHT_BROWSERS_PATH` defaults to `.cache/browsers`; optional `RECORD_MOTION=1` records the complete motion test session. The short review recording was captured separately so it does not include test setup and assertions.

### Scope and remaining review

The original copy, official assets, links, SEO and creator information remain unchanged. Work is confined to the website repository. No Higgsfield, generated imagery or Vercel deployment. No further visual effects are recommended before the user reviews this pass. Safari/Firefox and physical touch-device checks remain optional follow-up coverage; this pass was rendered and verified in Chromium.
