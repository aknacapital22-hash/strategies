import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { getUser } from "@/lib/auth/session";
import { getRequest, requestsFor } from "@/lib/auth/store";
import { strategies } from "@/lib/strategies";
import { ALL_ACCESS, PLANS, dateIN, inr } from "@/lib/pricing";
import { PAYEE_NAME, UPI_ID, CONTACT_EMAIL, WHATSAPP_DISPLAY, shortId, upiLink, whatsappLink } from "@/lib/payment";
import CopyButton from "@/components/CopyButton";
import UtrForm from "@/components/UtrForm";

export const metadata = { title: "Complete your payment", robots: { index: false, follow: false } };

async function Inner({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ r?: string }> }) {
  const { slug } = await params;
  const { r } = await searchParams;
  // what is being paid for: one basket, or All Access
  const s = slug === ALL_ACCESS ? { name: "All Access (every basket)" } : strategies.find((x) => x.slug === slug);
  if (!s) notFound();
  const details = slug === ALL_ACCESS ? "/pricing" : `/strategies/${slug}`;
  const opened = slug === ALL_ACCESS ? { href: "/portfolios", label: "See your baskets" } : { href: `/strategies/${slug}#holdings`, label: `See ${s.name} holdings` };
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/subscribe/${slug}`)}`);

  // Only the owner of a request can open its page.
  const req = (r ? await getRequest(r) : (await requestsFor(user.id)).find((x) => x.slug === slug)) ?? null;
  if (!req || req.userId !== user.id || req.slug !== slug) notFound();

  const plan = PLANS[req.plan];
  const code = shortId(req.id);
  const note = `${s.name} ${plan.name} ${code}`;
  const qr = await QRCode.toString(upiLink(req.amount, note), { type: "svg", margin: 1 });
  const wa = whatsappLink(`Hi, I have paid ${inr(req.amount)} for ${s.name} (${plan.name} plan). Request ID: ${code}. Email: ${user.email}${user.phone ? `. Mobile: ${user.phone}` : ""}`);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href={details} className="text-sm font-medium text-aink hover:underline">← {s.name} details</Link>
      <div className="card mt-4 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold md:text-3xl">{req.status === "approved" ? "Plan activated" : req.status === "rejected" ? "Request not approved" : "Complete your payment"}</h1>
          <span
            data-status={req.status}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${req.status === "approved" ? "bg-[var(--gain-ink)]/12 up" : req.status === "rejected" ? "bg-[var(--loss-ink)]/12 down" : "bg-aink/10 text-aink"}`}
          >
            {req.status === "approved" ? "Approved" : req.status === "rejected" ? "Rejected" : "Pending approval"}
          </span>
        </div>
        <p className="num mt-2 text-sm text-pmuted">{s.name} · {plan.name} plan · {inr(req.amount)} · Request ID <b className="text-ptext">{code}</b></p>

        {req.status === "approved" && (
          <div className="mt-6">
            <p>Your plan is active{user.subExp[slug] ? <> until <b>{dateIN(user.subExp[slug])}</b></> : null}. You can now see the holdings.</p>
            <Link href={opened.href} className="btn btn-primary mt-5">{opened.label} →</Link>
          </div>
        )}

        {req.status === "rejected" && (
          <div className="mt-6">
            <p className="text-pmuted">{req.note ? <>Reason: {req.note}</> : "We could not match a payment to this request."} If you have paid, message us on WhatsApp with your payment screenshot.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-primary">WhatsApp {WHATSAPP_DISPLAY}</a>
              <Link href={`/subscribe/${slug}`} className="btn btn-ghost">Start a new request</Link>
            </div>
          </div>
        )}

        {req.status === "pending" && (
          <>
            <ol className="mt-6 space-y-6">
              <li>
                <p className="font-semibold"><span className="num mr-2 text-aink">1.</span>Pay {inr(req.amount)} by UPI</p>
                <div className="mt-3 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <dl className="space-y-3 text-sm">
                    <div><dt className="text-xs text-pmuted">Payee name</dt><dd className="font-semibold">{PAYEE_NAME}</dd></div>
                    <div>
                      <dt className="text-xs text-pmuted">UPI ID</dt>
                      <dd className="mt-0.5 flex flex-wrap items-center gap-2"><span className="num text-base font-bold" data-upi>{UPI_ID}</span><CopyButton text={UPI_ID} label="Copy UPI ID" /></dd>
                    </div>
                    <div><dt className="text-xs text-pmuted">Amount</dt><dd className="num text-base font-bold">{inr(req.amount)}</dd></div>
                    <div className="sm:hidden"><a href={upiLink(req.amount, note)} className="btn btn-primary w-full">Open UPI app</a></div>
                  </dl>
                  <div className="mx-auto w-40 rounded-xl border border-pline bg-white p-2 sm:mx-0" role="img" aria-label={`UPI QR code to pay ${inr(req.amount)} to ${UPI_ID}`} dangerouslySetInnerHTML={{ __html: qr }} />
                </div>
                <p className="mt-3 text-xs text-pmuted">Scan the QR code with any UPI app, or pay to the UPI ID above. Put <b>{code}</b> in the payment note if your app allows it.</p>
              </li>
              <li>
                <p className="font-semibold"><span className="num mr-2 text-aink">2.</span>Send us the payment proof on WhatsApp</p>
                <p className="mt-2 text-sm text-pmuted">Send a screenshot of the payment to <b className="num text-ptext">{WHATSAPP_DISPLAY}</b>, with your Request ID <b className="text-ptext">{code}</b>.</p>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost mt-3">WhatsApp {WHATSAPP_DISPLAY}</a>
                <UtrForm id={req.id} current={req.utr} />
              </li>
              <li>
                <p className="font-semibold"><span className="num mr-2 text-aink">3.</span>Wait for some time</p>
                <p className="mt-2 text-sm text-pmuted">We will check your payment, and <b className="text-ptext">your plan will get activated</b>. This page and your account will show it once it is approved.</p>
                <Link href={`/subscribe/${slug}/pay?r=${req.id}`} className="btn btn-ghost mt-3 !min-h-0 !py-2">Refresh status</Link>
              </li>
            </ol>
          </>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-pmuted">Payments are matched by hand, so activation is not instant. Need help? WhatsApp {WHATSAPP_DISPLAY} or email <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-aink hover:underline">{CONTACT_EMAIL}</a>.</p>
    </div>
  );
}

export default function PayPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ r?: string }> }) {
  return (
    <div className="wrap py-10 md:py-14">
      <Suspense fallback={<div className="card mx-auto h-96 max-w-2xl" aria-busy />}>
        <Inner params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
