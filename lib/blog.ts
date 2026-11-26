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
    title: "What is quant investing? A simple guide",
    description: "Quant investing means picking shares by fixed rules instead of opinions. See how it works, where it can go wrong, and how to judge it.",
    category: "Basics",
    date: "2026-11-02",
    keywords: ["quant investing", "systematic investing India", "rules-based investing", "quantitative strategies"],
    intro: "Quant investing means following written rules instead of gut feeling. Nobody has to guess which shares look good this week. The same rules are applied the same way every time. Here is how it works, in simple words.",
    sections: [
      { h: "The main idea: rules, not guesses", p: [
        "Think of it like a recipe. It says which group of companies to look at (for example the 100 biggest), how to rank their shares, how many to hold, and when to check the list again.",
        "The rules do not predict the market. They only say what to hold today. Anyone using the same rules on the same information gets the same list.",
      ] },
      { h: "How is this different from a share tip?", p: [
        "A tip is someone's opinion, and it is hard to check. Rules can be tested on old prices, looked at closely and repeated.",
        "Rules can also help you avoid selling in fear or buying in excitement, as long as you stick to them.",
      ] },
      { h: "What do the rules look for?", p: [
        "Most use a few simple signs. Some look for shares that have been going up. Some look for strong companies with steady profit and little debt. Some look for shares that seem cheap, or that move up and down less.",
        "Each sign works well at some times and badly at others, so many rules mix more than one.",
      ] },
      { h: "What can go wrong", p: [
        "Rules do not make investing safe. A basket can fall a lot when its idea stops working. Rules that looked great on old prices can still fail later.",
        "Costs matter too. Buying and selling often means charges and tax, which reduce what you keep.",
      ] },
      { h: "How to judge it", p: [
        "Read what the rules do. Check the biggest fall, not only the growth. Look at good and bad times, and compare with a suitable market list over the same dates. If these are hidden, be careful.",
        "Numbers from old prices are not a promise. A real investor may earn less, or lose money.",
      ] },
    ],
    related: ["how-to-read-a-backtest", "momentum-investing-explained", "max-drawdown-explained"],
  },
  {
    slug: "how-to-read-a-backtest",
    title: "How to read a back test (results on old prices)",
    description: "A back test shows how rules would have done on old prices. Five easy checks help you tell a fair test from one that looks too good.",
    category: "Research",
    date: "2026-11-05",
    keywords: ["backtest", "back tested returns", "survivorship bias", "how to evaluate a strategy"],
    intro: "A back test uses rules on old prices, as if someone had followed them at the time. It helps you understand the rules, but it can easily look better than real life. These five checks help.",
    sections: [
      { h: "1. Check the dates", p: [
        "A test that starts when prices were very low looks much better than one that starts when they were high. See whether the period had both rising and falling markets.",
      ] },
      { h: "2. Look for missing companies", p: [
        "If a test uses only the companies in a list today, it leaves out those that did badly and dropped off. The past then looks better than it was. This is called survivorship bias.",
      ] },
      { h: "3. Ask which costs are taken out", p: [
        "Share-app charges, taxes and the difference between the price you see and the price you get all reduce what you keep. If a test ignores them, the number is too high.",
      ] },
      { h: "4. Watch for too much adjusting", p: [
        "If rules were changed again and again until the past looked perfect, they may not work later. Simple rules with a clear reason are usually safer to trust.",
      ] },
      { h: "5. Compare like with like", p: [
        "Small companies and very big companies behave differently. Compare a basket with a market list of the same kind of companies.",
      ] },
      { h: "Useful, but not a promise", p: [
        "Use a back test to see how rules behaved, especially how far they fell. Do not use it to guess next year's gain.",
      ] },
    ],
    related: ["max-drawdown-explained", "cagr-vs-average-returns", "what-is-quant-investing"],
  },
  {
    slug: "max-drawdown-explained",
    title: "The biggest fall (max drawdown), in simple words",
    description: "Max drawdown is the biggest drop from a high point to a later low. Learn how to read it and decide how much fall you can handle.",
    category: "Risk",
    date: "2026-11-08",
    keywords: ["max drawdown", "investment risk", "drawdown meaning", "risk management investing"],
    intro: "Most people look at growth first. It also helps to look at the biggest fall, because it shows how hard the worst time was.",
    sections: [
      { h: "What it means", p: [
        "It is the biggest drop from a high point to the lowest point after it, before a new high. Say your money reached ₹100, fell to ₹64 and later came back. The biggest fall was 36%.",
      ] },
      { h: "Why a fall is hard to win back", p: [
        "After a 50% fall, you need 100% growth just to get back. The deeper the fall, the longer and harder the way back.",
      ] },
      { h: "How long it stayed down", p: [
        "Also check how long the money stayed below its old high. A small fall that lasts very long can test your patience as much as a big, quick one.",
      ] },
      { h: "How to use it", p: [
        "Picture your own money falling by that much. Would you stay, or sell? If you would sell, this choice carries too much risk for you, however much it grew.",
        "The biggest fall in the past is not a limit. A future fall can be bigger.",
      ] },
    ],
    related: ["how-to-read-a-backtest", "cagr-vs-average-returns", "momentum-investing-explained"],
  },
  {
    slug: "cagr-vs-average-returns",
    title: "Growth per year (CAGR) or average: which to trust?",
    description: "An average can hide a loss. CAGR is the steady yearly rate that turns your first amount into your final amount. Here is how to use it.",
    category: "Basics",
    date: "2026-11-11",
    keywords: ["CAGR", "compound annual growth rate", "average return vs CAGR", "investment returns explained"],
    intro: "Two choices can have the same average and leave you with very different amounts. Growth per year, called CAGR, shows what really happened to your money.",
    sections: [
      { h: "What CAGR is", p: [
        "It is the steady yearly rate that would turn your first amount into your final amount. It turns many ups and downs into one number you can compare.",
      ] },
      { h: "Why the average can fool you", p: [
        "Gain 50% one year and lose 50% the next. The average is zero. But ₹100 becomes ₹150 and then ₹75, so you have lost 25%.",
      ] },
      { h: "An easy example", p: [
        "If ₹1,00,000 grows to about ₹2,49,000 in five years, that is about 20% a year, even if no single year was exactly 20%.",
      ] },
      { h: "What it does not show", p: [
        "It does not show the journey. Two choices can have the same yearly growth, one smooth and one very bumpy. Always check the biggest fall and the dates too.",
      ] },
    ],
    related: ["max-drawdown-explained", "how-to-read-a-backtest", "what-is-quant-investing"],
  },
  {
    slug: "momentum-investing-explained",
    title: "Momentum investing: following shares that are rising",
    description: "Momentum means choosing shares that have been rising strongly. See why it has worked at times, when it struggles, and what to check.",
    category: "Strategies",
    date: "2026-11-14",
    keywords: ["momentum investing", "momentum strategy India", "factor investing", "Nifty momentum"],
    intro: "Momentum is a well-studied idea: shares that have risen lately have often kept rising for a while. It is easy to explain, but not always easy to stick with.",
    sections: [
      { h: "How it works", p: [
        "The rules rank shares by how much their price rose over a set time, hold the top ones, and check the list again on fixed dates. Shares that lose strength leave, and stronger ones come in.",
      ] },
      { h: "Why it can work", p: [
        "One reason may be that people react slowly to news. Another may be that many keep buying what is rising. This pattern has appeared in many markets over long periods, but not all the time.",
      ] },
      { h: "When it struggles", p: [
        "It can fall sharply when the market turns, because the earlier winners are often sold first. Holding few shares, or changing often, can mean bigger ups and downs and higher costs.",
      ] },
      { h: "What to check", p: [
        "Check the biggest fall, how many shares are held, how often they change, and what that costs. High growth with a deep fall means you took a big risk to get it.",
      ] },
    ],
    related: ["rebalancing-explained", "max-drawdown-explained", "what-is-quant-investing"],
  },
  {
    slug: "rebalancing-explained",
    title: "Rebalancing: why the share list gets updated",
    description: "Rebalancing means updating a share list so it follows its rules again. See why it matters, how often it happens and what it can cost.",
    category: "Basics",
    date: "2026-11-17",
    keywords: ["rebalancing", "portfolio rebalancing", "rebalance frequency", "systematic investing"],
    intro: "With time, your shares can drift away from the plan. Rebalancing is a check on fixed dates that brings the list back in line with its rules.",
    sections: [
      { h: "What happens at an update", p: [
        "On a fixed date, the rules are used again with the latest prices. Shares that no longer fit are removed, new ones come in, and the amounts are set again.",
      ] },
      { h: "How often?", p: [
        "Some lists are checked every week or every few weeks, others a few times a year or less. More often reacts faster but costs more. Less often costs less but may keep a weak share longer.",
      ] },
      { h: "What it costs", p: [
        "Each time you buy or sell, there can be charges and tax. Think about how often a list changes and what that may cost you.",
      ] },
      { h: "You stay in charge", p: [
        "With our baskets, we show what to buy and sell. You decide, and you place the orders yourself. Your shares stay in your own account.",
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
