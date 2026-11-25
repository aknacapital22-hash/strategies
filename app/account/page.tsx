import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/basket";
import { basketState, payHref, type BasketState } from "@/lib/subscription";
import { logout, unsubscribe } from "@/app/auth/actions";
import { requestsFor } from "@/lib/auth/store";
import { strategies } from "@/lib/strategies";
import { ALL_ACCESS, ALL_ACCESS_PRICE, ALL_ACCESS_SAVING, PRICE_LINE, dateIN, inr } from "@/lib/pricing";
import { shortId } from "@/lib/payment";
import ConfirmButton from "@/components/ConfirmButton";

export const metadata = { title: "My account", robots: { index: false, follow: false } };

function AllAccessCard({ state }: { state: BasketState }) {
  const request = state.kind === "pending" || state.kind === "active" ? state.request : undefined;
  return (
    <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 !border-[var(--accent-ink)] p-5" data-all-access={state.kind}>
      <div>
        <p className="font-bold">All Access: every basket</p>
        <p className="num mt-1 text-sm text-pmuted">
          {state.kind === "active" ? `Active until ${dateIN(state.until)}` : state.kind === "pending" ? "Waiting for us to confirm your payment" : state.kind === "expired" ? `Ended ${dateIN(state.until)}` : `${ALL_ACCESS_PRICE} a year, ${inr(ALL_ACCESS_SAVING)} less than every basket separately`}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {request && <Link href={payHref(ALL_ACCESS, request.id)} className="btn btn-ghost !min-h-0 !py-2">Payment status</Link>}
        {state.kind === "active" && state.canRenew && <Link href={`/subscribe/${ALL_ACCESS}`} className="btn btn-ghost !min-h-0 !py-2">Renew</Link>}
        {state.kind === "active" && (
          <form action={unsubscribe}>
            <input type="hidden" name="slug" value={ALL_ACCESS} />
            <input type="hidden" name="next" value="/account" />
            <ConfirmButton message="Cancel All Access? Baskets without a plan of their own will close straight away." className="btn btn-ghost !min-h-0 !py-2 text-xs">Cancel</ConfirmButton>
          </form>
        )}
        {(state.kind === "none" || state.kind === "expired") && <Link href={`/subscribe/${ALL_ACCESS}`} className="btn btn-primary !min-h-0 !py-2">{state.kind === "expired" ? "Renew All Access" : "Unlock all baskets"}</Link>}
      </div>
    </div>
  );
}

async function Account() {
  const { user, pending: waiting } = await getViewer();
  if (!user) redirect("/login?next=/account");
  const list = [...strategies].sort((a, b) => b.cagr - a.cagr);
  const mine = list.filter((s) => user.subs.includes(s.slug));
  const reqs = await requestsFor(user.id); // newest first
  const pending = new Map(waiting.map((r) => [r.slug, r]));
  const rejected = new Map(reqs.filter((r) => r.status === "rejected").reverse().map((r) => [r.slug, r]));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="h1 mt-4 !text-[clamp(2rem,4.4vw,3rem)]">Hello, {user.name.split(" ")[0]}</h1>
          <p className="lead mt-2">{user.email}{user.phone ? ` · ${user.phone}` : ""}</p>
        </div>
        <div className="flex gap-2">
          {user.role === "admin" && <Link href="/admin" className="btn btn-ghost">Admin panel</Link>}
          <form action={logout}><button className="btn btn-ghost">Log out</button></form>
        </div>
      </div>

      <h2 className="mt-12 text-2xl font-bold">Your baskets</h2>
      {mine.length === 0 ? (
        <p className="card mt-4 p-6 text-pmuted">You have no active basket yet. Subscribe below to see its holdings.</p>
      ) : (
        <p className="mt-2 text-pmuted">{mine.length} active. <Link href="/portfolios" className="font-medium text-aink hover:underline">View their holdings →</Link></p>
      )}

      <AllAccessCard state={basketState(user, ALL_ACCESS, waiting)} />

      <h2 className="mt-12 text-2xl font-bold">All baskets</h2>
      <p className="mt-2 text-sm text-pmuted">Prices per basket: {PRICE_LINE}. You pay by UPI, and a plan is switched on after we confirm the payment.</p>
      <ul className="card mt-4 divide-y divide-[var(--page-line)]">
        {list.map((s) => {
          const on = user.subs.includes(s.slug);
          const pend = pending.get(s.slug);
          const rej = !on && !pend ? rejected.get(s.slug) : undefined;
          const mine = basketState(user, s.slug, waiting);
          return (
            <li key={s.slug} className="flex flex-wrap items-center justify-between gap-3 p-4" data-basket={s.slug}>
              <div>
                <Link href={`/strategies/${s.slug}`} className="font-semibold hover:underline">{s.name}</Link>
                <p className="num text-sm text-pmuted">{s.cagr.toFixed(1)}% CAGR, model · {s.risk} risk</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {mine.kind === "active" && <span className="num mr-2 text-xs text-pmuted">Active until {dateIN(mine.until)}{mine.canRenew ? ` · ${mine.daysLeft} day${mine.daysLeft === 1 ? "" : "s"} left` : ""}</span>}
                {mine.kind === "expired" && <span className="num mr-2 text-xs down">Ended {dateIN(mine.until)}</span>}
                {pend && (
                  <Link href={payHref(s.slug, pend.id)} className="chip !border-[var(--accent-ink)] text-aink">
                    {on ? "Renewal pending" : "Pending approval"} · {shortId(pend.id)}
                  </Link>
                )}
                {rej && <span className="text-xs down">Last request not approved</span>}
                {mine.kind === "active" && (
                  <Link href={`/strategies/${s.slug}#holdings`} className="btn btn-primary !min-h-0 !py-1.5 text-xs">View holdings</Link>
                )}
                {mine.kind === "active" && mine.canRenew && (
                  <Link href={`/subscribe/${s.slug}`} className="btn btn-ghost !min-h-0 !py-1.5 text-xs">Renew</Link>
                )}
                {on && !(mine.kind === "active" && mine.viaAll) && (
                  <form action={unsubscribe}>
                    <input type="hidden" name="slug" value={s.slug} />
                    <input type="hidden" name="next" value="/account" />
                    <ConfirmButton message={`Cancel your ${s.name} subscription? You will lose access to its holdings straight away.`} className="btn btn-ghost !min-h-0 !py-1.5 text-xs">Cancel</ConfirmButton>
                  </form>
                )}
                {mine.kind === "pending" && mine.viaAll && <span className="text-xs text-pmuted">Included in your All Access request</span>}
                {!on && !pend && mine.kind !== "pending" && <Link href={`/subscribe/${s.slug}`} className="btn btn-primary !min-h-0 !py-2">{mine.kind === "expired" ? "Renew" : "Subscribe"}</Link>}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function AccountPage() {
  return (
    <div className="wrap max-w-3xl py-10 md:py-14">
      <Suspense fallback={<div className="card h-64" aria-busy />}>
        <Account />
      </Suspense>
    </div>
  );
}
