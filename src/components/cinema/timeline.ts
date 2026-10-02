/**
 * The cinematic sequence as a pure function of one number, `t`.
 *
 * Each beat is a DOM chapter (data-cinema-beat). `t = k` when beat k's chapter
 * is centred in the viewport; fractional values lie between two chapters.
 * Nothing here reads the DOM or time, so any scroll position (slow, fast,
 * backwards, anchor jump, reload) always produces the same frame.
 */
export const BEATS = [
  "hero",
  "intro",
  "home",
  "thinking",
  "conversation",
  "voice",
  "modes",
  "local",
  "auto",
  "cloud",
  "brain",
  "portal",
  "exit",
  "end",
] as const;
export type Beat = (typeof BEATS)[number];
const at = Object.fromEntries(
  BEATS.map((beat, index) => [beat, index]),
) as Record<Beat, number>;

type Ease = (x: number) => number;
const smooth: Ease = (x) => x * x * (3 - 2 * x);
const gentle: Ease = (x) => 0.5 - Math.cos(Math.PI * x) / 2;
const out: Ease = (x) => 1 - (1 - x) ** 3;
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** A key: [time, value, easing of the segment that arrives at this key]. */
type Key = readonly [number, number, Ease?];

// Runs ~40 times per frame: indexed access only, since array destructuring
// would allocate iterator objects on every call.
function track(keys: Key[]) {
  return (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let index = 1; index < keys.length; index++) {
      const key = keys[index];
      if (t <= key[0]) {
        const previous = keys[index - 1];
        const ease = key[2] ?? smooth;
        return (
          previous[1] +
          (key[1] - previous[1]) *
            ease((t - previous[0]) / (key[0] - previous[0] || 1))
        );
      }
    }
    return keys[keys.length - 1][1];
  };
}
/** Fade up across [a, b], hold, fade down across [c, d]. */
function span(a: number, b: number, c: number, d: number, peak = 1) {
  return track([
    [a, 0],
    [b, peak],
    [c, peak],
    [d, 0],
  ]);
}

const deg = Math.PI / 180;

// Laptop pose (world space; the laptop's origin is the centre of its base).
// Arrival: from deep, low and turned away, it travels forward into the light.
// Exit: after the Brain moment holds, the pose stays as it is and the whole
// scene scrolls away with the page (`lift`), the caption keeping its place
// under the display, then fades: no text ever crosses the screen.
const HOLD = at.portal + 0.12;
const GONE = at.exit - 0.2;
const laptopX = track([
  [at.hero + 0.3, 1.4],
  [at.intro, 0, out],
  [HOLD, 0],
]);
const laptopY = track([
  [at.hero + 0.3, -1.3],
  [at.intro, 0, out],
  [HOLD, 0],
]);
const laptopZ = track([
  [at.hero + 0.3, -12],
  [at.intro, 0, out],
  [at.cloud, 0],
  [at.cloud + 0.5, -0.35],
  [at.brain, 0],
  [HOLD, 0],
]);
const yaw = track([
  [at.hero + 0.3, -96 * deg],
  [at.intro, -34 * deg, out],
  [at.home, -15 * deg],
  [at.thinking, -12 * deg],
  [at.conversation, -10 * deg],
  [at.voice, -17 * deg],
  [at.modes, -24 * deg],
  [at.cloud, -27 * deg],
  [at.brain, -9 * deg],
  [at.portal, -2 * deg],
  [HOLD, -2 * deg],
]);
const pitch = track([
  [at.hero + 0.3, 16 * deg],
  [at.intro, 0, out],
]);
/** Hinge angle: closed until the intro, then a believable open. */
const lid = track([
  [at.intro - 0.02, 0],
  [at.intro + 0.82, 104 * deg, gentle],
]);

// Camera: orbit around a world focus point, distance solved from `fill`.
const focusY = track([
  [at.intro, 0.5],
  [at.home, 0.98],
  [at.voice, 0.98],
  [at.modes, 0.85],
  [at.brain, 1.0],
  [at.portal, 1.1],
  [HOLD, 1.1],
]);
const focusZ = track([
  [at.intro, -0.25],
  [at.home, -1.05],
  [at.voice, -1.05],
  [at.modes, -0.75],
  [at.brain, -1.1],
  [at.portal, -1.19],
  [HOLD, -1.19],
]);
/** Apparent display width as a fraction of the viewport width. */
const fill = track([
  [at.hero, 0.32],
  [at.intro, 0.33],
  [at.home, 0.4],
  [at.thinking, 0.43],
  [at.conversation, 0.43],
  [at.voice, 0.39],
  [at.modes, 0.33],
  [at.auto, 0.31],
  [at.cloud, 0.28],
  [at.brain, 0.41],
  [at.portal, 0.52, gentle],
]);
const azimuth = track([
  [at.hero, 0],
  [at.cloud, 4 * deg],
  [at.brain, 0],
]);
const elevation = track([
  [at.hero, 9 * deg],
  [at.intro, 9 * deg],
  [at.home, 11 * deg],
  [at.conversation, 9 * deg],
  [at.voice, 12 * deg],
  [at.modes, 12 * deg],
  [at.local, 12 * deg],
  [at.auto, 8 * deg],
  [at.cloud, 6 * deg],
  [at.brain, 10 * deg],
  [at.portal, 1.5 * deg],
]);
/** Where the focus point sits on screen, in NDC (lens shift, no keystone). */
const shiftX = track([
  [at.hero, 0.36],
  [at.home, 0.33],
  [at.voice, 0.38],
  [at.modes, 0.36],
  [at.brain, 0.33],
  [at.portal, 0, gentle],
  [HOLD, 0],
]);
const shiftY = track([
  [at.hero, -0.1],
  [at.intro, -0.08],
  [at.home, 0.06],
  [at.modes, 0.05],
  [at.portal, 0.21],
]);

// Light and display.
const presence = track([
  [at.hero + 0.3, 0],
  [at.intro - 0.2, 1, out],
]);
/** Laptop body light: the room settles a little so the Brain capture leads. */
const body = track([
  [at.brain, 1],
  [at.portal - 0.15, 0.6],
]);
const power = track([
  [at.intro + 0.35, 0],
  [at.intro + 0.85, 1],
]);
/** Soft blue-white bloom as the panel powers on; never on the way out. */
const bloom = track([
  [at.intro + 0.3, 0],
  [at.intro + 0.58, 1],
  [at.intro + 0.95, 0.12],
]);
const display = track([
  [at.intro + 0.72, 0],
  [at.home - 0.08, 1],
]);
const dim = track([
  [at.voice + 0.6, 0],
  [at.modes, 0.3],
  [at.cloud, 0.4],
  [at.brain - 0.4, 0],
]);
// Screen crossfades: each weight is the share of that capture on the display.
const thinking = span(
  at.home + 0.42,
  at.home + 0.72,
  at.thinking + 0.42,
  at.thinking + 0.72,
);
const conversation = span(
  at.thinking + 0.42,
  at.thinking + 0.72,
  at.cloud + 0.35,
  at.cloud + 0.8,
);
const brainScreen = track([
  [at.cloud + 0.35, 0],
  [at.cloud + 0.8, 1],
]);
/** 0 inside the display, 1 settled in its slot under the voice copy. */
const capsule = track([
  [at.conversation + 0.45, 0],
  [at.voice - 0.08, 1, gentle],
]);
const local = span(
  at.modes + 0.4,
  at.local - 0.1,
  at.local + 0.55,
  at.auto - 0.05,
);
const auto = span(
  at.local + 0.45,
  at.auto - 0.1,
  at.auto + 0.55,
  at.cloud - 0.05,
);
const cloud = span(
  at.auto + 0.45,
  at.cloud - 0.1,
  at.cloud + 0.4,
  at.brain - 0.3,
);
/** The Brain moment: a calm, even backlight rises behind the laptop. */
const portal = track([
  [at.brain + 0.15, 0],
  [at.portal - 0.1, 1],
]);
/** Time from which the scene scrolls with the page (see `lift` in scene.ts). */
export const LIFT_FROM = at.portal;

// The stage fades while it scrolls away, still lit: never a black cut-out,
// and gone before the Brain details arrive.
const stage = track([
  [at.hero + 0.25, 0],
  [at.hero + 0.6, 1],
  [HOLD + 0.25, 1],
  [GONE, 0, gentle],
]);

export type CinemaState = {
  t: number;
  stage: number;
  presence: number;
  /** Light on the chassis (the display keeps its own). */
  body: number;
  laptop: {
    x: number;
    y: number;
    z: number;
    yaw: number;
    pitch: number;
    lid: number;
  };
  camera: {
    focus: [number, number, number];
    fill: number;
    azimuth: number;
    elevation: number;
    shiftX: number;
    shiftY: number;
  };
  power: number;
  bloom: number;
  display: number;
  dim: number;
  screens: {
    home: number;
    thinking: number;
    conversation: number;
    brain: number;
  };
  /** 0 inside the display, 1 settled in its slot under the voice copy. */
  capsule: number;
  modes: { local: number; auto: number; cloud: number };
  portal: number;
};

/** One state object, rewritten each frame: the sequence allocates nothing. */
const state: CinemaState = {
  t: 0,
  stage: 0,
  presence: 0,
  body: 1,
  laptop: { x: 0, y: 0, z: 0, yaw: 0, pitch: 0, lid: 0 },
  camera: {
    focus: [0, 0, 0],
    fill: 0.4,
    azimuth: 0,
    elevation: 0,
    shiftX: 0,
    shiftY: 0,
  },
  power: 0,
  bloom: 0,
  display: 0,
  dim: 0,
  screens: { home: 1, thinking: 0, conversation: 0, brain: 0 },
  capsule: 0,
  modes: { local: 0, auto: 0, cloud: 0 },
  portal: 0,
};

/** The frame for time `t`. The returned object is reused by the next call. */
export function evaluate(t: number): CinemaState {
  const s = state;
  s.t = t;
  s.stage = stage(t);
  s.presence = presence(t);
  s.body = body(t);
  s.laptop.x = laptopX(t);
  s.laptop.y = laptopY(t);
  s.laptop.z = laptopZ(t);
  s.laptop.yaw = yaw(t);
  s.laptop.pitch = pitch(t);
  s.laptop.lid = lid(t);
  s.camera.focus[1] = focusY(t);
  s.camera.focus[2] = focusZ(t);
  s.camera.fill = fill(t);
  s.camera.azimuth = azimuth(t);
  s.camera.elevation = elevation(t);
  s.camera.shiftX = shiftX(t);
  s.camera.shiftY = shiftY(t);
  s.power = power(t);
  s.bloom = bloom(t);
  s.display = display(t);
  s.dim = dim(t);
  const thinkingWeight = thinking(t);
  const conversationWeight = conversation(t);
  const brainWeight = brainScreen(t);
  s.screens.home = clamp01(
    1 - thinkingWeight - conversationWeight - brainWeight,
  );
  s.screens.thinking = thinkingWeight;
  s.screens.conversation = conversationWeight;
  s.screens.brain = brainWeight;
  s.capsule = capsule(t);
  s.modes.local = local(t);
  s.modes.auto = auto(t);
  s.modes.cloud = cloud(t);
  s.portal = portal(t);
  return s;
}

export const LAST_BEAT = BEATS.length - 1;
