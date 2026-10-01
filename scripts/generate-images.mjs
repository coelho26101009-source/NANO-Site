// Build-time only. Use the image processor already shipped with Next.js.
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve("next/package.json"))("sharp");
const destination = "public/images";
await mkdir(destination, { recursive: true });
const manifest = {};
for (const [folder, names] of [
  [
    "screenshots",
    [
      "nano-home",
      "nano-thinking",
      "nano-conversation",
      "nano-brain",
      "nano-overlay",
    ],
  ],
  ["brand", ["nano-symbol", "nano-wordmark-original"]],
]) {
  for (const name of names) {
    const source = `/` + folder + `/` + name + `.png`;
    const input = await readFile(`public${source}`);
    const { width, height } = await sharp(input).metadata();
    const widths =
      folder === "brand"
        ? [width]
        : [
            ...new Set(
              [480, 768, 960, 1200, 1600, width].filter(
                (size) => size <= width,
              ),
            ),
          ].sort((a, b) => a - b);
    const variants = [];
    for (const size of widths) {
      const buffer = await sharp(input)
        .resize({ width: size, withoutEnlargement: true })
        .webp({ lossless: true, effort: 6 })
        .toBuffer();
      // Content hashes let the browser cache these forever without stale releases.
      const hash = createHash("sha256")
        .update(buffer)
        .digest("hex")
        .slice(0, 10);
      const path = `/images/${name}-${size}-${hash}.webp`;
      await writeFile(`public${path}`, buffer);
      variants.push({ width: size, src: path, bytes: buffer.length });
    }
    // Downsampling flat UI can add colours and cost more than the full-size image.
    // Omit any derivative that is larger in bytes than a higher-resolution option.
    const efficient = variants.filter(
      (variant, index) =>
        !variants
          .slice(index + 1)
          .some((larger) => larger.bytes <= variant.bytes),
    );
    for (const variant of variants) {
      if (!efficient.includes(variant)) await rm(`public${variant.src}`);
    }
    manifest[source] = { width, height, variants: efficient };
  }
}
await writeFile(
  "src/content/images.json",
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(
  "Generated lossless responsive images from the existing official assets.",
);
