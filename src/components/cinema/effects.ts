import * as THREE from "three";
import type { Laptop } from "./laptop";
import { radialTexture } from "./environment";
import type { CinemaState } from "./timeline";

/**
 * Explanatory light, not data. Orbit and routes are abstract
 * metaphors for the copy beside them; nothing here depicts real memories,
 * providers or traffic, and every value follows scroll time (no idle loop).
 *
 * LOCAL: an orbit of light that stays around the laptop (echoing the hero's
 *        orbits around the N): the request never leaves the device.
 * AUTO:  routes become available; the preferred one is active, and the orbit
 *        stays faintly lit because Ollama remains the last resort.
 * CLOUD: one chosen route only, reaching further out; the orbit is off.
 */
const routeVertex = /* glsl */ `
  varying float vAlong;
  varying float vFacing;
  void main() {
    vAlong = uv.x;
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    vFacing = abs(dot(n, normalize(-view.xyz)));
    gl_Position = projectionMatrix * view;
  }
`;
const routeFragment = /* glsl */ `
  uniform float uIntensity;
  uniform float uHead;
  uniform float uPulse;
  uniform vec3 uColor;
  varying float vAlong;
  varying float vFacing;
  void main() {
    float ends = smoothstep(0.0, 0.06, vAlong) * (1.0 - smoothstep(0.86, 1.0, vAlong));
    float pulse = exp(-pow((vAlong - uHead) / 0.05, 2.0)) * uPulse;
    float core = pow(vFacing, 1.4);
    float alpha = uIntensity * ends * core * (0.32 + 1.1 * pulse);
    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`;
const planeVertex = /* glsl */ `
  varying vec2 vPos;
  void main() {
    vPos = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
// Orbit of light on the floor (plane xy: x = world x, y = -world z).
// Widths are physical (distance to the ellipse), so the line keeps the same
// fineness all round; a faint echo orbit recalls the two around the hero N.
const orbitFragment = /* glsl */ `
  uniform vec2 uRadii;
  uniform float uIntensity;
  uniform float uReveal;
  varying vec2 vPos;
  float ign(vec2 p) { return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715)))); }
  // Approximate distance (world units) from vPos to an ellipse with radii r.
  float ellipse(vec2 p, vec2 r) {
    float k = length(p / r);
    vec2 g = p / (r * r) / max(k, 1e-4);
    return (k - 1.0) / max(length(g), 1e-4);
  }
  void main() {
    float d = ellipse(vPos, uRadii);
    float echo = ellipse(vPos, uRadii * 1.17);
    // Lit from the front-left like the rest of the scene; dimmer at the back.
    vec2 dir = normalize(vPos + 1e-4);
    float facing = dot(dir, normalize(vec2(-0.45, -1.0)));
    float light = mix(0.32, 1.0, smoothstep(-1.0, 0.9, facing));
    // Draws itself from the front round to the back as the chapter arrives.
    float around = acos(clamp(dot(dir, vec2(0.0, -1.0)), -1.0, 1.0)) / 3.14159265;
    float drawn = 1.0 - smoothstep(uReveal * 1.12 - 0.12, uReveal * 1.12, around);
    float core = exp(-pow(d / 0.011, 2.0));
    float halo = exp(-pow(d / 0.1, 2.0)) * 0.3;
    float echoLine = exp(-pow(echo / 0.008, 2.0)) * 0.22;
    float k = length(vPos / uRadii);
    float pool = exp(-k * k * 2.2) * 0.05;
    vec3 coreColor = vec3(0.55, 0.68, 0.98);
    vec3 haloColor = vec3(0.13, 0.25, 0.68);
    // Convert colours (not premultiplied amounts) to sRGB, then add light.
    vec3 coreOut = linearToOutputTexel(vec4(coreColor, 1.0)).rgb;
    vec3 haloOut = linearToOutputTexel(vec4(haloColor, 1.0)).rgb;
    float fade = light * drawn * uIntensity;
    vec3 color = (coreOut * (core + echoLine * drawn) + haloOut * (halo + pool)) * fade;
    float alpha = (core + halo + pool + echoLine) * fade;
    gl_FragColor = vec4(color, alpha);
    gl_FragColor.rgb += (ign(gl_FragCoord.xy) - 0.5) / 255.0;
    gl_FragColor = max(gl_FragColor, 0.0);
  }
`;
const COLOR = new THREE.Color("#a9c6ff");
/** Where routes leave the laptop: just behind the top of the open lid (laptop space). */
const ROUTE_ORIGIN = new THREE.Vector3(0, 1.93, -1.5);

export function createEffects(laptop: Laptop, world: THREE.Group) {
  const disposables: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(item: T) => {
    disposables.push(item);
    return item;
  };
  // Custom shaders output premultiplied colour: add it as is.
  const premultiplied = {
    transparent: true,
    depthWrite: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneFactor,
  } as const;
  // Gradient textures are straight alpha: weight by alpha before adding,
  // so near-transparent texels never contribute colour noise.
  const additive = {
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  } as const;
  const shader = (
    fragmentShader: string,
    uniforms: Record<string, THREE.IUniform>,
  ) =>
    own(
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: planeVertex,
        fragmentShader,
        ...premultiplied,
      }),
    );

  // LOCAL — an orbit on the floor around the laptop.
  const radii = new THREE.Vector2(2.25, 1.55);
  const orbitMaterial = shader(orbitFragment, {
    uRadii: { value: radii },
    uIntensity: { value: 0 },
    uReveal: { value: 0 },
  });
  const orbit = new THREE.Mesh(
    own(new THREE.PlaneGeometry(radii.x * 2.9, radii.y * 2.9)),
    orbitMaterial,
  );
  orbit.rotation.x = -Math.PI / 2;
  orbit.position.y = 0.004;
  orbit.renderOrder = -1;
  laptop.group.add(orbit);

  // AUTO / CLOUD — routes in world space: they always recede straight into
  // depth above the laptop, whatever its turn; only their origin follows it.
  const routeGroup = new THREE.Group();
  world.add(routeGroup);
  const endTexture = own(
    radialTexture([
      [0, "rgba(225,235,255,0.95)"],
      [0.22, "rgba(150,185,255,0.4)"],
      [1, "rgba(80,120,220,0)"],
    ]),
  );
  const routes = (
    [
      [-3.6, -0.4, -15],
      [3.4, -0.45, -15],
      [0.2, -0.2, -18],
    ] as const
  ).map(([x, y, z]) => {
    const curve = new THREE.CubicBezierCurve3(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(x * 0.05, 0.55, -2.4),
      new THREE.Vector3(x * 0.5, 0.45, z * 0.5),
      new THREE.Vector3(x, y, z),
    );
    const material = own(
      new THREE.ShaderMaterial({
        uniforms: {
          uIntensity: { value: 0 },
          uHead: { value: 0 },
          uPulse: { value: 0 },
          uColor: { value: COLOR.clone() },
        },
        vertexShader: routeVertex,
        fragmentShader: routeFragment,
        ...premultiplied,
      }),
    );
    const mesh = new THREE.Mesh(
      own(new THREE.TubeGeometry(curve, 110, 0.022, 8)),
      material,
    );
    mesh.renderOrder = 2;
    const endMaterial = own(
      new THREE.SpriteMaterial({ map: endTexture, ...additive, opacity: 0 }),
    );
    const end = new THREE.Sprite(endMaterial);
    end.position.copy(curve.getPoint(1));
    routeGroup.add(mesh, end);
    return { mesh, material, end, endMaterial };
  });
  const origin = new THREE.Vector3();

  return {
    update(s: CinemaState) {
      const { local, auto, cloud } = s.modes;
      // Faint during AUTO: Ollama remains the last resort. Off for CLOUD.
      orbitMaterial.uniforms.uIntensity.value = 0.9 * local + 0.24 * auto;
      orbitMaterial.uniforms.uReveal.value = Math.min(
        1,
        Math.max(local * 1.5, auto * 3),
      );
      orbit.visible = orbitMaterial.uniforms.uIntensity.value > 0.002;

      laptop.group.updateMatrixWorld(true);
      routeGroup.position.copy(
        laptop.group.localToWorld(origin.copy(ROUTE_ORIGIN)),
      );
      const head = (s.t * 1.35) % 1;
      routes.forEach((route, index) => {
        const preferred = index === 1;
        const intensity = preferred ? Math.max(auto, cloud) : auto * 0.5;
        route.material.uniforms.uIntensity.value = intensity * 1.5;
        route.material.uniforms.uPulse.value = preferred ? 1 : 0.2;
        route.material.uniforms.uHead.value = head;
        route.mesh.visible = intensity > 0.002;
        route.endMaterial.opacity =
          intensity * (preferred ? 0.85 + cloud * 0.15 : 0.4);
        route.end.scale.setScalar(preferred ? 0.55 + cloud * 0.75 : 0.4);
        route.end.visible = route.mesh.visible;
      });
    },
    dispose() {
      world.remove(routeGroup);
      disposables.forEach((item) => item.dispose());
    },
  };
}
