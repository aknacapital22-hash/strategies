"use client";

import Link from "next/link";
import { useState } from "react";
import { SparkSvg } from "./Sparkline";
import { PAST_NOTE, duration, lakh } from "@/lib/plain";
import type { CardData } from "./BasketCard";

const AMOUNTS = [100000, 200000, 500000, 1000000];
const label = (n: number) => `₹${n / 100000} lakh`;

/** "What would my money have become?" Past figures only, scaled to the chosen amount. It never projects ahead. */
export default function MoneyCalculator({ baskets, first }: { baskets: CardData[]; first: string }) {
  const [amount, setAmount] = useState(AMOUNTS[0]);
  const [slug, setSlug] = useState(first);
  const s = baskets.find((b) => b.slug === slug) ?? baskets[0];
  const best = baskets.reduce((a, b) => (b.value > a.value ? b : a));
  const times = amount / 100000;
  const result = s.value * times, index = s.bmValue * times; // on the "₹1 lakh = 100" scale, so lakh() reads it
  const extra = result - index;
  const top = Math.max(result, index);

  return (
    <div className="card p-5 md:p-6" data-calculator>
      <p className="text-base font-bold">💰 See what your money could have become</p>

      <div className="mt-3 grid grid-cols-4 gap-1.5" role="group" aria-label="Amount">
        {AMOUNTS.map((a) => (
          <button key={a} type="button" aria-pressed={amount === a} onClick={() => setAmount(a)} className="chip !justify-center !px-1 !py-2">{label(a)}</button>
        ))}
      </div>
      <label className="mt-3 block text-xs text-pmuted">Pick a basket
        <select value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 w-full rounded-xl border border-pline bg-page px-3 py-2.5 text-sm font-semibold text-ptext outline-none focus:border-[var(--accent-ink)]">
          {baskets.map((b) => <option key={b.slug} value={b.slug}>{b.name}{b.slug === best.slug ? " (top result in the test)" : ""}</option>)}
        </select>
      </label>

      <div className="mt-4 rounded-2xl bg-[var(--gain-ink)]/10 p-4" aria-live="polite">
        <p className="text-sm text-pmuted">{label(amount)} would have become</p>
        <p className="num up mt-1 text-5xl font-extrabold" data-result>{lakh(result)}</p>
        <p className="mt-1 text-sm text-pmuted">in {duration(s.start, s.end)} ({s.start} to {s.end})</p>
        {result > times * 100 && <p className="num up mt-2 text-lg font-bold" data-gain>+{lakh(result - times * 100)} added</p>}
        <p className="num mt-3 inline-block rounded-full bg-page2 px-3 py-1.5 text-sm font-bold">
          {extra >= 0 ? "🏆 " : ""}{lakh(Math.abs(extra))} {extra >= 0 ? "more" : "less"} than the market
        </p>
        <div className="mt-3 text-[var(--gain-ink)]" aria-hidden><SparkSvg line={s.spark} /></div>
      </div>

      <ul className="mt-4 space-y-3">
        {([[`${s.name} basket`, result, "bg-aink"], [`Market (${s.bmName})`, index, "bg-[var(--page-muted)] opacity-60"]] as const).map(([name, v, tone]) => (
          <li key={name} className="text-sm">
            <div className="flex justify-between gap-3"><span>{name}</span><b className="num">{lakh(v)}</b></div>
            <div className="mt-1.5 h-2.5 rounded-full bg-page3" aria-hidden><div className={`h-2.5 rounded-full transition-all duration-500 ${tone}`} style={{ width: `${(v / top) * 100}%` }} /></div>
          </li>
        ))}
      </ul>

      <Link href={`/strategies/${s.slug}#holdings`} className="btn btn-primary mt-5 w-full !py-3.5 !text-base">See what&apos;s inside {s.name} →</Link>
      <p className="mt-3 text-xs leading-relaxed text-pmuted">
        {s.slug === best.slug ? `This is the top result of our ${baskets.length} baskets. Others did less. ` : ""}
        Our price and tax are not taken out. {PAST_NOTE} <Link href={`/strategies/${s.slug}#risk`} className="font-medium text-aink hover:underline">See the risks</Link>
      </p>
    </div>
  );
}
