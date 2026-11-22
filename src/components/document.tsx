import type { ReactNode } from "react";
import localFont from "next/font/local";
import {
  copy,
  languageBootScript,
  portugueseChoiceScript,
  type Locale,
} from "@/content/i18n";
import { cinemaBootScript } from "@/components/cinema/boot";
import "@/app/globals.css";
import "@/app/motion.css";
import "@/app/cinema.css";
import "@/app/editorial.css";

// Self-hosted (SIL Open Font License), the same three faces as Simão's site.
const sans = localFont({
  src: "../app/fonts/inter-tight-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-sans",
  display: "swap",
});
const serif = localFont({
  src: "../app/fonts/instrument-serif-latin-400-italic.woff2",
  weight: "400",
  style: "italic",
  variable: "--font-serif",
  display: "swap",
});
const mono = localFont({
  src: [
    {
      path: "../app/fonts/jetbrains-mono-latin-400-normal.woff2",
      weight: "400",
    },
    {
      path: "../app/fonts/jetbrains-mono-latin-500-normal.woff2",
      weight: "500",
    },
  ],
  variable: "--font-mono",
  display: "swap",
});
// Inter Tight fixed at 600 with its overlapping contours merged: the outlined
// words of the band show no inner lines (a variable font's overlaps would).
const outline = localFont({
  src: "../app/fonts/inter-tight-latin-600-outline.woff2",
  weight: "600",
  variable: "--font-outline",
  display: "swap",
});

/** The <html> shell shared by the English (`/`) and Portuguese (`/pt`) root layouts. */
export function Document({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    // The boot script sets data-cinema before hydration; nothing else differs.
    <html
      lang={copy[locale].htmlLang}
      className={`${sans.variable} ${serif.variable} ${mono.variable} ${outline.variable}`}
      suppressHydrationWarning
    >
      {/* eslint-disable-next-line @next/next/no-head-element -- this is the App Router root layout shell */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              locale === "en" ? languageBootScript : portugueseChoiceScript,
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: cinemaBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
