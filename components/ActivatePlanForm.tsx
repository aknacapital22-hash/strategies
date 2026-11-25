"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ALL_ACCESS, PLANS, inr, isPlan, planFits, type PlanId } from "@/lib/pricing";

type Waiting = { slug: string; plan: PlanId; amount: number };

const field = "w-full rounded-lg border border-pline bg-page px-2 py-1.5 text-sm text-ptext";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn btn-primary !min-h-0 !py-1.5 text-xs" disabled={pending}>{pending ? "Activating…" : "Activate now"}</button>;
}

/** Admin: switch a plan on for one user. A request already waiting fills in the form. */
export default function ActivatePlanForm({ action, user, q, baskets, waiting }: {
  action: (fd: FormData) => Promise<void>;
  user: { id: string; name: string };
  q: string;
  baskets: { slug: string; name: string }[];
  waiting: Waiting[];
}) {
  const first = waiting[0];
  const [slug, setSlug] = useState(first?.slug ?? "");
  const [plan, setPlan] = useState<PlanId>(first?.plan ?? "year");
  const [amount, setAmount] = useState(String(first?.amount ?? PLANS.year.price));
  const request = waiting.find((w) => w.slug === slug);

  // Picking a basket or plan fills in what was asked for, or the list price. The admin can still change it.
  const pickBasket = (next: string) => {
    const w = waiting.find((x) => x.slug === next);
    setSlug(next);
    if (w) {
      setPlan(w.plan);
      setAmount(String(w.amount));
      return;
    }
    // All Access has its own plan, so the plan and price follow the choice
    const fits = planFits(next, plan) ? plan : next === ALL_ACCESS ? "all" : "year";
    setPlan(fits);
    if (request || fits !== plan) setAmount(String(PLANS[fits].price));
  };
  const pickPlan = (next: string) => {
    if (!isPlan(next)) return;
    setPlan(next);
    setAmount(String(request?.plan === next ? request.amount : PLANS[next].price));
  };

  return (
    <details>
      <summary className="btn btn-ghost !min-h-0 !py-1.5 text-xs" aria-label={`Activate a plan for ${user.name}`}>Activate plan</summary>
      <form
        action={action}
        className="mt-3 grid w-64 gap-2"
        onSubmit={(e) => {
          const name = baskets.find((b) => b.slug === slug)?.name ?? slug;
          if (!window.confirm(`Activate ${name} (${PLANS[plan].name}, ${PLANS[plan].days} days) for ${user.name}?\nAmount received: ${inr(Number(amount) || 0)}`)) e.preventDefault();
        }}
      >
        <input type="hidden" name="userId" value={user.id} />
        <input type="hidden" name="q" value={q} />
        <label className="grid gap-1 text-xs text-pmuted">Basket
          <select name="slug" required value={slug} onChange={(e) => pickBasket(e.target.value)} className={field}>
            <option value="" disabled>Choose a basket</option>
            {baskets.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs text-pmuted">Plan
          <select name="plan" value={plan} onChange={(e) => pickPlan(e.target.value)} className={field}>
            {Object.values(PLANS).filter((p) => planFits(slug, p.id)).map((p) => <option key={p.id} value={p.id}>{p.name}, {p.days} days, {inr(p.price)}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-xs text-pmuted">Amount received in ₹ (0 if free)
          <input name="amount" type="number" inputMode="numeric" min={0} max={9999999} step={1} required value={amount} onChange={(e) => setAmount(e.target.value)} className={field} />
        </label>
        <label className="grid gap-1 text-xs text-pmuted">Transaction ID (optional)
          <input name="utr" pattern="\s*[A-Za-z0-9]{6,30}\s*" title="6 to 30 letters or digits" maxLength={32} autoComplete="off" className={field} />
        </label>
        {request && <p className="text-xs text-pmuted">This user has a pending request for this basket. Activating will mark it approved.</p>}
        <Submit />
      </form>
    </details>
  );
}
