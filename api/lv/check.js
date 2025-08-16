import { get, setex } from "./_mem.js";

export default async function handler(req, res) {
  const { sid } = req.query || {};
  if (!sid) return res.status(400).json({ valid:false, error:"missing sid" });

  const ttl = parseInt(process.env.TTL_SECS || "600", 10);
  const xf = req.headers["x-forwarded-for"];
  const ip = (xf ? xf.split(",")[0].trim() : "") || req.socket?.remoteAddress || "0.0.0.0";

  let sess = get(`sid:${sid}`);
  if (!sess) {
    // Recreate a placeholder so we can still mark verified if IP completed
    sess = { ip, createdAt: Date.now(), verified: false };
  }

  const ipRec = get(`ip:${ip}`);
  if (ipRec) sess.verified = true;

  setex(`sid:${sid}`, ttl, sess); // persist/refresh
  res.status(200).json({ valid: !!sess.verified });
}
