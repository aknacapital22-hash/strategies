import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth/basket";
import { requestSubscription } from "@/app/auth/actions";
import { strategies } from "@/lib/strategies";
import { ALL_ACCESS, ALL_ACCESS_SAVING, PLANS, dateIN, inr } from "@/lib/pricing";
import { RENEW_WINDOW_DAYS, basketState, canRequest, payHref } from "@/lib/subscription";

export const metadata = { title: "All Access: every basket" };

async function Inner() {
  const { user, pending } = await getViewer();
  const here = `/subscribe/${ALL_ACCESS}`;
  if (!user) redirect(`/signup?next=${encodeURIComponent(here)}`);
  const state = basketState(user, ALL_ACCESS, pending);
  const plan = PLANS.all;
  const request = state.kind === "pending" || state.kind === "active" ? state.request : undefined;

  if (request || (state.kind === "active" && !canRequest(state))) {
    return (
      <div className="card mx-auto max-w-2xl p-6 md:p-8" data-basket-state={state.kind}>
        <span className="badge badge-teal">{request ? "Waiting for approval" : "Subscribed"}</span>
        <h1 className="mt-4 text-2xl font-extrabold md:text-3xl">{request ? "You have already asked for All Access" : "You already have All Access"}</h1>
        {state.kind === "active" && <p className="mt-3">Active until <b>{dateIN(state.until)}</b>.</p>}
        <p className="mt-2 text-sm text-pmuted">
          {request ? "Every basket opens as soon as we confirm your payment. You do not need to subscribe again." : `There is nothing to pay now. You can renew in the last ${RENEW_WINDOW_DAYS} days.`}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {state.kind === "active" && <Link href="/portfolios" className="btn btn-primary">View my baskets →</Link>}
          {request && <Link href={payHref(ALL_ACCESS, request.id)} className={`btn ${state.kind === "active" ? "btn-ghost" : "btn-primary"}`}>Payment status</Link>}
          <Link href="/account" className="btn btn-ghost">My account</Link>
        </div>
      </div>
    );
  }

  const own = user.paidBaskets.length;
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/pricing" className="text-sm font-medium text-aink hover:underline">← All plans</Link>
      <div className="card mt-4 p-6 md:p-8">
        <span className="badge badge-teal">{state.kind === "none" ? "All Access" : "Renew"}</span>
        <h1 className="mt-4 text-2xl font-extrabold md:text-3xl">Unlock all {strategies.length} baskets</h1>
        <p className="num mt-3 text-3xl font-extrabold">{inr(plan.price)}<span className="text-base font-medium text-pmuted"> / {plan.per}</span></p>
        <p className="mt-1 text-sm text-pmuted">{inr(ALL_ACCESS_SAVING)} less than {strategies.length} separate yearly plans.</p>
        <ul className="mt-6 space-y-2.5 text-sm">
          {[`The holdings of all ${strategies.length} baskets, with weights, sectors and prices`, "Rebalance emails and the rebalance calculator for every basket", "Your broker places the orders; shares stay in your demat", `${plan.days} days of access. Renewing never loses days you have paid for`].map((c) => (
            <li key={c} className="flex items-start gap-2.5"><span className="mt-0.5 text-gink" aria-hidden>✓</span>{c}</li>
          ))}
        </ul>
        {state.kind === "active" && <p className="mt-4 rounded-xl bg-page3 p-3 text-sm">You are active until <b>{dateIN(state.until)}</b>. Renewing adds a year on top of the days you have left.</p>}
        {state.kind !== "active" && own > 0 && (
          <p className="mt-4 rounded-xl bg-page3 p-3 text-sm">You already pay for {own} basket{own === 1 ? "" : "s"}. All Access is a separate plan: it does not refund or extend those, which keep their own end dates.</p>
        )}
        <form action={requestSubscription} className="mt-7">
          <input type="hidden" name="slug" value={ALL_ACCESS} />
          <input type="hidden" name="plan" value={plan.id} />
          <button className="btn btn-primary w-full !py-3">Continue to payment</button>
        </form>
        <p className="mt-3 text-center text-xs text-pmuted">You pay by UPI on the next page, and your plan is switched on after we confirm the payment. Figures are model, back tested; you can lose money.</p>
      </div>
    </div>
  );
}

export default function AllAccessPage() {
  return (
    <div className="wrap py-10 md:py-14">
      <Suspense fallback={<div className="card mx-auto h-96 max-w-2xl" aria-busy />}>
        <Inner />
      </Suspense>
    </div>
  );
}
