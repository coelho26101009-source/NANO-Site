import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import {
  flatRoundedRect,
  moveOutline,
  openingLip,
  profiledSlab,
  slabProfile,
} from "./geometry";

/**
 * Bespoke, unbranded laptop, modelled like a premium 14-inch machine: a
 * machined aluminium unibody with crisp radiused edges, a recessed keyboard
 * and a flush glass trackpad, a barrel hinge, rubber feet and real ports,
 * and a thin-bezel glass display with a camera notch. Units are decimetres:
 * the chassis is 30.6 cm wide. The display's active area keeps the exact
 * 1920:1032 ratio of the official NANO captures, so the real screenshots
 * are never stretched or cropped.
 */
export const LAPTOP = {
  width: 3.06,
  baseDepth: 1.86,
  baseThickness: 0.1,
  /** Rubber feet: the unibody floats this far above the table. */
  foot: 0.012,
  lidHeight: 1.802,
  lidThickness: 0.05,
  /** Plan radius of every outer corner (base and lid close flush). */
  corner: 0.105,
  screenWidth: 2.94,
  screenHeight: 2.94 / (1920 / 1032),
  bezelTop: 0.072,
  /** Rounded top corners of the active area (dm). */
  screenRadius: 0.045,
  /** Camera notch, as fractions of the active area's width and height. */
  notch: { width: 0.1, height: 0.032 },
  openAngle: THREE.MathUtils.degToRad(104),
} as const;

export type Laptop = {
  group: THREE.Group;
  lid: THREE.Group;
  /** Plane of the active display area; local corners are ±w/2, ±h/2. */
  screen: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  screenMaterial: THREE.ShaderMaterial;
  materials: {
    chassis: THREE.MeshStandardMaterial;
    keys: THREE.MeshStandardMaterial;
  };
  /**
   * Parts on top of the deck (keys, legends, grilles, trackpad): the base
   * hides them from any view below the laptop, so a mirror pass skips them.
   */
  deck: THREE.Object3D[];
  setLidAngle(radians: number): void;
  dispose(): void;
};

type KeyShape = "full" | "low" | "split";
type Key = { size: number; legend: string; shape?: KeyShape };

const key = (size: number, legend: string, shape?: KeyShape): Key => ({
  size,
  legend,
  shape,
});
const row = (legends: string) =>
  [...legends].map((legend) => key(1, legend.toUpperCase()));

/** Key rows from the back edge to the front, in key units; each spans 15u. */
const KEY_ROWS: { height: number; keys: Key[] }[] = [
  {
    height: 0.72,
    keys: [
      key(1.5, "esc"),
      ...Array.from({ length: 12 }, (_, index) => key(1, `F${index + 1}`)),
      key(1.5, "power"),
    ],
  },
  {
    height: 1,
    keys: [...row("`1234567890-="), key(2, "backspace")],
  },
  {
    height: 1,
    keys: [key(1.5, "tab"), ...row("qwertyuiop[]"), key(1.5, "\\")],
  },
  {
    height: 1,
    keys: [key(1.78, "caps"), ...row("asdfghjkl;'"), key(2.22, "enter")],
  },
  {
    height: 1,
    keys: [key(2.32, "shift"), ...row("zxcvbnm,./"), key(2.68, "shift")],
  },
  {
    height: 1,
    keys: [
      key(1.1, "ctrl"),
      key(1, "fn"),
      key(1, "win"),
      key(1.15, "alt"),
      key(5.5, ""),
      key(1.15, "alt"),
      key(1.1, "ctrl"),
      key(1, "left", "low"),
      key(1, "updown", "split"),
      key(1, "right", "low"),
    ],
  },
];
const PITCH = 0.178;
const KEY_GAP = 0.03;
const KEYBOARD_WIDTH = 15 * PITCH;
const KEYBOARD_DEPTH = KEY_ROWS.reduce((sum, r) => sum + r.height, 0) * PITCH;

/** Every key cap as a rectangle in keyboard space (x from the left, z from the back). */
function keyRects() {
  const rects: {
    x: number;
    z: number;
    w: number;
    d: number;
    legend: string;
    part?: "up" | "down";
    word: boolean;
    fnRow: boolean;
  }[] = [];
  let z = 0;
  KEY_ROWS.forEach((keyRow, rowIndex) => {
    const rowDepth = keyRow.height * PITCH;
    let x = 0;
    for (const item of keyRow.keys) {
      const width = item.size * PITCH;
      const w = width - KEY_GAP;
      const word = item.legend.length > 1 && !/^F\d+$/.test(item.legend);
      const base = { x: x + width / 2, w, word, fnRow: rowIndex === 0 };
      const half = (rowDepth - KEY_GAP) / 2 - KEY_GAP / 4;
      if (item.shape === "low") {
        rects.push({
          ...base,
          z: z + rowDepth * 0.75 - KEY_GAP / 4,
          d: half,
          legend: item.legend,
        });
      } else if (item.shape === "split") {
        rects.push({
          ...base,
          z: z + rowDepth * 0.25 + KEY_GAP / 4,
          d: half,
          legend: "up",
          part: "up",
        });
        rects.push({
          ...base,
          z: z + rowDepth * 0.75 - KEY_GAP / 4,
          d: half,
          legend: "down",
          part: "down",
        });
      } else {
        rects.push({
          ...base,
          z: z + rowDepth / 2,
          d: rowDepth - KEY_GAP,
          legend: item.legend,
        });
      }
      x += width;
    }
    z += rowDepth;
  });
  return rects;
}

/** The site's own sans-serif (already loaded by the page), else system UI. */
function legendFont() {
  const family =
    typeof document === "undefined"
      ? ""
      : getComputedStyle(document.documentElement)
          .getPropertyValue("--font-sans")
          .trim();
  return family
    ? `${family}, "Segoe UI", Arial, sans-serif`
    : "Arial, sans-serif";
}

/**
 * The legends as one transparent texture laid on the key tops: letters
 * centred, modifiers small and top-left as on real keyboards, symbols
 * (power, Windows, arrows) drawn as paths so no font can turn them into
 * missing-glyph boxes.
 */
function createLegendTexture() {
  const pxPerUnit = 2048 / KEYBOARD_WIDTH;
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = Math.round(KEYBOARD_DEPTH * pxPerUnit);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const font = legendFont();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.lineCap = "round";
  const triangle = (cx: number, cy: number, s: number, angle: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.9, s * 0.6);
    ctx.lineTo(-s * 0.9, s * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };
  for (const rect of keyRects()) {
    const left = (rect.x - rect.w / 2) * pxPerUnit;
    const top = (rect.z - rect.d / 2) * pxPerUnit;
    const w = rect.w * pxPerUnit;
    const h = rect.d * pxPerUnit;
    const cx = left + w / 2;
    const cy = top + h / 2;
    const unit = (PITCH - KEY_GAP) * pxPerUnit; // a full key's depth in px
    switch (rect.legend) {
      case "": // space bar
        break;
      case "win": {
        const s = unit * 0.11;
        for (const [dx, dy] of [
          [-1, -1],
          [0.12, -1],
          [-1, 0.12],
          [0.12, 0.12],
        ])
          ctx.fillRect(cx + dx * s, cy + dy * s, s * 0.88, s * 0.88);
        break;
      }
      case "power": {
        const r = h * 0.2;
        ctx.lineWidth = Math.max(2, h * 0.055);
        ctx.beginPath();
        ctx.arc(
          cx,
          cy + r * 0.12,
          r,
          -Math.PI / 2 + 0.75,
          -Math.PI / 2 - 0.75 + Math.PI * 2,
        );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, cy - r * 1.05);
        ctx.lineTo(cx, cy + r * 0.1);
        ctx.stroke();
        break;
      }
      case "left":
      case "right":
        triangle(
          cx,
          cy,
          h * 0.2,
          rect.legend === "left" ? -Math.PI / 2 : Math.PI / 2,
        );
        break;
      case "up":
      case "down":
        triangle(cx, cy, h * 0.2, rect.legend === "up" ? 0 : Math.PI);
        break;
      default:
        if (rect.word && !rect.fnRow) {
          ctx.font = `500 ${Math.round(unit * 0.2)}px ${font}`;
          ctx.textAlign = "left";
          ctx.fillText(rect.legend, left + unit * 0.13, top + unit * 0.25);
        } else {
          const small = rect.fnRow;
          ctx.font = `${small ? 500 : 400} ${Math.round(unit * (small ? 0.26 : 0.32))}px ${font}`;
          ctx.textAlign = "center";
          ctx.fillText(rect.legend, cx, cy + unit * 0.01);
        }
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Key caps, laid out from z = 0 (back edge) towards +z (front), centred on x. */
function createKeyboard(material: THREE.Material, height: number) {
  const rects = keyRects();
  const dummy = new THREE.Object3D();
  // Two bevel segments: a cap is a few dozen pixels wide at the closest
  // beat, and 78 of them are most of the scene's triangles.
  const geometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.2);
  const keys = new THREE.InstancedMesh(geometry, material, rects.length);
  rects.forEach((rect, index) => {
    dummy.position.set(rect.x - KEYBOARD_WIDTH / 2, height / 2, rect.z);
    dummy.scale.set(rect.w, height, rect.d);
    dummy.updateMatrix();
    keys.setMatrixAt(index, dummy.matrix);
  });
  keys.instanceMatrix.needsUpdate = true;
  return keys;
}

/** Laser-drilled speaker holes as a tiling alpha texture (2 px dots). */
function createGrilleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#ffffff";
  for (const [x, y] of [
    [4, 4],
    [12, 12],
  ]) {
    ctx.beginPath();
    ctx.arc(x, y, 2.1, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

const screenVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// The WebGL display never draws NANO UI: the real captures are DOM layers.
// Here it only provides the panel's "power" light: dark → soft blue-white,
// inside the active area's rounded top corners and around the camera notch
// (the same shape the DOM captures are clipped to).
const screenFragment = /* glsl */ `
  uniform float uPower;
  uniform float uBloom;
  uniform vec2 uSize;
  uniform float uRadius;
  uniform vec2 uNotch;
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    vec2 half_ = uSize * 0.5;
    // Rounded top corners.
    vec2 c = vec2(half_.x - uRadius, half_.y - uRadius);
    vec2 q = vec2(abs(p.x), p.y) - c;
    float outside = (q.x > 0.0 && q.y > 0.0) ? step(uRadius, length(q)) : 0.0;
    // Notch: a rounded tab hanging from the top edge.
    vec2 n = vec2(abs(p.x), half_.y - p.y);
    float nr = uNotch.y * 0.42;
    vec2 nq = vec2(n.x - (uNotch.x * 0.5 - nr), n.y - (uNotch.y - nr));
    float notch = (nq.x <= 0.0 || nq.y <= 0.0)
      ? step(n.x, uNotch.x * 0.5) * step(n.y, uNotch.y)
      : step(length(nq), nr);
    // Aspect-correct radius across the 1920:1032 panel.
    vec2 r = (vUv - 0.5) * vec2(1.8605, 1.0);
    float r2 = dot(r, r);
    // Linear values: panel off, then the app's own #1a1a1a background,
    // so the hand-off to the real Home capture is seamless.
    vec3 off = vec3(0.0016, 0.0018, 0.0023);
    vec3 app = vec3(0.0103, 0.0103, 0.0111);
    vec3 glow = vec3(0.42, 0.56, 0.95);
    vec3 color = mix(off, app, uPower);
    color += glow * exp(-r2 * mix(14.0, 3.2, uBloom)) * (0.32 * uBloom);
    color *= 1.0 - max(outside, notch);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export function createLaptop(): Laptop {
  const {
    width,
    baseDepth,
    baseThickness,
    foot,
    lidHeight,
    lidThickness,
    corner,
    screenWidth,
    screenHeight,
    bezelTop,
  } = LAPTOP;
  const disposables: { dispose(): void }[] = [];
  const keep = <T extends { dispose(): void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  // Materials. Bead-blasted, anodised aluminium in a deep graphite: a metal
  // (all of its colour is reflection), so its look comes from the studio.
  const chassis = keep(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#56585c"),
      metalness: 1,
      roughness: 0.3,
    }),
  );
  // The unibody uses the same metal, plus what an environment map cannot
  // give a flat surface: the gentle falloff of a nearby softbox across the
  // deck (brightest mid-deck, softer towards the edges) and the shade the
  // open display casts on the deck along the hinge. Up-facing surfaces only,
  // so the edges keep their full highlights.
  const withDeckFalloff = <T extends THREE.MeshStandardMaterial>(
    material: T,
    offsetZ = 0,
  ) => {
    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vObject;\nvarying vec3 vObjectNormal;",
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>\nvObject = position + vec3(0.0, 0.0, ${offsetZ.toFixed(4)});\nvObjectNormal = normal;`,
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vObject;\nvarying vec3 vObjectNormal;",
        )
        .replace(
          "#include <aomap_fragment>",
          /* glsl */ `#include <aomap_fragment>
          float up = smoothstep(0.7, 0.98, normalize(vObjectNormal).y);
          float pool = exp(-pow((vObject.z - 0.05) / 0.95, 2.0)) * exp(-pow(vObject.x / 2.1, 2.0));
          float hinge = 1.0 - 0.45 * exp(-pow((vObject.z + ${(baseDepth / 2).toFixed(3)}) / 0.17, 2.0));
          float falloff = mix(1.0, (0.62 + 0.5 * pool) * hinge, up);
          reflectedLight.directSpecular *= falloff;
          reflectedLight.indirectSpecular *= falloff;`,
        );
    };
    return material;
  };
  const unibody = keep(withDeckFalloff(chassis.clone()));
  // Machined edges of the openings: the same metal, cut a little smoother.
  const machined = keep(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#8d9096"),
      metalness: 1,
      roughness: 0.2,
    }),
  );
  const well = keep(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#070809"),
      metalness: 0,
      roughness: 0.9,
    }),
  );
  const keyMaterial = keep(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#111215"),
      metalness: 0,
      roughness: 0.46,
    }),
  );
  // Glass trackpad with a matte coating in the body colour.
  const trackpadMaterial = keep(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#4a4c50"),
      metalness: 0.9,
      roughness: 0.25,
    }),
  );
  const rubber = keep(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#060607"),
      metalness: 0,
      roughness: 0.92,
    }),
  );
  const portMaterial = keep(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#030304"),
      metalness: 0.2,
      roughness: 0.6,
    }),
  );
  // Cover glass over the display: black, glossy, a real (weak) mirror.
  const glass = keep(
    new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#000000"),
      metalness: 0,
      roughness: 0.05,
      ior: 1.52,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
    }),
  );
  const screenMaterial = keep(
    new THREE.ShaderMaterial({
      uniforms: {
        uPower: { value: 0 },
        uBloom: { value: 0 },
        uSize: { value: new THREE.Vector2(screenWidth, screenHeight) },
        uRadius: { value: LAPTOP.screenRadius },
        uNotch: {
          value: new THREE.Vector2(
            LAPTOP.notch.width * screenWidth,
            LAPTOP.notch.height * screenHeight,
          ),
        },
      },
      vertexShader: screenVertex,
      fragmentShader: screenFragment,
      toneMapped: false,
    }),
  );

  const group = new THREE.Group();
  group.name = "laptop";
  const top = foot + baseThickness; // the deck

  // Deck layout, back to front: hinge, keyboard well, trackpad, palm rest.
  const wellWidth = KEYBOARD_WIDTH + 0.04;
  const wellDepth = KEYBOARD_DEPTH + 0.04;
  const wellZ = -baseDepth / 2 + 0.115 + wellDepth / 2;
  const padWidth = 1.3;
  const padDepth = 0.52;
  const padZ = wellZ + wellDepth / 2 + 0.065 + padDepth / 2;
  const wellLip = openingLip(wellWidth, wellDepth, 0.02, 0.003, 0.009);
  const padLip = openingLip(padWidth, padDepth, 0.045, 0.002, 0.0006);

  // Unibody: generous plan corners, a soft rounded underside and a crisp
  // top edge (where the light draws a fine line), openings cut in the deck.
  const base = new THREE.Mesh(
    keep(
      profiledSlab(
        width,
        baseDepth,
        corner,
        slabProfile(baseThickness, 0.03, 0.0055, 10),
        {
          segments: 16,
          holes: [
            moveOutline(wellLip.outline, 0, wellZ),
            moveOutline(padLip.outline, 0, padZ),
          ],
        },
      ),
    ),
    unibody,
  );
  base.position.y = foot;
  group.add(base);

  const wellLipMesh = new THREE.Mesh(keep(wellLip.geometry), machined);
  wellLipMesh.position.set(0, top, wellZ);
  group.add(wellLipMesh);
  const wellFloorY = top - 0.012;
  const wellFloor = new THREE.Mesh(
    keep(flatRoundedRect(wellWidth - 0.006, wellDepth - 0.006, 0.017)),
    well,
  );
  wellFloor.position.set(0, wellFloorY, wellZ);
  group.add(wellFloor);
  const deck: THREE.Object3D[] = [wellFloor];

  const keyHeight = 0.016;
  const keyboard = createKeyboard(keyMaterial, keyHeight);
  keep(keyboard.geometry);
  const keyboardBack = wellZ - KEYBOARD_DEPTH / 2;
  keyboard.position.set(0, wellFloorY, keyboardBack);
  group.add(keyboard);
  deck.push(keyboard);

  // Legends on the key tops (a hair above them, so they never z-fight).
  const legendTexture =
    typeof document === "undefined" ? null : createLegendTexture();
  if (legendTexture) {
    keep(legendTexture);
    const legends = new THREE.Mesh(
      keep(new THREE.PlaneGeometry(KEYBOARD_WIDTH, KEYBOARD_DEPTH)),
      keep(
        new THREE.MeshBasicMaterial({
          map: legendTexture,
          transparent: true,
          depthWrite: false,
          opacity: 0.7,
          color: new THREE.Color("#e3e6eb"),
          // Printed legends read at their own brightness, not tone-mapped down.
          toneMapped: false,
        }),
      ),
    );
    legends.rotation.x = -Math.PI / 2;
    legends.position.set(0, wellFloorY + keyHeight + 0.0004, wellZ);
    legends.renderOrder = 1;
    group.add(legends);
    deck.push(legends);
  }

  // Speaker grilles either side of the keyboard.
  const grilleTexture =
    typeof document === "undefined" ? null : createGrilleTexture();
  if (grilleTexture) {
    keep(grilleTexture);
    const grilleWidth = 0.1;
    const grilleDepth = wellDepth;
    // 16 px tile = 1.4 mm: one hole every 0.7 mm, staggered.
    grilleTexture.repeat.set(grilleWidth / 0.014, grilleDepth / 0.014);
    const grilleMaterial = keep(
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#000000"),
        alphaMap: grilleTexture,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      }),
    );
    const grilleGeometry = keep(
      flatRoundedRect(grilleWidth, grilleDepth, 0.01),
    );
    for (const side of [-1, 1]) {
      const grille = new THREE.Mesh(grilleGeometry, grilleMaterial);
      grille.position.set(
        side * (wellWidth / 2 + (width / 2 - wellWidth / 2) / 2 - 0.004),
        top + 0.0003,
        wellZ,
      );
      grille.renderOrder = 1;
      group.add(grille);
      deck.push(grille);
    }
  }

  // Glass trackpad, flush with the deck inside a fine machined edge.
  const padLipMesh = new THREE.Mesh(keep(padLip.geometry), machined);
  padLipMesh.position.set(0, top, padZ);
  group.add(padLipMesh);
  const trackpad = new THREE.Mesh(
    keep(flatRoundedRect(padWidth - 0.004, padDepth - 0.004, 0.043)),
    trackpadMaterial,
  );
  withDeckFalloff(trackpadMaterial, padZ);
  trackpad.position.set(0, top - 0.0026, padZ);
  group.add(trackpad);
  deck.push(padLipMesh, trackpad);

  // Rubber feet near the corners.
  const footGeometry = keep(
    new THREE.CylinderGeometry(0.05, 0.056, foot, 28, 1),
  );
  for (const [x, z] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const rubberFoot = new THREE.Mesh(footGeometry, rubber);
    rubberFoot.position.set(
      x * (width / 2 - 0.26),
      foot / 2,
      z * (baseDepth / 2 - 0.22),
    );
    group.add(rubberFoot);
  }

  // Ports on both sides: a power connector, USB-C, a headphone jack on the
  // left; HDMI, USB-C and an SD slot on the right. No branding anywhere.
  const portY = foot + 0.03 + (baseThickness - 0.03 - 0.0055) / 2;
  const port = (
    side: -1 | 1,
    z: number,
    length: number,
    height: number,
    radius = height / 2,
  ) => {
    const geometry = keep(flatRoundedRect(height, length, radius));
    geometry.rotateZ(side === 1 ? -Math.PI / 2 : Math.PI / 2);
    const mesh = new THREE.Mesh(geometry, portMaterial);
    mesh.position.set(side * (width / 2 + 0.0004), portY, z);
    group.add(mesh);
  };
  port(-1, -0.6, 0.15, 0.026, 0.009);
  port(-1, -0.4, 0.083, 0.026);
  port(-1, -0.26, 0.083, 0.026);
  port(-1, 0.58, 0.036, 0.036);
  port(1, -0.55, 0.15, 0.036, 0.004);
  port(1, -0.33, 0.083, 0.026);
  port(1, 0.36, 0.24, 0.012, 0.003);

  // Hinge barrel, half sunk into the deck behind the keyboard.
  const pivotY = top + 0.017;
  const pivotZ = -baseDepth / 2 + 0.05;
  // Darker than the body: it sits in the shadow between deck and display.
  const hingeMaterial = keep(
    new THREE.MeshStandardMaterial({
      color: new THREE.Color("#25272a"),
      metalness: 0.9,
      roughness: 0.42,
    }),
  );
  const hinge = new THREE.Mesh(
    keep(new THREE.CylinderGeometry(0.031, 0.031, width - 0.52, 40, 1)),
    hingeMaterial,
  );
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, top + 0.004, pivotZ);
  group.add(hinge);
  const hingeCapGeometry = keep(
    new THREE.CylinderGeometry(0.0315, 0.0315, 0.012, 40, 1),
  );
  for (const side of [-1, 1]) {
    const cap = new THREE.Mesh(hingeCapGeometry, portMaterial);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(side * ((width - 0.52) / 2 + 0.006), top + 0.004, pivotZ);
    group.add(cap);
  }

  // Lid: a group pivoting on the hinge axis at the back of the deck.
  const lid = new THREE.Group();
  lid.name = "lid";
  lid.position.set(0, pivotY, pivotZ);
  group.add(lid);
  const lidCenterZ = 0.008 + lidHeight / 2;

  // Closed pose: the lid lies on the deck, display face down, pointing forward.
  const lidBody = new THREE.Mesh(
    keep(
      profiledSlab(
        width,
        lidHeight,
        corner,
        slabProfile(lidThickness, 0.0045, 0.014, 10),
        { segments: 16 },
      ),
    ),
    chassis,
  );
  lidBody.position.set(0, 0, lidCenterZ);
  lid.add(lidBody);

  // Display stack on the inner face: a black gasket inside the aluminium
  // rim, then the cover glass. Both face -y (towards the keys when closed).
  const gasket = new THREE.Mesh(
    keep(flatRoundedRect(width - 0.009, lidHeight - 0.009, corner - 0.0045)),
    rubber,
  );
  gasket.rotation.x = Math.PI;
  gasket.position.set(0, -0.0002, lidCenterZ);
  lid.add(gasket);
  const coverGlass = new THREE.Mesh(
    keep(flatRoundedRect(width - 0.016, lidHeight - 0.016, corner - 0.008)),
    glass,
  );
  coverGlass.rotation.x = Math.PI;
  coverGlass.position.set(0, -0.0007, lidCenterZ);
  lid.add(coverGlass);

  const chin = lidHeight - bezelTop - screenHeight;
  const screen = new THREE.Mesh(
    keep(new THREE.PlaneGeometry(screenWidth, screenHeight)),
    screenMaterial,
  );
  // PlaneGeometry faces +z; rotate so it faces -y (inner face) with image-up
  // pointing to the top bezel (far end of the closed lid).
  screen.rotation.x = Math.PI / 2;
  screen.position.set(0, -0.0011, 0.008 + chin + screenHeight / 2);
  screen.name = "display";
  lid.add(screen);

  // Camera in the notch: a dark lens with a faint ring.
  const lensZ = 0.008 + lidHeight - bezelTop * 0.62;
  const lensRing = new THREE.Mesh(
    keep(new THREE.RingGeometry(0.0075, 0.0115, 32)),
    keep(
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#1a1c22"),
        metalness: 0.6,
        roughness: 0.25,
      }),
    ),
  );
  lensRing.rotation.x = Math.PI / 2;
  lensRing.position.set(0, -0.0013, lensZ);
  lid.add(lensRing);
  const lens = new THREE.Mesh(
    keep(new THREE.CircleGeometry(0.0075, 32)),
    keep(
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#04050a"),
        roughness: 0.02,
        clearcoat: 1,
        clearcoatRoughness: 0.02,
      }),
    ),
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.set(0, -0.0013, lensZ);
  lid.add(lens);

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
    deck,
    setLidAngle,
    dispose() {
      disposables.forEach((item) => item.dispose());
      keyboard.dispose();
    },
  };
}
