import type { Copy } from "@/content/i18n";
import { Eyebrow } from "./ui";
import { Icon } from "./icons";

export function Modes({ t: { modes: t } }: { t: Copy }) {
  return (
    <section
      className="section container modes-section"
      id="modes"
      tabIndex={-1}
      aria-labelledby="modes-heading"
    >
      <div className="section-heading centered" data-cinema-beat="modes">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h2 id="modes-heading">
          {t.title[0]}
          <br />
          <span>{t.title[1]}</span>
        </h2>
        <p>
          {t.intro[0]}
          <br className="desktop-break" /> {t.intro[1]}
        </p>
      </div>
      <div className="modes-grid">
        {t.items.map((mode) => (
          <article
            className={`mode mode-${mode.id}`}
            key={mode.id}
            data-cinema-beat={mode.id}
          >
            <div className="mode-top">
              <span className="mode-number">{mode.number}</span>
              <span className="mode-indicator" aria-hidden="true" />
            </div>
            <h3>{mode.title}</h3>
            <p className="mode-subtitle">{mode.subtitle}</p>
            <p className="mode-description">{mode.description}</p>
            <div
              className="mode-path"
              aria-label={`${t.path}: ${mode.path.join(", ")}`}
            >
              {mode.path.map((step, index) => (
                <span key={step}>
                  {index > 0 && <Icon name="arrow" />}
                  {step}
                </span>
              ))}
            </div>
            <p className="mode-footnote">{mode.footnote}</p>
            <span className="mode-tag">{mode.tag}</span>
          </article>
        ))}
      </div>
      <aside className="mode-caveat">
        <Icon name="shield" />
        <p>
          <strong>{t.caveatStrong}</strong> {t.caveat}
        </p>
        <a href="#privacy" aria-label={t.caveatLink}>
          <Icon name="arrow" />
        </a>
      </aside>
    </section>
  );
}
