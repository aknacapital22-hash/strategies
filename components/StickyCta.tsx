"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** One clear next step, offered only after the hero has scrolled away. Dismissible, no timers or fake urgency. */
export default function StickyCta() {
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const on = () => setShow(window.scrollY > 640);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  if (closed || !show) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-pline bg-page2/95 p-3 pl-4 shadow-[var(--shadow-hover)] backdrop-blur [animation:fadeUp_.3s_ease-out]" role="region" aria-label="Find your strategy">
      <p className="flex-1 text-sm font-semibold leading-tight">Not sure where to start? <span className="font-normal text-pmuted">Three questions, under a minute.</span></p>
      <Link href="/start" className="btn btn-primary whitespace-nowrap !px-4 !py-2">Find mine →</Link>
      <button onClick={() => setClosed(true)} aria-label="Dismiss" className="grid h-8 w-8 place-items-center rounded-full text-pmuted hover:bg-page3">✕</button>
    </div>
  );
}
