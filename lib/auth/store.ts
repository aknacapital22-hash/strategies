// Accounts, subscriptions and payment requests, stored in Neon Postgres (tables in lib/db/schema.sql).
// Passwords are scrypt-hashed with a per-user salt, never stored in clear.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import strategies from "../strategies.json";
import { PLANS, type PlanId } from "../pricing";
import { query, transaction, uniqueViolation } from "../db";
import { callBackend, usesRemoteBackend } from "../backend";

export type User = { id: string; name: string; email: string; salt: string; hash: string; subs: string[]; subExp?: Record<string, string>; role?: "admin" | "user"; phone?: string; created: string };
export type Mail = { to: string; subject: string; link: string; at: string };
export type ReqStatus = "pending" | "approved" | "rejected";
export type SubRequest = {
  id: string; userId: string; slug: string; plan: PlanId; amount: number; status: ReqStatus;
  utr?: string; note?: string; created: string; decidedAt?: string; decidedBy?: string;
};

export const SLUGS = new Set((strategies as { slug: string }[]).map((s) => s.slug));

/** Demo accounts (the login page shows them while the demo mode is on). Created by `npm run db:migrate -- --import`. */
export const DEMO = {
  admin: { name: "Admin", email: process.env.ADMIN_EMAIL ?? "admin@akna.test", password: process.env.ADMIN_PASSWORD ?? "Admin@12345" },
  subscriber: { name: "Demo Subscriber", email: "demo@akna.test", phone: "9000000001", password: "Demo@12345", subs: ["allcap", "focused-largecap-20", "dynamic-asset-allocator"] },
  free: { name: "Demo Free User", email: "free@akna.test", phone: "9000000002", password: "Free@12345", subs: [] as string[] },
};

/** Demo accounts and the demo inbox: on while developing, off in production unless DEMO_INBOX=1 (and off anywhere with DEMO_INBOX=0). */
export const demoEnabled = () => process.env.DEMO_INBOX === "1" || (process.env.DEMO_INBOX !== "0" && process.env.NODE_ENV !== "production");

const hashPw = (pw: string, salt: string) => crypto.scryptSync(pw, salt, 64).toString("hex");
const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
const iso = (d: Date | string) => new Date(d).toISOString();
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/** Session signing key: AUTH_SECRET, or a key kept in .data/secret for local runs. Set AUTH_SECRET when deploying. */
export function authSecret(): string {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  const dir = path.join(process.cwd(), ".data");
  const f = path.join(dir, "secret");
  try {
    return fs.readFileSync(f, "utf8");
  } catch {
    fs.mkdirSync(dir, { recursive: true });
    const s = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(f, s);
    return s;
  }
}

// ---------------------------------------------------------------- users

type UserRow = { id: string; name: string; email: string; salt: string; hash: string; role: "admin" | "user"; phone: string | null; created: Date; sub_exp: Record<string, string> | null };

const USER_SELECT = `
  select u.id, u.name, u.email, u.salt, u.hash, u.role, u.phone, u.created,
         (select json_object_agg(s.slug, s.expires) from subscriptions s where s.user_id = u.id) as sub_exp
  from users u`;

function toUser(r: UserRow): User {
  const subExp = Object.fromEntries(Object.entries(r.sub_exp ?? {}).map(([k, v]) => [k, iso(v)]));
  return { id: r.id, name: r.name, email: r.email, salt: r.salt, hash: r.hash, role: r.role, phone: r.phone ?? undefined, created: iso(r.created), subs: Object.keys(subExp), subExp };
}

async function findUser(where: string, value: string): Promise<User | null> {
  const [r] = await query<UserRow>(`${USER_SELECT} where ${where} = $1`, [value]);
  return r ? toUser(r) : null;
}

export const findByEmail = async (email: string): Promise<User | null> =>
  usesRemoteBackend() ? callBackend("findByEmail", [email]) : findUser("u.email", email.trim().toLowerCase());
export const findById = async (id: string): Promise<User | null> => {
  if (usesRemoteBackend()) return callBackend("findById", [id]);
  return isUuid(id) ? findUser("u.id", id) : null;
};

/** Slugs this user has paid up for right now (expiry still in the future). */
export function activeSubs(u: User, now = Date.now()): string[] {
  return u.subs.filter((s) => u.subExp?.[s] && Date.parse(u.subExp[s]) > now);
}

export function verifyPassword(u: User, pw: string) {
  const a = Buffer.from(hashPw(pw, u.salt), "hex");
  const b = Buffer.from(u.hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** A dummy check so a wrong email takes about as long as a wrong password. */
export function burnPasswordCheck(pw: string) {
  hashPw(pw, "0".repeat(32));
}

/** Creates an account, or says why not: the email or the mobile number is already used. */
export async function createUser(name: string, email: string, password: string, phone: string): Promise<{ user: User } | { error: "email" | "phone" }> {
  if (usesRemoteBackend()) return callBackend("createUser", [name, email, password, phone]);
  const salt = crypto.randomBytes(16).toString("hex");
  const id = crypto.randomUUID();
  try {
    await query("insert into users (id, name, email, phone, salt, hash) values ($1, $2, $3, $4, $5, $6)", [id, name.trim(), email.trim().toLowerCase(), phone, salt, hashPw(password, salt)]);
  } catch (e) {
    const rule = uniqueViolation(e); // the database enforces uniqueness, so two sign-ups at once cannot both win
    if (rule === "users_email_key") return { error: "email" };
    if (rule === "users_phone_key") return { error: "phone" };
    throw e;
  }
  return { user: (await findById(id)) as User };
}

// ---------------------------------------------------------------- subscriptions

// Subscribing (or renewing) buys the plan's days, added on top of any time still left.
const GRANT_CONFLICT = "on conflict (user_id, slug) do update set expires = greatest(subscriptions.expires, now()) + (excluded.expires - now())";

export async function setSubscription(userId: string, slug: string, on: boolean, plan: PlanId = "year"): Promise<boolean> {
  if (usesRemoteBackend()) return callBackend("setSubscription", [userId, slug, on, plan]);
  if (!isUuid(userId)) return false;
  if (!on) {
    await query("delete from subscriptions where user_id = $1 and slug = $2", [userId, slug]);
    return true;
  }
  if (!SLUGS.has(slug)) return false;
  const rows = await query(
    `insert into subscriptions (user_id, slug, expires)
     select id, $2, now() + make_interval(days => $3) from users where id = $1
     ${GRANT_CONFLICT} returning slug`,
    [userId, slug, PLANS[plan].days],
  );
  return rows.length > 0;
}

// ---------------------------------------------------------------- password reset

/** Creates a single-use reset link valid for 30 minutes and "emails" it to the demo inbox. */
export async function createReset(email: string): Promise<boolean> {
  if (usesRemoteBackend()) return callBackend("createReset", [email]);
  const u = await findByEmail(email);
  if (!u) return false;
  const token = crypto.randomBytes(32).toString("hex");
  await transaction(async (c) => {
    await c.query("delete from password_resets where user_id = $1 or expires <= now()", [u.id]);
    await c.query("insert into password_resets (token_hash, user_id, expires) values ($1, $2, now() + interval '30 minutes')", [sha(token), u.id]);
    await c.query("insert into demo_inbox (recipient, subject, link) values ($1, $2, $3)", [u.email, "Reset your AKNA Capital password", `/reset-password?token=${token}`]);
    await c.query("delete from demo_inbox where id not in (select id from demo_inbox order by id desc limit 10)");
  });
  return true;
}

export async function resetTokenValid(token: string): Promise<boolean> {
  if (usesRemoteBackend()) return callBackend("resetTokenValid", [token]);
  return (await query("select 1 from password_resets where token_hash = $1 and expires > now()", [sha(token)])).length > 0;
}

export async function consumeReset(token: string, newPassword: string): Promise<boolean> {
  if (usesRemoteBackend()) return callBackend("consumeReset", [token, newPassword]);
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = hashPw(newPassword, salt);
  return transaction(async (c) => {
    // deleting the row is what makes the link single use, even if it is submitted twice at the same moment
    const used = await c.query<{ user_id: string }>("delete from password_resets where token_hash = $1 and expires > now() returning user_id", [sha(token)]);
    const userId = used.rows[0]?.user_id;
    if (!userId) return false;
    await c.query("update users set salt = $2, hash = $3 where id = $1", [userId, salt, hash]);
    await c.query("delete from password_resets where user_id = $1", [userId]);
    return true;
  });
}

export async function inbox(): Promise<Mail[]> {
  if (usesRemoteBackend()) return callBackend("inbox");
  const rows = await query<{ recipient: string; subject: string; link: string; at: Date }>("select recipient, subject, link, at from demo_inbox order by id desc limit 10");
  return rows.map((r) => ({ to: r.recipient, subject: r.subject, link: r.link, at: iso(r.at) }));
}

// ---------------------------------------------------------------- subscription requests (manual UPI payment)

export const isAdmin = (u: User | null | undefined) => u?.role === "admin";

type ReqRow = { id: string; user_id: string; slug: string; plan: PlanId; amount: number; status: ReqStatus; utr: string | null; note: string | null; created: Date; decided_at: Date | null; decided_by: string | null };

const toRequest = (r: ReqRow): SubRequest => ({
  id: r.id, userId: r.user_id, slug: r.slug, plan: r.plan, amount: r.amount, status: r.status,
  utr: r.utr ?? undefined, note: r.note ?? undefined, created: iso(r.created),
  decidedAt: r.decided_at ? iso(r.decided_at) : undefined, decidedBy: r.decided_by ?? undefined,
});

/** A user asks for a plan. One open request per user and basket: asking again updates it. */
export async function createRequest(userId: string, slug: string, plan: PlanId): Promise<SubRequest | null> {
  if (usesRemoteBackend()) return callBackend("createRequest", [userId, slug, plan]);
  if (!SLUGS.has(slug) || !PLANS[plan] || !isUuid(userId)) return null;
  const [r] = await query<ReqRow>(
    `insert into requests (id, user_id, slug, plan, amount)
     select $1, id, $3, $4, $5 from users where id = $2
     on conflict (user_id, slug) where status = 'pending' do update set plan = excluded.plan, amount = excluded.amount
     returning *`,
    [crypto.randomUUID(), userId, slug, plan, PLANS[plan].price],
  );
  return r ? toRequest(r) : null;
}

export async function getRequest(id: string): Promise<SubRequest | null> {
  if (usesRemoteBackend()) return callBackend("getRequest", [id]);
  if (!isUuid(id)) return null;
  const [r] = await query<ReqRow>("select * from requests where id = $1", [id]);
  return r ? toRequest(r) : null;
}
export async function requestsFor(userId: string): Promise<SubRequest[]> {
  if (usesRemoteBackend()) return callBackend("requestsFor", [userId]);
  return (await query<ReqRow>("select * from requests where user_id = $1 order by created desc", [userId])).map(toRequest);
}
export async function allRequests(): Promise<SubRequest[]> {
  if (usesRemoteBackend()) return callBackend("allRequests");
  return (await query<ReqRow>("select * from requests order by created desc limit 1000")).map(toRequest);
}

/** The user adds the UPI transaction reference of their payment, so the admin can match it. A reference can back only one request. */
export async function setRequestUtr(id: string, userId: string, utr: string): Promise<"ok" | "invalid" | "used"> {
  if (usesRemoteBackend()) return callBackend("setRequestUtr", [id, userId, utr]);
  if (!/^[A-Za-z0-9]{6,30}$/.test(utr) || !isUuid(id)) return "invalid";
  try {
    const rows = await query("update requests set utr = $3 where id = $1 and user_id = $2 and status = 'pending' returning id", [id, userId, utr.toUpperCase()]);
    return rows.length ? "ok" : "invalid";
  } catch (e) {
    if (uniqueViolation(e) === "requests_utr_key") return "used";
    throw e;
  }
}

/** Admin decision. Approving switches the plan on (adding time to any left), rejecting records why. */
export async function decideRequest(id: string, approve: boolean, adminId: string, note?: string): Promise<boolean> {
  if (usesRemoteBackend()) return callBackend("decideRequest", [id, approve, adminId, note]);
  if (!isUuid(id)) return false;
  // One transaction: the request is only marked approved if the plan is switched on, and it can only be decided once.
  return transaction(async (c) => {
    const found = await c.query<ReqRow>("select * from requests where id = $1 and status = 'pending' for update", [id]);
    const r = found.rows[0];
    if (!r) return false;
    if (approve) {
      if (!SLUGS.has(r.slug)) return false;
      await c.query(`insert into subscriptions (user_id, slug, expires) values ($1, $2, now() + make_interval(days => $3)) ${GRANT_CONFLICT}`, [r.user_id, r.slug, PLANS[r.plan].days]);
    }
    await c.query("update requests set status = $2, decided_at = now(), decided_by = $3, note = coalesce($4, note) where id = $1", [
      id, approve ? "approved" : "rejected", adminId, note ? note.slice(0, 200) : null,
    ]);
    return true;
  });
}

export type AdminUser = {
  id: string; name: string; email: string; phone: string; role: "admin" | "user"; created: string;
  subs: { slug: string; expires: string }[]; expired: string[];
};

/** Everyone, for the admin panel. Password data is left out. */
export async function allUsers(): Promise<AdminUser[]> {
  if (usesRemoteBackend()) return callBackend("allUsers");
  const rows = await query<UserRow>(`${USER_SELECT} order by u.created`);
  return rows.map(toUser).map((u) => {
    const active = activeSubs(u);
    return {
      id: u.id, name: u.name, email: u.email, phone: u.phone ?? "", role: u.role ?? "user", created: u.created,
      subs: active.map((slug) => ({ slug, expires: (u.subExp ?? {})[slug] })),
      expired: u.subs.filter((s) => !active.includes(s)),
    };
  });
}
