// Cinematic 3D layer: progressive enhancement, choreography and fallbacks.
// Run against a production server (npm run build && npm run start).
// CI uses software WebGL, so the stage is forced with ?cinema=1 there; set
// CINEMA_GPU=1 locally to drive Chromium's real GPU path instead.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

process.env.PLAYWRIGHT_BROWSERS_PATH ??= resolve(".cache/browsers");
const { chromium } = await import("@playwright/test");
const { default: AxeBuilder } = await import("@axe-core/playwright");
const base = (process.env.VERIFY_URL || "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);
const gpu = process.env.CINEMA_GPU === "1";
const output = resolve("artifacts/cinema");
await mkdir(output, { recursive: true });
const browser = await chromium.launch(
  gpu
    ? {
        channel: "chromium",
        args: ["--use-angle=d3d11", "--ignore-gpu-blocklist"],
      }
    : {},
);
const report = {
  base,
  gpu,
  checks: [],
  errors: [],
  screenshots: [],
  beats: {},
};
const check = (label, actual, expected = true) => {
  assert.deepEqual(actual, expected, label);
  report.checks.push(label);
};
const forced = gpu ? "" : "?cinema=1";
const BEATS = [
  "hero",
  "intro",
  "home",
  "thinking",
  "conversation",
  "voice",
  "modes",
  "local",
  "auto",
  "cloud",
  "brain",
  "portal",
  "exit",
  "end",
];

async function open({
  width = 1440,
  height = 900,
  query = forced,
  init,
  ...options
} = {}) {
  const context = await browser.newContext({
    viewport: { width, height },
    ...options,
  });
  const page = await context.newPage();
  const chunks = [];
  page.on("pageerror", (error) =>
    report.errors.push(`${width}x${height}: ${error.message}`),
  );
  page.on("console", (message) => {
    if (message.type() === "error" || /hydrat/i.test(message.text()))
      report.errors.push(`${width}x${height}: ${message.text()}`);
  });
  page.on("request", (request) => {
    if (request.url().includes("/_next/static/chunks/"))
      chunks.push({ url: request.url(), at: Date.now() });
  });
  if (init) await page.addInitScript(init);
  await page.goto(`${base}/${query}`, { waitUntil: "networkidle" });
  return { context, page, chunks };
}
// Generous waits: CI renders WebGL in software on small runners, where one
// heavy frame (the Brain portal) can take seconds. Assertions are unchanged.
const STAGE_TIMEOUT = 180000;
const ready = (page) =>
  page.waitForFunction(
    () => "cinemaReady" in document.documentElement.dataset,
    null,
    { timeout: STAGE_TIMEOUT },
  );
const settle = (page) =>
  page.waitForFunction(
    () => {
      const state = window.__nanoCinema;
      return state && state.t === state.goal;
    },
    null,
    { timeout: STAGE_TIMEOUT },
  );
async function jump(page, y) {
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: "instant" }),
    y,
  );
  await page.waitForTimeout(120);
  await settle(page);
  await page.waitForTimeout(120);
}
async function capture(page, name) {
  // After an instant jump, let the site's entrance reveals finish (as a reader would see).
  await page
    .waitForFunction(
      () =>
        ![...document.querySelectorAll('[data-reveal-state="pending"]')].some(
          (node) => {
            const rect = node.getBoundingClientRect();
            return rect.bottom > 0 && rect.top < innerHeight;
          },
        ),
      null,
      { timeout: 5000 },
    )
    .catch(() => {});
  await page.waitForTimeout(950);
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images]
        .filter(
          (image) =>
            image.getBoundingClientRect().bottom > 0 &&
            image.getBoundingClientRect().top < innerHeight,
        )
        .map((image) => image.decode().catch(() => {})),
    );
  });
  await page.screenshot({ path: `${output}/${name}.png` });
  report.screenshots.push(`${name}.png`);
}
/** Visible display layers and capsule, as the viewer sees them. */
const displayState = (page) =>
  page.evaluate(() => {
    const images = [...document.querySelectorAll(".cinema-display-image")]
      .filter(
        (image) =>
          getComputedStyle(image).visibility === "visible" &&
          Number(image.style.opacity) > 0.01,
      )
      .map((image) => {
        const rect = image.getBoundingClientRect();
        return {
          src: image.currentSrc || image.src,
          opacity: Number(image.style.opacity),
          natural: [image.naturalWidth, image.naturalHeight],
          box: [image.offsetWidth, image.offsetHeight],
          onScreen: [rect.width, rect.height],
          transform: image.style.transform,
        };
      });
    const capsule = document.querySelector(".cinema-capsule");
    return {
      beat: document.documentElement.dataset.cinemaNow,
      t: window.__nanoCinema?.t,
      stage: Number(
        document.querySelector(".cinema-scene")?.style.opacity || 0,
      ),
      images,
      capsule: capsule
        ? getComputedStyle(capsule).visibility === "visible" &&
          Number(capsule.style.opacity) > 0.5
        : false,
      dpr: devicePixelRatio,
    };
  });
const noOverflow = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

try {
  // 1. Server HTML: complete content, no canvas, both story structures.
  const html = await (await fetch(`${base}/`)).text();
  check("Server HTML has no canvas or 3D code", /<canvas/i.test(html), false);
  for (const text of [
    "O teu assistente",
    "Uma conversa começa aqui.",
    "Acompanha o que está a acontecer.",
    "Retoma o fio à conversa.",
    "Uma voz ao alcance de um atalho.",
    "Uma memória",
    "Descarregar para Windows",
  ])
    check(`Server HTML contains "${text}"`, html.includes(text));
  check(
    "LOCAL / AUTO / CLOUD precede the Brain in document order",
    html.indexOf('id="modos"') < html.indexOf('id="brain"'),
  );

  // 2. Lazy 3D: nothing heavy before load, then one chunk and a ready stage.
  {
    const { context, page, chunks } = await open();
    const loadEnd = await page.evaluate(() => performance.timing.loadEventEnd);
    await ready(page);
    const stage = await page.evaluate(() => {
      const element = document.querySelector(".cinema-stage");
      return {
        hidden: element.getAttribute("aria-hidden"),
        canvas: Boolean(element.querySelector("canvas")),
        focusable: element.querySelectorAll(
          "a, button, input, select, textarea, [tabindex]",
        ).length,
      };
    });
    check("Stage is decorative to assistive technology", stage.hidden, "true");
    check("Stage has a canvas once ready", stage.canvas, true);
    check("Stage contains nothing focusable", stage.focusable, 0);
    const lazy = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((entry) => entry.name.includes("/_next/static/chunks/"))
        .map((entry) => ({
          name: entry.name,
          start: performance.timeOrigin + entry.startTime,
        })),
    );
    const late = lazy.filter((entry) => entry.start > loadEnd);
    check(
      "Exactly one script chunk is fetched after load (the 3D stage)",
      late.length,
      1,
    );
    report.lazyChunk = late[0]?.name.split("/").pop();
    void chunks;

    // 3. Every beat: expected capture on the display, capsule, effects, exit.
    await page.waitForFunction(
      () => window.__nanoCinema?.anchors().length === 14,
    );
    const anchors = await page.evaluate(() => window.__nanoCinema.anchors());
    check(
      "Beat anchors increase monotonically",
      anchors.every(
        (value, index) => index === 0 || value > anchors[index - 1],
      ),
    );
    const expected = {
      home: "nano-home",
      thinking: "nano-thinking",
      conversation: "nano-conversation",
      voice: "nano-conversation",
      brain: "nano-brain",
      portal: "nano-brain",
    };
    for (const [index, beat] of BEATS.entries()) {
      await jump(page, anchors[index]);
      const state = await displayState(page);
      report.beats[beat] = {
        t: state.t,
        stage: state.stage,
        images: state.images.map((image) => image.src.split("/").pop()),
        capsule: state.capsule,
      };
      check(
        `Beat ${beat}: timeline settles on its chapter`,
        Math.abs(state.t - index) < 0.02,
      );
      // Regression: re-measuring while this beat is current must not move any anchor.
      await page.evaluate(() => window.dispatchEvent(new Event("resize")));
      await page.waitForTimeout(80);
      const remeasured = await page.evaluate(() =>
        window.__nanoCinema.anchors(),
      );
      check(
        `Beat ${beat}: re-measuring keeps every anchor`,
        remeasured.every((value, at) => Math.abs(value - anchors[at]) < 1),
      );
      if (expected[beat]) {
        const top = state.images.at(-1);
        check(
          `Beat ${beat}: real ${expected[beat]} capture on the display`,
          Boolean(top && top.src.includes(expected[beat])),
        );
        check(
          `Beat ${beat}: capture not stretched (CSS box = natural size)`,
          top.box[0] === top.natural[0] && top.box[1] === top.natural[1],
        );
        const deviceScale = (top.onScreen[0] * state.dpr) / top.natural[0];
        // Never upscaled unless already the largest (1920 px) source; never
        // below 0.4x, where the compositor's bilinear sampling aliases.
        report.beats[beat] = { ...report.beats[beat], deviceScale };
        check(
          `Beat ${beat}: source sharpness (${top.natural[0]} px at ${deviceScale.toFixed(2)}x)`,
          deviceScale >= 0.4 && (deviceScale <= 1.04 || top.natural[0] >= 1920),
        );
      }
      check(
        `Beat ${beat}: voice capsule only in the voice beat`,
        state.capsule,
        beat === "voice",
      );
      if (beat === "exit" || beat === "end")
        check(`Beat ${beat}: stage has left`, state.stage, 0);
      if (
        [
          "hero",
          "intro",
          "home",
          "thinking",
          "conversation",
          "voice",
          "local",
          "auto",
          "cloud",
          "brain",
          "portal",
          "end",
        ].includes(beat)
      )
        await capture(
          page,
          `desktop-${String(index).padStart(2, "0")}-${beat}`,
        );
    }

    // 4. Determinism: a fast jump and a slow scroll land on the same frame.
    const target = anchors[3] + (anchors[4] - anchors[3]) * 0.37;
    await jump(page, 0);
    await jump(page, target);
    const fast = await displayState(page);
    await jump(page, 0);
    await page.evaluate(async (to) => {
      for (let y = 0; y < to; y += 24) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise(requestAnimationFrame);
      }
      window.scrollTo({ top: to, behavior: "instant" });
    }, target);
    await settle(page);
    const slow = await displayState(page);
    check(
      "Fast jump and slow scroll produce the same timeline time",
      Math.abs(fast.t - slow.t) < 1e-6,
    );
    check(
      "Fast jump and slow scroll produce the same display transform",
      fast.images.at(-1)?.transform,
      slow.images.at(-1)?.transform,
    );
    await jump(page, anchors[13] + 400);
    await jump(page, target);
    const back = await displayState(page);
    check(
      "Scrolling back reproduces the same frame",
      back.images.at(-1)?.transform,
      fast.images.at(-1)?.transform,
    );

    // 5. Nothing renders while idle or once the sequence is behind.
    const idleBefore = await page.evaluate(() => window.__nanoCinema.frames);
    await page.waitForTimeout(1500);
    check(
      "No frames rendered while idle",
      await page.evaluate(() => window.__nanoCinema.frames),
      idleBefore,
    );
    await jump(page, anchors[13] + 1200);
    const offBefore = await page.evaluate(() => window.__nanoCinema.frames);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(700);
    check(
      "No frames rendered while scrolling below the sequence",
      await page.evaluate(() => window.__nanoCinema.frames),
      offBefore,
    );

    // 6. Anchor navigation lands in the right chapter with readable headings.
    for (const [href, beat] of [
      ["#produto", "intro"],
      ["#brain", "brain"],
    ]) {
      await jump(page, 0);
      await page.locator(`.desktop-nav a[href="${href}"]`).click();
      await page.waitForTimeout(1600);
      await settle(page);
      const state = await displayState(page);
      check(
        `Anchor ${href} lands near the ${beat} beat`,
        Math.abs(state.t - BEATS.indexOf(beat)) < 0.75,
      );
      check(
        `Anchor ${href} heading is below the navigation`,
        await page
          .locator(`${href} h2`)
          .evaluate((node) => node.getBoundingClientRect().top > 80),
      );
    }
    await page.locator('.desktop-nav a[href="#download"]').click();
    await page.waitForTimeout(1600);
    check(
      "Download anchor: stage has left, symbol and button visible",
      await page.evaluate(() => {
        const scene = document.querySelector(".cinema-scene");
        const button = document
          .querySelector("#download .button-primary")
          .getBoundingClientRect();
        return (
          Number(scene.style.opacity) === 0 &&
          button.top > 0 &&
          button.bottom < innerHeight
        );
      }),
    );
    await capture(page, "desktop-14-download");

    // 7. Keyboard: Home/End/PageDown and focus never hidden by the stage.
    // Smooth scrolling is native and time-based; wait for the outcome.
    const reaches = (condition) =>
      page.waitForFunction(condition, null, { timeout: 60000 }).then(
        () => true,
        async () => {
          report.keyboardTimeout = await page.evaluate(() => ({
            y: scrollY,
            max: document.documentElement.scrollHeight - innerHeight,
            active: document.activeElement?.outerHTML.slice(0, 100),
          }));
          return false;
        },
      );
    // Paced like a person: Chromium ignores a key scroll requested in the very
    // frame a smooth scroll ends (the regular 2D site behaves the same way).
    await page.keyboard.press("Home");
    check("Home key returns to the top", await reaches(() => scrollY === 0));
    await page.waitForTimeout(300);
    await page.keyboard.press("End");
    check(
      "End key reaches the bottom",
      await reaches(
        () =>
          scrollY + innerHeight >= document.documentElement.scrollHeight - 2,
      ),
    );
    await page.waitForTimeout(300);
    await page.keyboard.press("Home");
    await reaches(() => scrollY === 0);
    await page.waitForTimeout(300);
    await page.keyboard.press("PageDown");
    check("PageDown scrolls natively", await reaches(() => scrollY > 300));
    // Fresh document, so sequential focus starts at the top (as for a visitor).
    await page.goto(`${base}/${forced}`, { waitUntil: "networkidle" });
    await ready(page);
    await page.keyboard.press("Tab");
    check(
      "Skip link is the first stop",
      await page.evaluate(() =>
        document.activeElement?.classList.contains("skip-link"),
      ),
    );
    // Walk every stop to the end of the page. Focus scrolling is smooth (the
    // site's scroll-behavior), so each stop waits for its scroll to settle.
    const stops = [];
    for (let step = 0; step < 80; step++) {
      // Fresh stillness timer per stop: the focus scroll may start a frame later.
      await page.evaluate(
        () => (window.__focusScroll = { y: scrollY, since: performance.now() }),
      );
      await page.keyboard.press("Tab");
      if (await page.evaluate(() => document.activeElement === document.body))
        break;
      // Wait until the focus scroll has finished: in view and still for 300 ms.
      await page
        .waitForFunction(
          () => {
            const rect = document.activeElement.getBoundingClientRect();
            const now = performance.now();
            const last = window.__focusScroll;
            if (scrollY !== last.y)
              Object.assign(last, { y: scrollY, since: now });
            return (
              rect.bottom > 0 &&
              rect.top < innerHeight &&
              now - last.since > 300
            );
          },
          null,
          { timeout: 20000, polling: 50 },
        )
        .catch(() => {});
      stops.push(
        await page.evaluate(() => {
          const node = document.activeElement;
          const rect = node.getBoundingClientRect();
          // Hit-test the centre: nothing (header, stage) may cover a focused control.
          const hit = document.elementFromPoint(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
          );
          return {
            text: (node.getAttribute("aria-label") || node.textContent || "")
              .trim()
              .slice(0, 40),
            inStage: Boolean(node.closest(".cinema-stage")),
            visible:
              rect.bottom > 0 && rect.top < innerHeight && rect.width > 0,
            uncovered: Boolean(
              hit && (node === hit || node.contains(hit) || hit.contains(node)),
            ),
            hit: hit ? String(hit.className || hit.tagName).slice(0, 40) : null,
            rect: [rect.top, rect.bottom].map(Math.round),
            y: Math.round(scrollY),
            outline: getComputedStyle(node).outlineStyle,
          };
        }),
      );
    }
    report.keyboard = stops;
    const tabbable = await page.evaluate(
      () =>
        [
          ...document.querySelectorAll(
            "a[href], button, summary, input, select, textarea, [tabindex]",
          ),
        ].filter(
          (node) =>
            node.tabIndex >= 0 &&
            node.getClientRects().length > 0 &&
            !node.closest("[inert], details:not([open]) > :not(summary)"),
        ).length,
    );
    // Every tabbable element after the skip link, in one pass, without traps.
    check(
      "Keyboard walks every tabbable element once",
      stops.length,
      tabbable - 1,
    );
    check(
      "Keyboard focus never enters the stage",
      stops.some((stop) => stop.inStage),
      false,
    );
    check(
      "Every focused element is scrolled into view",
      stops.filter((stop) => !stop.visible).map((stop) => stop.text),
      [],
    );
    check(
      "No focused element is covered",
      stops.filter((stop) => !stop.uncovered).map((stop) => stop.text),
      [],
    );
    check(
      "Focused elements show an outline",
      stops.filter((stop) => stop.outline === "none").map((stop) => stop.text),
      [],
    );
    check(
      "Keyboard reaches the chapter capture links",
      stops.filter((stop) => stop.text.startsWith("Abrir captura completa"))
        .length >= 4,
    );

    // 8. Axe on the cinematic layout, mid-sequence.
    await jump(page, anchors[4]);
    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    report.axe = axe.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target),
    }));
    check(
      "Cinematic layout passes automated WCAG A/AA",
      axe.violations.map((violation) => violation.id),
      [],
    );
    check(
      "No horizontal overflow at 1440 × 900 (cinema)",
      await noOverflow(page),
    );

    // 9. Reload mid-sequence restores position and frame — as a reader does
    // it: a fresh visit, scroll to a chapter, reload.
    await page.goto(`${base}/${forced}`, { waitUntil: "networkidle" });
    await ready(page);
    await jump(page, anchors[4]);
    const before = await page.evaluate(() => scrollY);
    await page.reload({ waitUntil: "networkidle" });
    await ready(page);
    await settle(page);
    const restored = await displayState(page);
    report.reload = {
      before,
      after: await page.evaluate(() => scrollY),
      t: restored.t,
      anchors: await page.evaluate(() => window.__nanoCinema.anchors()),
      previousAnchors: anchors,
    };
    check(
      "Reload keeps the scroll position",
      Math.abs((await page.evaluate(() => scrollY)) - before) < 4,
    );
    check(
      "Reload restores the conversation frame",
      Math.abs(restored.t - 4) < 0.05,
    );
    await page.waitForTimeout(1500);
    check(
      "Reload measures the same anchors as a fresh visit",
      (await page.evaluate(() => window.__nanoCinema.anchors())).every(
        (value, at) => Math.abs(value - anchors[at]) < 1,
      ),
    );

    // 10. Resize mid-page: 2D below 1100 px, cinematic again above, same section.
    await page.setViewportSize({ width: 900, height: 900 });
    await page.waitForTimeout(700);
    const narrow = await page.evaluate(() => ({
      cinema: document.documentElement.dataset.cinema ?? null,
      canvas: Boolean(document.querySelector(".cinema-stage canvas")),
      section: [...document.querySelectorAll("main > section")].find(
        (s) => s.getBoundingClientRect().bottom > 120,
      )?.id,
      overflow: document.documentElement.scrollWidth > innerWidth,
    }));
    check("Narrowing the window returns to the 2D layout", narrow.cinema, null);
    check("Narrowing the window unmounts the canvas", narrow.canvas, false);
    check(
      "Narrowing keeps the reader in the product section",
      narrow.section,
      "produto",
    );
    check(
      "Narrowing shows the same capture in the gallery (Conversation)",
      await page.locator("#tab-conversation").getAttribute("aria-selected"),
      "true",
    );
    check("No horizontal overflow after narrowing", narrow.overflow, false);
    await page.setViewportSize({ width: 1440, height: 900 });
    await ready(page);
    check(
      "Widening again restores the cinematic layout",
      await page.evaluate(() => document.documentElement.dataset.cinema),
      "on",
    );
    check(
      "A deliberate teardown is not recorded as a failure",
      await page.evaluate(() =>
        localStorage.getItem("nano-cinema-unsupported-until"),
      ),
      null,
    );

    // 11. Context loss falls back to the regular site and keeps working.
    await page.evaluate(() =>
      document
        .querySelector(".cinema-stage canvas")
        .getContext("webgl2")
        .getExtension("WEBGL_lose_context")
        .loseContext(),
    );
    await page.waitForFunction(
      () => document.documentElement.dataset.cinema === "off",
    );
    check(
      "Context loss returns to the 2D site",
      await page.evaluate(() => document.documentElement.dataset.cinemaReason),
      "context-lost",
    );
    check(
      "Gallery is usable after context loss",
      await page.locator("#tab-thinking").isVisible(),
    );
    await context.close();
  }

  // 12. Other desktop sizes: composition captures and no overflow.
  for (const [width, height] of [
    [1920, 1080],
    [1728, 1117],
    [1366, 768],
  ]) {
    const { context, page } = await open({ width, height });
    await ready(page);
    await page.waitForFunction(
      () => window.__nanoCinema?.anchors().length === 14,
    );
    const anchors = await page.evaluate(() => window.__nanoCinema.anchors());
    for (const index of [2, 5, 8, 11]) {
      await jump(page, anchors[index]);
      if (index === 2)
        check(
          `${width} × ${height}: Home capture on the display`,
          (await displayState(page)).images.at(-1)?.src.includes("nano-home"),
        );
      await capture(
        page,
        `${width}-${String(index).padStart(2, "0")}-${BEATS[index]}`,
      );
    }
    check(
      `No horizontal overflow at ${width} × ${height} (cinema)`,
      await noOverflow(page),
    );
    await context.close();
  }

  // 13. Fallbacks: the regular site, no 3D code fetched.
  const lazyName = report.lazyChunk;
  const fetched3D = (chunks) =>
    chunks.some((chunk) => lazyName && chunk.url.endsWith(lazyName));
  const fallbacks = [
    ["reduced motion", { reducedMotion: "reduce", query: "" }],
    [
      "phone 390",
      {
        width: 390,
        height: 844,
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
        query: "",
      },
    ],
    [
      "phone 430",
      {
        width: 430,
        height: 932,
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
        query: "",
      },
    ],
    [
      "tablet 820",
      {
        width: 820,
        height: 1180,
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
        query: "",
      },
    ],
    ["?cinema=0", { query: "?cinema=0" }],
  ];
  for (const [label, options] of fallbacks) {
    const { context, page, chunks } = await open(options);
    await page.waitForTimeout(2500);
    const state = await page.evaluate(() => ({
      cinema: document.documentElement.dataset.cinema ?? null,
      canvas: Boolean(document.querySelector("canvas")),
      still:
        getComputedStyle(document.querySelector(".laptop-still")).display !==
        "none",
      showcase:
        getComputedStyle(document.querySelector(".showcase-track")).display !==
        "none",
      chapters: getComputedStyle(document.querySelector(".cinema-chapters"))
        .display,
    }));
    check(`${label}: regular layout`, state.cinema, null);
    check(`${label}: no canvas`, state.canvas, false);
    check(`${label}: 3D code never fetched`, fetched3D(chunks), false);
    check(`${label}: static laptop shown`, state.still, true);
    check(
      `${label}: gallery shown, chapters hidden`,
      [state.showcase, state.chapters],
      [true, "none"],
    );
    check(`${label}: no horizontal overflow`, await noOverflow(page));
    await page.locator(".laptop-still").scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await capture(
      page,
      `fallback-${label.replace(/[^a-z0-9]+/gi, "-").replace(/-$/, "")}`,
    );
    if (label === "phone 390") {
      const axe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      check(
        "Phone fallback passes automated WCAG A/AA",
        axe.violations.map((violation) => violation.id),
        [],
      );
    }
    await context.close();
  }

  // 14. No WebGL at all: back to 2D, remembered so the next visit starts in 2D.
  {
    const { context, page, chunks } = await open({
      query: "",
      init: () => {
        const original = HTMLCanvasElement.prototype.getContext;
        HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
          return /webgl/i.test(type)
            ? null
            : original.call(this, type, ...rest);
        };
      },
    });
    await page.waitForFunction(
      () => document.documentElement.dataset.cinema === "off",
      null,
      { timeout: 15000 },
    );
    check(
      "Without WebGL: reason recorded",
      await page.evaluate(() => document.documentElement.dataset.cinemaReason),
      "webgl2-unavailable",
    );
    check("Without WebGL: 3D code never fetched", fetched3D(chunks), false);
    check(
      "Without WebGL: gallery tabs work",
      await (async () => {
        await page.locator("#tab-conversation").click();
        return page.locator("#panel-conversation").isVisible();
      })(),
    );
    await page.reload({ waitUntil: "domcontentloaded" });
    check(
      "Without WebGL: next visit lays out in 2D from first paint",
      await page.evaluate(
        () => document.documentElement.dataset.cinema ?? null,
      ),
      null,
    );
    await context.close();
  }

  // 15. Software WebGL is treated as low-power (unless forced for QA).
  if (!gpu) {
    const { context, page, chunks } = await open({ query: "" });
    await page.waitForFunction(
      () => document.documentElement.dataset.cinema === "off",
      null,
      { timeout: 15000 },
    );
    check(
      "Software renderer: regular site",
      await page.evaluate(() => document.documentElement.dataset.cinemaReason),
      "software-renderer",
    );
    check("Software renderer: 3D code never fetched", fetched3D(chunks), false);
    await context.close();
  }

  // 16. No JavaScript: complete regular site with the static laptop.
  {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto(`${base}/`);
    const state = await page.evaluate(() => ({
      cinema: document.documentElement.dataset.cinema ?? null,
      still:
        getComputedStyle(document.querySelector(".laptop-still")).display !==
        "none",
      chapters: getComputedStyle(document.querySelector(".cinema-chapters"))
        .display,
      heading: getComputedStyle(document.querySelector("#produto h2")).opacity,
    }));
    check("No JavaScript: regular layout, static laptop, readable", state, {
      cinema: null,
      still: true,
      chapters: "none",
      heading: "1",
    });
    await context.close();
  }

  check(
    "No console errors, page errors or hydration warnings",
    report.errors,
    [],
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
  console.log(
    JSON.stringify(
      {
        checks: report.checks.length,
        failure: report.failure,
        errors: report.errors,
        lazyChunk: report.lazyChunk,
        screenshots: report.screenshots.length,
      },
      null,
      2,
    ),
  );
}
