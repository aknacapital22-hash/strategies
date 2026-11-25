import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SignupForm } from "@/components/auth/Forms";
import { getUser, safeNext } from "@/lib/auth/session";

export const metadata = { title: "Create account", robots: { index: false, follow: false } };

async function Inner({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNext((await searchParams).next) ?? undefined;
  if (await getUser()) redirect(next ?? "/account");
  return <SignupForm next={next} />;
}

export default function Signup({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <div className="wrap py-10 md:py-14">
      <Suspense fallback={<div className="card mx-auto h-[28rem] max-w-md" aria-busy />}>
        <Inner searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
