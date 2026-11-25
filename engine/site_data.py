"""Runs the engine and rebuilds everything the website shows from that one run.

Usage (cwd = app/, after fetch_data.py and fetch_indices.py):  python engine/site_data.py
Writes engine/out/results.json (portfolios) and lib/strategies.json (performance, holdings, text).
No figure on the site comes from anywhere else. Name, kind and risk label are kept as written in lib/strategies.json.
"""
import importlib.util, json, os, re, runpy
import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, "..", "lib", "strategies.json")
FUNDS = {"LIQUIDCASE": "Debt", "GOLDBEES": "Gold"}


def day(d):
    d = pd.Timestamp(d)
    return f"{d.day} {d:%b %Y}"


def minus(x, digits=2):
    return f"{x:.{digits}f}".replace("-", "−")


def drawdown_episodes(nav, top=5):
    """The deepest falls on week-end values: from a high to the week it is regained."""
    wk = nav.resample("W").last().dropna()
    last = nav.index[-1]
    out, peak, peak_at, low = [], wk.iloc[0], wk.index[0], 0.0
    for when, v in wk.items():
        if v >= peak:
            if low < 0:
                out.append(dict(depth=low, when=f"{day(peak_at)} to {day(when)}", days=f"{(when - peak_at).days} days"))
            peak, peak_at, low = v, when, 0.0
        else:
            low = min(low, v / peak - 1)
    if low < 0:  # still under water: count to the last real trading day, not the end of its week
        out.append(dict(depth=low, when=f"{day(peak_at)}, not yet recovered", days=f"{(last - peak_at).days} days so far"))
    out.sort(key=lambda e: e["depth"])
    return [{**e, "depth": round(float(e["depth"]) * 100, 2)} for e in out[:top]]


def rolling(nav):
    wk = nav.resample("W").last().dropna()
    out = []
    for label, weeks, years in [("Any 1 year, return", 52, 1), ("Any 3 years, CAGR", 156, 3)]:
        if len(wk) <= weeks:
            continue
        r = (wk / wk.shift(weeks)).dropna() ** (1 / years) - 1
        out.append(dict(label=label, worst=round(float(r.min()) * 100, 1), median=round(float(r.median()) * 100, 1),
                        best=round(float(r.max()) * 100, 1), positive=int(round(float((r > 0).mean()) * 100)), windows=int(len(r))))
    return out


def performance(nav, nifty50):
    """The figures that describe a back test, from its daily values."""
    me = nav.resample("ME").last()
    month = (me.pct_change().dropna() * 100)
    monthly = [dict(y=d.year, m=d.month, r=round(float(v), 2)) for d, v in month.items()]
    years = nav.resample("YE").last()
    cal = years.pct_change() * 100
    cal.iloc[0] = (years.iloc[0] / nav.iloc[0] - 1) * 100
    first, last = nav.index[0], nav.index[-1]
    calendar = []
    for d, v in cal.items():
        note = f"from {first.day} {first:%b}" if d.year == first.year else f"to {last.day} {last:%b}" if d.year == last.year else ""
        calendar.append(dict(year=str(d.year), note=note, ret=round(float(v), 1)))
    n50 = nifty50[(nifty50.index >= first) & (nifty50.index <= last)]
    return dict(
        growth=dict(start=day(first), end=day(last), model=float(round(nav.iloc[-1] / nav.iloc[0] * 100)),
                    nifty=float(round(n50.iloc[-1] / n50.iloc[0] * 100))),
        calendar=calendar, monthly=monthly, drawdowns=drawdown_episodes(nav), rolling=rolling(nav))


def holdings_of(portfolio, tagged):
    return [dict(sym=p["symbol"], weight=p["weight"], tag=FUNDS.get(p["symbol"]) if tagged else None) for p in portfolio]


def sectors_of(portfolio):
    """Each sector's share of the whole basket (the debt and gold funds are not a sector)."""
    by = {}
    for p in portfolio:
        if p["symbol"] not in FUNDS:
            by[p["sector"] or "Other"] = by.get(p["sector"] or "Other", 0) + p["weight"]
    return [dict(name=k, weight=round(v, 1)) for k, v in sorted(by.items(), key=lambda kv: (-kv[1], kv[0]))]


def sleeves_of(portfolio):
    w = {"Equity": 0.0, "Gold": 0.0, "Debt": 0.0}
    for p in portfolio:
        w[FUNDS.get(p["symbol"], "Equity")] += p["weight"]
    return [dict(name=k, weight=float(round(v))) for k, v in w.items() if v > 0.01]


def entry(old, nav, rebalances, result, nifty50):
    """One basket's website entry. `old` supplies the name, kind, risk label and wording."""
    e = dict(old)
    perf = performance(nav, nifty50)
    end = perf["growth"]["end"]
    port = result["portfolio"]
    stocks = len([p for p in port if p["symbol"] not in FUNDS])
    cfg = result["config"]
    count = cfg["holdings"] if cfg["sleeves"] is None else stocks
    e.update(perf)
    e["cagr"] = result["metrics"]["cagr"]
    e["maxDd"] = round(result["metrics"]["maxDd"], 1)
    e["holdings"] = holdings_of(port, tagged=len(port) > stocks)
    e["holdingCount"] = len(port)
    e["sleeves"] = sleeves_of(port)
    e["sectors"] = sectors_of(port)
    e["universe"] = re.sub(r"\b\d+ stocks\b", f"{count} stocks", old["universe"])
    summary = re.sub(r"holds \d+ stocks", f"holds {count} stocks", old["summary"])
    summary = re.sub(r"Model CAGR [−\-\d.]+%", f"Model CAGR {minus(e['cagr'], 1)}%", summary)
    e["summary"] = re.sub(r"as of \d{1,2} \w{3} \d{4}", f"as of {end}", summary)
    sched = result["schedule"]
    e["rebalances"] = dict(count=str(rebalances), latest=day(sched["lastSignal"]), next=day(sched["next"]))
    return e


def backtest_line(e):
    since = f"a year since inception on {e['growth']['start']}"
    return (f"{minus(e['cagr'])}% {since}, to {e['growth']['end']}, after estimated trading charges, against {minus(e['benchmark']['cagr'])}% "
            f"for the {e['benchmark']['name']} over the same window. Deepest fall {minus(e['maxDdExact'])}%. Not a promise of future returns.")


def load_module(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, name + ".py"))
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    return module


def load_engine():
    return load_module("engine")


MAX_REVISED = 0.20  # more past rebalances than this coming out differently means the price data is wrong, not revised


def main():
    path = os.path.join(HERE, "out", "results.json")
    published = json.load(open(path, encoding="utf8")) if os.path.exists(path) else {}
    E = load_engine()
    E.run_all()
    computed = json.load(open(path, encoding="utf8"))
    latest = E.raw.ffill().iloc[-1]
    prices = {c.replace(".NS", ""): round(float(v), 2) for c, v in latest.items() if v == v}
    results, compared, revised = load_module("ledger").freeze(published, computed, prices)
    reviewed = os.environ.get("REVIEWED") == "true"  # a person has looked at it and approved this run
    if compared >= 20 and revised / compared > MAX_REVISED and not reviewed:
        json.dump(published, open(path, "w", encoding="utf8"), ensure_ascii=False, indent=1)
        raise SystemExit(f"NOT SAFE: {revised} of {compared} past rebalances compute differently from last time. Check the price data.")
    if revised:
        print(f"note: {revised} of {compared} past rebalances compute differently from last time; the published ones are kept")
    json.dump(results, open(path, "w", encoding="utf8"), ensure_ascii=False, indent=1)
    site = json.load(open(SITE, encoding="utf8"))
    out = []
    for old in site:
        slug = old["slug"]
        nav, count = E.RUNS[slug]
        out.append(entry(old, nav, count, results[slug], E.nifty))
    json.dump(out, open(SITE, "w", encoding="utf8"), ensure_ascii=False, indent=2)
    runpy.run_path(os.path.join(HERE, "benchmarks.py"))  # adds startDate and each basket's own benchmark
    out = json.load(open(SITE, encoding="utf8"))
    for e in out:
        e["maxDdExact"] = results[e["slug"]]["metrics"]["maxDd"]
        e["backtest"] = backtest_line(e)
        del e["maxDdExact"]
    json.dump(out, open(SITE, "w", encoding="utf8"), ensure_ascii=False, indent=2)
    print(f"website data rebuilt for {len(out)} baskets, to {out[0]['growth']['end']}")


if __name__ == "__main__":
    main()
