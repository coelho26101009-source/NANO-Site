import Image from "next/image";
import { site } from "@/content/site";
import type { Copy } from "@/content/i18n";
import { DownloadLink, Eyebrow, TextLink } from "./ui";
import imageAssets from "@/content/images.json";

export function Download({ t: { download: t } }: { t: Copy }) {
  return (
    <section
      id="download"
      tabIndex={-1}
      className="section download-section"
      aria-labelledby="download-heading"
    >
      <div className="container">
        <div className="download-main">
          <Image
            src={imageAssets["/brand/nano-symbol.png"].variants[0].src}
            alt=""
            width={100}
            height={81}
            unoptimized
          />
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 id="download-heading">{t.title}</h2>
          <p className="download-tagline">{t.tagline}</p>
          <p className="download-mobile-note">{t.mobileNote}</p>
          <DownloadLink href={site.installerUrl}>{t.button}</DownloadLink>
          <div className="download-meta">
            <span>NANO {site.version}</span>
            <span>{t.beta}</span>
            <span>{t.requirements}</span>
          </div>
          <p className="download-destination">
            {t.destination} <a href={site.release}>{t.releaseNotes}</a>
          </p>
        </div>
        <div className="install-steps">
          <span className="small-label">{t.stepsLabel}</span>
          <ol>
            {t.steps.map((step, index) => (
              <li key={step.title}>
                <span className="install-number" aria-hidden="true">
                  0{index + 1}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="download-notice">
          <div>
            <span className="notice-label">{t.noticeLabel}</span>
            <h3>{t.noticeTitle}</h3>
            <p>
              {t.notice} <strong>{t.noticeStrong}</strong>
            </p>
            <p>{t.notice2}</p>
          </div>
          <div className="download-check">
            <span className="small-label">{t.checkLabel}</span>
            <a className="checksum-link" href={site.checksum}>
              SHA256SUMS.txt<span aria-hidden="true">↗</span>
            </a>
            <p>{t.checkText}</p>
            <code>Get-FileHash .\{site.installer} -Algorithm SHA256</code>
            <TextLink href={site.links.guide}>{t.guide}</TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
