import crypto from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { activeSubs, authSecret, findById } from "./store";

export const COOKIE = "akna_session";
const TTL = 60 * 60 * 24 * 7; // 7 days

export type PublicUser = { id: string; name: string; email: string; subs: string[]; subExp: Record<string, string>; role: "admin" | "user"; phone: string };

const mac = (body: string) => crypto.createHmac("sha256", authSecret()).update(body).digest("base64url");

function makeToken(uid: string) {
  const body = Buffer.from(JSON.stringify({ uid, exp: Math.floor(Date.now() / 1000) + TTL })).toString("base64url");
  return `${body}.${mac(body)}`;
}

function readToken(t: string | undefined): string | null {
  if (!t) return null;
  const [body, sig] = t.split(".");
  if (!body || !sig) return null;
  const a = Buffer.from(sig);
  const b = Buffer.from(mac(body));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(body, "base64url").toString());
    return typeof uid === "string" && exp > Date.now() / 1000 ? uid : null;
  } catch {
    return null;
  }
}

/** The signed-in user, or null. Reads the request's cookies, so call it inside a <Suspense> boundary. */
export async function getUser(): Promise<PublicUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  await connection(); // the expiry check reads the clock, so this must run at request time, never in a prerender
  const uid = readToken(token);
  const u = uid ? findById(uid) : null;
  return u ? { id: u.id, name: u.name, email: u.email, subs: activeSubs(u), subExp: u.subExp ?? {}, role: u.role === "admin" ? "admin" : "user", phone: u.phone ?? "" } : null;
}

export async function startSession(uid: string) {
  (await cookies()).set(COOKIE, makeToken(uid), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.AUTH_SECURE_COOKIES === "1", // set to 1 when served over https
    path: "/",
    maxAge: TTL,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

/** Only same-site relative paths, so a login link can never bounce someone to another site. */
export function safeNext(n: unknown): string | null {
  return typeof n === "string" && n.startsWith("/") && !n.startsWith("//") && !n.includes("\\") ? n : null;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const passwordProblem = (p: string) =>
  p.length < 8 ? "Use at least 8 characters." : !/[A-Za-z]/.test(p) || !/\d/.test(p) ? "Include at least one letter and one number." : null;

/** For admin pages and actions: the signed-in admin, or null. */
export async function getAdmin(): Promise<PublicUser | null> {
  const u = await getUser();
  return u?.role === "admin" ? u : null;
}

/**
 * Indian mobile numbers: 10 digits starting 6 to 9. Accepts spaces, dashes, "+91", "91" or a leading 0 and
 * returns the plain 10 digits, or null if it is not a valid number.
 */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/[\s\-().]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9][0-9]{9}$/.test(d) ? d : null;
}
