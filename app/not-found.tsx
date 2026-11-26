import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="wrap py-20 text-center md:py-28">
      <p className="eyebrow">404</p>
      <h1 className="h1 mt-4">We could not find that page</h1>
      <p className="lead mx-auto mt-4 max-w-md">The link may be old or wrong. Try one of these.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">Go to home</Link>
        <Link href="/strategies" className="btn btn-ghost">See all baskets</Link>
        <Link href="/start" className="btn btn-ghost">See what suits you</Link>
      </div>
    </div>
  );
}
