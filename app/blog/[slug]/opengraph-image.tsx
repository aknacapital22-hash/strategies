import { bySlug, posts } from "@/lib/blog";
import { OG_SIZE, shareImage } from "@/lib/og";

export const alt = "An article from 15Stocks by AKNA Capital";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  return shareImage(p?.category ?? "Blog", p?.title ?? "15Stocks", "Plain-English investing guides. Educational only.");
}
