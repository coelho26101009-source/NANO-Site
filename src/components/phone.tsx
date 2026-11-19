import { site } from "@/content/site";
import type { Copy } from "@/content/i18n";
import { Eyebrow, TextLink } from "./ui";
import { Icon } from "./icons";
import { ProductImage } from "./product-image";

const phoneSizes = "(max-width: 700px) 42vw, 260px";

/** NANO for Android: what it is, how private it is, and the APK. */
export function Phone({ t: { phone: t } }: { t: Copy }) {
  return (
    <section
      id="phone"
      tabIndex={-1}
      className="section container phone-section"
      aria-labelledby="phone-heading"
    >
      <div className="phone-copy">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h2 id="phone-heading">
          {t.title[0]}
          <br />
          {t.title[1]}
        </h2>
        <p className="phone-intro">{t.intro}</p>
        <ul className="phone-points">
          {t.points.map((point) => (
            <li key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.text}</p>
            </li>
          ))}
        </ul>
        <a className="button button-secondary" href={site.apkUrl}>
          <Icon name="download" />
          {t.button}
        </a>
        <div className="download-meta">
          <span>NANO {site.version}</span>
          {t.meta.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <p className="section-note">{t.note}</p>
        <TextLink href={site.links.phoneGuide}>{t.guide}</TextLink>
      </div>
      <figure className="phone-figures">
        <div className="phone-shots">
          <a className="phone-frame" href="/screenshots/nano-phone-chat.png">
            <ProductImage
              src="/screenshots/nano-phone-chat.png"
              alt={t.chatAlt}
              width={1082}
              height={2402}
              sizes={phoneSizes}
            />
          </a>
          <a className="phone-frame" href="/screenshots/nano-phone-agenda.png">
            <ProductImage
              src="/screenshots/nano-phone-agenda.png"
              alt={t.agendaAlt}
              width={1082}
              height={2402}
              sizes={phoneSizes}
            />
          </a>
        </div>
        <figcaption>{t.captureNote}</figcaption>
      </figure>
    </section>
  );
}
