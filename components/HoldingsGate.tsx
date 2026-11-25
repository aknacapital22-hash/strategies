import Link from "next/link";
import { getBasket } from "@/lib/auth/basket";
import { payHref, type BasketState } from "@/lib/subscription";
import { ALL_ACCESS, ALL_ACCESS_PRICE, PRICE_LINE, dateIN } from "@/lib/pricing";
import { engine } from "@/lib/engine";
import { strategies } from "@/lib/strategies";
import PortfolioTable from "./PortfolioTable";
import Rebalance from "./Rebalance";
import RebalanceLog from "./RebalanceLog";
import { minimumFor } from "@/lib/minimum";

/** The lock panel. Holds no holdings data, so nothing leaks to people who are not subscribed. */
export function Locked({ slug, name, loggedIn, returnTo, state }: { slug: string; name: string; loggedIn: boolean; returnTo: string; state: BasketState }) {
  const q = encodeURIComponent(returnTo);
  const waiting = state.kind === "pending";
  const lapsed = state.kind === "expired";
  return (
    <div className="card relative overflow-hidden p-8 md:p-10">
      <div className="grid-lines absolute inset-0 opacity-40" aria-hidden />
      <div className="relative max-w-xl">
        <p className="eyebrow">Subscribers only</p>
        <h3 className="mt-3 text-2xl font-bold">{waiting ? "Your request is waiting for approval" : lapsed ? `Your ${name} plan has ended` : `The ${name} holdings are for subscribers`}</h3>
        <p className="mt-2 text-pmuted">
          {waiting
            ? "The holdings open as soon as we confirm your payment. If you have not paid yet, the payment page shows how."
            : lapsed
              ? `It ended on ${dateIN(state.until)}. Renew to see the holdings again.`
              : loggedIn
                ? "Subscribe to this basket to see every stock it holds, with weights, sectors and prices."
                : "Log in and subscribe to this basket to see every stock it holds, with weights, sectors and prices."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {loggedIn ? (
            <Link href={state.kind === "pending" ? payHref(state.request.slug, state.request.id) : `/subscribe/${slug}`} className="btn btn-primary">
              {waiting ? "Payment status" : lapsed ? `Renew ${name}` : `Subscribe to ${name}`}
            </Link>
          ) : (
            <>
              <Link href={`/login?next=${q}`} className="btn btn-primary">Log in</Link>
              <Link href={`/signup?next=${q}`} className="btn btn-ghost">Create account</Link>
            </>
          )}
        </div>
        {!waiting && (
          <>
            <p className="num mt-4 text-sm font-medium">{PRICE_LINE} <span className="font-normal text-pmuted">per basket</span></p>
            <p className="mt-1 text-xs text-pmuted">Pay by UPI; your plan is switched on after we confirm the payment.</p>
            <p className="mt-2 text-sm"><Link href={`/subscribe/${ALL_ACCESS}`} className="font-medium text-aink hover:underline">Or unlock all baskets for {ALL_ACCESS_PRICE} a year →</Link></p>
          </>
        )}
      </div>
    </div>
  );
}

/** One strategy's holdings, shown only if the signed-in user subscribes to it. Call inside <Suspense>. */
export default async function HoldingsGate({ slug, returnTo }: { slug: string; returnTo: string }) {
  const { user, state } = await getBasket(slug);
  const s = strategies.find((x) => x.slug === slug);
  const e = engine[slug];
  if (!s) return null;
  if (!user || !user.subs.includes(slug) || !e) {
    return <Locked slug={slug} name={s.name} loggedIn={!!user} returnTo={returnTo} state={state} />;
  }
  const top = Math.max(1, ...s.sectors.map((x) => x.weight));
  return (
    <>
      <p className="max-w-3xl text-pmuted">
        {e.portfolio.length} lines in the latest model portfolio (signal {e.portfolioAsOf}), rebalanced every {e.config.everyWeeks} week
        {e.config.everyWeeks > 1 ? "s" : ""}. A model, not a recommendation.
      </p>
      <div className="mt-6"><PortfolioTable rows={e.portfolio} /></div>
      <div className="mt-10"><RebalanceLog log={e.changes} schedule={e.schedule} /></div>
      <div className="mt-8">
        <Rebalance
          basket={s.name}
          asOf={e.portfolioAsOf}
          minimum={s.minimum}
          minimumAmount={minimumFor(slug)}
          targets={e.portfolio.map((r) => ({ symbol: r.symbol, weight: r.weight, price: r.price }))}
        />
      </div>
      {s.sectors.length > 0 && (
        <>
          <h3 className="mt-12 text-xl font-semibold">Sector allocation</h3>
          <ul className="card mt-4 space-y-4 p-6">
            {s.sectors.map((x) => (
              <li key={x.name} className="text-sm">
                <div className="flex justify-between"><span>{x.name}</span><span className="num text-pmuted">{x.weight}%</span></div>
                <div className="mt-1.5 h-2 rounded-full bg-page3"><div className="h-2 rounded-full bg-aink" style={{ width: `${(x.weight / top) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
