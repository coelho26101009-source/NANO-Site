import type { Copy } from "@/content/i18n";
import { Eyebrow, Lines } from "./ui";

type Mood = "listening" | "thinking" | "happy";

const INK = "#12203A";
const CHEEK = "#8DB8FF";

/**
 * Nubi, NANO's mascot. The same drawing as the app
 * (Nano_Assistant/frontend/components/Nubi.tsx), drawn inline so it stays
 * sharp at any size and needs no extra download.
 */
function Nubi({ mood, id }: { mood: Mood; id: string }) {
  const fill = `nubi-fill-${id}`;
  return (
    <svg className={`nubi nubi--${mood}`} viewBox="0 0 240 240" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={fill} gradientUnits="userSpaceOnUse" cx="96" cy="86" r="170">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".5" stopColor="#EDF4FF" />
          <stop offset="1" stopColor="#5B9BFF" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="226" rx="60" ry="6" fill="#000" opacity=".35" />
      <g className="nubi__body" fill={`url(#${fill})`}>
        <circle cx="84" cy="88" r="36" />
        <circle cx="148" cy="78" r="42" />
        <ellipse cx="120" cy="146" rx="94" ry="72" />
      </g>
      <ellipse cx="74" cy="164" rx="11" ry="6" fill={CHEEK} opacity=".6" />
      <ellipse cx="166" cy="164" rx="11" ry="6" fill={CHEEK} opacity=".6" />
      {mood === "listening" && (
        <>
          <Eye x={96} y={144} rx={10} ry={15} />
          <Eye x={144} y={144} rx={10} ry={15} />
          <ellipse cx="120" cy="170" rx="6" ry="5" fill={INK} />
          <g className="nubi__waves" fill="none" stroke="#7FD3CB" strokeWidth="5" strokeLinecap="round">
            <path d="M224 128 Q233 148 224 168" />
            <path d="M236 116 Q250 148 236 180" opacity=".6" />
            <path d="M16 128 Q7 148 16 168" />
            <path d="M4 116 Q-10 148 4 180" opacity=".6" />
          </g>
        </>
      )}
      {mood === "thinking" && (
        <>
          <Eye x={100} y={136} rx={8} ry={11} />
          <Eye x={148} y={136} rx={8} ry={11} />
          <path d="M112 168 Q122 164 132 167" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
          <g className="nubi__dots" fill="#7FA9F0">
            <circle cx="196" cy="44" r="6" />
            <circle cx="212" cy="28" r="8" opacity=".75" />
            <circle cx="228" cy="12" r="10" opacity=".5" />
          </g>
        </>
      )}
      {mood === "happy" && (
        <>
          <g fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round">
            <path d="M86 148 Q96 134 106 148" />
            <path d="M134 148 Q144 134 154 148" />
          </g>
          <path d="M104 162 Q120 184 136 162 Z" fill={INK} />
          <path d="M112 172 Q120 179 128 172 Q120 168 112 172Z" fill="#F08DA0" />
        </>
      )}
    </svg>
  );
}

function Eye({ x, y, rx, ry }: { x: number; y: number; rx: number; ry: number }) {
  return (
    <>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={INK} />
      <circle cx={x + 3} cy={y - 5} r="3.2" fill="#fff" />
    </>
  );
}

/** Meet Nubi: the mascot and her three faces. */
export function Mascot({ t }: { t: Copy }) {
  const c = t.mascot;
  return (
    <section id="nubi" tabIndex={-1} className="section mascot-section" aria-labelledby="nubi-heading">
      <div className="container">
        <div className="section-heading split-heading">
          <div>
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <h2 id="nubi-heading">
              <Lines lines={c.title} />
            </h2>
          </div>
          <p>{c.intro}</p>
        </div>
        <ul className="island-states mascot-moods" aria-label={c.label}>
          {c.moods.map((mood) => (
            <li key={mood.id}>
              <div className="island-still mascot-still">
                <Nubi mood={mood.id as Mood} id={mood.id} />
              </div>
              <span className="small-label">{mood.label}</span>
              <h3>{mood.title}</h3>
              <p>{mood.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
