import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ title: "Refunds and Cancellation", description: "When 15Stocks by AKNA Capital gives a refund, and how cancelling works.", path: "/refunds" });

const sections: LegalSection[] = [
  { h: "When we give a refund", list: [
    "You paid, but we did not switch your plan on or we rejected your request: a full refund of what we received.",
    "You paid twice for the same plan, or paid more than the price: we refund the extra amount.",
    "We permanently stop a basket during your paid plan: we refund the part for the unused days.",
    "A refund is required by law.",
  ] },
  { h: "When we do not give a refund", p: ["Once your plan is switched on, the fee is not refunded if you change your mind, cancel early, do not use the plan, or are unhappy with market results. Losses on shares are never refunded. This does not limit any right you have under the law."] },
  { h: "Cancelling", p: ["There is no automatic payment, so you do not need to cancel to avoid another charge. Your plan simply ends on its end date. If you choose Cancel in your account, access to that basket stops at once, and unused days are not refunded except as stated above. Your shares remain in your own account."] },
  { h: "How to ask", p: ["Email us from your registered address, if you can within 30 days of the payment or the problem. Send your request ID, payment date, amount and UPI transaction ID. Never send a PIN, password or bank code. We aim to reply within 3 working days. If a refund is approved, we aim to send it within 7 working days to the account used for payment. Your bank may take longer to show it. Asking after 30 days does not remove rights you have under the law."] },
];

export default function Refunds() {
  return <LegalPage title="Refunds and Cancellation" path="/refunds" intro="Please read this before you pay." sections={sections} />;
}
