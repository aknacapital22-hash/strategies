"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { isPlan, type PlanId } from "@/lib/pricing";
import { burnPasswordCheck, consumeReset, createRequest, createReset, createUser, findByEmail, setRequestUtr, setSubscription, verifyPassword } from "@/lib/auth/store";
import { EMAIL_RE, endSession, getUser, normalizePhone, passwordProblem, safeNext, startSession } from "@/lib/auth/session";

export type FormState = { error?: string; ok?: string } | undefined;

const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string) : "");

// Slows password guessing. Failures are counted per email AND per visitor address (5 for one email from one address,
// 100 from one address across all emails, per 10 minutes), so one person guessing cannot lock the real owner out from
// somewhere else. In memory, so it resets when the server restarts.
const fails = new Map<string, { n: number; t: number }>();
const WINDOW = 10 * 60 * 1000;
const PER_EMAIL = 5;
const PER_VISITOR = 100;

function minutesLeft(key: string, max: number) {
  const f = fails.get(key);
  if (!f || Date.now() - f.t >= WINDOW || f.n < max) return 0;
  return Math.max(1, Math.ceil((WINDOW - (Date.now() - f.t)) / 60000));
}
function noteFail(key: string) {
  const f = fails.get(key);
  fails.set(key, f && Date.now() - f.t < WINDOW ? { n: f.n + 1, t: f.t } : { n: 1, t: Date.now() });
  if (fails.size > 5000) for (const [k, v] of fails) if (Date.now() - v.t >= WINDOW) fails.delete(k);
}
async function visitor() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local").slice(0, 45);
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").trim().toLowerCase();
  const password = str(fd, "password");
  if (!EMAIL_RE.test(email) || !password) return { error: "Enter your email and password." };
  const ip = await visitor();
  const byEmail = `${ip}|${email}`, byVisitor = `ip:${ip}`;
  const wait = Math.max(minutesLeft(byEmail, PER_EMAIL), minutesLeft(byVisitor, PER_VISITOR));
  if (wait) return { error: `Too many attempts. Try again in ${wait} minute${wait > 1 ? "s" : ""}, or reset your password.` };
  const u = findByEmail(email);
  if (!u) burnPasswordCheck(password);
  if (!u || !verifyPassword(u, password)) {
    noteFail(byEmail);
    noteFail(byVisitor);
    return { error: "Email or password is incorrect." };
  }
  fails.delete(byEmail);
  await startSession(u.id);
  redirect(safeNext(str(fd, "next")) ?? "/account");
}

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const name = str(fd, "name").trim();
  const email = str(fd, "email").trim().toLowerCase();
  const password = str(fd, "password");
  if (name.length < 2 || name.length > 60) return { error: "Enter your name (2 to 60 characters)." };
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  const phone = normalizePhone(str(fd, "phone"));
  if (!phone) return { error: "Enter a valid 10-digit Indian mobile number (it starts with 6, 7, 8 or 9)." };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  if (password !== str(fd, "confirm")) return { error: "The two passwords do not match." };
  const made = createUser(name, email, password, phone);
  if ("error" in made) return { error: made.error === "email" ? "An account with this email already exists. Try logging in." : "An account with this mobile number already exists. Try logging in." };
  await startSession(made.user.id);
  redirect(safeNext(str(fd, "next")) ?? "/account");
}

export async function logout() {
  await endSession();
  redirect("/");
}

export async function forgotPassword(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  createReset(email); // same reply whether or not the account exists, so the form cannot be used to probe emails
  return { ok: "If an account exists for that email, a reset link has been sent. It works for 30 minutes." };
}

export async function resetPassword(_: FormState, fd: FormData): Promise<FormState> {
  const token = str(fd, "token");
  const password = str(fd, "password");
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  if (password !== str(fd, "confirm")) return { error: "The two passwords do not match." };
  if (!consumeReset(token, password)) return { error: "This reset link is invalid or has expired. Request a new one." };
  redirect("/login?reset=1");
}

/** Starts a subscription request. Nothing is switched on here: an admin approves it after the UPI payment is checked. */
export async function requestSubscription(fd: FormData) {
  const user = await getUser();
  const slug = str(fd, "slug");
  const plan: PlanId = isPlan(str(fd, "plan")) ? (str(fd, "plan") as PlanId) : "year";
  if (!user) redirect(`/login?next=${encodeURIComponent(`/subscribe/${slug}`)}`);
  const r = createRequest(user.id, slug, plan);
  if (!r) redirect("/strategies");
  revalidatePath("/account");
  redirect(`/subscribe/${slug}/pay?r=${r.id}`);
}

/** The user adds the UPI transaction reference of their payment. */
export async function addUtr(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please log in again." };
  const utr = str(fd, "utr").trim();
  const saved = setRequestUtr(str(fd, "id"), user.id, utr);
  if (saved === "used") return { error: "This transaction ID is already attached to another request. Check it, or WhatsApp us." };
  if (saved !== "ok") return { error: "Enter the transaction ID from your UPI app (6 to 30 letters and numbers)." };
  revalidatePath("/admin");
  return { ok: "Saved. This helps us match your payment faster." };
}

/** Cancels a subscription straight away (no refund). */
export async function unsubscribe(fd: FormData) {
  const user = await getUser();
  const slug = str(fd, "slug");
  const next = safeNext(str(fd, "next")) ?? "/account";
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  setSubscription(user.id, slug, false);
  revalidatePath("/", "layout");
  redirect(next);
}
