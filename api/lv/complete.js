import { get, setex } from "./_redis.js";

export default async function handler(req, res) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "0.0.0.0";
  const ttl = parseInt(process.env.TTL_SECS || "600", 10);
  // Mark this IP verified (latest timestamp)
  await setex(`lv:ip:${ip}`, ttl, { at: Date.now() });

  // Also mark any pending sid from this IP as verified (best-effort)
  // (Optional shortcut: the client mainly checks by sid; we’ll verify on /check)
  // Simple HTML thank-you page:
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html><meta name=viewport content="width=device-width,initial-scale=1">
  <body style="font:16px system-ui;padding:24px;background:#111;color:#eee">
    <h2>✅ Verification complete</h2>
    <p>You can return to Roblox now.</p>
  </body>`);
}
