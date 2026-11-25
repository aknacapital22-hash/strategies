// The backend API (served by Render). Only the frontend server may call it, using the shared BACKEND_API_KEY.
// It trusts that caller completely: the frontend checks who is signed in and who is an admin before calling.
import crypto from "node:crypto";
import { allRequests, allUsers, consumeReset, createRequest, createReset, createUser, decideRequest, demoEnabled, findByEmail, findById, getRequest, inbox, requestsFor, resetTokenValid, setRequestUtr, setSubscription } from "@/lib/auth/store";
import { usesRemoteBackend } from "@/lib/backend";

// Only the functions listed here can be called.
const OPERATIONS = new Map(
  Object.entries({
    allRequests, allUsers, consumeReset, createRequest, createReset, createUser, decideRequest, findByEmail, findById,
    getRequest, inbox, requestsFor, resetTokenValid, setRequestUtr, setSubscription,
  }) as [string, (...args: unknown[]) => Promise<unknown>][],
);

const MIN_KEY_LENGTH = 32;
const digest = (s: string) => crypto.createHash("sha256").update(s).digest();

const reply = (status: number, body: unknown) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

export async function POST(req: Request) {
  const key = process.env.BACKEND_API_KEY ?? "";
  // Off unless a long key is set, and off on the frontend, which would otherwise forward calls to the backend for anyone.
  if (key.length < MIN_KEY_LENGTH || usesRemoteBackend()) return reply(404, { error: "not found" });
  // Comparing digests keeps the comparison constant time whatever the length of what was sent.
  if (!crypto.timingSafeEqual(digest(req.headers.get("authorization") ?? ""), digest(`Bearer ${key}`))) {
    return reply(401, { error: "unauthorised" });
  }

  const body = (await req.json().catch(() => null)) as { op?: unknown; args?: unknown } | null;
  const run = typeof body?.op === "string" ? OPERATIONS.get(body.op) : undefined;
  const args = body?.args;
  const simple = (a: unknown) => a === null || typeof a === "string" || typeof a === "boolean";
  if (!run || !Array.isArray(args) || args.length > 4 || !args.every(simple)) return reply(400, { error: "bad request" });
  // The demo inbox lists password reset links, so the backend applies its own switch too.
  if (body?.op === "inbox" && !demoEnabled()) return reply(403, { error: "forbidden" });

  try {
    // JSON turns a missing argument into null: turn it back, so default values still apply.
    return reply(200, { result: (await run(...args.map((a) => a ?? undefined))) ?? null });
  } catch (e) {
    console.error(`backend: ${body?.op} failed:`, e instanceof Error ? e.message : e);
    return reply(500, { error: "server error" });
  }
}
