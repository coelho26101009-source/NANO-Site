import { site } from "@/content/site";
import { Brand } from "./ui";

export function Footer() {
  return (
    <footer className="footer container">
      <div className="footer-main">
        <a
          className="brand-link"
          href="#top"
          aria-label="NANO — voltar ao início"
        >
          <Brand />
        </a>
        <nav aria-label="Rodapé">
          <a href={site.repository}>GitHub</a>
          <a href="#download">Download</a>
          <a href={site.links.changelog}>Changelog</a>
          <a href={site.links.privacy}>Privacidade</a>
          <a href={site.links.security}>Segurança</a>
          <a href={site.links.support}>Suporte</a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>Um assistente pessoal. Uma construção contínua.</span>
        <span>
          {site.version}
          <span className="footer-beta">Beta</span>
        </span>
      </div>
    </footer>
  );
}
