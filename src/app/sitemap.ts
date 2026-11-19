import type { MetadataRoute } from "next";
import { isIndexable, productionUrl } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexable || !productionUrl) return [];
  const languages = {
    en: productionUrl,
    "pt-PT": `${productionUrl}/pt`,
  };
  return [
    {
      url: productionUrl,
      changeFrequency: "monthly",
      priority: 1,
      alternates: { languages },
    },
    {
      url: `${productionUrl}/pt`,
      changeFrequency: "monthly",
      priority: 0.9,
      alternates: { languages },
    },
  ];
}
