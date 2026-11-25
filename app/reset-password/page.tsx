import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { ResetForm } from "@/components/auth/Forms";
import { resetTokenValid } from "@/lib/auth/store";

export const metadata = { title: "Reset password", robots: { index: false, follow: false } };

async function Inner({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  await connection(); // token expiry reads the clock, so this must run at request time
  if (!token || !resetTokenValid(token)) {
    return (
      <div className="card mx-auto max-w-md space-y-4 p-8 md:p-10">
        <h1 className="text-3xl font-bold">Link not valid</h1>
        <p className="text-pmuted">This reset link is invalid, already used, or has expired.</p>
        <Link href="/forgot-password" className="btn btn-primary">Request a new link</Link>
      </div>
    );
  }
  return <ResetForm token={token} />;
}

export default function ResetPassword({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  return (
    <div className="wrap py-10 md:py-14">
      <Suspense fallback={<div className="card mx-auto h-80 max-w-md" aria-busy />}>
        <Inner searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
