"""Downloads the benchmark index closes used on the strategy pages. Usage (cwd = app/): python engine/fetch_indices.py"""
import os, yfinance as yf, pandas as pd
HERE = os.path.dirname(os.path.abspath(__file__))
T = {"NIFTY500": "^CRSLDX", "NIFTY100": "^CNX100", "MIDCAP150": "NIFTYMIDCAP150.NS", "SMALLCAP250": "NIFTYSMLCAP250.NS", "ENERGY": "^CNXENERGY", "NIFTY50": "^NSEI"}
out = {}
for k, t in T.items():
    h = yf.download(t, start="2021-10-01", progress=False, auto_adjust=True)["Close"]
    out[k] = h.squeeze()
pd.DataFrame(out).ffill().to_csv(os.path.join(HERE, "data", "indices.csv"))
print(pd.DataFrame(out).tail(2))
