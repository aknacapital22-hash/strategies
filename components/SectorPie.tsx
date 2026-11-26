"use client";

import { useState } from "react";

type Part = { name: string; weight: number };
type Slice = { key: string; name: string; weight: number; color: string; detail?: string };

/** Up to eight sectors get their own colour; with more, the first seven do and the rest share "Other". */
const MAX_COLOURS = 8;
const pct = (n: number) => `${Math.round(n * 10) / 10}%`;

function slicesFor(sectors: Part[], sleeves: Part[]): Slice[] {
  const sorted = [...sectors].sort((a, b) => b.weight - a.weight);
  const named = sorted.length > MAX_COLOURS ? sorted.slice(0, MAX_COLOURS - 1) : sorted;
  const rest = sorted.slice(named.length);
  const slices: Slice[] = named.map((s, i) => ({ key: s.name, name: s.name, weight: s.weight, color: `var(--pie-${i + 1})` }));
  if (rest.length) {
    slices.push({ key: "other", name: `Other (${rest.length} industries)`, weight: rest.reduce((a, s) => a + s.weight, 0), color: "var(--pie-other)", detail: rest.map((s) => `${s.name} ${pct(s.weight)}`).join(" · ") });
  }
  // Hybrid and multi asset baskets keep part of the money outside shares: it gets its own slice, so the sectors
  // are never drawn as if they were the whole basket. (Rounded weights can miss 100 by a fraction: ignored.)
  const gap = 100 - sectors.reduce((a, s) => a + s.weight, 0);
  if (gap > 1) {
    const outside = sleeves.filter((s) => s.name !== "Equity");
    slices.push({
      key: "outside",
      name: outside.length ? `${outside.map((s) => s.name).join(" and ")} (not shares)` : "Not in shares",
      weight: outside.reduce((a, s) => a + s.weight, 0) || gap,
      color: "var(--pie-outside)",
      detail: outside.length > 1 ? outside.map((s) => `${s.name} ${pct(s.weight)}`).join(" · ") : undefined,
    });
  }
  // The circle joins the last slice to the first. The seventh colour is too close to the first, so it is swapped.
  const last = slices[slices.length - 1];
  if (last?.color === "var(--pie-7)") last.color = "var(--pie-8)";
  return slices;
}

/** A ring segment between two fractions of a turn, starting at 12 o'clock. */
function arc(from: number, to: number, outer: number, inner: number) {
  const at = (f: number, r: number) => `${(r * Math.sin(2 * Math.PI * f)).toFixed(3)} ${(-r * Math.cos(2 * Math.PI * f)).toFixed(3)}`;
  const big = to - from > 0.5 ? 1 : 0;
  return `M${at(from, outer)}A${outer} ${outer} 0 ${big} 1 ${at(to, outer)}L${at(to, inner)}A${inner} ${inner} 0 ${big} 0 ${at(from, inner)}Z`;
}

/** Where the money sits by industry: a ring chart with every value listed beside it. */
export default function SectorPie({ sectors, sleeves }: { sectors: Part[]; sleeves: Part[] }) {
  const slices = slicesFor(sectors, sleeves);
  const total = slices.reduce((a, s) => a + s.weight, 0);
  const [hover, setHover] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = slices.find((s) => s.key === (hover ?? pinned));

  // Pointing at a slice or its row highlights both; a tap or click keeps it highlighted.
  const handlers = (key: string) => ({
    onPointerEnter: (e: React.PointerEvent) => { if (e.pointerType === "mouse") setHover(key); },
    onPointerLeave: () => setHover(null),
    onClick: () => setPinned((p) => (p === key ? null : key)),
  });

  const ends = slices.map((_, i) => slices.slice(0, i + 1).reduce((a, s) => a + s.weight, 0) / total);

  return (
    <div className="card grid items-center gap-6 p-5 md:grid-cols-[minmax(0,17rem)_1fr] md:gap-10 md:p-8">
      <div className="relative mx-auto aspect-square w-full max-w-[17rem]">
        <svg viewBox="-110 -110 220 220" className="h-full w-full overflow-visible" role="img" aria-label={`Pie chart by industry: ${slices.map((s) => `${s.name} ${pct(s.weight)}`).join(", ")}`}>
          {slices.map((s, i) => {
            const on = active?.key === s.key;
            const common = { className: "cursor-pointer transition-all duration-300", style: { opacity: active && !on ? 0.35 : 1 }, ...handlers(s.key) };
            // One slice is a whole ring, which a single arc cannot draw.
            return slices.length === 1
              ? <circle key={s.key} r={81} fill="none" stroke={s.color} strokeWidth={38} {...common} />
              : <path key={s.key} d={arc(i ? ends[i - 1] : 0, ends[i], on ? 106 : 100, 62)} fill={s.color} stroke="var(--page-2)" strokeWidth={2} strokeLinejoin="round" {...common} />;
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-content-center px-[26%] text-center" aria-hidden>
          <span className="text-3xl font-extrabold leading-none">{active ? pct(active.weight) : sectors.length}</span>
          <span className="mt-1.5 text-xs leading-tight text-pmuted">{active ? active.name : sectors.length === 1 ? "industry" : "industries"}</span>
        </div>
      </div>

      <ul className="min-w-0">
        {slices.map((s) => (
          <li key={s.key} className="border-b border-pline last:border-0">
            <button
              type="button" aria-pressed={pinned === s.key} {...handlers(s.key)} onFocus={() => setHover(s.key)} onBlur={() => setHover(null)}
              className={`flex w-full cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 text-left text-sm transition-colors ${active?.key === s.key ? "bg-page3" : ""}`}
            >
              <span aria-hidden className="mt-1 h-3 w-3 shrink-0 rounded-[4px]" style={{ background: s.color }} />
              <span className="min-w-0 flex-1">
                {s.name}
                {s.detail && <span className="mt-0.5 block text-xs text-pmuted">{s.detail}</span>}
              </span>
              <b className="num">{pct(s.weight)}</b>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
