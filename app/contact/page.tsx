import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY } from "@/lib/payment";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Contact and Complaints", description: "How to contact 15Stocks by AKNA Capital or make a complaint.", path: "/contact" });

const sections: LegalSection[] = [
  { h: "Contact us", list: [`Email: ${CONTACT_EMAIL}`, `WhatsApp: ${WHATSAPP_DISPLAY}`] },
  { h: "Make a complaint", p: ["Email us from your registered address with the subject “Complaint”. Tell us what happened, when it happened, your request ID if you have one, and what would put it right. This also covers privacy complaints."] },
  { h: "What happens next", p: ["We aim to confirm that we have your complaint within 3 working days and to give our answer within 30 days. If we need longer, we will tell you why. This does not limit your right to go to a consumer forum, court or other authority."] },
  { h: "Stay safe", p: ["We will never ask for your password, UPI PIN, bank code or share app login."] },
];

export default function Contact() {
  return <LegalPage title="Contact and Complaints" path="/contact" intro="We are here to help." sections={sections} />;
}
