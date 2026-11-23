import type { Metadata, Viewport } from "next";
import { copy, type Locale } from "@/content/i18n";
import { site } from "@/content/site";
import { isIndexable, productionUrl } from "./metadata";

export function buildMetadata(locale: Locale): Metadata {
  const t = copy[locale];
  return {
    metadataBase: new URL(
      productionUrl ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000"),
    ),
    title: t.meta.title,
    description: t.meta.description,
    ...(productionUrl
      ? {
          alternates: {
            canonical: t.path,
            languages: { en: "/", "pt-PT": "/pt", "x-default": "/" },
          },
        }
      : {}),
    applicationName: "NANO",
    authors: [{ name: site.creator.name }],
    creator: site.creator.name,
    robots: { index: isIndexable, follow: isIndexable },
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      siteName: "NANO",
      locale: t.ogLocale,
      alternateLocale: locale === "en" ? ["pt_PT"] : ["en_US"],
      type: "website",
      ...(productionUrl ? { url: new URL(t.path, productionUrl).href } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: t.meta.title,
      description: t.meta.description,
    },
    // Square icons: Google shows a site's favicon in results only when it is
    // square (a multiple of 48 px); the old 360×289 symbol was not.
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "48x48" },
        { url: "/icon-96.png", type: "image/png", sizes: "96x96" },
        { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      ],
      apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
    },
    manifest: "/manifest.webmanifest",
    keywords: [...t.meta.keywords],
    category: "technology",
    ...(site.googleVerification
      ? { verification: { google: site.googleVerification } }
      : {}),
  };
}

export const viewport: Viewport = {
  themeColor: "#0b0d10",
  colorScheme: "dark",
};
