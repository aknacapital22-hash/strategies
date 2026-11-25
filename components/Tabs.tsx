"use client";

import { useId, useRef, useState, type ReactNode } from "react";

export type TabItem = { id: string; label: string; content: ReactNode };

/** Accessible segmented tabs (arrow keys, Home/End). Every panel is server-rendered; inactive ones are just hidden. */
export default function Tabs({ tabs, initial = 0 }: { tabs: TabItem[]; initial?: number }) {
  const [active, setActive] = useState(initial);
  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const go = (i: number) => {
    const n = (i + tabs.length) % tabs.length;
    setActive(n);
    refs.current[n]?.focus();
  };

  return (
    <div>
      <div className="mx-auto w-full max-w-full overflow-x-auto pb-1 [scrollbar-width:none]">
        <div
          role="tablist"
          aria-label="Explore"
          className="mx-auto flex w-max gap-1 rounded-xl border border-pline bg-page2 p-1 shadow-[var(--shadow)]"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); go(active + 1); }
            else if (e.key === "ArrowLeft") { e.preventDefault(); go(active - 1); }
            else if (e.key === "Home") { e.preventDefault(); go(0); }
            else if (e.key === "End") { e.preventDefault(); go(tabs.length - 1); }
          }}
        >
          {tabs.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => { refs.current[i] = el; }}
              role="tab"
              id={`${uid}-t-${t.id}`}
              aria-selected={active === i}
              aria-controls={`${uid}-p-${t.id}`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${active === i ? "bg-[#0f766e] text-white shadow-sm" : "text-pmuted hover:text-ptext"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`${uid}-p-${t.id}`} aria-labelledby={`${uid}-t-${t.id}`} hidden={active !== i} className="pt-8 [animation:fadeUp_.35s_ease-out]" tabIndex={0}>
          {t.content}
        </div>
      ))}
    </div>
  );
}
