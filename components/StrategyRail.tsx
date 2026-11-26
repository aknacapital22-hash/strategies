"use client";

import { useMemo, useState } from "react";
import BasketCard, { type CardData } from "./BasketCard";
import { kindWord } from "@/lib/plain";

/** Filter buttons over a swipeable row of basket cards. */
export default function StrategyRail({ cards }: { cards: CardData[] }) {
  const kinds = useMemo(() => ["All", ...new Set(cards.map((c) => kindWord(c.kind)))], [cards]);
  const [kind, setKind] = useState("All");
  const shown = cards.filter((c) => kind === "All" || kindWord(c.kind) === kind).slice(0, 8);

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Show baskets that hold">
        {kinds.map((k) => (
          <button key={k} className="chip !min-h-8" aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>
        ))}
      </div>
      <div className="snap-row mt-4">
        {shown.map((s) => <BasketCard key={s.slug} s={s} />)}
      </div>
    </div>
  );
}
