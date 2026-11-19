import { site } from "@/content/site";
import type { Copy } from "@/content/i18n";
import { Brand } from "./ui";

export function Footer({ t: { footer: t, language } }: { t: Copy }) {
  return (
    <footer className="footer container">
      <div className="footer-main">
        <a className="brand-link" href="#top" aria-label={t.back}>
          <Brand />
        </a>
        <nav aria-label={t.label}>
          <a href={site.repository}>GitHub</a>
          <a href="#download">Download</a>
          <a href={site.links.changelog}>Changelog</a>
          <a href={site.links.privacy}>{t.privacy}</a>
          <a href={site.links.security}>{t.security}</a>
          <a href={site.links.support}>{t.support}</a>
          <a
            href={language.href}
            hrefLang={language.hrefLang}
            lang={language.hrefLang}
          >
            {language.name}
          </a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>{t.tagline}</span>
        <span>
          {site.version}
          <span className="footer-beta">Beta</span>
        </span>
      </div>
    </footer>
  );
}
