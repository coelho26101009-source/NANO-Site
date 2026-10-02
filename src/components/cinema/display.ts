import imageAssets from "@/content/images.json";

/**
 * The NANO display is DOM, not a WebGL texture: each official capture is an
 * <img> whose CSS matrix3d maps it exactly onto the projected corners of the
 * laptop's screen. Measured in Chromium, this stays sharper than a texture
 * at the capped canvas DPR. To avoid compositor aliasing, the lossless
 * variant is chosen so one source pixel covers roughly one device pixel.
 */
export const SCREENS = {
  home: "/screenshots/nano-home.png",
  thinking: "/screenshots/nano-thinking.png",
  conversation: "/screenshots/nano-conversation.png",
  brain: "/screenshots/nano-brain.png",
} as const;
export type ScreenName = keyof typeof SCREENS;
const ORDER = Object.keys(SCREENS) as ScreenName[];

/** Real capsule pixels inside nano-overlay.png (760×180); the light demo
 * backdrop of the Electron capture is cropped away, nothing else changes. */
const CAPSULE = { x: 118, y: 58, width: 524, height: 64, source: 760 };
const CAPSULE_CSS_WIDTH = 300;

export type Point = readonly [number, number];
type Variant = {
  width: number;
  height: number;
  src: string;
  image?: HTMLImageElement;
  ready: boolean;
  /** Last written values, so unchanged styles are not rewritten. */
  shown: boolean;
  opacity: string;
};

// The functions below run every frame: indexed access and plain loops only,
// because array destructuring and per-call closures allocate garbage.

/** Projective transform mapping a w×h box onto quad TL, TR, BR, BL. */
export function quadTransform(width: number, height: number, quad: Point[]) {
  const x0 = quad[0][0],
    y0 = quad[0][1],
    x1 = quad[1][0],
    y1 = quad[1][1],
    x2 = quad[2][0],
    y2 = quad[2][1],
    x3 = quad[3][0],
    y3 = quad[3][1];
  const dx1 = x1 - x2,
    dx2 = x3 - x2,
    dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2,
    dy2 = y3 - y2,
    dy3 = y0 - y1 + y2 - y3;
  let g = 0,
    h = 0;
  const det = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(det) > 1e-9) {
    g = (dx3 * dy2 - dx2 * dy3) / det;
    h = (dx1 * dy3 - dx3 * dy1) / det;
  }
  const a = (x1 - x0 + g * x1) / width;
  const b = (x3 - x0 + h * x3) / height;
  const d = (y1 - y0 + g * y1) / width;
  const e = (y3 - y0 + h * y3) / height;
  return `matrix3d(${a},${d},0,${g / width},${b},${e},0,${h / height},0,0,1,0,${x0},${y0},0,1)`;
}

/** Positive when the quad faces the viewer (TL→TR→BR→BL clockwise on screen). */
function facing(quad: Point[]) {
  let area = 0;
  for (let index = 0; index < 4; index++) {
    const a = quad[index];
    const b = quad[(index + 1) % 4];
    area += a[0] * b[1] - b[0] * a[1];
  }
  return area / 2;
}

/**
 * Lossless variants from 768 px up, smallest first, at least ~1.45× apart:
 * a capture growing on screen (the Brain into the portal) then steps up once
 * or twice instead of downloading every intermediate size.
 */
function variantsFor(source: string): Variant[] {
  const asset = imageAssets[source as keyof typeof imageAssets];
  const kept: (typeof asset.variants)[number][] = [];
  for (const item of [...asset.variants].reverse())
    if (
      kept.length === 0 ||
      (item.width >= 768 && kept[0].width >= item.width * 1.45)
    )
      kept.unshift(item);
  return kept.map((item) => ({
    width: item.width,
    height: Math.round((item.width * asset.height) / asset.width),
    src: item.src,
    ready: false,
    shown: false,
    opacity: "",
  }));
}

export type DisplayFrame = {
  t: number;
  quad: Point[] | null;
  weights: Record<ScreenName, number>;
  opacity: number;
  dim: number;
  dpr: number;
};

/**
 * Source choice, measured: the compositor samples these layers bilinearly
 * without mipmaps, so upscaling a source softens UI text visibly, while a
 * downscale stays crisp down to about half size and aliases below it. Each
 * capture therefore uses the smallest variant at least as wide as the display
 * in device pixels (never upscaled), stepping down only well below half size.
 */
function idealTier(variants: Variant[], deviceWidth: number) {
  for (let index = 0; index < variants.length; index++)
    if (variants[index].width >= deviceWidth * 0.97) return index;
  return variants.length - 1;
}
function nextTier(variants: Variant[], current: number, deviceWidth: number) {
  const ideal = idealTier(variants, deviceWidth);
  if (ideal > current) return ideal;
  return deviceWidth < variants[current].width * 0.42 ? ideal : current;
}

/**
 * @param loadFrom timeline time from which each capture is fetched, so the
 * large lossless Brain capture is only requested as the story approaches it.
 * @param readingWidth expected display width in device pixels at the reading
 * beats, used to prefetch the right variant before it is on screen.
 */
export function createDisplay(
  layer: HTMLElement,
  loadFrom: Record<ScreenName, number>,
  readingWidth: number,
) {
  const screens = Object.fromEntries(
    ORDER.map((name) => {
      const variants = variantsFor(SCREENS[name]);
      return [name, { variants, tier: idealTier(variants, readingWidth) }];
    }),
  ) as Record<ScreenName, { variants: Variant[]; tier: number }>;
  const start = Object.fromEntries(
    ORDER.map((name) => [name, screens[name].tier]),
  ) as Record<ScreenName, number>;
  const shade = document.createElement("div");
  shade.className = "cinema-display-shade";
  const glass = document.createElement("div");
  glass.className = "cinema-display-glass";
  layer.append(shade, glass);

  const load = (variant: Variant) => {
    if (variant.image) return;
    const image = new Image();
    image.alt = "";
    image.decoding = "async";
    image.draggable = false;
    image.className = "cinema-display-image";
    image.width = variant.width;
    image.height = variant.height;
    image.src = variant.src;
    variant.image = image;
    image
      .decode()
      .then(() => {
        variant.ready = true;
        layer.dispatchEvent(new Event("cinema:image"));
      })
      .catch(() => {});
    layer.insertBefore(image, shade);
  };

  const show = (variant: Variant, shown: boolean) => {
    if (!variant.image || variant.shown === shown) return;
    variant.shown = shown;
    variant.image.style.visibility = shown ? "visible" : "hidden";
  };
  let layersShown = false;

  function update({ t, quad, weights, opacity, dim, dpr }: DisplayFrame) {
    const visible = quad !== null && opacity > 0.001 && facing(quad) > 0;
    // Widest projected edge: the display is never upscaled along either.
    const deviceWidth = visible
      ? Math.max(
          Math.hypot(quad[1][0] - quad[0][0], quad[1][1] - quad[0][1]),
          Math.hypot(quad[2][0] - quad[3][0], quad[2][1] - quad[3][1]),
        ) * dpr
      : 0;
    // Prefetch the starting variant ahead of each capture's chapter; a capture
    // on screen changes variant only when its own size on screen requires it.
    for (let index = 0; index < ORDER.length; index++) {
      const name = ORDER[index];
      const screen = screens[name];
      if (t >= loadFrom[name]) load(screen.variants[start[name]]);
      if (visible && weights[name] > 0.001) {
        screen.tier = nextTier(screen.variants, screen.tier, deviceWidth);
        load(screen.variants[screen.tier]);
      }
    }

    // Painter's order with "over" opacities so a crossfade never dips.
    let accumulated = 0;
    for (let index = 0; index < ORDER.length; index++) {
      const name = ORDER[index];
      const variants = screens[name].variants;
      const weight = visible ? weights[name] : 0;
      accumulated += weight;
      // While the wanted variant decodes, show the largest ready one.
      const tier = screens[name].tier;
      let choice = variants[tier].ready ? tier : -1;
      for (let other = variants.length - 1; choice < 0 && other >= 0; other--)
        if (variants[other].ready) choice = other;
      const drawn = weight >= 0.001 && choice >= 0;
      for (let other = 0; other < variants.length; other++)
        if (!drawn || other !== choice) show(variants[other], false);
      if (!drawn) continue;
      const variant = variants[choice];
      const style = variant.image!.style;
      const value = String(
        (accumulated > 0 ? weight / accumulated : 0) * opacity,
      );
      if (value !== variant.opacity) style.opacity = variant.opacity = value;
      style.transform = quadTransform(variant.width, variant.height, quad!);
      show(variant, true);
    }
    if (visible) {
      const transform = quadTransform(960, 516, quad!);
      shade.style.transform = transform;
      glass.style.transform = transform;
      shade.style.opacity = String(dim * opacity);
      glass.style.opacity = String(opacity);
    }
    if (visible !== layersShown) {
      layersShown = visible;
      shade.style.visibility = glass.style.visibility = visible
        ? "visible"
        : "hidden";
    }
  }

  return {
    update,
    dispose() {
      for (const name of ORDER)
        for (const variant of screens[name].variants) variant.image?.remove();
      shade.remove();
      glass.remove();
    },
  };
}

/** The real voice capsule, cropped from the official overlay capture. */
export function createCapsule(layer: HTMLElement) {
  const asset = imageAssets["/screenshots/nano-overlay.png"];
  const native = asset.variants[asset.variants.length - 1];
  const scale = CAPSULE_CSS_WIDTH / CAPSULE.width;
  const element = document.createElement("div");
  element.className = "cinema-capsule";
  element.style.width = `${CAPSULE_CSS_WIDTH}px`;
  element.style.height = `${CAPSULE.height * scale}px`;
  element.style.borderRadius = `${(CAPSULE.height * scale) / 2}px`;
  const image = new Image();
  image.alt = "";
  image.decoding = "async";
  image.draggable = false;
  image.src = native.src;
  image.style.width = `${CAPSULE.source * scale}px`;
  image.style.left = `${-CAPSULE.x * scale}px`;
  image.style.top = `${-CAPSULE.y * scale}px`;
  element.append(image);
  layer.append(element);
  return {
    /** Centre and projected width in CSS px, opacity 0–1, yaw in degrees. */
    update(center: Point | null, width: number, opacity: number, tilt = 0) {
      if (!center || opacity < 0.001 || width < 4) {
        element.style.visibility = "hidden";
        return;
      }
      const s = width / CAPSULE_CSS_WIDTH;
      element.style.visibility = "visible";
      element.style.opacity = String(opacity);
      element.style.transform = `translate(${center[0]}px, ${center[1]}px) translate(-50%, -50%) perspective(900px) rotateY(${tilt}deg) scale(${s})`;
    },
    dispose() {
      element.remove();
    },
  };
}
