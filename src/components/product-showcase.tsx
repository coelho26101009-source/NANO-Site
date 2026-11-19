"use client";

import { useEffect, useRef, useState } from "react";
import type { Copy } from "@/content/i18n";
import { Icon } from "./icons";
import { ProductImage, showcaseSizes } from "./product-image";

export function ProductShowcase({
  t,
  experiences,
}: {
  t: Copy["showcase"];
  experiences: Copy["experiences"];
}) {
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const element = track.current;
    const onStep = (event: Event) => {
      if (element?.dataset.manual === "true") return;
      setManual(false);
      setActive((event as CustomEvent<number>).detail);
    };
    element?.addEventListener("nano:showcase-step", onStep);
    return () => element?.removeEventListener("nano:showcase-step", onStep);
  }, []);
  const takeControl = () => {
    if (track.current) track.current.dataset.manual = "true";
    setManual(true);
  };
  const current = experiences[active];
  return (
    <div className="showcase-track" ref={track} onFocusCapture={takeControl}>
      <div className="showcase showcase-sticky">
        <div className="showcase-tabs" role="tablist" aria-label={t.tabs}>
          {experiences.map((item, index) => (
            <button
              type="button"
              key={item.id}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={active === index}
              aria-controls={`panel-${item.id}`}
              tabIndex={active === index ? 0 : -1}
              onClick={() => {
                takeControl();
                setActive(index);
              }}
              onKeyDown={(event) => {
                let next = index;
                if (event.key === "ArrowRight")
                  next = (index + 1) % experiences.length;
                else if (event.key === "ArrowLeft")
                  next = (index - 1 + experiences.length) % experiences.length;
                else if (event.key === "Home") next = 0;
                else if (event.key === "End") next = experiences.length - 1;
                else return;
                event.preventDefault();
                takeControl();
                setActive(next);
                tabs.current[next]?.focus();
              }}
            >
              <span>{item.number}</span>
              {item.label}
            </button>
          ))}
        </div>
        <div className="showcase-visual">
          {experiences.map((item, index) => (
            <div
              key={item.id}
              id={`panel-${item.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${item.id}`}
              tabIndex={0}
              hidden={active !== index}
            >
              <div
                className={`screenshot-frame ${item.id === "voice" ? "voice-frame" : ""}`}
              >
                {item.id === "voice" && (
                  <div className="voice-intro">
                    <span className="eyebrow">{t.voiceEyebrow}</span>
                    <p>{t.voiceLead}</p>
                    <div
                      className="keyboard-shortcut"
                      aria-label={t.shortcutLabel}
                    >
                      <kbd>Ctrl</kbd>
                      <span>+</span>
                      <kbd>Shift</kbd>
                      <span>+</span>
                      <kbd>Space</kbd>
                    </div>
                  </div>
                )}
                <ProductImage
                  src={item.image}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  sizes={
                    item.id === "voice"
                      ? "(max-width: 700px) calc(100vw - 68px), 380px"
                      : showcaseSizes
                  }
                />
                {item.id === "voice" && (
                  <p className="voice-note">
                    {t.voiceNote[0]}
                    <br />
                    {t.voiceNote[1]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="showcase-caption" aria-live={manual ? "polite" : "off"}>
          <div>
            <span className="small-label">{current.name}</span>
            <h3>{current.title}</h3>
          </div>
          <div className="showcase-description">
            <p>{current.description}</p>
            <a href={current.image}>
              {t.openCapture} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <span className="slide-number" aria-hidden="true">
            0{active + 1}
            <span> / 04</span>
          </span>
        </div>
        <p className="asset-note">
          <Icon name="windows" />
          {t.assetNote}
        </p>
        <noscript>
          <style>{`.showcase-track::after { height: 0 !important; } .showcase-sticky { position: static !important; }`}</style>
          <p className="asset-note">
            {t.noscript}{" "}
            <a href="https://github.com/coelho26101009-source/Nano_Assistant#como-é">
              {t.noscriptLink}
            </a>
            .
          </p>
        </noscript>
      </div>
    </div>
  );
}
