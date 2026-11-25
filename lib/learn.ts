// Learning content for /learn. Educational only, not investment advice.
export type Stop = { title: string; body: string };
export type Path = { id: string; title: string; blurb: string; stops: Stop[] };
export type Note = { title: string; body: string };
export type Topic = { id: string; title: string; blurb: string; notes: Note[] };

export const paths: Path[] = [
  {
    id: "start-here",
    title: "Start here",
    blurb: "What a stock strategy is, and how to read one of our pages without being fooled.",
    stops: [
      { title: "A strategy is a rule, not a prediction", body: "A strategy picks stocks by a fixed rule, such as the strongest recent price momentum among a set of companies. It does not forecast anything. It says what to hold today and when to review." },
      { title: "What an index is", body: "An index is a basket of stocks that tracks a part of the market, such as the Nifty 100 for large companies or the Nifty Midcap 150 for mid-sized ones. Beating an index means earning more than simply holding that basket." },
      { title: "What a back test is", body: "A back test replays a rule on past prices as if it had been followed then. It shows what the rule would have done, with the benefit of hindsight in choosing the rule. It is evidence, not a promise." },
      { title: "CAGR in one line", body: "CAGR is the steady yearly rate that turns your starting amount into the ending amount. A 20% CAGR over five years means ₹1,00,000 became about ₹2,49,000, even though no single year was exactly 20%." },
      { title: "Max drawdown is the price of the return", body: "Max drawdown is the biggest fall from a peak to a later low. A strategy with a 36% drawdown has, at some point in the test, lost more than a third of its value before recovering. Check it before the CAGR." },
      { title: "Compare with the right index", body: "Every strategy page compares the strategy with its own index over the same dates. Beating the Nifty 50 with a small-cap strategy says little, since small caps and large caps behave differently." },
      { title: "Charges are inside the numbers", body: "Model results are after an allowance for brokerage, taxes and exchange charges on each trade, but before the subscription price (₹3,999 a quarter or ₹14,999 a year per basket). Your own results also depend on the prices you actually get." },
      { title: "Check the start date", body: "A back test that begins at a market low looks better than one that begins at a high. Look at the start date, and ask whether the period included both rising and falling markets." },
      { title: "Position size and minimums", body: "A basket of 15 stocks needs enough money to buy at least one share of each at a sensible weight. That is why each basket has its own minimum, worked out from the prices of its stocks. None is above ₹2 lakh." },
      { title: "Decide what you can sit through", body: "The useful question is not how much a strategy made, but whether you would have held through its worst fall. If not, choose a lower-risk strategy." },
    ],
  },
  {
    id: "what-a-return-hides",
    title: "What a return number hides",
    blurb: "Why one headline percentage is never the whole story.",
    stops: [
      { title: "Average and compound are different", body: "Gaining 50% then losing 50% averages 0% but leaves you 25% down. Always use compound figures such as CAGR when comparing outcomes over several years." },
      { title: "The path matters", body: "Two strategies can end at the same value with very different journeys. One may have fallen 15% on the way and the other 40%. Look at the drawdown table and the monthly returns." },
      { title: "Calendar years can mislead", body: "A strategy that gained 90% in one year and lost 20% in another still has a high CAGR. Check how many years contributed most of the gain." },
      { title: "Rolling returns", body: "Rolling returns measure every possible one-year or three-year window, not only the ones that start on a chosen date. The worst window shows what a badly timed start would have cost." },
      { title: "Survivorship and look-ahead", body: "A test that only uses companies that exist today ignores those that failed. A test that uses information not available on the day flatters the result. Good back tests avoid both and say how." },
      { title: "Overfitting", body: "A rule tuned until it fits the past perfectly often fails on new data. Simple rules with few settings are more likely to hold up than complicated ones." },
      { title: "Hindsight on regimes", body: "Strategies that did well in a strong mid-cap rally may not repeat in a different market. The back test cannot tell you which type of market comes next." },
      { title: "A number you can act on", body: "Pair every return figure with its drawdown, its start date and its comparison index. If any of the three is missing, treat the figure with caution." },
    ],
  },
  {
    id: "cost-stack",
    title: "The cost stack",
    blurb: "Every layer that sits between the model return and what lands in your account.",
    stops: [
      { title: "Subscription price", body: "Each basket is a flat ₹3,999 a quarter or ₹14,999 a year. It does not change with how much you trade or invest, so it weighs less on a larger amount. Trading charges still apply on every trade, so turnover matters." },
      { title: "Brokerage and exchange charges", body: "Brokers charge per order, and exchanges charge a small fee on turnover. For delivery trades in liquid stocks these are small, but they add up across 15 stocks and many rebalances." },
      { title: "Securities transaction tax and stamp duty", body: "Buying and selling shares on the exchange attracts securities transaction tax and stamp duty. The model includes an allowance for these." },
      { title: "Impact cost and slippage", body: "Small and micro caps trade thinly. Buying a large amount can move the price against you, so the price you get differs from the closing price used in a back test." },
      { title: "Capital gains tax", body: "Profits are taxed when you sell. Gains on shares held under a year are taxed at the short-term rate, and longer holdings at the long-term rate. Frequent rebalancing means more short-term gains. Check current rates with a tax professional." },
      { title: "Turnover", body: "Turnover is how much of the portfolio is sold in a year. High turnover amplifies every cost in this list, which is why a strategy's net return can sit well below its gross return." },
      { title: "Net versus gross", body: "Always ask whether a quoted return is before or after costs and taxes. Our model figures are after trading charges, but before the subscription price and your personal tax." },
      { title: "Cheap is not the goal", body: "Low cost helps, but it is the return after all costs and the risk taken that matters. A cheap strategy with deep drawdowns can still be the wrong choice for you." },
    ],
  },
  {
    id: "factor-primer",
    title: "Factor primer",
    blurb: "The handful of traits that have historically explained why some stocks beat others.",
    stops: [
      { title: "What a factor is", body: "A factor is a measurable trait shared by many stocks, such as cheapness, quality or recent strength, that has been linked to differences in returns over long periods." },
      { title: "Momentum", body: "Momentum favours stocks that have risen over the past several months, and skips the very latest days to avoid short-term reversals. Our strategies rank stocks on risk-adjusted momentum." },
      { title: "Risk-adjusted momentum", body: "Dividing a stock's past return by its volatility prefers steady risers over wild ones. Two stocks with the same gain are not equal if one swung twice as much to get there." },
      { title: "Value", body: "Value favours stocks priced low compared with earnings or assets. It can lag for years, then lead sharply. It behaves differently from momentum, which is why mixing them can smooth results." },
      { title: "Quality", body: "Quality favours companies with high returns on capital, stable profits and low debt. It tends to hold up better in falling markets." },
      { title: "Size", body: "Smaller companies have historically offered higher returns with higher risk and lower liquidity. Our small-cap and micro-cap strategies take that risk and show it in their drawdowns." },
      { title: "Factors go in and out of favour", body: "Every factor has long stretches of underperformance. Holding one means accepting the bad years, and the only reason to expect a payoff is that the pattern has a sensible cause." },
      { title: "Crowding", body: "When too much money chases the same factor, the gap can narrow or reverse. A past premium is not guaranteed to continue." },
    ],
  },
  {
    id: "before-you-pick",
    title: "Before you pick a card",
    blurb: "A short checklist for choosing between strategies.",
    stops: [
      { title: "Set your horizon", body: "Equity strategies can stay below their peak for more than a year. If you need the money in under three years, a lower-risk strategy with debt and gold sleeves fits better." },
      { title: "Choose by drawdown first", body: "Pick the largest fall you could stomach, then look at strategies at or below it. Return comes second." },
      { title: "Match risk to the index", body: "A mid-cap strategy should be judged against a mid-cap index. Check the comparison table on each page before comparing strategies with each other." },
      { title: "Hybrid and multi-asset", body: "Adding debt and gold lowers volatility and usually lowers return in rising markets. They suit people who want smoother rides." },
      { title: "Count your minimum", body: "Check the minimum amount. Below it, the weights drift and rounding to whole shares changes the portfolio." },
      { title: "Do not split into too many", body: "Holding five overlapping strategies often produces the same stocks several times. Check the holdings tab for overlap before adding another." },
      { title: "Plan the review", body: "Decide in advance when you will look: at each rebalance, not every day. Daily checking tempts you to act on noise." },
      { title: "Know the exit", body: "Decide before investing under what conditions you would leave, such as a change in your goals, rather than after a fall." },
    ],
  },
  {
    id: "reading-a-company",
    title: "Reading a company",
    blurb: "A beginner's tour of the numbers behind any stock.",
    stops: [
      { title: "Revenue and profit", body: "Revenue is what the company sells. Profit is what remains after costs. Growing revenue with shrinking profit is a warning sign." },
      { title: "Margins", body: "Operating margin is operating profit as a share of revenue. Compare it with the same company's past and with its peers, not across unrelated industries." },
      { title: "Return on capital", body: "Return on equity and return on capital employed show how well a company turns money into profit. Consistently high figures often mark a durable business." },
      { title: "Debt", body: "Debt raises returns in good times and magnifies trouble in bad ones. Check debt against earnings and whether interest is comfortably covered." },
      { title: "Cash flow", body: "Profit can be stretched by accounting. Cash from operations is harder to flatter. A company that reports profit but never generates cash deserves questions." },
      { title: "Valuation ratios", body: "Price to earnings and price to book compare the price with what the company earns or owns. A low ratio is not automatically cheap, and a high one is not automatically dear." },
      { title: "Promoter holding and pledging", body: "Look at how much the founders own and whether they have pledged shares as security for loans. A high pledge can force sales when prices fall." },
      { title: "Why our strategies skip this", body: "The strategies here rank on price momentum, not on company numbers. Reading a company is still useful for understanding what you own." },
    ],
  },
];

export const topics: Topic[] = [
  {
    id: "returns-and-risk",
    title: "Returns and risk maths",
    blurb: "The few formulas that decide how you read any chart.",
    notes: [
      { title: "How CAGR is calculated", body: "Divide the ending value by the starting value, raise it to the power of one over the number of years, and subtract one. ₹100 growing to ₹250 in five years is a CAGR of about 20.1%." },
      { title: "Volatility and the Sharpe ratio", body: "Volatility is the yearly standard deviation of returns. The Sharpe ratio is the return above a risk-free rate, divided by volatility. Higher means more return per unit of ups and downs." },
      { title: "Why losses are harder to recover", body: "A 50% fall needs a 100% gain to recover. This is why drawdown matters more than most people expect." },
    ],
  },
  {
    id: "factors",
    title: "Factors",
    blurb: "Momentum, value, quality and size in practice.",
    notes: [
      { title: "Why momentum skips the last week", body: "Stocks that jumped in the last few days often give part of it back. Skipping the latest days keeps the signal on the trend rather than the spike." },
      { title: "Multiple lookbacks", body: "Using 2, 4, 6 and 12 months together stops one window from dominating and makes the ranking less sensitive to any single date." },
      { title: "Factor droughts", body: "Every factor has had multi-year stretches of poor results. The worst drawdown in a back test is not a limit on what can happen." },
    ],
  },
  {
    id: "portfolio-construction",
    title: "Portfolio construction",
    blurb: "How many stocks, how much of each, and how often to change.",
    notes: [
      { title: "Why a cap of 15 stocks", body: "Fifteen equal-weight stocks give each name about 6.7% of the stock portion, few enough to follow and to trade. The trade-off is concentration: with fewer names, one bad stock hurts more than it would in a larger basket." },
      { title: "Equal weight", body: "Equal weighting avoids leaning on the biggest company and gives smaller names a real say. The cost is more trading when prices drift." },
      { title: "Rebalance frequency", body: "Rebalancing every week or two keeps a momentum signal fresh but raises turnover and cost. Every four weeks trades less and reacts more slowly." },
    ],
  },
  {
    id: "costs",
    title: "Costs",
    blurb: "Where the model return leaks away.",
    notes: [
      { title: "Turnover as a cost multiplier", body: "A strategy that replaces half its holdings each rebalance pays charges on that half every time. Two strategies with equal gross returns can differ widely in what you keep." },
      { title: "Liquidity in small caps", body: "A stock that trades a small amount daily can move when you buy. Our price filters and position sizes aim to keep orders small relative to volume, but real fills vary." },
      { title: "Taxes on rebalancing", body: "Selling a winner within a year triggers short-term capital gains tax. Frequent rebalancing can pull your after-tax return well below the model figure." },
    ],
  },
  {
    id: "behaviour",
    title: "Behaviour",
    blurb: "The mistakes that cost more than any fee.",
    notes: [
      { title: "Selling at the bottom", body: "Most investors abandon a strategy after a fall, which turns a temporary loss into a permanent one. Choose a strategy whose worst fall you can hold through." },
      { title: "Chasing last year's winner", body: "The top card this year is often the one with the sharpest recent gain and the deepest coming fall. Read the drawdown before the return." },
      { title: "Checking too often", body: "Looking daily exposes you to noise and tempts action. Reviewing at each rebalance is enough." },
    ],
  },
  {
    id: "company-numbers",
    title: "Company numbers",
    blurb: "Quick definitions for the figures on any stock page.",
    notes: [
      { title: "Earnings per share", body: "Profit divided by the number of shares. Compare it over several years rather than a single quarter." },
      { title: "Price to earnings", body: "The share price divided by earnings per share. It tells you how many years of current earnings you pay for. Compare with peers and the company's own history." },
      { title: "Market capitalisation", body: "Share price times the number of shares. It is how large and small caps are defined, and it sets which index a company belongs to." },
    ],
  },
  {
    id: "personal-finance",
    title: "Personal finance and tax",
    blurb: "What to sort out before investing in equity strategies.",
    notes: [
      { title: "Emergency fund first", body: "Keep several months of expenses in a safe, liquid place so you never need to sell equities after a fall to pay a bill." },
      { title: "Match money to timeline", body: "Money needed within three years belongs in debt or cash. Money for ten years or more can take equity risk." },
      { title: "Capital gains basics", body: "Gains on listed shares are taxed as short-term or long-term depending on the holding period, at rates that change with the Budget. Confirm current rates and your own situation with a tax professional." },
    ],
  },
  {
    id: "strategy-notes",
    title: "Strategy notes",
    blurb: "How the strategies on this site are built.",
    notes: [
      { title: "The rule in four steps", body: "Start with a universe of stocks, drop those above the price limit, rank the rest on risk-adjusted momentum and hold the top 15 or fewer in equal weight, then repeat on a fixed calendar." },
      { title: "Execution timing", body: "The signal is calculated at the close of a day and trades are assumed at the next day's close, so the test never uses information from the future." },
      { title: "What the engine cannot see", body: "The model ignores market impact beyond a fixed cost allowance, uses proxy indices for some universes, and cannot know which kind of market comes next." },
    ],
  },
];
