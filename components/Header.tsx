"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

const nav = [
  { label: "Product", href: "/product" },
  { label: "Strategies", href: "/strategies" },
  { label: "My baskets", href: "/portfolios" },
  { label: "Pricing", href: "/pricing" },
  { label: "Learn", href: "/learn" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

// The theme lives on <html data-theme>; subscribe to it so the toggle icon is right on first paint.
function subscribeTheme(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}
const getTheme = () => document.documentElement.dataset.theme === "dark";

export default function Header({ auth, authMobile }: { auth: ReactNode; authMobile: ReactNode }) {
  const pathname = usePathname();
  const dark = useSyncExternalStore(subscribeTheme, getTheme, () => false);
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  // The menu is tied to the page it was opened on, so navigating closes it without an effect.
  const open = openFor === pathname;

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", on, { passive: true });
    const raf = requestAnimationFrame(on);
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenFor(null); };
    window.addEventListener("keydown", esc);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [open]);

  function toggleTheme() {
    const next = dark ? "light" : "dark";
    const apply = () => { document.documentElement.dataset.theme = next; };
    // Cross-fade the whole page between themes where the browser can; otherwise switch at once.
    if (document.startViewTransition) document.startViewTransition(apply);
    else apply();
    try { localStorage.setItem("theme", next); } catch {}
  }

  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors ${scrolled || open ? "border-pline bg-page/90" : "border-transparent bg-page/70"}`}>
        <div className="wrap flex h-[68px] items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight" aria-label="AKNA Capital Stock Strategies home">
            <Image src="/logo.svg" alt="" width={40} height={40} unoptimized className="h-10 w-10 shrink-0 rounded-[10px] shadow-sm" />
            <span className="leading-tight">
              AKNA Capital
              <span className="hidden text-[11px] font-medium text-pmuted sm:block">Stock Strategies</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 text-sm font-medium lg:flex" aria-label="Primary">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active(n.href) ? "page" : undefined}
                className={`relative rounded-full px-3.5 py-2 transition-colors ${active(n.href) ? "bg-page3 text-ptext" : "text-pmuted hover:text-ptext"}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
              className="grid h-10 w-10 place-items-center rounded-full border border-pline text-sm text-pmuted transition-colors hover:bg-page3 hover:text-ptext"
            >
              <span aria-hidden>{dark ? "☀" : "☾"}</span>
            </button>
            {auth}
            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-pline hover:bg-page3 lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpenFor(open ? null : pathname)}
            >
              <span className="relative block h-3 w-4" aria-hidden>
                <span className={`absolute left-0 h-0.5 w-4 bg-current transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 top-1.5 h-0.5 w-4 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
                <span className={`absolute left-0 h-0.5 w-4 bg-current transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* A sibling of <header>, not a child: backdrop-filter on the header would make this fixed panel
          size to the 68px header instead of the viewport. */}
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="fixed inset-x-0 bottom-0 top-[68px] z-40 overflow-y-auto bg-page px-[var(--pad)] pb-10 pt-4 lg:hidden">
          <ul className="divide-y divide-[var(--page-line)]">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={active(n.href) ? "page" : undefined} className={`flex items-center justify-between py-4 text-xl font-semibold ${active(n.href) ? "text-aink" : ""}`}>
                  {n.label} <span aria-hidden className="text-pmuted">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 grid gap-3">
            {authMobile}
          </div>
        </nav>
      )}
    </>
  );
}
