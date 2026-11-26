"use client";

import { useEffect } from "react";

/** The element a "#id" points at. Next can keep an earlier page hidden in the document, so a visible match wins. */
function target(hash: string): HTMLElement | null {
  if (hash.length < 2) return null;
  const all = [...document.querySelectorAll<HTMLElement>(`#${CSS.escape(decodeURIComponent(hash.slice(1)))}`)];
  return all.find((el) => el.getClientRects().length > 0) ?? all[0] ?? null;
}

/** Opens any closed "see more" box around the element. Says whether it had to. */
function openAround(el: HTMLElement): boolean {
  let opened = false;
  for (let node: HTMLElement | null = el; node; node = node.parentElement) {
    if (node instanceof HTMLDetailsElement && !node.open) { node.open = true; opened = true; }
  }
  return opened;
}

/**
 * Takes people to the section a link points at: on arriving from another page (waiting for parts that load late,
 * such as the rebalance panel), and when the target is inside a closed "see more" box, which is opened first.
 */
export default function OpenOnJump() {
  useEffect(() => {
    const show = (hash: string) => {
      const el = target(hash);
      if (el && openAround(el)) el.scrollIntoView();
    };

    // Arriving with a "#section" in the address.
    const arriving = window.location.hash;
    // One scroll is not enough: for a signed-in person the page can blank for a moment while their parts load, which
    // jumps back to the top. So the position is checked until the page has settled.
    let timer = 0;
    const stop = () => window.clearInterval(timer);
    if (arriving) {
      const started = Date.now();
      let lastY = -1;
      let settled = 0;
      timer = window.setInterval(() => {
        const el = target(arriving);
        if (el) openAround(el);
        if (el && el.getClientRects().length > 0) {
          const gap = parseFloat(getComputedStyle(el).scrollMarginTop) + (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0);
          const there = Math.abs(el.getBoundingClientRect().top - gap) < 40 || window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
          settled = there ? settled + 1 : 0;
          // Only when the page is still, so a smooth scroll on its way is not restarted.
          if (!there && window.scrollY === lastY) el.scrollIntoView();
          lastY = window.scrollY;
        } else {
          settled = 0;
        }
        // Done after two seconds in place; given up after ten.
        if (settled >= 10 || Date.now() - started > 10000) stop();
      }, 200);
    }
    // Someone who has started using the page is not pulled back.
    const taken = ["wheel", "touchstart", "pointerdown", "keydown"] as const;
    taken.forEach((t) => window.addEventListener(t, stop, { once: true, passive: true }));

    const onHash = () => show(window.location.hash);
    // Clicking the same link twice does not change the address, so clicks are watched too.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href*='#']");
      if (a instanceof HTMLAnchorElement && a.pathname === window.location.pathname) show(a.hash);
    };
    window.addEventListener("hashchange", onHash);
    document.addEventListener("click", onClick);
    return () => {
      stop();
      taken.forEach((t) => window.removeEventListener(t, stop));
      window.removeEventListener("hashchange", onHash);
      document.removeEventListener("click", onClick);
    };
  }, []);
  return null;
}
