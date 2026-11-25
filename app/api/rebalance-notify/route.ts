// Called by the scheduled job (.github/workflows/rebalance.yml) after it updates the portfolios.
// It has its own key, CRON_SECRET, which can only send the due rebalance emails: it cannot read any data.
import crypto from "node:crypto";
import { usesRemoteBackend } from "@/lib/backend";
import { engine } from "@/lib/engine";
import { mailConfigured } from "@/lib/mail";
import { sendRebalanceNotices } from "@/lib/rebalanceNotify";

const digest = (s: string) => crypto.createHash("sha256").update(s).digest();
const reply = (status: number, body: unknown) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

export async function POST(req: Request) {
  const key = (process.env.CRON_SECRET ?? "").trim();
  if (key.length < 32 || usesRemoteBackend()) return reply(404, { error: "not found" });
  if (!crypto.timingSafeEqual(digest(req.headers.get("authorization") ?? ""), digest(`Bearer ${key}`))) {
    return reply(401, { error: "unauthorised" });
  }

  // The job says which signals it published. Until this server has been redeployed with them, send nothing:
  // the email would link to the previous portfolio.
  const body = (await req.json().catch(() => null)) as { signals?: Record<string, string> } | null;
  const signals = body?.signals;
  if (!signals || typeof signals !== "object") return reply(400, { error: "bad request" });
  const behind = Object.entries(signals).filter(([slug, signal]) => engine[slug]?.schedule.lastSignal !== signal);
  if (behind.length) return reply(409, { error: "this server does not have the new portfolios yet" });

  // The links in the email must point at the public website.
  if (!process.env.PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL) return reply(503, { error: "PUBLIC_SITE_URL is not set" });
  if (!mailConfigured()) return reply(503, { error: "email is not set up" });

  try {
    return reply(200, await sendRebalanceNotices());
  } catch (e) {
    console.error("rebalance notices failed:", e instanceof Error ? e.message : e);
    return reply(500, { error: "server error" });
  }
}
