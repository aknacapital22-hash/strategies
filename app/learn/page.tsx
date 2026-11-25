import Link from "next/link";
import Reveal from "@/components/Reveal";
import { paths, topics } from "@/lib/learn";

export const metadata = { title: "Learn", description: "Free reading paths on stock markets, factors, risk and personal finance, written in plain English.", alternates: { canonical: "/learn" } };

export default function Learn() {
  return (
    <div className="wrap py-10 md:py-14">
      <p className="eyebrow">Learn</p>
      <h1 className="h1 mt-4 max-w-3xl !text-[clamp(1.75rem,3.4vw,2.5rem)]">Free paths: markets, factors, personal finance</h1>
      <p className="lead mt-4 max-w-3xl">Short, plain notes on how our strategies work and how to judge any strategy. Start with Path 1, or jump to a topic.</p>

      <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2">
        <a href="#paths" className="chip">Reading paths</a>
        <a href="#topics" className="chip">Topics</a>
        <Link href="/strategies" className="chip">Browse strategies →</Link>
      </nav>

      <h2 id="paths" className="mt-14 scroll-mt-28 text-2xl font-bold">Reading paths</h2>
      <p className="mt-2 text-pmuted">Each path is a short sequence of stops. Open one and read in order.</p>
      <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
        {paths.map((p, i) => (
          <Reveal key={p.id} delay={(i % 2) * 70}>
            <details className="card group p-6" id={p.id}>
              <summary className="cursor-pointer list-none">
                <span className="num text-xs font-semibold text-aink">Path {i + 1} · {p.stops.length} stops</span>
                <span className="mt-3 block text-lg font-semibold">{p.title}</span>
                <span className="mt-1 block text-sm text-pmuted">{p.blurb}</span>
                <span className="mt-4 flex items-center gap-1" aria-hidden>
                  {p.stops.map((_, k) => <span key={k} className="h-1.5 flex-1 rounded-full bg-aink/25" />)}
                </span>
                <span className="mt-3 block text-sm font-medium text-aink group-open:hidden">Read this path ▾</span>
                <span className="mt-3 hidden text-sm font-medium text-aink group-open:block">Hide ▴</span>
              </summary>
              <ol className="mt-5 space-y-4 border-t border-pline pt-5">
                {p.stops.map((s, k) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="num mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-aink/10 text-xs font-bold text-aink">{k + 1}</span>
                    <div>
                      <p className="font-semibold">{s.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-pmuted">{s.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </details>
          </Reveal>
        ))}
      </div>

      <h2 id="topics" className="mt-16 scroll-mt-28 text-2xl font-bold">Topics</h2>
      <p className="mt-2 text-pmuted">Standalone notes you can read in any order.</p>
      <div className="mt-5 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {topics.map((t) => (
          <details key={t.id} className="card group p-5" id={t.id}>
            <summary className="cursor-pointer list-none">
              <span className="block font-semibold">{t.title}</span>
              <span className="mt-1 block text-sm text-pmuted">{t.blurb}</span>
              <span className="num mt-3 block text-xs text-aink">{t.notes.length} notes <span className="group-open:hidden">▾</span><span className="hidden group-open:inline">▴</span></span>
            </summary>
            <div className="mt-4 space-y-4 border-t border-pline pt-4">
              {t.notes.map((n) => (
                <article key={n.title}>
                  <h3 className="text-sm font-semibold">{n.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-pmuted">{n.body}</p>
                </article>
              ))}
            </div>
          </details>
        ))}
      </div>

      <p className="mt-12 max-w-3xl text-xs leading-relaxed text-pmuted">
        Educational material only, not investment advice. Strategy figures are model, back tested results and are not a promise of future returns. Tax rules change, so confirm them with a qualified professional.
      </p>
    </div>
  );
}
