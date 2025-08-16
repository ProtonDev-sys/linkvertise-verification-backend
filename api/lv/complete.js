import { get, setex } from "./_mem.js";

function readCookies(req) {
  const raw = req.headers.cookie || "";
  const o = {};
  raw.split(/; */).forEach(p => { const [k,v] = p.split("="); if(k&&v) o[k]=v; });
  return o;
}

export default async function handler(req, res) {
  const ttl = parseInt(process.env.TTL_SECS || "600", 10);
  const xf = req.headers["x-forwarded-for"];
  const ip = (xf ? xf.split(",")[0].trim() : "") || req.socket?.remoteAddress || "0.0.0.0";

  // mark IP verified (fallback)
  await setex(`ip:${ip}`, ttl, { at: Date.now() });

  // mark SID verified (cookie set by /go)
  const sid = readCookies(req).sid;
  if (sid) {
    const sess = get(`sid:${sid}`) || { ip, createdAt: Date.now(), verified: false };
    sess.verified = true;
    await setex(`sid:${sid}`, ttl, sess);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(`<!doctype html><meta name=viewport content="width=device-width,initial-scale=1">
<body style="font:16px system-ui;padding:24px;background:#111;color:#eee">
  <h2>✅ Verification complete</h2>
  <p>You can return to Roblox now. Verified for ${Math.floor(ttl/60)} minutes.</p>
</body>`);
}
