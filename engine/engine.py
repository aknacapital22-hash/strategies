"""Strategy engine: backtests the 15 strategies and emits latest portfolios.
Usage (cwd = app/):  python engine/engine.py
Outputs: engine/out/results.json
Rules implemented (inferred from the reference strategy pages, calibrated on their published lists):
  universe -> price filter -> risk adjusted momentum composite -> top N equal weight
  -> fixed calendar rebalance -> optional debt/gold sleeves. Signal at close of day t,
  trades executed at the close of day t+1 (no look ahead).
"""
import importlib.util, json, os
import numpy as np
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("core", os.path.join(HERE, "core.py"))
core = importlib.util.module_from_spec(spec); spec.loader.exec_module(core)

# Calibrated against the published Allcap lists (see calibrate.py).
SIGNAL = dict(lookbacks=(42, 84, 126, 252), skip=5, vol_mode="year")
EXEC_LAG = int(os.environ.get("EXEC_LAG", "1"))  # 1 = trade next close, 0 = trade the signal close
SWITCH = dict(lookbacks=(42, 84, 126, 252), skip=5, vol_mode="none")  # calibrated on published allocator lists
COST = 0.0032  # per rupee traded: 0.2% platform fee + ~0.12% STT, exchange, stamp, GST
DEBT_FALLBACK = 0.065  # annual accrual used before LIQUIDCASE listed

MAX_STOCKS = 20  # no basket may hold more than 20 stocks
S = lambda **k: {**k, "n": min(k["n"], MAX_STOCKS)}
STRATEGIES = {
    "allcap": S(uni="total_market", maxp=5000, n=40, wk=2, w=(1, 0, 0), start="2022-11-25"),
    "midcap-smallcap": S(uni="total_market", maxp=2000, n=40, wk=2, w=(1, 0, 0), start="2021-11-19"),
    "microcap": S(uni="microcap250", maxp=5000, n=40, wk=2, w=(1, 0, 0), start="2022-11-25"),
    "large-midcap": S(uni="niftylargemidcap250", maxp=5000, n=30, wk=2, w=(1, 0, 0), start="2022-08-12"),
    "midcap": S(uni="niftymidcap150", maxp=5000, n=20, wk=2, w=(1, 0, 0), start="2021-11-19"),
    "focused-largecap-20": S(uni="nifty100", maxp=5000, n=20, wk=4, w=(1, 0, 0), start="2021-11-19"),
    "largecap-hybrid": S(uni="nifty100", maxp=5000, n=20, wk=4, w=(0.8, 0.2, 0), start="2021-11-19"),
    "largecap-multi-asset": S(uni="nifty100", maxp=5000, n=20, wk=4, w=(0.8, 0.1, 0.1), start="2021-11-19"),
    "large-mid-hybrid": S(uni="niftylargemidcap250", maxp=5000, n=40, wk=2, w=(0.8, 0.2, 0), start="2021-11-19"),
    "largemid-multi-asset": S(uni="niftylargemidcap250", maxp=5000, n=40, wk=2, w=(0.8, 0.1, 0.1), start="2021-11-19"),
    "allcap-multi-asset": S(uni="total_market", maxp=5000, n=40, wk=2, w=(0.8, 0.1, 0.1), start="2024-11-15"),
    "focused-alpha-5": S(uni="alpha50", maxp=10000, n=5, wk=3, w=(1, 0, 0), start="2021-11-19", buffer=5),
    "energy-basket": S(uni="niftyenergy", maxp=20000, n=10, wk=1, w=(1, 0, 0), start="2021-11-19"),
    "healthcare-basket": S(uni="midsmall_healthcare", maxp=5000, n=10, wk=1, w=(1, 0, 0), start="2021-11-19"),
    "dynamic-asset-allocator": S(uni="total_market", maxp=5000, n=41, wk=2, w=None, start="2022-11-25"),
}

adj, raw = core.load_prices()
scorer = core.Scorer(adj, **SIGNAL)
nifty = adj["^NSEI"].dropna()

# --- debt and gold proxies on the same index ---------------------------------
idx = adj.index
debt = adj["LIQUIDCASE.NS"].copy()
first = debt.first_valid_index()
daily = (1 + DEBT_FALLBACK) ** (1 / 252)
synth = pd.Series(index=idx, dtype=float)
synth.loc[idx < first] = np.nan
pre = idx[idx < first]
if len(pre):
    synth.loc[pre] = daily ** (np.arange(len(pre)) - len(pre)) * debt.loc[first]
debt = debt.fillna(synth)
adj = adj.copy()
adj["DEBT"] = debt
gold_col = "GOLDBEES.NS"
price_all = adj  # adjusted closes incl. DEBT


def sector_map():
    m = {}
    for f in os.listdir(os.path.join(HERE, "universe")):
        df = core.load_universe(f[:-4])
        for s, ind in zip(df["Symbol"], df["Industry"]):
            m[s + ".NS"] = ind
    return m


SECTORS = sector_map()


def published_phase(slug):
    p = os.path.join(HERE, "published", slug + ".csv")
    df = pd.read_csv(p)
    return pd.to_datetime(df["Date"]).max()


def rebalance_dates(slug, cfg):
    anchor = published_phase(slug)
    step = pd.Timedelta(weeks=cfg["wk"])
    dates, d = [], anchor
    start = pd.Timestamp(cfg["start"])
    while d >= start - step:
        dates.append(d)
        d -= step
    dates = sorted(dates)
    nxt = anchor + step
    while nxt <= adj.index.max():
        dates.append(nxt)
        nxt += step
    return dates


def universe_symbols(cfg, date):
    if cfg["uni"] != "alpha50":
        return core.load_universe(cfg["uni"])["Symbol"].tolist()
    # Nifty Alpha 50 approximation: top 50 Jensen alpha vs Nifty 500 over 252d, from the large+mid 250
    base = [s + ".NS" for s in core.load_universe("niftylargemidcap250")["Symbol"]]
    i = adj.index.searchsorted(date, side="right") - 1
    win = adj.iloc[max(0, i - 252) : i + 1]
    r = win.pct_change(fill_method=None).iloc[1:]
    m = r["^CRSLDX"]
    out = {}
    for s in base:
        if s in r.columns and r[s].notna().sum() > 200:
            x = pd.concat([r[s], m], axis=1).dropna()
            beta = np.cov(x.iloc[:, 0], x.iloc[:, 1])[0, 1] / x.iloc[:, 1].var()
            out[s] = (x.iloc[:, 0].mean() - beta * x.iloc[:, 1].mean()) * 252
    top = sorted(out, key=out.get, reverse=True)[:50]
    return [t[:-3] for t in top]


def group_score(series, date):
    sc = core.Scorer(pd.DataFrame({"x": series}), **SWITCH)
    return sc.at(date)["x"]


def target_weights(slug, cfg, date, incumbents=()):
    """Returns {ticker: weight}, signal as of `date` close."""
    if cfg["w"] is None:  # dynamic asset allocator
        eq_sc = group_score(adj["^CRSLDX"], date)  # Nifty 500 as the equity proxy
        debt_sc = group_score(adj["DEBT"], date)
        gold_sc = group_score(adj[gold_col], date)
        a_eq = bool(eq_sc > debt_sc)  # 40% switch: equity or debt
        b_eq = bool(eq_sc > gold_sc)  # 25% switch: equity or gold
        eq_w = 0.35 + (0.40 if a_eq else 0) + (0.25 if b_eq else 0)
        w_debt = 0 if a_eq else 0.40
        w_gold = 0 if b_eq else 0.25
        eq_w, w_debt, w_gold = eq_w, w_debt, w_gold
    else:
        eq_w, w_debt, w_gold = cfg["w"]
    syms = universe_symbols(cfg, date)
    names = core.pick(scorer, raw, date, syms, cfg["maxp"], cfg["n"], incumbents, cfg.get("buffer", 0))
    wts = {t: eq_w / len(names) for t in names} if names and eq_w else {}
    if w_debt:
        wts["DEBT"] = w_debt
    if w_gold:
        wts[gold_col] = w_gold
    return wts


def backtest(slug, cfg):
    px = price_all.ffill()
    dates = rebalance_dates(slug, cfg)
    start = pd.Timestamp(cfg["start"])
    trade_days = px.index[px.index >= start]
    value = 1.0
    shares = {}
    nav = {}
    turnover_total = 0.0
    history = []
    pending = None
    # map each signal date to the next trading day (execution)
    exec_map = {}
    for d in dates:
        if d < start - pd.Timedelta(days=7):
            continue
        j = px.index.searchsorted(d, side="right") - 1 + EXEC_LAG  # EXEC_LAG=1: first trading day after d
        if j < len(px.index):
            exec_map[px.index[j]] = d
        elif d <= px.index.max():
            pending = d
    for t in trade_days:
        if shares:
            value = sum(sh * px.at[t, k] for k, sh in shares.items())
        if t in exec_map:
            sig = exec_map[t]
            wts = target_weights(slug, cfg, sig, [k for k in shares if k.endswith(".NS")])
            if wts:
                new_val = {k: v * value for k, v in wts.items()}
                old_val = {k: sh * px.at[t, k] for k, sh in shares.items()}
                traded = sum(abs(new_val.get(k, 0) - old_val.get(k, 0)) for k in set(new_val) | set(old_val))
                traded = traded if shares else sum(new_val.values())
                cost = traded * COST
                value -= cost
                turnover_total += traded / max(value, 1e-9)
                shares = {k: (v * (value / sum(new_val.values()))) / px.at[t, k] for k, v in new_val.items() if not np.isnan(px.at[t, k])}
                history.append(dict(signal=str(sig.date()), exec=str(t.date()), holdings=sorted(wts)))
        nav[t] = value
    nav = pd.Series(nav)
    held = [k for k in shares if k.endswith('.NS')]
    return nav, history, pending, turnover_total, held


def metrics(nav):
    yrs = (nav.index[-1] - nav.index[0]).days / 365.25
    cagr = (nav.iloc[-1] / nav.iloc[0]) ** (1 / yrs) - 1
    dd = nav / nav.cummax() - 1
    r = nav.pct_change().dropna()
    return dict(cagr=cagr * 100, maxDd=dd.min() * 100, vol=r.std() * np.sqrt(252) * 100,
                sharpe=(r.mean() * 252 - 0.065) / (r.std() * np.sqrt(252)))


def run_all():
    pub_cagr = {s["slug"]: s["cagr"] for s in json.load(open(os.path.join(HERE, "..", "lib", "strategies.json"), encoding="utf8"))}
    out = {}
    for slug, cfg in STRATEGIES.items():
        nav, hist, pending, turn, held = backtest(slug, cfg)
        m = metrics(nav)
        n50 = nifty[nifty.index >= nav.index[0]]
        bm = (n50.iloc[-1] / n50.iloc[0]) ** (365.25 / (n50.index[-1] - n50.index[0]).days) - 1
        monthly = nav.resample("ME").last()
        monthly_ret = monthly.pct_change().dropna() * 100
        cal = nav.resample("YE").last().pct_change() * 100
        first_year = nav.index[0].year
        cal.iloc[0] = (nav.resample("YE").last().iloc[0] / nav.iloc[0] - 1) * 100
        # latest portfolio: pending (signal today) if present, else last executed
        last_sig = pending or pd.Timestamp(hist[-1]["signal"])
        wts = target_weights(slug, cfg, last_sig, held)  # same incumbents as the backtest, so buffers apply
        port = [dict(symbol=k.replace(".NS", ""), weight=round(v * 100, 2),
                     sector=SECTORS.get(k, "Debt" if k == "DEBT" else "Gold" if k == gold_col else None),
                     price=round(float(raw["LIQUIDCASE.NS" if k == "DEBT" else k].ffill().iloc[-1]), 2) if ("LIQUIDCASE.NS" if k == "DEBT" else k) in raw.columns else None)
                for k, v in sorted(wts.items(), key=lambda kv: -kv[1])]
        for p in port:
            if p["symbol"] == "DEBT":
                p["symbol"], p["sector"] = "LIQUIDCASE", "Debt"
            if p["symbol"] == "GOLDBEES":
                p["sector"] = "Gold"
        # --- rebalance log: what came in and went out at each rebalance, plus the next scheduled date
        def eq(names):
            return {n.replace(".NS", "") for n in names if n.endswith(".NS")}
        log, prev = [], None
        for h in hist:
            cur = eq(h["holdings"])
            if prev is not None:
                log.append({"signal": h["signal"], "exec": h["exec"], "status": "done", "in": sorted(cur - prev), "out": sorted(prev - cur), "size": len(cur)})
            prev = cur
        if pending is not None and prev is not None:  # the latest signal, whose trades happen next session
            cur = eq(wts)
            log.append({"signal": str(last_sig.date()), "exec": None, "status": "pending", "in": sorted(cur - prev), "out": sorted(prev - cur), "size": len(cur)})
        log = log[-8:][::-1]  # newest first
        nxt = last_sig + pd.Timedelta(weeks=cfg["wk"])
        while nxt <= adj.index.max():
            nxt += pd.Timedelta(weeks=cfg["wk"])
        schedule = dict(everyWeeks=cfg["wk"], lastSignal=str(last_sig.date()), next=str(nxt.date()))
        pub_path = os.path.join(HERE, "published", slug + ".csv")
        pdf = pd.read_csv(pub_path)
        pl = pdf[pdf["Action"] == "REBALANCE"].iloc[0]
        pub_names = {s.strip() for s in pl["Details"].split(",")}
        mine = {p["symbol"] for p in port}
        out[slug] = dict(
            config=dict(universe=cfg["uni"], maxPrice=cfg["maxp"], holdings=cfg["n"], everyWeeks=cfg["wk"], sleeves=cfg["w"], start=cfg["start"]),
            metrics={k: round(v, 2) for k, v in m.items()},
            benchmarkCagr=round(bm * 100, 2), publishedCagr=pub_cagr.get(slug),
            turnoverPerYear=round(turn / ((nav.index[-1] - nav.index[0]).days / 365.25) * 100, 0),
            calendar={str(y.year): round(float(v), 1) for y, v in cal.items() if not np.isnan(v)},
            monthly=[dict(y=d.year, m=d.month, r=round(float(v), 2)) for d, v in monthly_ret.items()],
            curve=[[str(d.date()), round(float(v) * 100, 2)] for d, v in nav.resample("W").last().items()],
            portfolioAsOf=str(last_sig.date()), portfolio=port,
            publishedLatestDate=str(pl["Date"]), overlapWithPublishedLatest=round(len(mine & pub_names) / max(1, len(pub_names - {"LIQUIDCASE", "GOLDBEES"})), 2),
            rebalances=len(hist), changes=log, schedule=schedule,
        )
        print(f"{slug:26s} mine CAGR {m['cagr']:6.1f}  published {pub_cagr.get(slug)}  maxDD {m['maxDd']:6.1f}  bench {bm*100:5.1f}  overlap-latest {out[slug]['overlapWithPublishedLatest']}")
    os.makedirs(os.path.join(HERE, "out"), exist_ok=True)
    json.dump(out, open(os.path.join(HERE, "out", "results.json"), "w", encoding="utf8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    run_all()
