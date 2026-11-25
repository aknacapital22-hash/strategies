"""Parse downloaded strategy .md pages into lib/strategies.json.
Usage: python -I build_data.py <md_dir> <out_json>
"""
import json, re, sys, os

md_dir, out = sys.argv[1], sys.argv[2]
num = lambda s: float(s.replace("−", "-").replace("+", "").replace("%", "").replace(",", ""))


def listing(index_md):
    cards = {}
    pat = re.compile(
        r"\[(Very High|Moderately High|Moderate|High|Low)(Momentum|Dynamic multi asset|Multi asset|Hybrid|Thematic|[A-Za-z ]+?)\s*\n\s*\n\s*(.+?)\n\s*(.+?)\n\s*CAGR, model([\d.]+)%Max DD(−[\d.]+)%From₹(\S+?)\n.*?\]\(/strategies/([a-z0-9-]+)\)",
        re.S,
    )
    for m in pat.finditer(index_md):
        risk, kind, name, universe, cagr, dd, mn, slug = m.groups()
        cards[slug] = dict(
            risk=risk.strip(), kind=kind.strip(), name=name.strip(), universe=universe.strip(),
            cagr=float(cagr), maxDd=num(dd), minimum="₹" + mn, slug=slug,
        )
    return cards


def parse_page(md):
    d = {}
    m = re.search(r"\n\s+(\w[^\n]*? is an? \w+ index[^\n]*)", md)
    # Source copy names its own brand ("... is a <Brand> index ..."); swap in ours.
    d["summary"] = re.sub(r"\ba \w+ index\b", "an AKNA Capital index", m.group(1).strip()) if m else ""
    m = re.search(r"Model, back tested: ([^\n]+)", md)
    d["backtest"] = m.group(1).strip() if m else ""
    m = re.search(r"₹100 on (.+?) became ₹([\d,]+) by (.+?) \(the Nifty 50 index ₹([\d,]+)", md)
    if m:
        d["growth"] = dict(start=m.group(1), end=m.group(3), model=num(m.group(2)), nifty=num(m.group(4)))
    m = re.search(r"Fee per rebalance\*\*([^*]+)\*\*", md)
    # calendar years
    d["calendar"] = [
        dict(year=y, note=(n or "").strip(), ret=num(r))
        for y, n, r in re.findall(r"\* (\d{4})([^*\n]*)\*\*([+−-][\d.]+)%\*\*", md)
    ]
    # monthly table
    months = []
    for row in re.findall(r"^\| (20\d\d) \|(.+)\|$", md, re.M):
        year, rest = row
        cells = [c.strip() for c in rest.split("|")]
        for i, c in enumerate(cells[:12]):
            mm = re.match(r"^([−-]?[\d.]+)", c)
            if mm and "no data" not in c:
                months.append(dict(y=int(year), m=i + 1, r=num(mm.group(1))))
    d["monthly"] = months
    # drawdowns
    dds = []
    sec = re.search(r"Exact dates of the deepest falls\n(.+?)\n\n", md, re.S)
    if sec:
        for line in sec.group(1).split("\n"):
            m = re.match(r"\d+\. \*\*([−-][\d.]+)%\*\* (.+?)\*(.+?)\*$", line.strip())
            if m:
                dds.append(dict(depth=num(m.group(1)), when=m.group(2).strip(), days=m.group(3)))
    d["drawdowns"] = dds
    # rolling
    roll = []
    for title, body in re.findall(r"##### (Any [^\n]+)\n(.+?)(?=\n\n)", md, re.S):
        g = lambda k: (re.search(k + r"([+−-]?[\d.]+)%", body) or [None, None])[1]
        pm = re.search(r"Positive(\d+)%of (\d+) windows", body)
        roll.append(dict(
            label=title, worst=num(g("Worst")), median=num(g("Median")), best=num(g("Best")),
            positive=int(pm.group(1)) if pm else None, windows=int(pm.group(2)) if pm else None,
        ))
    d["rolling"] = roll
    # holdings
    m = re.search(r"#### (\d+) holdings\n(.+?)\n\n\s+Live quantities", md, re.S)
    if m:
        d["holdingCount"] = int(m.group(1))
        body = m.group(2)
        sleeves, hold = [], []
        for sym, w, tag in re.findall(r"^\* ([A-Za-z0-9&\-\. ]+?)(?:\*\*([\d.]+)%\*\*)?(?: \*([A-Za-z ]+)\*)?\s*$", body, re.M):
            if sym in ("Equity", "Debt", "Gold", "Silver", "Cash"):
                sleeves.append(dict(name=sym, weight=float(w)))
            elif re.match(r"^[A-Z0-9&\-\.]+$", sym):
                hold.append(dict(sym=sym, weight=float(w) if w else None, tag=tag or None))
        d["holdings"] = hold
        d["sleeves"] = sleeves
    sec = re.search(r"#### Sector allocation\n(.+?)\n\n", md, re.S)
    if sec:
        d["sectors"] = [dict(name=n.strip(), weight=float(w)) for n, w in re.findall(r"^\* (.+?)\*\*([\d.]+)%\*\*", sec.group(1), re.M)]
    # rebalance stats
    rb = {}
    for k, pat in [("count", r"published rebalances(\d+)"), ("latest", r"latest rebalance([^\n]+)"), ("next", r"next scheduled([^\n]+)")]:
        m = re.search(pat, md)
        if m:
            rb[k] = m.group(1).strip()
    d["rebalances"] = rb
    return d


cards = listing(open(os.path.join(md_dir, "_index.md"), encoding="utf8").read())
result = []
for slug, card in cards.items():
    path = os.path.join(md_dir, slug + ".md")
    if not os.path.exists(path):
        print("missing md for", slug)
        continue
    card.update(parse_page(open(path, encoding="utf8").read()))
    result.append(card)

# Brand rename: the broker prefix is dropped from the strategy name, slug and any copy.
text = json.dumps(result, ensure_ascii=False, indent=1).replace("5Paisa ", "").replace("5paisa-", "")
open(out, "w", encoding="utf8").write(text)
for r in result:
    print(r["slug"], r["cagr"], len(r.get("monthly", [])), len(r.get("holdings", [])), len(r.get("sectors", [])), len(r.get("drawdowns", [])), len(r.get("rolling", [])), "growth" in r)
