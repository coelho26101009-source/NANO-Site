import { site } from "@/content/site";
import type { Copy } from "@/content/i18n";
import { DownloadLink, Eyebrow } from "./ui";
import { Icon } from "./icons";
import { HeroSymbol } from "./hero-symbol";

export function Hero({ t: { hero: t } }: { t: Copy }) {
  return (
    <section className="hero container" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <a className="release-badge" href={site.release}>
          <span className="status-dot" />
          {t.badge}
          <span className="badge-divider" />
          {site.version}
          <Icon name="arrow" />
        </a>
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 id="hero-heading">
          {t.title[0]}
          <br />
          <span>{t.title[1]}</span>
        </h1>
        <p className="hero-description">
          {t.tagline[0]}
          <br />
          {t.tagline[1]}
        </p>
        <div className="hero-actions">
          <DownloadLink href="#download">{t.download}</DownloadLink>
          <a className="button button-secondary" href={site.repository}>
            <Icon name="github" />
            {t.github}
          </a>
        </div>
        <p className="hero-meta">
          {t.meta[0]}
          <span>·</span>
          {t.meta[1]}
        </p>
      </div>
      <HeroSymbol caption={t.artCaption} />
      <div className="hero-bottom">
        <a href="#product">
          {t.discover}
          <Icon name="arrow" />
        </a>
        <span>{t.motto}</span>
        <span className="hero-index" aria-hidden="true">
          01 — 09
        </span>
      </div>
    </section>
  );
}
