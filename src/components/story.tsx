import { site } from "@/content/site";
import { Eyebrow, TextLink } from "./ui";

export function Story() {
  return (
    <section
      id="sobre"
      tabIndex={-1}
      className="section container story-section"
      aria-labelledby="story-heading"
    >
      <div className="story-aside">
        <Eyebrow>Uma ideia pessoal</Eyebrow>
        <span className="story-monogram" aria-hidden="true">
          N.
        </span>
        <div className="creator">
          <span className="small-label">CRIADO POR</span>
          <a href={site.repository}>{site.creator}</a>
          <span>Projeto independente</span>
        </div>
      </div>
      <div className="story-copy">
        <h2 id="story-heading">
          Começou com uma ideia.
          <br />
          <span>Está a ganhar forma.</span>
        </h2>
        <p className="story-lead">
          E se um assistente fizesse parte do computador — e conhecesse um pouco
          melhor o contexto de quem o usa?
        </p>
        <p>
          O NANO nasceu como um projeto pessoal para explorar essa ideia. Juntar
          inteligência local e cloud, memória, voz e interação com o Windows
          numa experiência que faça sentido no dia a dia.
        </p>
        <p>
          A ambição é dar-lhe progressivamente mais capacidade de ajudar e agir,
          mantendo limites claros. Ainda há caminho a percorrer. A Beta é uma
          etapa desse trabalho, feita de melhorias concretas e aprendizagem com
          o uso.
        </p>
        <TextLink href={site.repository}>
          Acompanha a construção no GitHub
        </TextLink>
      </div>
    </section>
  );
}
