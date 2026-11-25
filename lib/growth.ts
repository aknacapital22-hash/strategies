// Pure helpers with no data import, so client components can use them without bundling strategies.json.
type Monthly = { r: number }[];

/** Compounds monthly model returns into a growth-of-100 series (first point = 100). */
export function growthSeries(s: { monthly: Monthly }): number[] {
  const v = [100];
  for (const m of s.monthly) v.push(v[v.length - 1] * (1 + m.r / 100));
  return v;
}

/** SVG path for a 160x44 log-scale sparkline. */
export function sparkPath(monthly: Monthly): string {
  const v = growthSeries({ monthly });
  const W = 160, H = 44, P = 3;
  const lo = Math.log(Math.min(...v)), hi = Math.log(Math.max(...v));
  return v.map((x, i) => `${i ? "L" : "M"}${((i / (v.length - 1)) * W).toFixed(1)},${(H - P - ((Math.log(x) - lo) / (hi - lo || 1)) * (H - 2 * P)).toFixed(1)}`).join("");
}
