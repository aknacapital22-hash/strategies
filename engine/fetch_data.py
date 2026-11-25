"""Download daily prices for every symbol in the universe lists.
Usage: python -I engine/fetch_data.py
Writes engine/data/close_adj.csv.gz (dividend/split adjusted) and close_raw.csv.gz (for price filters).
"""
import glob, os, sys
import pandas as pd
import yfinance as yf

ROOT = os.path.dirname(os.path.abspath(__file__))
START = "2020-06-01"

syms = set()
for f in glob.glob(os.path.join(ROOT, "universe", "*.csv")):
    df = pd.read_csv(f)
    syms |= set(df["Symbol"].astype(str).str.strip())
tickers = sorted(s + ".NS" for s in syms) + ["LIQUIDCASE.NS", "GOLDBEES.NS", "^NSEI", "^CRSLDX"]
print(len(tickers), "tickers")

adj, raw = [], []
CH = 100
for i in range(0, len(tickers), CH):
    chunk = tickers[i : i + CH]
    d = yf.download(chunk, start=START, auto_adjust=False, progress=False, threads=True)
    adj.append(d["Adj Close"])
    raw.append(d["Close"])
    print("chunk", i // CH + 1, "ok")

adj = pd.concat(adj, axis=1).sort_index()
raw = pd.concat(raw, axis=1).sort_index()
adj = adj.dropna(axis=1, how="all")
raw = raw[adj.columns]
missing = sorted(set(tickers) - set(adj.columns))
print("no data for", len(missing), "tickers:", missing[:40])
adj.to_csv(os.path.join(ROOT, "data", "close_adj.csv.gz"))
raw.to_csv(os.path.join(ROOT, "data", "close_raw.csv.gz"))
print(adj.shape, adj.index.min().date(), adj.index.max().date())
