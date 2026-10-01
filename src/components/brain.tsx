import Image from "next/image";
import { site } from "@/content/site";
import { Eyebrow, TextLink } from "./ui";

export function Brain() {
  return (
    <section
      id="brain"
      tabIndex={-1}
      className="brain-section section"
      aria-labelledby="brain-heading"
    >
      <div className="container">
        <div className="section-heading brain-heading">
          <div>
            <Eyebrow>NANO Brain</Eyebrow>
            <h2 id="brain-heading">
              Uma memória
              <br />
              que faz sentido.
            </h2>
          </div>
          <div>
            <p>
              Há contexto que merece ficar.
              <br />O NANO guarda memórias de longo prazo e recupera o que é
              relevante para a conversa.
            </p>
            <TextLink href={`${site.repository}#memória-e-second-brain`}>
              Conhecer o Brain
            </TextLink>
          </div>
        </div>
        <figure className="brain-figure">
          <a
            className="brain-image"
            href="/screenshots/nano-brain.png"
            aria-label="Abrir a captura completa do NANO Brain"
          >
            <Image
              src="/screenshots/nano-brain.png"
              alt="Grafo real do NANO Brain: O meu PC ligado a Ollama e Projeto NANO, com três nós de demonstração e duas relações."
              width={1920}
              height={1032}
              sizes="(max-width: 800px) 94vw, 1200px"
            />
          </a>
          <figcaption>
            <span>
              <span className="status-dot" />
              Contexto guardado localmente
            </span>
            <span>3 nós de demonstração · 2 relações reais</span>
          </figcaption>
        </figure>
        <div className="brain-details">
          <div>
            <span className="small-label">01 / GUARDAR</span>
            <h3>O que escolhes lembrar.</h3>
            <p>
              As memórias são extraídas localmente. Pedidos explícitos podem
              ficar ativos; inferências seguem regras de confiança.
            </p>
          </div>
          <div>
            <span className="small-label">02 / RELACIONAR</span>
            <h3>Ligações com origem.</h3>
            <p>
              Os nós nascem de memórias ativas ou de uma ação tua. As relações
              surgem quando dois nós aparecem na mesma memória.
            </p>
          </div>
          <div>
            <span className="small-label">03 / RECUPERAR</span>
            <h3>Contexto, quando importa.</h3>
            <p>
              A recuperação junta memórias relevantes e histórico da conversa. O
              Brain ainda está a amadurecer com o uso real.
            </p>
          </div>
        </div>
        <p className="section-note">
          Guardar localmente não impede o envio de contexto relevante ao modelo
          em AUTO ou CLOUD.{" "}
          <a href="#privacidade">Ver como os dados são usados.</a>
        </p>
      </div>
    </section>
  );
}
