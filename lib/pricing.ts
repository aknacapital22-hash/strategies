/** Shown in small print wherever someone is choosing or following a basket. */
export const NOTIFY_LINE = "Each rebalance will be notified to you via email.";
/** What the back tested returns do and do not take off. It must stay true to COST in engine/engine.py. */
export const RETURNS_NOTE =
  "Returns shown are model, back tested. They are after an estimate of 0.32% of the value traded for trading charges, and before your subscription fee, any other broker charges, price slippage and tax on gains.";

// One place for the prices, so every page and calculation agrees. Prices are per basket.
export type PlanId = "quarter" | "year" | "all";

export const PLANS: Record<PlanId, { id: PlanId; name: string; price: number; days: number; per: string; months: number }> = {
  quarter: { id: "quarter", name: "Quarterly", price: 3999, days: 90, per: "quarter", months: 3 },
  year: { id: "year", name: "Yearly", price: 14999, days: 365, per: "year", months: 12 },
  all: { id: "all", name: "All Access", price: 59999, days: 365, per: "year", months: 12 },
};

/** All Access is bought like a basket, under this name, and opens every basket. */
export const ALL_ACCESS = "all-access";
export const BASKET_COUNT = 15;
/** What the All Access plan saves against a yearly plan for every basket. */
export const ALL_ACCESS_SAVING = PLANS.year.price * BASKET_COUNT - PLANS.all.price;
/** All Access is only sold as All Access, and the basket plans only for one basket. */
export const planFits = (slug: string, plan: PlanId) => (slug === ALL_ACCESS) === (plan === "all");

export const isPlan = (x: unknown): x is PlanId => x === "quarter" || x === "year" || x === "all";
export const isBasketPlan = (x: unknown): x is "quarter" | "year" => x === "quarter" || x === "year";

export const inr = (n: number, d = 0) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d });

export const QUARTER = inr(PLANS.quarter.price); // "₹3,999"
export const YEAR = inr(PLANS.year.price); // "₹14,999"
/** Short line used in buttons and summaries. */
export const PRICE_LINE = `${QUARTER} a quarter or ${YEAR} a year`;
export const ALL_ACCESS_PRICE = inr(PLANS.all.price); // "₹59,999"

/** What four quarterly payments cost, and what the yearly plan saves against that. */
export const FOUR_QUARTERS = PLANS.quarter.price * 4; // 15,996
export const YEARLY_SAVING = FOUR_QUARTERS - PLANS.year.price; // 997

/** A plan's price spread over a year, as a share of the money you put in (quarterly is paid four times a year). */
export const yearlyCost = (plan: PlanId, baskets = 1) => (plan === "year" ? PLANS.year.price : PLANS.quarter.price * 4) * baskets;
export const costPercent = (plan: PlanId, capital: number, baskets = 1) => (capital > 0 ? (yearlyCost(plan, baskets) / capital) * 100 : 0);
export const perMonth = (plan: PlanId, baskets = 1) => Math.round((PLANS[plan].price * baskets) / PLANS[plan].months);

export const dateIN = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

// Each basket's minimum is worked out from its own stocks (see lib/minimum.ts) and no basket may go above this.
export const MAX_MINIMUM_INVESTMENT = 200000;
