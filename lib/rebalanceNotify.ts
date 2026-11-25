// Emails subscribers when a basket they pay for has a new rebalance. Runs on the backend (it needs the database).
// Safe to call again and again: rebalance_notices holds one row per person, basket and signal date, so nobody is
// emailed twice, and whatever could not be sent is picked up by the next call.
import { query } from "./db";
import { engine } from "./engine";
import { sendMail } from "./mail";
import { SITE_URL } from "./site";
import strategies from "./strategies.json";

const names = new Map((strategies as { slug: string; name: string }[]).map((s) => [s.slug, s.name]));

/** The public website, for links in emails. The backend sets PUBLIC_SITE_URL, which leaves its own copy of the site unindexed. */
const siteUrl = () => (process.env.PUBLIC_SITE_URL?.trim() || SITE_URL).replace(/\/$/, "");

const RECENT_DAYS = 5; // older signals are history, not news
const DAILY_LIMIT = 200; // of the mail provider's daily allowance, leaving room for sign-up and reset codes
const PER_CALL = 25;

/** Baskets whose latest rebalance is recent enough to tell people about. */
export function dueSignals(now = Date.now()) {
  return Object.entries(engine)
    .filter(([, r]) => {
      const age = (now - Date.parse(`${r.schedule.lastSignal}T00:00:00+05:30`)) / 86400000;
      return age >= 0 && age <= RECENT_DAYS;
    })
    .map(([slug, r]) => ({ slug, signal: r.schedule.lastSignal }));
}

const dateIN = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** One email covering every basket of this person's that has just rebalanced. */
export function composeNotice(name: string, items: { slug: string; signal: string }[]) {
  const blocks = items.map(({ slug, signal }) => {
    const r = engine[slug];
    const change = r.changes.find((c) => c.signal === signal);
    const lines = [`${names.get(slug) ?? slug} (signal of ${dateIN(signal)})`];
    if (change?.in.length) lines.push(`  Added: ${change.in.join(", ")}`);
    if (change?.out.length) lines.push(`  Removed: ${change.out.join(", ")}`);
    if (change && !change.in.length && !change.out.length) lines.push("  Same stocks. Check the weights against your holdings.");
    lines.push(`  See the full list and work out your orders: ${siteUrl()}/strategies/${slug}#rebalance`);
    return lines.join("\n");
  });
  const subject = items.length === 1 ? `Rebalance: ${names.get(items[0].slug) ?? items[0].slug}` : `Rebalance: ${items.length} of your baskets`;
  const text = [
    `Hello ${name},`,
    "A basket you subscribe to has a new model portfolio. Review the changes before the next trading session.",
    ...blocks,
    "Weights can change even for stocks that stay, so compare the full list with what you hold. Nothing is traded for you: you decide and place any orders yourself.",
    "This is a model, not a promise of returns. Investments in securities carry market risk.",
  ].join("\n\n");
  return { subject, text };
}

async function countToday(): Promise<boolean> {
  const [r] = await query<{ n: number }>(
    `insert into rate_limits (key, n, reset_at) values ('mail:notices', 1, now() + interval '1 day')
     on conflict (key) do update set
       n = case when rate_limits.reset_at <= now() then 1 else rate_limits.n + 1 end,
       reset_at = case when rate_limits.reset_at <= now() then excluded.reset_at else rate_limits.reset_at end
     returning n`,
  );
  return r.n <= DAILY_LIMIT;
}

/** Tells the admins that the scheduled run failed, so a stalled automation never goes unnoticed. */
export async function alertAdmins(runUrl: string): Promise<{ alerted: number }> {
  const [r] = await query<{ n: number }>(
    `insert into rate_limits (key, n, reset_at) values ('mail:alerts', 1, now() + interval '1 day')
     on conflict (key) do update set
       n = case when rate_limits.reset_at <= now() then 1 else rate_limits.n + 1 end,
       reset_at = case when rate_limits.reset_at <= now() then excluded.reset_at else rate_limits.reset_at end
     returning n`,
  );
  if (r.n > 4) return { alerted: 0 };
  let alerted = 0;
  for (const a of await query<{ email: string }>("select email from users where role = 'admin'")) {
    const sent = await sendMail(a.email, "Action needed: the automatic rebalance did not finish",
      `The scheduled rebalance run failed. Until a run succeeds, new portfolios or rebalance emails may be missing.\n\nOpen the run to see the reason:\n${runUrl}\n\nIt is tried again at the next scheduled time.`);
    if (sent) alerted++;
  }
  return { alerted };
}

export async function sendRebalanceNotices(): Promise<{ sent: number; failed: number; remaining: number; limitReached: boolean }> {
  const due = dueSignals();
  const summary = { sent: 0, failed: 0, remaining: 0, limitReached: false };
  if (!due.length) return summary;

  // People with an active plan who have not been told yet.
  const rows = await query<{ id: string; name: string; email: string; slug: string; signal: string }>(
    `select distinct u.id, u.name, u.email, d.slug, d.signal, u.created
     from jsonb_to_recordset($1::jsonb) as d(slug text, signal text)
     join subscriptions s on (s.slug = d.slug or s.slug = 'all-access') and s.expires > now()
     join users u on u.id = s.user_id
     where not exists (select 1 from rebalance_notices n where n.user_id = u.id and n.slug = d.slug and n.signal = d.signal::date)
     order by u.created, d.slug`,
    [JSON.stringify(due)],
  );
  const people = new Map<string, typeof rows>();
  for (const r of rows) people.set(r.id, [...(people.get(r.id) ?? []), r]);

  let handled = 0;
  for (const [userId, items] of people) {
    if (handled >= PER_CALL) break;
    // Claim first, so two runs at the same moment cannot both email this person.
    const claimed = await query<{ slug: string }>(
      `insert into rebalance_notices (user_id, slug, signal)
       select $1, d.slug, d.signal::date from jsonb_to_recordset($2::jsonb) as d(slug text, signal text)
       on conflict do nothing returning slug`,
      [userId, JSON.stringify(items.map(({ slug, signal }) => ({ slug, signal })))],
    );
    const mine = items.filter((i) => claimed.some((c) => c.slug === i.slug));
    if (!mine.length) continue;
    const release = () => query("delete from rebalance_notices where user_id = $1 and slug = any($2) and signal = any($3::date[])", [userId, mine.map((i) => i.slug), mine.map((i) => i.signal)]);
    if (!(await countToday())) {
      await release();
      summary.limitReached = true;
      break;
    }
    handled++;
    const { subject, text } = composeNotice(mine[0].name, mine);
    if (await sendMail(mine[0].email, subject, text)) summary.sent++;
    else {
      await release();
      summary.failed++;
    }
  }
  summary.remaining = people.size - summary.sent;
  return summary;
}
