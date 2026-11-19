import { copy } from "@/content/i18n";
import { renderOgImage } from "@/lib/og-image";

export const alt = `NANO — ${copy.en.meta.ogTitle} ${copy.en.meta.ogTagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OpenGraphImage() {
  return renderOgImage("en");
}
