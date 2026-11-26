import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getBasket } from "@/lib/auth/basket";
import { RENEW_WINDOW_DAYS, canRequest, payHref } from "@/lib/subscription";
import { requestSubscription } from "@/app/auth/actions";
import { strategies } from "@/lib/strategies";
import { PAST_NOTE, aboutBasket, duration, lakh, riskWord } from "@/lib/plain";
import { BASKET_PLANS, NOTIFY_LINE, SAVING_ON_MONTHLY, TWELVE_MONTHS, dateIN, inr, isBasketPlan, perDay } from "@/lib/pricing";

export const metadata = { title: "Subscribe to a basket", robots: { index: false, follow: true } };

export function generateStaticParams() {
  return strategies.map((s) => ({ slug: s.slug }));
}

const includes = [
  "See every share, and how much to put in each",
  "At every list update, see what to buy and sell",
  "Buy in your own share app. Your shares stay with you",
  "No lock-in or auto-payment. Renew early without losing paid days",
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
          <h1 className="mt-4 text-2xl font-extrabold md:text-3xl">{waiting ? (`You have already asked for ${s.name}`) : `You are already subscribed to ${s.name}`}</h1>
          {activeUntil && <p className="mt-3">Your plan is active until <b>{dateIN(activeUntil)}</b>.</p>}
          <p className="mt-2 text-sm text-pmuted">
            {waiting
              ? activeUntil
                ? "Your renewal is waiting for us to confirm the payment. There is nothing more to subscribe to."
                : "The holdings open as soon as we confirm your payment. You do not need to subscribe again."
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
        <h1 className="mt-4 text-2xl font-extrabold md:text-3xl">{renewing ? s.name : `You are one step away from ${s.name}`}</h1>
        <p className="mt-1 text-sm text-pmuted">{aboutBasket(s.slug)}</p>

        <dl className="num mt-6 grid grid-cols-3 gap-3 rounded-xl border border-pline bg-page p-4 text-sm">
          <div><dt className="text-[11px] text-pmuted">₹1 lakh would have become*</dt><dd className="up font-bold">{lakh(s.growth!.model)}</dd><dd className="text-[11px] text-pmuted">in {duration(s.growth!.start, s.growth!.end)}</dd></div>
          <div><dt className="text-[11px] text-pmuted">Risk</dt><dd className="font-bold">{riskWord(s.risk)}</dd></div>
          <div><dt className="text-[11px] text-pmuted">Start with just</dt><dd className="font-bold">{s.minimum}</dd></div>
        </dl>

        <p className="mt-2 text-xs text-pmuted">* {PAST_NOTE} <Link href={`/strategies/${slug}#risk`} className="font-medium text-aink hover:underline">See the risks</Link></p>

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
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {BASKET_PLANS.map((p) => (
                <label key={p.id} className="relative flex cursor-pointer flex-col rounded-2xl border border-pline p-4 has-[:checked]:border-[var(--accent-ink)] has-[:checked]:bg-aink/5 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--accent-ink)]">
                  <input type="radio" name="plan" value={p.id} defaultChecked={p.id === wanted} className="sr-only" />
                  <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                    {p.name}
                    {p.id === "year" && <span className="rounded-full bg-[var(--gain-ink)]/12 px-2 py-0.5 text-[11px] up">Best value</span>}
                  </span>
                  <span className="num mt-2 text-2xl font-extrabold">{inr(p.price)}<span className="text-sm font-medium text-pmuted"> / {p.per}</span></span>
                  <span className="num mt-1 text-xs text-pmuted">about {perDay(p.id)} a day · {p.days} days of access</span>
                  {p.id === "year" && <span className="num up mt-1 text-xs font-semibold">{inr(SAVING_ON_MONTHLY)} less than paying monthly 12 times</span>}
                </label>
              ))}
            </div>
          </fieldset>
          <p className="mt-5 text-center text-xs text-pmuted">By continuing, you agree to our <Link href="/terms" className="font-medium text-aink hover:underline">Terms</Link> and <Link href="/refunds" className="font-medium text-aink hover:underline">Refund Policy</Link>. Please read the <Link href="/risk" className="font-medium text-aink hover:underline">Risks</Link>.</p>
          <button className="btn btn-primary mt-3 w-full !py-3.5 !text-base">Continue to payment</button>
          <p className="mt-2 text-center text-xs font-medium">✓ No auto-payment ✓ Your shares stay yours</p>
        </form>
        <p className="mt-2 text-center text-xs text-pmuted">{NOTIFY_LINE}</p>
        <p className="mt-3 text-center text-xs text-pmuted">
          Pay by UPI on the next page. We switch your plan on after we check it. The price is for one basket. Paying monthly 12 times costs {inr(TWELVE_MONTHS)}. Growth numbers are from old prices; you can lose money.
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
