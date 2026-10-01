import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/content/site";

export const alt =
  "NANO — O teu assistente pessoal. Local quando queres. Cloud quando precisas.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function OpenGraphImage() {
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
          NANO · PARA WINDOWS
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
          O teu assistente pessoal.
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#a6abb4",
            marginTop: 26,
          }}
        >
          Local quando queres. Cloud quando precisas.
        </div>
        <div
          style={{
            display: "flex",
            color: "#8f98a6",
            marginTop: 54,
            fontSize: 18,
          }}
        >
          Beta pública · {site.version}
        </div>
      </div>
      {/* The official bitmap is embedded at build time. */}
      {/* ImageResponse requires a native image; it renders a static PNG, not browser HTML. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/png;base64,${symbol.toString("base64")}`}
        width={330}
        height={265}
        alt=""
      />
    </div>,
    size,
  );
}
