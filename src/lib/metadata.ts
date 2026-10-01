// Set SITE_URL after choosing a real production URL. No invented domain or localhost canonical.
const configuredUrl =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined);
export const productionUrl = configuredUrl
  ? new URL(configuredUrl).origin
  : undefined;
export const isIndexable =
  Boolean(productionUrl) && process.env.VERCEL_ENV !== "preview";
