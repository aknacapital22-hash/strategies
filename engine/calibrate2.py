"""Calibrate (1) the Alpha 50 pool + momentum pick for Alpha 5 and (2) the Dynamic Asset Allocator switches
against the reference published lists. Usage (cwd=app/): python engine/calibrate2.py
"""
import importlib.util, itertools, os
import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("core", os.path.join(HERE, "core.py"))
core = importlib.util.module_from_spec(spec); spec.loader.exec_module(core)
adj, raw = core.load_prices()
ret = adj.pct_change(fill_method=None)


def pubfile(slug):
    d = pd.read_csv(os.path.join(HERE, "published", slug + ".csv"))
    d = d[d["Action"] == "REBALANCE"].copy()
    d["Date"] = pd.to_datetime(d["Date"])
    return d.sort_values("Date")


# ------------------------------------------------------------------ Alpha 5
a5 = pubfile("focused-alpha-5")
a5 = a5[a5["Date"] >= "2022-06-01"]
truth = {d: [s.strip() + ".NS" for s in det.split(",")] for d, det in zip(a5["Date"], a5["Details"])}
print(len(truth), "alpha5 lists")


def alpha_matrix(bench, W):
    m = ret[bench]
    mean_r = ret.rolling(W, min_periods=int(W * 0.8)).mean()
    mean_m = m.rolling(W, min_periods=int(W * 0.8)).mean()
    cov = ret.rolling(W, min_periods=int(W * 0.8)).cov(m)
    beta = cov.div(m.rolling(W, min_periods=int(W * 0.8)).var(), axis=0)
    return (mean_r.sub(beta.mul(mean_m, axis=0))) * 252


bases = {
    "lm250": [s + ".NS" for s in core.load_universe("niftylargemidcap250")["Symbol"]],
    "n500": [s + ".NS" for s in core.load_universe("nifty500")["Symbol"]],
    "total": [s + ".NS" for s in core.load_universe("total_market")["Symbol"]],
}
sig_variants = {
    "calib": dict(lookbacks=(42, 84, 126, 252), skip=5, vol_mode="year"),
    "short": dict(lookbacks=(21, 42, 63, 126), skip=5, vol_mode="year"),
    "m6": dict(lookbacks=(63, 126), skip=5, vol_mode="year"),
}
scorers = {k: core.Scorer(adj, **v) for k, v in sig_variants.items()}

res = []
for (bench, W), (bname, base) in itertools.product([("^CRSLDX", 252), ("^NSEI", 252), ("^CRSLDX", 126)], bases.items()):
    am = alpha_matrix(bench, W)[[b for b in base if b in adj.columns]]
    for pool_n, refresh in itertools.product([30, 50, 100], ["cont", "semi"]):
        pools = {}
        for d in truth:
            i = am.index.searchsorted(d, side="right") - 1
            if refresh == "semi":
                # last trading day of the most recent Feb or Aug
                y, mth = d.year, d.month
                ref = pd.Timestamp(y, 8, 31) if mth > 8 or (mth == 8) else pd.Timestamp(y, 2, 28)
                if ref > d:
                    ref = pd.Timestamp(y - 1, 8, 31) if ref.month == 2 else pd.Timestamp(y, 2, 28)
                i = am.index.searchsorted(ref, side="right") - 1
            pools[d] = list(am.iloc[i].dropna().sort_values(ascending=False).index[:pool_n])
        recall = np.mean([len(set(truth[d]) & set(pools[d])) / 5 for d in truth])
        for sk, sc in scorers.items():
            ov = []
            for d in truth:
                names = core.eligible(raw, d, [p[:-3] for p in pools[d]], 10000)
                s = sc.at(d)[names].dropna().sort_values(ascending=False)
                ov.append(len(set(s.index[:5]) & set(truth[d])) / 5)
            res.append((np.mean(ov), recall, bench, W, bname, pool_n, refresh, sk))
res.sort(reverse=True)
print("ALPHA5  overlap  pool-recall  bench  W  base  pool  refresh  signal")
for r in res[:10]:
    print(f"{r[0]:.3f} {r[1]:.3f} {r[2]} {r[3]} {r[4]} {r[5]} {r[6]} {r[7]}")

# ------------------------------------------------------------------ allocator switches
da = pubfile("dynamic-asset-allocator")
da["debt"] = da["Details"].str.contains("LIQUIDCASE")
da["gold"] = da["Details"].str.contains("GOLDBEES")
da = da.set_index("Date")
debt = adj["LIQUIDCASE.NS"].copy()
first = debt.first_valid_index()
pre = adj.index[adj.index < first]
debt.loc[pre] = (1.065 ** (1 / 252)) ** (np.arange(len(pre)) - len(pre)) * debt.loc[first]

assets = {"n500": adj["^CRSLDX"], "n50": adj["^NSEI"]}
# equity-weighted basket of the Allcap picks is overkill; try broad proxies + the equal-weight total market
ew = (1 + ret[[c for c in bases["total"] if c in ret.columns]].mean(axis=1)).cumprod()
assets["ew_total"] = ew
gold = adj["GOLDBEES.NS"]


def score(series, lb, skip, vm):
    return core.Scorer(pd.DataFrame({"x": series}), lookbacks=lb, skip=skip, vol_mode=vm, min_hist=max(lb) + skip).score["x"]


cands = []
for (an, eq), lb, vm in itertools.product(assets.items(), [(63,), (126,), (42, 84, 126, 252), (21, 63, 126), (252,)], ["year", "none"]):
    se, sd, sg = score(eq, lb, 5, vm), score(debt, lb, 5, vm), score(gold, lb, 5, vm)
    accD, accG = [], []
    for d, row in da.iterrows():
        i = se.index.searchsorted(d, side="right") - 1
        accD.append((se.iloc[i] > sd.iloc[i]) == (not row["debt"]))
        accG.append((se.iloc[i] > sg.iloc[i]) == (not row["gold"]))
    cands.append((np.mean(accD), np.mean(accG), an, lb, vm))
cands.sort(key=lambda r: -(r[0] + r[1]))
print("ALLOCATOR  debt-switch-acc  gold-switch-acc  eq-proxy  lookbacks  vol")
for r in cands[:8]:
    print(f"{r[0]:.3f} {r[1]:.3f} {r[2]} {r[3]} {r[4]}")

# trend-filter alternative: equity on if proxy above its N-day mean
for an, eq in assets.items():
    for n in (100, 150, 200):
        on = eq > eq.rolling(n).mean()
        accD = np.mean([on.iloc[on.index.searchsorted(d, side="right") - 1] == (not r["debt"]) for d, r in da.iterrows()])
        accG = np.mean([on.iloc[on.index.searchsorted(d, side="right") - 1] == (not r["gold"]) for d, r in da.iterrows()])
        print(f"trend {an} {n}d: debt {accD:.3f} gold {accG:.3f}")
print("share of dates with debt on:", da["debt"].mean().round(2), " gold on:", da["gold"].mean().round(2))
