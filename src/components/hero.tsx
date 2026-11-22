import { site } from "@/content/site";
import type { Copy } from "@/content/i18n";
import { DownloadLink, Eyebrow, Lines } from "./ui";
import { Icon } from "./icons";
import { HeroSymbol } from "./hero-symbol";

export function Hero({ t: { hero: t } }: { t: Copy }) {
  return (
    <section className="hero container" aria-labelledby="hero-heading">
      <div className="hero-topline">
        <span>{t.year}</span>
        <span className="hero-based">{t.based}</span>
        <a className="release-badge" href={site.release}>
          <span className="status-dot" />
          {t.badge}
          <span className="badge-divider" />
          {site.version}
          <Icon name="arrow" />
        </a>
      </div>
      <div className="hero-copy">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 id="hero-heading">
          <Lines lines={t.title} />
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
          01 — 12
        </span>
      </div>
    </section>
  );
}
