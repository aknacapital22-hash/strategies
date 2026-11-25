import type { MetadataRoute } from "next";
import { INDEXABLE, abs } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/admin", "/auth", "/subscribe", "/demo-inbox", "/login", "/signup", "/forgot-password", "/reset-password"] },
    sitemap: abs("/sitemap.xml"),
  };
}
