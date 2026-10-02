import { Eyebrow } from "./ui";
import { ProductShowcase } from "./product-showcase";
import { CinemaChapters } from "./cinema/chapters";
import { LaptopStill } from "./laptop-still";

export function Product() {
  return (
    <section
      id="produto"
      tabIndex={-1}
      className="section container"
      aria-labelledby="product-heading"
    >
      <div
        className="section-heading split-heading"
        data-cinema-beat="intro"
        data-cinema-align="start"
      >
        <div>
          <Eyebrow>Feito para o teu dia a dia</Eyebrow>
          <h2 id="product-heading">
            Uma IA que vive
            <br />
            contigo no teu PC.
          </h2>
        </div>
        <p>
          Conversa, memória e interação com o Windows, no mesmo lugar. Escolhe
          entre modelos locais e cloud, retoma o teu contexto e usa a voz quando
          estiveres pronto.
        </p>
      </div>
      <LaptopStill />
      <ProductShowcase />
      <CinemaChapters />
    </section>
  );
}
