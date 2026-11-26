import Link from "next/link";
import FeeCalculator from "@/components/FeeCalculator";
import { minimumRange } from "@/lib/strategies";
import { shortLabel } from "@/lib/minimum";
import Faq from "@/components/Faq";
import JsonLd from "@/components/JsonLd";
import { PRICING_FAQS } from "@/lib/faqs";
import { ORG_ID, breadcrumbs, faqPage, graph, pageMeta, webPage } from "@/lib/seo";
import { abs } from "@/lib/site";
import { BASKET_PLANS, NOTIFY_LINE, PER_DAY, PRICE_LINE, SAVING_ON_MONTHLY, TWELVE_MONTHS, FOUR_QUARTERS, MONTH, costPercent, inr, perDay } from "@/lib/pricing";

// How a basket compares with other ways of investing in shares.
const compare = [
  ["Money needed to start", `${shortLabel(minimumRange().low)} to ${shortLabel(minimumRange().high)}, by basket`, "Low", "₹50 lakh", "₹1 crore"],
  ["Cost", `${PRICE_LINE}, per basket`, "0.3 to 2.5% a year", "2% + 20%", "About 2% + 20%"],
  ["Who keeps your shares", "You, in your own account", "The fund", "Your account, run by them", "The fund"],
  ["Locked in?", "No", "Depends", "Depends", "Often for years"],
];

// The flat yearly price as a share of different amounts. One 0 to 6% scale.
const SCALE = 6;
const sizes = [300000, 500000, 1000000, 2500000, 5000000];

const TITLE = `Pricing: Stock Basket Plans from ${MONTH} a Month`;
const DESCRIPTION = `One basket costs ${PRICE_LINE}. A fixed price, with no fee on what you trade or invest.`;
export const metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: "/pricing" });

// The plans as sold, for search engines and assistants.
const offers = BASKET_PLANS.map((p) => ({
  "@type": "Offer", name: `${p.name} plan, one basket`,
  price: p.price, priceCurrency: "INR", url: abs("/pricing"),
}));

export default function Pricing() {
  return (
    <div className="wrap py-10 md:py-14">
      <JsonLd data={graph(
        webPage("WebPage", TITLE, DESCRIPTION, "/pricing"),
        breadcrumbs(["Pricing", "/pricing"]),
        { "@type": "Service", name: "Rules-based stock basket subscription", provider: { "@id": ORG_ID }, areaServed: "IN", offers },
        faqPage(PRICING_FAQS),
      )} />
      <p className="eyebrow">What it costs</p>
      <h1 className="h1 mt-4 !text-[clamp(1.75rem,3.4vw,2.5rem)]">Simple price. Pay only for the basket you want.</h1>
      <p className="lead mt-4 max-w-2xl">Start at {MONTH} a month. Save the most with yearly: about {PER_DAY} a day. No auto-payment.</p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {BASKET_PLANS.map((p) => (
          <div key={p.id} className={`card p-6 ${p.id === "year" ? "!border-[var(--accent-ink)]" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              {p.id === "year" && <span className="rounded-full bg-[var(--gain-ink)]/12 px-2.5 py-0.5 text-xs font-semibold up">Best value</span>}
            </div>
            <p className="num mt-3 text-4xl font-extrabold">{inr(p.price)}<span className="text-base font-medium text-pmuted"> / {p.per}</span></p>
            <p className="mt-1 text-sm text-pmuted">About {perDay(p.id)} a day · one basket · {p.days} days of access</p>
            <p className="num up mt-1 min-h-5 text-sm font-semibold">{p.id === "year" ? `${inr(SAVING_ON_MONTHLY)} less than paying monthly 12 times` : ""}</p>
            <Link href="/strategies" className={`btn mt-5 w-full ${p.id === "year" ? "btn-primary" : "btn-ghost"}`}>Choose your basket →</Link>
          </div>
        ))}
      </div>

      <p className="mt-3 text-xs text-pmuted">{NOTIFY_LINE}</p>

      <div className="mt-12 grid items-start gap-8 md:grid-cols-2">
        <FeeCalculator />
        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-semibold">Invest more, and the price feels smaller</h2>
          <p className="mt-1 text-sm text-pmuted">The yearly price next to your money</p>
          <ul className="mt-6 space-y-5">
            {sizes.map((c) => {
              const pc = costPercent("year", c);
              return (
                <li key={c}>
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="num">{inr(c)} invested</span>
                    <span className="num text-pmuted">{pc.toFixed(2)}% a year</span>
                  </div>
                  <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-page3" role="img" aria-label={`${inr(c)} invested: ${pc.toFixed(2)}% a year`}>
                    <div className="h-2.5 rounded-full bg-aink" style={{ width: `${Math.min(100, (pc / SCALE) * 100)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-5 text-xs text-pmuted">One basket, one 0 to 6% scale. For comparison, mutual funds typically charge 0.3 to 2.5% a year, and PMS and AIF about 2% plus a share of profits. Over a year, paying monthly 12 times costs {inr(TWELVE_MONTHS)} and paying quarterly 4 times costs {inr(FOUR_QUARTERS)}. Brokerage and taxes are separate.</p>
        </div>
      </div>
      <details className="card mt-8 p-5">
        <summary className="flex items-center justify-between gap-4 font-bold">
          How is this different from a mutual fund and other choices?
          <span className="plus text-2xl font-normal text-pmuted transition-transform" aria-hidden>+</span>
        </summary>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">A basket compared with mutual funds, PMS and AIF</caption>
            <thead>
              <tr className="border-b border-pline text-xs text-pmuted">
                <td className="p-3" />
                <th scope="col" className="bg-aink/10 p-3 font-bold text-aink">Our basket</th>
                <th scope="col" className="p-3 font-medium">Mutual fund</th>
                <th scope="col" className="p-3 font-medium">PMS</th>
                <th scope="col" className="p-3 font-medium">AIF</th>
              </tr>
            </thead>
            <tbody>
              {compare.map(([k, ...v]) => (
                <tr key={k} className="border-b border-pline last:border-0">
                  <th scope="row" className="p-3 font-medium">{k}</th>
                  {v.map((c, i) => <td key={i} className={`p-3 ${i === 0 ? "bg-aink/10 font-semibold" : "text-pmuted"}`}>{c}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-pmuted">PMS is a service that manages shares for you. AIF is a special kind of fund. Both are for people investing very large amounts.</p>
      </details>

      <div className="mt-20 max-w-3xl">
        <h2 className="h2 mb-8">Pricing questions</h2>
        <Faq items={PRICING_FAQS} />
      </div>
    </div>
  );
}
