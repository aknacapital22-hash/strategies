import type { EnginePortfolioRow } from "@/lib/engine";

export default function PortfolioTable({ rows }: { rows: EnginePortfolioRow[] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="num w-full min-w-[480px] text-left text-sm">
        <caption className="sr-only">Latest model portfolio</caption>
        <thead>
          <tr className="border-b border-pline text-xs uppercase tracking-wide text-pmuted">
            <th scope="col" className="p-3 font-medium">Stock</th>
            <th scope="col" className="p-3 font-medium">Weight</th>
            <th scope="col" className="p-3 font-medium">Sector</th>
            <th scope="col" className="p-3 text-right font-medium">Last price</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.symbol} className="border-b border-pline last:border-0">
              <th scope="row" className="p-3 font-semibold">{r.symbol}</th>
              <td className="p-3">{r.weight.toFixed(2)}%</td>
              <td className="p-3 text-pmuted">{r.sector ?? "-"}</td>
              <td className="p-3 text-right text-pmuted">{r.price ? `₹${r.price.toLocaleString("en-IN")}` : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
