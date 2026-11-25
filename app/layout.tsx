import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit, Stack_Sans_Headline, Figtree, Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense } from "react";
import { AuthNav, AuthNavMobile } from "@/components/AuthNav";
import JsonLd from "@/components/JsonLd";
import { SITE_NAME, SITE_URL, INDEXABLE, abs } from "@/lib/site";

// Same families as koshpal.com: Plus Jakarta Sans for text, Outfit for headings and labels,
// Stack Sans Headline for display accents, Figtree and Geist as utilities. Self-hosted by next/font.
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], display: "swap" });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], display: "swap" });
const stack = Stack_Sans_Headline({ variable: "--font-stack", subsets: ["latin"], display: "swap" });
const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"], display: "swap" });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const fontVars = [jakarta, outfit, stack, figtree, geist].map((f) => f.variable).join(" ");

const DESCRIPTION =
  "AKNA Capital Stock Strategies: quant investing through systematic, rules-based strategies. Research risk and track record, and approve rebalances in your own demat.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "AKNA Capital Stock Strategies | Alpha by Design", template: "%s | AKNA Capital Stock Strategies" },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "./" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", title: "AKNA Capital Stock Strategies | Alpha by Design", description: DESCRIPTION, url: "/" },
  twitter: { card: "summary_large_image", title: "AKNA Capital Stock Strategies | Alpha by Design", description: DESCRIPTION },
  // Indexable only when NEXT_PUBLIC_SITE_URL is set (production); dev and previews stay out of search.
  robots: INDEXABLE ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } } : { index: false, follow: false },
};

// Runs before paint so the saved / system theme never flashes the wrong colours.
const themeScript = `document.documentElement.classList.add("js");try{var t=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVars} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", "@id": abs("/#org"), name: SITE_NAME, url: abs("/"), logo: abs("/logo.svg") },
            { "@type": "WebSite", "@id": abs("/#site"), url: abs("/"), name: SITE_NAME, publisher: { "@id": abs("/#org") }, inLanguage: "en-IN" },
          ],
        }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-black">
          Skip to content
        </a>
        {/* Header reads the pathname (a client hook), which needs a Suspense boundary on routes with dynamic params. */}
        <Suspense fallback={<div className="sticky top-0 z-50 h-[68px] border-b border-transparent bg-page/70" aria-hidden />}>
          <Header
            auth={<Suspense fallback={<span className="hidden w-24 sm:block" aria-hidden />}><AuthNav /></Suspense>}
            authMobile={<Suspense fallback={null}><AuthNavMobile /></Suspense>}
          />
        </Suspense>
        <main id="main" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
