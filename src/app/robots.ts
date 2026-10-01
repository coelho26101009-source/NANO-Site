import type { MetadataRoute } from "next";
import { isIndexable, productionUrl } from "@/lib/metadata";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", ...(isIndexable ? { allow: "/" } : { disallow: "/" }) },
    ],
    ...(productionUrl ? { sitemap: `${productionUrl}/sitemap.xml` } : {}),
  };
}
