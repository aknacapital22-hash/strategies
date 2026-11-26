"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { forgotPassword, login, signup, type FormState } from "@/app/auth/actions";

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
    <Shell title="Welcome back" sub="Log in to see what is inside your baskets.">
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

/** The emailed code, plus the hidden values that tie it to this browser's request. */
function CodeFields({ step }: { step: { ticket: string; email: string } }) {
  return (
    <>
      <input type="hidden" name="ticket" value={step.ticket} />
      <input type="hidden" name="email" value={step.email} />
      <label className="block text-sm font-medium">
        6-digit code
        <input name="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} title="The 6 digits from the email" className={`${field} num text-center text-2xl tracking-[0.4em]`} />
      </label>
    </>
  );
}

const link = "font-medium text-aink hover:underline";

export function SignupForm({ next }: { next?: string }) {
  const [state, action] = useActionState(signup, undefined);
  const [v, setV] = useState({ name: "", email: "", phone: "" });
  if (state?.step) {
    return (
      <Shell title="Check your email" sub={`We sent a code to ${state.step.email}. It works for 10 minutes. Check your spam folder too.`}>
        <form key="code" action={action} className="space-y-5">
          <input type="hidden" name="next" value={next ?? ""} />
          <CodeFields step={state.step} />
          <Msg s={state} />
          <button className="btn btn-primary w-full" name="intent" value="verify">Verify and create account</button>
          <div className="flex justify-between gap-4 text-sm">
            <button className={link} name="intent" value="resend" formNoValidate>Send a new code</button>
            <button className={link} name="intent" value="restart" formNoValidate>Change my details</button>
          </div>
        </form>
      </Shell>
    );
  }
  return (
    <Shell title="Create your account" sub="Joining is free. Get a plan to see what is inside a basket.">
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
        <p className="text-xs text-pmuted">By creating an account, you agree to our <Link href="/terms" className="font-medium text-aink hover:underline">Terms</Link>. See our <Link href="/privacy" className="font-medium text-aink hover:underline">Privacy Policy</Link>.</p>
        <Submit>Email me a code</Submit>
      </form>
      <p className="text-center text-sm text-pmuted">Already have an account? <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-aink hover:underline">Log in</Link></p>
    </Shell>
  );
}

export function ForgotForm() {
  const [state, action] = useActionState(forgotPassword, undefined);
  const [email, setEmail] = useState("");
  if (state?.step) {
    return (
      <Shell title="Choose a new password" sub={`If an account exists for ${state.step.email}, we have sent it a code. It works for 10 minutes. Check your spam folder too.`}>
        <form key="code" action={action} className="space-y-5">
          <CodeFields step={state.step} />
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
          <button className="btn btn-primary w-full" name="intent" value="verify">Save new password</button>
          <p className="text-center text-sm"><button className={link} name="intent" value="restart" formNoValidate>No code? Request another</button></p>
        </form>
      </Shell>
    );
  }
  return (
    <Shell title="Forgot your password?" sub="Enter your email and we will send you a code to choose a new one.">
      <form key="email" action={action} className="space-y-5">
        <label className="block text-sm font-medium">
          Email
          <input name="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </label>
        <Msg s={state} />
        <Submit>Email me a code</Submit>
      </form>
      <p className="text-center text-sm"><Link href="/login" className="font-medium text-aink hover:underline">← Back to log in</Link></p>
    </Shell>
  );
}
