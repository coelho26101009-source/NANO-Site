"use client";

import { useEffect, useRef, useState } from "react";
import { navigation, site } from "@/content/site";
import { Brand } from "./ui";
import { Icon } from "./icons";

export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const disclosure = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const desktop = window.matchMedia("(min-width: 1001px)");
    const closeOnResize = () => {
      if (desktop.matches && disclosure.current)
        disclosure.current.open = false;
    };
    desktop.addEventListener("change", closeOnResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      desktop.removeEventListener("change", closeOnResize);
    };
  }, []);
  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="nav-shell">
        <a href="#top" className="brand-link" aria-label="NANO — início">
          <Brand />
        </a>
        <nav className="desktop-nav" aria-label="Navegação principal">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <a className="nav-github" href={site.repository}>
            GitHub
            <Icon name="arrow" />
          </a>
          <a className="nav-download" href="#download">
            Download
            <Icon name="download" />
          </a>
        </div>
        <details
          className="mobile-menu"
          ref={disclosure}
          onKeyDown={(event) => {
            if (event.key === "Escape" && disclosure.current?.open) {
              disclosure.current.open = false;
              disclosure.current.querySelector("summary")?.focus();
            }
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              event.currentTarget.open = false;
          }}
        >
          <summary aria-label="Menu de navegação">
            <Icon className="menu-open-icon" name="menu" />
            <Icon className="menu-close-icon" name="close" />
          </summary>
          <nav aria-label="Navegação móvel">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (disclosure.current) disclosure.current.open = false;
                  document
                    .querySelector<HTMLElement>(item.href)
                    ?.focus({ preventScroll: true });
                }}
              >
                {item.label}
                <Icon name="arrow" />
              </a>
            ))}
            <a href={site.repository}>
              Ver no GitHub
              <Icon name="github" />
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
