// Emails subscribers when a basket they pay for has a new rebalance. Runs on the backend (it needs the database).
// Safe to call again and again, and each person is told about an update at most once:
// - rebalance_notices holds one row per person, basket and signal date. The row is removed (so a later call tries
//   again) only when the email certainly was not sent.
// - Once everyone due has been handled, the update is closed. Later calls skip it, so someone who subscribes
//   afterwards is not emailed old news.
import { query } from "./db";
import { engine } from "./engine";
import { deliverMail, sendMail } from "./mail";
import { noticeEmail } from "./noticeEmail";
import { CONTACT_EMAIL } from "./payment";
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
  const baskets = items.map(({ slug, signal }) => ({
    name: names.get(slug) ?? slug,
    date: dateIN(signal),
    change: engine[slug].changes.find((c) => c.signal === signal) ?? null,
    url: `${siteUrl()}/strategies/${slug}#rebalance`,
  }));
  return noticeEmail(name, baskets, CONTACT_EMAIL);
}

type Signal = { slug: string; signal: string };

// Closed updates are kept in rate_limits, long enough to outlast RECENT_DAYS.
const closedKey = ({ slug, signal }: Signal) => `notice-round:${slug}:${signal}`;

async function stillOpen(due: Signal[]): Promise<Signal[]> {
  const closed = new Set((await query<{ key: string }>("select key from rate_limits where key = any($1) and reset_at > now()", [due.map(closedKey)])).map((r) => r.key));
  return due.filter((d) => !closed.has(closedKey(d)));
}

const close = (done: Signal[]) =>
  query(
    `insert into rate_limits (key, n, reset_at) select k, 1, now() + interval '30 days' from unnest($1::text[]) as k
     on conflict (key) do update set reset_at = excluded.reset_at`,
    [done.map(closedKey)],
  );

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

export async function sendRebalanceNotices(): Promise<{ sent: number; failed: number; unconfirmed: number; remaining: number; limitReached: boolean }> {
  const recent = dueSignals();
  const summary = { sent: 0, failed: 0, unconfirmed: 0, remaining: 0, limitReached: false };
  if (!recent.length) return summary;
  const due = await stillOpen(recent);
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
  let elsewhere = false; // another call is sending to someone, and may yet need a retry
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
    if (mine.length < items.length) elsewhere = true;
    if (!mine.length) continue;
    const release = () => query("delete from rebalance_notices where user_id = $1 and slug = any($2) and signal = any($3::date[])", [userId, mine.map((i) => i.slug), mine.map((i) => i.signal)]);
    if (!(await countToday())) {
      await release();
      summary.limitReached = true;
      break;
    }
    handled++;
    const { subject, text, html } = composeNotice(mine[0].name, mine);
    const result = await deliverMail(mine[0].email, subject, text, html);
    if (result === "sent") summary.sent++;
    else if (result === "unknown") summary.unconfirmed++; // the claim stays: a missed email is better than a repeat
    else {
      await release();
      summary.failed++;
    }
  }
  summary.remaining = people.size - summary.sent - summary.unconfirmed;
  const everyoneHandled = handled === people.size && !summary.failed && !summary.limitReached && !elsewhere;
  if (everyoneHandled) await close(due);
  return summary;
}
