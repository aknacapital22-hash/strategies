import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getBasket } from "@/lib/auth/basket";
import { RENEW_WINDOW_DAYS, canRequest, payHref } from "@/lib/subscription";
import { requestSubscription } from "@/app/auth/actions";
import { strategies } from "@/lib/strategies";
import { ALL_ACCESS, ALL_ACCESS_PRICE, FOUR_QUARTERS, NOTIFY_LINE, PLANS, YEARLY_SAVING, dateIN, inr, isBasketPlan, perMonth } from "@/lib/pricing";

export const metadata = { title: "Subscribe to a basket" };

export function generateStaticParams() {
  return strategies.map((s) => ({ slug: s.slug }));
}

const includes = [
  "Every stock in the basket, with weights, sectors and prices",
  "Each rebalance, with the trades to review before you approve",
  "Your broker places the orders; shares stay in your demat",
  "No lock-in, and renewing never loses days you have paid for",
];

async function Inner({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ plan?: string; change?: string }> }) {
  const { slug } = await params;
  const { plan: asked, change } = await searchParams;
  const wanted = isBasketPlan(asked) ? asked : "year";
  const s = strategies.find((x) => x.slug === slug);
  if (!s) notFound();
  const here = `/subscribe/${slug}`;
  const { user, state } = await getBasket(slug);
  // One short path: sign up (or log in) comes back here, then a single click subscribes.
  if (!user) redirect(`/signup?next=${encodeURIComponent(here)}`);
  const activeUntil = state.kind === "active" ? state.until : null; // renewing adds time on top
  const request = state.kind === "pending" || state.kind === "active" ? state.request : undefined;

  // Already paid up, or already waiting: say so, and show no payment form.
  const waiting = !!request && !(change === "1" && canRequest(state));
  if (waiting || (state.kind === "active" && !canRequest(state))) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link href={`/strategies/${slug}`} className="text-sm font-medium text-aink hover:underline">← {s.name} details</Link>
        <div className="card mt-4 p-6 md:p-8" data-basket-state={state.kind}>
          <span className="badge badge-teal">{waiting ? "Waiting for approval" : "Subscribed"}</span>
          <h1 className="mt-4 text-2xl font-extrabold md:text-3xl">{waiting ? (request?.slug === ALL_ACCESS ? `All Access, which includes ${s.name}, is waiting for approval` : `You have already asked for ${s.name}`) : `You are already subscribed to ${s.name}`}</h1>
          {activeUntil && <p className="mt-3">Your plan is active until <b>{dateIN(activeUntil)}</b>.</p>}
          <p className="mt-2 text-sm text-pmuted">
            {waiting
              ? activeUntil
                ? "Your renewal is waiting for us to confirm the payment. There is nothing more to subscribe to."
                : "The holdings open as soon as we confirm your payment. You do not need to subscribe again."
              : state.kind === "active" && state.viaAll
                ? "It is included in your All Access plan, so there is nothing to pay for it."
                : `There is nothing to pay now. You can renew in the last ${RENEW_WINDOW_DAYS} days of your plan.`}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {activeUntil && <Link href={`/strategies/${slug}#holdings`} className="btn btn-primary">View holdings →</Link>}
            {waiting && request && <Link href={payHref(request.slug, request.id)} className={`btn ${activeUntil ? "btn-ghost" : "btn-primary"}`}>Payment status</Link>}
            {waiting && request && request.slug === slug && !request.utr && <Link href={`/subscribe/${slug}?change=1`} className="btn btn-ghost">Change plan</Link>}
            <Link href="/portfolios" className="btn btn-ghost">My baskets</Link>
          </div>
        </div>
      </div>
    );
  }
  const renewing = !!activeUntil || state.kind === "expired";

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={`/strategies/${slug}`} className="text-sm font-medium text-aink hover:underline">← {s.name} details</Link>
      <div className="card mt-4 p-6 md:p-8">
        <span className="badge badge-teal">{renewing ? "Renew" : "Subscribe"}</span>
        <h1 className="mt-4 text-2xl font-extrabold md:text-3xl">{s.name}</h1>
        <p className="mt-1 text-sm text-pmuted">{s.kind} · {s.risk} risk</p>

        <dl className="num mt-6 grid grid-cols-3 gap-3 rounded-xl border border-pline bg-page p-4 text-sm">
          <div><dt className="text-[11px] text-pmuted">CAGR, model</dt><dd className="up font-bold">▲ {s.cagr.toFixed(1)}%</dd></div>
          <div><dt className="text-[11px] text-pmuted">Max drawdown</dt><dd className="down font-bold">▼ {Math.abs(s.maxDd).toFixed(1)}%</dd></div>
          <div><dt className="text-[11px] text-pmuted">Minimum investment</dt><dd className="font-bold">{s.minimum}</dd></div>
        </dl>

        <ul className="mt-6 space-y-2.5 text-sm">
          {includes.map((c) => (
            <li key={c} className="flex items-start gap-2.5"><span className="mt-0.5 text-gink" aria-hidden>✓</span>{c}</li>
          ))}
        </ul>

        {activeUntil && <p className="mt-4 rounded-xl bg-page3 p-3 text-sm">You are active until <b>{dateIN(activeUntil)}</b>. Renewing adds the new period on top of the days you have left.</p>}
        <form action={requestSubscription} className="mt-7">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="next" value={`/strategies/${slug}#holdings`} />
          <fieldset>
            <legend className="text-sm font-semibold">Choose a plan</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {([PLANS.quarter, PLANS.year] as const).map((p) => (
                <label key={p.id} className="relative flex cursor-pointer flex-col rounded-2xl border border-pline p-4 has-[:checked]:border-[var(--accent-ink)] has-[:checked]:bg-aink/5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--accent-ink)]">
                  <input type="radio" name="plan" value={p.id} defaultChecked={p.id === wanted} className="sr-only" />
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                    {p.name}
                    {p.id === "year" && <span className="rounded-full bg-[var(--gain-ink)]/12 px-2 py-0.5 text-[11px] up">Save {inr(YEARLY_SAVING)}</span>}
                  </span>
                  <span className="num mt-2 text-2xl font-extrabold">{inr(p.price)}<span className="text-sm font-medium text-pmuted"> / {p.per}</span></span>
                  <span className="num mt-1 text-xs text-pmuted">about {inr(perMonth(p.id))} a month · {p.days} days of access</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button className="btn btn-primary mt-6 w-full !py-3">Continue to payment</button>
        </form>
        <p className="mt-2 text-center text-xs text-pmuted">{NOTIFY_LINE}</p>
        <p className="mt-4 rounded-xl border border-dashed border-pline p-3 text-center text-sm">
          Want more than one basket? <Link href={`/subscribe/${ALL_ACCESS}`} className="font-semibold text-aink hover:underline">Unlock all baskets for {ALL_ACCESS_PRICE} a year →</Link>
        </p>
        <p className="mt-3 text-center text-xs text-pmuted">
          You pay by UPI on the next page, and your plan is switched on after we confirm the payment. Prices are per basket. The yearly plan costs {inr(YEARLY_SAVING)} less than
          four quarters ({inr(FOUR_QUARTERS)}). Figures are model, back tested; you can lose money.
        </p>
      </div>
    </div>
  );
}

export default function SubscribePage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ plan?: string; change?: string }> }) {
  return (
    <div className="wrap py-10 md:py-14">
      <Suspense fallback={<div className="card mx-auto h-96 max-w-2xl" aria-busy />}>
        <Inner params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
