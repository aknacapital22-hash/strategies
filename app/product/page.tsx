import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs, graph, pageMeta, webPage } from "@/lib/seo";
import Tabs from "@/components/Tabs";
import { PRICE_LINE } from "@/lib/pricing";
import Words from "@/components/Words";

const TITLE = "How Rules-Based Stock Baskets Work in 6 Steps";
const DESCRIPTION = "Choose a basket, check past returns and risk, see what to buy and sell, then order through your own broker. A step-by-step tour with screenshots.";
export const metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: "/product" });

// Screenshots of this app (stock names blurred): [file, alt text, width, height]
const shots = {
  explore: ["explore", "The baskets page: a card for each basket showing what ₹1 lakh would have become", 1800, 1140],
  research: ["research", "A basket's page with a chart of how ₹1 lakh grew", 1620, 1140],
  risk: ["risk", "The risk section listing the biggest falls and how returns looked over different time spans", 1620, 797],
  rebalance: ["rebalance", "A basket's list of shares with how much of the money goes into each, names blurred", 1620, 1140],
  portfolio: ["portfolio", "What is inside a basket, shown by industry, names blurred", 1620, 1140],
  orders: ["orders", "A basket mixing shares with a debt fund and a gold fund, names blurred", 1620, 1050],
} as const;

type Step = { tab: string; title: string; see: string; todo: string; why: string; shot: keyof typeof shots };

const steps: Step[] = [
  {
    tab: "1 · Pick", title: "Pick a basket",
    see: "Each card shows what ₹1 lakh would have become, the risk, and how much you need to start.",
    todo: "Pick the one you like. Not sure? Answer 3 easy questions and we suggest one.",
    why: "You choose how many ups and downs you are happy with.",
    shot: "explore",
  },
  {
    tab: "2 · Growth", title: "See how it grew",
    see: "A simple chart of how ₹1 lakh grew. Tap “All the numbers” for every year and month.",
    todo: "Look at the good years and the bad years.",
    why: "These numbers are from old prices. The future can be better or much worse.",
    shot: "research",
  },
  {
    tab: "3 · Risk", title: "Know the ups and downs",
    see: "The biggest falls, how long they lasted, and what happened with different start days.",
    todo: "Ask yourself: could I stay calm in a fall like this? If not, pick a calmer basket.",
    why: "Knowing this early helps you avoid selling in a panic.",
    shot: "risk",
  },
  {
    tab: "4 · Buy list", title: "See what to buy and sell",
    see: "With a plan, you see every share and how much to put in each. At list updates, you see what to buy and sell.",
    todo: "Read the list and decide if you want to follow it.",
    why: "You are in charge. We never buy or sell for you.",
    shot: "rebalance",
  },
  {
    tab: "5 · Spread", title: "See where your money goes",
    see: "How the money is spread across types of business, such as banks, tech or medicine.",
    todo: "Check that not too much is in one type.",
    why: "Spreading out means one weak area hurts less.",
    shot: "portfolio",
  },
  {
    tab: "6 · Buy", title: "Buy in your own app",
    see: "We work out how many to buy or sell. Copy the list, or download a file for your share app.",
    todo: "Place the orders and check that each one went through.",
    why: "Your shares are in your own account. We never hold your money or shares.",
    shot: "orders",
  },
];

const fit = [
  "You want a clear list instead of guessing or tips",
  "You can leave the money in for 3 years or more",
  "You can stay calm when prices fall",
  "You want shares in your own account",
];
const notFit = [
  "You may need this money in a year or two",
  "You want fixed or sure growth. No basket can give that",
  "You would sell everything at the first fall",
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
      <JsonLd data={graph(webPage("WebPage", TITLE, DESCRIPTION, "/product"), breadcrumbs(["How it works", "/product"]))} />
      <p className="eyebrow">How it works</p>
      <h1 className="h1 mt-4 max-w-3xl !text-[clamp(1.75rem,3.4vw,2.5rem)]">It is easy. Here are 6 simple steps.</h1>
      <p className="lead mt-4 max-w-2xl">
        Pick a ready-made list. We show you what to buy and sell. You buy it yourself, and your shares stay with you.
      </p>

      {/* The whole idea in one glance */}
      <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["You pick", "a basket you like"],
          ["Get a plan", `${PRICE_LINE}, for one basket`],
          ["We show", "what to buy or sell at list updates"],
          ["You buy", "in your own share app and account"],
        ].map(([a, b], i) => (
          <li key={a} className="card flex gap-3 p-4">
            <span className="tile tile-sm !h-8 !w-8 num font-bold" aria-hidden>{i + 1}</span>
            <p className="text-sm"><b>{a}</b> <span className="text-pmuted">{b}</span></p>
          </li>
        ))}
      </ol>

      {/* Step by step, one at a time */}
      <section className="mt-12" aria-labelledby="steps">
        <h2 id="steps" className="mb-5 text-xl font-extrabold">See each step</h2>
        <Tabs tabs={tabs} />
        <p className="mt-3 text-[11px] text-pmuted">Pictures are from this site, with company names blurred. Numbers are from old prices and do not promise future growth.</p>
      </section>

      <Words className="mt-14" />

      {/* Honest fit check */}
      <section className="mt-14" aria-labelledby="fit">
        <h2 id="fit" className="text-xl font-extrabold">Is this right for you?</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <h3 className="up text-sm font-bold">Great for you if…</h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              {fit.map((x) => <li key={x} className="flex gap-2.5"><span className="up mt-0.5" aria-hidden>✓</span>{x}</li>)}
            </ul>
          </div>
          <div className="card p-5">
            <h3 className="down text-sm font-bold">Please wait if…</h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              {notFit.map((x) => <li key={x} className="flex gap-2.5"><span className="down mt-0.5" aria-hidden>✕</span>{x}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <div className="hero-bg mt-14 rounded-2xl p-7 text-center md:p-10">
        <h2 className="h2 !text-white">Ready to find your basket?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-teal-100/90">Answer 3 easy questions and we suggest where to start. No sign-up needed.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/start" className="btn btn-light">See which basket suits you →</Link>
          <Link href="/strategies" className="btn btn-outline-light">Browse all baskets</Link>
          <Link href="/pricing" className="btn btn-outline-light">See pricing</Link>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-pmuted">Share prices go up and down. Past growth does not promise future growth. You can lose money.</p>
    </div>
  );
}
