// Educational articles for /blog. Not investment advice.
export type Section = { h: string; p: string[] };
export type Post = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string; // ISO
  updated?: string;
  keywords: string[];
  intro: string;
  sections: Section[];
  related: string[];
};

export const AUTHOR = "AKNA Capital research team";

export const posts: Post[] = [
  {
    slug: "what-is-quant-investing",
    title: "What is quant investing? A plain-English guide for Indian investors",
    description: "Quant investing picks stocks with fixed, data-driven rules instead of opinions. Learn how it works, where it can fail, and how to judge a quant strategy.",
    category: "Basics",
    date: "2026-11-02",
    keywords: ["quant investing", "systematic investing India", "rules-based investing", "quantitative strategies"],
    intro: "Quant investing replaces gut feel with written rules. Instead of asking a manager which stocks look good this week, a quant strategy applies the same fixed process to the same data every time. This guide explains how that works and what it does not do.",
    sections: [
      { h: "The core idea: a rule, not a prediction", p: [
        "A quant strategy is a recipe. It defines a universe of stocks (for example, the Nifty 100), a score used to rank them (such as recent price momentum or earnings quality), how many to hold, and when to review the list.",
        "The rule does not forecast the market. It says what to hold today under the recipe, and it will say the same thing to anyone who feeds it the same data.",
      ] },
      { h: "What makes it different from stock tips", p: [
        "A tip is an opinion that cannot be checked. A rule can be tested on past data, inspected, and repeated. If the rule changes, you can see that it changed.",
        "That repeatability also removes a common problem: selling in panic or buying in excitement. The rule keeps running whatever the headlines say.",
      ] },
      { h: "Common building blocks", p: [
        "Most quant strategies mix a few well-studied ideas, often called factors. Momentum favours stocks that have recently risen. Quality favours companies with steady profits and low debt. Value favours stocks that look cheap against their earnings or assets. Low volatility favours stocks that swing less.",
        "Each factor works in some periods and lags in others, which is why many strategies combine them or rotate between them.",
      ] },
      { h: "Where quant investing can go wrong", p: [
        "Quant does not mean safe. A strategy can fall sharply when the factor it relies on goes out of favour. A rule that looked excellent in a back test can fail if it was fitted too closely to the past.",
        "Costs also matter. Frequent trading adds brokerage, taxes and price impact, and these reduce what you actually keep.",
      ] },
      { h: "How to judge a quant strategy", p: [
        "Read the rule, check the maximum drawdown before the return, look at results across several market phases, and compare against the right index over the same dates. If any of these are hidden, treat that as a warning.",
        "Remember that every back tested figure is a model and not a promise. Past results can be higher than what a live investor earns.",
      ] },
    ],
    related: ["how-to-read-a-backtest", "momentum-investing-explained", "max-drawdown-explained"],
  },
  {
    slug: "how-to-read-a-backtest",
    title: "How to read a back test without being fooled",
    description: "A back test shows how a rule would have performed on past data. Learn the five checks that separate a useful back test from a flattering one.",
    category: "Research",
    date: "2026-11-05",
    keywords: ["backtest", "back tested returns", "survivorship bias", "how to evaluate a strategy"],
    intro: "A back test replays a rule on past prices as if it had been followed at the time. It is useful evidence, but it is easy to make one look better than reality. These five checks help you read one critically.",
    sections: [
      { h: "1. Check the start and end dates", p: [
        "A test that begins at a market low looks far better than one that begins at a peak. Ask whether the period includes both rising and falling markets, and whether the dates were chosen after the fact.",
      ] },
      { h: "2. Look for survivorship bias", p: [
        "If a back test uses today's index members, it quietly leaves out companies that fell out of the index along the way. The past then looks better than it was, because the losers were removed.",
      ] },
      { h: "3. Ask what costs are included", p: [
        "Brokerage, taxes, exchange charges and the gap between the price you see and the price you get all reduce returns. A back test that ignores them overstates what an investor keeps.",
      ] },
      { h: "4. Beware of over-fitting", p: [
        "If a rule was tuned until it matched the past perfectly, it may simply have memorised noise. Simpler rules with a clear reason behind them tend to hold up better than rules with many tuned settings.",
      ] },
      { h: "5. Compare with the right benchmark", p: [
        "Beating the Nifty 50 with a small-cap strategy says little, because small and large companies behave differently. Compare against an index that matches the universe the strategy picks from.",
      ] },
      { h: "A back test is evidence, not a promise", p: [
        "Use a back test to understand how a rule behaves, especially how far it has fallen, rather than to predict next year's return. Treat headline numbers with caution until you have checked these five points.",
      ] },
    ],
    related: ["max-drawdown-explained", "cagr-vs-average-returns", "what-is-quant-investing"],
  },
  {
    slug: "max-drawdown-explained",
    title: "Max drawdown explained: the number to check before the return",
    description: "Maximum drawdown is the biggest fall from a peak to a later low. Learn how to read it, why it matters, and how to decide how much fall you can handle.",
    category: "Risk",
    date: "2026-11-08",
    keywords: ["max drawdown", "investment risk", "drawdown meaning", "risk management investing"],
    intro: "Most people look at returns first. A better habit is to look at the maximum drawdown first, because it shows what holding the strategy actually felt like at its worst.",
    sections: [
      { h: "What max drawdown means", p: [
        "Max drawdown is the largest fall from a high point to the lowest point that followed, before a new high was reached. If a portfolio rose to ₹100, dropped to ₹64, and later recovered, its drawdown was 36%.",
      ] },
      { h: "Why losses are harder to recover than they look", p: [
        "A 50% fall needs a 100% gain to get back to even. The deeper the drawdown, the longer and harder the recovery, which is why two strategies with the same return can feel very different to hold.",
      ] },
      { h: "Drawdown and time under water", p: [
        "Depth is only half the story. Also check how long a strategy stayed below its previous peak. A shallow but very long drawdown can test patience as much as a deep short one.",
      ] },
      { h: "How to use it", p: [
        "Imagine your own portfolio dropping by that percentage. Would you keep investing, or sell? If you would sell, the strategy is too aggressive for you, whatever its return.",
        "Remember that the worst fall in a back test is not a limit. A future fall can be deeper than any in the past data.",
      ] },
    ],
    related: ["how-to-read-a-backtest", "cagr-vs-average-returns", "momentum-investing-explained"],
  },
  {
    slug: "cagr-vs-average-returns",
    title: "CAGR vs average returns: why the difference matters",
    description: "Average returns can hide losses. CAGR shows the steady yearly rate that turns your start amount into your end amount. Here is how to use it.",
    category: "Basics",
    date: "2026-11-11",
    keywords: ["CAGR", "compound annual growth rate", "average return vs CAGR", "investment returns explained"],
    intro: "Two investments can have the same average return and very different outcomes. CAGR is the figure that tells you what actually happened to your money.",
    sections: [
      { h: "What CAGR is", p: [
        "CAGR, or compound annual growth rate, is the steady yearly rate that would turn your starting amount into your ending amount over the period. It smooths out the ups and downs into one comparable number.",
      ] },
      { h: "Why the simple average misleads", p: [
        "Gain 50% in one year and lose 50% the next. The average is 0%, but ₹100 becomes ₹150 and then ₹75, so you are 25% down. Losses and gains compound, so the order and size of returns matter.",
      ] },
      { h: "A quick worked example", p: [
        "If ₹1,00,000 grows to about ₹2,49,000 in five years, the CAGR is roughly 20% a year, even though no single year was exactly 20%.",
      ] },
      { h: "Limits of CAGR", p: [
        "CAGR hides the path. A strategy can reach the same CAGR through a smooth climb or a wild ride. Always read it together with the maximum drawdown and the start and end dates.",
      ] },
    ],
    related: ["max-drawdown-explained", "how-to-read-a-backtest", "what-is-quant-investing"],
  },
  {
    slug: "momentum-investing-explained",
    title: "Momentum investing explained: buying what is already working",
    description: "Momentum strategies favour stocks with strong recent price trends. Learn why it has worked in some markets, when it struggles, and what to watch for.",
    category: "Strategies",
    date: "2026-11-14",
    keywords: ["momentum investing", "momentum strategy India", "factor investing", "Nifty momentum"],
    intro: "Momentum is one of the most studied ideas in investing: stocks that have risen recently tend, on average, to keep rising for a while. It is simple to state and harder to live with.",
    sections: [
      { h: "How a momentum rule works", p: [
        "A momentum strategy ranks stocks in a universe by their recent price change over a set window, holds the top group, and refreshes the list on a schedule. Stocks that lose strength drop out and stronger ones replace them.",
      ] },
      { h: "Why it can work", p: [
        "Researchers point to investors reacting slowly to news, and to crowds that keep buying what is rising. Whatever the cause, the pattern has appeared in many markets over long periods, though not in every period.",
      ] },
      { h: "When momentum struggles", p: [
        "Momentum can reverse sharply when the market turns, because yesterday's leaders are often the first to be sold. Strategies with few holdings or frequent changes can swing more and cost more to trade.",
      ] },
      { h: "What to check before using it", p: [
        "Look at the maximum drawdown, the number of holdings, how often the portfolio changes, and the cost of that trading. A high return paired with a deep fall is a trade-off, not a free gain.",
      ] },
    ],
    related: ["rebalancing-explained", "max-drawdown-explained", "what-is-quant-investing"],
  },
  {
    slug: "rebalancing-explained",
    title: "What is rebalancing, and why do rules-based portfolios do it?",
    description: "Rebalancing resets a portfolio back to its rules. Learn why it matters, how often it happens, and what it costs in trades.",
    category: "Basics",
    date: "2026-11-17",
    keywords: ["rebalancing", "portfolio rebalancing", "rebalance frequency", "systematic investing"],
    intro: "Over time, a portfolio drifts away from its original plan. Rebalancing is the scheduled review that brings it back in line with the rules.",
    sections: [
      { h: "What happens at a rebalance", p: [
        "On a set date, the rule is applied again to current data. Stocks that no longer qualify are sold, new ones that qualify are bought, and weights are reset. The result is a portfolio that matches the strategy as of that day.",
      ] },
      { h: "How often is often enough", p: [
        "Some strategies rebalance every few weeks, others every quarter or year. More frequent changes react faster but trade more, which raises costs. Less frequent changes trade less but may hold stocks longer after the signal fades.",
      ] },
      { h: "The cost of trading", p: [
        "Each trade can bring brokerage, statutory charges and taxes. Before following a strategy, estimate how much trading it does in a year and what that costs you.",
      ] },
      { h: "Staying in control", p: [
        "A good setup shows you every proposed buy and sell, with the reason, before anything happens, and lets you approve through your own broker so shares stay in your demat account.",
      ] },
    ],
    related: ["momentum-investing-explained", "what-is-quant-investing", "how-to-read-a-backtest"],
  },
];

export const bySlug = (slug: string) => posts.find((p) => p.slug === slug);
export const sorted = () => [...posts].sort((a, b) => b.date.localeCompare(a.date));
export const readingMinutes = (p: Post) => {
  const words = [p.intro, ...p.sections.flatMap((s) => [s.h, ...s.p])].join(" ").split(/\s+/).length;
  return Math.max(2, Math.round(words / 200));
};
export const fmtDate = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
