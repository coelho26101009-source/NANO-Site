"use client";

import { useEffect, useRef } from "react";
import { site } from "@/content/site";
import type { Copy } from "@/content/i18n";
import { Brand } from "./ui";
import { Icon } from "./icons";

export function Navigation({
  t,
  language,
}: {
  t: Copy["nav"];
  language: Copy["language"];
}) {
  const disclosure = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1001px)");
    const closeOnResize = () => {
      if (desktop.matches && disclosure.current)
        disclosure.current.open = false;
    };
    desktop.addEventListener("change", closeOnResize);
    return () => {
      desktop.removeEventListener("change", closeOnResize);
    };
  }, []);
  return (
    <header className="site-header">
      <div className="nav-shell">
        <a href="#top" className="brand-link" aria-label={t.home}>
          <Brand />
        </a>
        <nav className="desktop-nav" aria-label={t.main}>
          {t.items.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <a
            className="nav-language"
            href={language.href}
            hrefLang={language.hrefLang}
            lang={language.hrefLang}
            aria-label={language.aria}
            title={language.name}
          >
            {language.label}
          </a>
          <a className="nav-github" href={site.repository}>
            GitHub
            <Icon name="arrow" />
          </a>
          <a className="nav-download" href="#download">
            {t.download}
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
          <summary aria-label={t.menu}>
            <Icon className="menu-open-icon" name="menu" />
            <Icon className="menu-close-icon" name="close" />
          </summary>
          <nav aria-label={t.mobile}>
            {t.items.map((item) => (
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
              {t.viewGithub}
              <Icon name="github" />
            </a>
            <a
              href={language.href}
              hrefLang={language.hrefLang}
              lang={language.hrefLang}
            >
              {language.name}
              <Icon name="arrow" />
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}
