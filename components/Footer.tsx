import { DATA_AS_OF } from "@/lib/strategies";
import Brand from "@/components/Brand";
import { LEGAL_PAGES } from "@/components/LegalPage";
import { RESEARCH_LINE, RESEARCH_PATH } from "@/lib/research";
import { RETURNS_NOTE } from "@/lib/pricing";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/payment";

const cols = [
  { h: "Product", l: [["How it works", "/product"], ["All baskets", "/strategies"], ["My baskets", "/portfolios"], ["Pricing", "/pricing"]] },
  { h: "Learn", l: [["Learn hub", "/learn"], ["Blog", "/blog"], ["See what suits you", "/start"]] },
  { h: "Company", l: [["About", "/about"], ["Log in", "/login"]] },
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-pline bg-page3">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="inline-block" aria-label="15Stocks by AKNA Capital, home">
            <Brand />
          </Link>
          <p className="mt-4 max-w-xs text-sm text-pmuted">
            <span className="block font-semibold text-ptext">Systematic investing for wealth creation.</span>
            <span className="mt-1 block">Ready-made share baskets that follow fixed rules. You buy in your own account.</span>
          </p>
          <p className="mt-3 text-sm"><a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-aink hover:underline">{CONTACT_EMAIL}</a></p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <h2 className="mb-3 text-sm font-semibold">{c.h}</h2>
            <ul className="space-y-2.5 text-sm text-pmuted">
              {c.l.map(([label, href]) => (
                <li key={label}><Link href={href} className="hover:text-ptext">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-pline">
        <div className="wrap py-6">
          <nav aria-label="Policies" className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-pmuted">
            {LEGAL_PAGES.map(([label, href]) => <Link key={href} href={href} className="hover:text-ptext hover:underline">{label}</Link>)}
          </nav>
          <details className="text-xs text-pmuted">
            <summary className="flex w-fit items-center gap-2 font-medium text-ptext">
              Important disclosures <span className="plus inline-block transition-transform" aria-hidden>+</span>
            </summary>
            <p className="mt-3 max-w-3xl leading-relaxed">
              All growth numbers come from testing each basket&apos;s rules on old prices (a back test). They do not promise future growth. The tests use the companies
              that are in each market list today, so past results look better than they would really have been (survivorship bias). Share prices carry market risk.
              Nothing here is advice made for you personally.
            </p>
          </details>
          <p className="mt-4 text-xs text-pmuted">
            © 15Stocks by AKNA Capital. {RESEARCH_LINE} <Link href={RESEARCH_PATH} className="underline hover:text-ptext">Details</Link>. {RETURNS_NOTE} Prices up to {DATA_AS_OF}.
          </p>
        </div>
      </div>
    </footer>
  );
}
