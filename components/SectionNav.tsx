"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Sticky in-page tabs that highlight the section being read, with the basket's next step always in reach. */
export default function SectionNav({ items, action }: { items: [string, string][]; action: ReactNode }) {
  const [active, setActive] = useState(items[0][0]);
  useEffect(() => {
    const els = items.map(([id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (seen) setActive(seen.target.id);
      },
      { rootMargin: "-130px 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Sections" className="sticky top-[68px] z-30 mt-10 border-y border-pline bg-page/85 backdrop-blur-xl">
      <div className="wrap flex items-center gap-2 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
        {items.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? "true" : undefined}
            className={`whitespace-nowrap rounded-full px-2.5 py-2 text-sm sm:px-4 font-medium transition-colors ${active === id ? "bg-ptext text-page" : "text-pmuted hover:bg-page3 hover:text-ptext"}`}
          >
            {label}
          </a>
        ))}
        </div>
        <div className="shrink-0">{action}</div>
      </div>
    </nav>
  );
}
