import assert from "node:assert/strict";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gzipSync } from "node:zlib";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve(".cache/browsers");
const { chromium } = await import("@playwright/test");
const { default: AxeBuilder } = await import("@axe-core/playwright");
const output = resolve("artifacts/motion");
await mkdir(output, { recursive: true });
const url = process.env.VERIFY_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch();
const report = { checks: [], errors: [], screenshots: [] };
const check = (label, actual, expected = true) => {
  assert.deepEqual(actual, expected, label);
  report.checks.push(label);
};
const record = process.env.RECORD_MOTION === "1";
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "no-preference",
  ...(record
    ? { recordVideo: { dir: output, size: { width: 1440, height: 1000 } } }
    : {}),
});
const page = await context.newPage();
page.on("pageerror", (error) => report.errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") report.errors.push(message.text());
});
const wait = (ms = 1100) => page.waitForTimeout(ms);
async function jump(y) {
  await page.evaluate(
    (position) => window.scrollTo({ top: position, behavior: "instant" }),
    y,
  );
  await wait();
}
async function top(selector, offset = 112) {
  return page
    .locator(selector)
    .evaluate(
      (node, gap) => node.getBoundingClientRect().top + scrollY - gap,
      offset,
    );
}
async function capture(name, fullPage = false) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images]
        .filter(
          (image) =>
            image.getBoundingClientRect().top < innerHeight &&
            image.getBoundingClientRect().bottom > 0 &&
            image.offsetParent,
        )
        .map((image) => image.decode().catch(() => {})),
    );
  });
  await page.screenshot({
    path: `${output}/${name}.png`,
    fullPage,
    animations: "allow",
  });
  report.screenshots.push(`${name}.png`);
}
async function sweep(end, pixelsPerFrame = 40) {
  // Real rendered frames, native scrolling; no synthetic scroll-event dispatch.
  await page.evaluate(
    async ({ end, pixelsPerFrame }) => {
      const start = scrollY;
      const direction = Math.sign(end - start);
      for (
        let y = start;
        direction * (end - y) > 0;
        y += direction * pixelsPerFrame
      ) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise(requestAnimationFrame);
      }
      window.scrollTo({ top: end, behavior: "instant" });
    },
    { end, pixelsPerFrame },
  );
  await wait();
}
async function noBlankVisible() {
  return page.locator('[data-reveal-state="pending"]').evaluateAll(
    (nodes) =>
      nodes.filter((node) => {
        const rect = node.getBoundingClientRect();
        return (
          rect.bottom > 0 &&
          rect.top < innerHeight * 0.8 &&
          getComputedStyle(node).opacity === "0"
        );
      }).length,
  );
}

try {
  await page.goto(url, { waitUntil: "networkidle" });
  await wait();
  check(
    "Motion progressively enhanced",
    await page.locator("html").getAttribute("data-motion"),
    "ready",
  );
  await capture("desktop-hero");
  await sweep(await top(".showcase-track"), 20);
  const trackTop = await top(".showcase-track");
  const runway = await page
    .locator(".showcase-track")
    .evaluate((node) => parseFloat(getComputedStyle(node, "::after").height));
  check(
    "Desktop has a bounded natural-scroll runway",
    runway > 0 && runway <= 900,
  );
  for (let step = 0; step < 4; step++) {
    await sweep(trackTop + runway * (step / 4 + 0.03), 8);
    check(
      `Scroll selects showcase step ${step + 1}`,
      await page.getByRole("tab").nth(step).getAttribute("aria-selected"),
      "true",
    );
    check(
      `Sticky showcase fits viewport at step ${step + 1}`,
      await page.locator(".showcase-sticky").evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return Math.abs(rect.top - 112) < 2 && rect.bottom <= innerHeight;
      }),
    );
    await capture(`desktop-showcase-${step + 1}`);
  }
  await page.getByRole("tab").first().click();
  await jump(trackTop + runway * 0.9);
  check(
    "Manual tab choice overrides scrolling",
    await page.getByRole("tab").first().getAttribute("aria-selected"),
    "true",
  );
  await page.keyboard.press("ArrowRight");
  check(
    "Keyboard arrow selects next tab",
    await page.getByRole("tab").nth(1).getAttribute("aria-selected"),
    "true",
  );
  await page.keyboard.press("Tab");
  check(
    "Keyboard enters visible panel",
    await page
      .locator('[role="tabpanel"]:not([hidden])')
      .evaluate((node) => node === document.activeElement),
  );
  await jump(trackTop + runway * 0.03);
  check(
    "Scroll never swaps a focused panel",
    await page.getByRole("tab").nth(1).getAttribute("aria-selected"),
    "true",
  );
  await page.evaluate(() => document.activeElement?.blur());
  await jump(await top("#brain"));
  await jump(trackTop + runway * 0.55);
  check(
    "Automatic sequence resumes after leaving manual section",
    await page.getByRole("tab").nth(2).getAttribute("aria-selected"),
    "true",
  );

  for (const [name, selector] of [
    ["brain", "#brain"],
    ["modes", "#modos"],
    ["privacy", "#privacidade"],
    ["story", "#sobre"],
    ["development", ".development"],
    ["download", "#download"],
  ]) {
    await sweep(await top(selector), 35);
    check(`${name} visible after forward scroll`, await noBlankVisible(), 0);
    await capture(`desktop-${name}`);
  }
  await sweep(
    await page.evaluate(
      () => document.documentElement.scrollHeight - innerHeight,
    ),
    35,
  );
  const settled = await page.locator('[data-revealed="true"]').count();
  await sweep(0, 180);
  check(
    "Previously revealed content never rearms on upward scroll",
    await page.locator('[data-revealed="true"]').count(),
    settled,
  );
  await capture("desktop-full", true);
  await jump(99999);
  check(
    "Fast jump to bottom has no blank visible content",
    await noBlankVisible(),
    0,
  );
  await jump(0);
  await page.locator('.desktop-nav a[href="#brain"]').click();
  await wait(1500);
  check(
    "Brain anchor settles content",
    await page.locator('#brain [data-reveal-state="pending"]').count(),
    0,
  );
  check(
    "Anchor heading is not obscured by navigation",
    await page
      .locator("#brain h2")
      .evaluate((node) => node.getBoundingClientRect().top > 90),
  );
  await page.evaluate(() => {
    history.replaceState(null, "", location.pathname);
    document.activeElement?.blur();
  });
  await jump(await top("#sobre"));
  const beforeReload = await page.evaluate(() => scrollY);
  await page.reload({ waitUntil: "networkidle" });
  await wait();
  check(
    "Mid-page reload restores position without a layout jump",
    Math.abs((await page.evaluate(() => scrollY)) - beforeReload) < 3,
  );
  check("Restored content is immediately readable", await noBlankVisible(), 0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await wait(100);
  check(
    "Live reduced-motion change settles every reveal",
    await page.locator('[data-reveal-state="pending"]').count(),
    0,
  );
  check(
    "Reduced motion removes sticky runway",
    await page
      .locator(".showcase-track")
      .evaluate((node) => getComputedStyle(node, "::after").height),
    "0px",
  );
  check(
    "Reduced motion removes depth",
    await page
      .locator(".brain-image")
      .evaluate((node) => getComputedStyle(node).transform),
    "none",
  );
  await jump(await top("#download"));
  await capture("reduced-download");
  await page.emulateMedia({ reducedMotion: "no-preference" });

  for (const [width, height] of [
    [1920, 1080],
    [1440, 900],
    [1280, 760],
    [390, 844],
    [360, 800],
    [430, 932],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(url, { waitUntil: "networkidle" });
    await wait();
    await capture(`${width}-hero`);
    await sweep(await top("#download"), 100);
    check(
      `No horizontal overflow at ${width} × ${height}`,
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    check(`No delayed blank content at ${width}px`, await noBlankVisible(), 0);
    if (width <= 430) {
      check(
        `Mobile ${width}px has compact manual showcase`,
        await page
          .locator(".showcase-track")
          .evaluate((node) => getComputedStyle(node, "::after").height),
        "0px",
      );
      check(
        `Mobile ${width}px has no scroll depth`,
        await page
          .locator(".showcase-visual")
          .evaluate((node) => getComputedStyle(node).transform),
        "none",
      );
      if (width === 390) {
        await capture("mobile-download");
        await jump(await top("#brain", 95));
        await capture("mobile-brain");
        await jump(await top("#modos", 95));
        await capture("mobile-modes");
        await jump(0);
        await capture("mobile-full", true);
        const a11y = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        check(
          "Mobile normal-motion WCAG A/AA automated audit",
          a11y.violations.map((v) => v.id),
          [],
        );
      }
    } else {
      await jump(
        (await top(".showcase-track")) +
          (await page
            .locator(".showcase-track")
            .evaluate((node) =>
              parseFloat(getComputedStyle(node, "::after").height),
            )) *
            0.8,
      );
      check(
        `Voice content fits at ${width} × ${height}`,
        await page.locator(".voice-frame").evaluate((node) =>
          [...node.children].every((child) => {
            const parent = node.getBoundingClientRect(),
              rect = child.getBoundingClientRect();
            return rect.top >= parent.top && rect.bottom <= parent.bottom;
          }),
        ),
      );
      await capture(`${width}-voice`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(url, { waitUntil: "networkidle" });
  await sweep(await top("#download"), 100);
  const a11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  check(
    "Desktop normal-motion WCAG A/AA automated audit",
    a11y.violations.map((v) => v.id),
    [],
  );
  await page.goto(url, { waitUntil: "networkidle" });
  await jump(99999);
  check(
    "Fresh-page fast jump leaves download readable",
    await noBlankVisible(),
    0,
  );
  await jump(0);
  const modeTop = await top(".modes-grid", 0);
  for (let index = 0; index < 3; index++) {
    await jump(modeTop - 780 + ((index + 0.2) / 3) * 720);
    check(
      `Mode ${index + 1} receives its independent scroll accent`,
      await page.locator(".mode").nth(index).getAttribute("data-mode-active"),
      "true",
    );
  }
  await page.goto(url, { waitUntil: "networkidle" });
  await page.keyboard.press("Tab");
  await page.locator(".story-copy > .text-link").focus();
  check(
    "Direct keyboard focus settles pending content",
    await page
      .locator(".story-copy > .text-link")
      .getAttribute("data-reveal-state"),
    "visible",
  );
  check(
    "Focused link has a visible focus indicator",
    await page
      .locator(".story-copy > .text-link")
      .evaluate((node) => getComputedStyle(node).outlineStyle !== "none"),
  );
  const noJs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 1000 },
  });
  const fallback = await noJs.newPage();
  await fallback.goto(url);
  check(
    "No-JS desktop has no unused sticky runway",
    await fallback
      .locator(".showcase-track")
      .evaluate((node) => getComputedStyle(node, "::after").height),
    "0px",
  );
  check(
    "No-JS content is visible",
    await fallback
      .locator("#sobre h2")
      .evaluate((node) => getComputedStyle(node).opacity),
    "1",
  );
  await noJs.close();
  check("No browser/hydration errors", report.errors, []);

  const html = await readFile(".next/server/app/index.html", "utf8");
  const paths = [
    ...new Set(
      [...html.matchAll(/<script[^>]*src="([^"]+)"/g)]
        .map((match) => match[1])
        .filter((path) => path.startsWith("/_next/")),
    ),
  ];
  const chunks = await Promise.all(
    paths.map(async (path) => {
      const file = await readFile(`.next/${path.replace("/_next/", "")}`);
      return { path, bytes: file.length, gzip: gzipSync(file).length };
    }),
  );
  report.bundle = {
    files: chunks.length,
    bytes: chunks.reduce((sum, chunk) => sum + chunk.bytes, 0),
    gzip: chunks.reduce((sum, chunk) => sum + chunk.gzip, 0),
    chunks,
  };
  await writeFile(
    `${output}/bundle-after.json`,
    JSON.stringify(report.bundle, null, 2),
  );
} catch (error) {
  report.failure = error.stack;
  await capture("failure").catch(() => {});
  process.exitCode = 1;
} finally {
  await context.close();
  if (record) {
    await page.video().saveAs(`${output}/scroll-review.webm`);
    await page.video().delete();
    report.recording = "scroll-review.webm";
  }
  await browser.close();
  await writeFile(
    `${output}/verification.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
}
