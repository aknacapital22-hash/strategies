import type { EnginePortfolioRow } from "@/lib/engine";

export default function PortfolioTable({ rows }: { rows: EnginePortfolioRow[] }) {
  return (
    <div className="card overflow-x-auto">
      <table className="num w-full min-w-[480px] text-left text-sm">
        <caption className="sr-only">What is in the basket now</caption>
        <thead>
          <tr className="border-b border-pline text-xs uppercase tracking-wide text-pmuted">
            <th scope="col" className="p-3 font-medium">Share</th>
            <th scope="col" className="p-3 font-medium">Share of your money</th>
            <th scope="col" className="p-3 font-medium">Industry</th>
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
