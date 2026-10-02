"use client";

import { createRoot, useFrame, useThree } from "@react-three/fiber";
import { Component, useEffect, useRef, type ReactNode } from "react";
import * as THREE from "three";
import type { StageProps } from "./loader";
import { createSceneController, type SceneController } from "./scene";

type Layers = { sceneLayer: HTMLElement; overlay: HTMLElement };

// R3F 9.8 still constructs one THREE.Clock (deprecated in three r183): an
// upstream skew with nothing to act on here. Every other message passes.
THREE.setConsoleFunction((level, message, ...params) => {
  if (
    level === "warn" &&
    String(message).startsWith("THREE.Clock: This module has been deprecated")
  )
    return;
  (console[level as "log" | "warn" | "error"] ?? console.log)(
    message,
    ...params,
  );
});

/** Thin R3F component: the controller owns all mutable three.js state. */
function Scene({ layers }: { layers: Layers }) {
  const { gl, scene, camera, invalidate } = useThree();
  const controller = useRef<SceneController | null>(null);
  useEffect(() => {
    const instance = createSceneController({
      renderer: gl,
      scene,
      camera: camera as THREE.PerspectiveCamera,
      invalidate: () => invalidate(),
      ...layers,
    });
    controller.current = instance;
    return () => {
      controller.current = null;
      instance.dispose();
    };
  }, [gl, scene, camera, invalidate, layers]);
  useFrame((state, delta) =>
    controller.current?.frame(delta, state.size.width, state.size.height),
  );
  return null;
}

class SceneBoundary extends Component<
  { onFail: StageProps["onFail"]; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail("scene-error");
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Hosts React Three Fiber through `createRoot` rather than `<Canvas>`:
 * `<Canvas>` registers the entire THREE namespace for JSX elements, which
 * defeats tree-shaking, and this scene declares no JSX elements at all. A
 * fresh canvas per mount also keeps StrictMode remounts and teardown clean.
 */
export default function CinemaStage({ onFail }: StageProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const sceneLayer = sceneRef.current;
    const overlay = overlayRef.current;
    if (!host || !sceneLayer || !overlay) return;
    const canvas = document.createElement("canvas");
    canvas.className = "cinema-canvas";
    host.append(canvas);
    const root = createRoot(canvas);
    let alive = true;
    const lost = (event: Event) => {
      event.preventDefault();
      if (alive) onFail("context-lost");
    };
    canvas.addEventListener("webglcontextlost", lost);
    let created = false;
    const configure = () =>
      root.configure({
        size: {
          width: host.clientWidth,
          height: host.clientHeight,
          top: 0,
          left: 0,
        },
        frameloop: "demand",
        dpr: [1, 1.5],
        gl: {
          antialias: true,
          alpha: true,
          stencil: false,
          powerPreference: "high-performance",
        },
        camera: { fov: 30, near: 0.1, far: 80, position: [0, 2, 8] },
        onCreated: ({ gl }) => {
          if (created) return;
          created = true;
          gl.toneMapping = THREE.NeutralToneMapping;
          gl.toneMappingExposure = 1;
          gl.setClearColor(0x000000, 0);
          // Synchronous shader status checks stall the GPU; dev builds keep them.
          gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
        },
      });
    configure()
      .then(() => {
        if (!alive) return;
        root.render(
          <SceneBoundary onFail={onFail}>
            <Scene layers={{ sceneLayer, overlay }} />
          </SceneBoundary>,
        );
      })
      .catch(() => {
        if (alive) onFail("renderer-error");
      });
    const resize = new ResizeObserver(() => {
      if (alive) void configure();
    });
    resize.observe(host);
    return () => {
      // Intentional teardown: R3F forces a context loss that is not a failure.
      alive = false;
      resize.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      root.unmount();
      canvas.remove();
    };
  }, [onFail]);

  return (
    <div className="cinema-scene" ref={sceneRef}>
      <div className="cinema-host" ref={hostRef} />
      <div className="cinema-overlay" ref={overlayRef} />
    </div>
  );
}
