"""What has been published stays published.

Every run recomputes the whole back test, and the price source sometimes revises old prices. Left alone, that could
change a portfolio or a past rebalance that subscribers have already acted on. So before a new run replaces the
published file:
  - a basket with no new signal keeps its published stocks, weights and history (only prices are refreshed);
  - a basket with a new signal takes the new stocks, keeps its older history as published, and states what was added
    and removed compared with the portfolio that was actually published.
A deliberate change to a basket's rules (its `config`) starts that basket's record again.

To notice bad price data, each publication also keeps what the engine itself computed (`computed`). The next run is
compared with that, not with the published record: differences from the record only ever add up, while differences
from the last calculation show what has changed in the data since.
"""
import copy

FUNDS = {"LIQUIDCASE", "GOLDBEES"}
KEEP = 8  # rebalances shown in the log


def stocks(portfolio):
    return {p["symbol"] for p in portfolio if p["symbol"] not in FUNDS}


def refresh_prices(portfolio, latest):
    prices = {p["symbol"]: p["price"] for p in latest if p.get("price")}
    return [{**p, "price": prices.get(p["symbol"], p["price"])} for p in portfolio]


def record(changes):
    return [dict(signal=c["signal"], status=c["status"], **{"in": sorted(c["in"]), "out": sorted(c["out"])}) for c in changes]


def revisions(old, new):
    """(past rebalances in both calculations, how many of them now come out differently)."""
    fresh = {c["signal"]: c for c in record(new["changes"])}
    both = [(c, fresh[c["signal"]]) for c in record(old.get("computed") or old["changes"]) if c["status"] == "done" and c["signal"] in fresh]
    return len(both), sum((a["in"], a["out"]) != (b["in"], b["out"]) for a, b in both)


def freeze_basket(old, new, prices=None):
    """Returns (the result to publish, past entries compared, past entries computed differently than last time)."""
    computed = record(new["changes"])
    if old is None or old["config"] != new["config"] or new["schedule"]["lastSignal"] < old["schedule"]["lastSignal"]:
        return {**new, "computed": computed}, 0, 0  # a new basket or new rules; a signal going backwards is left for the safety checks
    compared, revised = revisions(old, new)
    fresh = {c["signal"]: c for c in new["changes"]}
    published = copy.deepcopy(old["changes"])
    for c in published:
        n = fresh.get(c["signal"])
        if n is not None and c["status"] == "pending" and n["status"] == "done":  # the trades have now happened
            c["status"], c["exec"] = "done", n["exec"]

    out = copy.deepcopy(new)
    out["computed"] = computed
    signal = new["schedule"]["lastSignal"]
    if signal == old["schedule"]["lastSignal"]:
        portfolio = copy.deepcopy(old["portfolio"])
        held = {p["symbol"] for p in portfolio}
        latest = [p for p in new["portfolio"] if p["symbol"] in held]
        if prices:  # also for a stock the new run no longer picks
            latest += [{"symbol": s, "price": prices[s]} for s in held - {p["symbol"] for p in latest} if s in prices]
        out["portfolio"] = refresh_prices(portfolio, latest)
        out["portfolioAsOf"] = old["portfolioAsOf"]
        out["changes"] = published[:KEEP]
    else:
        mine = fresh.get(signal, {})
        now, before = stocks(new["portfolio"]), stocks(old["portfolio"])
        entry = dict(signal=signal, exec=mine.get("exec"), status=mine.get("status", "pending"),
                     size=len(now), **{"in": sorted(now - before), "out": sorted(before - now)})
        out["changes"] = ([entry] + [c for c in published if c["signal"] < signal])[:KEEP]
    return out, compared, revised


def freeze(old, new, prices=None):
    """All baskets. Returns (results, compared, revised)."""
    out, compared, revised = {}, 0, 0
    for slug, result in new.items():
        out[slug], c, r = freeze_basket(old.get(slug), result, prices)
        compared, revised = compared + c, revised + r
    return out, compared, revised
