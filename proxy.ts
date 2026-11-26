import { NextResponse, type NextRequest } from "next/server";
import strategies from "./lib/strategies.json";
import { posts } from "./lib/blog";

// With Cache Components the page streams, so a notFound() thrown inside it still ships a 200 status on the first
// request for an unseen URL (a soft 404 that search engines index). Rejecting unknown slugs here, before any
// rendering, makes the status a real 404.
const SLUGS = new Set((strategies as { slug: string }[]).map((s) => s.slug));
const POSTS = new Set(posts.map((p) => p.slug));

const RENAMED: Record<string, string> = { "focused-largecap-20": "focused-largecap-15" };

export function proxy(req: NextRequest) {
  // /account needs a session: bounce visitors without a session cookie straight to login (the page verifies it fully).
  if (["/account", "/admin"].includes(req.nextUrl.pathname) && !req.cookies.get("akna_sid")) {
    return NextResponse.redirect(new URL(`/login?next=${req.nextUrl.pathname}`, req.url));
  }
  // No longer sold. Done here too, because some hosts run this before the redirects in next.config.ts.
  if (req.nextUrl.pathname === "/subscribe/all-access") return NextResponse.redirect(new URL("/pricing", req.url), 307);
  if (req.nextUrl.pathname.startsWith("/blog/")) {
    const post = req.nextUrl.pathname.split("/")[2];
    return post && !POSTS.has(post) ? NextResponse.rewrite(new URL("/__not-found", req.url), { status: 404 }) : NextResponse.next();
  }
  if (!req.nextUrl.pathname.startsWith("/strategies/")) return NextResponse.next();
  const slug = req.nextUrl.pathname.split("/")[2];
  // Renamed baskets. Also done here because some hosts (Netlify) run this before the redirects in next.config.ts.
  const renamed = slug ? RENAMED[slug] : undefined;
  if (renamed) return NextResponse.redirect(new URL(`/strategies/${renamed}${req.nextUrl.search}`, req.url), 308);
  if (slug && !SLUGS.has(slug)) {
    return NextResponse.rewrite(new URL("/__not-found", req.url), { status: 404 });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/strategies/:slug", "/blog/:slug", "/account", "/admin", "/subscribe/all-access"] };
