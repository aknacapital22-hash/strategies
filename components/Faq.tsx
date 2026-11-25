export default function Faq({ items }: { items: [string, string][] }) {
  return (
    <div className="divide-y divide-[var(--page-line)] border-y border-pline">
      {items.map(([q, a]) => (
        <details key={q} className="group py-5">
          <summary className="flex items-center justify-between gap-6 text-lg font-semibold">
            {q}
            <span className="plus grid h-8 w-8 shrink-0 place-items-center rounded-full border border-pline text-xl font-normal text-pmuted transition-transform" aria-hidden>+</span>
          </summary>
          <p className="mt-3 max-w-2xl leading-relaxed text-pmuted">{a}</p>
        </details>
      ))}
    </div>
  );
}
