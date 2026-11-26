// Questions and answers, shared by the pages, their structured data and /llms-full.txt.
import { FOUR_QUARTERS, TWELVE_MONTHS, PRICE_LINE, inr, YEAR } from "./pricing";

export const HOME_FAQS: [string, string][] = [
  ["What is a basket?", "A ready-made list of shares picked by fixed rules. Most have up to 15 shares. Some also have a debt fund or gold fund. You do not choose shares one by one. You just follow the list."],
  ["I know very little about shares. Can I use this?", "Yes, you can read every page in simple words. Remember that shares go up and down. Use only money you can leave for some years and can bear to see fall. If you are not sure, talk to a SEBI registered adviser first."],
  ["Do you keep my money or shares?", "No. You buy in your own share app, and your shares stay in your own account."],
  ["Will my money surely grow?", "No one can promise that. Our growth numbers come from old prices, not real money. The future can be much worse, and you can lose money."],
  ["Do you buy and sell for me?", "No. We show you what to buy and sell, and work out how many. You place the orders yourself, so you stay in charge."],
  ["Can I stop when I want?", "Yes. There is no lock-in and no auto-payment. Your shares are already in your own account."],
];

export const PRICING_FAQS: [string, string][] = [
  ["How do I pay?", "Pick a basket and a plan. Pay by UPI to the ID on the next page, and send us the payment screenshot on WhatsApp. We check it ourselves, so it takes a little while. Then your plan is switched on."],
  ["What do I get?", `One basket costs ${PRICE_LINE}. You see what is inside that basket, find out how many to buy or sell, and can download a file for your share app.`],
  ["Which plan costs the least?", `The yearly plan, at ${YEAR}. Paying monthly 12 times costs ${inr(TWELVE_MONTHS)}, and paying every 3 months costs ${inr(FOUR_QUARTERS)} a year.`],
  ["Do you take a cut of my money?", "No. Our price is fixed. We take nothing extra from what you buy, sell or invest. Your share app's charges and government taxes are separate."],
  ["What happens when my plan ends?", "You can no longer see inside the basket. Your shares stay in your own account. You can renew in the last 15 days or any time later, and you do not lose days you paid for."],
  ["Is it worth it for a small amount?", "The price is the same for any amount, so it matters more when you invest less. The chart shows how big the price is next to your money. Please check it before you pay."],
];
