import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { ORG_ID, breadcrumbs, graph, pageMeta, webPage } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/payment";

const TITLE = "About AKNA Capital";
const DESCRIPTION = "AKNA Capital makes ready-made share baskets that follow fixed rules, shows the risks openly, and leaves your shares in your own account.";
export const metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: "/about" });

const values = [
  ["Honesty", "We aim to be honest and open in everything we do. That includes telling you what can go wrong, not only what can go right.", "◎"],
  ["Rules, not guesswork", "Every recommendation goes through our own computer system, with more than 30 methods, before our analysts review it. We follow the process, not the mood of the market.", "△"],
  ["You come first", "We want to make a real difference for investors. Your goals, and how long you can stay invested, come before any product.", "✓"],
];

export default function About() {
  return (
    <div className="wrap py-10 md:py-14">
      <JsonLd data={graph({ ...webPage("AboutPage", TITLE, DESCRIPTION, "/about"), about: { "@id": ORG_ID } }, breadcrumbs(["About", "/about"]))} />
      <div className="max-w-3xl">
        <p className="eyebrow">Company</p>
        <h1 className="h1 mt-4 !text-[clamp(1.75rem,3.4vw,2.5rem)]">Who are we?</h1>
        <p className="lead mt-5">
          AKNA Capital wants to make money planning and share investing easy for people, families and businesses. We study companies and share
          prices with data, computers and AI, and our team takes this work seriously.
        </p>
      </div>

      <section className="card mt-10 max-w-3xl p-6 md:p-8" aria-labelledby="mission">
        <span className="badge badge-teal">Our mission</span>
        <h2 id="mission" className="mt-4 text-2xl font-extrabold">We believe in staying a step ahead.</h2>
        <p className="mt-3 leading-relaxed text-pmuted">
          That&apos;s why we built our own computer system, with more than 30 methods, to help us arrive at the right share recommendations for our
          customers. Whether you&apos;re just starting out with a Research and Ranking subscription or growing into AKNA Private Wealth, we bring the
          same care to every client.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="values">
        <h2 id="values" className="text-xl font-extrabold">Our core values</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {values.map(([t, d, icon]) => (
            <div key={t} className="card p-6">
              <span className="tile" aria-hidden>{icon}</span>
              <h3 className="mt-4 font-bold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-pmuted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card mt-10 flex max-w-3xl flex-wrap items-center justify-between gap-4 p-6" aria-labelledby="contact">
        <div className="flex items-center gap-4">
          <span className="tile" aria-hidden>✉</span>
          <div><h2 id="contact" className="font-bold">Questions? Write to us</h2><p className="text-sm text-pmuted">We reply to every email.</p></div>
        </div>
        <a href={`mailto:${CONTACT_EMAIL}`} className="btn btn-primary">{CONTACT_EMAIL}</a>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/strategies" className="btn btn-primary">Explore baskets →</Link>
        <Link href="/product" className="btn btn-ghost">How it works</Link>
      </div>

      <p className="mt-10 max-w-3xl border-t border-pline pt-4 text-[11px] leading-relaxed text-pmuted">
        AKNA Capital is a technology company. We are not registered with SEBI as an investment adviser or research analyst, and this website is for
        educational purposes only. Nothing here is investment advice or a recommendation to buy or sell any security. Growth figures come from testing on past
        data and are not a promise of future returns. Investments in securities are subject to market risk, and you can lose money. Please
        speak to a SEBI registered adviser before you invest.
      </p>
    </div>
  );
}
