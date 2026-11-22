"use client";

import { useEffect, useRef } from "react";

/**
 * The island recording: plays only while it is on screen, never on its own
 * with reduced motion (the poster stays, with controls to play it).
 */
export function IslandVideo({ base, label }: { base: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.controls = true;
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className="island-video"
      width={1520}
      height={600}
      muted
      loop
      playsInline
      preload="metadata"
      poster={`${base}.jpg`}
      aria-label={label}
    >
      <source src={`${base}.webm`} type="video/webm" />
      <source src={`${base}.mp4`} type="video/mp4" />
    </video>
  );
}
