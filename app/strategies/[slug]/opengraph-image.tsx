import { strategies } from "@/lib/strategies";
import { aboutBasket } from "@/lib/plain";
import { OG_SIZE, shareImage } from "@/lib/og";

export const alt = "A rules-based share basket from 15Stocks by AKNA Capital";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return strategies.map((s) => ({ slug: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = strategies.find((x) => x.slug === slug);
  return shareImage("Rules-based share basket", s?.name ?? "15Stocks", s ? aboutBasket(s.slug) : "");
}
