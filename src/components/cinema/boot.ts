/**
 * Runs in <head> before first paint. It only makes the cheap decision of
 * whether the cinematic layout may be used, so the CSS can lay the page out
 * once, without a shift. WebGL is probed later, off the critical path; any
 * failure switches back to the regular site (`data-cinema="off"`).
 *
 * `?cinema=0` always shows the regular site. `?cinema=1` skips the
 * power/data heuristics (for QA on software renderers) but never the
 * viewport, reduced-motion or WebGL requirements.
 */
export const CINEMA_QUERY =
  "(min-width: 1100px) and (min-height: 620px) and (prefers-reduced-motion: no-preference)";
export const CINEMA_STORAGE_KEY = "nano-cinema-unsupported-until";

export const cinemaBootScript = `(function(){try{var d=document.documentElement,m=/[?&]cinema=([01])\\b/.exec(location.search),f=m&&m[1];if(f==="0")return;var n=navigator,c=n.connection,forced=f==="1",ok=matchMedia(${JSON.stringify(CINEMA_QUERY)}).matches&&"WebGL2RenderingContext" in window&&(forced||(matchMedia("(pointer: fine)").matches&&!(c&&c.saveData)&&!(n.deviceMemory&&n.deviceMemory<4)&&!(n.hardwareConcurrency&&n.hardwareConcurrency<4)&&!(Number(localStorage.getItem(${JSON.stringify(CINEMA_STORAGE_KEY)}))>Date.now())));if(ok){d.dataset.cinema="on";if(forced)d.dataset.cinemaForced=""}}catch(e){}})()`;
