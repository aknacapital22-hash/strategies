import { growthSeries } from "@/lib/growth";

/**
 * Hero artwork drawn from real data: every strategy's model growth of 100 on one shared log scale, so they all
 * leave from the same point and fan out. Server-rendered and decorative (hidden from screen readers).
 */
export default function GrowthArt({ series, lead }: { series: { slug: string; monthly: { r: number }[] }[]; lead: string }) {
  const W = 1000, H = 420, P = 12;
  const all = series.map((s) => ({ slug: s.slug, v: growthSeries(s) }));
  const longest = Math.max(...all.map((s) => s.v.length));
  const flat = all.flatMap((s) => s.v);
  const lo = Math.log(Math.min(...flat)), hi = Math.log(Math.max(...flat));

  // A smooth curve through every monthly point (Catmull-Rom as cubic Béziers).
  const path = (v: number[]) => {
    const pts = v.map((n, i) => [((i + longest - v.length) / (longest - 1)) * W, H - P - ((Math.log(n) - lo) / (hi - lo || 1)) * (H - 2 * P)]);
    const f = (n: number) => n.toFixed(1);
    return pts.slice(1).reduce((d, p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[i], e = pts[Math.min(pts.length - 1, i + 2)];
      return `${d}C${f(b[0] + (p[0] - a[0]) / 6)},${f(b[1] + (p[1] - a[1]) / 6)} ${f(p[0] - (e[0] - b[0]) / 6)},${f(p[1] - (e[1] - b[1]) / 6)} ${f(p[0])},${f(p[1])}`;
    }, `M${f(pts[0][0])},${f(pts[0][1])}`);
  };

  // The highlighted strategy is painted last so it sits on top.
  const ordered = [...all].sort((a, b) => Number(a.slug === lead) - Number(b.slug === lead));

  return (
    <svg className="art" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="art-ink" x1="0" x2={W} y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0f766e" />
          <stop offset=".6" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#d9a520" />
        </linearGradient>
      </defs>
      {ordered.map((s, i) => (
        <g key={s.slug} style={{ "--d": `${i * 90}ms` } as React.CSSProperties}>
          <path d={path(s.v)} stroke="url(#art-ink)" strokeWidth={s.slug === lead ? 2.2 : 1} opacity={s.slug === lead ? 0.65 : 0.17 + (i % 4) * 0.05} />
        </g>
      ))}
    </svg>
  );
}
