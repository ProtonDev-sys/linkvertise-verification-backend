import { setex } from "./_redis.js";
export default async function handler(req, res) {
  try {
    const xf = req.headers["x-forwarded-for"];
    const ip = (xf ? xf.split(",")[0].trim() : "") || req.socket?.remoteAddress || "0.0.0.0";
    const ttl = parseInt(process.env.TTL_SECS || "600", 10);
    await setex(`lv:ip:${ip}`, ttl, { at: Date.now() });
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`<!doctype html><meta name=viewport content="width=device-width,initial-scale=1">
<body style="font:16px system-ui;padding:24px;background:#111;color:#eee">
<h2>✅ Verification complete</h2><p>You can return to Roblox now.</p></body>`);
  } catch { res.status(500).send("Internal error"); }
}
