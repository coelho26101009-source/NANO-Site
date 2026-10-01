import { modes } from "@/content/site";
import { Eyebrow } from "./ui";
import { Icon } from "./icons";

export function Modes() {
  return (
    <section
      className="section container modes-section"
      id="modos"
      tabIndex={-1}
      aria-labelledby="modes-heading"
    >
      <div className="section-heading centered">
        <Eyebrow>Três modos. A tua escolha.</Eyebrow>
        <h2 id="modes-heading">
          A inteligência muda.
          <br />
          <span>O controlo continua teu.</span>
        </h2>
        <p>
          Escolhe onde o NANO pensa. Com caminhos claros
          <br className="desktop-break" /> para o teu modelo local e para os
          teus provedores cloud.
        </p>
      </div>
      <div className="modes-grid">
        {modes.map((mode) => (
          <article className={`mode mode-${mode.id}`} key={mode.id}>
            <div className="mode-top">
              <span className="mode-number">{mode.number}</span>
              <span className="mode-indicator" aria-hidden="true" />
            </div>
            <h3>{mode.title}</h3>
            <p className="mode-subtitle">{mode.subtitle}</p>
            <p className="mode-description">{mode.description}</p>
            <div
              className="mode-path"
              aria-label={`Percurso: ${mode.path.join(", ")}`}
            >
              {mode.path.map((step, index) => (
                <span key={step}>
                  {index > 0 && <Icon name="arrow" />}
                  {step}
                </span>
              ))}
            </div>
            <p className="mode-footnote">{mode.footnote}</p>
            <span className="mode-tag">{mode.tag}</span>
          </article>
        ))}
      </div>
      <aside className="mode-caveat">
        <Icon name="shield" />
        <p>
          <strong>LOCAL refere-se ao modelo de linguagem.</strong> As respostas
          faladas enviam texto à Microsoft, mesmo em LOCAL. Pedidos de navegação
          web também usam a rede. Em AUTO, mais do que um provedor pode receber
          o pedido durante o failover.
        </p>
        <a href="#privacidade" aria-label="Ler mais sobre privacidade">
          <Icon name="arrow" />
        </a>
      </aside>
    </section>
  );
}
