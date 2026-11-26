import { pct } from "@/lib/strategies";
import { riskWord } from "@/lib/plain";

/** Year-by-year returns as bars either side of a zero line: strategy (teal) against its index (grey). */
export function YearBars({ rows, name, bmName }: { rows: { label: string; a: number; b: number }[]; name: string; bmName: string }) {
  const max = Math.max(1, ...rows.flatMap((r) => [Math.abs(r.a), Math.abs(r.b)]));
  const lo = Math.min(0, ...rows.flatMap((r) => [r.a, r.b]));
  const hi = Math.max(0, ...rows.flatMap((r) => [r.a, r.b]));
  const span = hi - lo || max;
  const zero = (-lo / span) * 100;
  const bar = (v: number, cls: string) => {
    const w = (Math.abs(v) / span) * 100;
    return <span className={`absolute top-0 h-full rounded-sm ${cls}`} style={v >= 0 ? { left: `${zero}%`, width: `${w}%` } : { left: `${zero - w}%`, width: `${w}%` }} />;
  };
  return (
    <div className="card p-5 md:p-6">
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-pmuted">
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-4 rounded-sm bg-aink" />{name}</span>
        <span className="flex items-center gap-1.5"><i className="h-2.5 w-4 rounded-sm bg-[var(--page-muted)] opacity-60" />{bmName}</span>
      </div>
      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[4.5rem_1fr] items-center gap-3 sm:grid-cols-[6rem_1fr]">
            <span className="text-xs font-medium">{r.label}</span>
            <div role="img" aria-label={`${r.label}: ${name} ${pct(r.a, 1)}, ${bmName} ${pct(r.b, 1)}`}>
              <div className="relative h-3.5">{bar(r.a, r.a < 0 ? "bg-[var(--loss-ink)]" : "bg-aink")}<span className="absolute top-0 h-full w-px bg-[var(--page-line)]" style={{ left: `${zero}%` }} /></div>
              <div className="relative mt-1 h-2">{bar(r.b, "bg-[var(--page-muted)] opacity-50")}</div>
              <p className="num mt-1 flex justify-between text-[11px] text-pmuted">
                <span className={r.a < 0 ? "down font-semibold" : "up font-semibold"}>{r.a < 0 ? "▼" : "▲"} {pct(r.a, 1)}</span>
                <span>{pct(r.b, 1)}</span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Each fall as a bar, longest first, so the scale of the worst case is felt rather than read. */
export function FallBars({ rows }: { rows: { depth: number; when: string; days: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.depth)));
  return (
    <ol className="card space-y-4 p-5">
      {rows.map((d, i) => (
        <li key={i}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="down num text-lg font-bold">▼ {pct(d.depth, 2)}</span>
            <span className="text-right text-xs text-pmuted">{d.days}</span>
          </div>
          <div className="mt-1.5 h-2.5 rounded-full bg-page3" aria-hidden><div className="h-2.5 rounded-full bg-[var(--loss-ink)]" style={{ width: `${(Math.abs(d.depth) / max) * 100}%` }} /></div>
          <p className="mt-1 text-xs text-pmuted">{d.when}</p>
        </li>
      ))}
    </ol>
  );
}

const LEVELS = ["Moderate", "Moderately High", "High", "Very High"];
/** Four-step risk gauge so the band reads at a glance. */
export function RiskMeter({ risk }: { risk: string }) {
  const n = Math.max(1, LEVELS.indexOf(risk) + 1);
  return (
    <div role="img" aria-label={`${riskWord(risk)} risk, ${n} of 4`}>
      <div className="flex gap-1">
        {LEVELS.map((l, i) => <span key={l} className={`h-2 flex-1 rounded-full ${i < n ? (n >= 3 ? "bg-red-300" : "bg-white") : "bg-white/20"}`} />)}
      </div>
      <p className="mt-1.5 text-sm font-bold">{riskWord(risk)}</p>
    </div>
  );
}

type Roll = { label: string; worst: number; median: number; best: number; positive: number | null; windows: number | null };
/** Worst-to-best range for each holding period, with the median marked. A longer wait narrows the range. */
export function RollingRange({ rows }: { rows: Roll[] }) {
  const lo = Math.min(0, ...rows.map((r) => r.worst));
  const hi = Math.max(...rows.map((r) => r.best));
  const span = hi - lo || 1;
  const at = (v: number) => ((v - lo) / span) * 100;
  return (
    <div className="card space-y-6 p-5">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-semibold">{r.label.replace("Any 1 year, return", "Staying any 1 year").replace("Any 3 years, CAGR", "Staying any 3 years (per year)")}</span>
            {r.positive !== null && <span className="chip !py-0.5">Made money {r.positive}% of the time</span>}
          </div>
          <div className="relative mt-3 h-3 rounded-full bg-page3" role="img" aria-label={`Worst ${pct(r.worst)}, middle ${pct(r.median)}, best ${pct(r.best)}`}>
            <span className="absolute h-3 rounded-full bg-aink/30" style={{ left: `${at(r.worst)}%`, width: `${at(r.best) - at(r.worst)}%` }} />
            {lo < 0 && <span className="absolute -top-1 h-5 w-px bg-[var(--page-text)] opacity-40" style={{ left: `${at(0)}%` }} />}
            <span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--page-2)] bg-aink" style={{ left: `${at(r.median)}%` }} />
          </div>
          <dl className="num mt-2 grid grid-cols-3 text-xs">
            <div><dt className="text-pmuted">Worst</dt><dd className={`font-semibold ${r.worst < 0 ? "down" : "up"}`}>{r.worst < 0 ? "▼" : "▲"} {pct(r.worst)}</dd></div>
            <div className="text-center"><dt className="text-pmuted">Middle</dt><dd className="font-semibold">{pct(r.median)}</dd></div>
            <div className="text-right"><dt className="text-pmuted">Best</dt><dd className="up font-semibold">▲ {pct(r.best)}</dd></div>
          </dl>
        </div>
      ))}
    </div>
  );
}
