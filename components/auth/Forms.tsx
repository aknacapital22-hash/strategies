"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { forgotPassword, login, resetPassword, signup, type FormState } from "@/app/auth/actions";

const field = "mt-1.5 w-full rounded-xl border border-pline bg-page px-4 py-3 outline-none focus:border-[var(--accent-ink)]";

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary w-full disabled:opacity-60" disabled={pending}>
      {pending ? "Please wait…" : children}
    </button>
  );
}

function Msg({ s }: { s: FormState }) {
  if (s?.error) return <p role="alert" className="rounded-xl bg-[var(--loss-ink)]/10 px-4 py-3 text-sm down">{s.error}</p>;
  if (s?.ok) return <p role="status" className="rounded-xl bg-[var(--gain-ink)]/10 px-4 py-3 text-sm up">{s.ok}</p>;
  return null;
}

const Shell = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => (
  <div className="card mx-auto max-w-md space-y-5 p-8 md:p-10">
    <div>
      <h1 className="text-3xl font-bold">{title}</h1>
      {sub && <p className="mt-2 text-sm text-pmuted">{sub}</p>}
    </div>
    {children}
  </div>
);

export function LoginForm({ next, notice, demo }: { next?: string; notice?: string; demo: { email: string; password: string; label: string }[] }) {
  const [state, action] = useActionState(login, undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Shell title="Welcome back" sub="Log in to see the holdings of the baskets you subscribe to.">
      {notice && <p role="status" className="rounded-xl bg-[var(--gain-ink)]/10 px-4 py-3 text-sm up">{notice}</p>}
      <form action={action} className="space-y-5">
        <input type="hidden" name="next" value={next ?? ""} />
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input name="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={field} />
        </label>
        <div className="-mt-2 text-right text-sm"><Link href="/forgot-password" className="font-medium text-aink hover:underline">Forgot password?</Link></div>
        <Msg s={state} />
        <Submit>Log in</Submit>
      </form>
      <p className="text-center text-sm text-pmuted">New here? <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-aink hover:underline">Create an account</Link></p>

      {demo.length > 0 && <div className="rounded-xl border border-dashed border-pline p-4 text-sm">
        <p className="font-semibold">Demo accounts</p>
        <ul className="mt-3 space-y-3">
          {demo.map((d) => (
            <li key={d.email} className="flex flex-wrap items-center justify-between gap-2">
              <span>
                <span className="block text-pmuted">{d.label}</span>
                <span className="num">{d.email}</span> · <span className="num">{d.password}</span>
              </span>
              <button type="button" className="chip" onClick={() => { setEmail(d.email); setPassword(d.password); }}>Fill in</button>
            </li>
          ))}
        </ul>
      </div>}
    </Shell>
  );
}

export function SignupForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signup, undefined);
  const [v, setV] = useState({ name: "", email: "", phone: "" });
  return (
    <Shell title="Create your account" sub="Free to join. Subscribe to a basket to see its holdings.">
      <form action={action} className="space-y-5">
        <input type="hidden" name="next" value={next ?? ""} />
        <label className="block text-sm font-medium">
          Full name
          <input name="name" required minLength={2} maxLength={60} autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className={field} />
        </label>
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} className={field} />
        </label>
        <label className="block text-sm font-medium">
          Mobile number
          <input
            name="phone" type="tel" inputMode="numeric" required autoComplete="tel-national" placeholder="10-digit mobile number" maxLength={16}
            value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value.replace(/[^0-9+\s-]/g, "") })} className={field}
          />
          <span className="mt-1 block text-xs font-normal text-pmuted">We may use it to confirm your payment on WhatsApp.</span>
        </label>
        <label className="block text-sm font-medium">
          Password
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={field} />
          <span className="mt-1 block text-xs font-normal text-pmuted">At least 8 characters, with a letter and a number.</span>
        </label>
        <label className="block text-sm font-medium">
          Confirm password
          <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={field} />
        </label>
        <Msg s={state} />
        <Submit>Create account</Submit>
      </form>
      <p className="text-center text-sm text-pmuted">Already have an account? <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-aink hover:underline">Log in</Link></p>
    </Shell>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(forgotPassword, undefined);
  const [email, setEmail] = useState("");
  return (
    <Shell title="Forgot your password?" sub="Enter your email and we will send you a link to choose a new one.">
      <form action={action} className="space-y-5">
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </label>
        <Msg s={state} />
        <Submit>Send reset link</Submit>
      </form>
      {state?.ok && (
        <p className="rounded-xl border border-dashed border-pline p-4 text-sm text-pmuted">
          Demo build: no real email is sent. Open the <Link href="/demo-inbox" className="font-medium text-aink hover:underline">demo inbox</Link> to find your link.
        </p>
      )}
      <p className="text-center text-sm"><Link href="/login" className="font-medium text-aink hover:underline">← Back to log in</Link></p>
    </Shell>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action] = useActionState(resetPassword, undefined);
  return (
    <Shell title="Choose a new password">
      <form action={action} className="space-y-5">
        <input type="hidden" name="token" value={token} />
        <label className="block text-sm font-medium">
          New password
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className={field} />
          <span className="mt-1 block text-xs font-normal text-pmuted">At least 8 characters, with a letter and a number.</span>
        </label>
        <label className="block text-sm font-medium">
          Confirm new password
          <input name="confirm" type="password" required minLength={8} autoComplete="new-password" className={field} />
        </label>
        <Msg s={state} />
        <Submit>Save new password</Submit>
      </form>
    </Shell>
  );
}
