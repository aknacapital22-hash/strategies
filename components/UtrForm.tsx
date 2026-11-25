"use client";

import { useActionState, useState } from "react";
import { addUtr } from "@/app/auth/actions";

export default function UtrForm({ id, current }: { id: string; current?: string }) {
  const [state, action, pending] = useActionState(addUtr, undefined);
  const [utr, setUtr] = useState(current ?? "");
  return (
    <form action={action} className="mt-3">
      <input type="hidden" name="id" value={id} />
      <label htmlFor="utr" className="text-sm font-medium">UPI transaction ID (optional)</label>
      <div className="mt-1.5 flex gap-2">
        <input
          id="utr" name="utr" value={utr} onChange={(e) => setUtr(e.target.value)} placeholder="e.g. 412345678901" maxLength={30} autoComplete="off"
          className="num w-full rounded-xl border border-pline bg-page px-4 py-2.5 outline-none focus:border-[var(--accent-ink)]"
        />
        <button className="btn btn-ghost !min-h-0 shrink-0 !py-2" disabled={pending}>{pending ? "Saving…" : "Save"}</button>
      </div>
      {state?.error && <p role="alert" className="mt-2 text-xs down">{state.error}</p>}
      {state?.ok && <p role="status" className="mt-2 text-xs up">{state.ok}</p>}
    </form>
  );
}
