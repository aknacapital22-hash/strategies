import Link from "next/link";
import type { ReactNode } from "react";
import { SparkSvg } from "./Sparkline";
import { duration, kindWord, lakh, riskWord } from "@/lib/plain";

/** Only the fields a card shows, so the full strategy data never ships to the browser. */
export type CardData = { slug: string; name: string; kind: string; risk: string; about: string; minimum: string; spark: string; value: number; start: string; end: string; bmName: string; bmValue: number };

/** One basket, told the simple way: what ₹1 lakh would have become, next to the index over the same time. */
export default function BasketCard({ s, extra, level = "h3" }: { s: CardData; extra?: ReactNode; level?: "h2" | "h3" }) {
  const Title = level;
  const ahead = s.value - s.bmValue;
  return (
    <Link href={`/strategies/${s.slug}`} className="card card-link flex flex-col p-5" data-card={s.slug}>
      <span className="chip w-fit">{kindWord(s.kind)}</span>
      <Title className="mt-3 text-xl font-bold">{s.name}</Title>
      <p className="mt-1 text-sm text-pmuted">{s.about}</p>

      <div className="mt-4 rounded-xl bg-[var(--gain-ink)]/10 p-4">
        <p className="text-xs text-pmuted">₹1 lakh would have become</p>
        <p className="num up mt-1 text-3xl font-extrabold">{lakh(s.value)}</p>
        <p className="text-xs text-pmuted">in {duration(s.start, s.end)}</p>
        <p className="num mt-3 border-t border-pline pt-2 text-sm font-bold">{ahead >= 0 ? "🏆 " : ""}{lakh(Math.abs(ahead))} {ahead >= 0 ? "more" : "less"} than the market</p>
        <p className="num mt-0.5 text-xs text-pmuted">Market ({s.bmName}) gave: {lakh(s.bmValue)}</p>
      </div>
      <div className="mt-3"><SparkSvg line={s.spark} /></div>

      <dl className="num mt-3 grid grid-cols-2 gap-2 border-t border-pline pt-3 text-sm">
        <div><dt className="text-xs text-pmuted">Risk</dt><dd className="font-bold">{riskWord(s.risk)}</dd></div>
        <div><dt className="text-xs text-pmuted">Start with just</dt><dd className="font-bold">{s.minimum}</dd></div>
      </dl>
      {extra}
      <span className="mt-auto pt-4"><span className="btn btn-primary w-full">See what&apos;s inside →</span></span>
    </Link>
  );
}
