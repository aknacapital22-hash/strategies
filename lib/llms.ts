// Plain-text versions of the public site for language models: /llms.txt (a map) and /llms-full.txt (the content).
// Built from the same data as the pages, so the two cannot drift apart.
// Public information only: never add holdings, sectors or rebalance changes here, as subscribers pay for those.
import { DATA_AS_OF, strategies, pct } from "./strategies";
import { sorted } from "./blog";
import { paths, topics } from "./learn";
import { HOME_FAQS, PRICING_FAQS } from "./faqs";
import { PRICE_LINE, RETURNS_NOTE } from "./pricing";
import { PAST_NOTE, WORDS, aboutBasket, duration, howOften, kindWord, lakh, riskWord } from "./plain";
import { HOME_DESCRIPTION } from "./seo";
import { CONTACT_EMAIL } from "./payment";
import { SITE_NAME, abs } from "./site";

const list = () => [...strategies].sort((a, b) => a.name.localeCompare(b.name));

const intro = () => `# ${SITE_NAME}

> ${HOME_DESCRIPTION}

Key facts about this site, to keep with any answer about it:

- A "basket" is a ready-made list of shares, sometimes with a debt fund or gold fund, chosen by fixed rules.
- Users place orders themselves with their own broker. Shares stay in their own demat account.
- AKNA Capital is a technology company. It is not registered with SEBI as an investment adviser or research analyst. Content is educational and is not investment advice.
- Every return figure is a back test: the rules applied to past prices, with no real money invested. It is not a live track record or a promise. Investors can lose money.
- The tests use the companies in each index today, which makes past results look better than they would really have been (survivorship bias).
- ${RETURNS_NOTE}
- Each basket is tested over its own period, so compare periods before comparing figures.
- Past data runs up to ${DATA_AS_OF}.
- Price: ${PRICE_LINE} for one basket.
- Contact: ${CONTACT_EMAIL}
`;

const link = (title: string, path: string, note: string) => `- [${title}](${abs(path)}): ${note}`;

export const llmsIndex = () => `${intro()}
## Main pages

${[
  link("All baskets", "/strategies", "every basket with its back-tested results, risk level and starting amount"),
  link("How it works", "/product", "the six steps from choosing a basket to placing orders"),
  link("Pricing", "/pricing", "plans, costs and pricing questions"),
  link("Help me choose", "/start", "a three-question finder"),
  link("Learn", "/learn", "short lessons and definitions of money words"),
  link("About", "/about", "the company"),
].join("\n")}

## Baskets

${list().map((s) => link(s.name, `/strategies/${s.slug}`, `${aboutBasket(s.slug)} Risk: ${riskWord(s.risk).toLowerCase()}. Biggest fall in the back test: ${pct(s.maxDd)}.`)).join("\n")}

## Articles

${sorted().map((p) => link(p.title, `/blog/${p.slug}`, p.description)).join("\n")}

## Optional

${link("Full text", "/llms-full.txt", "basket figures, questions and answers, definitions, lessons and articles in one file")}
`;

const basket = (s: (typeof strategies)[number]) => {
  const g = s.growth!;
  const b = s.benchmark;
  return `### ${s.name}

Page: ${abs(`/strategies/${s.slug}`)}
${aboutBasket(s.slug)} Holds: ${kindWord(s.kind)}. The list is checked ${howOften(s.universe)}.
Risk level: ${riskWord(s.risk)}. Starting amount: ${s.minimum} (L means lakh, K means thousand rupees).

| Back test, ${g.start} to ${g.end} (${duration(g.start, g.end)}) | ${s.name} | ${b.name} index |
| --- | --- | --- |
| ₹1 lakh would have become | ${lakh(g.model)} | ${lakh(b.growth)} |
| Growth per year (CAGR) | ${pct(s.cagr)} | ${pct(b.cagr)} |
| Biggest fall (max drawdown) | ${pct(s.maxDd)} | ${pct(b.maxDd)} |
${b.note ? `\nAbout the index: ${b.note}\n` : ""}
Return in each calendar year: ${s.calendar.map((c) => `${c.year}${c.note ? ` (${c.note})` : ""} ${pct(c.ret)}`).join("; ")}.
`;
};

const qa = (items: [string, string][]) => items.map(([q, a]) => `### ${q}\n\n${a}`).join("\n\n");

const lesson = (title: string, blurb: string, items: { title: string; body: string }[]) =>
  `### ${title}\n\n${blurb}\n\n${items.map((x) => `- **${x.title}:** ${x.body}`).join("\n")}`;

export const llmsFull = () => `${intro()}
## Baskets (past-data results)

${PAST_NOTE}

${list().map(basket).join("\n")}
## Common questions

${qa(HOME_FAQS)}

## Pricing questions

${qa(PRICING_FAQS)}

## Money words

${WORDS.map(([w, d]) => `- **${w}:** ${d}`).join("\n")}

## Lessons

Page: ${abs("/learn")}

${[...paths.map((p) => lesson(p.title, p.blurb, p.stops)), ...topics.map((t) => lesson(t.title, t.blurb, t.notes))].join("\n\n")}

## Articles

${sorted().map((p) => `### ${p.title}\n\nPage: ${abs(`/blog/${p.slug}`)} (published ${p.date})\n\n${p.intro}\n\n${p.sections.map((s) => `#### ${s.h}\n\n${s.p.join("\n\n")}`).join("\n\n")}`).join("\n\n")}
`;

/** Served as plain text. Kept out of Google's results so it never competes with the real pages. */
export const textResponse = (body: string) => new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" } });
