import raw from "./strategies.json";

// Model, back tested strategy data, rebuilt from the engine by engine/site_data.py.
export type Strategy = {
  slug: string;
  name: string;
  kind: string;
  risk: string;
  universe: string;
  cagr: number;
  maxDd: number;
  minimum: string;
  summary: string;
  backtest: string;
  growth?: { start: string; end: string; model: number; nifty: number };
  calendar: { year: string; note: string; ret: number }[];
  monthly: { y: number; m: number; r: number }[];
  drawdowns: { depth: number; when: string; days: string }[];
  rolling: { label: string; worst: number; median: number; best: number; positive: number | null; windows: number | null }[];
  holdings: { sym: string; weight: number | null; tag: string | null }[];
  sleeves: { name: string; weight: number }[];
  sectors: { name: string; weight: number }[];
  startDate: string;
  benchmark: { name: string; note: string; proxy: boolean; cagr: number; maxDd: number; growth: number; monthly: { y: number; m: number; r: number }[]; calendar: { year: string; ret: number }[] };
  rebalances: { count?: string; latest?: string; next?: string };
};

import { fullLabel, minimumFor, shortLabel } from "./minimum";

// The source data lists its own minimum for each strategy. Here each basket's minimum is worked out from the
// prices and weights of its current stocks (capped at ₹2 lakh), in the field and in the sentence that quotes it.
/** The last day covered by the back tests. */
export const DATA_AS_OF = (raw as Strategy[])[0].growth!.end;

export const strategies = (raw as Strategy[]).map((s) => {
  const min = minimumFor(s.slug);
  return {
    ...s,
    minimum: shortLabel(min),
    summary: s.summary.replace(/minimum about ₹[0-9,]+( \(as of [^)]*\))?/, `minimum investment ${fullLabel(min)}`),
  };
});

/** Lowest and highest minimum across all baskets, for headings. */
export const minimumRange = () => {
  const all = strategies.map((s) => minimumFor(s.slug));
  return { low: Math.min(...all), high: Math.max(...all) };
};

export { growthSeries } from "./growth";

export const pct = (n: number, d = 1) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(d)}%`;
