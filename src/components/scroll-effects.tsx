"use client";

import { useEffect } from "react";

/**
 * The extra motion borrowed from Simão's site, all progressive enhancement:
 * - screenshots open from a smaller rounded frame while they scroll in,
 *   and the picture settles from a light zoom to its full size;
 * - the hero title drifts down slowly as the page leaves it;
 * - the word band speeds up with the scroll, and turns with its direction;
 * - buttons lean towards the mouse (fine pointer only).
 * Nothing runs with reduced motion: the page stays as the server drew it.
 */
const FRAMES =
  ".brain-image, .island-screen, .whats-new-figures .screenshot-frame, .phone-frame";
const MAGNETIC = ".button, .nav-download, .nav-language";

export function ScrollEffects() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const frames = Array.from(document.querySelectorAll<HTMLElement>(FRAMES));
    const title = document.querySelector<HTMLElement>(".hero h1");
    const hero = document.querySelector<HTMLElement>(".hero");
    const track = document.querySelector<HTMLElement>(".marquee-track");
    frames.forEach((frame) => frame.classList.add("frame-open"));
    root.classList.add("has-scroll-effects");

    let frame = 0;
    let lastY = scrollY;
    let x = 0;
    let boost = 0;
    let direction = -1;
    let last = performance.now();

    const layout = () => {
      const vh = innerHeight;
      for (const element of frames) {
        const top = element.getBoundingClientRect().top;
        const open = Math.max(0, Math.min(1, (vh * 0.95 - top) / (vh * 0.4)));
        element.style.setProperty("--open", open.toFixed(3));
      }
      if (title && hero) {
        const progress = Math.min(1, scrollY / Math.max(1, hero.offsetHeight));
        title.style.translate = `0 ${(progress * 18).toFixed(2)}%`;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const y = scrollY;
      const velocity = y - lastY;
      lastY = y;
      if (velocity) {
        direction = velocity > 0 ? -1 : 1;
        boost = Math.min(0.6, boost + Math.abs(velocity) / 400);
        layout();
      }
      if (track && !document.hidden) {
        const half = track.scrollWidth / 2;
        x += direction * (0.045 + boost) * dt;
        if (x <= -half) x += half;
        if (x > 0) x -= half;
        track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
      }
      boost *= 0.92;
      frame = requestAnimationFrame(tick);
    };
    if (track) track.classList.add("is-driven");

    const cleanups: (() => void)[] = [];
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      for (const element of document.querySelectorAll<HTMLElement>(MAGNETIC)) {
        element.classList.add("magnetic");
        const move = (event: PointerEvent) => {
          const r = element.getBoundingClientRect();
          const dx = (event.clientX - r.left - r.width / 2) * 0.25;
          const dy = (event.clientY - r.top - r.height / 2) * 0.35;
          element.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
        };
        const leave = () => {
          element.style.translate = "";
        };
        element.addEventListener("pointermove", move);
        element.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          element.removeEventListener("pointermove", move);
          element.removeEventListener("pointerleave", leave);
          element.style.translate = "";
          element.classList.remove("magnetic");
        });
      }
    }

    layout();
    addEventListener("resize", layout);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", layout);
      cleanups.forEach((cleanup) => cleanup());
      frames.forEach((element) => {
        element.classList.remove("frame-open");
        element.style.removeProperty("--open");
      });
      if (title) title.style.translate = "";
      if (track) {
        track.classList.remove("is-driven");
        track.style.transform = "";
      }
      root.classList.remove("has-scroll-effects");
    };
  }, []);

  return null;
}
