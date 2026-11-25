// Sends email through Brevo's web API (not SMTP, which free Render services cannot use).
// Runs only where the database is: the backend on Render, or local development.

export const mailConfigured = () => Boolean(process.env.BREVO_API_KEY?.trim() && process.env.MAIL_FROM?.trim());

export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": (process.env.BREVO_API_KEY ?? "").trim(), "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ sender: { name: "AKNA Capital", email: (process.env.MAIL_FROM ?? "").trim() }, to: [{ email: to }], subject, textContent: text }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    // The recipient and the message are left out of the log: the message holds a live code.
    if (!res.ok) console.error("mail: Brevo refused the message, status", res.status);
    return res.ok;
  } catch (e) {
    console.error("mail: could not reach Brevo:", e instanceof Error ? e.name : "error");
    return false;
  }
}
