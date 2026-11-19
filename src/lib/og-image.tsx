import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/content/site";
import { copy, type Locale } from "@/content/i18n";

/** Social card (1200 × 630) for one language, rendered at build time. */
export async function renderOgImage(locale: Locale) {
  const t = copy[locale].meta;
  const symbol = await readFile(
    join(process.cwd(), "public/brand/nano-symbol.png"),
  );
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        background: "#0b0d10",
        color: "#f4f5f6",
        padding: 76,
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", width: 660 }}>
        <div
          style={{
            display: "flex",
            color: "#99b8e9",
            fontSize: 20,
            letterSpacing: 4,
          }}
        >
          {t.ogEyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            lineHeight: 1.07,
            letterSpacing: -4,
            marginTop: 36,
          }}
        >
          {t.ogTitle}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#a6abb4",
            marginTop: 26,
          }}
        >
          {t.ogTagline}
        </div>
        <div
          style={{
            display: "flex",
            color: "#8f98a6",
            marginTop: 54,
            fontSize: 18,
          }}
        >
          {t.ogBeta} · {site.version}
        </div>
      </div>
      {/* The official bitmap is embedded at build time. */}
      {/* ImageResponse requires a native image; it renders a static PNG, not browser HTML. */}
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain <img> */}
      <img
        src={`data:image/png;base64,${symbol.toString("base64")}`}
        width={330}
        height={265}
        alt=""
      />
    </div>,
    { width: 1200, height: 630 },
  );
}
