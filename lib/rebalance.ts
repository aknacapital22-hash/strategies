// Rebalance quantity calculator. Pure functions, no imports, so it can be unit tested on its own.

export type Target = { symbol: string; weight: number; price: number | null };
export type Held = { symbol: string; qty: number };
export type Action = "BUY" | "SELL" | "HOLD";
export type Line = {
  symbol: string;
  action: Action;
  qty: number; // shares to trade (always positive)
  currentQty: number;
  targetQty: number;
  price: number | null;
  value: number | null; // qty * price
  note?: string;
};
export type Result = {
  lines: Line[];
  investable: number; // capital after the cash buffer
  invested: number; // value of the target shares
  cash: number; // investable - invested (left over from whole-share rounding)
  buyValue: number;
  sellValue: number;
  tradedValue: number;
  missingPrice: string[]; // symbols that need a price before they can be sized
  minCapital: number | null; // smallest capital that buys at least one share of every stock
};

const clean = (s: string) => s.trim().toUpperCase().replace(/\.(NS|BO|NSE|BSE)$/, "").replace(/-EQ$/, "");

/** Parses "SYMBOL qty" lines (space, comma, semicolon or tab separated). Returns the holdings and any line problems. */
export function parseHoldings(text: string): { held: Held[]; errors: string[] } {
  const map = new Map<string, number>();
  const errors: string[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line || line.startsWith("#")) return;
    // Whitespace or ";" separates fields. A bare comma does only when there is no whitespace ("TCS,5"),
    // so "1,000" stays one number.
    let parts = line.split(/[\s;]+/).filter(Boolean).map((x) => x.replace(/,$/, ""));
    if (parts.length === 1 && line.includes(",")) parts = line.split(",").map((x) => x.trim()).filter(Boolean);
    const qty = Number(parts[1]?.replace(/,/g, ""));
    if (parts.length < 2 || Number.isNaN(qty)) {
      if (i === 0 && /symbol|stock|name/i.test(parts[0] ?? "")) return; // header row
      errors.push(`Line ${i + 1}: expected "SYMBOL quantity", got "${line.slice(0, 40)}"`);
      return;
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      errors.push(`Line ${i + 1}: quantity must be a whole number above zero`);
      return;
    }
    const sym = clean(parts[0]);
    if (!/^[A-Z0-9&-]{1,20}$/.test(sym)) {
      errors.push(`Line ${i + 1}: "${parts[0].slice(0, 20)}" is not a valid symbol`);
      return;
    }
    map.set(sym, (map.get(sym) ?? 0) + qty);
  });
  return { held: [...map].map(([symbol, qty]) => ({ symbol, qty })), errors };
}

/**
 * Sizes the basket for `capital` rupees and compares it with what you already hold.
 * Whole shares only: every stock gets floor(target value / price), then leftover cash goes one share at a time
 * to the stock furthest below its target (never past half a share over).
 */
export function computeRebalance(targets: Target[], held: Held[], capital: number, bufferPct: number, priceOverrides: Record<string, number> = {}): Result {
  const cap = Number.isFinite(capital) ? Math.max(0, capital) : 0;
  const buf = Number.isFinite(bufferPct) ? Math.min(Math.max(bufferPct, 0), 50) : 0;
  const investable = cap * (1 - buf / 100);
  const heldMap = new Map(held.map((h) => [h.symbol, h.qty]));
  const wSum = targets.reduce((a, t) => a + t.weight, 0) || 1;

  const rows = targets.map((t) => {
    const price = priceOverrides[t.symbol] > 0 ? priceOverrides[t.symbol] : t.price && t.price > 0 ? t.price : null;
    const tv = (investable * t.weight) / wSum;
    return { t, price, tv, qty: price ? Math.floor(tv / price) : 0 };
  });

  let cash = investable - rows.reduce((a, r) => a + (r.price ? r.qty * r.price : 0), 0);
  for (let guard = 0; guard < 100000; guard++) {
    let best = -1, bestGap = 0;
    rows.forEach((r, i) => {
      if (!r.price || r.price > cash) return;
      const gap = r.tv - r.qty * r.price;
      if (gap >= r.price * 0.5 && gap > bestGap) { best = i; bestGap = gap; }
    });
    if (best < 0) break;
    rows[best].qty += 1;
    cash -= rows[best].price as number;
  }

  const lines: Line[] = [];
  for (const r of rows) {
    const currentQty = heldMap.get(r.t.symbol) ?? 0;
    heldMap.delete(r.t.symbol);
    if (!r.price) {
      lines.push({ symbol: r.t.symbol, action: "HOLD", qty: 0, currentQty, targetQty: 0, price: null, value: null, note: "Enter a price to size this line" });
      continue;
    }
    const delta = r.qty - currentQty;
    lines.push({
      symbol: r.t.symbol,
      action: delta > 0 ? "BUY" : delta < 0 ? "SELL" : "HOLD",
      qty: Math.abs(delta), currentQty, targetQty: r.qty, price: r.price, value: Math.abs(delta) * r.price,
      note: r.qty === 0 ? "Capital too small for one share" : undefined,
    });
  }
  // anything you hold that is no longer in the basket is sold in full
  for (const [symbol, currentQty] of heldMap) {
    const price = priceOverrides[symbol] > 0 ? priceOverrides[symbol] : null;
    lines.push({ symbol, action: "SELL", qty: currentQty, currentQty, targetQty: 0, price, value: price ? currentQty * price : null, note: "Not in this basket any more" });
  }

  const order = { SELL: 0, BUY: 1, HOLD: 2 } as const;
  lines.sort((a, b) => order[a.action] - order[b.action] || (b.value ?? 0) - (a.value ?? 0) || a.symbol.localeCompare(b.symbol));

  const sum = (act: Action) => lines.filter((l) => l.action === act).reduce((a, l) => a + (l.value ?? 0), 0);
  const buyValue = sum("BUY"), sellValue = sum("SELL");
  const invested = rows.reduce((a, r) => a + (r.price ? r.qty * r.price : 0), 0);
  const priced = rows.filter((r) => r.price && r.t.weight > 0);
  const minCapital = priced.length ? Math.max(...priced.map((r) => ((r.price as number) * wSum) / r.t.weight)) / (1 - buf / 100) : null;
  return {
    lines, investable, invested, cash: Math.max(0, cash), buyValue, sellValue,
    tradedValue: buyValue + sellValue,
    missingPrice: [...rows.filter((r) => !r.price).map((r) => r.t.symbol), ...lines.filter((l) => l.price === null && l.action === "SELL").map((l) => l.symbol)],
    minCapital,
  };
}

export const toCsv = (lines: Line[]) =>
  ["symbol,action,quantity,current_quantity,target_quantity,est_price,est_value", ...lines.filter((l) => l.qty > 0).map((l) =>
    [l.symbol, l.action, l.qty, l.currentQty, l.targetQty, l.price?.toFixed(2) ?? "", l.value?.toFixed(2) ?? ""].join(","))].join("\n");

export const toText = (lines: Line[]) =>
  lines.filter((l) => l.qty > 0).map((l) => `${l.action} ${l.symbol} ${l.qty}`).join("\n");

/**
 * Zerodha Kite basket file (same structure Kite's own basket export uses): one entry per order, delivery (CNC),
 * market orders, weight 10000, 20000, ... so Kite keeps our order (sells first, then buys).
 */
export function toKiteBasket(lines: Line[]): string {
  const orders = lines
    .filter((l) => l.qty > 0)
    .map((l, i) => ({
      instrument: { tradingsymbol: l.symbol, exchange: "NSE" },
      tradingsymbol: l.symbol,
      exchange: "NSE",
      weight: (i + 1) * 10000,
      params: {
        validity: "DAY",
        validity_ttl: 1,
        variety: "regular",
        product: "CNC",
        order_type: "MARKET",
        transaction_type: l.action,
        quantity: l.qty,
        disclosed_quantity: 0,
        price: 0,
        trigger_price: 0,
        squareoff: 0,
        stoploss: 0,
        trailing_stoploss: 0,
        gtt: null,
        tags: [] as string[],
        iceberg_legs: 0,
        iceberg_quantity: 0,
        market_protection: 0,
      },
    }));
  return JSON.stringify(orders);
}
