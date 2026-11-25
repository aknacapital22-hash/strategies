import type { MetadataRoute } from "next";
import { strategies } from "@/lib/strategies";
import { posts } from "@/lib/blog";
import { abs } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["/", "/product", "/strategies", "/pricing", "/learn", "/blog", "/about", "/start"];
  return [
    ...pages.map((p) => ({ url: abs(p), changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.8 })),
    ...strategies.map((s) => ({ url: abs(`/strategies/${s.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...posts.map((p) => ({ url: abs(`/blog/${p.slug}`), lastModified: p.updated ?? p.date, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
