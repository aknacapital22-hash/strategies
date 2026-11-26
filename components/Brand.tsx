import Image from "next/image";

/** The logo mark with the name, and the company in small letters under it. The mark has a version for each theme. */
export default function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <Image src="/logo-mark-sm.png" alt="" width={46} height={35} unoptimized className="logo-light h-[35px] w-auto shrink-0" />
      <Image src="/logo-mark-dark-sm.png" alt="" width={46} height={35} unoptimized className="logo-dark h-[35px] w-auto shrink-0" />
      <span className="leading-none">
        <span className="block text-[19px] font-extrabold tracking-tight text-ptext">15<span className="text-aink">Stocks</span></span>
        <span className="mt-1 block text-[10px] font-medium tracking-wide text-pmuted">by AKNA Capital</span>
      </span>
    </span>
  );
}
