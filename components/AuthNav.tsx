import Link from "next/link";
import { getUser } from "@/lib/auth/session";

/** Header account area. Server component: the signed-in state comes from the session cookie. */
export async function AuthNav() {
  const user = await getUser();
  return user ? (
    <>
      {user.role === "admin" && <Link href="/admin" className="hidden px-3 text-sm font-semibold text-aink hover:underline sm:block">Admin</Link>}
      <Link href="/account" className="hidden items-center gap-2 rounded-full border border-pline px-3 py-1.5 text-sm font-medium sm:inline-flex" aria-label={`My account, ${user.name}`}>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-aink/15 text-xs font-bold text-aink" aria-hidden>{user.name.charAt(0).toUpperCase()}</span>
        {user.name.split(" ")[0]}
      </Link>
    </>
  ) : (
    <>
      <Link href="/login" className="hidden px-3 text-sm font-medium text-pmuted hover:text-ptext sm:block">Log in</Link>
      <Link href="/signup" className="btn btn-primary hidden !py-2 sm:inline-flex">Sign up</Link>
    </>
  );
}

export async function AuthNavMobile() {
  const user = await getUser();
  return user ? (
    <>
      <Link href="/account" className="btn btn-primary">My account</Link>
      {user.role === "admin" && <Link href="/admin" className="btn btn-ghost">Admin panel</Link>}
    </>
  ) : (
    <>
      <Link href="/signup" className="btn btn-primary">Sign up</Link>
      <Link href="/login" className="btn btn-ghost">Log in</Link>
    </>
  );
}
