"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { HINT_COOKIE } from "@/lib/viewerHint";

const read = () => document.cookie.split("; ").find((c) => c.startsWith(`${HINT_COOKIE}=`))?.slice(HINT_COOKIE.length + 1) ?? "";
// Cookies send no change events. Logging in or out moves to another page, and the focus check covers other tabs.
function subscribe(changed: () => void) {
  window.addEventListener("focus", changed);
  return () => window.removeEventListener("focus", changed);
}

/** Who the browser says is signed in, or null. `key` changes with every log-in. For display only. */
export function useViewerHint(): { key: string; name: string; admin: boolean } | null {
  usePathname(); // read again after each navigation
  const raw = useSyncExternalStore(subscribe, read, () => "");
  // Reads the cookie itself: during hydration `raw` is still the server's empty value, which must not unhide anything.
  useEffect(() => { document.documentElement.classList.toggle("signed-in", read() !== ""); }, [raw]);
  if (!raw) return null;
  try {
    const [name, admin] = JSON.parse(decodeURIComponent(raw));
    return { key: raw, name: String(name), admin: admin === 1 };
  } catch {
    return null;
  }
}
