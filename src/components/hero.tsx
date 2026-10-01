import { site } from "@/content/site";
import { DownloadLink, Eyebrow } from "./ui";
import { Icon } from "./icons";
import { HeroSymbol } from "./hero-symbol";

export function Hero() {
  return (
    <section className="hero container" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <a className="release-badge" href={site.release}>
          <span className="status-dot" />
          Beta pública
          <span className="badge-divider" />
          {site.version}
          <Icon name="arrow" />
        </a>
        <Eyebrow>NANO · Assistente de IA para Windows</Eyebrow>
        <h1 id="hero-heading">
          O teu assistente
          <br />
          <span>pessoal.</span>
        </h1>
        <p className="hero-description">
          Local quando queres.
          <br />
          Cloud quando precisas.
        </p>
        <div className="hero-actions">
          <DownloadLink href={site.release}>
            Descarregar para Windows
          </DownloadLink>
          <a className="button button-secondary" href={site.repository}>
            <Icon name="github" />
            Ver no GitHub
          </a>
        </div>
        <p className="hero-meta">
          Windows 10/11 x64<span>·</span>Em desenvolvimento, contigo.
        </p>
      </div>
      <HeroSymbol />
      <div className="hero-bottom">
        <a href="#produto">
          Conhece o NANO
          <Icon name="arrow" />
        </a>
        <span>O teu computador. O teu contexto. A tua escolha.</span>
        <span className="hero-index" aria-hidden="true">
          01 — 08
        </span>
      </div>
    </section>
  );
}
