"use client";

import { useEffect, useRef } from "react";

/**
 * The page background: slow dark smoke that leans towards the pointer, with a
 * film grain on top. Adapted from Simão's personal site, tinted NANO blue and
 * kept almost black. Drawn at half resolution (a third on small screens), one
 * frame only with reduced motion, paused while the tab is hidden. Without
 * WebGL, or on a software renderer, the CSS gradient on `.backdrop` stays.
 */
const VERTEX = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
const FRAGMENT = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.02;a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 q=uv*vec2(r.x/r.y,1.)*1.6;
float s=t*.035;vec2 w=vec2(fbm(q+s),fbm(q+vec2(5.2,1.3)-s));
float f=fbm(q+2.2*w+vec2(s*.6,0.));
float d=distance(uv,m);float glow=smoothstep(.65,0.,d);
vec3 c=vec3(.012,.013,.018)+vec3(.042,.058,.098)*pow(f,2.2)+vec3(.03,.06,.14)*glow*f;
c*=1.-.45*length(uv-.5);
gl_FragColor=vec4(c,1.);}`;

const SOFTWARE_RENDERER =
  /swiftshader|llvmpipe|softpipe|software|basic render|warp/i;

export function Backdrop() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // Created here, never in the server HTML: no canvas until JavaScript runs.
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return;
    // A software renderer would draw this on the CPU at every frame: keep the
    // CSS gradient instead (`?smoke=1` forces it, for checks on such machines).
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(
      gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER),
    );
    if (
      SOFTWARE_RENDERER.test(renderer) &&
      !/[?&]smoke=1\b/.test(location.search)
    ) {
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return;
    }

    const shader = (type: number, source: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return s;
    };
    const vs = shader(gl.VERTEX_SHADER, VERTEX);
    const fs = shader(gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const position = gl.getAttribLocation(program, "p");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(program, "r");
    const uT = gl.getUniformLocation(program, "t");
    const uM = gl.getUniformLocation(program, "m");

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => {
      const scale = innerWidth < 700 ? 0.34 : 0.5;
      canvas.width = Math.max(1, Math.floor(innerWidth * scale));
      canvas.height = Math.max(1, Math.floor(innerHeight * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uR, canvas.width, canvas.height);
    };
    const mouse = { x: 0.72, y: 0.62, tx: 0.72, ty: 0.62 };
    const start = performance.now();
    const draw = () => {
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      gl.uniform1f(uT, still ? 18 : (performance.now() - start) / 1000);
      gl.uniform2f(uM, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const onPointer = (event: PointerEvent) => {
      mouse.tx = event.clientX / innerWidth;
      mouse.ty = 1 - event.clientY / innerHeight;
    };

    let frame = 0;
    const loop = () => {
      draw();
      frame = requestAnimationFrame(loop);
    };
    const run = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) loop();
    };
    const onResize = () => {
      resize();
      if (still) draw();
    };

    host.prepend(canvas);
    resize();
    draw();
    requestAnimationFrame(() => {
      canvas.dataset.on = "true";
    });
    addEventListener("resize", onResize);
    if (!still) {
      addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("visibilitychange", run);
      run();
    }
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", run);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, []);

  return (
    <div ref={hostRef} className="backdrop" aria-hidden="true">
      <div className="backdrop-grain" />
    </div>
  );
}
