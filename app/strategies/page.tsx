import { strategies, minimumRange } from "@/lib/strategies";
import { shortLabel } from "@/lib/minimum";
import { sparkPath } from "@/lib/growth";
import { PRICE_LINE } from "@/lib/pricing";
import StrategyExplorer from "@/components/StrategyExplorer";

export const metadata = { title: "All strategies", description: "Compare every systematic stock strategy by model CAGR and max drawdown. Filter by type and open each rulebook and risk profile.", alternates: { canonical: "/strategies" } };

export default function Strategies() {
  const list = [...strategies].sort((a, b) => b.cagr - a.cagr);
  const cards = list.map((s) => ({ slug: s.slug, name: s.name, kind: s.kind, risk: s.risk, universe: s.universe, cagr: s.cagr, maxDd: s.maxDd, minimum: s.minimum, spark: sparkPath(s.monthly), startDate: s.startDate, bmName: s.benchmark.name, bmCagr: s.benchmark.cagr }));
  const lo = Math.min(...list.map((s) => s.cagr));
  const hi = Math.max(...list.map((s) => s.cagr));
  return (
    <div className="wrap py-10 md:py-14">
      <p className="eyebrow">The lineup</p>
      <h1 className="h1 mt-4 max-w-4xl !text-[clamp(1.75rem,3.4vw,2.5rem)]">{list.length} proprietary strategies. Each one built to beat the index.</h1>
      <p className="lead mt-4 max-w-3xl">
        {lo.toFixed(0)}% to {hi.toFixed(0)}% model CAGR · minimum investment {shortLabel(minimumRange().low)} to {shortLabel(minimumRange().high)}, worked out for each basket · {PRICE_LINE} per basket. Model, back tested, as of 13 Nov 2026.
        Higher returns came with deeper falls, so compare both.
      </p>
      <div className="mt-10"><StrategyExplorer list={cards} /></div>
    </div>
  );
}
