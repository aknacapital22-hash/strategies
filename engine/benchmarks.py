"""Adds startDate and benchmark (each strategy's own index) to lib/strategies.json. Usage (cwd = app/): python engine/benchmarks.py"""
import json, os, numpy as np, pandas as pd
HERE = os.path.dirname(os.path.abspath(__file__)); P = os.path.join(HERE, "..", "lib", "strategies.json")
ix = pd.read_csv(os.path.join(HERE, "data", "indices.csv"), index_col=0, parse_dates=True)
MAP = {  # slug -> (label, components, proxy note)
 "allcap": ("Nifty 500", ["NIFTY500"], "Nifty Total Market is not available as a price series, so Nifty 500 (about 95% of its value) stands in."),
 "dynamic-asset-allocator": ("Nifty 500", ["NIFTY500"], "Equity index only; the strategy also moves into debt and gold. Nifty 500 stands in for Nifty Total Market."),
 "allcap-multi-asset": ("Nifty 500", ["NIFTY500"], "Equity index only; the strategy also holds 10% debt and 10% gold. Nifty 500 stands in for Nifty Total Market."),
 "focused-alpha-5": ("Nifty 500", ["NIFTY500"], "Nifty Alpha 50 is not available as a price series, so Nifty 500 stands in."),
 "healthcare-basket": ("Nifty 500", ["NIFTY500"], "Nifty MidSmall Healthcare is not available as a price series, so Nifty 500 stands in."),
 "midcap-smallcap": ("Nifty Midcap 150 + Smallcap 250 (50:50)", ["MIDCAP150", "SMALLCAP250"], "A monthly rebalanced 50:50 mix of the two indices."),
 "microcap": ("Nifty Smallcap 250", ["SMALLCAP250"], "Nifty Microcap 250 is not available as a price series, so Nifty Smallcap 250 stands in."),
 "large-midcap": ("Nifty 100 + Midcap 150 (50:50)", ["NIFTY100", "MIDCAP150"], "Nifty LargeMidcap 250 is made of these two indices; a monthly rebalanced 50:50 mix approximates it."),
 "large-mid-hybrid": ("Nifty 100 + Midcap 150 (50:50)", ["NIFTY100", "MIDCAP150"], "Equity index only; the strategy also holds 20% debt. The 50:50 mix approximates Nifty LargeMidcap 250."),
 "largemid-multi-asset": ("Nifty 100 + Midcap 150 (50:50)", ["NIFTY100", "MIDCAP150"], "Equity index only; the strategy also holds 10% debt and 10% gold. The 50:50 mix approximates Nifty LargeMidcap 250."),
 "midcap": ("Nifty Midcap 150", ["MIDCAP150"], ""),
 "focused-largecap-15": ("Nifty 100", ["NIFTY100"], ""),
 "largecap-hybrid": ("Nifty 100", ["NIFTY100"], "Equity index only; the strategy also holds 20% debt."),
 "largecap-multi-asset": ("Nifty 100", ["NIFTY100"], "Equity index only; the strategy also holds 10% debt and 10% gold."),
 "energy-basket": ("Nifty Energy", ["ENERGY"], ""),
}
MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
me = ix.groupby([ix.index.year, ix.index.month]).last()   # month-end (latest close for the current month)
ret = me.pct_change()
d = json.load(open(P, encoding="utf8"))
for e in d:
    label, comps, note = MAP[e["slug"]]
    mon = []
    for m in e["monthly"]:
        r = float(np.mean([ret.loc[(m["y"], m["m"]), c] for c in comps])) * 100
        mon.append(dict(y=m["y"], m=m["m"], r=round(r, 2)))
    g = np.cumprod([1 + m["r"] / 100 for m in mon]); g = np.insert(g, 0, 1.0) * 100
    yrs = len(mon) / 12
    dd = (g / np.maximum.accumulate(g) - 1).min() * 100
    cal = {}
    for m in mon: cal.setdefault(m["y"], []).append(1 + m["r"] / 100)
    e["startDate"] = e["growth"]["start"]
    e["benchmark"] = dict(name=label, note=note, proxy=bool(note), cagr=round(((g[-1] / 100) ** (1 / yrs) - 1) * 100, 2),
        maxDd=round(float(dd), 1), growth=round(float(g[-1]), 0), monthly=mon,
        calendar=[dict(year=str(y), ret=round((np.prod(v) - 1) * 100, 1)) for y, v in cal.items()])
    print(f'{e["slug"]:26s} from {e["startDate"]:12s} strat {e["cagr"]:6.2f}  {label}: {e["benchmark"]["cagr"]:6.2f} dd {e["benchmark"]["maxDd"]}')
json.dump(d, open(P, "w", encoding="utf8"), ensure_ascii=False, indent=2)
