import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdmin } from "@/lib/auth/session";
import { allRequests, allUsers } from "@/lib/auth/store";
import { strategies } from "@/lib/strategies";
import { PLANS, dateIN, inr } from "@/lib/pricing";
import { shortId } from "@/lib/payment";
import { activateSubscription, approveRequest, rejectRequest, revokeSubscription } from "./actions";
import ActivatePlanForm from "@/components/ActivatePlanForm";
import ConfirmButton from "@/components/ConfirmButton";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

type SP = { tab?: string; status?: string; q?: string; result?: string; user?: string; basket?: string };
const problems: Record<string, string> = {
  active: "That basket is already active for this user. Nothing was changed.",
  used: "That transaction ID is already attached to another request. Nothing was changed.",
  invalid: "Check the basket, plan, amount (whole rupees) and transaction ID (6 to 30 letters or digits). Nothing was changed.",
};
const names: Record<string, string> = Object.fromEntries(strategies.map((s) => [s.slug, s.name]));
const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

const th = "p-3 text-left text-xs font-medium uppercase tracking-wide text-pmuted";
const td = "p-3 align-top";

function Tab({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-medium ${active ? "bg-ptext text-page" : "bg-page3 text-pmuted hover:text-ptext"}`}>
      {children}
    </Link>
  );
}

async function Panel({ searchParams }: { searchParams: Promise<SP> }) {
  const admin = await getAdmin();
  if (!admin) notFound(); // anyone else just sees a 404
  const sp = await searchParams;
  const tab = ["requests", "subscribers", "others"].includes(sp.tab ?? "") ? (sp.tab as string) : "requests";
  const status = sp.status === "all" ? "all" : "pending";
  const q = (sp.q ?? "").trim().toLowerCase().slice(0, 60);

  const [users, reqs] = await Promise.all([allUsers(), allRequests()]);
  const byId = new Map(users.map((u) => [u.id, u]));
  const members = users.filter((u) => u.role !== "admin");
  const subscribers = members.filter((u) => u.subs.length > 0);
  const others = members.filter((u) => u.subs.length === 0);
  const pendingN = reqs.filter((r) => r.status === "pending").length;
  const activeSubs = members.reduce((a, u) => a + u.subs.length, 0);
  const revenue = reqs.filter((r) => r.status === "approved").reduce((a, r) => a + r.amount, 0);
  // A mobile number is only searched when the query looks like one (with or without +91, spaces or dashes).
  const digits = /^[+\d\s-]+$/.test(q) ? q.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "") : "";
  const match = (u?: { name: string; email: string; phone?: string }) => !q || (!!u && (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (digits !== "" && (u.phone ?? "").includes(digits))));
  const options = strategies.map((s) => ({ slug: s.slug, name: s.name })).sort((a, b) => a.name.localeCompare(b.name));
  // The success message is read back from the stored plan, so a hand-typed address cannot claim an activation.
  const done = sp.result === "ok" ? byId.get(sp.user ?? "") : undefined;
  const doneSub = done?.subs.find((s) => s.slug === sp.basket);
  const problem = Object.hasOwn(problems, sp.result ?? "") ? problems[sp.result as string] : "";
  const subscriberHits = q ? subscribers.filter(match).length : 0;

  const link = (t: string, extra = "") => `/admin?tab=${t}${extra}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  const inScope = (r: { status: string }) => status === "all" || r.status === "pending";
  const shownReqs = reqs.filter((r) => inScope(r) && (match(byId.get(r.userId)) || (q !== "" && ((r.utr ?? "").toLowerCase().includes(q) || shortId(r.id).toLowerCase() === q))));

  const stats: [string, string, string][] = [
    ["Pending requests", String(pendingN), "pending"],
    ["Active subscriptions", String(activeSubs), "active"],
    ["Subscribers", String(subscribers.length), "subscribers"],
    ["Non-subscribers", String(others.length), "others"],
    ["Approved payments", inr(revenue), "revenue"],
  ];

  return (
    <>
      <p className="eyebrow">Admin</p>
      <h1 className="h1 mt-4 !text-[clamp(1.75rem,3.4vw,2.5rem)]">Subscriptions</h1>

      <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-5">
        {stats.map(([k, v, id]) => (
          <div key={k} className="card p-4" data-stat={id}>
            <dt className="text-xs text-pmuted">{k}</dt>
            <dd className="num mt-1 text-2xl font-bold">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Admin sections" className="flex flex-wrap gap-2">
          <Tab href={link("requests")} active={tab === "requests"}>Requests{pendingN > 0 ? ` (${pendingN})` : ""}</Tab>
          <Tab href={link("subscribers")} active={tab === "subscribers"}>Subscribers ({subscribers.length})</Tab>
          <Tab href={link("others")} active={tab === "others"}>Non-subscribers ({others.length})</Tab>
        </nav>
        <form action="/admin" className="flex w-full gap-2 sm:w-auto" role="search">
          <input type="hidden" name="tab" value={tab} />
          {tab === "requests" && <input type="hidden" name="status" value={status} />}
          <label htmlFor="adm-q" className="sr-only">Search by name, email, mobile number, request ID or transaction ID</label>
          <input id="adm-q" name="q" defaultValue={q} placeholder="Name, email, mobile…" className="w-full min-w-0 rounded-full sm:w-56 border border-pline bg-page2 px-4 py-2 text-sm outline-none focus:border-[var(--accent-ink)]" />
          <button className="btn btn-ghost !min-h-0 !py-2">Search</button>
        </form>
      </div>

      {tab !== "requests" && (done && doneSub || problem) && (
        <div className="mt-6">
          {done && doneSub && (
            <p role="status" className="card mb-3 p-4 text-sm"><span className="up font-semibold">▲ Plan activated.</span> {done.name} has {names[doneSub.slug] ?? doneSub.slug} until {dateIN(doneSub.expires)}. {tab === "others" && <Link href={`/admin?tab=subscribers&q=${encodeURIComponent(done.email)}`} className="font-medium text-aink hover:underline">View in Subscribers →</Link>}</p>
          )}
          {problem && <p role="alert" className="card down mb-3 p-4 text-sm font-medium">{problem}</p>}
        </div>
      )}

      {tab === "requests" && (
        <section className="mt-6" aria-label="Requests">
          <div className="mb-3 flex gap-2 text-sm">
            <Link href={link("requests", "&status=pending")} className={`chip ${status === "pending" ? "on" : ""}`}>Pending</Link>
            <Link href={link("requests", "&status=all")} className={`chip ${status === "all" ? "on" : ""}`}>All requests</Link>
          </div>
          <div className="card overflow-x-auto">
            <table className="num w-full min-w-[980px] text-sm">
              <caption className="sr-only">Subscription requests</caption>
              <thead><tr className="border-b border-pline">
                {["Requested", "ID", "User", "Basket", "Plan", "Amount", "UPI txn ID", "Status", "Action"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}
              </tr></thead>
              <tbody>
                {shownReqs.length === 0 && <tr><td colSpan={9} className="p-6 text-center text-pmuted">{status === "pending" ? "No pending requests." : "No requests yet."}</td></tr>}
                {shownReqs.map((r) => {
                  const u = byId.get(r.userId);
                  return (
                    <tr key={r.id} className="border-b border-pline last:border-0" data-req={shortId(r.id)} data-status={r.status}>
                      <td className={`${td} whitespace-nowrap text-pmuted`}>{when(r.created)}</td>
                      <td className={`${td} font-semibold`}>{shortId(r.id)}</td>
                      <td className={td}><span className="font-medium">{u?.name ?? "Deleted user"}</span><br /><span className="text-xs text-pmuted">{u?.email}</span>{u?.phone && <><br /><span className="text-xs text-pmuted">{u.phone}</span></>}</td>
                      <td className={td}>{names[r.slug] ?? r.slug}</td>
                      <td className={td}>{PLANS[r.plan].name}</td>
                      <td className={`${td} font-semibold`}>{inr(r.amount)}</td>
                      <td className={td}>{r.utr ?? <span className="text-pmuted">-</span>}</td>
                      <td className={td}>
                        <span className={r.status === "approved" ? "up" : r.status === "rejected" ? "down" : "text-aink"}>
                          {r.status === "approved" ? "▲ Approved" : r.status === "rejected" ? "▼ Rejected" : "● Pending"}
                        </span>
                        {r.decidedAt && <span className="block text-xs text-pmuted">{when(r.decidedAt)}</span>}
                        {r.note && <span className="block text-xs text-pmuted">{r.note}</span>}
                      </td>
                      <td className={td}>
                        {r.status === "pending" ? (
                          <div className="flex flex-col gap-2">
                            <form action={approveRequest}><input type="hidden" name="id" value={r.id} /><button className="btn btn-primary !min-h-0 !py-1.5 text-xs">Approve</button></form>
                            <form action={rejectRequest} className="flex gap-1">
                              <input type="hidden" name="id" value={r.id} />
                              <label className="sr-only" htmlFor={`note-${r.id}`}>Reason for rejecting</label>
                              <input id={`note-${r.id}`} name="note" placeholder="Reason (optional)" maxLength={200} className="w-32 rounded-lg border border-pline bg-page px-2 py-1 text-xs" />
                              <button className="btn btn-ghost !min-h-0 !px-3 !py-1 text-xs">Reject</button>
                            </form>
                          </div>
                        ) : <span className="text-xs text-pmuted">Decided</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "subscribers" && (
        <section className="mt-6" aria-label="Subscribers">
          <p className="mb-3 text-sm text-pmuted">To give someone another basket, use <strong>Add basket</strong> under their name. No request is needed.</p>
          <div className="card overflow-x-auto">
            <table className="num w-full min-w-[820px] text-sm">
              <caption className="sr-only">Subscribers</caption>
              <thead><tr className="border-b border-pline">{["User", "Joined", "Active baskets"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr></thead>
              <tbody>
                {subscribers.filter(match).length === 0 && <tr><td colSpan={3} className="p-6 text-center text-pmuted">No subscribers match.</td></tr>}
                {subscribers.filter(match).map((u) => (
                  <tr key={u.id} className="border-b border-pline last:border-0" data-user={u.email}>
                    <td className={td}><span className="font-medium">{u.name}</span><br /><span className="text-xs text-pmuted">{u.email}</span>{u.phone && <><br /><span className="text-xs text-pmuted">{u.phone}</span></>}</td>
                    <td className={`${td} whitespace-nowrap text-pmuted`}>{dateIN(u.created)}</td>
                    <td className={td}>
                      <ul className="space-y-2">
                        {u.subs.map((sb) => (
                          <li key={sb.slug} className="flex flex-wrap items-center gap-2" data-sub={sb.slug}>
                            <span className="font-medium">{names[sb.slug] ?? sb.slug}</span>
                            <span className="text-xs text-pmuted">until {dateIN(sb.expires)}</span>
                            <form action={revokeSubscription}>
                              <input type="hidden" name="userId" value={u.id} /><input type="hidden" name="slug" value={sb.slug} />
                              <ConfirmButton message={`Revoke ${u.name}'s ${names[sb.slug] ?? sb.slug} subscription?`} className="chip !py-0.5 text-xs">Revoke</ConfirmButton>
                            </form>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3">
                        {(() => {
                          // only baskets they do not have right now: an active one is never granted twice
                          const more = options.filter((o) => !u.subs.some((sb) => sb.slug === o.slug));
                          if (!more.length) return <span className="text-xs text-pmuted">Has every basket.</span>;
                          return (
                            <ActivatePlanForm
                              key={`${u.id}:${u.subs.length}`} // starts fresh once a basket has been added
                              action={activateSubscription}
                              user={{ id: u.id, name: u.name }}
                              q={q}
                              tab="subscribers"
                              label="+ Add basket"
                              baskets={more}
                              waiting={reqs.filter((r) => r.userId === u.id && r.status === "pending" && more.some((o) => o.slug === r.slug)).map((r) => ({ slug: r.slug, plan: r.plan, amount: r.amount }))}
                            />
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "others" && (
        <section className="mt-6" aria-label="Non-subscribers">
          <p className="mb-3 text-sm text-pmuted">
            Search by name, email or mobile number, then use <strong>Activate plan</strong>. No request is needed.
            {q && <> Showing results for “{q}”. <Link href="/admin?tab=others" className="font-medium text-aink hover:underline">Clear search</Link>.</>}
            {subscriberHits > 0 && <> Also matching: <Link href={link("subscribers")} className="font-medium text-aink hover:underline">{subscriberHits} subscriber{subscriberHits === 1 ? "" : "s"} →</Link></>}
          </p>
          <div className="card overflow-x-auto">
            <table className="num w-full min-w-[920px] text-sm">
              <caption className="sr-only">Users without an active subscription</caption>
              <thead><tr className="border-b border-pline">{["User", "Joined", "Past baskets", "Pending requests", "Plan"].map((h) => <th key={h} scope="col" className={th}>{h}</th>)}</tr></thead>
              <tbody>
                {others.filter(match).length === 0 && <tr><td colSpan={5} className="p-6 text-center text-pmuted">No non-subscribers match.</td></tr>}
                {others.filter(match).map((u) => (
                  <tr key={u.id} className="border-b border-pline last:border-0" data-user={u.email}>
                    <td className={td}><span className="font-medium">{u.name}</span><br /><span className="text-xs text-pmuted">{u.email}</span>{u.phone && <><br /><span className="text-xs text-pmuted">{u.phone}</span></>}</td>
                    <td className={`${td} whitespace-nowrap text-pmuted`}>{dateIN(u.created)}</td>
                    <td className={`${td} text-pmuted`}>{u.expired.length ? u.expired.map((s) => names[s] ?? s).join(", ") + " (expired)" : "-"}</td>
                    <td className={td}>{reqs.filter((r) => r.userId === u.id && r.status === "pending").length || "-"}</td>
                    <td className={td}>
                      <ActivatePlanForm
                        action={activateSubscription}
                        user={{ id: u.id, name: u.name }}
                        q={q}
                        tab="others"
                        baskets={options}
                        waiting={reqs.filter((r) => r.userId === u.id && r.status === "pending").map((r) => ({ slug: r.slug, plan: r.plan, amount: r.amount }))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}

export default function AdminPage({ searchParams }: { searchParams: Promise<SP> }) {
  return (
    <div className="wrap py-10 md:py-14">
      <Suspense fallback={<div className="card h-64" aria-busy />}>
        <Panel searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
