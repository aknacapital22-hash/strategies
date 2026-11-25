import Link from "next/link";
import { strategies, minimumRange, DATA_AS_OF } from "@/lib/strategies";
import { minimumFor, shortLabel } from "@/lib/minimum";
import { sharpeRatio, sparkPath } from "@/lib/growth";
import { PRICE_LINE, ALL_ACCESS, ALL_ACCESS_PRICE } from "@/lib/pricing";
import StrategyExplorer from "@/components/StrategyExplorer";

export const metadata = { title: "All strategies", description: "Compare every systematic stock strategy by model CAGR and max drawdown. Filter by type and open each rulebook and risk profile.", alternates: { canonical: "/strategies" } };

export default function Strategies() {
  const list = [...strategies].sort((a, b) => b.cagr - a.cagr);
  const cards = list.map((s) => ({ slug: s.slug, name: s.name, kind: s.kind, risk: s.risk, universe: s.universe, cagr: s.cagr, maxDd: s.maxDd, minimum: s.minimum, minimumValue: minimumFor(s.slug), sharpe: sharpeRatio(s.monthly), spark: sparkPath(s.monthly), startDate: s.startDate, bmName: s.benchmark.name, bmCagr: s.benchmark.cagr }));
  const lo = Math.min(...list.map((s) => s.cagr));
  const hi = Math.max(...list.map((s) => s.cagr));
  return (
    <div className="wrap py-10 md:py-14">
      <p className="eyebrow">The lineup</p>
      <h1 className="h1 mt-4 max-w-4xl !text-[clamp(1.75rem,3.4vw,2.5rem)]">{list.length} proprietary strategies. Each one built to beat the index.</h1>
      <p className="lead mt-4 max-w-3xl">
        {lo.toFixed(0)}% to {hi.toFixed(0)}% model CAGR · minimum investment {shortLabel(minimumRange().low)} to {shortLabel(minimumRange().high)}, worked out for each basket · {PRICE_LINE} per basket, or all baskets for {ALL_ACCESS_PRICE} a year. Model, back tested, as of {DATA_AS_OF}.
        Higher returns came with deeper falls, so compare both.
      </p>
      <p className="mt-4"><Link href={`/subscribe/${ALL_ACCESS}`} className="btn btn-primary">Unlock all baskets · {ALL_ACCESS_PRICE} a year →</Link></p>
      <div className="mt-10"><StrategyExplorer list={cards} /></div>
    </div>
  );
}
