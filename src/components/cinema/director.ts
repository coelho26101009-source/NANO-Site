import { BEATS, LAST_BEAT } from "./timeline";

/**
 * Maps the native scroll position to timeline time `t`.
 *
 * Chapter positions are measured only when layout can change (resize, fonts,
 * late images), never per frame, so scrolling costs one array lookup and no
 * forced layout. The browser keeps full control of scrolling: nothing here
 * listens to wheel or touch, prevents default, or snaps.
 */
export type Director = {
  /** Target time for the current scroll position. */
  target(): number;
  /** Ease `current` towards `target`; returns the next value. */
  follow(current: number, target: number, seconds: number): number;
  /** Chapter scroll positions, for tests and debugging. */
  anchors(): number[];
  dispose(): void;
};

const MIN_GAP = 40;

export function createDirector(onChange: () => void): Director {
  let anchors: number[] = BEATS.map((_, index) => index * 1000);

  const measure = () => {
    const viewport = window.innerHeight;
    const measured = BEATS.map((beat, index) => {
      if (index === 0) return 0;
      const element = document.querySelector<HTMLElement>(
        `main [data-cinema-beat="${beat}"]`,
      );
      if (!element) return Number.NaN;
      // Layout position, not getBoundingClientRect: entrance transforms
      // (reveals) must not move a chapter's beat.
      let top = 0;
      for (
        let node: HTMLElement | null = element;
        node;
        node = node.offsetParent as HTMLElement | null
      )
        top += node.offsetTop;
      // The final beat is reached as the next section settles near the top.
      if (index === LAST_BEAT) return top - viewport * 0.35;
      // Top-aligned chapters reach their beat when their copy sits at 20%.
      if (element.dataset.cinemaAlign === "start") return top - viewport * 0.2;
      return top + element.offsetHeight / 2 - viewport / 2;
    });
    // Missing chapters inherit a position; order is kept strictly increasing.
    for (let index = 1; index < measured.length; index++) {
      if (!Number.isFinite(measured[index]))
        measured[index] = measured[index - 1] + MIN_GAP;
      measured[index] = Math.max(
        measured[index],
        measured[index - 1] + MIN_GAP,
      );
    }
    anchors = measured;
    onChange();
  };

  const target = () => {
    const y = window.scrollY;
    if (y <= anchors[0]) return 0;
    for (let index = 1; index < anchors.length; index++) {
      if (y <= anchors[index]) {
        const from = anchors[index - 1];
        return index - 1 + (y - from) / (anchors[index] - from);
      }
    }
    return LAST_BEAT + (y - anchors[LAST_BEAT]) / window.innerHeight;
  };

  const follow = (current: number, goal: number, seconds: number) => {
    const distance = goal - current;
    // Anchor jumps, Home/End and refreshes land directly on their frame.
    if (Math.abs(distance) > 1.5) return goal;
    if (Math.abs(distance) < 0.0004) return goal;
    // Critically damped approach (~110 ms): softens wheel steps, never lags far.
    return current + distance * (1 - Math.exp(-seconds * 9));
  };

  const resize = new ResizeObserver(measure);
  resize.observe(document.body);
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener("load", measure);
  document.fonts?.ready.then(measure).catch(() => {});
  measure();

  return {
    target,
    follow,
    anchors: () => anchors,
    dispose() {
      resize.disconnect();
      window.removeEventListener("scroll", onChange);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    },
  };
}
