import { experiences } from "@/content/site";
import { Icon } from "../icons";
import { capsuleArt } from "./capsule-art";

/**
 * Product story for the cinematic layout. Server-rendered with the same copy
 * as the gallery, so it is crawlable and needs no JavaScript; CSS shows it
 * only while the 3D stage is active (the tabbed gallery is the fallback).
 * The laptop's display is decorative, so each capture's description stays
 * available to assistive technology here, without a second image download.
 */
export function CinemaChapters() {
  return (
    <div className="cinema-chapters">
      {experiences.map((item) => (
        <article
          key={item.id}
          className={`cinema-chapter cinema-chapter-${item.id}`}
          data-cinema-beat={item.id}
          aria-labelledby={`chapter-${item.id}`}
        >
          <span className="small-label">
            {item.number} — {item.label}
          </span>
          <h3 id={`chapter-${item.id}`}>{item.title}</h3>
          <p>{item.description}</p>
          {item.id === "voice" && (
            <>
              <div
                className="keyboard-shortcut"
                aria-label="Control mais Shift mais Espaço"
              >
                <kbd>Ctrl</kbd>
                <span>+</span>
                <kbd>Shift</kbd>
                <span>+</span>
                <kbd>Space</kbd>
              </div>
              {/* The capsule flies out of the laptop and settles here. */}
              <div className="cinema-capsule-slot" aria-hidden="true">
                <div
                  className="cinema-capsule cinema-capsule-docked"
                  style={{
                    width: capsuleArt.width,
                    height: capsuleArt.height,
                    borderRadius: capsuleArt.radius,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- pre-encoded lossless crop source, positioned by CSS */}
                  <img
                    src={capsuleArt.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: capsuleArt.image.width,
                      left: capsuleArt.image.left,
                      top: capsuleArt.image.top,
                    }}
                  />
                </div>
              </div>
              <p className="cinema-note">
                Estado de escuta simulado na captura oficial. A voz é opcional e
                requer configuração adicional.
              </p>
            </>
          )}
          <span className="visually-hidden" role="img" aria-label={item.alt} />
          <a className="cinema-capture-link" href={item.image}>
            Abrir captura completa <span aria-hidden="true">↗</span>
          </a>
          {item.id === "home" && (
            <p className="cinema-note cinema-asset-note">
              <Icon name="windows" />
              Capturas oficiais num perfil de demonstração. Algumas mostram a
              versão interna anterior.
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
