import * as THREE from "three";
import { LAPTOP, type Laptop } from "./laptop";
import { radialTexture } from "./environment";
import type { CinemaState } from "./timeline";

/**
 * Explanatory light, not data. Orbit, routes and frames are abstract
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
// Thin elliptical orbit plus a soft inner pool, in plane units.
const orbitFragment = /* glsl */ `
  uniform vec2 uRadii;
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vPos;
  void main() {
    float r = length(vPos / uRadii);
    float ring = exp(-pow((r - 1.0) / 0.018, 2.0));
    float pool = exp(-r * r * 2.6) * 0.16;
    float alpha = uIntensity * (ring * 0.85 + pool);
    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`;
// Soft glowing outline of a rounded rectangle, from its signed distance.
const frameFragment = /* glsl */ `
  uniform vec2 uHalf;
  uniform float uRadius;
  uniform float uWidth;
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vPos;
  void main() {
    vec2 q = abs(vPos) - uHalf + uRadius;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - uRadius;
    float alpha = uIntensity * exp(-(d * d) / (uWidth * uWidth));
    gl_FragColor = vec4(uColor * alpha, alpha);
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
  const radii = new THREE.Vector2(2.35, 1.6);
  const orbitMaterial = shader(orbitFragment, {
    uRadii: { value: radii },
    uIntensity: { value: 0 },
    uColor: { value: COLOR.clone() },
  });
  const orbit = new THREE.Mesh(
    own(new THREE.PlaneGeometry(radii.x * 2.3, radii.y * 2.3)),
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

  // Brain — frames echo the display outline into depth behind it.
  const frames = [1, 2, 3, 4].map((step) => {
    const grow = 1 + step * 0.11;
    const half = new THREE.Vector2(
      (LAPTOP.screenWidth / 2) * grow + 0.04,
      (LAPTOP.screenHeight / 2) * grow + 0.04,
    );
    const material = shader(frameFragment, {
      uHalf: { value: half },
      uRadius: { value: 0.06 * grow },
      uWidth: { value: 0.006 + step * 0.0025 },
      uIntensity: { value: 0 },
      uColor: { value: new THREE.Color("#d4e2ff") },
    });
    const mesh = new THREE.Mesh(
      own(new THREE.PlaneGeometry(half.x * 2 + 0.4, half.y * 2 + 0.4)),
      material,
    );
    // Display-local: behind the panel is -z.
    mesh.position.z = -0.3 * step - 0.06;
    mesh.renderOrder = 1;
    laptop.screen.add(mesh);
    return { mesh, material, step };
  });
  const haloMaterial = own(
    new THREE.MeshBasicMaterial({
      map: own(
        radialTexture([
          [0, "rgba(170,200,255,0.55)"],
          [0.4, "rgba(90,130,220,0.18)"],
          [1, "rgba(40,70,150,0)"],
        ]),
      ),
      ...additive,
      opacity: 0,
    }),
  );
  const halo = new THREE.Mesh(own(new THREE.PlaneGeometry(9, 6)), haloMaterial);
  halo.position.z = -1.6;
  laptop.screen.add(halo);
  // The room darkens a little behind the portal (normal blending, not light).
  const veilMaterial = own(
    new THREE.MeshBasicMaterial({
      color: "#020304",
      transparent: true,
      depthWrite: false,
      opacity: 0,
    }),
  );
  const veil = new THREE.Mesh(
    own(new THREE.PlaneGeometry(60, 40)),
    veilMaterial,
  );
  veil.position.set(0, 2, -14);
  veil.renderOrder = -4;
  world.add(veil);

  return {
    update(s: CinemaState) {
      const { local, auto, cloud } = s.modes;
      // Faint during AUTO: Ollama remains the last resort. Off for CLOUD.
      orbitMaterial.uniforms.uIntensity.value = 0.95 * local + 0.22 * auto;
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

      const portal = s.portal;
      const showPortal = portal > 0.002;
      for (const frame of frames) {
        frame.material.uniforms.uIntensity.value =
          portal * (0.34 - frame.step * 0.06);
        frame.mesh.visible = showPortal;
      }
      haloMaterial.opacity = portal * 0.42;
      veilMaterial.opacity = portal * 0.6;
      halo.visible = veil.visible = showPortal;
    },
    dispose() {
      world.remove(routeGroup, veil);
      disposables.forEach((item) => item.dispose());
    },
  };
}
