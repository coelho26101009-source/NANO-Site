import * as THREE from "three";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { waterfallSlab } from "./geometry";
import { LAPTOP } from "./laptop";

/**
 * The table: one sheet of smoked glass, 15 mm thick, bent into a waterfall
 * at both ends: a 50 cm glass bench. The laptop rests near its front-right
 * corner, a centimetre from the front edge, with the right-hand bend just
 * beside it and the left one a little further (clear of the copy column).
 * Coordinates are the laptop's: the table turns with it, as if the camera
 * orbited a still set.
 */
export const TABLE = {
  thickness: 0.15,
  radius: 0.42,
  height: 7.4,
  edge: 0.014,
  /** Front edge, a centimetre in front of the laptop. */
  front: LAPTOP.baseDepth / 2 + 0.1,
  depth: 3.9,
  /** Where the right-hand bend starts, just past the laptop's side. */
  right: LAPTOP.width / 2 + 0.16,
  left: -(LAPTOP.width / 2 + 0.6),
} as const;
const TABLE_Z = TABLE.front - TABLE.depth / 2;

/**
 * Smoked glass as light actually behaves in it: what is behind is absorbed
 * along the path through the sheet (Beer–Lambert: thin and clear seen
 * face-on, nearly black at grazing angles and through the polished edges),
 * and the surface adds its Fresnel reflection of the studio on top. The
 * shader writes premultiplied colour, so the page behind is darkened by the
 * absorption only and never tinted by the reflection.
 */
function createGlassMaterial() {
  const uniforms = {
    uThickness: { value: TABLE.thickness },
    uSigma: { value: 7.5 },
    uGlow: { value: new THREE.Color(0, 0, 0) },
  };
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#000000"),
    metalness: 0,
    roughness: 0.035,
    transparent: true,
    depthWrite: false,
    dithering: true,
    opacity: 0,
  });
  material.blending = THREE.CustomBlending;
  material.blendSrc = THREE.OneFactor;
  material.blendDst = THREE.OneMinusSrcAlphaFactor;
  material.blendSrcAlpha = THREE.OneFactor;
  material.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float aEdge;\nvarying float vEdge;\nvarying vec3 vLocal;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvEdge = aEdge;\nvLocal = position;",
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform float uThickness;\nuniform float uSigma;\nuniform vec3 uGlow;\nvarying float vEdge;\nvarying vec3 vLocal;",
      )
      .replace(
        "#include <opaque_fragment>",
        /* glsl */ `
        // Path length through the sheet: thickness over the cosine of the
        // view angle on its faces; the whole depth through its edges.
        float cosV = abs(dot(normalize(normal), normalize(vViewPosition)));
        float path = mix(uThickness / max(cosV, 0.05), 3.0, vEdge);
        float absorbed = 1.0 - exp(-uSigma * path);
        // LOCAL: light from under the laptop travels inside the glass and
        // leaves through the polished front edge, brightest nearest to it.
        float near = exp(-pow(vLocal.x / 1.9, 2.0));
        outgoingLight += uGlow * vEdge * near;
        gl_FragColor = vec4(outgoingLight, absorbed * opacity);
        `,
      )
      .replace(
        "#include <premultiplied_alpha_fragment>",
        "gl_FragColor.rgb *= opacity;",
      );
  };
  // One program for every table (the uniforms are shared by reference).
  material.customProgramCacheKey = () => "nano-smoked-glass";
  return { material, uniforms };
}

/**
 * Planar reflection of the laptop in the table top: the mirrored scene at a
 * third of the resolution, weighted by Fresnel (a mirror at grazing angles,
 * faint seen from above) and composited over the glass, so the mirrored
 * laptop occludes the studio reflection behind it as in a real photograph.
 */
const reflectionShader = {
  name: "NanoGlassReflection",
  uniforms: {
    color: { value: null },
    tDiffuse: { value: null },
    textureMatrix: { value: null },
    uStrength: { value: 0 },
  },
  vertexShader: /* glsl */ `
    uniform mat4 textureMatrix;
    varying vec4 vUv;
    varying vec3 vWorld;
    varying vec2 vPos;
    void main() {
      vUv = textureMatrix * vec4(position, 1.0);
      vec4 world = modelMatrix * vec4(position, 1.0);
      vWorld = world.xyz;
      vPos = position.xy;
      gl_Position = projectionMatrix * viewMatrix * world;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uStrength;
    varying vec4 vUv;
    varying vec3 vWorld;
    varying vec2 vPos;
    float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
    void main() {
      vec2 uv = vUv.xy / vUv.w;
      // Polished glass: sharp at contact, a touch softer further away (one
      // trilinear tap: this plane is shaded at full resolution, so extra
      // taps cost more than the whole mirror pass on software renderers).
      // vPos of the laptop's centre: the plane is centred on the table top.
      vec2 laptop = vec2(${(-(TABLE.left + TABLE.right) / 2).toFixed(4)}, ${TABLE_Z.toFixed(4)});
      float far = clamp(length(vPos - laptop) / 3.0, 0.0, 1.0);
      vec4 c = texture2D(tDiffuse, uv, 0.25 + 0.6 * far);
      vec3 view = normalize(cameraPosition - vWorld);
      float f = 0.04 + 0.96 * pow(1.0 - clamp(view.y, 0.0, 1.0), 5.0);
      float k = f * uStrength;
      // The target holds linear, premultiplied light (no output transform).
      vec3 lit = c.rgb;
      #ifdef TONE_MAPPING
        lit = toneMapping(lit);
      #endif
      lit = linearToOutputTexel(vec4(lit, 1.0)).rgb;
      lit += (ign(gl_FragCoord.xy) - 0.5) / 255.0;
      gl_FragColor = vec4(max(lit, 0.0) * k, c.a * k);
    }
  `,
};

export function createGlassTable(hidden: () => THREE.Object3D[]) {
  const group = new THREE.Group();
  group.name = "glass-table";
  const geometry = waterfallSlab({
    left: TABLE.left,
    right: TABLE.right,
    thickness: TABLE.thickness,
    radius: TABLE.radius,
    height: TABLE.height,
    depth: TABLE.depth,
    edge: TABLE.edge,
  });
  const { material, uniforms } = createGlassMaterial();
  const sheet = new THREE.Mesh(geometry, material);
  sheet.position.z = TABLE_Z;
  sheet.renderOrder = -3;
  group.add(sheet);

  const topWidth = TABLE.right - TABLE.left;
  const topDepth = TABLE.depth - TABLE.edge * 2;
  const reflector = new Reflector(new THREE.PlaneGeometry(topWidth, topDepth), {
    textureWidth: 512,
    textureHeight: 512,
    clipBias: 0.002,
    multisample: 0,
    shader: reflectionShader,
  });
  reflector.rotation.x = -Math.PI / 2;
  reflector.position.set((TABLE.left + TABLE.right) / 2, 0.0004, TABLE_Z);
  reflector.renderOrder = -2;
  const reflection = reflector.material as THREE.ShaderMaterial;
  reflection.transparent = true;
  reflection.depthWrite = false;
  reflection.blending = THREE.CustomBlending;
  reflection.blendSrc = THREE.OneFactor;
  reflection.blendDst = THREE.OneMinusSrcAlphaFactor;
  reflection.blendSrcAlpha = THREE.OneFactor;
  reflection.blendDstAlpha = THREE.OneMinusSrcAlphaFactor;
  reflection.toneMapped = true;
  group.add(reflector);

  // Only the laptop (and distant lights) are mirrored: never the glass
  // itself, the backdrop, the contact shadow, light effects on the glass or
  // the deck parts that the base hides from a view below it.
  const render = reflector.onBeforeRender;
  reflector.onBeforeRender = function (...args) {
    const objects = hidden();
    const was = objects.map((object) => object.visible);
    objects.forEach((object) => (object.visible = false));
    sheet.visible = false;
    render.apply(this, args);
    sheet.visible = true;
    objects.forEach((object, index) => (object.visible = was[index]));
  };

  const target = reflector.getRenderTarget();
  target.texture.generateMipmaps = true;
  target.texture.minFilter = THREE.LinearMipmapLinearFilter;
  return {
    group,
    sheet,
    /**
     * Table presence 0–1, reflection strength, LOCAL edge light (0–1),
     * the laptop's footprint centre and turn, drawing-buffer size.
     */
    update(
      presence: number,
      reflect: number,
      glow: number,
      x: number,
      z: number,
      yaw: number,
      width: number,
      height: number,
    ) {
      group.visible = presence > 0.002;
      group.position.set(x, 0, z);
      group.rotation.set(0, yaw, 0);
      material.opacity = presence;
      uniforms.uGlow.value.setRGB(0.1, 0.2, 0.62).multiplyScalar(glow * 0.9);
      reflection.uniforms.uStrength.value = reflect * presence;
      reflector.visible = presence * reflect > 0.002;
      // A third of the resolution: the extra pass stays cheap even on
      // software renderers; the reflection is a thin band anyway.
      const w = Math.max(64, Math.round(width / 3));
      const h = Math.max(64, Math.round(height / 3));
      if (target.width !== w || target.height !== h) target.setSize(w, h);
    },
    dispose() {
      reflector.dispose();
      reflector.geometry.dispose();
      geometry.dispose();
      material.dispose();
    },
  };
}
