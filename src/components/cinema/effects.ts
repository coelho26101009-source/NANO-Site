import * as THREE from "three";
import type { Laptop } from "./laptop";
import { radialTexture } from "./environment";
import { TABLE } from "./glass";
import { LAPTOP } from "./laptop";
import type { CinemaState } from "./timeline";

/**
 * Explanatory light, not data: soft, abstract metaphors for the copy beside
 * them. No lines, rings or moving pulses; every value follows scroll time
 * (no idle loop), and every change is a slow fade.
 *
 * LOCAL: light rises from under the laptop through the glass, as if the
 *        machine itself were glowing: the request never leaves the device.
 * AUTO:  that light dims (Ollama stays the last resort) while a few distant,
 *        out-of-focus lights appear behind: the available providers, the
 *        preferred one a little brighter.
 * CLOUD: only the chosen distant light remains, larger; the glass goes dark.
 */
const planeVertex = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
// Light under the glass (plane xy: x = world x, y = -world z). Pure
// gaussians: brightest under the deck, falling off with no edge at all.
const poolFragment = /* glsl */ `
  uniform vec2 uHalf;
  uniform vec4 uEdges;
  uniform float uIntensity;
  uniform float uSpread;
  varying vec2 vPos;
  float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
  void main() {
    // Distance outside the laptop's footprint (rounded rectangle).
    vec2 q = abs(vPos) - uHalf + 0.25;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.25;
    float near = exp(-pow(max(d, 0.0) / (0.7 * uSpread), 2.0));
    float wide = exp(-pow(max(d + 0.6, 0.0) / (1.9 * uSpread), 2.0));
    vec3 inner = linearToOutputTexel(vec4(0.46, 0.62, 1.0, 1.0)).rgb;
    vec3 outer = linearToOutputTexel(vec4(0.10, 0.20, 0.58, 1.0)).rgb;
    // Only inside the glass (front edge, right bend, left bend, back edge).
    // The front edge and the right bend sit right beside the laptop and keep
    // a crisp cut, as real glass ends there. The far sides fade out well
    // before the glass ends, so the light never reaches a straight edge and
    // never spills past the table into the empty studio.
    float inside = smoothstep(-0.02, 0.02, vPos.y + uEdges.x)
      * (1.0 - smoothstep(-0.06, 0.02, vPos.x - uEdges.y))
      * smoothstep(0.0, 0.55, vPos.x - uEdges.z)
      * (1.0 - smoothstep(-0.9, 0.0, vPos.y - uEdges.w));
    vec3 color = (inner * near * 0.2 + outer * wide * 0.3) * uIntensity * inside;
    color += (ign(gl_FragCoord.xy) - 0.5) / 255.0;
    gl_FragColor = vec4(max(color, 0.0), 0.0);
  }
`;
/** Distant lights for AUTO / CLOUD, relative to the laptop's position. */
const LIGHTS = [
  { at: [-3.4, 2.2, -9], size: 2.6, preferred: false },
  { at: [3.1, 2.9, -10], size: 3.2, preferred: true },
  { at: [0.4, 3.6, -13], size: 2.2, preferred: false },
] as const;

export function createEffects(laptop: Laptop, world: THREE.Group) {
  const disposables: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  // LOCAL — light under the glass, following the laptop.
  const poolMaterial = own(
    new THREE.ShaderMaterial({
      uniforms: {
        uHalf: {
          value: new THREE.Vector2(LAPTOP.width / 2, LAPTOP.baseDepth / 2),
        },
        uEdges: {
          value: new THREE.Vector4(
            TABLE.front,
            TABLE.right,
            TABLE.left,
            TABLE.depth - TABLE.front,
          ),
        },
        uIntensity: { value: 0 },
        uSpread: { value: 1 },
      },
      vertexShader: planeVertex,
      fragmentShader: poolFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      toneMapped: false,
    }),
  );
  const pool = new THREE.Mesh(own(new THREE.PlaneGeometry(9, 7)), poolMaterial);
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.003;
  pool.renderOrder = -1;
  laptop.group.add(pool);

  // AUTO / CLOUD — soft out-of-focus lights in the distance (bokeh-like).
  const group = new THREE.Group();
  world.add(group);
  const texture = own(
    radialTexture([
      [0, "rgba(205,222,255,0.55)"],
      [0.18, "rgba(150,182,255,0.32)"],
      [0.5, "rgba(90,130,230,0.1)"],
      [1, "rgba(60,100,210,0)"],
    ]),
  );
  const lights = LIGHTS.map((light) => {
    const material = own(
      new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        opacity: 0,
      }),
    );
    const sprite = new THREE.Sprite(material);
    sprite.position.set(light.at[0], light.at[1], light.at[2]);
    sprite.renderOrder = -2;
    group.add(sprite);
    return { ...light, sprite, material };
  });

  return {
    /** Light under the glass: never mirrored by it. */
    pool,
    /** Returns the LOCAL light's strength, which the glass edge carries too. */
    update(s: CinemaState) {
      const { local, auto, cloud } = s.modes;
      const light = s.presence;
      // Faint during AUTO: Ollama remains the last resort. Off for CLOUD.
      const glow = (0.85 * local + 0.22 * auto) * light;
      poolMaterial.uniforms.uIntensity.value = glow;
      // Spreads out slowly as the chapter arrives.
      poolMaterial.uniforms.uSpread.value = 0.75 + 0.35 * Math.min(1, local);
      pool.visible = glow > 0.002;

      group.position.set(s.laptop.x, 0, s.laptop.z);
      for (const item of lights) {
        const strength = item.preferred
          ? Math.max(auto * 0.75, cloud)
          : auto * 0.45 * (1 - cloud);
        item.material.opacity = strength * light;
        item.sprite.visible = item.material.opacity > 0.002;
        item.sprite.scale.setScalar(
          item.size * (item.preferred ? 1 + cloud * 0.45 : 1),
        );
      }
      return glow;
    },
    dispose() {
      world.remove(group);
      laptop.group.remove(pool);
      disposables.forEach((item) => item.dispose());
    },
  };
}
