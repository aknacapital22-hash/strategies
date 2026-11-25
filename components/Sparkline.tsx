import type { Strategy } from "@/lib/strategies";
import { sparkPath } from "@/lib/growth";

/** Tiny log-scale growth line. Decorative; the numbers beside it carry the meaning. */
export default function Sparkline({ s, className = "" }: { s: Pick<Strategy, "monthly">; className?: string }) {
  return <SparkSvg line={sparkPath(s.monthly)} className={className} />;
}

/** Renders a precomputed path, so client components need not receive the monthly series. */
export function SparkSvg({ line, className = "" }: { line: string; className?: string }) {
  return (
    <svg viewBox="0 0 160 44" className={`h-11 w-full ${className}`} preserveAspectRatio="none" aria-hidden>
      <path d={`${line}L160,44L0,44Z`} fill="var(--gain-ink)" opacity=".1" />
      <path d={line} fill="none" stroke="var(--gain-ink)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  );
}
