import * as THREE from "three";

/**
 * Product-photography studio, generated at runtime: a dark room with a few
 * soft rectangular light sources, pre-filtered once into a PMREM reflection
 * map. No HDR file is downloaded and nothing here needs a licence.
 */
export function createStudioEnvironment(renderer: THREE.WebGLRenderer) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#030304");
  const panel = (
    width: number,
    height: number,
    color: string,
    intensity: number,
    position: [number, number, number],
  ) => {
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(intensity),
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      material,
    );
    mesh.position.set(...position);
    mesh.lookAt(0, 0.6, 0);
    scene.add(mesh);
  };
  // Overhead key softbox, slightly in front: lid edges and top surfaces.
  panel(8, 3.5, "#fff6ee", 2.4, [-1, 7, 2.2]);
  // Large soft card behind and above: the classic graded sheen on the deck.
  panel(10, 3, "#f3f4f6", 0.42, [0, 3.6, -6]);
  // Low frontal bounce card: lifts the front edge out of black.
  panel(8, 1.2, "#f4f5f7", 0.35, [0, 0.3, 7]);
  // Tall strips behind-right and left: crisp highlights along chassis edges.
  panel(0.8, 6, "#eef2fa", 4, [5.8, 2.4, -3.2]);
  panel(0.6, 4.5, "#f6f6f6", 1.8, [-6.2, 2, -1.2]);
  // A low NANO-blue presence near the floor: an accent at grazing angles only.
  panel(5, 0.35, "#6f9be8", 0.45, [0, 0.05, -7]);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(scene, 0.02);
  pmrem.dispose();
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      object.geometry.dispose();
      (object.material as THREE.Material).dispose();
    }
  });
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
