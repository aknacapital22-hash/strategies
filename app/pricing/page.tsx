import Link from "next/link";
import FeeCalculator from "@/components/FeeCalculator";
import Faq from "@/components/Faq";
import { ALL_ACCESS, ALL_ACCESS_PRICE, ALL_ACCESS_SAVING, BASKET_COUNT, PLANS, YEARLY_SAVING, FOUR_QUARTERS, costPercent, inr, QUARTER, YEAR } from "@/lib/pricing";

// The flat yearly price as a share of different amounts. One 0 to 6% scale.
const SCALE = 6;
const sizes = [300000, 500000, 1000000, 2500000, 5000000];

const faqs: [string, string][] = [
  ["How do I pay?", "Choose a basket and a plan, then pay by UPI to the ID shown on the next page and send the payment screenshot to us on WhatsApp. We check it by hand, so activation takes a little while, and your plan is switched on once it is approved."],
  ["What do I pay for?", `One basket is ${QUARTER} for a quarter or ${YEAR} for a year. All Access is ${ALL_ACCESS_PRICE} a year and opens all ${BASKET_COUNT} baskets. A plan gives you the holdings, the rebalance calculator and the basket file for your broker.`],
  ["When is All Access worth it?", `From five baskets: five yearly plans cost ${inr(PLANS.year.price * 5)}, and All Access is ${ALL_ACCESS_PRICE}. Against all ${BASKET_COUNT} yearly plans it saves ${inr(ALL_ACCESS_SAVING)}.`],
  ["Which plan is cheaper?", `The yearly plan. Four quarters cost ${inr(FOUR_QUARTERS)}, so ${YEAR} saves you ${inr(YEARLY_SAVING)}.`],
  ["Is there a fee on what I trade or on my assets?", "No. The price is flat, with no fee on traded value and no fee on the amount you invest. Brokerage, STT, exchange charges, stamp duty and GST are charged separately by your broker and the exchange."],
  ["What happens when my plan ends?", "Access to that basket's holdings stops. Your shares stay in your own demat account. You can renew in the last 15 days of your plan, or any time after it ends. Days left are kept."],
  ["Is it worth it for a small amount?", "A flat price weighs more on a smaller amount. The chart shows what it costs as a share of your money, so check it against the amount you plan to invest."],
];

export const metadata = { title: "Pricing", description: "Flat pricing for one basket or all of them, with no fee on what you trade or invest. See what each plan costs.", alternates: { canonical: "/pricing" } };

export default function Pricing() {
  return (
    <div className="wrap py-10 md:py-14">
      <p className="eyebrow">What it costs</p>
      <h1 className="h1 mt-4 !text-[clamp(1.75rem,3.4vw,2.5rem)]">One basket, or all of them. No fee on your trades.</h1>
      <p className="lead mt-4 max-w-2xl">{QUARTER} a quarter or {YEAR} a year for one basket, or {ALL_ACCESS_PRICE} a year for all {BASKET_COUNT}. Cancel whenever you like.</p>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {([PLANS.quarter, PLANS.year] as const).map((p) => (
          <div key={p.id} className={`card p-6 ${p.id === "year" ? "!border-[var(--accent-ink)]" : ""}`}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{p.name}</h2>
              {p.id === "year" && <span className="rounded-full bg-[var(--gain-ink)]/12 px-2.5 py-0.5 text-xs font-semibold up">Best value · save {inr(YEARLY_SAVING)}</span>}
            </div>
            <p className="num mt-3 text-4xl font-extrabold">{inr(p.price)}<span className="text-base font-medium text-pmuted"> / {p.per}</span></p>
            <p className="mt-1 text-sm text-pmuted">per basket · {p.days} days of access</p>
            <Link href="/strategies" className="btn btn-ghost mt-5 w-full">Choose a basket</Link>
          </div>
        ))}
        <div className="card relative overflow-hidden !border-2 !border-[var(--accent-ink)] bg-aink/5 p-6" data-plan="all">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{PLANS.all.name}</h2>
            <span className="rounded-full bg-[var(--gain-ink)]/12 px-2.5 py-0.5 text-xs font-semibold up">All {BASKET_COUNT} baskets</span>
          </div>
          <p className="num mt-3 text-4xl font-extrabold">{ALL_ACCESS_PRICE}<span className="text-base font-medium text-pmuted"> / {PLANS.all.per}</span></p>
          <p className="mt-1 text-sm text-pmuted">{inr(ALL_ACCESS_SAVING)} less than {BASKET_COUNT} yearly plans</p>
          <Link href={`/subscribe/${ALL_ACCESS}`} className="btn btn-primary mt-5 w-full">Unlock all baskets →</Link>
        </div>
      </div>

      <div className="mt-12 grid items-start gap-8 md:grid-cols-2">
        <FeeCalculator />
        <div className="card p-6 md:p-8">
          <h2 className="text-lg font-semibold">Yearly plan, as a share of your money</h2>
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
          <p className="mt-5 text-xs text-pmuted">One basket, one 0 to 6% scale. For comparison, mutual funds typically charge 0.3 to 2.5% a year, and PMS and AIF about 2% plus a share of profits. The quarterly plan costs {inr(FOUR_QUARTERS)} over a year. Brokerage and taxes are separate.</p>
        </div>
      </div>
      <div className="mt-20 max-w-3xl">
        <h2 className="h2 mb-8">Pricing questions</h2>
        <Faq items={faqs} />
      </div>
    </div>
  );
}
