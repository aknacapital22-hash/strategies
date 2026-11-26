import IndexFinder from "@/components/IndexFinder";
import { QUIZ_SLUGS } from "@/lib/quiz";
import { strategies } from "@/lib/strategies";
import { cardData } from "@/lib/cards";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs, graph, pageMeta, webPage } from "@/lib/seo";

const TITLE = "Which Stock Basket Should You Look At First?";
const DESCRIPTION = "Answer three easy questions and get a stock basket to look at first, based on your goal and how much risk you can handle. No sign-up needed.";
export const metadata = pageMeta({ title: TITLE, description: DESCRIPTION, path: "/start" });

export default function Start() {
  return (
    <div className="wrap py-10 md:py-14">
      <JsonLd data={graph(webPage("WebPage", TITLE, DESCRIPTION, "/start"), breadcrumbs(["Help me choose", "/start"]))} />
      <div className="text-center">
        <p className="eyebrow">3 taps</p>
        <h1 className="h1 mx-auto mt-4 !text-[clamp(1.75rem,3.4vw,2.5rem)]">See which basket suits you</h1>
        <p className="lead mx-auto mt-3 mb-10 max-w-md">Three easy questions. No sign-up. Takes under a minute.</p>
      </div>
      <IndexFinder baskets={strategies.filter((s) => QUIZ_SLUGS.includes(s.slug)).map(cardData)} />
    </div>
  );
}
