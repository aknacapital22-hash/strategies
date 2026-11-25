import { dateIN } from "@/lib/pricing";
import type { EngineResult } from "@/lib/engine";

type Entry = EngineResult["changes"][number];

function Chips({ names, kind }: { names: string[]; kind: "in" | "out" }) {
  if (names.length === 0) return <span className="text-sm text-pmuted">none</span>;
  return (
    <ul className="flex flex-wrap gap-1.5" data-chips={kind}>
      {names.map((n) => (
        <li key={n} className={`chip !py-0.5 ${kind === "in" ? "!border-[var(--gain-ink)]/40 up" : "!border-[var(--loss-ink)]/40 down"}`}>
          <span aria-hidden>{kind === "in" ? "▲" : "▼"}</span> {n}
        </li>
      ))}
    </ul>
  );
}

function Row({ e }: { e: Entry }) {
  const none = e.in.length === 0 && e.out.length === 0;
  return (
    <li className="card p-5" data-entry={e.signal} data-status={e.status}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="num font-semibold">{dateIN(e.signal)}</p>
        {e.status === "pending" ? (
          <span className="rounded-full bg-aink/10 px-2.5 py-1 text-xs font-semibold text-aink">Latest signal · trades at the next session</span>
        ) : (
          <span className="rounded-full bg-page3 px-2.5 py-1 text-xs font-semibold text-pmuted">Rebalanced{e.exec ? ` on ${dateIN(e.exec)}` : ""}</span>
        )}
      </div>
      {none ? (
        <p className="mt-3 text-sm text-pmuted">No changes. The same {e.size} stocks stayed.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pmuted">In ({e.in.length})</p><Chips names={e.in} kind="in" /></div>
          <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-pmuted">Out ({e.out.length})</p><Chips names={e.out} kind="out" /></div>
        </div>
      )}
    </li>
  );
}

/** What changed at each rebalance, and when the next one is due. Shown to subscribers only (it names stocks). */
export default function RebalanceLog({ log, schedule }: { log: Entry[]; schedule: EngineResult["schedule"] }) {
  if (log.length === 0) return null;
  const [first, second, ...rest] = log;
  const shown = [first, second].filter(Boolean) as Entry[];
  return (
    <section id="changes" aria-label="Rebalance history" className="scroll-mt-32">
      <h3 className="text-xl font-semibold">Rebalance history</h3>
      <p className="mt-1 text-sm text-pmuted">
        This basket rebalances every {schedule.everyWeeks} week{schedule.everyWeeks > 1 ? "s" : ""}. Next rebalance: <b className="num text-ptext" data-next>{dateIN(schedule.next)}</b>.
      </p>
      <ol className="mt-4 space-y-3">{shown.map((e) => <Row key={e.signal} e={e} />)}</ol>
      {rest.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-medium text-aink">Earlier rebalances ({rest.length})</summary>
          <ol className="mt-3 space-y-3">{rest.map((e) => <Row key={e.signal} e={e} />)}</ol>
        </details>
      )}
    </section>
  );
}
