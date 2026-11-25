"use server";

import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { activatePlan, decideRequest, setSubscription } from "@/lib/auth/store";
import { isPlan } from "@/lib/pricing";
import { getAdmin } from "@/lib/auth/session";

const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string) : "");

// Every admin action re-checks the role on the server, so a hand-made request from a normal account does nothing.
async function admin() {
  const a = await getAdmin();
  if (!a) notFound();
  return a;
}

export async function approveRequest(fd: FormData) {
  const a = await admin();
  await decideRequest(str(fd, "id"), true, a.id);
  revalidatePath("/", "layout");
}

export async function rejectRequest(fd: FormData) {
  const a = await admin();
  await decideRequest(str(fd, "id"), false, a.id, str(fd, "note").trim() || undefined);
  revalidatePath("/", "layout");
}

/** Switches a plan on for someone who has not asked for it. The page then reports what happened. */
export async function activateSubscription(fd: FormData) {
  const a = await admin();
  const userId = str(fd, "userId");
  const slug = str(fd, "slug");
  const plan = str(fd, "plan");
  const result = isPlan(plan) ? await activatePlan(userId, slug, plan, a.id, str(fd, "amount").trim(), str(fd, "utr").trim() || undefined) : "invalid";
  revalidatePath("/", "layout");
  const next = new URLSearchParams({ tab: "others", result, user: userId, basket: slug });
  const q = str(fd, "q").slice(0, 60);
  if (q) next.set("q", q);
  redirect(`/admin?${next}`);
}

export async function revokeSubscription(fd: FormData) {
  await admin();
  await setSubscription(str(fd, "userId"), str(fd, "slug"), false);
  revalidatePath("/", "layout");
}
