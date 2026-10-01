import Image from "next/image";
import imageAssets from "@/content/images.json";

export const captureSizes =
  "(max-width: 700px) calc(100vw - 40px), (max-width: 1200px) calc(100vw - 80px), min(calc(100vw - 96px), 1200px)";
export const showcaseSizes =
  "(min-width: 1100px) and (min-height: 760px) and (prefers-reduced-motion: no-preference) min(calc(100vw - 96px), calc((100svh - 340px) * 1.860465), 1200px), " +
  captureSizes;

/** Lossless srcset for UI text. Next Image retains dimensions and lazy loading,
 * but must not send these pre-encoded files through another lossy conversion. */
export function ProductImage({
  src,
  alt,
  width,
  height,
  sizes,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
}) {
  const asset = imageAssets[src as keyof typeof imageAssets];
  return (
    <picture className="product-picture">
      <source
        type="image/webp"
        srcSet={asset.variants
          .map((variant) => `${variant.src} ${variant.width}w`)
          .join(", ")}
        sizes={sizes}
      />
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        unoptimized
        loading="lazy"
      />
    </picture>
  );
}
