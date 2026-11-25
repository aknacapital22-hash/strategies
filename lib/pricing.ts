// One place for the prices, so every page and calculation agrees. Prices are per basket.
export type PlanId = "quarter" | "year";

export const PLANS: Record<PlanId, { id: PlanId; name: string; price: number; days: number; per: string; months: number }> = {
  quarter: { id: "quarter", name: "Quarterly", price: 3999, days: 90, per: "quarter", months: 3 },
  year: { id: "year", name: "Yearly", price: 14999, days: 365, per: "year", months: 12 },
};

export const isPlan = (x: unknown): x is PlanId => x === "quarter" || x === "year";

export const inr = (n: number, d = 0) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d });

export const QUARTER = inr(PLANS.quarter.price); // "₹3,999"
export const YEAR = inr(PLANS.year.price); // "₹14,999"
/** Short line used in buttons and summaries. */
export const PRICE_LINE = `${QUARTER} a quarter or ${YEAR} a year`;

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
