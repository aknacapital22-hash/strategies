// The buttons for one basket on its strategy page, chosen by where the visitor stands with it.
import Link from "next/link";
import { getBasket } from "@/lib/auth/basket";
import { PLANS, dateIN, inr } from "@/lib/pricing";
import { payHref, type BasketState } from "@/lib/subscription";

type Action = { href: string; label: string };

/** The main thing to do next, and sometimes a second. */
export function basketActions(slug: string, s: BasketState): { main: Action; other?: Action } {
  const holdings = { href: `/strategies/${slug}#holdings`, label: "View holdings" };
  const subscribe = `/subscribe/${slug}`;
  if (s.kind === "active") {
    if (s.request) return { main: holdings, other: { href: payHref(slug, s.request.id), label: "Renewal status" } };
    if (s.canRenew) return { main: holdings, other: { href: subscribe, label: "Renew" } };
    return { main: holdings, other: { href: `/strategies/${slug}#rebalance`, label: "Rebalance" } };
  }
  if (s.kind === "pending") return { main: { href: payHref(s.request.slug, s.request.id), label: "Payment status" } };
  if (s.kind === "expired") return { main: { href: subscribe, label: "Renew" } };
  return { main: { href: subscribe, label: `Subscribe from ${inr(PLANS.quarter.price)}` } };
}

export function basketNote(s: BasketState): string {
  if (s.kind === "active") {
    if (s.viaAll) return `Included in your All Access plan, active until ${dateIN(s.until)}.`;
    if (s.request) return `Subscribed, active until ${dateIN(s.until)}. Your renewal is waiting for approval.`;
    if (s.canRenew) return `Your plan ends on ${dateIN(s.until)}. Renewing adds time on top of the days you have left.`;
    return `You are subscribed. Active until ${dateIN(s.until)}.`;
  }
  if (s.kind === "pending") return s.viaAll ? "Your All Access request is waiting for us to confirm the payment." : "Your request is waiting for us to confirm the payment.";
  if (s.kind === "expired") return `Your plan ended on ${dateIN(s.until)}.`;
  return "Per basket · no lock-in · model, back tested, not a promise of returns.";
}

/** Under the title: buttons and a line saying where you stand. */
export async function HeroCta({ slug }: { slug: string }) {
  const { state } = await getBasket(slug);
  const { main, other } = basketActions(slug, state);
  return (
    <div data-basket-state={state.kind}>
      <div className="flex flex-wrap items-center gap-3">
        <Link href={main.href} className="btn btn-primary !px-6 !py-3">{main.label} →</Link>
        {other && <Link href={other.href} className="btn btn-ghost !px-6 !py-3">{other.label}</Link>}
        {state.kind !== "active" && <a href="#performance" className="btn btn-ghost !px-6 !py-3">See the track record</a>}
      </div>
      <p className="mt-2 text-xs text-pmuted">{basketNote(state)}</p>
    </div>
  );
}

/** The button that stays in the sticky section bar. */
export async function BarCta({ slug }: { slug: string }) {
  const { state } = await getBasket(slug);
  const { main } = basketActions(slug, state);
  const label = state.kind === "none" ? "Subscribe" : main.label;
  return <Link href={main.href} className="btn btn-primary !min-h-0 !py-1.5 whitespace-nowrap">{label}</Link>;
}

/** The banner near the bottom of the page. */
export async function BannerCta({ slug, name }: { slug: string; name: string }) {
  const { state } = await getBasket(slug);
  const { main, other } = basketActions(slug, state);
  return (
    <>
      <div>
        <h2 className="h2 !text-white">{state.kind === "active" ? `You are subscribed to ${name}` : `See what ${name} holds today`}</h2>
        <p className="mt-2 text-sm text-teal-100/90">{state.kind === "none" ? "Every stock, its weight, and a rebalance calculator for your broker." : basketNote(state)}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href={main.href} className="btn btn-light">{main.label}</Link>
        {other && <Link href={other.href} className="btn btn-outline-light">{other.label}</Link>}
        {state.kind === "none" && <Link href="/start" className="btn btn-outline-light">Not sure? Take the quiz</Link>}
      </div>
    </>
  );
}
