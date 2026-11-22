import { site } from "@/content/site";
import type { Copy } from "@/content/i18n";
import { Eyebrow, TextLink, Lines } from "./ui";
import { Icon } from "./icons";

export function Privacy({ t: { privacy: t } }: { t: Copy }) {
  return (
    <section
      id="privacy"
      tabIndex={-1}
      className="privacy-section section"
      aria-labelledby="privacy-heading"
    >
      <div className="container">
        <div className="section-heading split-heading">
          <div>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 id="privacy-heading">
              <Lines lines={t.title} />
            </h2>
          </div>
          <p>{t.intro}</p>
        </div>
        <div className="privacy-grid">
          {t.points.map((item) => (
            <article key={item.number}>
              <span className="privacy-number">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
        <div className="trust-strip">
          <Icon name="shield" />
          <p>{t.trust}</p>
          <div>
            <TextLink href={site.links.privacy}>{t.privacyLink}</TextLink>
            <TextLink href={site.links.security}>{t.securityLink}</TextLink>
          </div>
        </div>
        <details className="privacy-disclosure">
          <summary>
            {t.disclosure}
            <Icon name="chevron" />
          </summary>
          <div>
            {t.disclosureText.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
}
