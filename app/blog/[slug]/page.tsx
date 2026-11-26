import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Words from "@/components/Words";
import { posts, bySlug, readingMinutes, fmtDate, AUTHOR } from "@/lib/blog";
import { ORG_ID, pageMeta } from "@/lib/seo";
import { abs } from "@/lib/site";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return { title: "Article not found", robots: { index: false } };
  const base = pageMeta({ title: p.title, description: p.description, path: `/blog/${p.slug}`, ownImage: true });
  return {
    ...base,
    keywords: p.keywords,
    authors: [{ name: AUTHOR }],
    openGraph: { ...base.openGraph, type: "article", publishedTime: p.date, modifiedTime: p.updated ?? p.date, authors: [AUTHOR] },
  };
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) notFound();
  const related = p.related.map(bySlug).filter((x) => x !== undefined);

  return (
    <article className="wrap py-10 md:py-14">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BlogPosting", headline: p.title, description: p.description, keywords: p.keywords.join(", "),
            datePublished: p.date, dateModified: p.updated ?? p.date, mainEntityOfPage: abs(`/blog/${p.slug}`),
            url: abs(`/blog/${p.slug}`), inLanguage: "en-IN", isAccessibleForFree: true, articleSection: p.category, image: abs(`/blog/${p.slug}/opengraph-image`),
            author: { "@type": "Organization", name: AUTHOR, url: abs("/about") }, publisher: { "@id": ORG_ID },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
              { "@type": "ListItem", position: 2, name: "Blog", item: abs("/blog") },
              { "@type": "ListItem", position: 3, name: p.title, item: abs(`/blog/${p.slug}`) },
            ],
          },
        ],
      }} />
      <div className="mx-auto max-w-3xl">
        <nav aria-label="Breadcrumb" className="text-sm text-pmuted">
          <Link href="/blog" className="font-medium text-aink hover:underline">← Blog</Link>
        </nav>
        <span className="chip mt-6">{p.category}</span>
        <h1 className="h1 mt-4 !text-[clamp(1.9rem,4vw,2.9rem)]">{p.title}</h1>
        <p className="num mt-4 text-sm text-pmuted">
          By {AUTHOR} · <time dateTime={p.date}>{fmtDate(p.date)}</time> · {readingMinutes(p)} min read
        </p>
        <p className="lead mt-6">{p.intro}</p>
        <Words className="mt-6" />

        {p.sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="text-2xl font-bold">{s.h}</h2>
            {s.p.map((t, i) => <p key={i} className="mt-3 leading-relaxed text-pmuted">{t}</p>)}
          </section>
        ))}

        <aside className="card mt-12 p-6">
          <p className="font-semibold">Put it into practice</p>
          <p className="mt-1 text-sm text-pmuted">See what each basket would have done in the past, and how far it fell.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/strategies" className="btn btn-primary">See all baskets →</Link>
            <Link href="/start" className="btn btn-ghost">See what suits you</Link>
          </div>
        </aside>

        <p className="mt-8 text-xs text-pmuted">
          Educational content only, not investment advice. Figures tested on past data (back tests) are not a promise of future returns. Investments in securities are subject to market risk.
        </p>

        <h2 className="mt-14 text-xl font-semibold">Keep reading</h2>
        <ul className="mt-4 grid gap-3">
          {related.map((r) => (
            <li key={r.slug}><Link href={`/blog/${r.slug}`} className="card card-link block p-4 font-medium">{r.title}</Link></li>
          ))}
        </ul>
      </div>
    </article>
  );
}
