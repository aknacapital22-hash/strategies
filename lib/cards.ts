// Server side: turns a strategy into the few fields a basket card shows.
import type { CardData } from "@/components/BasketCard";
import type { Strategy } from "./strategies";
import { sparkPath } from "./growth";
import { aboutBasket } from "./plain";

export const cardData = (s: Strategy): CardData => ({
  slug: s.slug, name: s.name, kind: s.kind, risk: s.risk, about: aboutBasket(s.slug), minimum: s.minimum, spark: sparkPath(s.monthly),
  value: s.growth!.model, start: s.growth!.start, end: s.growth!.end, bmName: s.benchmark.name, bmValue: s.benchmark.growth,
});
