import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { HOME_FAQS } from "@/lib/faqs";
import { HOME_DESCRIPTION, HOME_TITLE, faqPage, graph, webPage } from "@/lib/seo";
import StrategyRail from "@/components/StrategyRail";
import IndexFinder from "@/components/IndexFinder";
import { QUIZ_SLUGS } from "@/lib/quiz";
import Race from "@/components/Race";
import Faq from "@/components/Faq";
import GrowthArt from "@/components/GrowthArt";
import StickyCta from "@/components/StickyCta";
import Words from "@/components/Words";
import OpenOnJump from "@/components/OpenOnJump";
import { strategies, DATA_AS_OF } from "@/lib/strategies";
import MoneyCalculator from "@/components/MoneyCalculator";
import { cardData } from "@/lib/cards";
import { minimumRange } from "@/lib/strategies";
import { shortLabel } from "@/lib/minimum";
import { PAST_NOTE } from "@/lib/plain";

// No prices on this page: they are on the pricing page and where someone subscribes.
const steps: [string, string][] = [
  ["Pick a basket", "A basket is a ready-made list of shares. No need to study companies or chase tips."],
  ["See what to buy", "With a plan, you see every share and how much to put in each. We email you at every list update."],
  ["Buy it yourself", "Buy in your own share app. Your money and shares always stay with you."],
];

const more: [string, string, string][] = [
  ["See how it works", "Step by step, with pictures", "/product"],
  ["See all baskets", "Every number, good and bad", "/strategies"],
  ["Learn the basics", "Short, easy lessons", "/learn"],
  ["See what suits you", "3 easy questions", "/start"],
];

export default function Home() {
  const list = [...strategies].sort((a, b) => b.cagr - a.cagr);
  const cards = list.map(cardData);
  const best = cards.reduce((a, b) => (b.value > a.value ? b : a));
  const allAhead = cards.every((c) => c.value > c.bmValue); // the proud line shows only while it is true

  return (
    <>
      <OpenOnJump />
      <JsonLd data={graph(webPage("WebPage", HOME_TITLE, HOME_DESCRIPTION, "/"), faqPage(HOME_FAQS))} />
      <div className="bg-[#0f766e] px-4 py-2 text-center text-sm text-white">
        🎯 <Link href="#suits" className="font-semibold underline underline-offset-2">See which basket suits you: just 3 taps →</Link>
      </div>

      <div className="art-stage">
      <GrowthArt series={list} lead={best.slug} />
      <section className="wrap grid items-center gap-8 pb-8 pt-8 md:pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-20">
        <div>
          <h1 className="h1">Systematic investing for <span className="text-aink">wealth creation.</span></h1>
          <p className="lead mt-4 max-w-lg">Not sure which shares to buy? Get a ready-made list. We show you what to buy and when to change it. You buy in your own account.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="#suits" className="btn btn-primary !px-6 !py-3">🎯 See which basket suits you →</Link>
            <Link href="/strategies" className="btn btn-ghost !px-6 !py-3">See all {list.length} baskets</Link>
          </div>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
            {["Ready-made list", `Start with ${shortLabel(minimumRange().low)}`, "Money stays with you", "No auto-payment"].map((x) => (
              <li key={x} className="flex items-center gap-1.5"><span className="text-gink" aria-hidden>✓</span>{x}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-pmuted">Look around free. No account needed.</p>
        </div>

        <MoneyCalculator baskets={cards} first={best.slug} />
      </section>
      <p className="wrap pb-2 text-right text-[11px] text-pmuted">The faint lines show all {list.length} baskets on old prices.</p>
      </div>

      <section className="wrap grid items-start gap-6 py-8 md:py-10 lg:grid-cols-2">
        <div id="suits" className="scroll-mt-24 lg:sticky lg:top-24">
          <h2 className="h2">See which basket suits you</h2>
          <p className="mb-5 mt-2 text-pmuted">Just 3 taps. No sign-up. No finance knowledge needed.</p>
          <IndexFinder baskets={cards.filter((c) => QUIZ_SLUGS.includes(c.slug))} />
        </div>
        <section aria-labelledby="race"><Race list={list} /></section>
      </section>

      <section className="wrap defer py-8 md:py-10" aria-labelledby="how">
        <h2 id="how" className="h2 mb-6 text-center">As easy as 1, 2, 3</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map(([t, d], i) => (
            <li key={t} className="card p-6">
              <span className="tile num font-extrabold" aria-hidden>{i + 1}</span>
              <h3 className="mt-4 text-lg font-bold">{t}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-pmuted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="wrap defer py-8 md:py-10" aria-labelledby="baskets">
        <h2 id="baskets" className="h2">What ₹1 lakh would have become</h2>
        {allAhead && <p className="mt-3 inline-block rounded-full bg-[var(--gain-ink)]/10 px-4 py-2 text-sm font-bold up" data-all-ahead>🏆 In our test, all {list.length} baskets grew more than the market</p>}
        <p className="mb-6 mt-3 max-w-2xl text-pmuted">The number of years is different for each basket, so check that too. {PAST_NOTE}</p>
        <StrategyRail cards={cards} />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-pmuted">Prices up to {DATA_AS_OF}. Swipe to see more.</p>
          <Link href="/strategies" className="btn btn-ghost !py-1.5">See all {list.length} →</Link>
        </div>
      </section>

      <section className="wrap defer py-8 md:py-10" aria-labelledby="more">
        <h2 id="more" className="h2 mb-5">Want to know more?</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {more.map(([t, d, href]) => (
            <Link key={href} href={href} className="card card-link flex items-center justify-between gap-3 p-5">
              <span><span className="block font-bold">{t}</span><span className="mt-1 block text-sm text-pmuted">{d}</span></span>
              <span aria-hidden className="text-pmuted">→</span>
            </Link>
          ))}
        </div>
        <Words className="mt-4" />
      </section>

      <section className="wrap defer py-8 pb-12 md:py-10">
        <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="h2 mb-4">Questions people ask</h2>
            <Faq items={HOME_FAQS} />
          </div>
          <div className="hero-bg relative overflow-hidden rounded-2xl p-7 lg:sticky lg:top-24">
            <div className="grid-lines absolute inset-0" aria-hidden />
            <div className="relative">
              <h2 className="h2 !text-white">Not sure where to <span className="gold">start?</span></h2>
              <p className="mt-3 text-sm text-teal-100/90">Answer three easy questions and we suggest a basket to look at first. No account needed.</p>
              <div className="mt-6 grid gap-2.5">
                <Link href="#suits" className="btn btn-light">See which basket suits you →</Link>
                <Link href="/strategies" className="btn btn-outline-light">See all baskets</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <StickyCta />
    </>
  );
}
