// Build-time only. Renders the static laptop used wherever the 3D stage does
// not run (phones, tablets, reduced motion, no WebGL, no JavaScript).
//
// It is the same procedural model as the live scene, captured from a dev
// server in a fronto-parallel pose, so its display is an exact rectangle and
// the real Home capture can sit on it as a crisp, responsive DOM image.
//
//   npx next dev --port 3100      (other terminal)
//   node scripts/render-laptop-still.mjs [http://127.0.0.1:3100]
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve(".cache/browsers");
const { chromium } = await import("@playwright/test");

const url = process.argv[2] || "http://127.0.0.1:3100";
const browser = await chromium.launch({
  channel: "chromium",
  args: ["--use-angle=d3d11", "--ignore-gpu-blocklist"],
});
const scale = 2;
const page = await browser.newPage({
  viewport: { width: 1600, height: 1100 },
  deviceScaleFactor: scale,
});
await page.goto(`${url}/?cinema=1&still=1`, { waitUntil: "networkidle" });
await page.waitForFunction(
  () => "cinemaReady" in document.documentElement.dataset,
  null,
  {
    timeout: 60000,
  },
);
await page.addStyleTag({
  content: `html, body { background: transparent !important; }
    main, .site-header, .footer, .skip-link, .cinema-overlay, nextjs-portal { visibility: hidden !important; }`,
});
await page.waitForTimeout(1500);
const quad = await page.evaluate(() =>
  window.__nanoCinema.screen.map((corner) => [...corner]),
);
const png = await page.screenshot({ omitBackground: true, type: "png" });
await browser.close();

// Trim to pixels that are actually visible (alpha > 6/255).
const { data, info } = await sharp(png)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
let minX = info.width,
  minY = info.height,
  maxX = 0,
  maxY = 0;
for (let y = 0; y < info.height; y++)
  for (let x = 0; x < info.width; x++)
    if (data[(y * info.width + x) * 4 + 3] > 6) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
const pad = 24;
const left = Math.max(0, minX - pad);
const top = Math.max(0, minY - pad);
const width = Math.min(info.width, maxX + pad) - left;
const height = Math.min(info.height, maxY + pad) - top;
const cropped = await sharp(png)
  .extract({ left, top, width, height })
  .toBuffer();

// Display rectangle as fractions of the still (TL, TR, BR, BL corners).
const px = quad.map(([x, y]) => [x * scale - left, y * scale - top]);
const screen = {
  x: px[0][0] / width,
  y: px[0][1] / height,
  width: (px[1][0] - px[0][0]) / width,
  height: (px[3][1] - px[0][1]) / height,
};
const skew = Math.max(
  Math.abs(px[0][1] - px[1][1]),
  Math.abs(px[0][0] - px[3][0]),
);
if (skew > 1.5)
  throw new Error(
    `Display is not fronto-parallel (skew ${skew.toFixed(2)} px)`,
  );

const manifestPath = "src/content/laptop-still.json";
try {
  const previous = JSON.parse(await readFile(manifestPath, "utf8"));
  for (const variant of previous.variants)
    await rm(`public${variant.src}`, { force: true });
} catch {}
const variants = [];
for (const size of [640, 960, 1280]) {
  const buffer = await sharp(cropped)
    .resize({ width: size })
    .webp({ quality: 88, alphaQuality: 92, effort: 6, smartSubsample: true })
    .toBuffer();
  const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 10);
  const src = `/images/nano-laptop-${size}-${hash}.webp`;
  await writeFile(`public${src}`, buffer);
  variants.push({ width: size, src, bytes: buffer.length });
}
const manifest = {
  width,
  height,
  screen: Object.fromEntries(
    Object.entries(screen).map(([k, v]) => [k, +v.toFixed(5)]),
  ),
  variants,
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));
