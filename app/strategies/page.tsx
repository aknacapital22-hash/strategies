import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs, graph, pageMeta, webPage } from "@/lib/seo";
import { abs } from "@/lib/site";
import { strategies, DATA_AS_OF } from "@/lib/strategies";
import { minimumFor } from "@/lib/minimum";
import { sharpeRatio } from "@/lib/growth";
import { cardData } from "@/lib/cards";
import { PAST_NOTE } from "@/lib/plain";
import StrategyExplorer from "@/components/StrategyExplorer";
import Words from "@/components/Words";

const TITLE = `${strategies.length} Rules-Based Stock Baskets: Returns and Risk`;
const DESCRIPTION = `Compare ${strategies.length} rules-based Indian stock baskets: back-tested growth, index comparison, risk level and starting amount. Past data, not a promise.`;
export const metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: "/strategies" });

export default function Strategies() {
  const list = [...strategies].sort((a, b) => b.cagr - a.cagr);
  const cards = list.map((s) => ({ ...cardData(s), cagr: s.cagr, maxDd: s.maxDd, minimumValue: minimumFor(s.slug), sharpe: sharpeRatio(s.monthly) }));
  return (
    <div className="wrap py-10 md:py-14">
      <JsonLd data={graph(
        {
          ...webPage("CollectionPage", TITLE, DESCRIPTION, "/strategies"),
          mainEntity: { "@type": "ItemList", numberOfItems: list.length, itemListElement: list.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: abs(`/strategies/${s.slug}`) })) },
        },
        breadcrumbs(["All baskets", "/strategies"]),
      )} />
      <p className="eyebrow">All baskets</p>
      <h1 className="h1 mt-4 max-w-4xl !text-[clamp(1.75rem,3.4vw,2.5rem)]">Pick your basket. See what ₹1 lakh would have become.</h1>
      <p className="lead mt-4 max-w-3xl">
        {list.length} ready-made share lists. Tap one to see every number. The number of years is different for each, so check that too. Prices up to {DATA_AS_OF}.
      </p>
      <p className="mt-3 max-w-3xl text-sm text-pmuted">{PAST_NOTE}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link href="/start" className="btn btn-primary">🎯 See which basket suits you →</Link>
      </div>
      <Words className="mt-6" />
      <div className="mt-8"><StrategyExplorer list={cards} /></div>
    </div>
  );
}
