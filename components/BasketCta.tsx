// The buttons for one basket on its strategy page, chosen by where the visitor stands with it.
import Link from "next/link";
import { PER_DAY, PRICE_LINE, dateIN } from "@/lib/pricing";
import { payHref, type BasketState } from "@/lib/subscription";

type Action = { href: string; label: string };

/**
 * A jump within this page ("#holdings") is a plain anchor: next/link added the hash a second time on the next click
 * and stopped scrolling. Anything else is a normal Link.
 */
function Go({ href, className, children }: { href: string; className: string; children: React.ReactNode }) {
  return href.startsWith("#") ? <a href={href} className={className}>{children}</a> : <Link href={href} className={className}>{children}</Link>;
}

/** The main thing to do next, and sometimes a second. */
export function basketActions(slug: string, s: BasketState): { main: Action; other?: Action } {
  const holdings = { href: "#holdings", label: "View holdings" };
  const subscribe = `/subscribe/${slug}`;
  if (s.kind === "active") {
    if (s.request) return { main: holdings, other: { href: payHref(slug, s.request.id), label: "Renewal status" } };
    if (s.canRenew) return { main: holdings, other: { href: subscribe, label: "Renew" } };
    return { main: holdings, other: { href: "#rebalance", label: "Rebalance" } };
  }
  if (s.kind === "pending") return { main: { href: payHref(s.request.slug, s.request.id), label: "Payment status" } };
  if (s.kind === "expired") return { main: { href: subscribe, label: "Renew" } };
  return { main: { href: subscribe, label: "See what's inside" } };
}

export function basketNote(s: BasketState): string {
  if (s.kind === "active") {
    if (s.viaAll) return `Your plan is on till ${dateIN(s.until)}.`;
    if (s.request) return `Subscribed, active until ${dateIN(s.until)}. Your renewal is waiting for approval.`;
    if (s.canRenew) return `Your plan ends on ${dateIN(s.until)}. Renewing adds time on top of the days you have left.`;
    return `You are subscribed. Active until ${dateIN(s.until)}.`;
  }
  if (s.kind === "pending") return "Your request is waiting for us to confirm the payment.";
  if (s.kind === "expired") return `Your plan ended on ${dateIN(s.until)}.`;
  return `${PRICE_LINE}. Yearly is about ${PER_DAY} a day. No auto-payment. Past growth does not promise future growth.`;
}

/** Under the title: buttons and a line saying where you stand. */
export function HeroView({ slug, state }: { slug: string; state: BasketState }) {
  const { main, other } = basketActions(slug, state);
  return (
    <div data-basket-state={state.kind}>
      <div className="flex flex-wrap items-center gap-3">
        <Go href={main.href} className="btn btn-primary !px-6 !py-3">{main.label} →</Go>
        {other && <Go href={other.href} className="btn btn-ghost !px-6 !py-3">{other.label}</Go>}
        {state.kind !== "active" && <a href="#performance" className="btn btn-ghost !px-6 !py-3">See how it grew</a>}
      </div>
      <p className="mt-2 text-xs text-pmuted">{basketNote(state)}</p>
    </div>
  );
}

/** The button that stays in the sticky section bar. */
export function BarView({ slug, state }: { slug: string; state: BasketState }) {
  const { main } = basketActions(slug, state);
  const label = state.kind === "none" ? "Get it" : main.label;
  return <Go href={main.href} className="btn btn-primary !min-h-0 !py-1.5 whitespace-nowrap">{label}</Go>;
}

/** The banner near the bottom of the page. */
export function BannerView({ slug, name, state }: { slug: string; name: string; state: BasketState }) {
  const { main, other } = basketActions(slug, state);
  return (
    <>
      <div>
        <h2 className="h2 !text-white">{state.kind === "active" ? `You are subscribed to ${name}` : `Curious what ${name} has right now?`}</h2>
        <p className="mt-2 text-sm text-teal-100/90">{state.kind === "none" ? `See every share, how much to put in each, and how many to buy. About ${PER_DAY} a day on the yearly plan.` : basketNote(state)}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Go href={main.href} className="btn btn-light">{main.label}</Go>
        {other && <Go href={other.href} className="btn btn-outline-light">{other.label}</Go>}
        {state.kind === "none" && <Link href="/start" className="btn btn-outline-light">Not sure? Answer 3 questions</Link>}
      </div>
    </>
  );
}
