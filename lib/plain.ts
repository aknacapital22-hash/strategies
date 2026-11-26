// Everyday words for the figures and labels, so every page explains things the same way.
// No data import here, so client components can use these without bundling strategies.json.

/** A value on the "100 became" scale, read as what ₹1 lakh became: 355 is "₹3.55 lakh". */
export const lakh = (per100: number) => `₹${(per100 / 100).toFixed(2)} lakh`;

/** How long the past-data test ran, from dates like "22 Nov 2021": "5 years" or "4.3 years". */
export function duration(start: string, end: string): string {
  const years = (Date.parse(end) - Date.parse(start)) / (365.25 * 24 * 3600 * 1000);
  const n = parseFloat(years.toFixed(1));
  return `${n} year${n === 1 ? "" : "s"}`;
}

/** Said next to every "would have become" figure. */
export const PAST_NOTE = "This is from old prices, not real money. The future can be different, and you can lose money.";

const RISK_WORDS: Record<string, string> = { Moderate: "Medium", "Moderately High": "Medium-high", High: "High", "Very High": "Very high" };
export const riskWord = (risk: string) => RISK_WORDS[risk] ?? risk;

const KIND_WORDS: Record<string, string> = {
  Momentum: "Shares only",
  Hybrid: "Shares + safer fund",
  "Multi asset": "Shares, safer fund + gold",
  "Dynamic multi asset": "Shares, safer fund + gold",
  Thematic: "One industry",
};
export const kindWord = (kind: string) => KIND_WORDS[kind] ?? kind;

/** What each basket buys, in one sentence. Keep in step with the "universe" line the engine writes. */
const ABOUT: Record<string, string> = {
  "focused-alpha-5": "Just 5 shares that have been rising strongly.",
  allcap: "Shares of large, medium and small companies.",
  "dynamic-asset-allocator": "Shares, plus safer holdings such as a debt fund or gold.",
  "midcap-smallcap": "Shares of medium-sized and small companies.",
  microcap: "Shares of very small companies.",
  "large-midcap": "Shares of large and medium-sized companies.",
  midcap: "Shares of medium-sized companies.",
  "largemid-multi-asset": "Shares of large and medium companies, plus a debt fund and a gold fund.",
  "large-mid-hybrid": "Shares of large and medium companies, plus a debt fund.",
  "energy-basket": "Shares of energy companies only.",
  "focused-largecap-15": "Shares picked from India's 100 largest companies.",
  "healthcare-basket": "Shares of health and medicine companies only.",
  "largecap-multi-asset": "Shares of large companies, plus a debt fund and a gold fund.",
  "largecap-hybrid": "Shares of large companies, plus a debt fund.",
  "allcap-multi-asset": "Shares of all sizes of company, plus a debt fund and a gold fund.",
};
export const aboutBasket = (slug: string) => ABOUT[slug] ?? "A ready-made list of shares that follows fixed rules.";

/** "every week" / "every 2 weeks", read from the engine's universe line. */
export function howOften(universe: string): string {
  const m = universe.match(/every (?:(\d+) )?weeks?/);
  if (!m) return "from time to time";
  return !m[1] || m[1] === "1" ? "every week" : `every ${m[1]} weeks`;
}

export const WORDS: [string, string][] = [
  ["Basket", "A ready-made list of shares (sometimes with a fund too), picked by fixed rules."],
  ["Share", "A tiny part of a company. Its price goes up and down."],
  ["Share app (broker)", "The app or company you use to buy and sell shares, such as Zerodha."],
  ["Your share account (demat)", "Your own account where your shares are kept. You open it through your share app."],
  ["The market (index)", "A standard list of companies, such as Nifty 50. It shows how shares did in general. We compare each basket with one."],
  ["Debt fund", "A fund that mostly lends money to the government or companies. Its price usually moves much less than shares, but it can still fall."],
  ["List update (rebalance)", "On fixed dates the list is checked. Some shares may be sold and others bought."],
  ["Test on old prices (back test)", "We use the rules on old prices to see what would have happened. No real money was used."],
  ["Growth per year (CAGR)", "The steady yearly growth that would turn the first amount into the final amount. Real years are never this even."],
  ["Sharpe ratio", "A score that compares the growth with the ups and downs. A higher number means more growth for the same ups and downs."],
  ["Biggest fall (drawdown)", "The largest drop from a high point. After a 25% fall, ₹1 lakh would be ₹75,000."],
  ["Does the start day matter? (rolling returns)", "The results for every possible starting day, not just one."],
];
