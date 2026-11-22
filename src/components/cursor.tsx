"use client";

import { useEffect, useRef } from "react";

/**
 * A small dot and a trailing ring instead of the arrow, as on Simão's site.
 * Only with a mouse (fine pointer) and without reduced motion; the system
 * cursor stays everywhere else, and on text fields.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce || !dot.current || !ring.current) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    const target = { x: -100, y: -100 };
    const trail = { x: -100, y: -100 };
    let frame = 0;
    const loop = () => {
      trail.x += (target.x - trail.x) * 0.18;
      trail.y += (target.y - trail.y) * 0.18;
      if (dot.current)
        dot.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      if (ring.current)
        ring.current.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    const move = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
      root.dataset.cursor = "on";
    };
    const over = (event: PointerEvent) => {
      const element = event.target instanceof Element ? event.target : null;
      root.dataset.cursorLink = element?.closest(
        "a, button, summary, [role='tab']",
      )
        ? "true"
        : "false";
    };
    const leave = () => {
      root.dataset.cursor = "off";
    };
    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      root.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor-ring" />
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
