// Emailed one-time codes (sign-up and forgotten password), and the limits on codes and log-in attempts.
// Everything is counted in the database, so the limits hold across restarts and across serverless instances.
//
// Each request for a code gets a random "ticket" that only the browser which asked keeps. A code works only together
// with its ticket, so somebody else starting a sign-up for your email address cannot swap their password into yours.
import crypto from "node:crypto";
import { query, transaction, uniqueViolation } from "../db";
import { callBackend, usesRemoteBackend } from "../backend";
import { mailConfigured, sendMail } from "../mail";
import { demoEnabled, hashPassword } from "./store";

const CODE_MINUTES = 10;
const MAX_WRONG = 5;
const DAILY_EMAILS = 250; // kept under the mail provider's daily allowance

type Purpose = "signup" | "reset";
export type SendProblem = "wait" | "limit";

const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
const newTicket = () => crypto.randomBytes(32).toString("hex");
const newCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
// A six digit code is short, so it is stored with a slow, salted hash.
const hashCode = (code: string, salt: string) => crypto.scryptSync(code, salt, 32).toString("hex");

// ---------------------------------------------------------------- counters

/** Counts one more event under this key, in a window that starts with the first one. */
async function hit(key: string, windowSeconds: number): Promise<{ n: number; secondsLeft: number }> {
  const [r] = await query<{ n: number; seconds_left: number }>(
    `insert into rate_limits (key, n, reset_at) values ($1, 1, now() + make_interval(secs => $2))
     on conflict (key) do update set
       n = case when rate_limits.reset_at <= now() then 1 else rate_limits.n + 1 end,
       reset_at = case when rate_limits.reset_at <= now() then excluded.reset_at else rate_limits.reset_at end
     returning n, ceil(extract(epoch from reset_at - now()))::int as seconds_left`,
    [sha(key), windowSeconds],
  );
  return { n: r.n, secondsLeft: r.seconds_left };
}

/** Whether another code may be emailed. Applied before looking up the account, so it reveals nothing about it. */
async function sendProblem(purpose: Purpose, email: string, visitor: string): Promise<SendProblem | null> {
  if ((await hit(`send:gap:${purpose}:${email}`, 60)).n > 1) return "wait";
  if ((await hit(`send:email:${email}`, 3600)).n > 5) return "limit";
  if ((await hit(`send:visitor:${visitor}`, 3600)).n > 20) return "limit";
  return null;
}

const underDailyLimit = async () => (await hit("send:day", 86400)).n <= DAILY_EMAILS;

/** Counts a log-in attempt before the password is checked. Returns the minutes to wait, or 0 to go ahead. */
export async function loginAttempt(email: string, visitor: string): Promise<number> {
  if (usesRemoteBackend()) return callBackend("loginAttempt", [email, visitor]);
  // 5 for one email from one address, 100 from one address, and 30 for one email from everywhere, per 10 minutes.
  const counts = [
    [await hit(`login:pair:${visitor}|${email}`, 600), 5],
    [await hit(`login:visitor:${visitor}`, 600), 100],
    [await hit(`login:email:${email}`, 600), 30],
  ] as const;
  return Math.max(0, ...counts.map(([c, max]) => (c.n > max ? Math.max(1, Math.ceil(c.secondsLeft / 60)) : 0)));
}

/** A correct password clears the count for that email. */
export async function loginSucceeded(email: string, visitor: string): Promise<void> {
  if (usesRemoteBackend()) return callBackend("loginSucceeded", [email, visitor]);
  await query("delete from rate_limits where key = any($1)", [[sha(`login:pair:${visitor}|${email}`), sha(`login:email:${email}`)]]);
}

// ---------------------------------------------------------------- codes

/** Emails the code. While developing without a mail key, it goes to the demo inbox instead. */
async function deliver(purpose: Purpose, email: string, code: string): Promise<boolean> {
  const what = purpose === "signup" ? "finish creating your account" : "reset your password";
  const subject = `${code} is your 15Stocks code`;
  if (mailConfigured()) {
    if (!(await underDailyLimit())) return false;
    return sendMail(email, subject, `Your code to ${what} is ${code}.\n\nIt works for ${CODE_MINUTES} minutes. Never share it with anyone: we will never ask you for it.\n\nIf you did not ask for this, you can ignore this email.`);
  }
  if (!demoEnabled()) {
    console.error("mail: BREVO_API_KEY and MAIL_FROM are not set, so no code can be sent.");
    return false;
  }
  await query("insert into demo_inbox (recipient, subject, link) values ($1, $2, $3)", [email, subject, purpose === "signup" ? "/signup" : "/forgot-password"]);
  await query("delete from demo_inbox where id not in (select id from demo_inbox order by id desc limit 10)");
  return true;
}

async function saveCode(ticket: string, purpose: Purpose, email: string, data: object): Promise<string> {
  const code = newCode(), salt = crypto.randomBytes(16).toString("hex");
  await query("delete from email_codes where expires <= now()");
  await query("delete from rate_limits where reset_at <= now()");
  await query(
    `insert into email_codes (ticket_hash, purpose, email, salt, code_hash, data, expires)
     values ($1, $2, $3, $4, $5, $6, now() + make_interval(mins => $7))`,
    [sha(ticket), purpose, email, salt, hashCode(code, salt), JSON.stringify(data), CODE_MINUTES],
  );
  return code;
}

type CodeRow = { email: string; salt: string; code_hash: string; data: Record<string, string> };

/** The pending row, if the code is right. Every call uses up one of the tries, counted before comparing. */
async function checkCode(ticket: string, purpose: Purpose, code: string): Promise<CodeRow | null> {
  const [r] = await query<CodeRow>(
    `update email_codes set attempts = attempts + 1
     where ticket_hash = $1 and purpose = $2 and expires > now() and attempts < $3
     returning email, salt, code_hash, data`,
    [sha(ticket), purpose, MAX_WRONG],
  );
  if (!r || !/^\d{6}$/.test(code)) return null;
  return crypto.timingSafeEqual(Buffer.from(hashCode(code, r.salt), "hex"), Buffer.from(r.code_hash, "hex")) ? r : null;
}

// ---------------------------------------------------------------- sign-up

export type SignupStart = { ticket: string } | { error: "email" | "phone" | "mail" | SendProblem };

/** Keeps the details aside and emails a code. No account exists until the code is entered. */
export async function startSignup(name: string, email: string, password: string, phone: string, visitor: string): Promise<SignupStart> {
  if (usesRemoteBackend()) return callBackend("startSignup", [name, email, password, phone, visitor]);
  email = email.trim().toLowerCase();
  const taken = await query<{ email: string }>("select email from users where email = $1 or phone = $2", [email, phone]);
  if (taken.length) return { error: taken.some((u) => u.email === email) ? "email" : "phone" };
  const problem = await sendProblem("signup", email, visitor);
  if (problem) return { error: problem };
  const ticket = newTicket();
  const code = await saveCode(ticket, "signup", email, { name: name.trim(), phone, ...hashPassword(password) });
  if (!(await deliver("signup", email, code))) return { error: "mail" };
  return { ticket };
}

/** Replaces the code of a pending sign-up with a new one. */
export async function resendSignupCode(ticket: string, visitor: string): Promise<"sent" | "expired" | "mail" | SendProblem> {
  if (usesRemoteBackend()) return callBackend("resendSignupCode", [ticket, visitor]);
  const [r] = await query<{ email: string }>("select email from email_codes where ticket_hash = $1 and purpose = 'signup' and expires > now()", [sha(ticket)]);
  if (!r) return "expired";
  const problem = await sendProblem("signup", r.email, visitor);
  if (problem) return problem;
  const code = newCode(), salt = crypto.randomBytes(16).toString("hex");
  await query(
    "update email_codes set salt = $2, code_hash = $3, attempts = 0, expires = now() + make_interval(mins => $4) where ticket_hash = $1",
    [sha(ticket), salt, hashCode(code, salt), CODE_MINUTES],
  );
  return (await deliver("signup", r.email, code)) ? "sent" : "mail";
}

export async function verifySignup(ticket: string, code: string): Promise<{ userId: string } | { error: "code" | "email" | "phone" }> {
  if (usesRemoteBackend()) return callBackend("verifySignup", [ticket, code]);
  const r = await checkCode(ticket, "signup", code);
  if (!r) return { error: "code" };
  // deleting the row is what makes the code single use, even if it is submitted twice at the same moment
  const used = await query("delete from email_codes where ticket_hash = $1 returning email", [sha(ticket)]);
  if (!used.length) return { error: "code" };
  const id = crypto.randomUUID();
  try {
    await query("insert into users (id, name, email, phone, salt, hash) values ($1, $2, $3, $4, $5, $6)", [id, r.data.name, r.email, r.data.phone, r.data.salt, r.data.hash]);
  } catch (e) {
    const rule = uniqueViolation(e); // the database enforces uniqueness, so two sign-ups at once cannot both win
    if (rule === "users_email_key") return { error: "email" };
    if (rule === "users_phone_key") return { error: "phone" };
    throw e;
  }
  return { userId: id };
}

// ---------------------------------------------------------------- forgotten password

/** Always hands back a ticket, so the reply is the same whether or not the account exists. */
export async function startReset(email: string, visitor: string): Promise<{ ticket: string } | { error: SendProblem }> {
  if (usesRemoteBackend()) return callBackend("startReset", [email, visitor]);
  email = email.trim().toLowerCase();
  const problem = await sendProblem("reset", email, visitor);
  if (problem) return { error: problem };
  const ticket = newTicket();
  const [u] = await query<{ id: string }>("select id from users where email = $1", [email]);
  if (u) {
    const code = await saveCode(ticket, "reset", email, { userId: u.id });
    // Not awaited: waiting for the mail would make the reply measurably slower only for addresses that have an account.
    void deliver("reset", email, code).catch((e) => console.error("mail: reset code not sent:", e instanceof Error ? e.message : e));
  }
  return { ticket };
}

export async function completeReset(ticket: string, code: string, newPassword: string): Promise<boolean> {
  if (usesRemoteBackend()) return callBackend("completeReset", [ticket, code, newPassword]);
  const r = await checkCode(ticket, "reset", code);
  if (!r) return false;
  const { salt, hash } = hashPassword(newPassword);
  return transaction(async (c) => {
    const used = await c.query("delete from email_codes where ticket_hash = $1 returning email", [sha(ticket)]);
    if (!used.rowCount) return false;
    await c.query("update users set salt = $2, hash = $3 where id = $1", [r.data.userId, salt, hash]);
    await c.query("delete from email_codes where purpose = 'reset' and email = $1", [r.email]);
    return true;
  });
}
