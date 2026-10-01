import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve(".cache/browsers");
const { chromium } = await import("@playwright/test");
const { default: AxeBuilder } = await import("@axe-core/playwright");
const baseUrl = process.env.VERIFY_URL || "http://127.0.0.1:3000";
const output = resolve("artifacts");
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const report = {
  baseUrl,
  viewports: [],
  checks: [],
  errors: [],
  accessibility: [],
  network: [],
};
const check = (label, fn) => {
  try {
    fn();
    report.checks.push({ label, passed: true });
  } catch (error) {
    report.checks.push({ label, passed: false, error: error.message });
  }
};
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
page.on("pageerror", (error) => report.errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") report.errors.push(message.text());
});
await page.addInitScript(() => {
  window.nanoMetrics = { lcp: 0, cls: 0 };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries())
      window.nanoMetrics.lcp = entry.startTime;
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries())
      if (!entry.hadRecentInput) window.nanoMetrics.cls += entry.value;
  }).observe({ type: "layout-shift", buffered: true });
});

async function settleImages() {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images]
        .filter(
          (image) =>
            image.getBoundingClientRect().top < innerHeight &&
            image.getBoundingClientRect().bottom > 0 &&
            image.offsetParent !== null,
        )
        .map((image) => image.decode().catch(() => {})),
    );
  });
}

async function scrollAll() {
  for (const selector of [
    "#produto",
    "#brain",
    "#modos",
    ".capabilities",
    "#privacidade",
    "#sobre",
    ".development",
    "#download",
    ".footer",
  ]) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await settleImages();
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await settleImages();
  assert.equal(await page.locator("html").getAttribute("lang"), "pt-PT");
  assert.match(await page.title(), /NANO.*Windows/);
  report.checks.push({ label: "Portuguese language and title", passed: true });
  report.metrics = await page.evaluate(() => ({
    ...window.nanoMetrics,
    transferredBytes: performance
      .getEntriesByType("resource")
      .reduce((sum, item) => sum + item.transferSize, 0),
  }));
  const anchorProblems = await page
    .locator('a[href^="#"]')
    .evaluateAll((anchors) =>
      anchors
        .map((anchor) => anchor.getAttribute("href"))
        .filter((href) => !document.getElementById(href.slice(1))),
    );
  check("Every internal anchor has a target", () =>
    assert.deepEqual(anchorProblems, []),
  );
  const metadata = await page.evaluate(() => ({
    description: document.querySelector('meta[name="description"]')?.content,
    ogImage: document.querySelector('meta[property="og:image"]')?.content,
    twitter: document.querySelector('meta[name="twitter:card"]')?.content,
    schema: JSON.parse(
      document.querySelector('script[type="application/ld+json"]').textContent,
    ),
  }));
  check("SEO, social image and structured data", () => {
    assert.ok(metadata.description);
    assert.ok(metadata.ogImage?.includes("opengraph-image"));
    assert.equal(metadata.twitter, "summary_large_image");
    assert.equal(metadata.schema.softwareVersion, "0.2.0-beta.1");
  });

  for (const width of [1920, 1440, 1280, 1024, 768, 430, 390, 360]) {
    await page.setViewportSize({ width, height: width <= 390 ? 900 : 1000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await settleImages();
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    const overflow = dimensions.document > dimensions.viewport;
    report.viewports.push({ width, overflow });
    check(`No horizontal overflow at ${width}px`, () =>
      assert.equal(overflow, false),
    );
    if (width === 1440 || width === 390) {
      const prefix = width === 1440 ? "desktop" : "mobile";
      await page.screenshot({ path: `${output}/${prefix}-hero.png` });
      await scrollAll();
      await page.screenshot({
        path: `${output}/${prefix}-full.png`,
        fullPage: true,
      });
      for (const [id, name] of [
        ["#brain", "brain"],
        ["#modos", "modes"],
        ["#download", "download"],
      ]) {
        await page.locator(id).scrollIntoViewIfNeeded();
        await settleImages();
        await page
          .locator(id)
          .screenshot({
            path: `${output}/${prefix}-${name}.png`,
            style: ".site-header { visibility: hidden !important; }",
          });
      }
      await page.locator("#produto").scrollIntoViewIfNeeded();
      await page
        .locator("#produto")
        .screenshot({
          path: `${output}/${prefix}-product.png`,
          style: ".site-header { visibility: hidden !important; }",
        });
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      report.accessibility.push({
        width,
        violations: axe.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.map((node) => ({
            target: node.target,
            summary: node.failureSummary,
          })),
        })),
      });
      check(`WCAG A/AA automated scan at ${width}px`, () =>
        assert.equal(axe.violations.length, 0),
      );
    }
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const id of ["thinking", "conversation", "voice", "home"]) {
    await page.locator(`#tab-${id}`).click();
    await settleImages();
    assert.equal(await page.locator(`#panel-${id}`).isVisible(), true);
    assert.equal(
      await page.locator(`#tab-${id}`).getAttribute("aria-selected"),
      "true",
    );
    const loaded = await page
      .locator(`#panel-${id} img`)
      .evaluate((image) => image.complete && image.naturalWidth > 0);
    assert.equal(loaded, true);
    report.checks.push({
      label: `${id} showcase tab selects real capture`,
      passed: true,
    });
    await page
      .locator(".showcase")
      .screenshot({
        path: `${output}/showcase-${id}.png`,
        style: ".site-header { visibility: hidden !important; }",
      });
  }
  await page.locator("#tab-home").focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(
    await page.locator("#tab-thinking").getAttribute("aria-selected"),
    "true",
  );
  await page.keyboard.press("End");
  assert.equal(
    await page.locator("#tab-voice").getAttribute("aria-selected"),
    "true",
  );
  await page.keyboard.press("Home");
  assert.equal(
    await page.locator("#tab-home").getAttribute("aria-selected"),
    "true",
  );
  report.checks.push({
    label: "Arrow, Home and End tab keyboard navigation",
    passed: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  const summary = page.locator(".mobile-menu summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  assert.equal(await page.locator(".mobile-menu").getAttribute("open"), "");
  await page.screenshot({ path: `${output}/mobile-menu.png` });
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".mobile-menu").getAttribute("open"), null);
  assert.equal(
    await summary.evaluate((element) => element === document.activeElement),
    true,
  );
  await summary.click();
  await page.locator(".mobile-menu a[href='#brain']").click();
  assert.equal(await page.locator(".mobile-menu").getAttribute("open"), null);
  assert.equal(
    await page
      .locator("#brain")
      .evaluate((element) => element === document.activeElement),
    true,
  );
  report.checks.push({
    label:
      "Mobile menu opens with Enter, closes with Escape/link, manages focus",
    passed: true,
  });
  const anchorTop = await page
    .locator("#brain")
    .evaluate((element) => element.getBoundingClientRect().top);
  check("Sticky navigation does not cover section target", () =>
    assert.ok(anchorTop >= 80),
  );

  await page.goto(baseUrl);
  await page.keyboard.press("Tab");
  assert.equal(
    await page
      .locator(".skip-link")
      .evaluate((element) => element === document.activeElement),
    true,
  );
  await page.keyboard.press("Enter");
  assert.equal(
    await page
      .locator("main")
      .evaluate((element) => element === document.activeElement),
    true,
  );
  report.checks.push({
    label: "Keyboard skip link moves focus to main",
    passed: true,
  });
  await page.locator(".privacy-disclosure summary").click();
  assert.equal(
    await page.locator(".privacy-disclosure").getAttribute("open"),
    "",
  );
  report.checks.push({ label: "Privacy disclosure opens", passed: true });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator(".hero-art").hover({ position: { x: 300, y: 150 } });
  const motion = await page.evaluate(() => ({
    transform: getComputedStyle(document.querySelector(".symbol-stage"))
      .transform,
    scroll: getComputedStyle(document.documentElement).scrollBehavior,
    animation: getComputedStyle(document.querySelector(".hero-copy"))
      .animationName,
  }));
  check(
    "Reduced motion disables pointer transforms, animations and smooth scroll",
    () =>
      assert.deepEqual(motion, {
        transform: "none",
        scroll: "auto",
        animation: "none",
      }),
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.mouse.move(1, 1);
  await page.locator(".hero-art").hover({ position: { x: 300, y: 150 } });
  const pointer = await page.locator(".hero-art").getAttribute("style");
  check("Normal-motion pointer interaction responds", () =>
    assert.ok(pointer?.includes("--rx")),
  );
  await page.mouse.move(1, 1);
  await page.screenshot({ path: `${output}/desktop-hero-motion.png` });

  const externalUrls = await page
    .locator('a[href^="https://"]')
    .evaluateAll((anchors) => [
      ...new Set(anchors.map((anchor) => anchor.href.split("#")[0])),
    ]);
  for (const url of process.env.VERIFY_EXTERNAL_LINKS === "0"
    ? []
    : externalUrls) {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(20000),
      });
      report.network.push({ url, status: response.status });
      check(`External link ${url}`, () => assert.ok(response.ok));
    } catch (error) {
      report.network.push({ url, error: error.message });
      report.checks.push({ label: `External link ${url}`, passed: false });
    }
  }
  for (const path of [
    "/robots.txt",
    "/sitemap.xml",
    "/opengraph-image",
    "/brand/nano-symbol.png",
  ]) {
    const response = await fetch(new URL(path, baseUrl));
    check(`Metadata endpoint ${path}`, () =>
      assert.equal(response.status, 200),
    );
    if (path === "/opengraph-image")
      await writeFile(
        `${output}/social.png`,
        Buffer.from(await response.arrayBuffer()),
      );
  }
  const noJs = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const fallback = await noJs.newPage();
  await fallback.goto(baseUrl);
  await fallback.locator(".mobile-menu summary").click();
  assert.equal(await fallback.locator(".mobile-menu").getAttribute("open"), "");
  assert.ok(
    await fallback
      .getByRole("link", { name: "Descarregar para Windows", exact: true })
      .getAttribute("href"),
  );
  report.checks.push({
    label: "No-JavaScript mobile navigation and download remain usable",
    passed: true,
  });
  await noJs.close();
  check("No browser console errors or uncaught exceptions", () =>
    assert.deepEqual(report.errors, []),
  );
} catch (error) {
  report.checks.push({
    label: "Browser verification completed",
    passed: false,
    error: error.stack,
  });
} finally {
  await browser.close();
  await writeFile(
    `${output}/verification.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  if (report.checks.some((check) => !check.passed)) process.exitCode = 1;
}
