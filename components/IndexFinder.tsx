"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CardData } from "./BasketCard";
import { QUIZ } from "@/lib/quiz";
import { PAST_NOTE, duration, lakh, riskWord } from "@/lib/plain";

const questions = [
  { q: "How long can you leave the money invested?", a: ["Under 3 years", "3 to 7 years", "7+ years"] },
  { q: "If ₹1 lakh dropped to ₹75,000 in a year, you would…", a: ["Sell", "Worry but hold", "Buy more"] },
  { q: "What do you want most?", a: ["Smoother ride", "Balanced growth", "Maximum growth"] },
];

// What you want is capped by what you can bear: a short horizon or selling in a fall limits the risk on offer,
// however much growth you ask for. answers = [horizon, reaction to a fall, goal], each 0 (low) to 2 (high).
function pick([horizon, fall, goal]: number[]) {
  const capacity = Math.min(horizon, fall);
  // Money needed soon, or a person who would sell in a fall: say so, and do not push a purchase.
  if (capacity === 0) {
    return {
      wait: horizon === 0
        ? "You may need this money within 3 years. Share prices can stay down for more than a year, so it may be safer to keep this money out of shares."
        : "You said a big drop would make you sell. Selling after a drop makes the loss permanent, so shares may not suit this money right now.",
    };
  }
  let res = QUIZ.hybrid;
  if (goal > 0) {
    if (goal === 2 && capacity === 2) res = QUIZ.allcap;
    else if (goal === 1 && capacity === 2) res = QUIZ.focused;
    else res = QUIZ.multi;
  }
  const note = goal > capacity ? "You asked for more growth. From your other answers, we suggest a calmer basket to look at first." : null;
  return { ...res, note };
}

export default function IndexFinder({ baskets }: { baskets: CardData[] }) {
  const [answers, setAnswers] = useState<number[]>([]);
  const i = answers.length;
  const done = i >= questions.length;
  const res = done ? pick(answers) : null;
  const found = res && "slug" in res ? baskets.find((b) => b.slug === res.slug) : undefined;
  const head = useRef<HTMLHeadingElement>(null);
  // Answering replaces the focused button, so move focus to the new question or result for keyboard and screen reader users.
  useEffect(() => { if (answers.length > 0) head.current?.focus({ preventScroll: true }); }, [answers.length]);

  return (
    <div className="card mx-auto max-w-xl p-6 md:p-8" data-quiz>
      <div className="mb-6 flex gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={Math.min(i, questions.length)} aria-label="Progress">
        {questions.map((_, n) => (
          <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${n < i ? "bg-aink" : "bg-page3"}`} />
        ))}
      </div>
      {res && "wait" in res ? (
        <div aria-live="polite" data-quiz-result="wait">
          <p className="eyebrow">An honest answer</p>
          <h3 ref={head} tabIndex={-1} className="mt-3 text-2xl font-bold outline-none">Shares may not be right for this money yet</h3>
          <p className="mt-3 text-pmuted">{res.wait}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/learn" className="btn btn-primary">Learn the basics first →</Link>
            <button onClick={() => setAnswers([])} className="btn btn-ghost">Start over</button>
          </div>
        </div>
      ) : res && found ? (
        <div aria-live="polite" data-quiz-result={found.slug}>
          <p className="eyebrow">🎯 Your match to look at (not advice)</p>
          <h3 ref={head} tabIndex={-1} className="mt-3 text-3xl font-bold outline-none">{found.name}</h3>
          <p className="mt-2 text-pmuted">{res.why}</p>
          <div className="mt-4 rounded-2xl bg-[var(--gain-ink)]/10 p-4">
            <p className="text-sm text-pmuted">₹1 lakh would have become</p>
            <p className="num up mt-1 text-4xl font-extrabold">{lakh(found.value)}</p>
            <p className="num mt-1 text-sm text-pmuted">in {duration(found.start, found.end)}. The market ({found.bmName}) gave {lakh(found.bmValue)}.</p>
            <p className="num mt-2 text-sm font-semibold">Risk: {riskWord(found.risk)} · Start with just {found.minimum}</p>
          </div>
          {res.note && <p className="mt-3 rounded-xl bg-page3 p-3 text-sm" role="note">{res.note}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={`/strategies/${found.slug}#holdings`} className="btn btn-primary !px-6 !py-3">See what&apos;s inside →</Link>
            <Link href={`/strategies/${found.slug}`} className="btn btn-ghost !py-3">See every detail</Link>
          </div>
          <p className="mt-3 text-xs text-pmuted">{PAST_NOTE}</p>
          <button onClick={() => setAnswers([])} className="mt-3 text-sm text-pmuted hover:text-ptext">↺ Start over</button>
        </div>
      ) : (
        <div>
          <p className="text-xs font-medium text-pmuted">Question {i + 1} of {questions.length}</p>
          <h3 ref={head} tabIndex={-1} className="mt-2 text-2xl font-semibold outline-none">{questions[i].q}</h3>
          <div className="mt-5 grid gap-3">
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
