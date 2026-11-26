import Link from "next/link";
import { breadcrumbs, graph, pageMeta } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Words from "@/components/Words";
import { sorted, readingMinutes, fmtDate } from "@/lib/blog";
import { SITE_NAME, abs } from "@/lib/site";

export const metadata = pageMeta({
  title: "Investing Blog: Quant, Back Tests and Risk",
  description: "Plain-English articles on quant investing, back tests, drawdowns, CAGR, momentum and rebalancing for Indian investors.",
  path: "/blog",
});

export default function Blog() {
  const list = sorted();
  return (
    <div className="wrap py-10 md:py-14">
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Blog", name: `${SITE_NAME} Blog`, url: abs("/blog"),
        blogPost: list.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: abs(`/blog/${p.slug}`), datePublished: p.date })),
      }} />
      <JsonLd data={graph(breadcrumbs(["Blog", "/blog"]))} />
      <p className="eyebrow">Blog</p>
      <h1 className="h1 mt-4 max-w-3xl !text-[clamp(1.75rem,3.4vw,2.5rem)]">Articles on investing</h1>
      <p className="lead mt-4 max-w-3xl">Guides on investing with fixed rules and how to judge it. Some go into detail. Educational only, not investment advice.</p>
      <Words className="mt-6" />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card card-link flex flex-col p-6">
            <span className="chip w-fit">{p.category}</span>
            <h2 className="mt-4 text-xl font-semibold">{p.title}</h2>
            <p className="mt-2 flex-1 text-sm text-pmuted">{p.description}</p>
            <p className="num mt-5 text-xs text-pmuted"><time dateTime={p.date}>{fmtDate(p.date)}</time> · {readingMinutes(p)} min read</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
