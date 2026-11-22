import Image from "next/image";
import type { Copy } from "@/content/i18n";
import { Eyebrow, Lines } from "./ui";
import { IslandVideo } from "./island-video";
import islandAssets from "@/content/island.json";

/** Ambient mode: the island at the top of the screen, recorded from the app. */
export function Island({ t }: { t: Copy }) {
  const c = t.island;
  const lang = t.locale as keyof typeof islandAssets;
  const assets = islandAssets[lang];
  return (
    <section
      id="island"
      tabIndex={-1}
      className="section island-section"
      aria-labelledby="island-heading"
    >
      <div className="container">
        <div className="section-heading split-heading">
          <div>
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <h2 id="island-heading">
              <Lines lines={c.title} />
            </h2>
          </div>
          <p>{c.intro}</p>
        </div>
        <figure className="island-stage">
          <div className="island-screen">
            <IslandVideo base={assets.video} label={c.videoLabel} />
          </div>
          <figcaption>{c.caption}</figcaption>
        </figure>
        <ul className="island-states">
          {c.states.map((state) => {
            const still = assets.stills[state.id as keyof typeof assets.stills];
            return (
              <li key={state.id}>
                <div className="island-still">
                  <Image
                    src={still.src}
                    width={still.width / 2}
                    height={still.height / 2}
                    alt={state.alt}
                    unoptimized
                    loading="lazy"
                  />
                </div>
                <span className="small-label">{state.label}</span>
                <h3>{state.title}</h3>
                <p>{state.text}</p>
              </li>
            );
          })}
        </ul>
        <p className="section-note island-note">{c.note}</p>
      </div>
    </section>
  );
}
