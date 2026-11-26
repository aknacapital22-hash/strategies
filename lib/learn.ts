// Learning content for /learn. Educational only, not investment advice.
export type Stop = { title: string; body: string };
export type Path = { id: string; title: string; blurb: string; stops: Stop[] };
export type Note = { title: string; body: string };
export type Topic = { id: string; title: string; blurb: string; notes: Note[] };

export const paths: Path[] = [
  {
    id: "start-here",
    title: "Start here",
    blurb: "New to shares? Begin with these. No finance knowledge needed.",
    stops: [
      { title: "A ready list, made by rules", body: "A basket is a ready-made list of shares. Fixed rules pick them, for example the shares that have been going up the most. You do not have to hunt for shares yourself. The rules cannot see the future. They only tell you what to hold now, and when to look again." },
      { title: "What 'the market' means here", body: "We compare each basket with a standard list of companies, called an index. Nifty 50, for example, is a list of 50 very big companies. It shows how the market did, so you can see whether the basket did better or worse." },
      { title: "What testing on old prices means", body: "We use a basket's rules on old share prices, as if someone had followed them back then. This is called a back test. No real money was used, and it does not promise anything about the future." },
      { title: "What ₹1 lakh would have become", body: "This shows where ₹1 lakh would have reached in that test. Always check how many years it took. Compare it with the market over the same years. A bigger number over more years does not always mean faster growth." },
      { title: "Prices go down too", body: "Money does not grow in a straight line. It can fall a lot, and stay down for months or longer. Every basket page shows its biggest falls. Do read them before you start." },
      { title: "Compare like with like", body: "Each basket is compared with a list that suits it, over the same dates. Comparing small companies with very big ones tells you little, because their prices behave differently." },
      { title: "What is already taken out", body: "The numbers already take out a guess for trading costs. They do not take out our price (₹999 a month, ₹2,799 for 3 months or ₹9,999 a year for one basket), other share-app charges or tax. Your own result also depends on the prices you actually get." },
      { title: "Look at the start date", body: "A test that starts when prices were very low looks better than one that starts when prices were high. See when it started, and whether that time had both good and bad periods." },
      { title: "How much money you need", body: "To follow a basket, you need enough money to buy at least one of each item in about the right amounts. So each basket has its own starting amount, based on today's prices. None is more than ₹2 lakh." },
      { title: "Know what you can handle", body: "Ask yourself two things: how much did it grow, and would I have stayed during its biggest fall? If not, choose a lower-risk basket, or keep this money out of shares." },
    ],
  },
  {
    id: "what-a-return-hides",
    title: "What one big number does not tell you",
    blurb: "Why you should look at more than one percentage.",
    stops: [
      { title: "An average can fool you", body: "Go up 50%, then down 50%. The average is zero, but you have lost 25% of your money. ₹100 becomes ₹150, then ₹75. To compare over many years, use growth per year that builds on itself (called CAGR)." },
      { title: "The journey matters", body: "Two baskets can end at the same amount in very different ways. One may fall 15% on the way and the other 40%. Check the biggest falls and the month-by-month numbers." },
      { title: "One great year can hide a bad one", body: "A basket that gained 90% one year and lost 20% another can still show high yearly growth. Check how much of the gain came from just one or two years." },
      { title: "Does the starting day matter?", body: "We can check every possible starting day, not just one. The worst result shows what could have happened to someone who started at a bad time." },
      { title: "Missing companies", body: "If a test uses only companies that are doing well enough to be listed today, it forgets the ones that failed. That makes the past look better. A fair test also never uses information that was not known on that day." },
      { title: "Rules made to fit the past", body: "If rules are adjusted again and again until the past looks perfect, they often do badly later. Simple rules are more likely to keep working." },
      { title: "Good times may not return", body: "A basket that did well when mid-size company shares were rising fast may not repeat that. No test can tell what kind of market comes next." },
      { title: "Three things to check together", body: "Whenever you see a growth number, also see the biggest fall, the start date and the market it is compared with. If any one is missing, be careful." },
    ],
  },
  {
    id: "cost-stack",
    title: "All the costs, in one place",
    blurb: "Everything that comes out before money reaches you.",
    stops: [
      { title: "Our price", body: "One basket is ₹999 a month, ₹2,799 for 3 months or ₹9,999 a year. The price does not change with how much you invest, so it matters less when you invest more. Buying and selling charges are extra." },
      { title: "Share-app and exchange charges", body: "Your share app (broker) and the stock exchange charge for buying and selling. Each charge is usually small, but it adds up over many shares and many list updates." },
      { title: "Government charges", body: "Buying and selling shares has government charges, such as securities transaction tax and stamp duty. Our test takes out a guess for these." },
      { title: "Price changes while you buy", body: "Some small companies have few buyers and sellers. Your own order can push the price, so you may pay a bit more, or get a bit less, than the test assumed." },
      { title: "Tax on profit", body: "You pay tax when you sell at a profit. The rate depends on how long you held the shares. Frequent list updates can mean more tax on short holdings. Ask a tax expert about current rates." },
      { title: "How often shares change", body: "The more often shares are sold and replaced, the more you pay in charges. So what you keep can be much less than the growth before costs." },
      { title: "Before or after costs?", body: "Always ask this about any growth number. Ours take out estimated trading charges. They do not take out our price or your tax." },
      { title: "Cheapest is not always best", body: "What matters is what you keep after all costs, and how much risk you took. A cheap choice that falls very deeply may still be wrong for you." },
    ],
  },
  {
    id: "factor-primer",
    title: "Why some shares do better",
    blurb: "A few simple ideas behind picking shares by rules.",
    stops: [
      { title: "Signs that rules look for", body: "Rules look for signs that many shares share, such as a low price, a strong company or a recent rise. These signs are called factors." },
      { title: "Shares that are going up", body: "This idea picks shares that have risen over the past few months, and ignores the last few days. It is called momentum. Our rules look at how strong and how steady the rise was." },
      { title: "Steady is better than jumpy", body: "Two shares may rise by the same amount. The one that got there with smaller ups and downs is ranked higher." },
      { title: "Cheap shares", body: "This idea picks shares priced low compared with what the company earns or owns. It is called value. It can do poorly for years and then do very well." },
      { title: "Strong companies", body: "This idea picks companies with steady profit and little debt. It is called quality. Such shares have often held up better when markets fall." },
      { title: "Company size", body: "In the past, smaller companies have often grown more, but with bigger ups and downs, and they can be harder to sell. Our small-company baskets show this in their falls." },
      { title: "Every idea has bad years", body: "No idea works all the time. If you follow one, expect some weak periods." },
      { title: "Too many people doing the same", body: "When too much money follows one idea, it may stop working as well, or even turn the other way. Past success may not continue." },
    ],
  },
  {
    id: "before-you-pick",
    title: "Before you choose a basket",
    blurb: "A short checklist to pick with confidence.",
    stops: [
      { title: "How long can you wait?", body: "Shares can stay below their old high for more than a year. If you need the money within 3 years, a lower-risk basket with a debt fund or gold may suit you better, or keep it out of shares." },
      { title: "First check the biggest fall", body: "Decide how big a fall you can live with. Then look only at baskets within that limit. Look at growth after that." },
      { title: "Compare fairly", body: "A basket of mid-size companies should be compared with the mid-size market. Check each basket's comparison before comparing baskets with each other." },
      { title: "Mixed baskets", body: "Adding a debt fund and gold usually makes the ups and downs smaller. It may also grow less when shares are rising fast. This can suit people who like a calmer ride." },
      { title: "Check your starting amount", body: "With less than the starting amount, your shares will not match the list well, because you can only buy whole shares." },
      { title: "More is not always better", body: "Several similar baskets can hold the same shares again and again. Check what is inside before adding another." },
      { title: "Decide when you will check", body: "Checking at each list update is enough. Checking every day can push you into quick, poor decisions." },
      { title: "Decide when you would stop", body: "Think now about what would make you stop, such as a change in your goals. Do not decide in a panic after a fall." },
    ],
  },
  {
    id: "reading-a-company",
    title: "Understanding a company",
    blurb: "A beginner's tour of the numbers behind a share.",
    stops: [
      { title: "Sales and profit", body: "Sales is the money a company takes in from what it sells. Profit is what is left after costs. Sales going up while profit goes down is a warning." },
      { title: "Profit from each rupee of sales", body: "This is called margin. Compare it with the same company's past and with similar companies." },
      { title: "How well it uses money", body: "Some numbers (called return on equity and return on capital) show how much profit a company makes from the money put into it. Staying high for many years is a good sign." },
      { title: "Debt", body: "Borrowing can help in good times but hurts more in bad times. Check that the company can easily pay its interest." },
      { title: "Real cash", body: "Profit on paper is easier to dress up than cash. If a company shows profit but hardly ever brings in cash, ask why." },
      { title: "Is the share costly?", body: "Some numbers compare the share price with what the company earns or owns. A low number does not always mean a bargain, and a high one does not always mean too costly." },
      { title: "Founders' shares", body: "Check how much the founders own, and whether they have used those shares to borrow money. If they have used a lot, a price fall can force those shares to be sold." },
      { title: "Our rules work differently", body: "Our baskets mainly look at how share prices have moved, not at these company numbers. Still, it helps to know what you own." },
    ],
  },
];

export const topics: Topic[] = [
  {
    id: "returns-and-risk",
    title: "Growth and risk, with numbers",
    blurb: "A few easy sums that help you read any chart.",
    notes: [
      { title: "How growth per year is worked out", body: "It is the steady yearly rate that turns your first amount into your final amount (called CAGR). For example, ₹100 becoming ₹250 in five years is about 20% a year." },
      { title: "Growth compared with ups and downs", body: "One score, called the Sharpe ratio, checks how much extra growth you got for the ups and downs you went through. A higher score is better." },
      { title: "Why a fall is hard to win back", body: "If your money falls 50%, it must then grow 100% to get back. That is why the size of falls matters so much." },
    ],
  },
  {
    id: "factors",
    title: "Ways of picking shares",
    blurb: "More on picking shares that are going up.",
    notes: [
      { title: "Why the last few days are skipped", body: "A share that jumped in the last few days often gives some of it back. Skipping those days helps the rules look at the bigger direction." },
      { title: "Looking at more than one period", body: "Checking 2, 4, 6 and 12 months together means no single period or date decides everything." },
      { title: "Long weak periods", body: "Every way of picking shares has had weak years. The biggest fall in a test is not a limit. A future fall can be bigger." },
    ],
  },
  {
    id: "portfolio-construction",
    title: "How a basket is built",
    blurb: "How many shares, how much in each, and how often they change.",
    notes: [
      { title: "Why up to 15 shares", body: "With 15 shares in equal amounts, each gets about 6.7% of the share money. That is easy to follow and buy. But with fewer shares, one bad share hurts more." },
      { title: "Equal amounts", body: "Giving each share an equal amount means the biggest company does not take over. As prices move, you may need some buying and selling to make them equal again." },
      { title: "How often the list is checked", body: "Checking every week or two reacts faster but means more buying and selling, and more cost. Every four weeks costs less but reacts more slowly." },
    ],
  },
  {
    id: "costs",
    title: "Hidden costs",
    blurb: "Small things that can eat into your growth.",
    notes: [
      { title: "Changing shares costs money", body: "If half the shares are replaced at each update, you pay charges on that half each time. Two baskets that grow the same before costs can leave you with quite different amounts." },
      { title: "Shares with few buyers", body: "If a share is not traded much, your buying can move its price. Our rules try to keep this small, but your real price can still differ." },
      { title: "Tax when you sell", body: "Selling at a profit within a year means short-term tax. Frequent updates can make the money you keep much less than the test shows." },
    ],
  },
  {
    id: "behaviour",
    title: "Common mistakes to avoid",
    blurb: "Mistakes that can cost more than any fee.",
    notes: [
      { title: "Selling in a panic", body: "Many people sell after a fall, which makes the loss permanent. Choose a basket whose falls you can stay calm through, and invest only money you can leave." },
      { title: "Chasing last year's winner", body: "The best one this year may be the one that falls the most next. Check the biggest fall too, not only the growth." },
      { title: "Checking too often", body: "Daily checking can make you nervous and hurried. Checking at each list update is enough." },
    ],
  },
  {
    id: "company-numbers",
    title: "Company words",
    blurb: "Simple meanings of words you may see about shares.",
    notes: [
      { title: "Profit per share", body: "The company's profit divided by its number of shares. Look at it over several years. It is also called earnings per share." },
      { title: "Price compared with profit", body: "The share price divided by profit per share (called price to earnings). It shows how many years of today's profit you are paying for." },
      { title: "Company size", body: "Share price times the number of shares. It is called market value, and it decides whether a company counts as big, medium or small." },
    ],
  },
  {
    id: "personal-finance",
    title: "Your money and tax",
    blurb: "Sort these out before you buy shares.",
    notes: [
      { title: "Keep emergency money first", body: "Keep a few months of expenses somewhere safe and easy to take out. Then you will not have to sell shares after a fall to pay a bill." },
      { title: "Match money to time", body: "Money you need within 3 years should not be in shares. Money you can leave for 10 years or more can better handle ups and downs." },
      { title: "Tax basics", body: "Tax on share profit depends on how long you held the shares. Rates can change in the Budget, so check with a tax expert." },
    ],
  },
  {
    id: "strategy-notes",
    title: "How our baskets work",
    blurb: "What happens behind the list.",
    notes: [
      { title: "The rules in four steps", body: "Start with a big group of shares. Remove those above a price limit. Rank the rest by how strongly and steadily they have been rising. Hold the top 15 or fewer in equal amounts. Then repeat on fixed dates." },
      { title: "No peeking at the future", body: "The rules look at prices at the end of a day, and the test buys and sells at the next day's end price. So the test does not use information from the future." },
      { title: "What the test cannot know", body: "It takes out only a fixed guess for costs. For some groups it compares with a similar market list. And it cannot know what kind of market comes next." },
    ],
  },
];
