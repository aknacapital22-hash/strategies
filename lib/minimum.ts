// Minimum investment for each basket, worked out from its own stocks and never above ₹2 lakh.
//
// The smallest amount that buys at least one share of every stock at its target weight is the largest of
// (share price / weight) across the basket. A small cushion covers price moves and the calculator's cash buffer,
// then it is rounded up to the next ₹5,000 so it reads cleanly.
import results from "../engine/out/results.json";
import { MAX_MINIMUM_INVESTMENT } from "./pricing";

type Row = { symbol: string; weight: number; price: number | null };

export const MIN_CUSHION = 0.02; // 2% for price moves
export const MIN_STEP = 5000;

/** The exact amount needed to hold one share of every priced stock at its weight, before rounding. */
export function exactMinimum(rows: Row[]): number | null {
  const sum = rows.reduce((a, r) => a + r.weight, 0);
  const need = rows.filter((r) => r.price && r.weight > 0).map((r) => ((r.price as number) * sum) / r.weight);
  return need.length ? Math.max(...need) / (1 - MIN_CUSHION) : null;
}

export const roundUp = (n: number, step = MIN_STEP) => Math.ceil(n / step) * step;

/** "₹95K", "₹1.2L", "₹2L": a short label for cards and tables. */
export function shortLabel(n: number): string {
  if (n >= 100000) return `₹${parseFloat((n / 100000).toFixed(2))}L`;
  return `₹${Math.round(n / 1000)}K`;
}

/** "₹1,20,000": the full amount for sentences. */
export const fullLabel = (n: number) => "₹" + n.toLocaleString("en-IN");

const table = Object.fromEntries(
  Object.entries(results as unknown as Record<string, { portfolio: Row[] }>).map(([slug, v]) => {
    const exact = exactMinimum(v.portfolio);
    const rounded = exact === null ? MAX_MINIMUM_INVESTMENT : roundUp(exact);
    return [slug, { exact, rounded, amount: Math.min(rounded, MAX_MINIMUM_INVESTMENT), exceedsCap: rounded > MAX_MINIMUM_INVESTMENT }];
  }),
);

/** The minimum for a basket: its calculated amount, capped at ₹2 lakh. */
export const minimumFor = (slug: string): number => table[slug]?.amount ?? MAX_MINIMUM_INVESTMENT;

/** Baskets whose calculated minimum is above the cap. Should always be empty (a test checks it). */
export const overCap = () => Object.entries(table).filter(([, t]) => t.exceedsCap).map(([slug]) => slug);

export const allMinimums = () => Object.values(table).map((t) => t.amount);
