import { privacyPoints, site } from "@/content/site";
import { Eyebrow, TextLink } from "./ui";
import { Icon } from "./icons";

export function Privacy() {
  return (
    <section
      id="privacidade"
      tabIndex={-1}
      className="privacy-section section"
      aria-labelledby="privacy-heading"
    >
      <div className="container">
        <div className="section-heading split-heading">
          <div>
            <Eyebrow>Privacidade & segurança</Eyebrow>
            <h2 id="privacy-heading">
              Confiança começa
              <br />
              com clareza.
            </h2>
          </div>
          <p>
            Escolhas visíveis, permissões com limites e documentação aberta.
            Para perceberes o que o NANO faz com os teus dados e com o teu
            computador.
          </p>
        </div>
        <div className="privacy-grid">
          {privacyPoints.map((item) => (
            <article key={item.number}>
              <span className="privacy-number">{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
        <div className="trust-strip">
          <Icon name="shield" />
          <p>
            O projeto tem fronteiras de segurança e testes dedicados. Continua
            em Beta e tem limitações documentadas.
          </p>
          <div>
            <TextLink href={site.links.privacy}>Privacidade</TextLink>
            <TextLink href={site.links.security}>Segurança</TextLink>
          </div>
        </div>
        <details className="privacy-disclosure">
          <summary>
            O que devo saber sobre voz, memória e ferramentas?
            <Icon name="chevron" />
          </summary>
          <div>
            <p>
              As respostas faladas usam Microsoft Edge TTS: o texto a ler sai do
              computador em todos os modos. Podes desligá-las em Definições →
              Voz. A transcrição, quando configurada, é local.
            </p>
            <p>
              Resultados de ferramentas, como texto de um ficheiro ou da área de
              transferência, podem integrar o contexto enviado ao provedor.
              Apagar uma conversa não apaga as memórias de longo prazo extraídas
              dela: estas são geridas à parte, na Memória.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
