// Shared search and sharing metadata, plus schema.org builders.
import type { Metadata } from "next";
import { SITE_NAME, abs } from "./site";

export const HOME_TITLE = "15Stocks by AKNA Capital: Rules-Based Stock Baskets in India";
export const HOME_DESCRIPTION =
  "Rules-based stock baskets for Indian investors. See what to buy and sell, check past returns and risks, and place orders in your own demat account.";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  /** True when the route folder has its own opengraph-image file, which Next adds by itself. */
  ownImage?: boolean;
};

// Next merges metadata shallowly: a page that sets openGraph replaces the layout's whole object, and a page that
// does not set it shows the home page's title and URL. So every public page sets the complete object here.
export function pageMeta({ title, description, path, ownImage }: PageMeta): Metadata {
  const images = ownImage ? {} : { images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${SITE_NAME}: systematic investing for wealth creation` }] };
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", url: path, title, description, ...images },
    twitter: { card: "summary_large_image", title, description, ...images },
  };
}

export const ORG_ID = abs("/#org");
export const SITE_ID = abs("/#site");

/** A breadcrumb trail. Home is added for you. */
export const breadcrumbs = (...trail: [name: string, path: string][]) => ({
  "@type": "BreadcrumbList",
  itemListElement: ([["Home", "/"], ...trail] as [string, string][]).map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(path) })),
});

export const webPage = (type: string, name: string, description: string, path: string) => ({
  "@type": type, "@id": abs(`${path}#page`), url: abs(path), name, description, inLanguage: "en-IN",
  isPartOf: { "@id": SITE_ID }, publisher: { "@id": ORG_ID },
});

export const faqPage = (items: [string, string][]) => ({
  "@type": "FAQPage",
  mainEntity: items.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});

export const graph = (...nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });

/** "23 Nov 2026" (the engine's date format) as "2026-11-23". */
export const isoDate = (d: string) => new Date(`${d} UTC`).toISOString().slice(0, 10);
