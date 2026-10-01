import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import imageAssets from "../src/content/images.json" with { type: "json" };

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve(".cache/browsers");
const { chromium } = await import("@playwright/test");
const url = process.env.VERIFY_URL || "http://127.0.0.1:3000";
const output = resolve("artifacts/images");
await mkdir(output, { recursive: true });
const report = { url, checks: [], resources: [], errors: [], layoutShift: [] };
const check = (label, value) => {
  assert.ok(value, label);
  report.checks.push(label);
};
const browser = await chromium.launch();
try {
  for (const [source, asset] of Object.entries(imageAssets)) {
    const original = await sharp(await readFile(`public${source}`))
      .ensureAlpha()
      .raw()
      .toBuffer();
    const native = asset.variants.at(-1);
    const decoded = await sharp(await readFile(`public${native.src}`))
      .ensureAlpha()
      .raw()
      .toBuffer();
    assert.equal(original.length, decoded.length);
    // Transparent RGB is not displayed. Alpha and every visible pixel must match.
    let identical = true;
    for (let index = 0; index < original.length; index += 4) {
      if (
        original[index + 3] !== decoded[index + 3] ||
        (original[index + 3] > 0 &&
          !original
            .subarray(index, index + 3)
            .equals(decoded.subarray(index, index + 3)))
      ) {
        identical = false;
        break;
      }
    }
    check(`Native lossless pixels/alpha preserved: ${source}`, identical);
    check(
      `No wasteful larger derivative: ${source}`,
      asset.variants.every(
        (variant, index) =>
          !asset.variants
            .slice(index + 1)
            .some((larger) => larger.bytes <= variant.bytes),
      ),
    );
  }
  for (const dpr of [1, 2]) {
    for (const [width, height] of [
      [1920, 1080],
      [1440, 900],
      [1366, 768],
      [430, 932],
      [390, 844],
      [360, 800],
    ]) {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: dpr,
        reducedMotion: "no-preference",
      });
      const page = await context.newPage();
      page.on("pageerror", (error) => report.errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") report.errors.push(message.text());
      });
      await page.addInitScript(() => {
        window.imageCLS = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            if (!entry.hadRecentInput) window.imageCLS += entry.value;
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto(url, { waitUntil: "networkidle" });
      await page.waitForTimeout(1100);
      const label = `${width}px DPR ${dpr}`;
      check(
        `${label}: one high-priority image only`,
        (await page.locator('link[rel="preload"][as="image"]').count()) === 1,
      );
      check(
        `${label}: capture images lazy`,
        await page
          .locator(".product-picture img")
          .evaluateAll((images) =>
            images.every((image) => image.loading === "lazy"),
          ),
      );
      const positions = [];
      for (const [index, name] of [
        "home",
        "thinking",
        "conversation",
        "voice",
      ].entries()) {
        await page.getByRole("tab").nth(index).click();
        const image = page.locator(`#panel-${name} img`);
        await image.evaluate((image) => image.decode());
        await page.waitForTimeout(650);
        const info = await image.evaluate(async (image) => {
          const bitmap = await createImageBitmap(
            await (await fetch(image.currentSrc)).blob(),
          );
          const result = {
            src: image.currentSrc,
            resourceWidth: bitmap.width,
            resourceHeight: bitmap.height,
            width: image.clientWidth,
            height: image.clientHeight,
            fit: getComputedStyle(image).objectFit,
          };
          bitmap.close();
          return result;
        });
        report.resources.push({ label, name, ...info });
        check(
          `${label}: ${name} adequate source density`,
          info.resourceWidth >=
            Math.min(name === "voice" ? 760 : 1920, info.width * dpr) - 2,
        );
        check(
          `${label}: ${name} natural aspect ratio`,
          Math.abs(
            info.width / info.height -
              (name === "voice" ? 760 / 180 : 1920 / 1032),
          ) < 0.025,
        );
        check(
          `${label}: ${name} bypasses lossy optimization`,
          new URL(info.src).pathname.startsWith("/images/") &&
            info.src.endsWith(".webp"),
        );
        if (name === "voice")
          check(`${label}: voice has 2x native pixels`, info.width <= 380);
        positions.push(
          await page
            .locator(`#panel-${name} .screenshot-frame`)
            .evaluate((node) => ({
              width: node.clientWidth,
              height: node.clientHeight,
            })),
        );
      }
      check(
        `${label}: stable first three frame dimensions`,
        positions
          .slice(0, 3)
          .every(
            (position) =>
              Math.abs(position.width - positions[0].width) < 1 &&
              Math.abs(position.height - positions[0].height) < 1,
          ),
      );
      if (width >= 1100)
        check(
          `${label}: voice preserves sticky frame size`,
          Math.abs(positions[3].height - positions[0].height) < 1,
        );
      await page.locator(".brain-image").scrollIntoViewIfNeeded();
      await page
        .locator(".brain-image img")
        .evaluate((image) => image.decode());
      await page.waitForTimeout(1000);
      check(
        `${label}: Brain composition not cropped`,
        await page
          .locator(".brain-image img")
          .evaluate(
            (image) =>
              Math.abs(image.clientWidth / image.clientHeight - 1920 / 1032) <
                0.02 && getComputedStyle(image).objectFit !== "cover",
          ),
      );
      check(
        `${label}: no horizontal overflow`,
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      const cls = await page.evaluate(() => window.imageCLS);
      report.layoutShift.push({ label, cls });
      check(`${label}: no image layout shift`, cls < 0.001);
      const selected = await page
        .locator(".brain-image img")
        .getAttribute("src");
      check(
        `${label}: original PNG fallback retained`,
        selected === "/screenshots/nano-brain.png",
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForTimeout(150);
      check(
        `${label}: reduced motion preserves uncropped Brain`,
        await page
          .locator(".brain-image img")
          .evaluate((image) => getComputedStyle(image).objectFit !== "cover"),
      );
      await context.close();
    }
  }
  check("No image browser/hydration errors", report.errors.length === 0);
  const asset = imageAssets["/screenshots/nano-home.png"].variants.at(-1).src;
  const response = await fetch(`${url}${asset}`);
  check(
    "Hashed image cached immutably",
    response.headers.get("cache-control")?.includes("immutable"),
  );
} catch (error) {
  report.failure = error.stack;
  process.exitCode = 1;
} finally {
  await browser.close();
  await writeFile(
    `${output}/verification.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
}
