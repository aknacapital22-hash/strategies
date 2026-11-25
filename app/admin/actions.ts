"use server";

import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { decideRequest, setSubscription } from "@/lib/auth/store";
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

export async function revokeSubscription(fd: FormData) {
  await admin();
  await setSubscription(str(fd, "userId"), str(fd, "slug"), false);
  revalidatePath("/", "layout");
}
