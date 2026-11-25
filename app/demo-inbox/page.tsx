import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { demoEnabled, inbox } from "@/lib/auth/store";

export const metadata = { title: "Demo inbox", robots: { index: false, follow: false } };

// Stands in for real email during local development without a mail key. It lists emailed codes, so it is off in production unless DEMO_INBOX=1.
async function Mails() {
  await connection(); // the inbox changes with every reset request, so never bake it into a prerender
  if (!demoEnabled()) notFound();
  const mails = await inbox();
  return mails.length === 0 ? (
    <p className="card p-6 text-pmuted">No messages yet. Request a code from the sign-up or forgot password page.</p>
  ) : (
    <ul className="space-y-4">
      {mails.map((m) => (
        <li key={m.at + m.to} className="card p-5">
          <p className="text-xs text-pmuted">To {m.to} · <time dateTime={m.at}>{new Date(m.at).toLocaleString("en-IN")}</time></p>
          <p className="mt-1 font-semibold">{m.subject}</p>
        </li>
      ))}
    </ul>
  );
}

export default function DemoInbox() {
  return (
    <div className="wrap max-w-2xl py-10 md:py-14">
      <p className="eyebrow">Demo only</p>
      <h1 className="h1 mt-4 !text-[clamp(2rem,4.4vw,3rem)]">Demo inbox</h1>
      <p className="lead mt-3">A stand-in for email: one-time codes appear here instead of being sent.</p>
      <div className="mt-8">
        <Suspense fallback={<div className="card h-32" aria-busy />}>
          <Mails />
        </Suspense>
      </div>
    </div>
  );
}
