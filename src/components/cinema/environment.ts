import * as THREE from "three";

/**
 * Product-photography studio, generated at runtime: a dark room lit by large
 * soft-edged softboxes, two tall strip lights for crisp edge highlights and
 * a pale floor sweep, pre-filtered once into a PMREM reflection map. The
 * floor bounce is what draws the bright line along the laptop's lower edges
 * (as in a real studio shot); the low back band is what the glass table
 * reflects at grazing angles. No HDR file is downloaded, no licence needed.
 */

/** A white rounded rectangle whose edges fall off smoothly (softbox diffuser). */
function softboxTexture(feather = 0.2, size = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d")!;
  const image = context.createImageData(size, size);
  const ease = (x: number) => {
    const t = Math.min(1, Math.max(0, x / feather));
    return t * t * (3 - 2 * t);
  };
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size;
      const v = (y + 0.5) / size;
      const value = ease(Math.min(u, 1 - u)) * ease(Math.min(v, 1 - v)) * 255;
      const index = (y * size + x) * 4;
      image.data[index] = image.data[index + 1] = image.data[index + 2] = value;
      image.data[index + 3] = 255;
    }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

/** Vertical ramp: bright at the bottom, gone at the top (a lit backdrop band). */
function rampTexture(size = 128) {
  const canvas = document.createElement("canvas");
  canvas.width = 4;
  canvas.height = size;
  const context = canvas.getContext("2d")!;
  const gradient = context.createLinearGradient(0, size, 0, 0);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.35, "#8a8a8a");
  gradient.addColorStop(1, "#000000");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 4, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

export function createStudioEnvironment(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#020203");
  const soft = softboxTexture(0.22);
  const strip = softboxTexture(0.4);
  const ramp = rampTexture();
  const panel = (
    width: number,
    height: number,
    color: string,
    intensity: number,
    position: [number, number, number],
    map: THREE.Texture = soft,
    target: [number, number, number] = [0, 0.6, 0],
  ) => {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(intensity),
      map,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      material,
    );
    mesh.position.set(...position);
    mesh.lookAt(...target);
    scene.add(mesh);
    return mesh;
  };
  // Overhead key softbox, slightly in front: lid edges and top surfaces.
  panel(9, 4.5, "#fff7ef", 2.4, [-1, 7, 2]);
  // Large soft card behind and above: the graded sheen across the deck.
  panel(12, 3.6, "#f1f3f6", 0.5, [0, 3.4, -6.5]);
  // Front card above the camera: the glossy bezel and the lid's rim.
  panel(10, 2.6, "#f4f5f7", 0.42, [0.5, 3.2, 7.5]);
  // Pale floor sweep below the set: a bright line along every lower edge.
  panel(18, 10, "#ecedef", 0.5, [0, -4.5, 1.5], soft, [0, 0, 0.5]);
  // Low card in front, below the camera: the vertical faces turned towards
  // the viewer (the unibody's front wall, the glass table's front edge)
  // catch it as the pale band a studio floor gives them.
  panel(16, 3.2, "#eef0f3", 0.85, [0, -1.6, 8.5], soft, [0, 0.2, 0]);
  // Lit backdrop band behind the set, fading upwards: what the glass table
  // shows at grazing angles, like the gradient sweep of a real studio.
  panel(26, 4.5, "#dfe3ea", 0.24, [0, 0.9, -9], ramp, [0, 0.9, 0]);
  // Tall strips behind-right and left: crisp highlights along the edges.
  panel(0.9, 7, "#eef2fa", 3.4, [5.8, 2.4, -3.2], strip);
  panel(0.7, 5, "#f6f6f6", 1.6, [-6.2, 2, -1.2], strip);
  // A low NANO-blue presence near the floor: an accent at grazing angles only.
  panel(5, 0.4, "#6f9be8", 0.18, [0, 0.1, -7], strip);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(scene, 0.015, 0.1, 100, { size: 512 });
  pmrem.dispose();
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      (object.material as THREE.Material).dispose();
    }
  });
  soft.dispose();
  strip.dispose();
  ramp.dispose();
  return target;
}

/** Radial gradient drawn on a small canvas: cheap, soft, no network. */
export function radialTexture(
  stops: [number, string][],
  size = 256,
  aspect = 1,
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = Math.round(size / aspect);
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2,
  );
  for (const [offset, color] of stops) gradient.addColorStop(offset, color);
  context.save();
  context.translate(canvas.width / 2, canvas.height / 2);
  context.scale(1, 1 / aspect);
  context.translate(-canvas.width / 2, -canvas.height / 2);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.width);
  context.restore();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
