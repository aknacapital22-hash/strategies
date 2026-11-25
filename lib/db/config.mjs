// Connection settings for node-postgres, shared by the app (lib/db/index.ts) and the migration script.
import dns from "node:dns";
import net from "node:net";

/**
 * Neon requires TLS. "sslmode=require" is made explicit as "verify-full" (certificate and hostname checked), which is
 * what node-postgres already does for it, and "channel_binding" is dropped because node-postgres does not read it.
 * @param {string} raw
 */
export function normaliseUrl(raw) {
  const u = new URL(raw);
  u.searchParams.set("sslmode", "verify-full");
  u.searchParams.delete("channel_binding");
  return u.toString();
}

/**
 * Optional, for networks whose DNS cannot resolve the Neon endpoint (some home routers): DB_DNS_SERVERS="8.8.8.8,1.1.1.1"
 * makes only the database connection look the host up through those servers. TLS still verifies the real hostname.
 * Leave it unset on servers.
 */
function customStream() {
  const servers = (process.env.DB_DNS_SERVERS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (servers.length === 0) return undefined;
  const resolver = new dns.Resolver({ timeout: 4000, tries: 2 });
  resolver.setServers(servers);
  /** @type {import("node:net").LookupFunction} */
  const lookup = (hostname, options, callback) => {
    resolver.resolve4(hostname, (err, addresses) => {
      if (err || !addresses?.length) return dns.lookup(hostname, options, callback); // fall back to the system resolver
      const all = typeof options === "object" && options?.all;
      // @ts-expect-error: the callback shape depends on options.all
      return all ? callback(null, addresses.map((address) => ({ address, family: 4 }))) : callback(null, addresses[0], 4);
    });
  };
  return () => {
    const socket = new net.Socket();
    const connect = socket.connect.bind(socket);
    // node-postgres calls socket.connect(port, host): pass our lookup along
    socket.connect = /** @type {any} */ ((port, host) => connect({ port, host, lookup }));
    return socket;
  };
}

/** @param {string} raw */
export function pgConfig(raw) {
  const stream = customStream();
  return { connectionString: normaliseUrl(raw), connectionTimeoutMillis: 20000, ...(stream ? { stream } : {}) };
}
