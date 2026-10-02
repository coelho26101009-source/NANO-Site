"use client";

import {
  Component,
  useCallback,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { CINEMA_QUERY, CINEMA_STORAGE_KEY } from "./boot";

export type StageProps = {
  /** The scene could not run (context loss, renderer error): use the 2D site. */
  onFail: (reason: string) => void;
};

const SOFTWARE_RENDERER =
  /swiftshader|llvmpipe|softpipe|software|basic render|warp/i;

/** One short-lived WebGL2 context: availability and a software-renderer check. */
function probeWebGL(forced: boolean) {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: !forced,
      powerPreference: "high-performance",
    });
    if (!gl) return "webgl2-unavailable";
    let renderer = String(gl.getParameter(gl.RENDERER));
    // Chrome masks RENDERER; Firefox exposes it and deprecates the extension.
    if (/^webkit webgl$/i.test(renderer)) {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      if (info)
        renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    if (!forced && SOFTWARE_RENDERER.test(renderer)) return "software-renderer";
    return null;
  } catch {
    return "webgl2-error";
  }
}

/** Where each cinematic beat lives in the regular layout. */
const REGULAR_TARGET: Record<string, string> = {
  intro: "#produto",
  home: ".showcase-track",
  thinking: ".showcase-track",
  conversation: ".showcase-track",
  voice: ".showcase-track",
  modes: "#modos",
  local: ".mode-local",
  auto: ".mode-auto",
  cloud: ".mode-cloud",
  brain: "#brain",
  portal: ".brain-figure",
  exit: ".brain-details",
  end: ".capabilities",
};
const GALLERY_STEP: Record<string, number> = {
  home: 0,
  thinking: 1,
  conversation: 2,
  voice: 3,
};

/**
 * Cinematic → regular: land on the same content, whenever CSS reflowed (on a
 * resize the media query has already switched the layout before this runs).
 * The stage publishes the beat on screen; the gallery even shows the capture
 * the reader was looking at.
 */
function keepBeat(change: () => void) {
  const beat = document.documentElement.dataset.cinemaNow;
  const atTop = window.scrollY < 2;
  change();
  const target =
    beat && !atTop
      ? document.querySelector<HTMLElement>(REGULAR_TARGET[beat])
      : null;
  if (!target) return;
  const step = GALLERY_STEP[beat!];
  const runway =
    step === undefined
      ? 0
      : parseFloat(getComputedStyle(target, "::after").height) || 0;
  if (runway > 0) {
    // Sticky gallery (wide screens): its scroll position selects the capture.
    const top = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top - 112 + runway * (step / 4 + 0.03),
      behavior: "instant",
    });
    return;
  }
  target.scrollIntoView({ block: "start", behavior: "instant" });
  if (step !== undefined)
    target.dispatchEvent(
      new CustomEvent("nano:showcase-step", { detail: step }),
    );
}

/** Regular → cinematic: keep the section the reader is in at the same place. */
function keepReadingPosition(change: () => void) {
  const sections = [
    ...document.querySelectorAll<HTMLElement>("main > section"),
  ];
  const anchor = sections.find(
    (section) => section.getBoundingClientRect().bottom > 120,
  );
  const before = anchor?.getBoundingClientRect().top ?? 0;
  const progress =
    anchor && anchor.offsetHeight > 0
      ? Math.max(0, -before) / anchor.offsetHeight
      : 0;
  change();
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const target =
    before >= 0 ? rect.top - before : rect.top + progress * anchor.offsetHeight;
  window.scrollBy({ top: target, behavior: "instant" });
}

class StageBoundary extends Component<
  { onFail: (reason: string) => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail("render-error");
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Progressive enhancement only. The server HTML is the complete regular site;
 * this island decides, after load and off the critical path, whether the 3D
 * stage may run, then code-splits it in. Every failure returns to 2D.
 */
export function CinemaLoader() {
  const [Stage, setStage] = useState<ComponentType<StageProps> | null>(null);

  const fail = useCallback((reason: string) => {
    const root = document.documentElement;
    if (root.dataset.cinema !== "on") return;
    if (!("cinemaForced" in root.dataset)) {
      try {
        // Remember for a week so the next visit lays out in 2D from the start.
        localStorage.setItem(
          CINEMA_STORAGE_KEY,
          String(Date.now() + 7 * 24 * 3600 * 1000),
        );
      } catch {}
    }
    keepBeat(() => {
      root.dataset.cinema = "off";
      root.dataset.cinemaReason = reason;
      delete root.dataset.cinemaReady;
    });
    setStage(null);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const eligible = window.matchMedia(CINEMA_QUERY);
    // Only a page that qualified at first paint may switch back in later.
    const wasOn = root.dataset.cinema === "on";
    let cancelled = false;
    let idle = 0;
    let timer = 0;
    let started = false;

    const start = () => {
      if (started || cancelled || root.dataset.cinema !== "on") return;
      started = true;
      // Creating the first WebGL context costs ~100 ms (GPU process start-up),
      // so it waits for an idle moment after load, like the 3D code itself.
      // At the top of the page both layouts are identical, so returning to
      // the regular site here does not shift anything in view.
      const problem = probeWebGL("cinemaForced" in root.dataset);
      if (problem) return fail(problem);
      import("./stage")
        .then((module) => {
          if (!cancelled && root.dataset.cinema === "on")
            setStage(() => module.default);
        })
        .catch(() => fail("chunk-error"));
    };
    const schedule = () => {
      const run = () => {
        // Safari before 18 has no requestIdleCallback.
        if (typeof window.requestIdleCallback === "function")
          idle = window.requestIdleCallback(start, { timeout: 1500 });
        else timer = window.setTimeout(start, 200);
      };
      if (document.readyState === "complete") run();
      else window.addEventListener("load", run, { once: true });
    };
    // Viewport or motion preference changes switch between the two layouts.
    const onChange = () => {
      if (eligible.matches && root.dataset.cinema === undefined && wasOn) {
        keepReadingPosition(() => (root.dataset.cinema = "on"));
        schedule();
      } else if (!eligible.matches && root.dataset.cinema === "on") {
        keepBeat(() => {
          delete root.dataset.cinema;
          delete root.dataset.cinemaReady;
        });
        started = false;
        setStage(null);
      }
    };
    if (wasOn) schedule();
    eligible.addEventListener("change", onChange);
    return () => {
      cancelled = true;
      eligible.removeEventListener("change", onChange);
      if (idle) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, [fail]);

  return (
    <div className="cinema-stage" aria-hidden="true">
      {Stage && (
        <StageBoundary onFail={fail}>
          <Stage onFail={fail} />
        </StageBoundary>
      )}
    </div>
  );
}
