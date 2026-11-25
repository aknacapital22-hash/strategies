import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import FeeCalculator from "@/components/FeeCalculator";
import StrategyRail from "@/components/StrategyRail";
import Faq from "@/components/Faq";
import Tabs from "@/components/Tabs";
import GrowthArt from "@/components/GrowthArt";
import StickyCta from "@/components/StickyCta";
import { strategies, growthSeries, minimumRange } from "@/lib/strategies";
import { shortLabel } from "@/lib/minimum";
import { sparkPath } from "@/lib/growth";
import { QUARTER, YEAR } from "@/lib/pricing";

const pillars = [
  ["Every trade is yours", "Nothing happens until you approve it. Your broker places the orders and the shares stay in your demat.", "✓", "/product"],
  ["Risk comes first", "Each strategy shows its deepest falls and rolling returns next to the headline CAGR, so nothing is hidden.", "△", "/strategies"],
  ["Quant, not guesswork", "Data and rules decide what to hold and when to rebalance. No tips, no gut calls, no emotion in the loop.", "◎", "/start"],
];

const tools = [
  ["Index finder", "Three questions, one starting point.", "/start", "◎"],
  ["Fee calculator", "See exactly what a rebalance costs.", "#pricing", "₹"],
  ["Compare strategies", "Filter and sort all of them in one view.", "/strategies", "⇄"],
  ["Product tour", "Walk through the six screens.", "/product", "▣"],
  ["Learn hub", "Plain-English guides on returns, risk and costs.", "/learn", "✎"],
];

const steps = [
  ["Pick", "A strategy that fits your risk", "◎"],
  ["Model decides", "Rules propose the trades", "⚙"],
  ["You approve", "Your broker, your demat", "✓"],
];

const compare = [
  ["Minimum", `${shortLabel(minimumRange().low)} to ${shortLabel(minimumRange().high)}, by basket`, "low", "₹50 lakh", "₹1 crore"],
  ["Cost", `${QUARTER} a quarter or ${YEAR} a year, per basket`, "0.3 to 2.5% a year", "2% + 20%", "~2% + 20%"],
  ["Held by", "You, your demat", "The fund", "Your demat, managed", "The fund"],
  ["Lock in", "None", "Varies", "Varies", "Often years"],
];

const faqs: [string, string][] = [
  ["What is quant investing?", "Quant investing uses data and fixed rules, not opinions, to decide what to hold and when to trade. The same process runs every time, so decisions do not swing with headlines or mood. It does not remove risk: quant strategies can and do fall."],
  ["Can I see how the engine picks stocks?", "You can see every stock each strategy holds today, along with its results and its risk. The exact scoring rules are not published, and you see the trades proposed for you before you approve them."],
  ["Does the platform hold my money or shares?", "No. Orders go through your own broker and the shares sit in your own demat account. The platform never takes custody."],
  ["Are the returns guaranteed?", "No. Every figure is a model, back tested number, and back tests flatter the past. Real returns can be lower, and you can lose money."],
  ["What does it cost?", `${QUARTER} a quarter or ${YEAR} a year, per basket. The price is flat, with no fee on what you trade or invest. Brokerage and statutory charges are separate.`],
  ["Can I leave whenever I want?", "Yes. There is no lock-in, and your holdings are already in your demat."],
];

export default function Home() {
  const list = [...strategies].sort((a, b) => b.cagr - a.cagr);
  const hero = list.find((s) => s.slug === "allcap") ?? list[0];
  const hv = growthSeries(hero);
  const gro = hero.growth ?? { start: "inception", end: "today", model: Math.round(hv[hv.length - 1]), nifty: 100 };
  const W = 560, H = 200, P = 10;
  const lo = Math.log(Math.min(...hv)), hi = Math.log(Math.max(...hv));
  const hp = hv.map((v, i) => `${i ? "L" : "M"}${((i / (hv.length - 1)) * W).toFixed(1)},${(H - P - ((Math.log(v) - lo) / (hi - lo || 1)) * (H - 2 * P)).toFixed(1)}`).join("");

  const gap = (
    <div>
      <div className="hero-bg rounded-2xl p-5 md:p-8">
        <p className="text-center text-sm text-teal-100/90">₹1,00,000 in {hero.name}, model, {gro.start} to {gro.end}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="band-card p-5">
            <p className="text-xs font-semibold text-teal-100">{hero.name}, model</p>
            <p className="num gold mt-2 text-4xl font-extrabold">₹{(gro.model / 100).toFixed(1)}L</p>
            <p className="mt-1 text-xs text-teal-100/90">{(gro.model / 100).toFixed(1)}× your money</p>
          </div>
          <div className="band-card p-5">
            <p className="text-xs font-semibold text-teal-100">Nifty 50, same period</p>
            <p className="num mt-2 text-4xl font-extrabold text-white/80">₹{(gro.nifty / 100).toFixed(2)}L</p>
            <div className="mt-3 h-1.5 rounded-full bg-white/15" aria-hidden><div className="h-1.5 rounded-full bg-white/70" style={{ width: `${(gro.nifty / gro.model) * 100}%` }} /></div>
          </div>
          <div className="band-card p-5">
            <p className="text-xs font-semibold text-teal-100">Worst fall on the way</p>
            <p className="num mt-2 text-4xl font-extrabold text-white"><span className="text-red-300" aria-hidden>▼</span> {Math.abs(hero.maxDd).toFixed(1)}%</p>
            <p className="mt-1 text-xs text-teal-100/90">Real money can fall this far, and further</p>
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] leading-relaxed text-pmuted">Hypothetical, model, back tested results after charges. Not a promise of future returns. Back tests flatter the past, and you can lose money.</p>
    </div>
  );

  const how = (
    <div>
      <ol className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
        {steps.map(([t, d, icon], i) => (
          <li key={t} className="contents">
            <div className="card flex flex-1 flex-col items-center p-6 text-center">
              <span className="tile !h-14 !w-14 !text-2xl" aria-hidden>{icon}</span>
              <p className="num mt-3 text-xs font-bold text-aink">Step {i + 1}</p>
              <h3 className="mt-1 font-bold">{t}</h3>
              <p className="mt-1 text-sm text-pmuted">{d}</p>
            </div>
            {i < steps.length - 1 && <span aria-hidden className="self-center text-2xl text-pmuted max-md:rotate-90">→</span>}
          </li>
        ))}
      </ol>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {["Never holds your money", "You approve every trade", "Your broker places orders", "Shares stay in your demat"].map((c) => (
          <li key={c} className="flex items-center gap-2 rounded-xl border border-pline bg-page2 px-3 py-2.5 text-sm font-medium"><span className="text-gink" aria-hidden>✓</span>{c}</li>
        ))}
      </ul>
    </div>
  );

  const cards = list.map((s) => ({ slug: s.slug, name: s.name, kind: s.kind, risk: s.risk, cagr: s.cagr, maxDd: s.maxDd, minimum: s.minimum, spark: sparkPath(s.monthly) }));
  const lineup = (
    <div>
      <StrategyRail cards={cards} />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-pmuted">Model, back tested, as of 13 Nov 2026. Higher returns also came with deeper falls. Swipe or scroll for more.</p>
        <Link href="/strategies" className="btn btn-ghost !py-1.5">See all {list.length} →</Link>
      </div>
    </div>
  );

  const why = (
    <div className="grid gap-4 md:grid-cols-3">
      {pillars.map(([t, d, icon, href]) => (
        <div key={t} className="card flex flex-col p-5">
          <span className="tile" aria-hidden>{icon}</span>
          <h3 className="mt-4 font-bold">{t}</h3>
          <p className="mt-1.5 flex-1 text-sm leading-relaxed text-pmuted">{d}</p>
          <Link href={href} className="mt-4 text-sm font-semibold text-aink hover:underline">Know more →</Link>
        </div>
      ))}
    </div>
  );

  const toolsPanel = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map(([t, d, href, icon]) => (
        <Link key={t} href={href} className="card card-link flex items-center gap-4 p-4">
          <span className="tile shrink-0" aria-hidden>{icon}</span>
          <div className="flex-1"><h3 className="text-sm font-bold">{t}</h3><p className="text-xs text-pmuted">{d}</p></div>
          <span aria-hidden className="text-pmuted">→</span>
        </Link>
      ))}
    </div>
  );

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }} />
      {/* Announcement strip: a free, useful thing first */}
      <div className="bg-[#0f766e] px-4 py-2 text-center text-sm text-white">
        <span className="mr-2 rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider">Free</span>
        Not sure which strategy fits you? <Link href="/start" className="font-semibold underline underline-offset-2">Take the 3-question finder →</Link>
      </div>

      {/* Hero: copy + live preview side by side, so the first screen carries the whole pitch */}
      <div className="art-stage">
      <GrowthArt series={list} lead={hero.slug} />
      <section className="wrap grid items-center gap-8 pb-8 pt-8 md:pt-12 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:py-20">
        <div>
          <h1 className="h1">The edge the index <span className="text-aink">never gives you.</span></h1>
          <p className="lead mt-4 max-w-lg">Rules-based quant models scan the market on a fixed calendar and hand you the trades to approve in your own demat. Every holding is visible, every trade is yours to approve.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/start" className="btn btn-primary !px-6 !py-3">Unlock my strategy →</Link>
            <Link href="/strategies" className="btn btn-ghost !px-6 !py-3">See the results</Link>
          </div>
          <p className="mt-3 text-xs text-pmuted">Free to explore · No account needed · Leave any time</p>
          <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-pline pt-5">
            {[[String(list.length), "strategies"], [YEAR, `a year per basket, or ${QUARTER} a quarter`], ["₹0", "held by the platform"]].map(([n, l]) => (
              <div key={l}><dd className="num text-xl font-extrabold">{n}</dd><dt className="text-xs text-pmuted">{l}</dt></div>
            ))}
          </dl>
        </div>

        <figure className="card p-5">
          <figcaption className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-pmuted">{hero.kind} · {hero.universe}</p>
              <p className="mt-0.5 text-lg font-bold">{hero.name}</p>
            </div>
            <span className="rounded-full bg-gink/10 px-3 py-1 text-xs font-bold text-gink"><span aria-hidden>▲ </span><span className="num">{hero.cagr.toFixed(1)}%</span> CAGR, model</span>
          </figcaption>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full" role="img" aria-label={`${hero.name} model growth of 100, log scale`}>
            <defs><linearGradient id="hg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="var(--accent-ink)" stopOpacity=".28" /><stop offset="1" stopColor="var(--accent-ink)" stopOpacity="0" /></linearGradient></defs>
            {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="var(--page-line)" strokeDasharray="3 5" />)}
            <path d={`${hp}L${W},${H}L0,${H}Z`} fill="url(#hg)" />
            <path d={hp} pathLength={1} className="draw" fill="none" stroke="var(--accent-ink)" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
          <dl className="num mt-4 grid grid-cols-3 gap-3 border-t border-pline pt-4 text-sm">
            <div><dt className="text-[11px] text-pmuted">₹100 became</dt><dd className="font-bold">₹{hv[hv.length - 1].toFixed(0)}</dd></div>
            <div><dt className="text-[11px] text-pmuted">Max drawdown</dt><dd className="down font-bold">▼ {Math.abs(hero.maxDd).toFixed(1)}%</dd></div>
            <div><dt className="text-[11px] text-pmuted">Minimum investment</dt><dd className="font-bold">{hero.minimum}</dd></div>
          </dl>
          <p className="mt-3 text-[11px] text-pmuted">Model, back tested. Not a promise of future returns.</p>
        </figure>
      </section>
      <p className="wrap pb-2 text-right text-[11px] text-pmuted">Lines behind: all {list.length} strategies, model growth of ₹100 on one log scale. Back tested, not a promise of future returns.</p>
      </div>

      {/* One tabbed panel replaces four stacked sections */}
      <section className="wrap defer py-8 md:py-10" aria-labelledby="explore">
        <h2 id="explore" className="h2 mb-6 text-center">See the proof. Then see how it works.</h2>
        <Tabs
          tabs={[
            { id: "gap", label: "The gap", content: gap },
            { id: "how", label: "How it works", content: how },
            { id: "why", label: "Why us", content: why },
            { id: "lineup", label: "Strategies", content: lineup },
            { id: "tools", label: "Free tools", content: toolsPanel },
          ]}
        />
      </section>

      {/* Pricing: calculator + comparison side by side */}
      <section className="wrap defer py-8 md:py-10" id="pricing">
        <div className="mb-6 max-w-xl">
          <span className="badge badge-teal mb-3">What it costs</span>
          <h2 className="h2">One flat price. No fee on your trades.</h2>
        </div>
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <FeeCalculator />
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-sm">
              <caption className="sr-only">Index strategy compared with mutual funds, PMS and AIF</caption>
              <thead>
                <tr className="border-b border-pline text-xs text-pmuted">
                  <td className="p-3" />
                  <th scope="col" className="bg-aink/10 p-3 font-bold text-aink">Ours</th>
                  <th scope="col" className="p-3 font-medium">Mutual fund</th>
                  <th scope="col" className="p-3 font-medium">PMS</th>
                  <th scope="col" className="p-3 font-medium">AIF</th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([k, ...v]) => (
                  <tr key={k} className="border-b border-pline last:border-0">
                    <th scope="row" className="p-3 font-medium">{k}</th>
                    {v.map((c, i) => <td key={i} className={`p-3 ${i === 0 ? "bg-aink/10 font-semibold" : "text-pmuted"}`}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ + final CTA side by side */}
      <section className="wrap defer py-8 pb-12 md:py-10">
        <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="h2 mb-4">Questions worth asking first</h2>
            <Faq items={faqs} />
          </div>
          <div className="hero-bg relative overflow-hidden rounded-2xl p-7 lg:sticky lg:top-24">
            <div className="grid-lines absolute inset-0" aria-hidden />
            <div className="relative">
              <h2 className="h2 !text-white">Your edge is <span className="gold">waiting.</span></h2>
              <p className="mt-3 text-sm text-teal-100/90">Answer three questions and we point you to the strategy that fits. No account needed.</p>
              <div className="mt-6 grid gap-2.5">
                <Link href="/start" className="btn btn-light">Unlock my strategy →</Link>
                <Link href="/strategies" className="btn btn-outline-light">Browse strategies</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <StickyCta />
    </>
  );
}
