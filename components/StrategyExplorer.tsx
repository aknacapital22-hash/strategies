"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SparkSvg } from "./Sparkline";

/** Only the fields the cards show, so the full strategy data never ships to the browser. */
export type Card = { slug: string; name: string; kind: string; risk: string; universe: string; cagr: number; maxDd: number; minimum: string; spark: string; startDate: string; bmName: string; bmCagr: number };

const sorts = {
  cagr: { label: "Highest CAGR", fn: (a: Card, b: Card) => b.cagr - a.cagr },
  dd: { label: "Smallest drawdown", fn: (a: Card, b: Card) => Math.abs(a.maxDd) - Math.abs(b.maxDd) },
  name: { label: "Name A–Z", fn: (a: Card, b: Card) => a.name.localeCompare(b.name) },
} as const;

export default function CardExplorer({ list }: { list: Card[] }) {
  const kinds = useMemo(() => ["All", ...new Set(list.map((s) => s.kind))], [list]);
  const [kind, setKind] = useState("All");
  const [sort, setSort] = useState<keyof typeof sorts>("cagr");
  const [q, setQ] = useState("");

  const shown = useMemo(
    () => list.filter((s) => (kind === "All" || s.kind === kind) && s.name.toLowerCase().includes(q.toLowerCase())).sort(sorts[sort].fn),
    [list, kind, sort, q],
  );

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          {kinds.map((k) => (
            <button key={k} className="chip !min-h-9" aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>
          ))}
        </div>
        <div className="flex gap-3">
          <label className="sr-only" htmlFor="q">Search strategies</label>
          <input
            id="q" type="search" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-full border border-pline bg-page2 px-4 py-2 text-sm outline-none focus:border-[var(--accent-ink)] md:w-44"
          />
          <label className="sr-only" htmlFor="sort">Sort by</label>
          <select
            id="sort" value={sort} onChange={(e) => setSort(e.target.value as keyof typeof sorts)}
            className="rounded-full border border-pline bg-page2 px-4 py-2 text-sm"
          >
            {Object.entries(sorts).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      <p className="mt-6 text-sm text-pmuted" aria-live="polite">{shown.length} of {list.length} strategies</p>

      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s) => (
          <Link key={s.slug} href={`/strategies/${s.slug}`} className="card card-link group flex flex-col p-6">
            <div className="flex items-center justify-between gap-2">
              <span className="chip">{s.kind}</span>
              <span className="text-xs text-pmuted">{s.risk} risk</span>
            </div>
            <h2 className="mt-4 text-xl font-semibold">{s.name}</h2>
            <p className="mt-1 text-sm text-pmuted">{s.universe}</p>
            <div className="mt-5"><SparkSvg line={s.spark} /></div>
            <dl className="num mt-4 grid grid-cols-3 gap-2 border-t border-pline pt-4 text-sm">
              <div><dt className="text-xs text-pmuted">CAGR</dt><dd className="up font-semibold">▲ {s.cagr.toFixed(1)}%</dd></div>
              <div><dt className="text-xs text-pmuted">Max drawdown</dt><dd className="down font-semibold">▼ {Math.abs(s.maxDd).toFixed(1)}%</dd></div>
              <div><dt className="text-xs text-pmuted">Min. investment</dt><dd className="font-semibold">{s.minimum}</dd></div>
            </dl>
            <div className="num mt-3 flex items-center justify-between gap-2 rounded-lg bg-[var(--gain-ink)]/10 px-3 py-2 text-xs">
              <span className="up font-bold">▲ +{(s.cagr - s.bmCagr).toFixed(1)}% a year over {s.bmName}</span>
              <span className="text-pmuted">since {s.startDate}</span>
            </div>
          </Link>
        ))}
      </div>
      {shown.length === 0 && (
        <div className="card mt-6 p-10 text-center">
          <p className="font-semibold">No strategies match.</p>
          <button className="btn btn-ghost mt-4" onClick={() => { setKind("All"); setQ(""); }}>Clear filters</button>
        </div>
      )}
    </div>
  );
}
