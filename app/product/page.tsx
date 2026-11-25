import Image from "next/image";
import Link from "next/link";
import Tabs from "@/components/Tabs";
import { PRICE_LINE } from "@/lib/pricing";

export const metadata = { title: "How it works", description: "Walk through the six screens: choose a basket, check past returns and risk, review trades and approve orders through your own broker.", alternates: { canonical: "/product" } };

// Screenshots of this app (stock names blurred): [file, alt text, width, height]
const shots = {
  explore: ["explore", "The baskets page: a card for each basket showing yearly growth, biggest fall and a small growth line", 1800, 1140],
  research: ["research", "A basket's page with its growth chart and the return for each year", 1620, 1140],
  risk: ["risk", "The risk section listing the biggest falls and how returns looked over different time spans", 1620, 797],
  rebalance: ["rebalance", "A basket's list of stocks to hold with the share of money for each, stock names blurred", 1620, 1140],
  portfolio: ["portfolio", "The holdings section with the spread across sectors, stock names blurred", 1620, 1140],
  orders: ["orders", "A basket mixing shares with a debt fund and a gold fund, names blurred", 1620, 1050],
} as const;

type Step = { tab: string; title: string; see: string; todo: string; why: string; shot: keyof typeof shots };

const steps: Step[] = [
  {
    tab: "1 · Choose", title: "Choose a basket",
    see: "A basket is a ready-made group of stocks that follows one fixed plan. Each card shows how much it grew per year, how far it fell at its worst, and the smallest amount you can start with.",
    todo: "Pick the one that suits you. If you are unsure, take the three-question finder and it will suggest a starting point.",
    why: "You choose how much ups and downs you can live with before you put in any money.",
    shot: "explore",
  },
  {
    tab: "2 · Past returns", title: "Check what it earned in the past",
    see: "A growth chart, and the return for every year and every month, so you can see the good years and the bad ones.",
    todo: "Look at the bad years first. Then decide if you could have stayed invested through them.",
    why: "These are results from testing the plan on past data. They show how it behaved, not what it will do next. The future can be worse.",
    shot: "research",
  },
  {
    tab: "3 · Risk", title: "See how far it can fall",
    see: "The biggest drops the basket has had, how long each one lasted, and the best and worst results over different time spans.",
    todo: "Ask yourself: if my money fell by this much, would I panic and sell? If yes, pick a gentler basket.",
    why: "Most people lose money by selling in a fall. Knowing the worst case upfront helps you stay calm.",
    shot: "risk",
  },
  {
    tab: "4 · Trades", title: "See what to buy and sell",
    see: "Once you subscribe, you see the exact stocks the basket holds and how much money goes into each. When the plan changes the list, you see which to buy and which to sell.",
    todo: "Read the list. Approve it only if you are happy with it. Nothing happens until you say yes.",
    why: "You stay in charge. We never place a trade on our own.",
    shot: "rebalance",
  },
  {
    tab: "5 · Your stocks", title: "See where your money sits",
    see: "All your stocks together, and how your money is spread across industries such as banks, technology or pharma.",
    todo: "Check you are not too heavy in any one area.",
    why: "Spreading money across industries means one bad sector hurts less.",
    shot: "portfolio",
  },
  {
    tab: "6 · Orders", title: "Watch the orders go through",
    see: "After you approve, your broker places the orders. You can follow each one until it is done. Some baskets also hold a debt fund and a gold fund for balance.",
    todo: "Keep an eye on the confirmation from your broker.",
    why: "The shares are bought in your own demat account. We never hold your money or shares.",
    shot: "orders",
  },
];

const words: [string, string][] = [
  ["Basket", "A ready-made group of stocks that follows one fixed plan."],
  ["Demat account", "Your own account at a broker where your shares are kept. They are always yours, not ours."],
  ["Broker", "The licensed company that actually buys and sells shares for you, such as Zerodha or Kotak."],
  ["Yearly growth (CAGR)", "How much the basket grew each year on average, over the period tested. A smoothed-out figure, not what you get every year."],
  ["Biggest fall (drawdown)", "The largest drop from a high point to the next low. If it says 25%, a ₹1 lakh investment dropped to about ₹75,000 at one stage."],
  ["Rebalance", "Updating the stock list now and then, selling some and buying others, so the basket keeps following its plan."],
  ["Tested on past data", "We ran the plan on old market data to see how it would have done. Real results can be lower, and you can lose money."],
];

const fit = [
  "You want a clear, written plan instead of guessing or following tips",
  "You can leave the money invested for 3 years or more",
  "You can accept it falling in a bad year without selling in a panic",
  "You want your shares in your own account, not in someone's fund",
];
const notFit = [
  "You may need this money within a year or two",
  "You want guaranteed or fixed returns. No basket gives that",
  "You would sell everything the first time it falls",
  "You cannot afford to lose any of it",
];

export default function Product() {
  const tabs = steps.map((s, i) => {
    const [file, alt, w, h] = shots[s.shot];
    return {
      id: `s${i}`,
      label: s.tab,
      content: (
        <div className="card grid items-center gap-6 overflow-hidden p-5 md:grid-cols-[1fr_1.1fr] md:p-7">
          <div>
            <h2 className="text-2xl font-extrabold">{s.title}</h2>
            <dl className="mt-5 space-y-3 text-sm leading-relaxed">
              {([["◉", "See", s.see], ["☞", "Do", s.todo], ["✦", "Why", s.why]] as const).map(([ic, k, v]) => (
                <div key={k} className="flex gap-3 rounded-xl bg-page3 p-3">
                  <span className="tile tile-sm mt-0.5" aria-hidden>{ic}</span>
                  <div><dt className="text-xs font-bold uppercase tracking-wider text-aink">{k}</dt><dd className="mt-0.5">{v}</dd></div>
                </div>
              ))}
            </dl>
          </div>
          <figure className="overflow-hidden rounded-xl border border-pline bg-page3 shadow-lg">
            <div className="flex items-center gap-1.5 border-b border-pline bg-page2 px-3 py-2" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" /><span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" /><span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <Image src={`/product/${file}.jpg`} alt={alt} width={w} height={h} sizes="(min-width: 768px) 520px, 100vw" className="h-auto w-full" priority={i === 0} />
          </figure>
        </div>
      ),
    };
  });

  return (
    <div className="wrap py-10 md:py-14">
      <p className="eyebrow">How it works</p>
      <h1 className="h1 mt-4 max-w-3xl !text-[clamp(1.75rem,3.4vw,2.5rem)]">Investing in six simple steps. No jargon.</h1>
      <p className="lead mt-4 max-w-2xl">
        You pick a ready-made basket of stocks, we show you what to buy and sell, and you approve each step. Your shares stay in your own account.
      </p>

      {/* The whole idea in one glance */}
      <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["You pick", "a basket that fits how much risk you can take"],
          ["You subscribe", `${PRICE_LINE}, per basket`],
          ["We show", "which stocks to buy or sell, when the plan changes"],
          ["You approve", "your broker buys them into your own demat account"],
        ].map(([a, b], i) => (
          <li key={a} className="card flex gap-3 p-4">
            <span className="tile tile-sm !h-8 !w-8 num font-bold" aria-hidden>{i + 1}</span>
            <p className="text-sm"><b>{a}</b> <span className="text-pmuted">{b}</span></p>
          </li>
        ))}
      </ol>

      {/* Step by step, one at a time */}
      <section className="mt-12" aria-labelledby="steps">
        <h2 id="steps" className="mb-5 text-xl font-extrabold">Take the tour, one step at a time</h2>
        <Tabs tabs={tabs} />
        <p className="mt-3 text-[11px] text-pmuted">Screenshots are from this app, with stock names blurred. All figures are tested on past data and are not a promise of future returns.</p>
      </section>

      {/* Plain-language glossary */}
      <section className="mt-14" aria-labelledby="words">
        <h2 id="words" className="text-xl font-extrabold">Words made simple</h2>
        <dl className="mt-5 grid gap-3 md:grid-cols-2">
          {words.map(([w, d]) => (
            <div key={w} className="card p-4">
              <dt className="text-sm font-bold">{w}</dt>
              <dd className="mt-1 text-sm leading-snug text-pmuted">{d}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Honest fit check */}
      <section className="mt-14" aria-labelledby="fit">
        <h2 id="fit" className="text-xl font-extrabold">Is this right for you?</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <h3 className="up text-sm font-bold">Good fit if…</h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              {fit.map((x) => <li key={x} className="flex gap-2.5"><span className="up mt-0.5" aria-hidden>✓</span>{x}</li>)}
            </ul>
          </div>
          <div className="card p-5">
            <h3 className="down text-sm font-bold">Not a fit if…</h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              {notFit.map((x) => <li key={x} className="flex gap-2.5"><span className="down mt-0.5" aria-hidden>✕</span>{x}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <div className="hero-bg mt-14 rounded-2xl p-7 text-center md:p-10">
        <h2 className="h2 !text-white">Ready to pick your basket?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-teal-100/90">Answer three simple questions and we will suggest where to start. No sign-up needed.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/start" className="btn btn-light">Help me choose →</Link>
          <Link href="/strategies" className="btn btn-outline-light">Browse all baskets</Link>
          <Link href="/pricing" className="btn btn-outline-light">See pricing</Link>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-pmuted">Investments in securities are subject to market risk. Past results do not guarantee future returns. You can lose money.</p>
    </div>
  );
}
