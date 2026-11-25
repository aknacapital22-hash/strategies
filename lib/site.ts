export const SITE_NAME = "15Stocks by AKNA Capital";
/** Set NEXT_PUBLIC_SITE_URL in production (e.g. https://example.com). Without it the site stays out of search indexes. */
const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
export const SITE_URL = env ?? "http://localhost:3000";
export const INDEXABLE = Boolean(env);
export const abs = (path: string) => `${SITE_URL}${path}`;
