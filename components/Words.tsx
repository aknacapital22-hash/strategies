import { WORDS } from "@/lib/plain";

/** Money words explained in one place. Closed until someone wants it. */
export default function Words({ className = "" }: { className?: string }) {
  return (
    <details id="words" className={`card p-5 ${className}`}>
      <summary className="flex items-center justify-between gap-4 font-bold">
        Money words, explained simply
        <span className="plus text-2xl font-normal text-pmuted transition-transform" aria-hidden>+</span>
      </summary>
      <dl className="mt-4 grid gap-3 md:grid-cols-2">
        {WORDS.map(([w, d]) => (
          <div key={w} className="rounded-xl bg-page3 p-4">
            <dt className="text-sm font-bold">{w}</dt>
            <dd className="mt-1 text-sm leading-snug text-pmuted">{d}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
