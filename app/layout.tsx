import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import "./art.css";
import Spotlight from "@/components/Spotlight";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Suspense, ViewTransition } from "react";
import { AuthNav, AuthNavMobile } from "@/components/AuthNav";
import JsonLd from "@/components/JsonLd";
import { SITE_NAME, SITE_URL, INDEXABLE, abs } from "@/lib/site";
import { HOME_DESCRIPTION, HOME_TITLE, ORG_ID, SITE_ID } from "@/lib/seo";
import { CONTACT_EMAIL } from "@/lib/payment";

// Same families as koshpal.com: Plus Jakarta Sans for text, Outfit for headings and labels. Self-hosted by next/font.
// Only load a family the styles use: each one is another download on a first visit.
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], display: "swap" });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"], display: "swap" });
const fontVars = [jakarta, outfit].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: "%s | 15Stocks" },
  description: HOME_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "./" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", title: HOME_TITLE, description: HOME_DESCRIPTION, url: "/" },
  twitter: { card: "summary_large_image", title: HOME_TITLE, description: HOME_DESCRIPTION },
  // Google Search Console ownership check: set GOOGLE_SITE_VERIFICATION to the code it gives you.
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
  // Indexable only when NEXT_PUBLIC_SITE_URL is set (production); dev and previews stay out of search.
  robots: INDEXABLE ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } } : { index: false, follow: false },
};

// Runs before paint so the saved / system theme never flashes the wrong colours.
const themeScript = `document.documentElement.classList.add("js");if(/(?:^|; )akna_hint=/.test(document.cookie))document.documentElement.classList.add("signed-in");try{var t=localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVars} antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization", "@id": ORG_ID, name: SITE_NAME, alternateName: ["15Stocks", "AKNA Capital"], url: abs("/"), logo: abs("/logo.png"),
              description: HOME_DESCRIPTION, areaServed: "IN",
              contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: CONTACT_EMAIL },
            },
            { "@type": "WebSite", "@id": SITE_ID, url: abs("/"), name: SITE_NAME, alternateName: "15Stocks", description: HOME_DESCRIPTION, publisher: { "@id": ORG_ID }, inLanguage: "en-IN" },
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
            auth={<AuthNav />}
            authMobile={<AuthNavMobile />}
          />
        </Suspense>
        <div className="scroll-thread" aria-hidden />
        <Spotlight />
        <main id="main" className="flex-1">
          <ViewTransition default="page">{children}</ViewTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
