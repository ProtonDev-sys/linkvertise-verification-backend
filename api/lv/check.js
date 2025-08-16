import { get, setex } from "./_mem.js";

export default async function handler(req, res) {
  const { sid } = req.query || {};
  if (!sid) return res.status(400).json({ valid:false, error:"missing sid" });

  const ttl = parseInt(process.env.TTL_SECS || "600", 10);
  const xf = req.headers["x-forwarded-for"];
  const ip = (xf ? xf.split(",")[0].trim() : "") || req.socket?.remoteAddress || "0.0.0.0";

  let sess = get(`sid:${sid}`);
  const ipRec = get(`ip:${ip}`);

  let valid = false;
  if (sess && sess.verified) valid = true;
  else if (ipRec) {
    // if IP completed, bless this sid too (useful for in-memory resets)
    valid = true;
    sess = (sess || { ip, createdAt: Date.now(), verified: false });
    sess.verified = true;
    setex(`sid:${sid}`, ttl, sess);
  }

  res.status(200).json({ valid });
}
