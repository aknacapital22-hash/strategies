"use client";

// The parts of a basket page that depend on who is looking. The page itself is static: visitors get what is built
// into it and cost no server call. For someone signed in, one server action returns all their parts at once.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { loadBasketViews, type BasketViews } from "@/app/basket-actions";
import { useViewerHint } from "./useViewerHint";

type State = { signedIn: boolean; views: BasketViews | null; failed: boolean };

const Context = createContext<State>({ signedIn: false, views: null, failed: false });

export function BasketProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const key = useViewerHint()?.key;
  const want = key ? `${key}|${slug}` : "";
  const [got, setGot] = useState<{ for: string; views: BasketViews | null } | null>(null);

  // Runs again when a kept page is shown again, so a plan that changed meanwhile is picked up.
  useEffect(() => {
    if (!want) return;
    let live = true;
    loadBasketViews(slug).then(
      (views) => { if (live) setGot({ for: want, views }); },
      () => { if (live) setGot({ for: want, views: null }); },
    );
    return () => { live = false; };
  }, [want, slug]);

  const mine = got?.for === want ? got : null; // never show what was loaded for an earlier log-in
  return <Context value={{ signedIn: !!want, views: mine?.views ?? null, failed: !!mine && !mine.views }}>{children}</Context>;
}

export function BasketSlot({ name, anon, pending }: { name: keyof BasketViews; anon: ReactNode; pending: ReactNode }) {
  const { signedIn, views, failed } = useContext(Context);
  if (!signedIn) return <div className="anon-only contents">{anon}</div>;
  if (views) return views[name];
  if (failed && name === "holdings") return <p className="card p-6 text-pmuted" role="alert">We could not load your plan. Please reload the page.</p>;
  return pending;
}
