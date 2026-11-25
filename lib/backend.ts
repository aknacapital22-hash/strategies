// Splits the app across two hosts. When BACKEND_URL is set (the frontend, on Netlify), the database functions in
// lib/auth/store.ts do not open Postgres: they call the same function on the backend (Render), which serves
// app/api/backend/route.ts. Without BACKEND_URL (the backend, and local development) they use the database directly.
// Server side only: BACKEND_API_KEY gives full access to the data, so never give it a NEXT_PUBLIC_ name.

export const usesRemoteBackend = () => Boolean(process.env.BACKEND_URL);

export async function callBackend<T>(op: string, args: unknown[] = []): Promise<T> {
  const base = new URL(process.env.BACKEND_URL as string);
  if (base.protocol !== "https:" && base.hostname !== "localhost" && base.hostname !== "127.0.0.1") {
    throw new Error("BACKEND_URL must use https.");
  }
  const key = process.env.BACKEND_API_KEY;
  if (!key) throw new Error("BACKEND_API_KEY is not set.");
  const res = await fetch(new URL("/api/backend", base), {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({ op, args }),
    cache: "no-store",
    redirect: "error",
    // Writes are not retried: the backend may have done the work even if the reply was lost.
    signal: AbortSignal.timeout(55000),
  });
  if (!res.ok) throw new Error(`Backend call "${op}" failed with status ${res.status}.`);
  return ((await res.json()) as { result: T }).result;
}
