"use client";

import { useEffect } from "react";

// Select whole editorial groups, not every line or icon. Server HTML stays intact.
const reveals = [
  {
    selector:
      ".split-heading > div:first-child, .brain-heading > div:first-child, .centered, .capabilities-intro",
    kind: "rise",
  },
  {
    selector: ".split-heading > p, .brain-heading > div:last-child",
    kind: "rise",
    delay: 90,
  },
  { selector: ".laptop-still", kind: "depth" },
  { selector: ".showcase-tabs", kind: "calm" },
  { selector: ".showcase-visual", kind: "depth", delay: 100 },
  {
    selector: ".cinema-chapter > :not(.visually-hidden)",
    kind: "rise",
    stagger: 45,
  },
  { selector: ".brain-figure", kind: "depth", delay: 80 },
  { selector: ".brain-details > div", kind: "rise", stagger: 80 },
  { selector: ".mode", kind: "rise", stagger: 80 },
  { selector: ".capability", kind: "rise", stagger: 80 },
  { selector: ".privacy-grid article", kind: "calm", stagger: 100 },
  { selector: ".trust-strip, .privacy-disclosure", kind: "calm" },
  {
    selector:
      ".story-aside, .story-copy > h2, .story-copy > p, .story-copy > .text-link",
    kind: "rise",
    stagger: 45,
  },
  {
    selector:
      ".github-panel, .roadmap-row, .roadmap-note, .roadmap > .text-link, .development-links",
    kind: "calm",
    stagger: 65,
  },
  { selector: ".download-main > *", kind: "rise", stagger: 45 },
  { selector: ".download-notice", kind: "calm", delay: 100 },
] as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const interactive = "a, button, input, select, textarea, summary, [tabindex]";

/** Progressive enhancement: no page-wide client boundary and no animation dependency. */
export function ScrollMotion() {
  useEffect(() => {
    if (!("IntersectionObserver" in window) || !("ResizeObserver" in window)) {
      document.documentElement.dataset.motion = "static";
      return;
    }
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia(
      "(min-width: 1100px) and (min-height: 760px)",
    );
    const elements: HTMLElement[] = [];
    const scenes = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".hero, .showcase-track, .brain-figure, .modes-grid, .story-copy, .download-main",
      ),
    );
    const activeScenes = new Set<HTMLElement>();
    const header = document.querySelector<HTMLElement>(".site-header");
    let frame = 0;
    let revealObserver: IntersectionObserver | undefined;
    let sceneObserver: IntersectionObserver | undefined;
    let lastStep = -1;
    let lastMode = -1;

    const settle = (element: HTMLElement) => {
      element.dataset.revealed = "true";
      element.dataset.revealState = "visible";
      revealObserver?.unobserve(element);
    };
    const settleWithin = (scope: Element) => {
      for (const element of elements)
        if (scope.contains(element) || element.contains(scope)) settle(element);
    };
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Element) settleWithin(event.target);
    };
    const settleHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      let target: HTMLElement | null = null;
      try {
        target = document.getElementById(decodeURIComponent(id));
      } catch {
        return;
      }
      if (target) settleWithin(target);
    };

    // Only one scheduled frame. No work continues after scrolling stops.
    const update = () => {
      frame = 0;
      if (document.hidden) return;
      const y = window.scrollY;
      const height = window.innerHeight;
      const range = root.scrollHeight - height;
      const moving = !reduced.matches;
      const spatial = moving && desktop.matches;
      // Batch layout reads before style writes to avoid forced read/write cycles.
      const measurements = spatial
        ? [...activeScenes].map((element) => ({
            element,
            rect: element.getBoundingClientRect(),
            runway: element.classList.contains("showcase-track")
              ? parseFloat(getComputedStyle(element, "::after").height)
              : 0,
          }))
        : [];

      header?.classList.toggle("is-scrolled", y > 24);
      // Scoped to the header, its only reader: on <html> this inherited
      // property restyled the whole document on every scroll frame.
      if (moving)
        header?.style.setProperty(
          "--page-progress",
          String(range > 0 ? clamp(y / range) : 0),
        );
      // The 3D stage owns the Brain and modes beats while it is active.
      const cinema = root.dataset.cinema === "on";
      for (const { element, rect, runway } of measurements) {
        if (
          cinema &&
          (element.classList.contains("modes-grid") ||
            element.classList.contains("brain-figure"))
        ) {
          lastMode = -1;
          continue;
        }
        if (element.classList.contains("hero")) {
          const progress = clamp(-rect.top / (rect.height * 0.85));
          element.style.setProperty("--hero-copy-y", `${progress * -18}px`);
          element.style.setProperty("--hero-symbol-y", `${progress * 30}px`);
          element.style.setProperty(
            "--hero-scale",
            String(1 - progress * 0.035),
          );
          element.style.setProperty(
            "--hero-light",
            String(1 - progress * 0.55),
          );
        } else if (element.classList.contains("showcase-track")) {
          if (
            (rect.bottom <= 112 || rect.top >= height) &&
            !element.contains(document.activeElement)
          ) {
            delete element.dataset.manual;
            lastStep = -1;
            continue;
          }
          // Four readable beats across less than one extra viewport; never wheel/touch capture.
          const progress = clamp((112 - rect.top) / Math.max(1, runway));
          const step = Math.min(3, Math.floor(progress * 4));
          element.style.setProperty(
            "--showcase-depth",
            `${(1 - clamp((height - rect.top) / height)) * 8}px`,
          );
          if (
            element.dataset.manual !== "true" &&
            !element.contains(document.activeElement) &&
            step !== lastStep
          ) {
            lastStep = step;
            element.dispatchEvent(
              new CustomEvent("nano:showcase-step", { detail: step }),
            );
          }
        } else if (element.classList.contains("brain-figure")) {
          const progress = clamp((height * 0.9 - rect.top) / (height * 0.72));
          element.style.setProperty(
            "--brain-tilt",
            `${(1 - progress) * 3.5}deg`,
          );
          element.style.setProperty("--brain-y", `${(1 - progress) * 12}px`);
          element.style.setProperty("--brain-light", String(progress * 0.7));
        } else if (element.classList.contains("modes-grid")) {
          const progress = clamp((height * 0.78 - rect.top) / (height * 0.72));
          const active = Math.min(2, Math.floor(progress * 3));
          if (active !== lastMode) {
            lastMode = active;
            element
              .querySelectorAll<HTMLElement>(".mode")
              .forEach((mode, index) => {
                mode.dataset.modeActive = String(index === active);
              });
          }
        } else if (element.classList.contains("story-copy")) {
          element.style.setProperty(
            "--story-progress",
            String(
              clamp(
                (height * 0.8 - rect.top) / Math.max(1, rect.height * 0.85),
              ),
            ),
          );
        } else if (element.classList.contains("download-main")) {
          element.style.setProperty(
            "--download-light",
            String(clamp((height * 0.8 - rect.top) / (height * 0.55)) * 0.7),
          );
        }
      }
    };
    const schedule = () => {
      if (!frame && !document.hidden)
        frame = window.requestAnimationFrame(update);
    };
    const configure = () => {
      revealObserver?.disconnect();
      sceneObserver?.disconnect();
      activeScenes.clear();
      root.dataset.motion = reduced.matches ? "reduced" : "ready";
      if (reduced.matches) {
        elements.forEach(settle);
        schedule();
        return;
      }
      revealObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting) settle(entry.target as HTMLElement);
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0 },
      );
      elements.forEach((element) => {
        // Mid-page reloads, fast jumps and visible content never wait behind an observer.
        if (
          element.dataset.revealed ||
          element.getBoundingClientRect().top < window.innerHeight * 0.9
        )
          settle(element);
        else {
          element.dataset.revealState = "pending";
          revealObserver?.observe(element);
        }
      });
      if (desktop.matches) {
        sceneObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const element = entry.target as HTMLElement;
              if (entry.isIntersecting) activeScenes.add(element);
              else {
                activeScenes.delete(element);
                if (
                  element.classList.contains("showcase-track") &&
                  !element.contains(document.activeElement)
                ) {
                  delete element.dataset.manual;
                  lastStep = -1;
                }
              }
            }
            schedule();
          },
          { rootMargin: "100px 0px 100px 0px" },
        );
        scenes.forEach((element) => sceneObserver?.observe(element));
      }
      settleHash();
      schedule();
    };

    for (const rule of reveals) {
      document
        .querySelectorAll<HTMLElement>(rule.selector)
        .forEach((element, index) => {
          element.dataset.reveal = rule.kind;
          element.style.setProperty(
            "--reveal-delay",
            `${"stagger" in rule ? Math.min(index * rule.stagger, 180) : "delay" in rule ? rule.delay : 0}ms`,
          );
          if (
            element.matches(interactive) ||
            element.querySelector(interactive)
          )
            element.dataset.revealInteractive = "true";
          elements.push(element);
        });
    }
    configure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("pageshow", configure);
    window.addEventListener("hashchange", settleHash);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("visibilitychange", schedule);
    reduced.addEventListener("change", configure);
    desktop.addEventListener("change", configure);
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(document.body);

    return () => {
      window.cancelAnimationFrame(frame);
      revealObserver?.disconnect();
      sceneObserver?.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pageshow", configure);
      window.removeEventListener("hashchange", settleHash);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("visibilitychange", schedule);
      reduced.removeEventListener("change", configure);
      desktop.removeEventListener("change", configure);
      delete root.dataset.motion;
      elements.forEach((element) => {
        delete element.dataset.revealState;
      });
    };
  }, []);
  return null;
}
