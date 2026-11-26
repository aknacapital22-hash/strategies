import LegalPage, { type LegalSection } from "@/components/LegalPage";
import { PRICE_LINE } from "@/lib/pricing";
import { PAYEE_NAME, UPI_ID } from "@/lib/payment";
import { pageMeta } from "@/lib/seo";
import { RESEARCH_LINE } from "@/lib/research";

export const metadata = pageMeta({ title: "Terms and Conditions", description: "The rules for using 15Stocks by AKNA Capital: plans, payment, what we do and do not do, and risks.", path: "/terms" });

const sections: LegalSection[] = [
  { h: "1. Agreeing to these terms", p: ["By creating an account, paying for a plan or using this website, you agree to these terms and the Refunds and Cancellation policy. Please also read the Privacy Policy and the Risks page. If you do not agree, please do not use the service."] },
  { h: "2. Who can use it", p: ["You must be at least 18 years old and able to make a legal agreement in India. Give correct details and keep your password and email codes private. Your account is for you only."] },
  { h: "3. What the service is", p: [
    "We show ready-made lists of shares (baskets) that are chosen by fixed rules, with results from testing those rules on old prices, list updates and a calculator.",
    `${RESEARCH_LINE} See the Research Analyst Details page.`,
    "We do not give advice made for you personally, and nothing here says that a share or basket is right for your own situation. The 3-question tool only points to a basket to read about. If you are not sure, speak to a SEBI registered investment adviser before you invest.",
    "We do not hold your money or shares, connect to your share account or place orders. You decide whether to buy or sell, and you place every order yourself.",
  ] },
  { h: "4. No promise of growth", p: ["We do not promise or guarantee any profit, return or protection from loss. Results from old prices are not real money results. Your result can be very different, and you can lose some or all of your money. Please read the Risks page."] },
  { h: "5. Plans and payment", list: [
    `Plans are for one basket each: ${PRICE_LINE}. The price saved with your request is the price for that request. Your share app's charges and taxes on your trades are separate.`,
    `Payment is by UPI to ${PAYEE_NAME} (${UPI_ID}), as shown on the payment page. Check the name and ID before paying.`,
    "We check payments by hand, so access does not start at once. Your plan days start when we switch your plan on.",
    "There is no automatic payment or automatic renewal. If you renew while a plan is active, the new days are added after the days you have left.",
    "We may change prices for future requests.",
  ] },
  { h: "6. Cancelling and refunds", p: ["Please read the Refunds and Cancellation policy. It forms part of these terms."] },
  { h: "7. Emails and messages", p: ["We send one-time codes and, for active plans, list update emails. Delivery can be late or fail, for example because of spam filters or a service problem. Check the website for the latest list. We may also contact you by email or WhatsApp about your account or payment."] },
  { h: "8. Fair use", p: ["You may use what you see only for your own personal investing decisions. Do not share, resell, copy or publish paid lists or other content; share your login; collect data from the site by automated means; try to get into parts you are not allowed to use; or use the service for anything unlawful. We may suspend or close an account that breaks these terms."] },
  { h: "9. Accuracy and availability", p: ["Prices and company data come from outside sources and may be late, missing or wrong. Calculations may contain errors. Check current prices and your orders before placing them. The website may sometimes be unavailable. We may change or stop a basket or a feature. If we permanently stop something you have paid for, the Refunds and Cancellation policy explains what happens."] },
  { h: "10. Limit of our responsibility", p: ["As far as the law allows, we are not responsible for investment losses, missed gains or indirect losses arising from your decisions, market changes, outside services or an interruption. As far as the law allows, our total responsibility for a paid plan is limited to the amount you paid for that plan. Nothing in these terms removes any right or responsibility that cannot be removed by law, including your consumer rights."] },
  { h: "11. Ownership", p: ["The website, its text, design, rules and lists belong to us or to those who have allowed us to use them. A plan gives you permission to use them personally while it is active. It does not make you their owner."] },
  { h: "12. Law and disputes", p: ["Indian law applies. Please contact us first so we can try to solve the problem. This does not stop you from going to a court, consumer forum or authority that has the power to hear it."] },
  { h: "13. Changes", p: ["We may update these terms. We will change the date on this page. A change that reduces your rights will not apply backwards to a plan you have already paid for."] },
];

export default function Terms() {
  return <LegalPage title="Terms and Conditions" path="/terms" intro="These are the rules for using 15Stocks by AKNA Capital. We have kept the words simple. Please read them before you pay." sections={sections} />;
}
