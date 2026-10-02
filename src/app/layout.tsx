import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { site } from "@/content/site";
import { isIndexable, productionUrl } from "@/lib/metadata";
import { cinemaBootScript } from "@/components/cinema/boot";
import "./globals.css";
import "./motion.css";
import "./cinema.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(
    productionUrl ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
  ),
  title: site.title,
  description: site.description,
  ...(productionUrl ? { alternates: { canonical: "/" } } : {}),
  applicationName: "NANO",
  robots: { index: isIndexable, follow: isIndexable },
  openGraph: {
    title: site.title,
    description: site.description,
    siteName: "NANO",
    locale: "pt_PT",
    type: "website",
    ...(productionUrl ? { url: productionUrl } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  icons: { icon: "/brand/nano-symbol.png", apple: "/brand/nano-symbol.png" },
};
export const viewport: Viewport = {
  themeColor: "#0b0d10",
  colorScheme: "dark",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The boot script sets data-cinema before hydration; nothing else differs.
    <html
      lang={site.locale}
      className={manrope.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: cinemaBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
