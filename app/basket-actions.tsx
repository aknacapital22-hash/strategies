"use server";

import type { ReactNode } from "react";
import { BannerView, BarView, HeroView } from "@/components/BasketCta";
import HoldingsGate from "@/components/HoldingsGate";
import { getBasket } from "@/lib/auth/basket";
import { strategies } from "@/lib/strategies";

export type BasketViews = { hero: ReactNode; bar: ReactNode; banner: ReactNode; holdings: ReactNode };

/** The signed-in person's parts of one basket page. The session is checked here, on the server, like on any page. */
export async function loadBasketViews(slug: string): Promise<BasketViews | null> {
  const s = strategies.find((x) => x.slug === slug);
  if (!s) return null;
  const viewer = await getBasket(s.slug); // looked up once: each lookup is a call to the backend and the database
  const { state } = viewer;
  return {
    hero: <HeroView slug={s.slug} state={state} />,
    bar: <BarView slug={s.slug} state={state} />,
    banner: <BannerView slug={s.slug} name={s.name} state={state} />,
    holdings: <HoldingsGate slug={s.slug} returnTo={`/strategies/${s.slug}#holdings`} viewer={viewer} />,
  };
}
