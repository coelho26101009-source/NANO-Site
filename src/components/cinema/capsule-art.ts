import imageAssets from "@/content/images.json";

/**
 * The real voice capsule, cropped out of the official overlay capture
 * (nano-overlay.png, 760×180): only the light Electron demo backdrop is
 * cropped away, nothing else changes. Shared by the capsule that flies out
 * of the laptop (stage) and the one docked in the voice chapter (DOM), so
 * the hand-over between them is pixel-identical.
 */
const CROP = { x: 118, y: 58, width: 524, height: 64, source: 760 };
export const CAPSULE_WIDTH = 300;

const scale = CAPSULE_WIDTH / CROP.width;
const asset = imageAssets["/screenshots/nano-overlay.png"];

export const capsuleArt = {
  src: asset.variants[asset.variants.length - 1].src,
  width: CAPSULE_WIDTH,
  height: CROP.height * scale,
  radius: (CROP.height * scale) / 2,
  image: {
    width: CROP.source * scale,
    left: -CROP.x * scale,
    top: -CROP.y * scale,
  },
};
