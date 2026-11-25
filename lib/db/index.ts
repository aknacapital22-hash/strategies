// Postgres (Neon) access. The app is a long-running Node server, so it uses node-postgres with a small pool against
// the POOLED connection string (Neon's PgBouncer), as Neon's guidance recommends. Schema changes use the direct one
// (see scripts/db-migrate.mjs).
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { pgConfig } from "./config.mjs";

const g = globalThis as unknown as { __aknaPool?: Pool };

function pool(): Pool {
  if (g.__aknaPool) return g.__aknaPool;
  const url = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL_POOLED (or DATABASE_URL) is not set.");
  const p = new Pool({ ...pgConfig(url), max: 5, idleTimeoutMillis: 30000 });
  // Neon closes idle connections when the compute scales to zero; without a handler that would crash the process.
  p.on("error", (e) => console.error("database: idle connection closed:", e.message));
  g.__aknaPool = p;
  return p;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await pool().query<T>(text, params)).rows;
}

/** Runs several statements in one transaction. */
export async function transaction<T>(work: (c: PoolClient) => Promise<T>): Promise<T> {
  const c = await pool().connect();
  try {
    await c.query("begin");
    const out = await work(c);
    await c.query("commit");
    return out;
  } catch (e) {
    await c.query("rollback").catch(() => {});
    throw e;
  } finally {
    c.release();
  }
}

/** The Postgres error for a broken unique rule, with the rule's name. */
export const uniqueViolation = (e: unknown): string | null => {
  const err = e as { code?: string; constraint?: string };
  return err?.code === "23505" ? (err.constraint ?? "unknown") : null;
};
