import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DATA_AS_OF, strategies, pct } from "@/lib/strategies";
import { PAST_NOTE, aboutBasket, duration, howOften, kindWord, lakh, riskWord } from "@/lib/plain";
import OpenOnJump from "@/components/OpenOnJump";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs, graph, isoDate, pageMeta, webPage } from "@/lib/seo";
import Words from "@/components/Words";
import SectionNav from "@/components/SectionNav";
import { BannerView, BarView, HeroView } from "@/components/BasketCta";
import { BasketProvider, BasketSlot } from "@/components/BasketSlots";
import { NOTIFY_LINE, dateIN } from "@/lib/pricing";
import { engine, scheduleFor } from "@/lib/engine";
import Curve from "@/components/Curve";
import { Locked } from "@/components/HoldingsGate";
import { FallBars, RiskMeter, RollingRange, YearBars } from "@/components/Bars";
import type { ReactNode } from "react";

export function generateStaticParams() {
  return strategies.map((s) => ({ slug: s.slug }));
}

/** Search title, description and address for one basket. */
function seoFor(s: (typeof strategies)[number]) {
  const kind = /basket$/i.test(s.name) ? s.name : `${s.name} Stock Basket`;
  return {
    title: `${kind}: Past Returns and Risk`,
    description: `${s.name}: ${aboutBasket(s.slug)} Back-tested growth, biggest falls and risk. Past data, not a promise.`,
    path: `/strategies/${s.slug}`,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = strategies.find((x) => x.slug === slug);
  if (!s) return { title: "Basket not found", robots: { index: false } };
  return pageMeta({ ...seoFor(s), ownImage: true });
}

/** The page is built once, for visitors. A signed-in person's buttons and holdings are fetched by BasketProvider. */
const VISITOR = { kind: "none" } as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const tone = (n: number) => (n < 0 ? "down" : "up");

// Heat-map cell tint: colour intensity scales with the size of the move; the sign is still printed in the cell.
const heat = (r: number) => {
  const a = Math.min(0.5, Math.abs(r) / 20 + 0.06);
  return { background: `color-mix(in srgb, ${r < 0 ? "var(--loss-ink)" : "var(--gain-ink)"} ${Math.round(a * 100)}%, transparent)` };
};

const tabs = [
  ["performance", "Growth"],
  ["numbers", "Numbers"],
  ["risk", "Risk"],
  ["holdings", "Inside"],
];

/** A "see more" box: closed until someone wants it, with everything inside. */
function More({ id, title, hint, children }: { id: string; title: string; hint: string; children: ReactNode }) {
  return (
    <details id={id} className="card mt-6 scroll-mt-32 p-5 md:p-6">
      <summary className="flex items-center justify-between gap-4">
        <span><span className="block text-lg font-bold">{title}</span><span className="mt-1 block text-sm text-pmuted">{hint}</span></span>
        <span className="plus grid h-9 w-9 shrink-0 place-items-center rounded-full border border-pline text-xl text-pmuted transition-transform" aria-hidden>+</span>
      </summary>
      <div className="mt-6 border-t border-pline pt-6">{children}</div>
    </details>
  );
}

// Cache Components: reading params must sit under a Suspense boundary. The slug set is fully known from
// generateStaticParams, so every real page is still prerendered; unknown slugs are rejected with a 404 in proxy.ts.
export default function StrategyPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="wrap py-20 text-pmuted" aria-busy>Loading strategy…</div>}>
      <StrategyContent params={params} />
    </Suspense>
  );
}

async function StrategyContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = strategies.find((x) => x.slug === slug);
  if (!s) notFound();
  const sched = scheduleFor(s.slug); // dates only, no stock names

  const years = [...new Set(s.monthly.map((m) => m.y))];
  const cell = (y: number, m: number) => s.monthly.find((x) => x.y === y && x.m === m)?.r;
  const grown = s.growth!;
  const model = grown.model;
  const nifty = s.benchmark.growth; // the basket's own comparison index, which the panel names
  const time = duration(grown.start, grown.end);
  const top = Math.max(model, nifty);
  const facts: [string, string, string][] = [
    ["◎", "Risk", riskWord(s.risk)],
    ["₹", "Start with just", s.minimum],
    ["↻", "List is checked", howOften(s.universe)],
    ["▣", "What is inside", kindWord(s.kind)],
  ];
  const others = strategies.filter((x) => x.slug !== s.slug && x.kind === s.kind).slice(0, 3);
  const seo = seoFor(s);

  return (
    <BasketProvider slug={s.slug}>
    <div>
      <JsonLd data={graph(
        { ...webPage("WebPage", seo.title, seo.description, seo.path), dateModified: isoDate(DATA_AS_OF) },
        breadcrumbs(["All baskets", "/strategies"], [s.name, seo.path]),
      )} />
      <div className="wrap pt-8 md:pt-12">
        <Link href="/strategies" className="text-sm font-medium text-aink hover:underline">← All baskets</Link>
        <div className="mt-5 grid items-start gap-6 lg:grid-cols-[1.1fr_1fr] lg:grid-rows-[auto_1fr] lg:gap-x-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">{kindWord(s.kind)}</span>
            </div>
            <h1 className="h1 mt-4 !text-[clamp(2rem,4.2vw,3rem)]">{s.name}</h1>
            <p className="lead mt-3 max-w-xl">{aboutBasket(s.slug)} We pick them by fixed rules. You buy them in your own share app.</p>
          </div>

          <div className="lg:col-start-1 lg:row-start-2 max-lg:order-last">
            {sched && (
              <p className="num text-sm text-pmuted" data-schedule>
                The list is checked {howOften(s.universe)} · next on <b className="text-ptext">{dateIN(sched.next)}</b>
                <span className="mt-1 block text-xs">{NOTIFY_LINE}</span>
              </p>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-3">
              {facts.map(([ic, k, v]) => (
                <div key={k} className="card flex items-center gap-3 p-4">
                  <span className="tile tile-sm !h-9 !w-9" aria-hidden>{ic}</span>
                  <div className="min-w-0"><dt className="text-xs text-pmuted">{k}</dt><dd className="num text-base font-extrabold leading-tight">{v}</dd></div>
                </div>
              ))}
            </dl>

            {/* The placeholder offers nothing, so a subscriber never sees "Subscribe" flash up while their plan loads. */}
            <div className="mt-6">
              <BasketSlot name="hero" anon={<HeroView slug={s.slug} state={VISITOR} />} pending={<div className="h-[4.75rem]" aria-busy />} />
            </div>
          </div>

          <div className="hero-bg relative overflow-hidden rounded-2xl p-5 md:p-7 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="grid-lines absolute inset-0" aria-hidden />
            <div className="relative">
              <p className="text-sm text-teal-100/90">₹1 lakh in this basket would have become</p>
              <p className="num gold mt-1 text-5xl font-extrabold">{lakh(model)}</p>
              <p className="mt-1 text-sm text-teal-100/90">in {time} ({grown.start} to {grown.end})</p>
              <ul className="mt-6 space-y-4">
                {([[s.name, model, "bg-[#fcd34d]"], [`Market (${s.benchmark.name}), same time`, nifty, "bg-white/60"]] as const).map(([label, v, tone]) => (
                  <li key={label} className="text-sm">
                    <div className="flex justify-between gap-3 text-white"><span>{label}</span><b className="num">{lakh(v)}</b></div>
                    <div className="mt-1.5 h-3 rounded-full bg-white/15" aria-hidden><div className={`h-3 rounded-full ${tone}`} style={{ width: `${(v / top) * 100}%` }} /></div>
                  </li>
                ))}
              </ul>
              {model > nifty && <p className="mt-4 text-lg font-extrabold text-white">🏆 {lakh(model - nifty)} more than the market</p>}
              <p className="mt-2 text-xs text-teal-100/90">“Market” means {s.benchmark.name}, a standard list of companies.</p>
              <p className="mt-4 rounded-xl bg-white/10 p-3 text-xs leading-relaxed text-white">{PAST_NOTE} <a href="#risk" className="font-semibold underline underline-offset-2">See the risks</a></p>
            </div>
          </div>
        </div>
      </div>

      <OpenOnJump />
      <SectionNav items={tabs as unknown as [string, string][]} action={<BasketSlot name="bar" anon={<BarView slug={s.slug} state={VISITOR} />} pending={null} />} />

      <div className="wrap pb-16">
        <section id="performance" className="scroll-mt-32 pt-14">
          <h2 className="h2 !text-[clamp(1.5rem,2.8vw,2rem)]">How ₹1 lakh grew</h2>
          <p className="mt-2 max-w-3xl text-pmuted">Touch the chart to see the amount in any month.</p>
          <div className="mt-6"><Curve s={{ name: s.name, slug: s.slug, growth: s.growth, monthly: s.monthly, benchmark: s.benchmark }} /></div>

          <p className="mt-10 font-semibold">Want every detail? Tap a box below.</p>
          <More id="numbers" title="All the numbers" hint="Every year and every month">
            <p className="max-w-3xl text-sm text-pmuted">Tested on old prices from {grown.start} to {grown.end}, after a guess for trading costs. Not a promise of future growth.</p>

            <h3 className="mt-8 text-xl font-semibold">{s.name} against {s.benchmark.name}</h3>
            <p className="mt-2 max-w-3xl text-sm text-pmuted">Same dates for both, from {s.startDate}.{s.benchmark.note ? ` ${s.benchmark.note}` : ""}</p>
            <div className="mt-4 overflow-x-auto rounded-xl border border-pline">
              <table className="num w-full min-w-[520px] text-sm">
                <caption className="sr-only">Basket compared with its index</caption>
                <thead>
                  <tr className="text-left text-pmuted">
                    <th scope="col" className="p-3 font-medium">Measure</th>
                    <th scope="col" className="p-3 font-medium">{s.name}</th>
                    <th scope="col" className="p-3 font-medium">{s.benchmark.name}</th>
                    <th scope="col" className="p-3 font-medium">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Growth each year (average)", s.cagr, s.benchmark.cagr],
                    ["Biggest fall", s.maxDd, s.benchmark.maxDd],
                  ].map(([k, a, b]) => (
                    <tr key={k as string} className="border-t border-pline">
                      <th scope="row" className="p-3 text-left font-medium">{k}</th>
                      <td className={`p-3 font-semibold ${tone(a as number)}`}>{pct(a as number, 1)}</td>
                      <td className={`p-3 ${b === null ? "text-pmuted" : tone(b as number)}`}>{b === null ? "-" : pct(b as number, 1)}</td>
                      <td className={`p-3 font-semibold ${b === null ? "text-pmuted" : tone((a as number) - (b as number))}`}>{b === null ? "-" : pct((a as number) - (b as number), 1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="mt-10 text-xl font-semibold">Growth in each year</h3>
            <div className="mt-4"><YearBars name={s.name} bmName={s.benchmark.name} rows={s.calendar.map((c) => ({ label: `${c.year}${c.note ? " *" : ""}`, a: c.ret, b: s.benchmark.calendar.find((x) => x.year === c.year)?.ret ?? 0 }))} /></div>
            {s.calendar.some((c) => c.note) && <p className="mt-2 text-xs text-pmuted">* part year: {s.calendar.filter((c) => c.note).map((c) => `${c.year} ${c.note}`).join(", ")}.</p>}

            <h3 className="mt-10 text-xl font-semibold">Growth in each month (%)</h3>
            <div className="mt-4 overflow-x-auto rounded-xl border border-pline">
              <table className="num w-full min-w-[760px] border-separate border-spacing-1 p-2 text-center text-xs">
                <caption className="sr-only">Monthly past-data returns by year</caption>
                <thead>
                  <tr className="text-pmuted">
                    <th className="p-2 text-left font-medium">Year</th>
                    {MONTHS.map((m) => <th key={m} className="p-2 font-medium">{m}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {years.map((y) => (
                    <tr key={y}>
                      <th scope="row" className="p-2 text-left font-semibold">{y}</th>
                      {MONTHS.map((_, i) => {
                        const r = cell(y, i + 1);
                        return (
                          <td key={i} className="rounded-md p-2 font-medium" style={r === undefined ? undefined : heat(r)}>
                            {r === undefined ? "" : r.toFixed(1)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </More>
        </section>

        <More id="risk" title="Good to know: when it fell" hint="Please read before you put in money">
          <p className="max-w-3xl text-sm text-pmuted">Share prices go up and down. These were the hardest times in our test. A future fall can be bigger.</p>
          <div className="mt-5 max-w-md rounded-xl bg-[#0f766e] p-4 text-white">
            <p className="mb-2 text-xs text-teal-100/90">Risk level</p>
            <RiskMeter risk={s.risk} />
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold">Biggest falls</h3>
              <p className="mt-1 text-xs text-pmuted">From a high point to the lowest point after it.</p>
              <div className="mt-4"><FallBars rows={s.drawdowns} /></div>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Does the start day matter?</h3>
              <p className="mt-1 text-xs text-pmuted">We checked every possible start day. Here are the worst, middle and best results.</p>
              <div className="mt-4"><RollingRange rows={s.rolling} /></div>
            </div>
          </div>
        </More>

        <Words className="mt-6" />

        <section id="holdings" className="scroll-mt-32 pt-16">
          <h2 className="h2 !text-[clamp(1.5rem,2.8vw,2rem)]">What is inside the basket today</h2>
          <div className="mt-4">
            <BasketSlot
              name="holdings"
              pending={<div className="card h-56" aria-busy />}
              anon={<Locked slug={s.slug} name={s.name} loggedIn={false} returnTo={`/strategies/${s.slug}#holdings`} state={VISITOR} count={engine[s.slug]?.portfolio.length ?? 0} next={sched?.next} />}
            />
          </div>
        </section>

        {others.length > 0 && (
          <section className="pt-16">
            <h2 className="text-xl font-semibold">Similar baskets</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {others.map((o) => (
                <Link key={o.slug} href={`/strategies/${o.slug}`} className="card card-link p-5">
                  <h3 className="font-semibold">{o.name}</h3>
                  <p className="mt-2 text-xs text-pmuted">₹1 lakh would have become</p>
                  <p className="num up text-xl font-bold">{lakh(o.growth!.model)}</p>
                  <p className="text-xs text-pmuted">in {duration(o.growth!.start, o.growth!.end)}, tested on past data</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="hero-bg relative mt-16 overflow-hidden rounded-2xl p-7 md:p-10">
          <div className="grid-lines absolute inset-0" aria-hidden />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <BasketSlot name="banner" anon={<BannerView slug={s.slug} name={s.name} state={VISITOR} />} pending={<div className="h-16" aria-busy />} />
          </div>
        </div>

        <details className="mt-14 text-xs text-pmuted">
          <summary className="flex w-fit items-center gap-2 font-medium text-ptext">Important disclosures <span className="plus inline-block transition-transform" aria-hidden>+</span></summary>
          <p className="mt-3 max-w-3xl leading-relaxed">
            All numbers come from a test on old prices, up to {DATA_AS_OF}. They do not promise future growth.
          </p>
        </details>
      </div>
    </div>
    </BasketProvider>
  );
}
