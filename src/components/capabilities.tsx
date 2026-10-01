import { capabilities } from "@/content/site";
import { Eyebrow } from "./ui";

export function Capabilities() {
  return (
    <section
      className="section container capabilities"
      aria-labelledby="capabilities-heading"
    >
      <div className="capabilities-intro">
        <Eyebrow>Para além da resposta</Eyebrow>
        <h2 id="capabilities-heading">
          Uma conversa.
          <br />
          Mais possibilidades.
        </h2>
        <p>
          Ferramentas concretas para o teu computador, ligadas ao contexto da
          conversa.
        </p>
        <span className="availability">
          <span className="status-dot" />
          Disponível na Beta<span>*</span>
        </span>
      </div>
      <div className="capability-list">
        {capabilities.map((item) => (
          <article key={item.number} className="capability">
            <span className="capability-number">{item.number}</span>
            <div>
              <span className="small-label">{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
        <p className="section-note">
          * A disponibilidade depende da configuração. A voz precisa de
          dependências opcionais que não vêm no instalador base.
        </p>
      </div>
    </section>
  );
}
