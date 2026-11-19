import { site } from "@/content/site";
import type { Copy } from "@/content/i18n";
import { Eyebrow, TextLink } from "./ui";
import { Icon } from "./icons";

export function Development({ t: { development: t } }: { t: Copy }) {
  return (
    <section
      className="section container development"
      aria-labelledby="development-heading"
    >
      <div className="section-heading split-heading">
        <div>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 id="development-heading">{t.title}</h2>
        </div>
        <p>{t.intro}</p>
      </div>
      <div className="development-grid">
        <a className="github-panel" href={site.repository}>
          <Icon name="github" width={34} height={34} />
          <span className="small-label">{t.repoLabel}</span>
          <h3>{t.repoTitle}</h3>
          <p>{t.repoText}</p>
          <span className="text-link">
            {t.viewGithub}
            <Icon name="arrow" />
          </span>
          <span className="repo-label">
            Nano_Assistant<span>↗</span>
          </span>
        </a>
        <div className="roadmap">
          {t.roadmap.map((row) => (
            <div className="roadmap-row" key={row.status}>
              <span
                className={`roadmap-status${row.current ? " current" : ""}`}
              >
                {row.status}
              </span>
              <div>
                <h3>{row.title}</h3>
                <p>{row.text}</p>
              </div>
            </div>
          ))}
          <p className="roadmap-note">{t.roadmapNote}</p>
          <TextLink href={site.links.checklist}>{t.openItems}</TextLink>
        </div>
      </div>
      <div className="development-links">
        <TextLink href={site.links.changelog}>{t.changelog}</TextLink>
        <TextLink href={site.links.docs}>{t.docs}</TextLink>
        <TextLink href={site.links.support}>{t.support}</TextLink>
        <span>
          {t.betaLabel} · {site.version}
        </span>
      </div>
    </section>
  );
}
