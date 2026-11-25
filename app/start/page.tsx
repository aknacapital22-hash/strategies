import IndexFinder from "@/components/IndexFinder";

export const metadata = { title: "Index finder", description: "Answer three questions and get a starting strategy that fits your goal and how much risk you can handle.", alternates: { canonical: "/start" } };

export default function Start() {
  return (
    <div className="wrap py-10 md:py-14">
      <div className="text-center">
        <p className="eyebrow">Index finder</p>
        <h1 className="h1 mx-auto mt-4 !text-[clamp(1.75rem,3.4vw,2.5rem)]">Which index is right for me?</h1>
        <p className="lead mx-auto mt-3 mb-10 max-w-md">Three questions, no sign-up. Takes under a minute.</p>
      </div>
      <IndexFinder />
    </div>
  );
}
