import * as THREE from "three";
import { createLaptop, LAPTOP } from "./laptop";
import { createStudioEnvironment } from "./environment";
import { createSurface } from "./surface";
import { createDirector, type Director } from "./director";
import {
  BEATS,
  LAST_BEAT,
  LIFT_FROM,
  evaluate,
  type CinemaState,
} from "./timeline";
import { createCapsule, createDisplay, type DisplayFrame } from "./display";
import { createEffects } from "./effects";
import { capsuleArt } from "./capsule-art";

const smooth = (x: number) => x * x * (3 - 2 * x);

const beat = Object.fromEntries(
  BEATS.map((name, index) => [name, index]),
) as Record<(typeof BEATS)[number], number>;
/** Time range in which anything is visible; outside it nothing renders. */
const ACTIVE_FROM = 0.2;
const ACTIVE_TO = LAST_BEAT + 0.02;

const SCREEN_CORNERS = [
  [-LAPTOP.screenWidth / 2, LAPTOP.screenHeight / 2],
  [LAPTOP.screenWidth / 2, LAPTOP.screenHeight / 2],
  [LAPTOP.screenWidth / 2, -LAPTOP.screenHeight / 2],
  [-LAPTOP.screenWidth / 2, -LAPTOP.screenHeight / 2],
] as const;

export type SceneController = {
  /** Advance one rendered frame. */
  frame(seconds: number, width: number, height: number): void;
  dispose(): void;
};

/**
 * Imperative owner of every three.js object and DOM layer of the stage. The
 * React component only hosts it, so per-frame mutation stays out of React.
 */
export function createSceneController({
  renderer,
  scene,
  camera,
  invalidate,
  sceneLayer,
  overlay,
}: {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  invalidate: () => void;
  sceneLayer: HTMLElement;
  overlay: HTMLElement;
}): SceneController {
  const root = document.documentElement;
  const disposables: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(item: T) => {
    disposables.push(item);
    return item;
  };

  // Studio: reflections, two directional lights, the surface and a soft glow.
  const environment = own(createStudioEnvironment(renderer));
  scene.environment = environment.texture;
  const hemisphere = new THREE.HemisphereLight("#f2f3f5", "#060607", 0.12);
  const key = new THREE.DirectionalLight("#fff5ec", 1.2);
  key.position.set(-3, 5, 4);
  const rim = new THREE.DirectionalLight("#eef3ff", 1.6);
  rim.position.set(4, 2.5, -4);
  const surface = own(createSurface());
  const { floor, shadow, glow } = surface;
  const laptop = createLaptop();
  own(laptop);
  const world = new THREE.Group();
  world.add(hemisphere, key, rim, floor, shadow, glow, laptop.group);
  scene.add(world);
  const effects = own(createEffects(laptop, world));

  // DOM layers above the canvas.
  // Start with the source tier the display will need at the reading beats
  // (about 43% of the viewport width), so no capture is fetched twice.
  const readingWidth = 0.43 * window.innerWidth * window.devicePixelRatio;
  const display = own(
    createDisplay(
      overlay,
      { home: 0, thinking: 0, conversation: 0, brain: beat.voice },
      readingWidth,
    ),
  );
  const capsule = own(createCapsule(overlay));
  const onImage = () => invalidate();
  overlay.addEventListener("cinema:image", onImage);

  let t = -1;
  let ready = false;
  let shownBeat = "";
  let shownMode = "";
  const vector = new THREE.Vector3();
  const quad: [number, number][] = [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ];

  // The director calls back synchronously while it first measures.
  let director: Director | undefined = undefined;
  director = own(
    createDirector(() => {
      // Skip frames while both the shown and the requested time are offstage.
      const goal = director?.target() ?? 0;
      const offstage = (value: number) =>
        value < ACTIVE_FROM || value > ACTIVE_TO;
      if (ready && offstage(goal) && offstage(t)) return;
      invalidate();
    }),
  );

  // Compile every program before the first visible frame: no mid-scroll stall.
  // Without parallel compilation, compile once up front (still before any frame).
  let cancelled = false;
  const compiled = renderer.extensions.has("KHR_parallel_shader_compile")
    ? renderer.compileAsync(scene, camera)
    : Promise.resolve(renderer.compile(scene, camera));
  compiled
    .catch(() => {})
    .then(() => {
      if (cancelled) return;
      ready = true;
      invalidate();
      requestAnimationFrame(() => {
        if (!cancelled) root.dataset.cinemaReady = "";
      });
    });

  /** Scroll position of timeline time t, from the measured chapter anchors. */
  function scrollAt(t: number) {
    const anchors = director?.anchors() ?? [];
    if (anchors.length < 2) return 0;
    const k = Math.max(0, Math.min(anchors.length - 2, Math.floor(t)));
    return anchors[k] + (t - k) * (anchors[k + 1] - anchors[k]);
  }
  function liftAt(t: number) {
    return t > LIFT_FROM ? scrollAt(t) - scrollAt(LIFT_FROM) : 0;
  }

  function placeCamera(s: CinemaState, width: number, height: number) {
    const aspect = width / height;
    const halfV = THREE.MathUtils.degToRad(camera.fov / 2);
    const halfH = Math.atan(Math.tan(halfV) * aspect);
    const { focus, fill, azimuth, elevation, shiftX, shiftY } = s.camera;
    // Distance that gives the display the requested share of the viewport
    // width, without letting it outgrow the height (navigation and captions
    // need room on wide, short screens).
    const distance = Math.max(
      LAPTOP.screenWidth / (2 * Math.tan(halfH) * fill),
      LAPTOP.screenHeight / (2 * Math.tan(halfV) * Math.min(fill * 1.25, 0.46)),
    );
    camera.position.set(
      focus[0] + distance * Math.cos(elevation) * Math.sin(azimuth),
      focus[1] + distance * Math.sin(elevation),
      focus[2] + distance * Math.cos(elevation) * Math.cos(azimuth),
    );
    camera.lookAt(focus[0], focus[1], focus[2]);
    // Lens shift composes the subject without keystoning it. After the Brain
    // moment the scene also moves up exactly as far as the page has scrolled
    // since LIFT_FROM, so it leaves with its caption (no text over the screen).
    camera.setViewOffset(
      width,
      height,
      (-shiftX * width) / 2,
      (shiftY * height) / 2 + liftAt(s.t),
      width,
      height,
    );
    camera.updateMatrixWorld();
  }

  /** Writes the last projected `vector` into `target` as CSS pixels. */
  function toScreen(width: number, height: number, target: [number, number]) {
    target[0] = ((vector.x + 1) / 2) * width;
    target[1] = ((1 - vector.y) / 2) * height;
    return target;
  }
  // Per-frame scratch, reused: the frame loop allocates nothing of its own.
  const capsuleLeft: [number, number] = [0, 0];
  const capsuleRight: [number, number] = [0, 0];
  const capsuleCenter: [number, number] = [0, 0];
  const displayFrame: DisplayFrame = {
    t: 0,
    quad: null,
    weights: { home: 1, thinking: 0, conversation: 0, brain: 0 },
    opacity: 0,
    dim: 0,
    dpr: 1,
  };
  let shownStage = "";
  let shownDocked = false;
  // The capsule's resting slot, in document coordinates (layout offsets,
  // measured on resize: never per frame).
  const slot = document.querySelector<HTMLElement>("main .cinema-capsule-slot");
  const slotBox = { x: 0, y: 0, width: 0, height: 0 };
  const measureSlot = () => {
    if (!slot) return;
    let x = 0;
    let y = 0;
    for (
      let node: HTMLElement | null = slot;
      node;
      node = node.offsetParent as HTMLElement | null
    ) {
      x += node.offsetLeft;
      y += node.offsetTop;
    }
    // The capsule sits at the slot's left edge, vertically centred.
    Object.assign(slotBox, {
      x,
      y,
      width: capsuleArt.width,
      height: slot.offsetHeight,
    });
    invalidate();
  };
  const slotObserver = new ResizeObserver(measureSlot);
  slotObserver.observe(document.body);
  window.addEventListener("resize", measureSlot, { passive: true });
  measureSlot();
  let shownActive: boolean | null = null;

  function apply(s: CinemaState, width: number, height: number) {
    const active = s.stage > 0.001;
    const stageOpacity = s.stage.toFixed(3);
    if (stageOpacity !== shownStage)
      sceneLayer.style.opacity = shownStage = stageOpacity;
    if (active !== shownActive) {
      shownActive = active;
      sceneLayer.style.visibility = active ? "visible" : "hidden";
    }

    const pose = s.laptop;
    laptop.group.visible = active;
    laptop.group.position.set(pose.x, pose.y, pose.z);
    laptop.group.rotation.set(pose.pitch, pose.yaw, 0, "YXZ");
    laptop.setLidAngle(pose.lid);
    laptop.screenMaterial.uniforms.uPower.value = s.power;
    laptop.screenMaterial.uniforms.uBloom.value = s.bloom;
    const light = s.presence * s.body;
    scene.environmentIntensity = light ** 1.4;
    key.intensity = 1.2 * light ** 2;
    rim.intensity = 1.6 * Math.min(1, light * 1.8);
    shadow.position.set(pose.x, 0.001 + Math.min(0, pose.y), pose.z);
    shadow.rotation.z = pose.yaw;
    surface.update(light, s.presence * Math.max(0, 1 + pose.y * 1.5), s.portal);

    effects.update(s);
    placeCamera(s, width, height);
    laptop.group.updateMatrixWorld(true);

    // Project the display corners for the DOM captures.
    let quadOk = active && s.display > 0.001;
    if (quadOk) {
      for (let index = 0; index < 4; index++) {
        const corner = SCREEN_CORNERS[index];
        vector
          .set(corner[0], corner[1], 0)
          .applyMatrix4(laptop.screen.matrixWorld)
          .project(camera);
        if (vector.z <= -1 || vector.z >= 1) quadOk = false;
        toScreen(width, height, quad[index]);
      }
    }
    displayFrame.t = s.t;
    displayFrame.quad = quadOk ? quad : null;
    displayFrame.weights = s.screens;
    displayFrame.opacity = s.display;
    displayFrame.dim = s.dim;
    displayFrame.dpr = window.devicePixelRatio;
    display.update(displayFrame);

    // The voice capsule rises out of the display's composer, then settles in
    // its slot under the shortcut in the voice chapter, where a DOM copy
    // takes over and scrolls with the text (no per-frame tracking at rest).
    const c = s.capsule;
    const docked = active && c >= 1;
    if (docked !== shownDocked) {
      shownDocked = docked;
      if (docked) slot?.setAttribute("data-docked", "");
      else slot?.removeAttribute("data-docked");
    }
    if (active && c > 0 && c < 1 && slot) {
      // Out of the screen first (display-local z), then across to the slot.
      const depth = 1.1 * smooth(Math.min(1, c / 0.35));
      const v = -LAPTOP.screenHeight * 0.3;
      const halfWidth = 0.55;
      const matrix = laptop.screen.matrixWorld;
      const projectInto = (x: number, target: [number, number]) => {
        vector.set(x, v, depth).applyMatrix4(matrix).project(camera);
        toScreen(width, height, target);
      };
      projectInto(-halfWidth, capsuleLeft);
      projectInto(halfWidth, capsuleRight);
      projectInto(0, capsuleCenter);
      const fromWidth = Math.hypot(
        capsuleRight[0] - capsuleLeft[0],
        capsuleRight[1] - capsuleLeft[1],
      );
      const b = smooth(Math.min(1, Math.max(0, (c - 0.2) / 0.8)));
      const slotX = slotBox.x + slotBox.width / 2;
      const slotY = slotBox.y + slotBox.height / 2 - window.scrollY;
      // A shallow arc, so the move reads as placed rather than dragged.
      capsuleCenter[0] += (slotX - capsuleCenter[0]) * b;
      capsuleCenter[1] +=
        (slotY - capsuleCenter[1]) * b - Math.sin(Math.PI * b) * 18;
      // Inherits the display's turn as it leaves, then faces the viewer.
      const tilt = ((pose.yaw * 180) / Math.PI) * (1 - b);
      capsule.update(
        capsuleCenter,
        fromWidth + (capsuleArt.width - fromWidth) * b,
        Math.min(1, c * 6),
        tilt,
      );
    } else capsule.update(null, 0, 0);

    // The existing mode accents follow the chapter in focus (writes on change).
    const { local, auto, cloud } = s.modes;
    const mode =
      local >= 0.5
        ? "local"
        : auto >= 0.5
          ? "auto"
          : cloud >= 0.5
            ? "cloud"
            : "";
    if (mode !== shownMode) {
      shownMode = mode;
      document.querySelectorAll<HTMLElement>(".mode").forEach((element) => {
        element.dataset.modeActive = String(
          element.classList.contains(`mode-${mode}`),
        );
      });
    }
    const name = BEATS[Math.min(LAST_BEAT, Math.max(0, Math.round(s.t)))];
    if (name !== shownBeat) {
      shownBeat = name;
      root.dataset.cinemaNow = name;
    }
  }

  // Read-only counters for tests: proves frames stop when nothing changes.
  const stats = {
    frames: 0,
    t: 0,
    goal: 0,
    screen: quad,
    /** Scroll position of every beat, as the director measured it. */
    anchors: () => director?.anchors() ?? [],
  };
  const still =
    process.env.NODE_ENV !== "production" &&
    new URLSearchParams(location.search).has("still");
  // The still keeps only the laptop and its contact shadow (page provides the room).
  if (still) floor.visible = glow.visible = false;
  (window as Window & { __nanoCinema?: typeof stats }).__nanoCinema = stats;

  return {
    frame(seconds, width, height) {
      if (!ready || !director) return;
      const goal = director.target();
      t = t < 0 ? goal : director.follow(t, goal, Math.min(seconds, 1 / 30));
      if (t !== goal) invalidate();
      const s = evaluate(t);
      if (process.env.NODE_ENV !== "production" && still) {
        // Dev-only product still (scripts/render-laptop-still.mjs): open,
        // centred, fronto-parallel display, panel showing the app background.
        Object.assign(s.laptop, {
          x: 0,
          y: 0,
          z: 0,
          yaw: 0,
          pitch: 0,
          lid: LAPTOP.openAngle,
        });
        Object.assign(s.camera, {
          fill: 0.4,
          azimuth: 0,
          elevation: LAPTOP.openAngle - Math.PI / 2,
          shiftX: 0,
          shiftY: 0.16,
        });
        s.camera.focus[1] = 1.09;
        s.camera.focus[2] = -1.18;
        Object.assign(s, {
          stage: 1,
          presence: 1,
          body: 1,
          power: 1,
          bloom: 0,
          display: 0.002,
          capsule: 0,
          portal: 0,
        });
        Object.assign(s.modes, { local: 0, auto: 0, cloud: 0 });
      }
      apply(s, width, height);
      stats.frames++;
      stats.t = t;
      stats.goal = goal;
    },
    dispose() {
      cancelled = true;
      slotObserver.disconnect();
      window.removeEventListener("resize", measureSlot);
      slot?.removeAttribute("data-docked");
      overlay.removeEventListener("cinema:image", onImage);
      scene.remove(world);
      scene.environment = null;
      disposables.forEach((item) => item.dispose());
      delete (window as Window & { __nanoCinema?: unknown }).__nanoCinema;
      delete root.dataset.cinemaReady;
      delete root.dataset.cinemaNow;
    },
  };
}
