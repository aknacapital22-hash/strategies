"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { isPlan, type PlanId } from "@/lib/pricing";
import { burnPasswordCheck, createRequest, findByEmail, setRequestUtr, setSubscription, verifyPassword } from "@/lib/auth/store";
import { completeReset, loginAttempt, loginSucceeded, resendSignupCode, startReset, startSignup, verifySignup, type SendProblem } from "@/lib/auth/otp";
import { usesRemoteBackend } from "@/lib/backend";
import { EMAIL_RE, endSession, getUser, normalizePhone, passwordProblem, safeNext, startSession } from "@/lib/auth/session";

/** `step` is set while we are waiting for the emailed code. */
export type FormState = { error?: string; ok?: string; step?: { ticket: string; email: string } } | undefined;

const str = (fd: FormData, k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string) : "");

async function visitor() {
  const h = await headers();
  // Netlify (the frontend, which calls a separate backend) sets its own header with the real visitor address.
  const netlify = usesRemoteBackend() ? h.get("x-nf-client-connection-ip") : null;
  return (netlify || h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "local").slice(0, 45);
}

const SEND_PROBLEMS: Record<SendProblem | "mail", string> = {
  wait: "A code was just requested. Wait a minute, then try again.",
  limit: "Too many codes have been requested. Try again in an hour.",
  mail: "We could not send the email just now. Please try again later.",
};
const TAKEN = {
  email: "An account with this email already exists. Try logging in.",
  phone: "An account with this mobile number already exists. Try logging in.",
};
const BAD_CODE = "That code is wrong or has expired. Check the latest email, or ask for a new code.";

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").trim().toLowerCase();
  const password = str(fd, "password");
  if (!EMAIL_RE.test(email) || !password) return { error: "Enter your email and password." };
  // Slows password guessing. Counted in the database, before the password is checked.
  const ip = await visitor();
  const wait = await loginAttempt(email, ip);
  if (wait) return { error: `Too many attempts. Try again in ${wait} minute${wait > 1 ? "s" : ""}, or reset your password.` };
  const u = await findByEmail(email);
  if (!u) burnPasswordCheck(password);
  if (!u || !verifyPassword(u, password)) return { error: "Email or password is incorrect." };
  await loginSucceeded(email, ip);
  await startSession(u.id);
  redirect(safeNext(str(fd, "next")) ?? "/account");
}

export async function signup(_: FormState, fd: FormData): Promise<FormState> {
  const intent = str(fd, "intent");
  if (intent === "restart") return undefined;
  if (intent === "verify" || intent === "resend") {
    const step = { ticket: str(fd, "ticket"), email: str(fd, "email") };
    if (intent === "resend") {
      const sent = await resendSignupCode(step.ticket, await visitor());
      if (sent === "sent") return { step, ok: "We have sent a new code. Earlier codes no longer work." };
      if (sent === "expired") return { error: "That sign-up has expired. Please fill in your details again." };
      return { step, error: SEND_PROBLEMS[sent] };
    }
    const made = await verifySignup(step.ticket, str(fd, "code").trim());
    if ("error" in made) return made.error === "code" ? { step, error: BAD_CODE } : { error: TAKEN[made.error] };
    await startSession(made.userId);
    redirect(safeNext(str(fd, "next")) ?? "/account");
  }
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
  const started = await startSignup(name, email, password, phone, await visitor());
  if ("error" in started) return { error: started.error === "email" || started.error === "phone" ? TAKEN[started.error] : SEND_PROBLEMS[started.error] };
  return { step: { ticket: started.ticket, email } };
}

export async function logout() {
  await endSession();
  redirect("/");
}

export async function forgotPassword(_: FormState, fd: FormData): Promise<FormState> {
  const intent = str(fd, "intent");
  if (intent === "restart") return undefined;
  if (intent === "verify") {
    const step = { ticket: str(fd, "ticket"), email: str(fd, "email") };
    const password = str(fd, "password");
    const problem = passwordProblem(password);
    if (problem) return { step, error: problem };
    if (password !== str(fd, "confirm")) return { step, error: "The two passwords do not match." };
    if (!(await completeReset(step.ticket, str(fd, "code").trim(), password))) return { step, error: BAD_CODE };
    redirect("/login?reset=1");
  }
  const email = str(fd, "email").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "Enter a valid email address." };
  const started = await startReset(email, await visitor());
  if ("error" in started) return { error: SEND_PROBLEMS[started.error] };
  return { step: { ticket: started.ticket, email } };
}

export async function requestSubscription(fd: FormData) {
  const user = await getUser();
  const slug = str(fd, "slug");
  const plan: PlanId = isPlan(str(fd, "plan")) ? (str(fd, "plan") as PlanId) : "year";
  if (!user) redirect(`/login?next=${encodeURIComponent(`/subscribe/${slug}`)}`);
  const r = await createRequest(user.id, slug, plan);
  if (!r) redirect("/strategies");
  revalidatePath("/account");
  redirect(`/subscribe/${slug}/pay?r=${r.id}`);
}

/** The user adds the UPI transaction reference of their payment. */
export async function addUtr(_: FormState, fd: FormData): Promise<FormState> {
  const user = await getUser();
  if (!user) return { error: "Please log in again." };
  const utr = str(fd, "utr").trim();
  const saved = await setRequestUtr(str(fd, "id"), user.id, utr);
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
  await setSubscription(user.id, slug, false);
  revalidatePath("/", "layout");
  redirect(next);
}
