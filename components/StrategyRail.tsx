"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SparkSvg } from "./Sparkline";

export type RailCard = { slug: string; name: string; kind: string; risk: string; cagr: number; maxDd: number; minimum: string; spark: string };

/** Filter chips over a swipeable row of strategy cards, so people narrow by type without leaving the page. */
export default function StrategyRail({ cards }: { cards: RailCard[] }) {
  const kinds = useMemo(() => ["All", ...new Set(cards.map((c) => c.kind))], [cards]);
  const [kind, setKind] = useState("All");
  const shown = cards.filter((c) => kind === "All" || c.kind === kind).slice(0, 8);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter strategies by type">
        {kinds.map((k) => (
          <button key={k} className="chip !min-h-8" aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>
        ))}
      </div>
      <div className="snap-row mt-4">
        {shown.map((s, i) => (
          <Link key={s.slug} href={`/strategies/${s.slug}`} className="card card-link relative flex flex-col p-5">
            {i === 0 && <span className="absolute right-4 top-4 rounded-full bg-[#0f766e] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">Top</span>}
            <div className="flex items-center gap-2"><span className="chip">{s.kind}</span><span className="text-xs text-pmuted">{s.risk}</span></div>
            <h3 className="mt-3 font-bold">{s.name}</h3>
            <div className="mt-3"><SparkSvg line={s.spark} /></div>
            <dl className="num mt-3 grid grid-cols-3 gap-2 border-t border-pline pt-3 text-sm">
              <div><dt className="text-[11px] text-pmuted">CAGR</dt><dd className="up font-bold">▲ {s.cagr.toFixed(1)}%</dd></div>
              <div><dt className="text-[11px] text-pmuted">Max DD</dt><dd className="down font-bold">▼ {Math.abs(s.maxDd).toFixed(1)}%</dd></div>
              <div><dt className="text-[11px] text-pmuted">Min. investment</dt><dd className="font-bold">{s.minimum}</dd></div>
            </dl>
          </Link>
        ))}
      </div>
    </div>
  );
}
