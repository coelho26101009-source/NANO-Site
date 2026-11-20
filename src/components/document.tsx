import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
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

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
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
      className={manrope.variable}
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
