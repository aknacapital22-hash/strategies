// Sends email through Brevo's web API (not SMTP, which free Render services cannot use).
// Runs only where the database is: the backend on Render, or local development.

export const mailConfigured = () => Boolean(process.env.BREVO_API_KEY?.trim() && process.env.MAIL_FROM?.trim());

/** "refused": it certainly was not sent. "unknown": Brevo may have accepted it, so sending again could send it twice. */
export type Delivery = "sent" | "refused" | "unknown";

/** Errors from before a connection was made: nothing can have reached Brevo. */
const NEVER_CONNECTED = ["ENOTFOUND", "EAI_AGAIN", "ECONNREFUSED", "UND_ERR_CONNECT_TIMEOUT"];

export const sendMail = async (to: string, subject: string, text: string): Promise<boolean> => (await deliverMail(to, subject, text)) === "sent";

export async function deliverMail(to: string, subject: string, text: string, html?: string): Promise<Delivery> {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": (process.env.BREVO_API_KEY ?? "").trim(), "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sender: { name: "15Stocks by AKNA Capital", email: (process.env.MAIL_FROM ?? "").trim() }, to: [{ email: to }], subject, textContent: text, ...(html && { htmlContent: html }) }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    // The recipient and the message are left out of the log: the message holds a live code.
    if (!res.ok) console.error("mail: Brevo refused the message, status", res.status);
    if (res.ok) return "sent";
    return res.status < 500 && res.status !== 408 ? "refused" : "unknown";
  } catch (e) {
    console.error("mail: could not reach Brevo:", e instanceof Error ? e.name : "error");
    const code = (e as { cause?: { code?: string } }).cause?.code;
    return code && NEVER_CONNECTED.includes(code) ? "refused" : "unknown";
  }
}
