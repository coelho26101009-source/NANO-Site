import * as THREE from "three";
import { LAPTOP } from "./laptop";

/**
 * The studio around the glass table: a soft gradient sweep behind the set
 * (dark above, pale graphite below the table top, like a lit cyclorama),
 * the laptop's contact shadow and the low glow behind it. All three are
 * analytic shaders rather than gradient textures: an 8-bit gradient
 * stretched across metres posterizes into visible blotches, while a falloff
 * computed per pixel in float, then dithered, stays perfectly smooth at any
 * size and costs no download.
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

// Backdrop sweep, a vertical plane behind the set; local xy = world xy
// relative to the plane. Premultiplied light added over the page: it lifts
// the background where the smoked glass needs something to darken (the
// reference studio's pale lower half), and stays dark where the copy sits.
const backdropFragment = /* glsl */ `
  uniform float uLight;
  uniform float uCenter;
  uniform float uBase;
  uniform vec3 uColor;
  varying vec2 vPos;
  ${dither}
  void main() {
    // Brightest a little below the table top, fading upwards and to the sides.
    float y = vPos.y + uBase; // world height
    float rise = exp(-pow(max(y + 1.2, 0.0) / 2.5, 2.0));
    float fall = exp(-pow(min(y + 1.2, 0.0) / 6.0, 2.0));
    float x = (vPos.x - uCenter) / 4.6;
    float spread = exp(-x * x);
    float light = rise * fall * spread * uLight;
    gl_FragColor = dithered(linearToOutputTexel(vec4(uColor, 1.0)) * light);
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

/** The sweep hangs behind the set; its plane is centred at this height. */
const BACKDROP_Y = 1.5;
const BACKDROP_Z = -6.5;

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

  const backdropMaterial = material(
    backdropFragment,
    {
      uLight: { value: 0 },
      uCenter: { value: 0 },
      uBase: { value: BACKDROP_Y },
      uColor: { value: new THREE.Color(0.045, 0.048, 0.055) },
    },
    {
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
    },
  );
  const backdrop = new THREE.Mesh(
    own(new THREE.PlaneGeometry(44, 26)),
    backdropMaterial,
  );
  backdrop.position.set(0, BACKDROP_Y, BACKDROP_Z);
  backdrop.renderOrder = -5;

  const shadowMaterial = material(shadowFragment, {
    uHalf: { value: new THREE.Vector2(LAPTOP.width / 2, LAPTOP.baseDepth / 2) },
    uRadius: { value: LAPTOP.corner },
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
    backdrop,
    shadow,
    glow,
    /**
     * Studio light (0–1), contact-shadow opacity, the Brain backlight (0–1)
     * and the laptop's x (the sweep is centred a little to its right).
     */
    update(light: number, shadowOpacity: number, backlight: number, x: number) {
      backdropMaterial.uniforms.uLight.value = light;
      backdropMaterial.uniforms.uCenter.value = x + 1.0;
      backdrop.visible = light > 0.002;
      shadowMaterial.uniforms.uOpacity.value = shadowOpacity;
      glowMaterial.uniforms.uIntensity.value = 0.11 + 0.12 * backlight;
    },
    dispose() {
      disposables.forEach((item) => item.dispose());
    },
  };
}
