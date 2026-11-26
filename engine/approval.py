"""A new list is published only after the Research Analyst has approved that exact list.

Usage (cwd = app/):  python engine/approval.py <published results.json> [--code CODE]
Prints "approved=true" or "approved=false" for the workflow, and writes what is waiting to the run summary.

Every new list gets a short code made from its signal date, stocks and weights. The workflow publishes only when it
is started by hand with that code. Scheduled runs have no code, so they can never publish. If the list changes after
it was reviewed, the code changes too, and the old approval no longer counts.
"""
import argparse, hashlib, json, os

HERE = os.path.dirname(os.path.abspath(__file__))


def pending(old, new):
    """The baskets with a new signal, in a fixed order."""
    return [slug for slug in sorted(new) if slug in old and new[slug]["schedule"]["lastSignal"] != old[slug]["schedule"]["lastSignal"]]


def approval_code(old, new):
    """The same for the same lists; different if any signal date, stock or weight differs."""
    lists = [[slug, new[slug]["schedule"]["lastSignal"], sorted([p["symbol"], round(p["weight"], 1)] for p in new[slug]["portfolio"])]
             for slug in pending(old, new)]
    return hashlib.sha256(json.dumps(lists, separators=(",", ":")).encode()).hexdigest()[:8].upper()


def is_approved(old, new, code):
    return bool(pending(old, new)) and (code or "").strip().upper() == approval_code(old, new)


def summary(old, new, approved, given):
    slugs = pending(old, new)
    if not slugs:
        return "No new list. Nothing needs approval.\n"
    code = approval_code(old, new)
    lines = [f"## {'Approved list: publishing' if approved else 'New list waiting for Research Analyst approval'}", ""]
    if given and not approved:
        lines += [f"**The code entered ({given}) does not match.** The list may have changed since it was reviewed. Please review it again.", ""]
    for slug in slugs:
        signal = new[slug]["schedule"]["lastSignal"]
        change = next((c for c in new[slug]["changes"] if c["signal"] == signal), {"in": [], "out": []})
        lines += [f"### {slug} (list of {signal})",
                  f"- Added: {', '.join(change['in']) or 'none'}",
                  f"- Removed: {', '.join(change['out']) or 'none'}",
                  "- Full list: " + ", ".join(f"{p['symbol']} {p['weight']:.1f}%" for p in new[slug]["portfolio"]), ""]
    if not approved:
        lines += [f"**Approval code: `{code}`**", "",
                  "Nothing has been published or emailed. After the Research Analyst approves this list: Actions > Rebalance strategies > "
                  "Run workflow, and enter the code. Run it after 4 pm IST, or before the market opens."]
    return "\n".join(lines) + "\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("previous")
    ap.add_argument("--code", default="")
    args = ap.parse_args()
    load = lambda p: json.load(open(p, encoding="utf8"))
    old, new = load(args.previous), load(os.path.join(HERE, "out", "results.json"))
    given = args.code.strip().upper()
    if given and not given.isalnum():
        given = "invalid"
    approved = is_approved(old, new, given)
    target = os.environ.get("GITHUB_STEP_SUMMARY")
    if target:
        with open(target, "a", encoding="utf8") as f:
            f.write(summary(old, new, approved, given))
    print("approved=" + str(approved).lower())


if __name__ == "__main__":
    main()
