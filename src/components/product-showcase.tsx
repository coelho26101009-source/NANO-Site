"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { experiences } from "@/content/site";
import { Icon } from "./icons";

export function ProductShowcase() {
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
        <div
          className="showcase-tabs"
          role="tablist"
          aria-label="Explorar a aplicação"
        >
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
                    <span className="eyebrow">Uma presença discreta</span>
                    <p>A conversa acompanha-te.</p>
                    <div
                      className="keyboard-shortcut"
                      aria-label="Control mais Shift mais Espaço"
                    >
                      <kbd>Ctrl</kbd>
                      <span>+</span>
                      <kbd>Shift</kbd>
                      <span>+</span>
                      <kbd>Space</kbd>
                    </div>
                  </div>
                )}
                <Image
                  src={item.image}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  sizes={
                    item.id === "voice"
                      ? "(max-width: 800px) 90vw, 760px"
                      : "(max-width: 800px) 94vw, 1200px"
                  }
                />
                {item.id === "voice" && (
                  <p className="voice-note">
                    Estado de escuta simulado na captura oficial.
                    <br />A voz é opcional e requer configuração adicional.
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
              Abrir captura completa <span aria-hidden="true">↗</span>
            </a>
          </div>
          <span className="slide-number" aria-hidden="true">
            0{active + 1}
            <span> / 04</span>
          </span>
        </div>
        <p className="asset-note">
          <Icon name="windows" />
          Capturas oficiais num perfil de demonstração. Algumas mostram a versão
          interna anterior.
        </p>
        <noscript>
          <style>{`.showcase-track::after { height: 0 !important; } .showcase-sticky { position: static !important; }`}</style>
          <p className="asset-note">
            As restantes capturas estão disponíveis no{" "}
            <a href="https://github.com/coelho26101009-source/Nano_Assistant#como-é">
              repositório oficial
            </a>
            .
          </p>
        </noscript>
      </div>
    </div>
  );
}
