import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { RETURNS_NOTE } from "@/lib/pricing";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Risks", description: "The risks of investing in shares, and the limits of results tested on old prices.", path: "/risk" });

const sections: LegalSection[] = [
  { h: "You can lose money", p: ["Share and fund prices can fall quickly and stay down for a long time. You can lose some or all of what you invest. Invest only money you can afford to lose and do not need soon."] },
  { h: "Results from old prices are not real results", list: [
    "Growth numbers come from a back test: today's rules used on old prices. No real money was invested.",
    "The rules were chosen with knowledge of the past.",
    "The tests use companies that are in each market list today. This leaves out some that did badly, so results look better than they would really have been (survivorship bias).",
    RETURNS_NOTE,
    "Baskets have been tested over different lengths of time. Past results do not promise future results.",
  ] },
  { h: "Risks in the baskets", list: [
    "A basket with only a few shares, or one industry, can fall more when one company or industry does badly.",
    "Small companies can have bigger price swings and fewer buyers, so selling may be hard.",
    "Debt funds and gold funds can also fall.",
    "Rules that worked before can stop working.",
    "A risk label is only a rough guide. A real fall can be bigger than any shown.",
  ] },
  { h: "Practical risks", list: [
    "Frequent changes add charges and tax.",
    "You may get a different price from the one shown, or an order may not go through.",
    "Data, calculations or emails can be wrong, late or missing.",
  ] },
  { h: "Before you invest", p: ["Think about your goals, time, income, debts and emergency money. We are not registered with SEBI as an investment adviser or research analyst, and we do not know your full situation. Speak to a SEBI registered adviser."] },
];

export default function Risk() {
  return <LegalPage title="Risks" path="/risk" intro="Investments in securities are subject to market risk. Please read this before you put money in." sections={sections} />;
}
