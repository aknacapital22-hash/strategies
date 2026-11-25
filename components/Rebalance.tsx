"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { computeRebalance, parseHoldings, toCsv, toKiteBasket, toText, type Target } from "@/lib/rebalance";

const inr = (n: number, d = 0) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d });
const SAVED = "akna-basket-saved";
const field = "mt-1.5 w-full rounded-xl border border-pline bg-page px-4 py-3 outline-none focus:border-[var(--accent-ink)]";

export default function Rebalance({ basket, asOf, targets, minimum, minimumAmount }: { basket: string; asOf: string; targets: Target[]; minimum: string; minimumAmount: number }) {
  const [capital, setCapital] = useState("");
  const [buffer, setBuffer] = useState(1);
  const [holdText, setHoldText] = useState("");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [acked, setAcked] = useState(false);
  const storeKey = `akna-basket-${basket}`;

  // The basket as you last confirmed it, kept only in this browser, so the next rebalance can show what changed.
  const rawSeen = useSyncExternalStore(
    (cb) => { window.addEventListener("storage", cb); window.addEventListener(SAVED, cb); return () => { window.removeEventListener("storage", cb); window.removeEventListener(SAVED, cb); }; },
    () => { try { return localStorage.getItem(storeKey); } catch { return null; } }, // blocked storage: no change list, calculator still works
    () => null,
  );
  const seen = useMemo<{ asOf: string; w: Record<string, number> } | null>(() => { try { return rawSeen ? JSON.parse(rawSeen) : null; } catch { return null; } }, [rawSeen]);

  const change = useMemo(() => {
    if (!seen || !seen.w) return null;
    const now = Object.fromEntries(targets.map((t) => [t.symbol, t.weight]));
    const added = targets.filter((t) => !(t.symbol in seen.w));
    const removed = Object.keys(seen.w).filter((k) => !(k in now));
    const moved = targets.filter((t) => t.symbol in seen.w && Math.abs(seen.w[t.symbol] - t.weight) >= 0.05);
    return { added, removed, moved, same: seen.asOf === asOf && !added.length && !removed.length && !moved.length };
  }, [seen, targets, asOf]);

  function confirmBasket() {
    const snap = { asOf, w: Object.fromEntries(targets.map((t) => [t.symbol, t.weight])) };
    try { localStorage.setItem(storeKey, JSON.stringify(snap)); window.dispatchEvent(new Event(SAVED)); setAcked(true); } catch { /* storage blocked */ }
  }
  const toggle = (k: string) => setDone((d) => { const n = new Set(d); if (n.has(k)) n.delete(k); else n.add(k); return n; });

  const cap = Number(capital.replace(/,/g, ""));
  const { held, errors } = useMemo(() => parseHoldings(holdText), [holdText]);
  const overrides = useMemo(() => {
    const o: Record<string, number> = {};
    for (const [k, v] of Object.entries(prices)) if (Number(v) > 0) o[k] = Number(v);
    return o;
  }, [prices]);
  const res = useMemo(() => (cap > 0 ? computeRebalance(targets, held, cap, buffer, overrides) : null), [cap, buffer, held, targets, overrides]);

  const trades = res?.lines.filter((l) => l.qty > 0) ?? [];
  const useTargetAsHeld = () => res && setHoldText(res.lines.filter((l) => l.targetQty > 0).map((l) => `${l.symbol} ${l.targetQty}`).join("\n"));

  async function copy() {
    if (!res) return;
    try { await navigator.clipboard.writeText(toText(res.lines)); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked: the CSV button still works */ }
  }
  function save(content: string, type: string, suffix: string) {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const a = document.createElement("a");
    a.href = url; a.download = `${basket.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${suffix}`; a.click();
    URL.revokeObjectURL(url);
  }
  const download = () => res && save(toCsv(res.lines), "text/csv", "rebalance.csv");
  const downloadKite = () => res && save(toKiteBasket(res.lines), "application/json", "kite-basket.json");

  return (
    <div id="rebalance" className="card scroll-mt-32 p-6 md:p-8">
      <p className="eyebrow">Rebalance calculator</p>
      <h3 className="mt-3 text-2xl font-bold">How many shares of each?</h3>
      <p className="mt-2 max-w-2xl text-pmuted">
        Enter the total you want in {basket} and, if you already hold some of it, your current shares. You get exact buy and sell quantities to enter in
        your broker. Minimum investment: <b>{minimum}</b>.
      </p>

      <div className="mt-6 rounded-xl border border-pline p-4 text-sm" data-changes>
        <p className="font-semibold">What changed in the basket</p>
        {!change ? (
          <p className="mt-1 text-pmuted">
            This is your first look at {basket}, so every stock below is new to you. Enter what you hold and you get your buys and sells. After you place the orders, press
            “I have done this rebalance” and next time we will list exactly what was added, removed or re-weighted.
          </p>
        ) : change.same ? (
          <p className="mt-1 text-pmuted">No change since you last confirmed (signal {seen?.asOf}). Nothing new to do unless you hold different shares.</p>
        ) : (
          <div className="mt-2 space-y-2">
            <p className="text-pmuted">Compared with the basket you confirmed on signal {seen?.asOf}. Now: signal {asOf}.</p>
            {change.removed.length > 0 && <p><span className="down font-semibold">▼ Dropped ({change.removed.length}):</span> {change.removed.join(", ")} <span className="text-pmuted">(sell if you hold them)</span></p>}
            {change.added.length > 0 && <p><span className="up font-semibold">▲ Added ({change.added.length}):</span> {change.added.map((t) => `${t.symbol} ${t.weight.toFixed(1)}%`).join(", ")}</p>}
            {change.moved.length > 0 && <p><span className="font-semibold">↕ Weight changed ({change.moved.length}):</span> {change.moved.map((t) => `${t.symbol} ${(seen as NonNullable<typeof seen>).w[t.symbol].toFixed(1)}% → ${t.weight.toFixed(1)}%`).join(", ")}</p>}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="rb-capital" className="text-sm font-medium">Total amount for this basket (₹)</label>
          <input id="rb-capital" inputMode="numeric" value={capital} onChange={(e) => setCapital(e.target.value.replace(/[^\d,]/g, ""))} placeholder="e.g. 500000" className={`num ${field}`} />
          <p className="mt-1 text-xs text-pmuted">Include what you already hold in this basket.</p>

          <label htmlFor="rb-buffer" className="mt-4 block text-sm font-medium">Keep aside for charges and price moves</label>
          <select id="rb-buffer" value={buffer} onChange={(e) => setBuffer(Number(e.target.value))} className={field}>
            {[0, 1, 2, 3, 5].map((b) => <option key={b} value={b}>{b === 0 ? "Nothing" : `${b}% of the amount`}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="rb-held" className="text-sm font-medium">Shares you hold now (optional)</label>
          <textarea
            id="rb-held" rows={6} value={holdText} onChange={(e) => setHoldText(e.target.value)} spellCheck={false}
            placeholder={"One per line: SYMBOL quantity\nRELIANCE 12\nTCS 5"} className={`num ${field} resize-y font-mono text-sm`}
          />
          {errors.length > 0 && (
            <ul role="alert" className="mt-2 space-y-0.5 text-xs down">{errors.slice(0, 4).map((e) => <li key={e}>{e}</li>)}{errors.length > 4 && <li>…and {errors.length - 4} more</li>}</ul>
          )}
        </div>
      </div>

      {!res && <p className="mt-6 rounded-xl bg-page3 p-4 text-sm text-pmuted">Enter an amount to see the quantities.</p>}

      {res && (
        <div className="mt-8" aria-live="polite">
          {cap < minimumAmount && (
            <p role="note" data-min-note className="mb-5 rounded-xl bg-page3 p-4 text-sm">
              The minimum investment for {basket} is <b>{minimum}</b>. Below that, rounding to whole shares moves the weights further from the basket&apos;s targets.
            </p>
          )}
          {res.minCapital !== null && cap < res.minCapital && (
            <p role="note" className="mb-5 rounded-xl bg-[var(--loss-ink)]/10 p-4 text-sm">
              {inr(cap)} is too small to hold at least one share of every stock. You would need about <b>{inr(Math.ceil(res.minCapital))}</b>. Lines marked
              “too small” get no shares.
            </p>
          )}
          {res.missingPrice.length > 0 && (
            <div className="mb-5 rounded-xl bg-page3 p-4 text-sm">
              <p className="font-medium">No price on file for: {res.missingPrice.join(", ")}. Enter today&apos;s price to include them.</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {res.missingPrice.map((s) => (
                  <label key={s} className="text-xs">{s} price (₹)
                    <input inputMode="decimal" value={prices[s] ?? ""} onChange={(e) => setPrices({ ...prices, [s]: e.target.value.replace(/[^\d.]/g, "") })} className={`num ${field} !mt-1 !w-32 !py-2`} />
                  </label>
                ))}
              </div>
            </div>
          )}

          <p className="mb-4 rounded-xl bg-page3 p-4 text-sm" data-summary>
            <b>Your plan:</b> sell {res.lines.filter((l) => l.action === "SELL" && l.qty > 0).length}, buy {res.lines.filter((l) => l.action === "BUY" && l.qty > 0).length}, keep {res.lines.filter((l) => l.action === "HOLD" && l.targetQty > 0).length} as they are.
            Place the sells first, then the buys, and tick each order below as you finish it.
          </p>

          <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["To buy", inr(res.buyValue)],
              ["To sell", inr(res.sellValue)],
              ["Orders to place", String(trades.length)],
              ["Cash left over", inr(res.cash)],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-pline p-4"><dt className="text-xs text-pmuted">{k}</dt><dd className="num mt-1 text-lg font-bold">{v}</dd></div>
            ))}
          </dl>

          <div className="card mt-5 overflow-x-auto">
            <table className="num w-full min-w-[700px] text-left text-sm">
              <caption className="sr-only">Orders to place, sells first</caption>
              <thead>
                <tr className="border-b border-pline text-xs uppercase tracking-wide text-pmuted">
                  <th scope="col" className="p-3 font-medium">Done</th>
                  <th scope="col" className="p-3 font-medium">Action</th>
                  <th scope="col" className="p-3 font-medium">Stock</th>
                  <th scope="col" className="p-3 text-right font-medium">Quantity</th>
                  <th scope="col" className="p-3 text-right font-medium">You hold</th>
                  <th scope="col" className="p-3 text-right font-medium">Target</th>
                  <th scope="col" className="p-3 text-right font-medium">Est. price</th>
                  <th scope="col" className="p-3 text-right font-medium">Est. value</th>
                </tr>
              </thead>
              <tbody>
                {res.lines.map((l) => (
                  <tr key={l.symbol} className={`border-b border-pline last:border-0 ${done.has(`${l.action}:${l.symbol}:${l.qty}`) ? "opacity-50" : ""}`}>
                    <td className="p-3">
                      {l.qty > 0 ? <input type="checkbox" aria-label={`${l.action} ${l.symbol} done`} checked={done.has(`${l.action}:${l.symbol}:${l.qty}`)} onChange={() => toggle(`${l.action}:${l.symbol}:${l.qty}`)} className="h-4 w-4" /> : null}
                    </td>
                    <td className="p-3 font-semibold">
                      {l.action === "BUY" ? <span className="up">▲ BUY</span> : l.action === "SELL" ? <span className="down">▼ SELL</span> : <span className="text-pmuted">HOLD</span>}
                    </td>
                    <th scope="row" className="p-3 font-semibold">{l.symbol}{l.note && <span className="ml-2 text-xs font-normal text-pmuted">{l.note}</span>}</th>
                    <td className="p-3 text-right font-bold">{l.qty > 0 ? l.qty.toLocaleString("en-IN") : "-"}</td>
                    <td className="p-3 text-right text-pmuted">{l.currentQty.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right text-pmuted">{l.targetQty.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right text-pmuted">{l.price ? inr(l.price, 2) : "-"}</td>
                    <td className="p-3 text-right text-pmuted">{l.value ? inr(l.value) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-primary" onClick={copy} disabled={trades.length === 0}>{copied ? "Copied ✓" : "Copy order list"}</button>
            <button type="button" className="btn btn-ghost" onClick={downloadKite} disabled={trades.length === 0}>Download Zerodha basket (JSON)</button>
            <button type="button" className="btn btn-ghost" onClick={download} disabled={trades.length === 0}>Download CSV</button>
            <button type="button" className="btn btn-ghost" onClick={useTargetAsHeld}>Use the target as my holdings</button>
            <span className="text-xs text-pmuted">{done.size > 0 && trades.length > 0 ? `${Math.min(done.size, trades.length)} of ${trades.length} done · ` : ""}{trades.length} order{trades.length === 1 ? "" : "s"} · sells first, then buys</span>
          </div>

          <div className="mt-5 rounded-xl border border-pline p-4 text-sm">
            <p className="text-pmuted">After your orders are filled, confirm so we remember this basket and show you only the changes next time. “Use the target as my holdings” fills the box above with what you should now own.</p>
            <button type="button" className="btn btn-primary mt-3 !min-h-0 !py-2" onClick={confirmBasket}>{acked ? "Saved ✓" : "I have done this rebalance"}</button>
          </div>

          <details className="mt-5 rounded-xl border border-pline p-4 text-sm">
            <summary className="flex cursor-pointer items-center justify-between gap-3 font-semibold">
              How to upload the basket in Zerodha Kite <span className="plus text-xl font-normal text-pmuted" aria-hidden>+</span>
            </summary>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-pmuted">
              <li>Click <b className="text-ptext">Download Zerodha basket (JSON)</b> above and save the file.</li>
              <li>Log in to Kite, open <b className="text-ptext">Orders</b>, then the <b className="text-ptext">Baskets</b> tab.</li>
              <li>Choose the option to <b className="text-ptext">upload or import a basket</b> and select the file you saved. Menu names can differ, so use Kite&apos;s help if you do not see it.</li>
              <li>Check every line: stock, buy or sell, and quantity. The file uses <b className="text-ptext">delivery (CNC) market orders</b>, so change any order to a limit order if you prefer.</li>
              <li>Make sure you have the funds for the buys. Sells are listed first, and sale proceeds may not be usable for buys straight away.</li>
              <li>Press <b className="text-ptext">Execute</b>, then check the order book to confirm each order was filled.</li>
            </ol>
            <p className="mt-3 text-xs text-pmuted">
              Kite rejects a name it does not recognise or cannot trade (for example a symbol that changed or a stock under a trading restriction). Fix or remove
              those lines in Kite and place them by hand. You stay in control: nothing is placed until you press Execute.
            </p>
          </details>
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-pmuted">
            Prices are the last close on {asOf}. Check live prices when you place orders, as quantities can shift. Brokerage, STT, exchange charges and GST are
            extra. A calculation to help you place your own orders, not a recommendation. Nothing is sent to your broker.
          </p>
        </div>
      )}
    </div>
  );
}
