"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="wrap py-20 text-center md:py-28" role="alert">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="h1 mt-4">This page did not load</h1>
      <p className="lead mx-auto mt-4 max-w-md">It was probably a brief glitch. Try again, or head back to the home page.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" className="btn btn-primary" onClick={() => retry()}>Try again</button>
        <Link href="/" className="btn btn-ghost">Go to home</Link>
      </div>
    </div>
  );
}
