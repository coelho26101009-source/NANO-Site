import { site } from "@/content/site";
import { Eyebrow, TextLink } from "./ui";
import { Icon } from "./icons";

export function Development() {
  return (
    <section
      className="section container development"
      aria-labelledby="development-heading"
    >
      <div className="section-heading split-heading">
        <div>
          <Eyebrow>Em aberto. Em evolução.</Eyebrow>
          <h2 id="development-heading">Podes ver o caminho.</h2>
        </div>
        <p>
          Código, decisões e limitações à vista. O NANO está em desenvolvimento
          ativo e a Beta ainda tem arestas por limar.
        </p>
      </div>
      <div className="development-grid">
        <a className="github-panel" href={site.repository}>
          <Icon name="github" width={34} height={34} />
          <span className="small-label">REPOSITÓRIO PÚBLICO</span>
          <h3>NANO, por dentro.</h3>
          <p>
            Explora o código, lê a documentação e acompanha as próximas
            alterações.
          </p>
          <span className="text-link">
            Ver no GitHub
            <Icon name="arrow" />
          </span>
          <span className="repo-label">
            Nano_Assistant<span>↗</span>
          </span>
        </a>
        <div className="roadmap">
          <div className="roadmap-row">
            <span className="roadmap-status current">AGORA</span>
            <div>
              <h3>Beta {site.version}</h3>
              <p>
                Conversas persistentes, Memory / RAG, Brain, modelos locais e
                cloud, voz opcional e PC Control.
              </p>
            </div>
          </div>
          <div className="roadmap-row">
            <span className="roadmap-status">A EVOLUIR</span>
            <div>
              <h3>Consolidar a experiência.</h3>
              <p>
                Validação em Windows limpo, voz em uso real, revisão de
                segurança e maturidade da distribuição são pontos ainda em
                aberto.
              </p>
            </div>
          </div>
          <p className="roadmap-note">
            Direções baseadas nos pontos públicos pendentes. Sem datas
            prometidas. Atualizações automáticas ainda não estão disponíveis.
          </p>
          <TextLink href={site.links.checklist}>
            Consultar os pontos em aberto
          </TextLink>
        </div>
      </div>
      <div className="development-links">
        <TextLink href={site.links.changelog}>Changelog</TextLink>
        <TextLink href={site.links.docs}>Documentação</TextLink>
        <TextLink href={site.links.support}>Suporte e feedback</TextLink>
        <span>Beta pública · {site.version}</span>
      </div>
    </section>
  );
}
