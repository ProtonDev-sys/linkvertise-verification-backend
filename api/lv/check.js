import { get, refresh } from "./_mem.js";

export default async function handler(req, res) {
  const { sid } = req.query || {};
  if (!sid) return res.status(400).json({ valid:false, error:"missing sid" });

  const ttl = parseInt(process.env.TTL_SECS || "600", 10);
  const xf = req.headers["x-forwarded-for"];
  const ip = (xf ? xf.split(",")[0].trim() : "") || req.socket?.remoteAddress || "0.0.0.0";

  const sess = get(`sid:${sid}`);
  if (!sess) return res.status(410).json({ valid:false, error:"session expired" });

  const ipRec = get(`ip:${ip}`);
  if (ipRec && sess.ip === ip) { sess.verified = true; refresh(`sid:${sid}`, ttl); }

  res.status(200).json({ valid: !!sess.verified });
}
