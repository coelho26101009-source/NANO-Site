import { site } from "@/content/site";
import type { Copy } from "@/content/i18n";
import { Eyebrow, TextLink } from "./ui";
import { Icon } from "./icons";

export function Story({ t: { story: t } }: { t: Copy }) {
  return (
    <section
      id="about"
      tabIndex={-1}
      className="section container story-section"
      aria-labelledby="story-heading"
    >
      <div className="story-aside">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <span className="story-monogram" aria-hidden="true">
          N.
        </span>
        <div className="creator">
          <span className="small-label">{t.createdBy}</span>
          <p className="creator-name">{site.creator.name}</p>
          <p className="creator-role">{t.role}</p>
          <a className="creator-handle" href={site.repository}>
            <Icon name="github" />
            {site.creator.handle}
            <span className="visually-hidden">{t.onGithub}</span>
          </a>
          <span className="creator-note">{t.independent}</span>
        </div>
      </div>
      <div className="story-copy">
        <h2 id="story-heading">
          {t.title[0]}
          <br />
          <span>{t.title[1]}</span>
        </h2>
        <p className="story-lead">{t.lead}</p>
        {t.body.map((text) => (
          <p key={text}>{text}</p>
        ))}
        <TextLink href={site.repository}>{t.follow}</TextLink>
      </div>
    </section>
  );
}
