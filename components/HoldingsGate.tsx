import Link from "next/link";
import type { getBasket } from "@/lib/auth/basket";
import { payHref, type BasketState } from "@/lib/subscription";
import { PER_DAY, PLANS, dateIN, inr } from "@/lib/pricing";
import { engine } from "@/lib/engine";
import { strategies } from "@/lib/strategies";
import PortfolioTable from "./PortfolioTable";
import Rebalance from "./Rebalance";
import RebalanceLog from "./RebalanceLog";
import SectorPie from "./SectorPie";
import { minimumFor } from "@/lib/minimum";

/** Blank rows that show the shape of what is locked. They carry no holdings data at all. */
function LockedRows({ count }: { count: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-pline bg-page" data-locked-preview aria-hidden>
      <div className="grid grid-cols-[2rem_1fr_5rem] gap-3 border-b border-pline px-4 py-2.5 text-xs text-pmuted"><span>#</span><span>Share</span><span className="text-right">Your money</span></div>
      <ol>
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="grid grid-cols-[2rem_1fr_5rem] items-center gap-3 border-b border-pline px-4 py-2.5 text-xs text-pmuted last:border-0">
            <span className="num">{i + 1}</span>
            <span className="h-3 rounded bg-aink/25 blur-[3px]" style={{ width: `${45 + ((i * 23) % 40)}%` }} />
            <span className="ml-auto h-3 w-10 rounded bg-aink/25 blur-[3px]" />
          </li>
        ))}
      </ol>
      <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-transparent via-page/30 to-page/80"><span className="grid h-14 w-14 place-items-center rounded-full border border-pline bg-page2 text-2xl shadow-lg">🔒</span></div>
    </div>
  );
}

/** The lock panel. Holds no holdings data, so nothing leaks to people who are not subscribed. */
export function Locked({ slug, name, loggedIn, returnTo, state, count, next }: { slug: string; name: string; loggedIn: boolean; returnTo: string; state: BasketState; count: number; next?: string }) {
  const q = encodeURIComponent(returnTo);
  const waiting = state.kind === "pending";
  const lapsed = state.kind === "expired";
  return (
    <div className="card grid gap-6 p-5 md:p-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
      <div>
        <p className="eyebrow">🔒 Locked</p>
        <h3 className="mt-3 text-2xl font-extrabold md:text-3xl">{waiting ? "Your request is waiting for approval" : lapsed ? `Your ${name} plan has ended` : `${count} picks are waiting inside ${name}`}</h3>
        {waiting || lapsed ? (
          <p className="mt-2 text-pmuted">
            {waiting
              ? "You can see inside the basket as soon as we confirm your payment. If you have not paid yet, the payment page shows how."
              : `It ended on ${dateIN((state as { until: string }).until)}. Renew to see inside the basket again.`}
          </p>
        ) : (
          <ul className="mt-4 space-y-2.5 text-sm">
            {["See the name of every share, and how much to put in each", "We work out how many to buy for your amount", "We email you at every list update"].map((c) => (
              <li key={c} className="flex items-start gap-2.5"><span className="mt-0.5 text-gink" aria-hidden>✓</span>{c}</li>
            ))}
          </ul>
        )}
        {!waiting && next && <p className="num mt-4 rounded-xl bg-page3 p-3 text-sm" data-next-check>📅 Next list update: <b>{dateIN(next)}</b>. With a plan, you get it by email.</p>}
        {!waiting && (
          <p className="num mt-5">
            <span className="text-3xl font-extrabold">About {PER_DAY} a day</span>
            <span className="mt-1 block text-sm text-pmuted">Yearly plan: {inr(PLANS.year.price)}. Or {inr(PLANS.month.price)} a month, or {inr(PLANS.quarter.price)} for 3 months. For this one basket.</span>
          </p>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {waiting && state.kind === "pending" ? (
            <Link href={payHref(state.request.slug, state.request.id)} className="btn btn-primary">Payment status</Link>
          ) : (
            <Link href={`/subscribe/${slug}`} className="btn btn-primary !px-7 !py-3.5 !text-base">{lapsed ? `Renew ${name}` : `Get ${name} →`}</Link>
          )}
          {!loggedIn && <Link href={`/login?next=${q}`} className="btn btn-ghost">Log in</Link>}
        </div>
        {!waiting && <p className="mt-3 text-xs text-pmuted">No auto-payment. Pay by UPI. We switch your plan on after we check the payment. Share prices can fall and you can lose money.</p>}
      </div>
      <LockedRows count={count} />
    </div>
  );
}

/** One strategy's holdings, shown only if the signed-in user subscribes to it. The caller reads the session. */
export default function HoldingsGate({ slug, returnTo, viewer }: { slug: string; returnTo: string; viewer: Awaited<ReturnType<typeof getBasket>> }) {
  const { user, state } = viewer;
  const s = strategies.find((x) => x.slug === slug);
  const e = engine[slug];
  if (!s) return null;
  if (!user || !user.subs.includes(slug) || !e) {
    return <Locked slug={slug} name={s.name} loggedIn={!!user} returnTo={returnTo} state={state} count={e?.portfolio.length ?? 0} next={e?.schedule.next} />;
  }
  return (
    <>
      <p className="max-w-3xl text-pmuted">
        {e.portfolio.length} picks in the latest list ({e.portfolioAsOf}). The list is checked every {e.config.everyWeeks} week
        {e.config.everyWeeks > 1 ? "s" : ""}. It follows fixed rules. It is not advice made for you.
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
          <h3 className="mt-12 text-xl font-semibold">Which industries your money is in</h3>
          <div className="mt-4"><SectorPie sectors={s.sectors} sleeves={s.sleeves} /></div>
        </>
      )}
    </>
  );
}
