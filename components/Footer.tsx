import Image from "next/image";
import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/payment";

const cols = [
  { h: "Product", l: [["Product tour", "/product"], ["All strategies", "/strategies"], ["My baskets", "/portfolios"], ["Pricing", "/pricing"]] },
  { h: "Learn", l: [["Learn hub", "/learn"], ["Blog", "/blog"], ["Index finder", "/start"]] },
  { h: "Company", l: [["About", "/about"], ["Log in", "/login"]] },
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-pline bg-page3">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-2.5 font-bold">
            <Image src="/logo.svg" alt="" width={40} height={40} unoptimized className="h-10 w-10 shrink-0 rounded-[10px] shadow-sm" />
            AKNA Capital Stock Strategies
          </Link>
          <p className="mt-4 max-w-xs text-sm text-pmuted">
            Proprietary alpha strategies. Your broker, your own demat, every trade approved by you.
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
          <details className="text-xs text-pmuted">
            <summary className="flex w-fit items-center gap-2 font-medium text-ptext">
              Important disclosures <span className="plus inline-block transition-transform" aria-hidden>+</span>
            </summary>
            <p className="mt-3 max-w-3xl leading-relaxed">
              All returns shown are model, back tested figures and are not a promise of future returns. Back tests use
              current index members and flatter the past (survivorship bias). Investments in securities are subject to
              market risk. This is a technology demo, not a fund, PMS or investment adviser, and nothing here is investment advice.
            </p>
          </details>
          <p className="mt-4 text-xs text-pmuted">
            © AKNA Capital Stock Strategies. We are a technology company and are not registered with SEBI as an investment adviser or research analyst. Content is for educational purposes only and is not investment advice. Strategy figures are model, back tested numbers (13 Nov 2026).
          </p>
        </div>
      </div>
    </footer>
  );
}
