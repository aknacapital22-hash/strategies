"use client";

import Link from "next/link";
import { useViewerHint } from "./useViewerHint";

/** Header account area. Reads the hint cookie in the browser, so showing it costs no server call. */
export function AuthNav() {
  const user = useViewerHint();
  return user ? (
    <>
      {user.admin && <Link href="/admin" className="hidden px-3 text-sm font-semibold text-aink hover:underline sm:block">Admin</Link>}
      <Link href="/account" className="hidden items-center gap-2 rounded-full border border-pline px-3 py-1.5 text-sm font-medium sm:inline-flex" aria-label={`My account, ${user.name}`}>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-aink/15 text-xs font-bold text-aink" aria-hidden>{user.name.charAt(0).toUpperCase()}</span>
        {user.name}
      </Link>
    </>
  ) : (
    <span className="anon-only contents">
      <Link href="/login" className="hidden px-3 text-sm font-medium text-pmuted hover:text-ptext sm:block">Log in</Link>
      <Link href="/signup" className="btn btn-primary hidden !py-2 sm:inline-flex">Sign up</Link>
    </span>
  );
}

export function AuthNavMobile() {
  const user = useViewerHint();
  return user ? (
    <>
      <Link href="/account" className="btn btn-primary">My account</Link>
      {user.admin && <Link href="/admin" className="btn btn-ghost">Admin panel</Link>}
    </>
  ) : (
    <>
      <Link href="/signup" className="btn btn-primary">Sign up</Link>
      <Link href="/login" className="btn btn-ghost">Log in</Link>
    </>
  );
}
