"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const questions = [
  { q: "How long can you stay invested?", a: ["Under 3 years", "3 to 7 years", "7+ years"] },
  { q: "A 25% fall in a year would make you…", a: ["Sell", "Worry but hold", "Buy more"] },
  { q: "What do you want most?", a: ["Smoother ride", "Balanced growth", "Maximum growth"] },
];

const HYBRID = { name: "Largecap Hybrid", slug: "largecap-hybrid", why: "Built for a smoother ride, with growth that does not keep you up at night." };
const MULTI = { name: "Allcap Multi Asset", slug: "allcap-multi-asset", why: "Built to keep compounding even when one market stumbles." };
const FOCUSED = { name: "Focused Largecap 15", slug: "focused-largecap-15", why: "A sharper take on India's biggest names, for people who want more than the index." };
const ALLCAP = { name: "Allcap", slug: "allcap", why: "Our flagship, built for long horizons and the biggest upside. Expect bigger swings along the way." };

// What you want is capped by what you can bear: a short horizon or selling in a fall limits the risk on offer,
// however much growth you ask for. answers = [horizon, reaction to a fall, goal], each 0 (low) to 2 (high).
function pick([horizon, fall, goal]: number[]) {
  const capacity = Math.min(horizon, fall);
  let res = HYBRID;
  if (capacity > 0 && goal > 0) {
    if (goal === 2 && capacity === 2) res = ALLCAP;
    else if (goal === 1 && capacity === 2) res = FOCUSED;
    else res = MULTI;
  }
  const note =
    goal > capacity
      ? horizon <= fall
        ? "Your horizon is under 3 years, so a lower-risk strategy is suggested even though you want more growth. Equity strategies can stay below their peak for over a year."
        : "You said a 25% fall would make you sell, so a lower-risk strategy is suggested. Selling in a fall locks in the loss."
      : null;
  return { ...res, note };
}

export default function IndexFinder() {
  const [answers, setAnswers] = useState<number[]>([]);
  const i = answers.length;
  const done = i >= questions.length;
  const res = done ? pick(answers) : null;
  const head = useRef<HTMLHeadingElement>(null);
  // Answering replaces the focused button, so move focus to the new question or result for keyboard and screen reader users.
  useEffect(() => { if (answers.length > 0) head.current?.focus(); }, [answers.length]);

  return (
    <div className="card mx-auto max-w-xl p-6 md:p-10">
      <div className="mb-6 flex gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={Math.min(i, questions.length)} aria-label="Progress">
        {questions.map((_, n) => (
          <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${n < i ? "bg-aink" : "bg-page3"}`} />
        ))}
      </div>
      {res ? (
        <div aria-live="polite">
          <p className="eyebrow">A starting point, not advice</p>
          <h2 ref={head} tabIndex={-1} className="mt-3 text-3xl font-bold outline-none">{res.name}</h2>
          <p className="mt-3 text-pmuted">{res.why}</p>
          {res.note && <p className="mt-3 rounded-xl bg-page3 p-4 text-sm" role="note">{res.note}</p>}
          <p className="mt-4 text-xs text-pmuted">Based on your three answers. Every strategy has a page with its track record and its worst falls: read both before you decide.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`/strategies/${res.slug}`} className="btn btn-primary">Explore {res.name} →</Link>
            <button onClick={() => setAnswers([])} className="btn btn-ghost">Start over</button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs font-medium text-pmuted">Question {i + 1} of {questions.length}</p>
          <h2 ref={head} tabIndex={-1} className="mt-2 text-2xl font-semibold outline-none">{questions[i].q}</h2>
          <div className="mt-6 grid gap-3">
            {questions[i].a.map((a, idx) => (
              <button
                key={a}
                onClick={() => setAnswers([...answers, idx])}
                className="group flex min-h-[52px] items-center justify-between rounded-xl border border-pline bg-page px-4 py-3 text-left font-medium transition hover:border-[var(--accent-ink)] hover:bg-page3"
              >
                {a}
                <span aria-hidden className="text-pmuted transition-transform group-hover:translate-x-1">→</span>
              </button>
            ))}
          </div>
          {i > 0 && (
            <button onClick={() => setAnswers(answers.slice(0, -1))} className="mt-5 text-sm text-pmuted hover:text-ptext">← Back</button>
          )}
        </div>
      )}
    </div>
  );
}
