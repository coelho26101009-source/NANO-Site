import * as THREE from "three";
import { LAPTOP } from "./laptop";

/**
 * The surface the laptop rests on, its contact shadow and the low glow
 * behind it. All three are analytic shaders rather than gradient textures:
 * an 8-bit gradient stretched across metres of floor posterizes into visible
 * blotches, while a falloff computed per pixel in float, then dithered,
 * stays perfectly smooth at any size and costs no download.
 */

// Interleaved gradient noise (Jimenez 2014): ±0.5/255 per channel, after the
// sRGB conversion, removes banding in dark gradients without visible grain.
const dither = /* glsl */ `
  float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
  vec4 dithered(vec4 color) {
    float n = ign(gl_FragCoord.xy) - 0.5;
    return vec4(color.rgb + n / 255.0, color.a + n / 255.0);
  }
`;
const planeVertex = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
/** Straight-alpha output, blended normally (linear colours in, sRGB out). */
const output = /* glsl */ `
  gl_FragColor = vec4(color, alpha);
  #include <colorspace_fragment>
  gl_FragColor = dithered(gl_FragColor);
`;

// Floor plane, local xy: x = world x, y = -world z (the plane lies flat).
const floorFragment = /* glsl */ `
  uniform float uLight;
  varying vec2 vPos;
  ${dither}
  void main() {
    // Broad pool of light around the subject, slightly elongated in depth.
    float pool = exp(-dot(vPos * vec2(0.24, 0.3), vPos * vec2(0.24, 0.3)) * 2.2);
    // Soft sheen behind the laptop: the overhead softbox in a satin floor.
    vec2 s = (vPos - vec2(-0.4, 1.6)) * vec2(0.22, 0.85);
    float sheen = exp(-dot(s, s) * 2.0);
    // Linear colours: page background #0b0d10, lifted towards cool graphite.
    vec3 base = vec3(0.0033, 0.0040, 0.0052);
    vec3 lit = vec3(0.0125, 0.0140, 0.0175);
    vec3 color = mix(base, lit, pool * uLight) + vec3(0.010, 0.012, 0.016) * sheen * uLight;
    // Fade to transparent long before the plane edge: no visible horizon line.
    float alpha = smoothstep(11.0, 3.5, length(vPos * vec2(1.0, 1.25)));
    ${output}
  }
`;

// Contact shadow, local xy in the laptop footprint (rounded-rectangle SDF).
const shadowFragment = /* glsl */ `
  uniform vec2 uHalf;
  uniform float uRadius;
  uniform float uOpacity;
  varying vec2 vPos;
  ${dither}
  void main() {
    vec2 q = abs(vPos) - uHalf + uRadius;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
    // Tight occlusion where the chassis meets the floor, then a wide penumbra.
    float core = 1.0 - smoothstep(-0.02, 0.05, d);
    float penumbra = exp(-max(d, 0.0) * 3.4) * (1.0 - smoothstep(-0.6, 0.0, d) * 0.15);
    float alpha = clamp(core * 0.55 + penumbra * 0.5, 0.0, 0.92) * uOpacity;
    vec3 color = vec3(0.0);
    ${output}
  }
`;

// Low glow behind the subject: premultiplied, added to what is behind.
const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vPos;
  ${dither}
  void main() {
    vec2 p = vPos * vec2(0.19, 0.29);
    float glow = exp(-dot(p, p) * 3.0) * uIntensity;
    // Convert the colour, then scale: converting premultiplied amounts to
    // sRGB would inflate a faint glow.
    gl_FragColor = dithered(linearToOutputTexel(vec4(uColor, 1.0)) * glow);
  }
`;

export function createSurface() {
  const disposables: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(item: T) => {
    disposables.push(item);
    return item;
  };
  const material = (
    fragmentShader: string,
    uniforms: Record<string, THREE.IUniform>,
    blending: Partial<THREE.ShaderMaterialParameters> = {},
  ) =>
    own(
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: planeVertex,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        ...blending,
      }),
    );

  const floorMaterial = material(floorFragment, { uLight: { value: 1 } });
  const floor = new THREE.Mesh(
    own(new THREE.PlaneGeometry(26, 26)),
    floorMaterial,
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.002;
  floor.renderOrder = -3;

  const shadowMaterial = material(shadowFragment, {
    uHalf: { value: new THREE.Vector2(LAPTOP.width / 2, LAPTOP.baseDepth / 2) },
    uRadius: { value: 0.13 },
    uOpacity: { value: 1 },
  });
  const shadow = new THREE.Mesh(
    own(new THREE.PlaneGeometry(LAPTOP.width + 1.6, LAPTOP.baseDepth + 1.6)),
    shadowMaterial,
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.renderOrder = -2;

  const glowMaterial = material(
    glowFragment,
    {
      uColor: { value: new THREE.Color("#4d72c4") },
      uIntensity: { value: 0.16 },
    },
    {
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
    },
  );
  const glow = new THREE.Mesh(
    own(new THREE.PlaneGeometry(13, 8)),
    glowMaterial,
  );
  glow.position.set(0.4, 1.4, -5.5);
  glow.renderOrder = -4;

  return {
    floor,
    shadow,
    glow,
    /** Scene light (0–1) and contact-shadow opacity for this frame. */
    update(light: number, shadowOpacity: number) {
      floorMaterial.uniforms.uLight.value = light;
      shadowMaterial.uniforms.uOpacity.value = shadowOpacity;
    },
    dispose() {
      disposables.forEach((item) => item.dispose());
    },
  };
}
