"use client";

import Image from "next/image";
import { useRef } from "react";

export function HeroSymbol() {
  const surface = useRef<HTMLDivElement>(null);
  return (
    <div
      className="hero-art"
      aria-hidden="true"
      ref={surface}
      onPointerMove={(event) => {
        if (
          event.pointerType !== "mouse" ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const rect = event.currentTarget.getBoundingClientRect();
        surface.current?.style.setProperty(
          "--rx",
          `${((event.clientY - rect.top) / rect.height - 0.5) * -7}deg`,
        );
        surface.current?.style.setProperty(
          "--ry",
          `${((event.clientX - rect.left) / rect.width - 0.5) * 9}deg`,
        );
      }}
      onPointerLeave={() => {
        surface.current?.style.setProperty("--rx", "0deg");
        surface.current?.style.setProperty("--ry", "0deg");
      }}
    >
      <div className="hero-orbit orbit-one" />
      <div className="hero-orbit orbit-two" />
      <div className="symbol-stage">
        <Image
          src="/brand/nano-symbol.png"
          alt=""
          width={360}
          height={290}
          preload
          sizes="(max-width: 600px) 250px, (max-width: 1000px) 320px, 400px"
          className="hero-symbol"
        />
      </div>
      <span className="art-caption">Inteligência. Com presença.</span>
    </div>
  );
}
