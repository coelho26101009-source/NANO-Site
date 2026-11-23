import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

/**
 * The laptop rests on dark glass: a real, softened reflection of the scene
 * (rendered from the mirrored camera at half resolution, then blurred and
 * faded with distance from the laptop), plus a faint cool sheen at grazing
 * angles. It adds light only (premultiplied, additive), so the floor, the
 * contact shadow and the page behind never get darker or change colour.
 */
const glassShader = {
  name: "NanoGlass",
  uniforms: {
    color: { value: null },
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    uStrength: { value: 0 },
    uTexel: { value: new THREE.Vector2(1 / 512, 1 / 512) },
    uReach: { value: new THREE.Vector2(2.4, 1.9) },
  },
  vertexShader: /* glsl */ `
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    varying vec2 vPos;
    void main() {
      vUv = textureMatrix * vec4(position, 1.0);
      vPos = position.xy;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uStrength;
    uniform vec2 uTexel;
    uniform vec2 uReach;
    varying vec4 vUv;
    varying vec2 vPos;
    float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
    void main() {
      vec2 uv = vUv.xy / vUv.w;
      // Soft blur from the mip chain (no sparse taps, so no ghost copies of
      // bright edges), a little softer further from the laptop: glass
      // reflections lose focus with distance.
      float bias = 1.0 + 1.6 * clamp(length(vPos / uReach), 0.0, 1.5);
      vec2 o = uTexel * exp2(bias) * 0.9;
      vec4 c = texture2D(tDiffuse, uv, bias) * 0.4;
      c += texture2D(tDiffuse, uv + vec2(o.x, o.y * 0.5), bias) * 0.15;
      c += texture2D(tDiffuse, uv - vec2(o.x, o.y * 0.5), bias) * 0.15;
      c += texture2D(tDiffuse, uv + vec2(-o.x * 0.5, o.y), bias) * 0.15;
      c += texture2D(tDiffuse, uv - vec2(-o.x * 0.5, o.y), bias) * 0.15;
      // Fades out smoothly around the laptop: no visible edge to the glass.
      // In front of the deck it fades within a few centimetres, so only the
      // contact reflection shows, never long mirrored streaks of the lid.
      float k = length(vPos / uReach);
      float front = max(0.0, -vPos.y - 0.98);
      float side = max(0.0, abs(vPos.x) - 1.56);
      float fade = exp(-k * k * 1.6) * exp(-pow(front / 0.32, 2.0)) * exp(-pow(side / 0.22, 2.0));
      // The render target is premultiplied; add a share of it as light.
      // Linear scene light (the target skips the output transform): tone it
      // gently, then convert to the page's sRGB like every other layer.
      vec3 lit = c.rgb / (1.0 + c.rgb);
      vec3 reflection = linearToOutputTexel(vec4(lit, 1.0)).rgb * fade * uStrength;
      // Faint cool sheen towards the back, like a glass top catching the room.
      float sheen = exp(-pow((vPos.y - 1.25) * 0.85, 2.0)) * exp(-pow(vPos.x * 0.32, 2.0));
      vec3 color = reflection + vec3(0.010, 0.014, 0.022) * sheen * uStrength * 2.2;
      color += (ign(gl_FragCoord.xy) - 0.5) / 255.0;
      gl_FragColor = vec4(max(color, 0.0), 0.0);
    }
  `,
};

export function createGlass(
  hidden: () => THREE.Object3D[],
  size = new THREE.Vector2(1024, 1024),
) {
  const reflector = new Reflector(new THREE.PlaneGeometry(7.5, 6), {
    textureWidth: size.x,
    textureHeight: size.y,
    clipBias: 0.002,
    multisample: 0,
    shader: glassShader,
  });
  reflector.rotation.x = -Math.PI / 2;
  reflector.position.y = 0.0005;
  reflector.renderOrder = -1;
  const material = reflector.material as THREE.ShaderMaterial;
  material.transparent = true;
  material.depthWrite = false;
  material.blending = THREE.CustomBlending;
  material.blendSrc = THREE.OneFactor;
  material.blendDst = THREE.OneFactor;
  material.toneMapped = false;

  // The floor, contact shadow and glow are not part of what the glass
  // reflects: only the laptop (and its light) is mirrored.
  const render = reflector.onBeforeRender;
  reflector.onBeforeRender = function (...args) {
    const objects = hidden();
    const was = objects.map((object) => object.visible);
    objects.forEach((object) => (object.visible = false));
    render.apply(this, args);
    objects.forEach((object, index) => (object.visible = was[index]));
  };

  const target = reflector.getRenderTarget();
  // Mipmaps give the blur its smooth, wide footprint for a few taps.
  target.texture.generateMipmaps = true;
  target.texture.minFilter = THREE.LinearMipmapLinearFilter;
  const texel = material.uniforms.uTexel.value as THREE.Vector2;
  return {
    mesh: reflector,
    /** Strength 0–1, laptop footprint centre and turn, drawing-buffer size. */
    update(
      strength: number,
      x: number,
      z: number,
      yaw: number,
      width: number,
      height: number,
    ) {
      material.uniforms.uStrength.value = strength;
      reflector.visible = strength > 0.002;
      reflector.position.x = x;
      reflector.position.z = z;
      reflector.rotation.z = yaw;
      // A third of the resolution: the reflection is blurred anyway, and the
      // extra pass stays cheap even on software renderers.
      const w = Math.max(64, Math.round(width / 3));
      const h = Math.max(64, Math.round(height / 3));
      if (target.width !== w || target.height !== h) {
        target.setSize(w, h);
        texel.set(1 / w, 1 / h);
      }
    },
    dispose() {
      reflector.dispose();
      reflector.geometry.dispose();
    },
  };
}
