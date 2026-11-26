/** Shown in small print wherever someone is choosing or following a basket. */
export const NOTIFY_LINE = "We email you at every list update.";
/** What the back tested returns do and do not take off. It must stay true to COST in engine/engine.py. */
export const RETURNS_NOTE =
  "Growth numbers show how each basket's rules would have done on old prices, not with real money. We have taken out a guess for trading costs (0.32% of every amount bought or sold). We have not taken out our price, other share-app charges, small price changes while you buy or sell, or tax.";

// One place for the prices, so every page and calculation agrees. Prices are per basket.
export type PlanId = "month" | "quarter" | "year" | "all";

export const PLANS: Record<PlanId, { id: PlanId; name: string; price: number; days: number; per: string; months: number }> = {
  month: { id: "month", name: "Monthly", price: 999, days: 30, per: "month", months: 1 },
  quarter: { id: "quarter", name: "3 Months", price: 2799, days: 90, per: "3 months", months: 3 },
  year: { id: "year", name: "Yearly", price: 9999, days: 365, per: "year", months: 12 },
  all: { id: "all", name: "All Access", price: 59999, days: 365, per: "year", months: 12 },
};

/** All Access is bought like a basket, under this name, and opens every basket. */
export const ALL_ACCESS = "all-access";
export const BASKET_COUNT = 15;
/** What the All Access plan saves against a yearly plan for every basket. */
export const ALL_ACCESS_SAVING = PLANS.year.price * BASKET_COUNT - PLANS.all.price;
/** All Access is only sold as All Access, and the basket plans only for one basket. */
export const planFits = (slug: string, plan: PlanId) => (slug === ALL_ACCESS) === (plan === "all");

export const isPlan = (x: unknown): x is PlanId => x === "month" || x === "quarter" || x === "year" || x === "all";
export const isBasketPlan = (x: unknown): x is "month" | "quarter" | "year" => x === "month" || x === "quarter" || x === "year";

export const inr = (n: number, d = 0) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d });

export const MONTH = inr(PLANS.month.price); // "₹999"
export const QUARTER = inr(PLANS.quarter.price); // "₹2,799"
export const YEAR = inr(PLANS.year.price); // "₹9,999"
/** Short line used in buttons and summaries. */
export const PRICE_LINE = `${MONTH} a month, ${QUARTER} for 3 months or ${YEAR} a year`;
/** The plans one basket is sold on, in the order they are shown. */
export const BASKET_PLANS = [PLANS.month, PLANS.quarter, PLANS.year] as const;
export const ALL_ACCESS_PRICE = inr(PLANS.all.price); // "₹59,999"

/** What four quarterly payments cost, and what the yearly plan saves against that. */
/** A plan's price spread over its days, rounded up so it is never understated. */
export const perDay = (plan: PlanId) => inr(Math.ceil(PLANS[plan].price / PLANS[plan].days));
export const PER_DAY = perDay("year");

/** Twelve monthly payments, and what the yearly plan saves against them. */
export const TWELVE_MONTHS = PLANS.month.price * 12; // 11,988
export const SAVING_ON_MONTHLY = TWELVE_MONTHS - PLANS.year.price; // 1,989

export const FOUR_QUARTERS = PLANS.quarter.price * 4; // 11,196
export const YEARLY_SAVING = FOUR_QUARTERS - PLANS.year.price; // 1,197

/** A plan's price over a year, as a share of the money you put in (monthly is paid twelve times, quarterly four). */
export const yearlyCost = (plan: PlanId, baskets = 1) => PLANS[plan].price * (12 / PLANS[plan].months) * baskets;
export const costPercent = (plan: PlanId, capital: number, baskets = 1) => (capital > 0 ? (yearlyCost(plan, baskets) / capital) * 100 : 0);
export const perMonth = (plan: PlanId, baskets = 1) => Math.round((PLANS[plan].price * baskets) / PLANS[plan].months);

export const dateIN = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

// Each basket's minimum is worked out from its own stocks (see lib/minimum.ts) and no basket may go above this.
export const MAX_MINIMUM_INVESTMENT = 200000;
