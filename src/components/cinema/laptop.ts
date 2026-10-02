import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

/**
 * Bespoke, unbranded laptop built from a handful of procedural meshes.
 * Units are decimetres: the chassis is 31.2 cm wide. The display's active
 * area has the exact 1920:1032 ratio of the official NANO captures, so the
 * real screenshots are never stretched or cropped.
 */
export const LAPTOP = {
  width: 3.12,
  baseDepth: 1.96,
  baseThickness: 0.1,
  lidHeight: 1.92,
  lidThickness: 0.048,
  screenWidth: 2.94,
  screenHeight: 2.94 / (1920 / 1032),
  bezelTop: 0.118,
  hingeGap: 0.016,
  openAngle: THREE.MathUtils.degToRad(104),
} as const;

export type Laptop = {
  group: THREE.Group;
  lid: THREE.Group;
  /** Plane of the active display area; local corners are ±w/2, ±h/2. */
  screen: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  screenMaterial: THREE.ShaderMaterial;
  materials: {
    chassis: THREE.MeshPhysicalMaterial;
    keys: THREE.MeshStandardMaterial;
  };
  setLidAngle(radians: number): void;
  dispose(): void;
};

function roundedRect(width: number, depth: number, radius: number) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -depth / 2;
  const r = Math.min(radius, width / 2, depth / 2);
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + depth - r);
  shape.quadraticCurveTo(x + width, y + depth, x + width - r, y + depth);
  shape.lineTo(x + r, y + depth);
  shape.quadraticCurveTo(x, y + depth, x, y + depth - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}

/** A slab with generous plan-view corners and small rounded vertical edges. */
function roundedSlab(
  width: number,
  depth: number,
  thickness: number,
  corner: number,
  edge: number,
) {
  const geometry = new THREE.ExtrudeGeometry(
    roundedRect(width - edge * 2, depth - edge * 2, corner - edge),
    {
      depth: thickness - edge * 2,
      bevelEnabled: true,
      bevelThickness: edge,
      bevelSize: edge,
      bevelSegments: 5,
      curveSegments: 14,
    },
  );
  // Extrusion runs along +z; lay the slab flat with its thickness on y.
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, edge, 0);
  geometry.computeVertexNormals();
  return geometry;
}

/** Flat rounded rectangle lying in the XZ plane, facing +y. */
function flatRoundedRect(width: number, depth: number, radius: number) {
  const geometry = new THREE.ShapeGeometry(
    roundedRect(width, depth, radius),
    10,
  );
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

/** Key rows from the back edge to the front, in key units (1u = 19 mm pitch). */
const KEY_ROWS: { height: number; keys: number[] }[] = [
  { height: 0.62, keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5] },
  { height: 1, keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2] },
  { height: 1, keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5] },
  { height: 1, keys: [1.78, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.22] },
  { height: 1, keys: [2.32, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.68] },
  { height: 1, keys: [1, 1, 1.22, 1.36, 5.06, 1.36, 1, 1, 1, 1] },
];

/** Keys laid out from z = 0 (back edge) towards +z (front). */
function createKeyboard(material: THREE.Material) {
  const pitch = 0.18;
  const gap = 0.03;
  const rowWidth = 15 * pitch; // every row spans fifteen key units
  const transforms: THREE.Matrix4[] = [];
  let z = 0;
  const dummy = new THREE.Object3D();
  for (const row of KEY_ROWS) {
    const rowDepth = row.height * pitch;
    const units = row.keys.reduce((sum, value) => sum + value, 0);
    const scale = rowWidth / (units * pitch);
    let x = -rowWidth / 2;
    for (const size of row.keys) {
      const width = size * pitch * scale;
      dummy.position.set(x + width / 2, 0, z + rowDepth / 2);
      dummy.scale.set(width - gap, 0.011, rowDepth - gap);
      dummy.updateMatrix();
      transforms.push(dummy.matrix.clone());
      x += width;
    }
    z += rowDepth;
  }
  const geometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.16);
  const keys = new THREE.InstancedMesh(geometry, material, transforms.length);
  transforms.forEach((matrix, index) => keys.setMatrixAt(index, matrix));
  keys.instanceMatrix.needsUpdate = true;
  return { keys, depth: z, width: rowWidth };
}

const screenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The WebGL display never draws NANO UI: the real captures are DOM layers.
// Here it only provides the panel's "power" light: dark → soft blue-white.
const screenFragment = /* glsl */ `
  uniform float uPower;
  uniform float uBloom;
  varying vec2 vUv;
  void main() {
    // Aspect-correct radius across the 1920:1032 panel.
    vec2 p = (vUv - 0.5) * vec2(1.8605, 1.0);
    float r2 = dot(p, p);
    // Linear values: panel off, then the app's own #1a1a1a background,
    // so the hand-off to the real Home capture is seamless.
    vec3 off = vec3(0.0016, 0.0018, 0.0023);
    vec3 app = vec3(0.0103, 0.0103, 0.0111);
    vec3 glow = vec3(0.42, 0.56, 0.95);
    vec3 color = mix(off, app, uPower);
    color += glow * exp(-r2 * mix(14.0, 3.2, uBloom)) * (0.32 * uBloom);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export function createLaptop(): Laptop {
  const {
    width,
    baseDepth,
    baseThickness,
    lidHeight,
    lidThickness,
    screenWidth,
    screenHeight,
    bezelTop,
    hingeGap,
  } = LAPTOP;
  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  const chassis = keep(
    new THREE.MeshPhysicalMaterial({
      // Anodised graphite: the darkness comes from the studio, not the albedo.
      color: new THREE.Color("#3f4247"),
      metalness: 0.86,
      roughness: 0.32,
      clearcoat: 0.2,
      clearcoatRoughness: 0.28,
      envMapIntensity: 1,
    }),
  );
  const darkTrim = keep(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#0b0c0e"),
      metalness: 0.35,
      roughness: 0.55,
    }),
  );
  const well = keep(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#121316"),
      metalness: 0.2,
      roughness: 0.78,
    }),
  );
  const keyMaterial = keep(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1a1b1e"),
      metalness: 0.1,
      roughness: 0.55,
    }),
  );
  const trackpadMaterial = keep(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#24272b"),
      metalness: 0.4,
      roughness: 0.2,
      clearcoat: 0.35,
      clearcoatRoughness: 0.18,
    }),
  );
  const glass = keep(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#050608"),
      metalness: 0,
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      envMapIntensity: 0.55,
    }),
  );
  const screenMaterial = keep(
    new THREE.ShaderMaterial({
      uniforms: {
        uPower: { value: 0 },
        uBloom: { value: 0 },
      },
      vertexShader: screenVertex,
      fragmentShader: screenFragment,
      toneMapped: false,
    }),
  );

  const group = new THREE.Group();
  group.name = "laptop";

  // Base and keyboard deck.
  const base = new THREE.Mesh(
    keep(roundedSlab(width, baseDepth, baseThickness, 0.13, 0.024)),
    chassis,
  );
  base.position.y = 0;
  group.add(base);

  // Deck layout, back to front: hinge margin, keyboard, gap, trackpad, palm edge.
  const deckY = baseThickness + 0.0004;
  const keyboard = createKeyboard(keyMaterial);
  keep(keyboard.keys.geometry);
  const keyboardBack = -baseDepth / 2 + 0.17;
  const wellMesh = new THREE.Mesh(
    keep(flatRoundedRect(keyboard.width + 0.06, keyboard.depth + 0.06, 0.035)),
    well,
  );
  wellMesh.position.set(0, deckY, keyboardBack + keyboard.depth / 2);
  group.add(wellMesh);
  keyboard.keys.position.set(0, deckY + 0.004, keyboardBack);
  group.add(keyboard.keys);

  const trackpadDepth = 0.6;
  const trackpad = new THREE.Mesh(
    keep(flatRoundedRect(1.12, trackpadDepth, 0.05)),
    trackpadMaterial,
  );
  trackpad.position.set(
    0,
    deckY + 0.0002,
    keyboardBack + keyboard.depth + 0.075 + trackpadDepth / 2,
  );
  group.add(trackpad);

  // Hinge barrel, visible as a dark bar between deck and display chin.
  const hinge = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(0.034, 0.034, width - 0.5, 24, 1)),
    darkTrim,
  );
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, baseThickness + 0.006, -baseDepth / 2 + 0.032);
  group.add(hinge);

  // Discreet side ports (no branding, no proprietary detail).
  const portGeometry = keep(
    new RoundedBoxGeometry(0.004, 0.032, 0.11, 2, 0.002),
  );
  for (const [z, length] of [
    [-0.35, 0.11],
    [-0.16, 0.11],
  ]) {
    const port = new THREE.Mesh(portGeometry, darkTrim);
    port.scale.z = length / 0.11;
    port.position.set(-width / 2 + 0.0015, baseThickness / 2, z);
    group.add(port);
  }

  // Lid: a group pivoting on the hinge axis at the back of the deck.
  const lid = new THREE.Group();
  lid.name = "lid";
  lid.position.set(0, baseThickness + hingeGap, -baseDepth / 2 + 0.03);
  group.add(lid);

  const lidBody = new THREE.Mesh(
    keep(roundedSlab(width, lidHeight, lidThickness, 0.13, 0.016)),
    chassis,
  );
  // Closed pose: the lid lies on the deck, inner face down, extending forward.
  lidBody.position.set(0, 0, lidHeight / 2 + 0.008);
  lid.add(lidBody);

  const glassPanel = new THREE.Mesh(
    keep(flatRoundedRect(width - 0.05, lidHeight - 0.05, 0.11)),
    glass,
  );
  glassPanel.rotation.x = Math.PI; // face down (towards the keyboard when closed)
  glassPanel.position.set(0, -0.0006, lidHeight / 2 + 0.008);
  lid.add(glassPanel);

  const chin = lidHeight - bezelTop - screenHeight;
  const screen = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(screenWidth, screenHeight)),
    screenMaterial,
  );
  // PlaneGeometry faces +z; rotate so it faces -y (inner face) with image-up
  // pointing to the top bezel (far end of the closed lid).
  screen.rotation.x = Math.PI / 2;
  screen.position.set(0, -0.0012, 0.008 + chin + screenHeight / 2);
  screen.name = "display";
  lid.add(screen);

  const webcam = new THREE.Mesh(
    keep(new THREE.CircleGeometry(0.011, 20)),
    darkTrim,
  );
  webcam.rotation.x = Math.PI / 2;
  webcam.position.set(0, -0.0014, 0.008 + lidHeight - bezelTop / 2);
  lid.add(webcam);

  const setLidAngle = (radians: number) => {
    lid.rotation.x = -radians;
  };
  setLidAngle(0);

  return {
    group,
    lid,
    screen,
    screenMaterial,
    materials: { chassis, keys: keyMaterial },
    setLidAngle,
    dispose() {
      disposables.forEach((item) => item.dispose());
      keyboard.keys.dispose();
    },
  };
}
