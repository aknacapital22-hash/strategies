import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/basket";
import { basketState, payHref } from "@/lib/subscription";
import { logout, unsubscribe } from "@/app/auth/actions";
import { strategies } from "@/lib/strategies";
import { PRICE_LINE, dateIN } from "@/lib/pricing";
import { shortId } from "@/lib/payment";
import ConfirmButton from "@/components/ConfirmButton";
import { duration, lakh, riskWord } from "@/lib/plain";

export const metadata = { title: "My account", robots: { index: false, follow: false } };

async function Account() {
  const { user, requests: reqs, pending: waiting } = await getViewer();
  if (!user) redirect("/login?next=/account");
  const list = [...strategies].sort((a, b) => b.cagr - a.cagr);
  const mine = list.filter((s) => user.subs.includes(s.slug));
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

      <h2 className="mt-12 text-2xl font-bold">All baskets</h2>
      <p className="mt-2 text-sm text-pmuted">Prices per basket: {PRICE_LINE}. You pay by UPI, and a plan is switched on after we confirm the payment.</p>
      <p className="mt-1 text-xs text-pmuted">* From old prices, not real money. The future can be different.</p>
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
                <p className="num text-sm text-pmuted">₹1 lakh became {lakh(s.growth!.model)} in {duration(s.growth!.start, s.growth!.end)}* · {riskWord(s.risk)} risk</p>
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
