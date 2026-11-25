"""Core of the momentum strategy engine: data loading, scoring, selection."""
import os
import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.abspath(__file__))


def load_prices():
    adj = pd.read_csv(os.path.join(ROOT, "data", "close_adj.csv.gz"), index_col=0, parse_dates=True)
    raw = pd.read_csv(os.path.join(ROOT, "data", "close_raw.csv.gz"), index_col=0, parse_dates=True)
    return adj, raw


def load_universe(name):
    df = pd.read_csv(os.path.join(ROOT, "universe", name + ".csv"))
    df["Symbol"] = df["Symbol"].astype(str).str.strip()
    return df


class Scorer:
    """Risk adjusted momentum composite: for each look back L, return_L / volatility_L
    (volatility of daily returns over the same window), averaged across look backs.
    `skip` days are left out of the most recent end of each window (avoids short term reversal)."""

    def __init__(self, adj, lookbacks=(63, 126, 252), skip=0, vol_mode="same", min_hist=None):
        self.adj = adj
        self.lookbacks = lookbacks
        self.skip = skip
        self.vol_mode = vol_mode
        self.ret = adj.pct_change(fill_method=None)
        self.min_hist = min_hist or max(lookbacks) + skip
        self._cache = {}
        self._build()

    def _build(self):
        a = self.adj
        comps = []
        for L in self.lookbacks:
            end = a.shift(self.skip)
            start = a.shift(self.skip + L)
            r = end / start - 1
            r_d = self.ret.shift(self.skip)
            if self.vol_mode == "same":
                v = r_d.rolling(L, min_periods=int(L * 0.8)).std() * np.sqrt(252)
            elif self.vol_mode == "year":
                v = r_d.rolling(252, min_periods=200).std() * np.sqrt(252)
            else:
                v = 1.0
            ann = (1 + r) ** (252 / L) - 1 if self.vol_mode != "raw" else r
            comps.append(ann / v if self.vol_mode != "none" else r)
        self.score = sum(comps) / len(comps)
        hist_ok = a.notna().rolling(self.min_hist, min_periods=self.min_hist).sum() >= self.min_hist * 0.95
        self.score = self.score.where(hist_ok)

    def at(self, date):
        """Scores using the last trading day on or before `date`."""
        i = self.score.index.searchsorted(date, side="right") - 1
        return self.score.iloc[i]


def eligible(raw, date, symbols, max_price):
    i = raw.index.searchsorted(date, side="right") - 1
    px = raw.iloc[i]
    ok = [s + ".NS" for s in symbols if (s + ".NS") in px.index]
    px = px[ok].dropna()
    px = px[px < max_price] if max_price else px
    return list(px.index)


def pick(scorer, raw, date, symbols, max_price, n, incumbents=(), buffer=0):
    """Top n by score. With buffer > 0 an incumbent stays while its rank is within n + buffer."""
    names = eligible(raw, date, symbols, max_price)
    sc = scorer.at(date)[names].dropna().sort_values(ascending=False)
    rk = list(sc.index)
    keep = [p for p in incumbents if p in rk[: n + buffer]] if buffer else []
    return ([k for k in keep] + [x for x in rk if x not in keep])[:n]
