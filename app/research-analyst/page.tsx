import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { CONTACT_EMAIL } from "@/lib/payment";
import { RESEARCH_ANALYST, RESEARCH_LINE, RESEARCH_PATH } from "@/lib/research";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Research Analyst Details", description: "Details of the SEBI-registered Research Analyst who provides the research.", path: RESEARCH_PATH });

const sections: LegalSection[] = [
  { h: "Research Analyst", list: [`Name: ${RESEARCH_ANALYST.name}`, `SEBI Research Analyst registration number: ${RESEARCH_ANALYST.number}`] },
  { h: "How lists are published", p: ["The basket lists are prepared using fixed rules. A new list is published after the Research Analyst approves it."] },
  { h: "Please note", p: [
    "Registration granted by SEBI and certification from NISM in no way guarantee performance of the intermediary or provide any assurance of returns to investors.",
    "Investment in securities market is subject to market risks. Read all the related documents carefully before investing.",
  ] },
  { h: "Questions and complaints", p: [
    `Email ${CONTACT_EMAIL} with your question or complaint. See the Contact and Complaints page for what happens next.`,
    "If a complaint about a SEBI-registered intermediary is not resolved, you can also use SEBI's SCORES complaints website: https://scores.sebi.gov.in",
  ] },
];

export default function ResearchAnalyst() {
  return <LegalPage title="Research Analyst Details" path={RESEARCH_PATH} intro={RESEARCH_LINE} sections={sections} />;
}
