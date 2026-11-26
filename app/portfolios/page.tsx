import { Suspense } from "react";
import Link from "next/link";
import { strategies } from "@/lib/strategies";
import { getViewer } from "@/lib/auth/basket";
import { basketState, payHref } from "@/lib/subscription";
import { dateIN } from "@/lib/pricing";
import { scheduleFor } from "@/lib/engine";
import { aboutBasket, duration, lakh, riskWord, kindWord } from "@/lib/plain";
import Sparkline from "@/components/Sparkline";

export const metadata = { title: "My baskets", robots: { index: false, follow: true } };

// Only the baskets this person has an active plan for. Others are found under All strategies.
// Holdings are never rendered here: they open on each basket's own page.
async function Baskets() {
  const { user, pending } = await getViewer();

  if (!user) {
    return (
      <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 p-6">
        <p className="max-w-xl"><b>Log in to see your baskets.</b> The baskets you subscribe to appear here.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/login?next=/portfolios" className="btn btn-primary">Log in</Link>
          <Link href="/strategies" className="btn btn-ghost">See all baskets</Link>
        </div>
      </div>
    );
  }

  const mine = strategies.filter((s) => user.subs.includes(s.slug)).sort((a, b) => b.cagr - a.cagr);
  // A request still waiting is not a subscription yet, so it is not listed: just a way to follow it up.
  const waiting = pending.filter((r) => !user.subs.includes(r.slug));
  const nameOf = (slug: string) => strategies.find((s) => s.slug === slug)?.name ?? slug;

  return (
    <>
      {waiting.length > 0 && (
        <div className="mt-6 rounded-xl border border-pline bg-page3 p-4 text-sm" data-waiting>
          <p className="font-semibold">Waiting for approval. A basket appears below once your payment is confirmed.</p>
          <ul className="mt-2 space-y-1">
            {waiting.map((r) => (
              <li key={r.id}>
                {nameOf(r.slug)} · <Link href={payHref(r.slug, r.id)} className="font-medium text-aink hover:underline">Payment status</Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mine.length === 0 ? (
        <div className="card mt-6 p-8 text-center" data-empty>
          <p className="text-lg font-semibold">You have no subscribed baskets yet</p>
          <p className="mt-2 text-sm text-pmuted">Choose a basket and subscribe. It will appear here once your plan is active.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/strategies" className="btn btn-primary">See all baskets</Link>
            <Link href="/account" className="btn btn-ghost">My account</Link>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-6 text-pmuted" data-summary>
            <b className="text-ptext">{mine.length}</b> subscribed. <Link href="/account" className="font-medium text-aink hover:underline">Manage subscriptions →</Link>
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((s) => {
              const state = basketState(user, s.slug, pending);
              if (state.kind !== "active") return null;
              const next = scheduleFor(s.slug)?.next;
              return (
                <article key={s.slug} className="card flex flex-col p-6" data-basket={s.slug}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="chip">{kindWord(s.kind)}</span>
                    <span className="rounded-full bg-[var(--gain-ink)]/12 px-2.5 py-1 text-xs font-semibold up">● Subscribed</span>
                  </div>

                  <h2 className="mt-4 text-xl font-semibold">{s.name}</h2>
                  <p className="mt-1 text-sm text-pmuted">{aboutBasket(s.slug)}</p>
                  <div className="mt-4"><Sparkline s={s} /></div>

                  <dl className="num mt-4 grid grid-cols-3 gap-2 border-t border-pline pt-4 text-sm">
                    <div><dt className="text-[11px] text-pmuted">₹1 lakh became*</dt><dd className="up font-bold">{lakh(s.growth!.model)}</dd><dd className="text-[11px] text-pmuted">in {duration(s.growth!.start, s.growth!.end)}</dd></div>
                    <div><dt className="text-[11px] text-pmuted">Risk</dt><dd className="font-bold">{riskWord(s.risk)}</dd></div>
                    <div><dt className="text-[11px] text-pmuted">Start with</dt><dd className="font-bold">{s.minimum}</dd></div>
                  </dl>

                  <p className="mt-2 text-[11px] text-pmuted">* From old prices. This is not your own result.</p>
                  {next && <p className="num mt-3 text-xs text-pmuted" data-next>Next list update {dateIN(next)}</p>}
                  <p className="num mt-1 text-xs text-pmuted">
                    Active until {dateIN(state.until)}
                    {state.request ? " · renewal waiting for approval" : state.canRenew ? ` · ${state.daysLeft} day${state.daysLeft === 1 ? "" : "s"} left` : ""}
                  </p>

                  <div className="mt-auto flex flex-wrap gap-2 pt-5">
                    <Link href={`/strategies/${s.slug}#holdings`} className="btn btn-primary !min-h-0 !py-2">View holdings →</Link>
                    <Link href={`/strategies/${s.slug}#rebalance`} className="btn btn-ghost !min-h-0 !py-2">Rebalance</Link>
                    {state.canRenew && <Link href={`/subscribe/${s.slug}`} className="btn btn-ghost !min-h-0 !py-2">Renew</Link>}
                    {state.request && <Link href={payHref(s.slug, state.request.id)} className="btn btn-ghost !min-h-0 !py-2">Renewal status</Link>}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

export default function PortfoliosPage() {
  return (
    <div className="wrap py-10 md:py-14">
      <p className="eyebrow">Baskets</p>
      <h1 className="h1 mt-4 !text-[clamp(1.75rem,3.4vw,2.5rem)]">My baskets</h1>
      <p className="lead mt-4 max-w-3xl">Your baskets are here. Open one to see what is inside and what to buy or sell.</p>
      <Suspense fallback={<div className="card mt-8 h-64" aria-busy />}>
        <Baskets />
      </Suspense>
    </div>
  );
}
