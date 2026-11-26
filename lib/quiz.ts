// The baskets the 3-question quiz can suggest. Kept here so server pages and the browser quiz can both read it.
export const QUIZ = {
  hybrid: { slug: "largecap-hybrid", why: "Large company shares plus a debt fund, which usually moves much less than shares." },
  multi: { slug: "largemid-multi-asset", why: "Shares, a debt fund and a gold fund, so your money is spread out." },
  focused: { slug: "focused-largecap-15", why: "Up to 15 shares picked from India's 100 largest companies." },
  allcap: { slug: "allcap", why: "Shares of large, medium and small companies, for people who can wait many years. Expect bigger ups and downs." },
};

/** So that only these baskets' figures need to reach the browser. */
export const QUIZ_SLUGS = Object.values(QUIZ).map((x) => x.slug);
