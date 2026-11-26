"use client";

import { useRef, useState } from "react";
import type { Strategy } from "@/lib/strategies";
import { growthSeries } from "@/lib/growth";
import { lakh } from "@/lib/plain";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Compounds the strategy's published monthly model returns into a growth-of-100 line. Hover or drag to read values.
export default function Curve({ s }: { s: Pick<Strategy, "name" | "slug" | "growth" | "monthly" | "benchmark"> }) {
  const vals = growthSeries(s);
  const bm = growthSeries(s.benchmark);
  const first = s.monthly[0];
  const label = (i: number) => {
    if (i === 0) return "Start";
    const m = s.monthly[i - 1];
    return `${MONTHS[m.m - 1]} ${m.y}`;
  };
  const W = 640, H = 260, PL = 8, PR = 8, PT = 14, PB = 24;
  const lo = Math.log(Math.min(...vals, ...bm)), hi = Math.log(Math.max(...vals, ...bm));
  // Rounded: Math.log differs in the last digits between the server's and the browser's engine, which
  // would otherwise make the SVG attributes mismatch at hydration.
  const rd = (n: number) => Math.round(n * 10) / 10;
  const x = (i: number) => rd(PL + (i / (vals.length - 1)) * (W - PL - PR));
  const y = (v: number) => rd(PT + (1 - (Math.log(v) - lo) / (hi - lo || 1)) * (H - PT - PB));
  const line = vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const bline = bm.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const ticks = [100, 200, 400, 800, 1600].filter((t) => Math.log(t) >= lo && Math.log(t) <= hi);

  const ref = useRef<SVGSVGElement>(null);
  const [hov, setHov] = useState<number | null>(null);
  const move = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    const px = ((clientX - r.left) / r.width) * W;
    setHov(Math.max(0, Math.min(vals.length - 1, Math.round(((px - PL) / (W - PL - PR)) * (vals.length - 1)))));
  };
  const cur = hov ?? vals.length - 1;
  // The chart steps month by month. At the end, show the exact figures used everywhere else on the site.
  const atEnd = cur === vals.length - 1;
  const value = atEnd && s.growth ? s.growth.model : vals[cur];
  const bmValue = atEnd ? s.benchmark.growth : bm[cur];

  return (
    <figure className="card p-5 md:p-7">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-pmuted">{label(cur)}</p>
          <p className="num text-3xl font-bold">{lakh(value)} <span className="text-sm font-medium text-pmuted">from ₹1 lakh</span></p>
          <p className="num mt-1 text-sm text-pmuted">Market ({s.benchmark.name}): {lakh(bmValue)}</p>
        </div>
      </div>
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full touch-pan-y"
        role="img"
        aria-label={`How ₹1 lakh grew in ${s.name}, tested on past data.`}
        onPointerMove={(e) => move(e.clientX)}
        onPointerLeave={() => setHov(null)}
      >
        <defs>
          <linearGradient id={`g-${s.slug}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="var(--accent-ink)" stopOpacity=".28" />
            <stop offset="1" stopColor="var(--accent-ink)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PL} x2={W - PR} y1={y(t)} y2={y(t)} stroke="var(--page-line)" strokeDasharray="3 4" />
            <text x={W - PR} y={y(t) - 4} textAnchor="end" fontSize="10" fill="var(--page-muted)">{`₹${t / 100} lakh`}</text>
          </g>
        ))}
        <path d={`${line}L${x(vals.length - 1)},${H - PB}L${x(0)},${H - PB}Z`} fill={`url(#g-${s.slug})`} />
        <path d={line} pathLength={1} className="draw" fill="none" stroke="var(--accent-ink)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        <path d={bline} fill="none" stroke="var(--page-muted)" strokeWidth="2" strokeDasharray="5 4" strokeLinejoin="round" strokeLinecap="round" />
        <text x={PL} y={H - 6} fontSize="10" fill="var(--page-muted)">{first ? `${MONTHS[first.m - 1]} ${first.y}` : ""}</text>
        <text x={W - PR} y={H - 6} fontSize="10" textAnchor="end" fill="var(--page-muted)">{label(vals.length - 1)}</text>
        {hov !== null && (
          <g>
            <line x1={x(hov)} x2={x(hov)} y1={PT} y2={H - PB} stroke="var(--page-text)" opacity=".25" />
            <circle cx={x(hov)} cy={y(vals[hov])} r="5" fill="var(--accent-ink)" stroke="var(--page-2)" strokeWidth="2" />
            <circle cx={x(hov)} cy={y(bm[hov])} r="4" fill="var(--page-muted)" stroke="var(--page-2)" strokeWidth="2" />
          </g>
        )}
      </svg>
      <figcaption className="mt-3 text-xs leading-relaxed text-pmuted">
        Solid line: {s.name}. Dotted line: market. Equal steps up the chart mean equal % growth.
        {s.growth && ` Old prices from ${s.growth.start} to ${s.growth.end}.`} Not a promise of future growth.
      </figcaption>
    </figure>
  );
}
