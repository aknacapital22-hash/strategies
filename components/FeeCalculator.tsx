"use client";

import { useState } from "react";
import { PLANS, YEARLY_SAVING, costPercent, inr, perMonth, yearlyCost, type PlanId } from "@/lib/pricing";

const presets = [300000, 500000, 1000000, 2500000];

export default function FeeCalculator() {
  const [plan, setPlan] = useState<PlanId>("year");
  const [baskets, setBaskets] = useState(1);
  const [capital, setCapital] = useState(500000);

  const p = PLANS[plan];
  const total = p.price * baskets;
  const pct = costPercent(plan, capital, baskets);

  return (
    <div className="card p-6 md:p-8">
      <fieldset>
        <legend className="text-sm font-medium">Plan</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {([PLANS.quarter, PLANS.year] as const).map((x) => (
            <button
              key={x.id} type="button" aria-pressed={plan === x.id} onClick={() => setPlan(x.id)}
              className={`rounded-xl border px-4 py-3 text-left transition ${plan === x.id ? "border-[var(--accent-ink)] bg-aink/5" : "border-pline"}`}
            >
              <span className="block text-sm font-semibold">{x.name}{x.id === "year" && <span className="up ml-2 text-[11px]">Save {inr(YEARLY_SAVING)}</span>}</span>
              <span className="num mt-1 block text-lg font-bold">{inr(x.price)}<span className="text-xs font-medium text-pmuted"> / {x.per}</span></span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        <label htmlFor="baskets" className="text-sm font-medium">Baskets: <span className="num">{baskets}</span></label>
        <input id="baskets" type="range" min={1} max={15} value={baskets} onChange={(e) => setBaskets(Number(e.target.value))} className="mt-2 w-full" />
      </div>

      <div className="mt-6">
        <label className="text-sm font-medium" htmlFor="cap">Total amount you invest (₹)</label>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-pline bg-page px-4 py-3 focus-within:border-[var(--accent-ink)]">
          <span className="text-pmuted">₹</span>
          <input
            id="cap" type="number" inputMode="numeric" min={0} value={capital}
            onChange={(e) => setCapital(Math.max(0, Number(e.target.value) || 0))}
            className="num w-full bg-transparent text-lg font-semibold outline-none"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((v) => (
            <button key={v} type="button" className="chip" aria-pressed={capital === v} onClick={() => setCapital(v)}>
              {v >= 100000 ? `₹${v / 100000}L` : `₹${v / 1000}K`}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 border-t border-pline pt-6">
        <div>
          <p className="text-xs text-pmuted">You pay each {p.per}</p>
          <p className="num mt-1 text-3xl font-bold md:text-4xl" aria-live="polite">{inr(total)}</p>
          <p className="num mt-1 text-xs text-pmuted">about {inr(perMonth(plan, baskets))} a month</p>
        </div>
        <div>
          <p className="text-xs text-pmuted">Cost over a year, as a share of your money</p>
          <p className="num mt-1 text-3xl font-bold md:text-4xl" aria-live="polite">{capital > 0 ? `${pct.toFixed(pct < 10 ? 2 : 1)}%` : "-"}</p>
          <p className="num mt-1 text-xs text-pmuted">{inr(yearlyCost(plan, baskets))} a year</p>
        </div>
      </div>
      <p className="mt-5 text-xs leading-relaxed text-pmuted">
        {baskets} basket{baskets > 1 ? "s" : ""} × {inr(p.price)} = {inr(total)} per {p.per}. The price is flat, so it weighs less on a larger amount.
        Brokerage, STT, exchange charges and GST are separate, charged by your broker.
      </p>
    </div>
  );
}
