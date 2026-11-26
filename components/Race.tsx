import Link from "next/link";
import { PAST_NOTE, duration, lakh } from "@/lib/plain";
import type { Strategy } from "@/lib/strategies";

/**
 * Same ₹1 lakh, same dates: every basket tested over the longest period, next to the Nifty 50 over those dates.
 * All of them are listed, not just the winners, and shorter tests are left out so the race is fair.
 */
export default function Race({ list }: { list: Strategy[] }) {
  const from = list.reduce((a, s) => (Date.parse(s.growth!.start) < Date.parse(a) ? s.growth!.start : a), list[0].growth!.start);
  const racers = list.filter((s) => s.growth!.start === from).sort((a, b) => b.growth!.model - a.growth!.model);
  const { end, nifty } = racers[0].growth!;
  const time = duration(from, end);
  const rows = [
    ...racers.map((s) => ({ key: s.slug, name: s.name, value: s.growth!.model, href: `/strategies/${s.slug}` as string | null })),
    { key: "market", name: "Market (Nifty 50)", value: nifty, href: null },
  ].sort((a, b) => b.value - a.value);
  const top = rows[0].value;
  const ahead = racers.filter((s) => s.growth!.model > nifty).length;
  const rest = list.length - racers.length;

  return (
    <div className="card p-5 md:p-7" data-race>
      <h2 id="race" className="h2">Same ₹1 lakh. Same {time}. 🏁</h2>
      <p className="mt-2 text-sm font-semibold up">{ahead === racers.length ? `All ${racers.length} of these baskets finished ahead of the market` : `${ahead} of these ${racers.length} baskets finished ahead of the market`}</p>
      <ol className="mt-5 space-y-3">
        {rows.map((r) => {
          const bar = (
            <>
              <span className="flex items-baseline justify-between gap-3 text-sm">
                <span className={r.href ? "font-semibold" : "text-pmuted"}>{r.name}{r.href && <span aria-hidden className="text-aink"> →</span>}</span>
                <b className="num text-base">{lakh(r.value)}</b>
              </span>
              <span className="mt-1 block h-3 rounded-full bg-page3" aria-hidden>
                <span className={`block h-3 rounded-full ${r.href ? "bg-aink" : "bg-[var(--page-muted)] opacity-60"}`} style={{ width: `${(r.value / top) * 100}%` }} />
              </span>
            </>
          );
          return <li key={r.key} data-racer={r.key}>{r.href ? <Link href={r.href} className="block rounded-lg py-0.5 transition-opacity hover:opacity-80">{bar}</Link> : <div className="py-0.5">{bar}</div>}</li>;
        })}
      </ol>
      <p className="mt-4 text-xs leading-relaxed text-pmuted">
        {from} to {end}. This shows every basket we have tested for this whole time{rest > 0 ? `; the other ${rest} have shorter tests` : ""}. Nifty 50 is 50 very big companies; each basket&apos;s page also compares it with a closer match. Our price and tax are not taken out. {PAST_NOTE}
      </p>
    </div>
  );
}
