import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { posts, bySlug, readingMinutes, fmtDate, AUTHOR } from "@/lib/blog";
import { SITE_NAME, abs } from "@/lib/site";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(slug);
  if (!p) return { title: "Article not found", robots: { index: false } };
  return {
    title: p.title,
    description: p.description,
    keywords: p.keywords,
    authors: [{ name: AUTHOR }],
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", title: p.title, description: p.description, url: `/blog/${p.slug}`, publishedTime: p.date, modifiedTime: p.updated ?? p.date, authors: [AUTHOR] },
    twitter: { card: "summary_large_image", title: p.title, description: p.description },
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
            author: { "@type": "Organization", name: AUTHOR }, publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: abs("/logo.svg") } },
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

        {p.sections.map((s) => (
          <section key={s.h} className="mt-10">
            <h2 className="text-2xl font-bold">{s.h}</h2>
            {s.p.map((t, i) => <p key={i} className="mt-3 leading-relaxed text-pmuted">{t}</p>)}
          </section>
        ))}

        <aside className="card mt-12 p-6">
          <p className="font-semibold">Put it into practice</p>
          <p className="mt-1 text-sm text-pmuted">Compare strategies by return and by drawdown, side by side.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/strategies" className="btn btn-primary">Browse strategies →</Link>
            <Link href="/start" className="btn btn-ghost">Find my index</Link>
          </div>
        </aside>

        <p className="mt-8 text-xs text-pmuted">
          Educational content only, not investment advice. Back tested figures are models and not a promise of future returns. Investments in securities are subject to market risk.
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
