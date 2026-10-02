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

function variantsFor(source: string): Variant[] {
  const asset = imageAssets[source as keyof typeof imageAssets];
  const lo = [...asset.variants].reverse().find((item) => item.width <= 1000);
  const hi = asset.variants[asset.variants.length - 1];
  return [lo, hi]
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item, index, list) => list.indexOf(item) === index)
    .map((item) => ({
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
 * @param loadFrom timeline time from which each capture is fetched, so the
 * 217 KB lossless Brain capture is only requested as the story approaches it.
 */
export function createDisplay(
  layer: HTMLElement,
  loadFrom: Record<ScreenName, number>,
  hiDpi: boolean,
) {
  const screens = Object.fromEntries(
    ORDER.map((name) => [name, { variants: variantsFor(SCREENS[name]) }]),
  ) as Record<ScreenName, { variants: Variant[] }>;
  const shade = document.createElement("div");
  shade.className = "cinema-display-shade";
  const glass = document.createElement("div");
  glass.className = "cinema-display-glass";
  layer.append(shade, glass);
  const startHi = hiDpi;
  let wantedHi = hiDpi;

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

  const tierOf = (name: ScreenName, hi: boolean) =>
    hi ? screens[name].variants.length - 1 : 0;

  const show = (variant: Variant, shown: boolean) => {
    if (!variant.image || variant.shown === shown) return;
    variant.shown = shown;
    variant.image.style.visibility = shown ? "visible" : "hidden";
  };
  let layersShown = false;

  function update({ t, quad, weights, opacity, dim, dpr }: DisplayFrame) {
    const visible = quad !== null && opacity > 0.001 && facing(quad) > 0;
    if (visible) {
      const deviceWidth =
        Math.hypot(quad[1][0] - quad[0][0], quad[1][1] - quad[0][1]) * dpr;
      // Hysteresis around ~1350 device px, between the 960 and 1920 sources.
      if (deviceWidth > 1420) wantedHi = true;
      else if (deviceWidth < 1280) wantedHi = false;
    }
    // Prefetch the starting tier ahead of each capture's chapter; switch tier
    // only for a capture on screen, so no capture is fetched in both sizes
    // unless its own size on screen actually crosses the threshold.
    for (let index = 0; index < ORDER.length; index++) {
      const name = ORDER[index];
      if (t >= loadFrom[name])
        load(screens[name].variants[tierOf(name, startHi)]);
      if (visible && weights[name] > 0.001)
        load(screens[name].variants[tierOf(name, wantedHi)]);
    }

    // Painter's order with "over" opacities so a crossfade never dips.
    let accumulated = 0;
    for (let index = 0; index < ORDER.length; index++) {
      const name = ORDER[index];
      const variants = screens[name].variants;
      const weight = visible ? weights[name] : 0;
      accumulated += weight;
      const tier = tierOf(name, wantedHi);
      let choice = variants[tier]?.ready ? tier : -1;
      for (let other = 0; choice < 0 && other < variants.length; other++)
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
