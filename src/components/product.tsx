import type { Copy } from "@/content/i18n";
import { Eyebrow, Lines } from "./ui";
import { ProductShowcase } from "./product-showcase";
import { CinemaChapters } from "./cinema/chapters";
import { LaptopStill } from "./laptop-still";

export function Product({ t }: { t: Copy }) {
  return (
    <section
      id="product"
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
          <Eyebrow>{t.product.eyebrow}</Eyebrow>
          <h2 id="product-heading">
            <Lines lines={t.product.title} />
          </h2>
        </div>
        <p>{t.product.intro}</p>
      </div>
      <LaptopStill />
      <ProductShowcase t={t.showcase} experiences={t.experiences} />
      <CinemaChapters t={t.showcase} experiences={t.experiences} />
    </section>
  );
}
