import type { Copy } from "@/content/i18n";
import { Eyebrow } from "./ui";
import { Icon } from "./icons";

/** Native <details> disclosures: keyboard and screen-reader friendly, no JavaScript. */
export function Faq({ t: { faq: t } }: { t: Copy }) {
  return (
    <section
      id="faq"
      tabIndex={-1}
      className="section container faq-section"
      aria-labelledby="faq-heading"
    >
      <div className="faq-intro">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h2 id="faq-heading">{t.title}</h2>
      </div>
      <div className="faq-list">
        {t.items.map((item) => (
          <details className="faq-item" key={item.q}>
            <summary>
              <h3>{item.q}</h3>
              <Icon name="chevron" />
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
