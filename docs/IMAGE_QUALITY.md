# Image quality and fit review

Reviewed the real Vercel deployment first, at website commit `9127a79`. Application sources were read only, at public main `3f3524ea82812c337e71e4945b722ee8e099707b`. All existing website PNGs matched the official files byte for byte. No application files were modified.

## Findings and choices

| Visual                       | Source                                       | Problem observed                                                                                                                | Treatment                                                                                                         |
| ---------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Home, Thinking, Conversation | 1920×1032 PNG                                | Lossy AVIF softened small labels and borders. Short desktop windows put a small image inside a wide frame with large side bars. | Lossless responsive WebP, original PNG fallback. Native-ratio frame sized against available viewport height.      |
| Brain                        | 1920×1032 PNG                                | Lossy labels; mobile `cover` cropped the sidebar and composition into a 320px-high window.                                      | Lossless responsive WebP, natural height and complete composition. Original full-resolution link retained.        |
| Voice overlay                | 760×180 PNG                                  | Rendering at 760 CSS px only supplies 1× pixels even on DPR 2.                                                                  | Cap at 380 CSS px, keep the surrounding presentation, supply up to 760 native pixels losslessly.                  |
| Hero N                       | 360×289 corrected PNG                        | Rendered at about 423–467 CSS px, exceeding source width even at DPR 1. Lossy re-encoding added an unnecessary conversion.      | Cap stage at 360 CSS px; use a lossless encoding of the same authoritative derivative. No alpha/silhouette edits. |
| Wordmark / nav / download    | 334×103 wordmark; same 360×289 symbol        | Small lossy derivatives; no composition issue.                                                                                  | Lossless native bitmaps. Symbol URL is shared with the preloaded hero and cached. Existing fit retained.          |
| OpenGraph / icons            | 1200×630 social PNG; original favicon assets | No image-fit issue found. OG embeds the corrected N at 330px.                                                                   | Unchanged.                                                                                                        |

The application also contains `nano-symbol-original.png` at 1254×1254. Visual inspection showed the older edge/alpha artifacts; it is **not** a suitable replacement for the corrected derivative. It was not copied, edited or used. No recaptures were necessary: the screenshot originals are substantially clearer than the lossy deployed output.

## Actual rendered sizes

Approximate untransformed image-content dimensions, excluding the frame border. Rotation can enlarge a visual bounding rectangle without changing its CSS size. Before sizes for product captures describe the painted image inside `contain`, rather than the much wider element box.

| Viewport  | Product before                    | Product after | Brain before → after           |
| --------- | --------------------------------- | ------------- | ------------------------------ |
| 1920×1080 | 1196×643                          | 1198×643      | 1198×644 → unchanged           |
| 1440×900  | 964×518, inside a 1198px-wide box | 1040×558      | 1198×644 → unchanged           |
| 1366×768  | 718×386, inside a 1198px-wide box | 794×426       | 1198×644 → unchanged           |
| 390×844   | 348×186                           | unchanged     | cropped 348×320 → full 348×187 |
| 430×932   | 388×208                           | unchanged     | cropped 388×320 → full 388×209 |
| 360×800   | 318×170                           | unchanged     | cropped 318×320 → full 318×171 |

The native screenshot aspect ratio is shared by all four desktop showcase frames, so tab changes preserve their dimensions. Tabs/caption spacing is slightly tighter to allocate more height to the image. Sticky thresholds, natural scroll runway, automatic sequence, manual priority, keyboard behavior and Brain perspective are preserved.

## Encoding comparison and responsive delivery

Compared the actual deployed optimized resources with local AVIF/WebP quality 75, 90 and 95 outputs, original PNGs and lossless WebP. The local AVIF comparison follows Next's quality mapping; Vercel's encoder output sizes can differ. Inspected UI text at native pixels and DPR 2 browser captures. Higher lossy quality reduced artifacts but did not preserve fine UI detail as well as lossless.

| Native visual | PNG bytes | Local AVIF q75 | Local AVIF q90 | Local AVIF q95 | Lossless WebP |
| ------------- | --------: | -------------: | -------------: | -------------: | ------------: |
| Home          |    64,083 |         16,157 |         20,405 |         21,471 |        34,770 |
| Thinking      |    53,110 |         13,728 |         17,615 |         18,642 |        25,600 |
| Conversation  |    51,792 |         13,396 |         17,084 |         18,029 |        24,318 |
| Brain         |   358,573 |         20,542 |         24,433 |         25,490 |       216,656 |
| Voice         |     9,301 |          1,489 |          1,646 |          1,696 |         5,370 |

`npm run images:generate` uses the Sharp processor already supplied by Next.js; no dependency was added. It creates content-hashed files in `public/images/` and the generated `src/content/images.json` manifest. Candidate widths are 480, 768, 960, 1200, 1600 and native width. A candidate is omitted if a larger-resolution version costs fewer bytes (common when downsampling flat UI adds colours). Native-size decoded pixels and alpha are checked against each original.

`ProductImage` uses a responsive `<picture>` source with these lossless resources and a Next Image PNG fallback. `unoptimized` applies to these pre-encoded assets only; global Next optimization remains enabled. All product images remain lazy, with intrinsic dimensions. Only the hero is preloaded. Hashed resources have a one-year immutable cache policy. Original PNG links still open the full official capture.

Measured resource widths: before, desktop screenshots were served at 1200px for DPR 1 and 1920px for DPR 2 (even when the optimizer URL requested 3840). Thus the original issue was **not** a 1200px resource incorrectly delivered at DPR 2. After, desktop product captures select 960 or native 1920 as appropriate; Brain selects 1200/1920. Mobile selects 480px at DPR 1 and 768/960 at DPR 2. Voice selects 480/760. No upscaled fake source files are generated.

At 1440×900 DPR 2, a clean Chromium visit measured image-body transfers of 48,676 → 321,276 bytes initially, and 81,814 → 376,564 bytes after visiting the sections and all tabs. Native lazy-loading heuristics prefetch Home and Brain below the fold in this browser; hidden Thinking/Conversation/Voice are not all fetched initially. Most of the increase is the 216,656-byte lossless Brain. The complete five native captures total 306,714 bytes, versus 536,859 bytes for their original PNGs. This deliberately prioritizes UI fidelity while keeping responsive smaller mobile variants and caching. These are image payload bytes, not total-page or real-user performance figures.

## Validation and review artifacts

- Chromium rendering at 1920×1080, 1440×900, 1366×768, 430×932, 390×844 and 360×800; DPR 1 and 2. Source and rendered image checks, no distortion/cropping, no horizontal overflow, no image layout shift (CLS 0 in the image suite), browser console clean.
- Existing general suite: 40 checks, including axe accessibility, reduced motion, navigation and official links. Existing motion suite: 62 checks. New `verify:images`: 274 checks, including decoded native pixel/alpha equality, density, ratios, stable frames, lazy loading, hero preload, PNG fallback and immutable cache. CI now runs all three suites.
- `lint`, `typecheck` and production `build` passed. No source content, claims, SEO metadata, navigation architecture or release links changed.
- Ignored `artifacts/images/before/` and `after/`: real browser screenshots and image resource audits for all requested desktop/mobile/DPR combinations. `compare-live-text.png`, `compare-brain-mobile.png`, and `encodings/compare-native-text.png`: visual comparisons. `source-assets.json`, `network.json` and `verification.json`: source hashes, measured requests and image assertions. General/motion suites also produce complete desktop/mobile pages in `artifacts/` and `artifacts/motion/`.

## Limits and production

The corrected N still only contains 360×289 pixels: it cannot provide true 2× detail at a 360 CSS px size. A future authoritative corrected higher-resolution source is required to remove that limit; no unauthorized alpha work was performed. Likewise a 1920px screenshot cannot supply a full 2400px raster for a 1200 CSS px display at DPR 2. The native source is served intact, without inventing detail. Voice fits within its 2× source budget.

GitHub shows the existing Vercel Production integration attached to main. The requested URL `https://nano-site-ashen.vercel.app/` now redirects to `https://nanoassistantsite.vercel.app/`. No project or domain was created/configured during this work. After the final push, verify the existing automatic deployment and visually inspect the real production destination before reporting deployment success.
