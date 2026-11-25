"""Search signal variants for the one whose top-N best matches the reference published lists.
Usage: python -I engine/calibrate.py   (run with cwd = app/, imports engine/core.py by path)
"""
import itertools, os, sys, importlib.util
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("core", os.path.join(HERE, "core.py"))
core = importlib.util.module_from_spec(spec); spec.loader.exec_module(core)

adj, raw = core.load_prices()
uni = core.load_universe("total_market")["Symbol"].tolist()

pub = pd.read_csv(os.path.join(HERE, "published", "allcap.csv"))
pub = pub[pub["Action"] == "REBALANCE"]
pub["Date"] = pd.to_datetime(pub["Date"])
pub = pub[pub["Date"] >= "2023-06-01"].iloc[::2]  # every other list, recent enough for 252d look backs
lists = {d: [s.strip() + ".NS" for s in det.split(",")] for d, det in zip(pub["Date"], pub["Details"])}
print(len(lists), "published lists to match")

grid = {
    "lookbacks": [(42, 84, 126, 252), (30, 60, 90, 126, 252), (42, 84, 126, 189, 252), (21, 42, 84, 126, 252), (42, 84, 126), (60, 120, 180, 252), (42, 84, 168, 252)],
    "skip": [3, 5, 8, 10, 15],
    "vol_mode": ["year", "same"],
    "lag": [0],
}
results = []
for lb, skip, vm in itertools.product(grid["lookbacks"], grid["skip"], grid["vol_mode"]):
    sc = core.Scorer(adj, lookbacks=lb, skip=skip, vol_mode=vm)
    for lag in grid["lag"]:
        ov = []
        for d, names in lists.items():
            dd = d - pd.Timedelta(days=lag)
            mine = core.pick(sc, raw, dd, uni, 5000, 40)
            ov.append(len(set(mine) & set(names)) / 40)
        results.append((sum(ov) / len(ov), lb, skip, vm, lag))
results.sort(reverse=True)
for r in results[:12]:
    print(f"overlap {r[0]:.3f}  lookbacks={r[1]} skip={r[2]} vol={r[3]} lag={r[4]}")
