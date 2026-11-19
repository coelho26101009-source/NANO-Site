import { ProductImage, captureSizes } from "./product-image";
import { site } from "@/content/site";
import type { Copy } from "@/content/i18n";
import { Eyebrow, TextLink } from "./ui";

export function Brain({ t: { brain: t } }: { t: Copy }) {
  return (
    <section
      id="brain"
      tabIndex={-1}
      className="brain-section section"
      aria-labelledby="brain-heading"
    >
      <div className="container">
        <div className="section-heading brain-heading" data-cinema-beat="brain">
          <div>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 id="brain-heading">
              {t.title[0]}
              <br />
              {t.title[1]}
            </h2>
          </div>
          <div>
            <p>
              {t.intro[0]}
              <br />
              {t.intro[1]}
            </p>
            <TextLink href={`${site.repository}#memória-e-second-brain`}>
              {t.more}
            </TextLink>
          </div>
        </div>
        <figure className="brain-figure" data-cinema-beat="portal">
          <a
            className="brain-image"
            href="/screenshots/nano-brain.png"
            aria-label={t.openCapture}
          >
            <ProductImage
              src="/screenshots/nano-brain.png"
              alt={t.alt}
              width={1920}
              height={1032}
              sizes={captureSizes}
            />
          </a>
          {/* Cinematic layout: the laptop shows the capture; keep its description and link. */}
          <span
            className="visually-hidden cinema-only"
            role="img"
            aria-label={t.alt}
          />
          <figcaption>
            <span>
              <span className="status-dot" />
              {t.stored}
            </span>
            <span>{t.stats}</span>
            <a
              className="cinema-capture-link cinema-only"
              href="/screenshots/nano-brain.png"
            >
              {t.openCaptureShort} <span aria-hidden="true">↗</span>
            </a>
          </figcaption>
        </figure>
        <div className="brain-details" data-cinema-beat="exit">
          {t.details.map((item) => (
            <div key={item.label}>
              <span className="small-label">{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
        <p className="section-note">
          {t.note} <a href="#privacy">{t.noteLink}</a>
        </p>
      </div>
    </section>
  );
}
