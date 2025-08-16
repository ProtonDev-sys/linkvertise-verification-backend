import { setex } from "./_redis.js";

export default async function handler(req, res) {
  try {
    const ttl = parseInt(process.env.TTL_SECS || "600", 10);
    // works on both Node and Edge
    const sid = (globalThis.crypto && crypto.randomUUID) ? crypto.randomUUID()
              : (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

    const xf = req.headers["x-forwarded-for"];
    const clientIp = (xf ? xf.split(",")[0].trim() : "") || req.socket?.remoteAddress || "0.0.0.0";

    await setex(`lv:sid:${sid}`, ttl, { ip: clientIp, createdAt: Date.now(), verified: false });

    const proto = req.headers["x-forwarded-proto"] || "https";
    const host  = req.headers.host;
    const goUrl = new URL(`/api/lv/go`, `${proto}://${host}`);
    goUrl.searchParams.set("sid", sid);

    res.status(200).json({ sid, go_url: goUrl.toString(), ttl_seconds: ttl });
  } catch (e) {
    const msg = (e && e.message) || String(e);
    const hint = msg === "NO_UPSTASH" ? "Missing UPSTASH env vars." : "Internal error.";
    res.status(500).send(hint);
  }
}
