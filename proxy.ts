import { NextResponse, type NextRequest } from "next/server";
import strategies from "./lib/strategies.json";
import { posts } from "./lib/blog";

// With Cache Components the page streams, so a notFound() thrown inside it still ships a 200 status on the first
// request for an unseen URL (a soft 404 that search engines index). Rejecting unknown slugs here, before any
// rendering, makes the status a real 404.
const SLUGS = new Set((strategies as { slug: string }[]).map((s) => s.slug));
const POSTS = new Set(posts.map((p) => p.slug));

export function proxy(req: NextRequest) {
  // /account needs a session: bounce visitors without a session cookie straight to login (the page verifies it fully).
  if (["/account", "/admin"].includes(req.nextUrl.pathname) && !req.cookies.get("akna_session")) {
    return NextResponse.redirect(new URL(`/login?next=${req.nextUrl.pathname}`, req.url));
  }
  if (req.nextUrl.pathname.startsWith("/blog/")) {
    const post = req.nextUrl.pathname.split("/")[2];
    return post && !POSTS.has(post) ? NextResponse.rewrite(new URL("/__not-found", req.url), { status: 404 }) : NextResponse.next();
  }
  if (!req.nextUrl.pathname.startsWith("/strategies/")) return NextResponse.next();
  const slug = req.nextUrl.pathname.split("/")[2];
  if (slug && !SLUGS.has(slug)) {
    return NextResponse.rewrite(new URL("/__not-found", req.url), { status: 404 });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/strategies/:slug", "/blog/:slug", "/account", "/admin"] };
