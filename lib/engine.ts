import raw from "../engine/out/results.json";

export type EnginePortfolioRow = { symbol: string; weight: number; sector: string | null; price: number | null };
export type EngineResult = {
  config: { universe: string; maxPrice: number; holdings: number; everyWeeks: number; sleeves: number[] | null; start: string };
  metrics: { cagr: number; maxDd: number; vol: number; sharpe: number };
  benchmarkCagr: number;
  publishedCagr: number | null;
  turnoverPerYear: number;
  calendar: Record<string, number>;
  monthly: { y: number; m: number; r: number }[];
  curve: [string, number][];
  portfolioAsOf: string;
  portfolio: EnginePortfolioRow[];
  publishedLatestDate: string;
  overlapWithPublishedLatest: number;
  rebalances: number;
  /** Newest first. "pending" is the latest signal, whose trades happen at the next session. */
  changes: { signal: string; exec: string | null; status: "done" | "pending"; in: string[]; out: string[]; size: number }[];
  schedule: { everyWeeks: number; lastSignal: string; next: string };
};

export const engine = raw as unknown as Record<string, EngineResult>;

/** Cadence and next date only: safe to show to everyone, no stock names. */
export const scheduleFor = (slug: string) => engine[slug]?.schedule ?? null;
