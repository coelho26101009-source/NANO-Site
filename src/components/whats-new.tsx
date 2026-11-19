import { site } from "@/content/site";
import type { Copy } from "@/content/i18n";
import { Eyebrow, TextLink } from "./ui";
import { ProductImage } from "./product-image";

const figureSizes =
  "(max-width: 700px) calc(100vw - 40px), (max-width: 1000px) calc(100vw - 80px), 580px";

/** What changed in this release: six highlights and two real captures. */
export function WhatsNew({ t: { whatsNew: t } }: { t: Copy }) {
  return (
    <section
      id="new"
      tabIndex={-1}
      className="section container whats-new"
      aria-labelledby="new-heading"
    >
      <div className="section-heading split-heading">
        <div>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 id="new-heading">
            {t.title[0]}
            <br />
            {t.title[1]}
          </h2>
        </div>
        <p>{t.intro}</p>
      </div>
      <div className="whats-new-grid">
        {t.items.map((item) => (
          <article key={item.label}>
            <span className="small-label">{item.label}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
      <div className="whats-new-figures">
        <figure>
          <a
            className="screenshot-frame"
            href="/screenshots/nano-voice-mode.png"
          >
            <ProductImage
              src="/screenshots/nano-voice-mode.png"
              alt={t.voiceAlt}
              width={1920}
              height={1032}
              sizes={figureSizes}
            />
          </a>
          <figcaption>{t.voiceCaption}</figcaption>
        </figure>
        <figure>
          <a className="screenshot-frame" href="/screenshots/nano-agenda.png">
            <ProductImage
              src="/screenshots/nano-agenda.png"
              alt={t.agendaAlt}
              width={1920}
              height={1032}
              sizes={figureSizes}
            />
          </a>
          <figcaption>{t.agendaCaption}</figcaption>
        </figure>
      </div>
      <div className="development-links">
        <TextLink href={site.links.releaseNotes}>{t.notes}</TextLink>
        <TextLink href={site.links.changelog}>{t.changelog}</TextLink>
      </div>
    </section>
  );
}
