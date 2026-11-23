import type { MetadataRoute } from "next";

/** Installable-site manifest: name and square icons for browsers and search. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NANO Assistant",
    short_name: "NANO",
    description:
      "A free, open-source personal AI assistant for Windows, with an Android companion app.",
    start_url: "/",
    display: "browser",
    background_color: "#0b0d10",
    theme_color: "#0b0d10",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
