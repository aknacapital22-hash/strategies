import type { MetadataRoute } from "next";
import { DATA_AS_OF, strategies } from "@/lib/strategies";
import { posts } from "@/lib/blog";
import { isoDate } from "@/lib/seo";
import { abs } from "@/lib/site";

// Only dates known to be true: Google ignores lastmod across a site once it proves unreliable.
export default function sitemap(): MetadataRoute.Sitemap {
  const dataDate = isoDate(DATA_AS_OF);
  const newestPost = posts.map((p) => p.updated ?? p.date).sort().at(-1);
  return [
    // These two show figures from the latest engine run.
    ...["/", "/strategies"].map((p) => ({ url: abs(p), lastModified: dataDate })),
    ...["/product", "/pricing", "/learn", "/about", "/start", "/terms", "/privacy", "/refunds", "/risk", "/contact"].map((p) => ({ url: abs(p) })),
    { url: abs("/blog"), lastModified: newestPost },
    ...strategies.map((s) => ({ url: abs(`/strategies/${s.slug}`), lastModified: dataDate })),
    ...posts.map((p) => ({ url: abs(`/blog/${p.slug}`), lastModified: p.updated ?? p.date })),
  ];
}
