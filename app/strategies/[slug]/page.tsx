import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DATA_AS_OF, strategies, pct, growthSeries } from "@/lib/strategies";
import { sparkPath } from "@/lib/growth";
import { SparkSvg } from "@/components/Sparkline";
import SectionNav from "@/components/SectionNav";
import { BannerCta, BarCta, HeroCta } from "@/components/BasketCta";
import { dateIN } from "@/lib/pricing";
import { scheduleFor } from "@/lib/engine";
import Curve from "@/components/Curve";
import HoldingsGate from "@/components/HoldingsGate";
import { FallBars, RiskMeter, RollingRange, YearBars } from "@/components/Bars";

export function generateStaticParams() {
  return strategies.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = strategies.find((x) => x.slug === slug);
  if (!s) return { title: "Strategy", robots: { index: false } };
  const description = `${s.name}: ${s.universe}. Model CAGR ${s.cagr.toFixed(1)}% with a max drawdown of ${Math.abs(s.maxDd).toFixed(1)}% (back tested, not a promise). Holdings, risk and rolling returns.`;
  return { title: s.name, description, alternates: { canonical: `/strategies/${s.slug}` }, openGraph: { title: s.name, description, url: `/strategies/${s.slug}` } };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const tone = (n: number) => (n < 0 ? "down" : "up");

// Heat-map cell tint: colour intensity scales with the size of the move; the sign is still printed in the cell.
const heat = (r: number) => {
  const a = Math.min(0.5, Math.abs(r) / 20 + 0.06);
  return { background: `color-mix(in srgb, ${r < 0 ? "var(--loss-ink)" : "var(--gain-ink)"} ${Math.round(a * 100)}%, transparent)` };
};

const tabs = [
  ["performance", "Performance"],
  ["risk", "Risk"],
  ["holdings", "Holdings"],
];

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
  const alpha = s.cagr - s.benchmark.cagr;
  const hv = growthSeries(s);
  const model = s.growth?.model ?? hv[hv.length - 1];
  const nifty = s.benchmark.growth; // the basket's own benchmark, which the panel names
  const lakh = (v: number) => `₹${(v / 100).toFixed(v >= 1000 ? 0 : 1)}L`;
  const facts: [string, string, string, string][] = [
    ["▲", "CAGR, model", `${s.cagr.toFixed(1)}%`, "up"],
    ["◎", `Beats ${s.benchmark.name}`, `+${alpha.toFixed(1)}% a year`, "up"],
    ["▼", "Worst fall", `${Math.abs(s.maxDd).toFixed(1)}%`, "down"],
    ["₹", "Minimum investment", s.minimum, ""],
  ];
  const others = strategies.filter((x) => x.slug !== s.slug && x.kind === s.kind).slice(0, 3);

  return (
    <div>
      <div className="wrap pt-8 md:pt-12">
        <Link href="/strategies" className="text-sm font-medium text-aink hover:underline">← All strategies</Link>
        <div className="mt-5 grid items-start gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">{s.kind}</span>
              <span className="chip">{s.universe}</span>
            </div>
            <h1 className="h1 mt-4 !text-[clamp(2rem,4.2vw,3rem)]">{s.name}</h1>
            <p className="lead mt-3 max-w-xl">Rules pick the stocks. Your broker places the trades, and you approve each one.</p>
            {sched && (
              <p className="num mt-3 text-sm text-pmuted" data-schedule>
                Rebalances every {sched.everyWeeks} week{sched.everyWeeks > 1 ? "s" : ""} · next on <b className="text-ptext">{dateIN(sched.next)}</b>
              </p>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-3">
              {facts.map(([ic, k, v, c]) => (
                <div key={k} className="card flex items-center gap-3 p-4">
                  <span className="tile tile-sm !h-9 !w-9" aria-hidden>{ic}</span>
                  <div className="min-w-0"><dt className="truncate text-xs text-pmuted">{k}</dt><dd className={`num text-lg font-extrabold ${c}`}>{v}</dd></div>
                </div>
              ))}
            </dl>

            {/* The placeholder offers nothing, so a subscriber never sees "Subscribe" flash up while their plan loads. */}
            <div className="mt-6">
              <Suspense fallback={<div className="h-[4.75rem]" aria-busy />}>
                <HeroCta slug={s.slug} />
              </Suspense>
            </div>
          </div>

          <div className="hero-bg relative overflow-hidden rounded-2xl p-5 md:p-6">
            <div className="grid-lines absolute inset-0" aria-hidden />
            <div className="relative">
              <p className="text-sm text-teal-100/90">₹1,00,000 invested{s.growth ? `, ${s.growth.start} to ${s.growth.end}` : ""}</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="band-card p-4"><p className="truncate text-xs font-semibold text-teal-100">{s.name}</p><p className="num gold mt-1 text-3xl font-extrabold">{lakh(model)}</p><p className="text-xs text-teal-100/90">{(model / 100).toFixed(1)}× your money</p></div>
                <div className="band-card p-4"><p className="truncate text-xs font-semibold text-teal-100">{s.benchmark.name}</p><p className="num mt-1 text-3xl font-extrabold text-white/80">{lakh(nifty)}</p><div className="mt-2 h-1.5 rounded-full bg-white/15" aria-hidden><div className="h-1.5 rounded-full bg-white/70" style={{ width: `${Math.min(100, (nifty / model) * 100)}%` }} /></div></div>
              </div>
              <div className="mt-4 text-white [&_svg]:h-16" aria-hidden><SparkSvg line={sparkPath(s.monthly)} /></div>
              <div className="mt-4 rounded-xl bg-white/10 p-3 text-white">
                <p className="mb-2 text-xs text-teal-100/90">Risk band</p>
                <RiskMeter risk={s.risk} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SectionNav items={tabs as unknown as [string, string][]} action={<Suspense fallback={null}><BarCta slug={s.slug} /></Suspense>} />

      <div className="wrap pb-16">
        <section id="performance" className="scroll-mt-32 pt-14">
          <h2 className="h2 !text-[clamp(1.5rem,2.8vw,2rem)]">What has {s.name} returned in the back test?</h2>
          <p className="mt-2 max-w-3xl text-pmuted">{s.backtest}</p>
          <div className="mt-6"><Curve s={{ name: s.name, slug: s.slug, growth: s.growth, monthly: s.monthly, benchmark: s.benchmark }} /></div>

          <h3 className="mt-14 text-xl font-semibold">{s.name} against {s.benchmark.name}</h3>
          <p className="mt-2 max-w-3xl text-sm text-pmuted">Same period for both, back tested from {s.startDate}.{s.benchmark.note ? ` ${s.benchmark.note}` : ""}</p>
          <div className="card mt-4 overflow-x-auto">
            <table className="num w-full min-w-[520px] text-sm">
              <caption className="sr-only">Strategy compared with its index</caption>
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
                  ["CAGR", s.cagr, s.benchmark.cagr],
                  ["Max drawdown", s.maxDd, s.benchmark.maxDd],
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

          <h3 className="mt-14 text-xl font-semibold">Calendar year returns</h3>
          <div className="mt-4"><YearBars name={s.name} bmName={s.benchmark.name} rows={s.calendar.map((c) => ({ label: `${c.year}${c.note ? " *" : ""}`, a: c.ret, b: s.benchmark.calendar.find((x) => x.year === c.year)?.ret ?? 0 }))} /></div>
          {s.calendar.some((c) => c.note) && <p className="mt-2 text-xs text-pmuted">* part year: {s.calendar.filter((c) => c.note).map((c) => `${c.year} ${c.note}`).join(", ")}.</p>}

          <h3 className="mt-14 text-xl font-semibold">Monthly returns (%)</h3>
          <div className="card mt-4 overflow-x-auto">
            <table className="num w-full min-w-[760px] border-separate border-spacing-1 p-2 text-center text-xs">
              <caption className="sr-only">Monthly model returns by year</caption>
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
        </section>

        <section id="risk" className="scroll-mt-32 pt-16">
          <h2 className="h2 !text-[clamp(1.5rem,2.8vw,2rem)]">Risk, on its own screen</h2>
          <p className="mt-2 max-w-3xl text-pmuted">Read the falls before the gains. These are the worst stretches in the back test.</p>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-semibold">Deepest falls</h3>
              <div className="mt-4"><FallBars rows={s.drawdowns} /></div>
            </div>
            <div>
              <h3 className="text-xl font-semibold">Rolling returns</h3>
              <div className="mt-4"><RollingRange rows={s.rolling} /></div>
            </div>
          </div>
        </section>

        <section id="holdings" className="scroll-mt-32 pt-16">
          <h2 className="h2 !text-[clamp(1.5rem,2.8vw,2rem)]">Current holdings</h2>
          <div className="mt-4">
            <Suspense fallback={<div className="card h-56" aria-busy />}>
              <HoldingsGate slug={s.slug} returnTo={`/strategies/${s.slug}#holdings`} />
            </Suspense>
          </div>
        </section>

        {others.length > 0 && (
          <section className="pt-16">
            <h3 className="text-xl font-semibold">Similar strategies</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {others.map((o) => (
                <Link key={o.slug} href={`/strategies/${o.slug}`} className="card card-link p-5">
                  <p className="font-semibold">{o.name}</p>
                  <div className="mt-2"><SparkSvg line={sparkPath(o.monthly)} /></div>
                  <p className="num mt-2 text-sm"><span className="up font-semibold">▲ {o.cagr.toFixed(1)}%</span> <span className="text-pmuted">CAGR</span></p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="hero-bg relative mt-16 overflow-hidden rounded-2xl p-7 md:p-10">
          <div className="grid-lines absolute inset-0" aria-hidden />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <Suspense fallback={<div className="h-16" aria-busy />}>
              <BannerCta slug={s.slug} name={s.name} />
            </Suspense>
          </div>
        </div>

        <details className="mt-14 text-xs text-pmuted">
          <summary className="flex w-fit items-center gap-2 font-medium text-ptext">Important disclosures <span className="plus inline-block transition-transform" aria-hidden>+</span></summary>
          <p className="mt-3 max-w-3xl leading-relaxed">
            Figures are model, back tested, as of {DATA_AS_OF}. Not a promise of future
            returns.
          </p>
        </details>
      </div>
    </div>
  );
}
