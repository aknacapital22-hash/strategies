import { Suspense } from "react";
import Link from "next/link";
import { strategies } from "@/lib/strategies";
import { getUser } from "@/lib/auth/session";
import { requestsFor } from "@/lib/auth/store";
import { QUARTER, dateIN } from "@/lib/pricing";
import { shortId } from "@/lib/payment";
import { scheduleFor } from "@/lib/engine";
import Sparkline from "@/components/Sparkline";

export const metadata = { title: "My baskets" };

type SP = { show?: string };

// This page lists baskets and their status only. Holdings are never rendered here: they open on each basket's own page,
// and only for subscribers.
async function Baskets({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await getUser();
  const asked = (await searchParams).show ?? "";
  const show = ["subscribed", "pending", "not"].includes(asked) ? asked : "all";
  const pending = new Map((user ? await requestsFor(user.id) : []).filter((r) => r.status === "pending").map((r) => [r.slug, r]));
  const status = (slug: string) => (user?.subs.includes(slug) ? "subscribed" : pending.has(slug) ? "pending" : "not");

  const all = [...strategies].sort((a, b) => b.cagr - a.cagr);
  const counts = {
    all: all.length,
    subscribed: all.filter((s) => status(s.slug) === "subscribed").length,
    pending: all.filter((s) => status(s.slug) === "pending").length,
    not: all.filter((s) => status(s.slug) === "not").length,
  };
  const order = { subscribed: 0, pending: 1, not: 2 } as const;
  const list = all
    .filter((s) => show === "all" || status(s.slug) === show)
    .sort((a, b) => order[status(a.slug)] - order[status(b.slug)] || b.cagr - a.cagr);

  const filters: [string, string, number][] = [
    ["all", "All", counts.all],
    ["subscribed", "Subscribed", counts.subscribed],
    ["pending", "Pending", counts.pending],
    ["not", "Not subscribed", counts.not],
  ];

  return (
    <>
      {!user ? (
        <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 p-6">
          <p className="max-w-xl"><b>Log in to see your baskets.</b> You can read about every basket here. The stocks inside open for the baskets you subscribe to.</p>
          <div className="flex gap-3">
            <Link href="/login?next=/portfolios" className="btn btn-primary">Log in</Link>
            <Link href="/signup?next=/portfolios" className="btn btn-ghost">Create account</Link>
          </div>
        </div>
      ) : (
        <p className="mt-6 text-pmuted" data-summary>
          <b className="text-ptext">{counts.subscribed}</b> subscribed{counts.pending > 0 && <>, <b className="text-ptext">{counts.pending}</b> waiting for approval</>}. <Link href="/account" className="font-medium text-aink hover:underline">Manage subscriptions →</Link>
        </p>
      )}

      <nav aria-label="Filter baskets" className="mt-6 flex flex-wrap gap-2">
        {filters
          .filter(([id]) => user || id === "all" || id === "not")
          .map(([id, label, n]) => (
            <Link key={id} href={id === "all" ? "/portfolios" : `/portfolios?show=${id}`} className={`chip !min-h-9 ${show === id ? "on" : ""}`} aria-current={show === id ? "page" : undefined}>
              {label} <span className="num opacity-70">{n}</span>
            </Link>
          ))}
      </nav>

      {list.length === 0 && <p className="card mt-6 p-8 text-center text-pmuted">No baskets here. <Link href="/portfolios" className="font-medium text-aink hover:underline">Show all baskets</Link></p>}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => {
          const st = status(s.slug);
          const pend = pending.get(s.slug);
          return (
            <article key={s.slug} className="card flex flex-col p-6" data-basket={s.slug} data-status={st}>
              <div className="flex items-center justify-between gap-2">
                <span className="chip">{s.kind}</span>
                {st === "subscribed" && <span className="rounded-full bg-[var(--gain-ink)]/12 px-2.5 py-1 text-xs font-semibold up">● Subscribed</span>}
                {st === "pending" && <span className="rounded-full bg-aink/10 px-2.5 py-1 text-xs font-semibold text-aink">◌ Pending approval</span>}
                {st === "not" && <span className="rounded-full bg-page3 px-2.5 py-1 text-xs font-semibold text-pmuted">Not subscribed</span>}
              </div>

              <h2 className="mt-4 text-xl font-semibold">{s.name}</h2>
              <p className="mt-1 text-sm text-pmuted">{s.risk} risk · {s.universe}</p>
              <div className="mt-4"><Sparkline s={s} /></div>

              <dl className="num mt-4 grid grid-cols-3 gap-2 border-t border-pline pt-4 text-sm">
                <div><dt className="text-[11px] text-pmuted">CAGR</dt><dd className="up font-bold">▲ {s.cagr.toFixed(1)}%</dd></div>
                <div><dt className="text-[11px] text-pmuted">Max drawdown</dt><dd className="down font-bold">▼ {Math.abs(s.maxDd).toFixed(1)}%</dd></div>
                <div><dt className="text-[11px] text-pmuted">Min. investment</dt><dd className="font-bold">{s.minimum}</dd></div>
              </dl>

              {scheduleFor(s.slug) && <p className="num mt-3 text-xs text-pmuted" data-next>Next rebalance {dateIN(scheduleFor(s.slug)!.next)}</p>}
              {st === "subscribed" && user && <p className="num mt-3 text-xs text-pmuted">Active until {dateIN(user.subExp[s.slug])}</p>}
              {st === "pending" && pend && <p className="num mt-3 text-xs text-pmuted">Request {shortId(pend.id)}. We will activate it once your payment is confirmed.</p>}

              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                {st === "subscribed" && (
                  <>
                    <Link href={`/strategies/${s.slug}#holdings`} className="btn btn-primary !min-h-0 !py-2">View holdings →</Link>
                    <Link href={`/strategies/${s.slug}#rebalance`} className="btn btn-ghost !min-h-0 !py-2">Rebalance</Link>
                    <Link href={`/subscribe/${s.slug}`} className="btn btn-ghost !min-h-0 !py-2">Renew</Link>
                  </>
                )}
                {st === "pending" && pend && (
                  <>
                    <Link href={`/subscribe/${s.slug}/pay?r=${pend.id}`} className="btn btn-primary !min-h-0 !py-2">Payment status</Link>
                    <Link href={`/strategies/${s.slug}`} className="btn btn-ghost !min-h-0 !py-2">Details</Link>
                  </>
                )}
                {st === "not" && (
                  <>
                    <Link href={`/subscribe/${s.slug}`} className="btn btn-primary !min-h-0 !py-2">Subscribe · from {QUARTER}</Link>
                    <Link href={`/strategies/${s.slug}`} className="btn btn-ghost !min-h-0 !py-2">Details</Link>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

export default function PortfoliosPage({ searchParams }: { searchParams: Promise<SP> }) {
  return (
    <div className="wrap py-10 md:py-14">
      <p className="eyebrow">Baskets</p>
      <h1 className="h1 mt-4 !text-[clamp(1.75rem,3.4vw,2.5rem)]">My baskets</h1>
      <p className="lead mt-4 max-w-3xl">Open a basket to see the stocks it holds and work out your rebalance. Holdings are visible for baskets you subscribe to.</p>
      <Suspense fallback={<div className="card mt-8 h-64" aria-busy />}>
        <Baskets searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
