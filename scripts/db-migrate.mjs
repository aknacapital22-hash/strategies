// Creates the tables, optionally imports the old file store, and makes sure an admin exists.
//   npm run db:migrate                 create or update tables
//   npm run db:migrate -- --import     also import .data/db.json (admin and demo accounts; @akna.test test accounts are skipped)
// Uses the DIRECT connection (DATABASE_URL_UNPOOLED or DATABASE_URL), as Neon advises for schema changes.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { pgConfig } from "../lib/db/config.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) throw new Error("Set DATABASE_URL (see .env.local).");

const client = new pg.Client(pgConfig(url));
await client.connect();
try {
  await client.query("begin");
  await client.query(fs.readFileSync(path.join(root, "lib", "db", "schema.sql"), "utf8"));
  await client.query("commit");
  console.log("schema: up to date");

  if (process.argv.includes("--import")) await importFileStore();

  const { rows } = await client.query("select count(*)::int as n from users where role = 'admin'");
  if (rows[0].n === 0) {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      console.log("admin: none yet. Run again with ADMIN_EMAIL and ADMIN_PASSWORD set to create one.");
    } else {
      const salt = crypto.randomBytes(16).toString("hex");
      await client.query("insert into users (id, name, email, salt, hash, role) values ($1, 'Admin', $2, $3, $4, 'admin')", [
        crypto.randomUUID(), email.toLowerCase(), salt, crypto.scryptSync(password, salt, 64).toString("hex"),
      ]);
      console.log("admin: created from ADMIN_EMAIL");
    }
  }

  const counts = await client.query(`select
    (select count(*)::int from users) as users,
    (select count(*)::int from users where role = 'admin') as admins,
    (select count(*)::int from subscriptions) as subscriptions,
    (select count(*)::int from requests) as requests`);
  console.log("rows:", JSON.stringify(counts.rows[0]));
} catch (e) {
  await client.query("rollback").catch(() => {});
  throw e;
} finally {
  await client.end();
}

async function importFileStore() {
  const file = path.join(root, ".data", "db.json");
  if (!fs.existsSync(file)) return console.log("import: no .data/db.json, nothing to import");
  const old = JSON.parse(fs.readFileSync(file, "utf8"));
  const keep = new Set([process.env.ADMIN_EMAIL ?? "admin@akna.test", "admin@akna.test", "demo@akna.test", "free@akna.test"]);
  const users = old.users.filter((u) => keep.has(u.email) || !u.email.endsWith("@akna.test"));
  const ids = new Set(users.map((u) => u.id));
  let nu = 0, ns = 0, nr = 0;
  const usedUtr = new Set();
  await client.query("begin");
  for (const u of users) {
    const r = await client.query(
      "insert into users (id, name, email, phone, salt, hash, role, created) values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict do nothing",
      [u.id, u.name, u.email.toLowerCase(), u.phone || null, u.salt, u.hash, u.role === "admin" ? "admin" : "user", u.created],
    );
    nu += r.rowCount;
    if (!r.rowCount) continue; // already imported: leave its current subscriptions alone
    for (const slug of u.subs ?? []) {
      const expires = u.subExp?.[slug] ?? new Date(Date.now() + 365 * 86400000).toISOString();
      ns += (await client.query("insert into subscriptions (user_id, slug, expires) values ($1,$2,$3) on conflict do nothing", [u.id, slug, expires])).rowCount;
    }
  }
  for (const q of (old.requests ?? []).filter((x) => ids.has(x.userId))) {
    const utr = q.utr && !usedUtr.has(q.utr) ? q.utr : null;
    if (utr) usedUtr.add(utr);
    nr += (await client.query(
      "insert into requests (id, user_id, slug, plan, amount, status, utr, note, created, decided_at, decided_by) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict do nothing",
      [q.id, q.userId, q.slug, q.plan, q.amount, q.status, utr, q.note ?? null, q.created, q.decidedAt ?? null, q.decidedBy ?? null],
    )).rowCount;
  }
  await client.query("commit");
  console.log(`import: ${nu} users, ${ns} subscriptions, ${nr} requests added (${old.users.length - users.length} test accounts skipped)`);
}
