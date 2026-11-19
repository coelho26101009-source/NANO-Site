import type { Copy } from "@/content/i18n";
import { Eyebrow } from "./ui";

export function Capabilities({ t: { capabilities: t } }: { t: Copy }) {
  return (
    <section
      className="section container capabilities"
      aria-labelledby="capabilities-heading"
      data-cinema-beat="end"
    >
      <div className="capabilities-intro">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h2 id="capabilities-heading">
          {t.title[0]}
          <br />
          {t.title[1]}
        </h2>
        <p>{t.intro}</p>
        <span className="availability">
          <span className="status-dot" />
          {t.availability}
          <span>*</span>
        </span>
      </div>
      <div className="capability-list">
        {t.items.map((item) => (
          <article key={item.number} className="capability">
            <span className="capability-number">{item.number}</span>
            <div>
              <span className="small-label">{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
        <p className="section-note">{t.note}</p>
      </div>
    </section>
  );
}
