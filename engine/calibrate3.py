"""Focused Alpha 5 search: ranking rule inside the alpha pool, plus incumbent buffer.
Usage (cwd=app/): python engine/calibrate3.py
"""
import importlib.util, itertools, os
import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("core", os.path.join(HERE, "core.py"))
core = importlib.util.module_from_spec(spec); spec.loader.exec_module(core)
adj, raw = core.load_prices()
ret = adj.pct_change(fill_method=None)

d = pd.read_csv(os.path.join(HERE, "published", "focused-alpha-5.csv"))
d = d[d["Action"] == "REBALANCE"].copy(); d["Date"] = pd.to_datetime(d["Date"]); d = d.sort_values("Date")
d = d[d["Date"] >= "2022-06-01"]
dates = list(d["Date"])
truth = {t: [s.strip() + ".NS" for s in det.split(",")] for t, det in zip(d["Date"], d["Details"])}
cons = np.mean([len(set(truth[a]) & set(truth[b])) / 5 for a, b in zip(dates[:-1], dates[1:])])
print("published consecutive-list overlap:", round(cons, 3))

base = [s + ".NS" for s in core.load_universe("total_market")["Symbol"] if s + ".NS" in adj.columns]


def alpha_matrix(bench, W):
    m = ret[bench]
    k = dict(min_periods=int(W * 0.8))
    mean_r, mean_m = ret.rolling(W, **k).mean(), m.rolling(W, **k).mean()
    beta = ret.rolling(W, **k).cov(m).div(m.rolling(W, **k).var(), axis=0)
    return (mean_r.sub(beta.mul(mean_m, axis=0))) * 252


def cum_ret(L, skip):
    return adj.shift(skip) / adj.shift(skip + L) - 1


rank_feats = {}
for L in (21, 42, 63, 84, 126, 189, 252):
    for sk in (0, 5):
        rank_feats[f"ret{L}s{sk}"] = cum_ret(L, sk)
for name, kw in {
    "calib": dict(lookbacks=(42, 84, 126, 252), skip=5, vol_mode="year"),
    "c63_126_vol": dict(lookbacks=(63, 126), skip=5, vol_mode="year"),
    "c21_63_126_vol": dict(lookbacks=(21, 63, 126), skip=0, vol_mode="year"),
    "c126_252_none": dict(lookbacks=(126, 252), skip=5, vol_mode="none"),
}.items():
    rank_feats[name] = core.Scorer(adj, **kw).score

results = []
for bench, W, pool_n in itertools.product(["^CRSLDX"], [252], [800]):
    am = alpha_matrix(bench, W)[base]
    pools = {}
    for t in dates:
        i = am.index.searchsorted(t, side="right") - 1
        pools[t] = list(am.iloc[i].dropna().sort_values(ascending=False).index[:pool_n])
    for fname, F in rank_feats.items():
        for buffer in (0, 5, 10):  # keep an incumbent while its rank stays within 5 + buffer
            ov, prev = [], []
            for t in dates:
                names = core.eligible(raw, t, [p[:-3] for p in pools[t]], 10000)
                i = F.index.searchsorted(t, side="right") - 1
                s = F.iloc[i][names].dropna().sort_values(ascending=False)
                rk = list(s.index)
                keep = [p for p in prev if p in rk[: 5 + buffer]]
                new = keep + [x for x in rk if x not in keep]
                sel = new[:5]
                ov.append(len(set(sel) & set(truth[t])) / 5)
                prev = sel
            results.append((np.mean(ov), bench, W, pool_n, fname, buffer))
results.sort(reverse=True)
print("overlap bench W pool feature buffer")
for r in results[:15]:
    print(f"{r[0]:.3f} {r[1]} {r[2]} {r[3]} {r[4]} buf{r[5]}")
