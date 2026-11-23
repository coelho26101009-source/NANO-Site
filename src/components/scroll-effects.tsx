"use client";

import { useEffect } from "react";

/**
 * Small touches borrowed from Simão's site, all progressive enhancement and
 * deliberately quiet:
 * - the hero title drifts down a little as the page leaves it;
 * - the word band keeps one direction and only quickens gently with the
 *   scroll, easing back to its pace (no jumps, no reversals);
 * - buttons lean a few pixels towards the mouse (fine pointer only).
 * Pictures are not clipped or zoomed by the scroll: their entrance is the
 * one fade in scroll-motion.tsx. Nothing runs with reduced motion.
 */
const MAGNETIC = ".button, .nav-download, .nav-language";
/** Base pace of the band, in px per ms, and the most a fast scroll adds. */
const PACE = 0.04;
const MAX_BOOST = 0.07;

export function ScrollEffects() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const title = document.querySelector<HTMLElement>(".hero h1");
    const hero = document.querySelector<HTMLElement>(".hero");
    const track = document.querySelector<HTMLElement>(".marquee-track");
    root.classList.add("has-scroll-effects");

    let frame = 0;
    let lastY = scrollY;
    let x = 0;
    let boost = 0;
    let target = 0;
    let last = performance.now();

    const layout = () => {
      if (title && hero) {
        const progress = Math.min(1, scrollY / Math.max(1, hero.offsetHeight));
        title.style.translate = `0 ${(progress * 8).toFixed(2)}%`;
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const y = scrollY;
      const velocity = Math.abs(y - lastY);
      lastY = y;
      if (velocity) layout();
      // Scroll speed sets a target; the band eases towards it and back.
      target = Math.min(MAX_BOOST, Math.max(target * 0.9, velocity / 900));
      boost += (target - boost) * Math.min(1, dt / 220);
      if (track && !document.hidden) {
        const half = track.scrollWidth / 2;
        x -= (PACE + boost) * dt;
        if (x <= -half) x += half;
        track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    if (track) track.classList.add("is-driven");

    const cleanups: (() => void)[] = [];
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      for (const element of document.querySelectorAll<HTMLElement>(MAGNETIC)) {
        element.classList.add("magnetic");
        const move = (event: PointerEvent) => {
          const r = element.getBoundingClientRect();
          const dx = (event.clientX - r.left - r.width / 2) * 0.12;
          const dy = (event.clientY - r.top - r.height / 2) * 0.18;
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
