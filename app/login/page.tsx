import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/Forms";
import { DEMO, demoEnabled } from "@/lib/auth/store";
import { getUser, safeNext } from "@/lib/auth/session";

export const metadata = { title: "Log in", robots: { index: false, follow: false } };

async function Inner({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next) ?? undefined;
  if (await getUser()) redirect(next ?? "/account");
  const demo = !demoEnabled() ? [] : [
    { label: "Subscriber (sees 3 baskets)", email: DEMO.subscriber.email, password: DEMO.subscriber.password },
    { label: "Free user (no subscriptions)", email: DEMO.free.email, password: DEMO.free.password },
    { label: "Admin (requests and users)", email: DEMO.admin.email, password: DEMO.admin.password },
  ];
  return <LoginForm next={next} demo={demo} notice={sp.reset ? "Password updated. Log in with your new password." : undefined} />;
}

export default function Login({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  return (
    <div className="wrap py-10 md:py-14">
      <Suspense fallback={<div className="card mx-auto h-96 max-w-md" aria-busy />}>
        <Inner searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
