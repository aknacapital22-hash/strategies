import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Privacy Policy", description: "What details 15Stocks by AKNA Capital collects, why, who handles them, and your choices.", path: "/privacy" });

// Keep this true to the code: lib/db/schema.sql (what is stored), lib/auth/session.ts (cookies), lib/mail.ts (email).
const sections: LegalSection[] = [
  { h: "What we collect", list: [
    "Your account details: name, email address and mobile number.",
    "Your password in a scrambled form (a salted hash). We do not store the password itself.",
    "Your plans and payment requests: the basket, plan, amount, dates, status, any note on the request, and the UPI transaction ID if you add it.",
    "Anything you send us on WhatsApp or email, such as a payment screenshot. A screenshot may show your name, UPI ID or bank details, so hide anything we do not need.",
    "Records needed for safety: one-time email codes (stored scrambled and used for a short time), counts of log-in and code attempts (which may use your internet address, stored scrambled), and which list update emails we have sent you.",
    "Our hosting companies may keep normal technical logs, such as your internet address, the time and the page asked for.",
  ] },
  { h: "What we do not ask for", p: ["We do not ask for your share app password, demat password, bank password, card details, UPI PIN or one-time bank codes. Never send these to anyone. We do not connect to your share account or place orders."] },
  { h: "Why we use your details", list: [
    "To create your account and let you log in.",
    "To check your payment, switch your plan on and show you what you paid for.",
    "To email you codes, list updates and important messages about the service.",
    "To contact you about your payment or your question.",
    "To keep the service safe, stop misuse, keep required records and follow the law.",
  ] },
  { h: "Cookies and storage on your device", list: [
    "Two login cookies, kept for up to 7 days: one keeps you logged in, and one lets the page show your first name.",
    "Your light or dark screen choice is saved in your browser.",
    "If you press “I have done this rebalance”, your browser saves that basket list so it can show what changed next time.",
    "We do not currently use advertising cookies or visitor tracking tools. If that changes, we will update this page first.",
  ] },
  { h: "Who handles your details for us", p: ["We do not sell your personal details. We share what is needed with companies that run parts of the service. Some of them store or process data outside India:"], list: [
    "Netlify and Render: running the website and its server.",
    "Neon: the database. Our database is hosted in the United States.",
    "Brevo: sending our emails.",
    "WhatsApp and your payment or bank app: when you choose to message us or pay. Their own privacy rules apply.",
    "Government bodies, courts or others, when the law requires it.",
  ] },
  { h: "How long we keep them", p: ["We keep account and plan details while your account is open. Payment records may need to be kept longer for accounts, tax, disputes or the law. One-time codes expire quickly. You can ask us to delete your account. We will delete what we are not required or allowed to keep."] },
  { h: "Your choices and rights", p: ["Email us from your registered address to see, correct or delete your personal details, to withdraw consent, or to raise a privacy complaint. We may check that it is really you. If you withdraw consent for details we need to run your account, we may no longer be able to provide the service. You also have any other rights given to you by Indian data protection law."] },
  { h: "Safety", p: ["We use secure connections, store passwords in scrambled form and limit who can see account details. No online service can promise complete safety. Tell us at once if you think someone else has used your account."] },
  { h: "Children", p: ["This service is only for people aged 18 or older. If you believe a child has given us details, contact us so we can remove them."] },
  { h: "Changes", p: ["If this policy changes, we will update this page and its date. For an important change, we may also email you."] },
];

export default function Privacy() {
  return <LegalPage title="Privacy Policy" path="/privacy" intro="This page explains, in simple words, what 15Stocks by AKNA Capital collects about you and what we do with it." sections={sections} />;
}
