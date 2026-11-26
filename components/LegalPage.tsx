import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/payment";

/** The date the policy pages were last changed. Update it whenever their wording changes. */
export const LEGAL_UPDATED = "26 November 2026";

export const LEGAL_PAGES: [string, string][] = [
  ["Terms and Conditions", "/terms"],
  ["Privacy Policy", "/privacy"],
  ["Refunds and Cancellation", "/refunds"],
  ["Risks", "/risk"],
  ["Contact and Complaints", "/contact"],
  ["Research Analyst Details", "/research-analyst"],
];

export type LegalSection = { h: string; p?: string[]; list?: string[] };

/** One policy page: short headed sections in plain words. */
export default function LegalPage({ title, intro, sections, path }: { title: string; intro: string; sections: LegalSection[]; path: string }) {
  return (
    <div className="wrap max-w-3xl py-10 md:py-14">
      <h1 className="h1 !text-[clamp(1.75rem,3.4vw,2.5rem)]">{title}</h1>
      <p className="mt-2 text-sm text-pmuted">Last updated: {LEGAL_UPDATED}</p>
      <p className="lead mt-4">{intro}</p>
      {sections.map((s) => (
        <section key={s.h} className="mt-8">
          <h2 className="text-xl font-bold">{s.h}</h2>
          {s.p?.map((t) => <p key={t} className="mt-3 leading-relaxed text-pmuted">{t}</p>)}
          {s.list && <ul className="mt-3 list-disc space-y-2 pl-5 leading-relaxed text-pmuted">{s.list.map((t) => <li key={t}>{t}</li>)}</ul>}
        </section>
      ))}
      <p className="mt-10 border-t border-pline pt-5 text-sm text-pmuted">
        Questions? Email <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-aink hover:underline">{CONTACT_EMAIL}</a>.
      </p>
      <nav aria-label="Other policies" className="mt-4 flex flex-wrap gap-2">
        {LEGAL_PAGES.filter(([, href]) => href !== path).map(([label, href]) => <Link key={href} href={href} className="chip">{label}</Link>)}
      </nav>
    </div>
  );
}
