// Where one person stands with one basket, and what to offer them. Every page and the server action use this,
// so nobody is asked to buy what they already have. Pure functions, no database.

/** An active plan can be renewed only in its last days. Days left are never lost: renewing adds to them. */
export const RENEW_WINDOW_DAYS = 15;

import { ALL_ACCESS } from "./pricing";

export type OpenRequest = { id: string; slug: string; utr?: string };

export type BasketState =
  /** No plan and nothing waiting: a visitor, or someone who never subscribed (or cancelled). */
  | { kind: "none" }
  /** A plan ran out. */
  | { kind: "expired"; until: string }
  /** No active plan, and a payment waiting to be approved. */
  /** `viaAll`: what is waiting is an All Access request, which will open this basket too. */
  | { kind: "pending"; request: OpenRequest; viaAll?: boolean }
  /** Paid up. `canRenew` in the last days; `request` is a renewal waiting to be approved. */
  /** `viaAll`: opened by All Access, which is renewed as a whole, never basket by basket. */
  | { kind: "active"; until: string; daysLeft: number; canRenew: boolean; request?: OpenRequest; viaAll?: boolean };

type Subscriber = { subs: string[]; subExp: Record<string, string>; allAccessUntil?: string } | null;

/** While All Access runs, every basket is open until it ends (or later, if a basket's own plan runs longer). */
export function withAllAccess(subs: string[], subExp: Record<string, string>, baskets: string[]) {
  if (!subs.includes(ALL_ACCESS)) return { subs, subExp, allAccessUntil: undefined as string | undefined };
  const all = subExp[ALL_ACCESS];
  const exp = { ...subExp };
  for (const slug of baskets) if (!subs.includes(slug) || Date.parse(exp[slug]) < Date.parse(all)) exp[slug] = all;
  return { subs: [...new Set([...subs, ...baskets])], subExp: exp, allAccessUntil: all as string | undefined };
}

/** `pending` is the person's requests that are still waiting for a decision. */
export function basketState(user: Subscriber, slug: string, pending: OpenRequest[], now = Date.now()): BasketState {
  if (!user) return { kind: "none" };
  const request = pending.find((r) => r.slug === slug);
  const until = user.subExp[slug];
  if (user.subs.includes(slug) && until) {
    const daysLeft = Math.max(0, Math.ceil((Date.parse(until) - now) / 86400000));
    if (slug !== ALL_ACCESS && user.allAccessUntil) return { kind: "active", until, daysLeft, canRenew: false, viaAll: true };
    // an All Access request already waiting means no basket should also be bought
    const covered = pending.some((r) => r.slug === ALL_ACCESS);
    return { kind: "active", until, daysLeft, canRenew: !request && !covered && daysLeft <= RENEW_WINDOW_DAYS, request };
  }
  if (request) return { kind: "pending", request };
  const forAll = pending.find((r) => r.slug === ALL_ACCESS);
  if (forAll) return { kind: "pending", request: forAll, viaAll: true };
  return until ? { kind: "expired", until } : { kind: "none" };
}

/** Whether a new payment request may be started (or the plan of one that is not yet paid changed). */
export function canRequest(s: BasketState): boolean {
  if (s.kind === "none" || s.kind === "expired") return true;
  // Once a transaction ID is attached the money has been sent, so the amount must not change under it.
  if (s.kind === "pending") return !s.viaAll && !s.request.utr;
  return s.request ? !s.request.utr : s.canRenew;
}

export const payHref = (slug: string, requestId: string) => `/subscribe/${slug}/pay?r=${requestId}`;
