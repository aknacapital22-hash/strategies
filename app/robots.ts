import type { MetadataRoute } from "next";
import { INDEXABLE, abs } from "@/lib/site";

const PRIVATE = ["/account", "/admin", "/api/", "/auth", "/subscribe", "/demo-inbox", "/login", "/signup", "/forgot-password", "/reset-password"];

// AI search and assistant crawlers, plus the names that control use in AI training. They get the same access as
// search engines. To stay in AI answers but out of model training, move GPTBot, ClaudeBot, Google-Extended,
// Applebot-Extended and CCBot into a rule with disallow: "/".
const AI_BOTS = ["OAI-SearchBot", "ChatGPT-User", "GPTBot", "Claude-SearchBot", "Claude-User", "ClaudeBot", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot"];

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    // A crawler with its own group ignores the "*" group, so the private paths are repeated for it.
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: abs("/sitemap.xml"),
  };
}
