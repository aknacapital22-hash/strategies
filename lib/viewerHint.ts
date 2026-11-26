/**
 * The name of the cookie that tells the browser someone is signed in (first name, and whether to show the Admin
 * link). It lets the header and the public pages stay static. It proves nothing: every private page and action
 * checks the signed, httpOnly session cookie on the server.
 */
export const HINT_COOKIE = "akna_hint";
