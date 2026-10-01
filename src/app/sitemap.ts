import type { MetadataRoute } from "next";
import { isIndexable, productionUrl } from "@/lib/metadata";
export default function sitemap(): MetadataRoute.Sitemap {
  return isIndexable && productionUrl
    ? [{ url: productionUrl, changeFrequency: "monthly", priority: 1 }]
    : [];
}
