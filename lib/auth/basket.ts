// Loads the signed-in person's standing with a basket. Server only. Call inside a <Suspense> boundary.
import { cache } from "react";
import { basketState, type BasketState } from "../subscription";
import { getUser, type PublicUser } from "./session";
import { requestsFor } from "./store";

/** The user and their waiting requests, read once per page however many buttons ask. */
export const getViewer = cache(async () => {
  const user = await getUser();
  const pending = user ? (await requestsFor(user.id)).filter((r) => r.status === "pending") : [];
  return { user, pending };
});

export async function getBasket(slug: string): Promise<{ user: PublicUser | null; state: BasketState }> {
  const { user, pending } = await getViewer();
  return { user, state: basketState(user, slug, pending) };
}
