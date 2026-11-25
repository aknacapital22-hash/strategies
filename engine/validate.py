"""Safety checks before an automatic rebalance is published. Subscribers trade on this, so when in doubt: stop.

Usage (cwd = app/):  python engine/validate.py <previous results.json> [--data-date-max-age DAYS]
Exit code 0 = safe. Exit code 1 = do not publish (the reasons are printed).
Prints "publish=true" when some basket has a new rebalance signal, otherwise "publish=false".
"""
import argparse, json, os, sys
from datetime import datetime, timedelta, timezone

import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
IST = timezone(timedelta(hours=5, minutes=30))
KEY_SERIES = ["^NSEI", "^CRSLDX", "GOLDBEES.NS", "LIQUIDCASE.NS"]
MIN_COVERAGE = 0.97  # share of all tickers that must have a price on the latest day
# A rebalance replacing more of a basket than this is looked at by a person first. Real rebalances have replaced up to
# 73% of a basket of 10 or more (and 80% of the 5-stock one), so only baskets of 10 or more are held to it.
MAX_SWAPPED = 0.85
MAX_MISSED_DAYS = 35  # after a longer outage a person looks before publishing resumes


def check_prices(raw, now, max_age_days):
    """Problems with the downloaded prices. `raw` is the unadjusted close table, indexed by date."""
    problems = []
    last = raw.index.max().date()
    today = now.date()
    if (today - last).days > max_age_days:
        problems.append(f"latest prices are from {last}, more than {max_age_days} days old")
    # NSE closes at 15:30 IST. Before about 16:00 today's row is a price taken during trading, not a close.
    if last >= today and (now.hour, now.minute) < (16, 0):
        problems.append(f"prices for {last} were taken before the market closed")
    row = raw.iloc[-1]
    coverage = row.notna().mean()
    if coverage < MIN_COVERAGE:
        problems.append(f"only {coverage:.1%} of tickers have a price on {last}")
    for t in KEY_SERIES:
        if t not in raw.columns or pd.isna(row.get(t)):
            problems.append(f"no price for {t} on {last}")
    return problems


def names(result):
    return {p["symbol"] for p in result["portfolio"]}


def check_results(old, new, allow_large_swap=False):
    """Problems with the new results compared with what is already published."""
    problems = []
    if set(old) != set(new):
        problems.append(f"the list of baskets changed: {sorted(set(old) ^ set(new))}")
    for slug in sorted(set(old) & set(new)):
        a, b = old[slug], new[slug]
        rows = b["portfolio"]
        total = sum(p["weight"] for p in rows)
        if not rows or abs(total - 100) > 1:
            problems.append(f"{slug}: weights add up to {total:.1f}")
        if any(not p["price"] or p["price"] <= 0 for p in rows):
            problems.append(f"{slug}: a holding has no price")
        stocks = [p for p in rows if p["symbol"] not in ("LIQUIDCASE", "GOLDBEES")]
        if len(stocks) != b["config"]["holdings"] and not (b["config"]["sleeves"] is None and len(stocks) <= b["config"]["holdings"]):
            problems.append(f"{slug}: {len(stocks)} stocks, expected {b['config']['holdings']}")

        was, now_ = a["schedule"]["lastSignal"], b["schedule"]["lastSignal"]
        if now_ < was:
            problems.append(f"{slug}: the latest signal moved backwards, from {was} to {now_}")
        elif now_ == was:
            if names(a) != names(b):
                problems.append(f"{slug}: stocks changed without a new signal ({sorted(names(a) ^ names(b))}). The price history was revised.")
        else:
            gap = (datetime.fromisoformat(now_) - datetime.fromisoformat(was)).days
            if gap > max(b["schedule"]["everyWeeks"] * 7, MAX_MISSED_DAYS):  # a short gap is caught up automatically
                problems.append(f"{slug}: nothing was published between {was} and {now_}")
            old_stocks = {s for s in names(a) if s not in ("LIQUIDCASE", "GOLDBEES")}
            if len(old_stocks) >= 10 and b["config"]["sleeves"] is not None and not allow_large_swap:
                swapped = len(old_stocks - names(b)) / len(old_stocks)
                if swapped > MAX_SWAPPED:
                    problems.append(f"{slug}: {swapped:.0%} of the stocks would be replaced at once")

        # Rebalances already published must never be rewritten.
        fresh = {c["signal"]: c for c in b["changes"]}
        for c in a["changes"]:
            n = fresh.get(c["signal"])
            if n and (sorted(c["in"]) != sorted(n["in"]) or sorted(c["out"]) != sorted(n["out"])):
                problems.append(f"{slug}: the published rebalance of {c['signal']} would be rewritten")
    return problems


def check_site(results, site):
    """Problems with the website figures, which must describe exactly the portfolios being published."""
    problems = []
    try:
        json.dumps(site, allow_nan=False)  # a failed index download would leave NaN, which breaks the website build
    except ValueError:
        return ["the website figures contain a number that is not a number (NaN)"]
    by = {e["slug"]: e for e in site}
    if set(by) != set(results):
        return [f"the website lists different baskets from the engine: {sorted(set(by) ^ set(results))}"]
    for slug, r in results.items():
        e = by[slug]
        if [h["sym"] for h in e["holdings"]] != [p["symbol"] for p in r["portfolio"]]:
            problems.append(f"{slug}: the website holdings differ from the portfolio")
        if abs(e["cagr"] - r["metrics"]["cagr"]) > 0.005:
            problems.append(f"{slug}: the website return differs from the engine")
        if not e["monthly"] or not e["benchmark"]["monthly"] or e["growth"]["model"] <= 0:
            problems.append(f"{slug}: performance or benchmark figures are missing")
    return problems


def has_new_signal(old, new):
    return any(slug in old and r["schedule"]["lastSignal"] != old[slug]["schedule"]["lastSignal"] for slug, r in new.items())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("previous")
    ap.add_argument("--data-date-max-age", type=int, default=4)  # covers a long weekend
    ap.add_argument("--allow-large-swap", action="store_true", help="after a person has reviewed an unusually large rebalance")
    args = ap.parse_args()
    load = lambda p: json.load(open(p, encoding="utf8"))
    old, new = load(args.previous), load(os.path.join(HERE, "out", "results.json"))
    raw = pd.read_csv(os.path.join(HERE, "data", "close_raw.csv.gz"), index_col=0, parse_dates=True)
    site = load(os.path.join(HERE, "..", "lib", "strategies.json"))
    problems = (check_prices(raw, datetime.now(IST), args.data_date_max_age) + check_results(old, new, args.allow_large_swap)
                + check_site(new, site))
    if problems:
        print("NOT SAFE TO PUBLISH:", file=sys.stderr)
        for p in problems:
            print(" -", p, file=sys.stderr)
        sys.exit(1)
    print("publish=" + str(has_new_signal(old, new)).lower())


if __name__ == "__main__":
    main()
