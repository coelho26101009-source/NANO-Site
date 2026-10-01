"use client";

import Image from "next/image";
import { useRef } from "react";
import imageAssets from "@/content/images.json";

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
          src={imageAssets["/brand/nano-symbol.png"].variants[0].src}
          alt=""
          width={360}
          height={289}
          unoptimized
          preload
          className="hero-symbol"
        />
      </div>
      <span className="art-caption">Inteligência. Com presença.</span>
    </div>
  );
}
