// How the rebalance email looks. It has no imports, so it can be previewed without the database or a mail key.
// Email programs ignore most CSS, so the HTML is laid out with tables and styles written on each element.

export type NoticeBasket = {
  name: string;
  /** The list's date, already written out. */
  date: string;
  /** null when there is no record of what changed. */
  change: { in: string[]; out: string[] } | null;
  url: string;
};

const CHECK = "Please check the changes before the market opens next.";
const INTRO = (many: boolean) => `${many ? "Your baskets have new lists" : "Your basket has a new list"}. ${CHECK}`;
const SAME = "Same shares. Check how much is in each against what you own.";
const ACTION = "See the full list and how many to buy or sell";
const NOTE =
  "The amount for a share can change even if it stays in the list, so compare the full list with what you own. We do not buy or sell for you. You decide and place any orders yourself.";
const RISK = "This list follows fixed rules and does not promise growth. Share prices can fall and you can lose money.";
const WHY = "You are getting this because you have a paid plan on 15Stocks. We send it once for each list update.";

/** "ASHA RAVI KUMAR" reads as shouting: greet by first name, and fix the capitals only when there are none or only capitals. */
export function firstName(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  if (!first) return "there";
  return first === first.toUpperCase() || first === first.toLowerCase() ? first.charAt(0).toUpperCase() + first.slice(1).toLowerCase() : first;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const INK = "#0b1d33";
const MUTED = "#5b6779";
const TEAL = "#0f766e";
const LINE = "#e4e7ec";
const FONT = "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;";

/** One side of the change: a coloured heading and each share name in its own box. */
function shares(label: string, symbols: string[], colour: string, background: string) {
  if (!symbols.length) return "";
  const chips = symbols
    .map((s) => `<span style="display:inline-block;margin:0 6px 6px 0;padding:4px 9px;border-radius:6px;background:${background};color:${INK};font-size:13px;font-weight:600;line-height:18px;">${esc(s)}</span> `)
    .join("");
  return `<div style="margin:14px 0 7px;font-size:12px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;color:${colour};">${label} (${symbols.length})</div><div>${chips}</div>`;
}

function card({ name, date, change, url }: NoticeBasket) {
  const body =
    change && !change.in.length && !change.out.length
      ? `<div style="margin-top:12px;font-size:14px;line-height:21px;color:${INK};">${SAME}</div>`
      : change
        ? shares("Added (buy)", change.in, "#067647", "#e7f6ee") + shares("Removed (sell)", change.out, "#b42318", "#fdecea")
        : "";
  return `<tr><td style="padding:0 24px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${LINE};border-radius:10px;">
<tr><td style="padding:18px 18px 16px;${FONT}">
<div style="font-size:17px;font-weight:700;line-height:23px;color:${INK};">${esc(name)}</div>
<div style="font-size:13px;line-height:19px;color:${MUTED};">List of ${esc(date)}</div>
${body}
<div style="margin-top:12px;"><a href="${esc(url)}" style="display:inline-block;padding:10px 16px;border-radius:8px;background:${TEAL};color:#ffffff;font-size:14px;font-weight:600;line-height:19px;text-decoration:none;">${ACTION} &rarr;</a></div>
</td></tr>
</table>
</td></tr>`;
}

export function noticeEmail(name: string, baskets: NoticeBasket[], contact: string): { subject: string; text: string; html: string } {
  const many = baskets.length > 1;
  const subject = many ? `List update: ${baskets.length} of your baskets` : `List update: ${baskets[0].name}`;
  const hello = `Hello ${firstName(name)},`;
  const heading = many ? `${baskets.length} of your baskets have new lists` : `${baskets[0].name} has a new list`;

  // The plain version, for email programs that do not show the designed one.
  const text = [
    `${hello}

${INTRO(many)}`,
    ...baskets.map(({ name, date, change, url }) => {
      const lines = [`${name.toUpperCase()} (list of ${date})`];
      if (change?.in.length) lines.push(`Added (buy): ${change.in.join(", ")}`);
      if (change?.out.length) lines.push(`Removed (sell): ${change.out.join(", ")}`);
      if (change && !change.in.length && !change.out.length) lines.push(SAME);
      lines.push(`${ACTION}:\n${url}`);
      return lines.join("\n");
    }),
    NOTE,
    RISK,
    `${WHY}\nQuestions? ${contact}`,
  ].join("\n\n----------\n\n");

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f3f4f2;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${CHECK}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f2;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${LINE};border-radius:14px;">
<tr><td style="padding:20px 24px;border-bottom:3px solid ${TEAL};${FONT}">
<span style="font-size:22px;font-weight:800;color:${INK};">15<span style="color:${TEAL};">Stocks</span></span>
<span style="font-size:12px;color:${MUTED};">&nbsp; by AKNA Capital</span>
</td></tr>
<tr><td style="padding:24px 24px 20px;${FONT}">
<h1 style="margin:0 0 12px;font-size:21px;line-height:28px;color:${INK};">${esc(heading)}</h1>
<p style="margin:0;font-size:15px;line-height:23px;color:${INK};">${esc(hello)}<br>${CHECK}</p>
</td></tr>
${baskets.map(card).join("\n")}
<tr><td style="padding:4px 24px 20px;${FONT}">
<div style="padding:14px 16px;border-radius:10px;background:#fdf6e3;font-size:14px;line-height:21px;color:${INK};">${NOTE}</div>
</td></tr>
<tr><td style="padding:16px 24px 22px;border-top:1px solid ${LINE};font-size:12px;line-height:18px;color:${MUTED};${FONT}">
<p style="margin:0 0 8px;">${RISK}</p>
<p style="margin:0;">${WHY} Questions? <a href="mailto:${esc(contact)}" style="color:${TEAL};">${esc(contact)}</a></p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, text, html };
}
