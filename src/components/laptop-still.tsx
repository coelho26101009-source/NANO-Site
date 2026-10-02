import Image from "next/image";
import still from "@/content/laptop-still.json";
import { ProductImage } from "./product-image";

/** Rendered width of the still per breakpoint (matches .laptop-still in CSS). */
const widths: [media: string, length: string][] = [
  ["(max-width: 700px)", "calc(100vw - 40px)"],
  ["(max-width: 1000px)", "min(calc(100vw - 80px), 640px)"],
  ["", "640px"],
];
const sizesFor = (share: number) =>
  widths
    .map(([media, length]) =>
      `${media} ${share === 1 ? length : `calc(${length} * ${share.toFixed(4)})`}`.trim(),
    )
    .join(", ");
const stillSizes = sizesFor(1);

/**
 * Wherever the 3D stage does not run (phones, tablets, reduced motion, no
 * WebGL, no JavaScript), the same laptop appears as a still rendered from the
 * live model (scripts/render-laptop-still.mjs). Its display is an exact
 * rectangle, so the real Home capture sits on it as a crisp DOM image.
 * Decorative: the gallery below carries the captures and their descriptions.
 */
export function LaptopStill() {
  const { screen } = still;
  return (
    <figure className="laptop-still" aria-hidden="true">
      <picture>
        <source
          type="image/webp"
          srcSet={still.variants
            .map((variant) => `${variant.src} ${variant.width}w`)
            .join(", ")}
          sizes={stillSizes}
        />
        <Image
          className="laptop-still-body"
          src={still.variants[1].src}
          alt=""
          width={still.width}
          height={still.height}
          unoptimized
          loading="lazy"
        />
      </picture>
      <div
        className="laptop-still-screen"
        style={{
          left: `${screen.x * 100}%`,
          top: `${screen.y * 100}%`,
          width: `${screen.width * 100}%`,
          height: `${screen.height * 100}%`,
        }}
      >
        <ProductImage
          src="/screenshots/nano-home.png"
          alt=""
          width={1920}
          height={1032}
          sizes={sizesFor(screen.width)}
        />
      </div>
    </figure>
  );
}
