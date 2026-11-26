"use client";

import { useMemo, useState } from "react";
import BasketCard, { type CardData } from "./BasketCard";

/** The card fields, plus the numbers used only for sorting. */
export type Card = CardData & { cagr: number; maxDd: number; minimumValue: number; sharpe: number };

// "Dynamic multi asset" is filed under "Multi asset" in the filter; the card keeps its full name.
const typeOf = (s: Card) => (s.kind === "Dynamic multi asset" ? "Multi asset" : s.kind);
const TYPES = ["Momentum", "Multi asset", "Hybrid", "Thematic"];
/** "At least this Sharpe ratio" choices. 0 means no limit. */
const SHARPE_STEPS = [0, 0.75, 1, 1.25];
const sharpeLabel = (n: number) => (n === 0 ? "Any" : `${n.toFixed(2)} or more`);
const RISKS: Record<string, string> = { Moderate: "#bdd15a", "Moderately High": "#f5c451", High: "#fb9a4b", "Very High": "#f87171" };

const sorts = {
  cagr: { label: "CAGR", fn: (a: Card, b: Card) => b.cagr - a.cagr },
  sharpe: { label: "Sharpe ratio", fn: (a: Card, b: Card) => b.sharpe - a.sharpe },
  dd: { label: "Max drawdown", fn: (a: Card, b: Card) => Math.abs(a.maxDd) - Math.abs(b.maxDd) }, // smallest fall first
  minimum: { label: "Lowest minimum", fn: (a: Card, b: Card) => a.minimumValue - b.minimumValue || b.cagr - a.cagr },
} as const;

/** The values found in the data, in the order given; anything new in the data is added at the end. */
const present = (order: string[], values: string[]) => [...order.filter((v) => values.includes(v)), ...new Set(values.filter((v) => !order.includes(v)))];

/** One choice inside a switch bar: the selected one is raised out of the track. */
function Segment({ on, count, onClick, children }: { on: boolean; count?: number; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button" aria-pressed={on} disabled={!on && count === 0} onClick={onClick}
      className="flex min-h-10 flex-auto cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3.5 text-sm font-semibold text-pmuted transition-all duration-300 hover:text-ptext aria-pressed:bg-ptext aria-pressed:text-page aria-pressed:shadow-md disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
      {count !== undefined && <span className="num min-w-5 rounded-md bg-current/10 px-1.5 text-xs leading-5">{count}</span>}
    </button>
  );
}

/** Four rising bars, filled up to the risk level, so the level reads without relying on colour. */
function RiskBars({ level, color }: { level: number; color: string }) {
  return (
    <span aria-hidden className="flex h-4 shrink-0 items-end gap-[3px]">
      {[1, 2, 3, 4].map((n) => <span key={n} className="w-1 rounded-full" style={{ height: `${25 * n}%`, background: n <= level ? color : "var(--page-line)" }} />)}
    </span>
  );
}

const levelOf = (risk: string) => Object.keys(RISKS).indexOf(risk) + 1;

/** One step of the risk scale. The line along its foot is that level's colour. */
function RiskStep({ risk, on, count, onClick }: { risk: string; on: boolean; count: number; onClick: () => void }) {
  const color = RISKS[risk] ?? "var(--accent-ink)";
  const any = risk === "Any";
  return (
    <button
      type="button" aria-pressed={on} disabled={!on && count === 0} onClick={onClick}
      style={{ "--tone": color } as React.CSSProperties}
      className={`group relative flex cursor-pointer flex-col justify-between gap-2 overflow-hidden rounded-2xl border border-pline p-3 pb-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--tone)] aria-pressed:border-[var(--tone)] aria-pressed:bg-[color-mix(in_srgb,var(--tone)_14%,transparent)] aria-pressed:shadow-[0_10px_24px_-14px_var(--tone)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 disabled:hover:border-pline ${any ? "col-span-2 lg:col-span-1" : ""}`}
    >
      <span className="flex items-center justify-between gap-2">
        {any ? <span aria-hidden className="h-4 text-xs font-semibold leading-4 text-pmuted">All levels</span> : <RiskBars level={levelOf(risk)} color={color} />}
        <span aria-hidden className="grid h-4 w-4 place-items-center rounded-full bg-ptext text-[10px] font-bold text-page opacity-0 transition-opacity group-aria-pressed:opacity-100">✓</span>
      </span>
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold leading-tight">{risk}</span>
        <span className="num text-lg font-bold leading-none">{count}</span>
      </span>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] opacity-45 transition-opacity group-hover:opacity-100 group-aria-pressed:opacity-100" style={{ background: any ? `linear-gradient(90deg, ${Object.values(RISKS).join(", ")})` : color }} />
    </button>
  );
}

const groupLabel = "mb-2 block text-[11px] font-bold uppercase tracking-[.16em] text-pmuted";
const track = "flex flex-wrap gap-1 rounded-2xl bg-page3 p-1";

export default function CardExplorer({ list }: { list: Card[] }) {
  const types = useMemo(() => present(TYPES, list.map(typeOf)), [list]);
  const risks = useMemo(() => present(Object.keys(RISKS), list.map((s) => s.risk)), [list]);
  const [type, setType] = useState("All");
  const [risk, setRisk] = useState("Any");
  const [sort, setSort] = useState<keyof typeof sorts>("cagr");
  const [q, setQ] = useState("");
  const [minSharpe, setMinSharpe] = useState(0);

  const named = list.filter((s) => s.name.toLowerCase().includes(q.trim().toLowerCase()));
  const byType = (s: Card, t: string) => t === "All" || typeOf(s) === t;
  const byRisk = (s: Card, r: string) => r === "Any" || s.risk === r;
  // Each count says how many cards that button would show, with the other filters left as they are.
  // compared as printed on the card, so a card reading 1.00 is part of "1.00 or more"
  const bySharpe = (s: Card, n: number) => n === 0 || Number(s.sharpe.toFixed(2)) >= n;
  const typeCount = (t: string) => named.filter((s) => byType(s, t) && byRisk(s, risk) && bySharpe(s, minSharpe)).length;
  const riskCount = (r: string) => named.filter((s) => byType(s, type) && byRisk(s, r) && bySharpe(s, minSharpe)).length;
  const sharpeCount = (n: number) => named.filter((s) => byType(s, type) && byRisk(s, risk) && bySharpe(s, n)).length;
  const shown = named.filter((s) => byType(s, type) && byRisk(s, risk) && bySharpe(s, minSharpe)).sort(sorts[sort].fn);

  const filtered = type !== "All" || risk !== "Any" || minSharpe !== 0 || q.trim() !== "";
  const reset = () => { setType("All"); setRisk("Any"); setMinSharpe(0); setQ(""); };

  return (
    <div>
      <div className="rounded-3xl border border-pline bg-page2 shadow-[var(--shadow-hover)]">
        <div className="grid gap-5 p-4 sm:p-5">
          <div role="group" aria-label="Type">
            <span aria-hidden className={groupLabel}>Strategy type</span>
            <div className={`${track} grid grid-cols-2 sm:flex [&>:first-child]:col-span-2`}>
              {["All", ...types].map((t) => <Segment key={t} on={type === t} count={typeCount(t)} onClick={() => setType(t)}>{t}</Segment>)}
            </div>
          </div>
          <div role="group" aria-label="Risk">
            <span aria-hidden className={groupLabel}>Risk level, low to high</span>
            <div className="grid grid-cols-2 gap-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
              {["Any", ...risks].map((r) => <RiskStep key={r} risk={r} on={risk === r} count={riskCount(r)} onClick={() => setRisk(r)} />)}
            </div>
          </div>
          <div role="group" aria-label="Sharpe ratio">
            <span aria-hidden className={groupLabel}>Sharpe ratio, higher is better</span>
            <div className={`${track} grid grid-cols-2 sm:flex`}>
              {SHARPE_STEPS.map((n) => <Segment key={n} on={minSharpe === n} count={sharpeCount(n)} onClick={() => setMinSharpe(n)}>{sharpeLabel(n)}</Segment>)}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-pline p-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative lg:w-72">
            <label className="sr-only" htmlFor="q">Search strategies</label>
            <svg aria-hidden viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-pmuted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            <input
              id="q" type="search" placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)}
              className="min-h-11 w-full rounded-2xl border border-pline bg-page py-2 pl-10 pr-4 text-sm outline-none focus:border-[var(--accent-ink)]"
            />
          </div>
          <div role="group" aria-label="Sort" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span aria-hidden className="whitespace-nowrap text-[11px] font-bold uppercase tracking-[.16em] text-pmuted">Sort by</span>
            <div className={`${track} grid grid-cols-2 sm:flex sm:flex-1`}>
              {(Object.keys(sorts) as (keyof typeof sorts)[]).map((k) => <Segment key={k} on={sort === k} onClick={() => setSort(k)}>{sorts[k].label}</Segment>)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-sm text-pmuted" aria-live="polite">
          <strong className="num text-ptext">{shown.length}</strong> of {list.length} baskets{(sort === "sharpe" || minSharpe > 0) && " · Sharpe uses model monthly returns and a 6.5% risk-free rate"}{sort === "dd" && " · Smallest fall first"}
        </p>
        {filtered && <button type="button" className="chip" onClick={reset}><span aria-hidden>✕</span> Reset filters</button>}
      </div>

      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((s) => (
          <BasketCard
            key={s.slug} s={s} level="h2"
            extra={
              <div className="num mt-3 grid grid-cols-2 gap-2 border-t border-pline pt-3 text-sm" data-measures>
                <div><span className="block text-xs text-pmuted">Max drawdown (biggest fall)</span><b className="down">▼ {Math.abs(s.maxDd).toFixed(1)}%</b></div>
                <div><span className="block text-xs text-pmuted">Sharpe ratio</span><b>{s.sharpe.toFixed(2)}</b></div>
              </div>
            }
          />
        ))}
      </div>
      {shown.length === 0 && (
        <div className="card mt-6 p-10 text-center">
          <p className="font-semibold">No baskets match.</p>
          <button className="btn btn-ghost mt-4" onClick={reset}>Clear filters</button>
        </div>
      )}
    </div>
  );
}
