import { get, setex } from "./_redis.js";

export default async function handler(req, res) {
  const { sid } = req.query || {};
  const ip = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "0.0.0.0";
  const ttl = parseInt(process.env.TTL_SECS || "600", 10);
  if (!sid) return res.status(400).json({ valid:false, error:"missing sid" });

  const sess = await get(`lv:sid:${sid}`);
  if (!sess) return res.status(410).json({ valid:false, error:"session expired" });

  // If IP that created session has completed, mark verified
  const ipRec = await get(`lv:ip:${ip}`);
  if (ipRec && sess.ip === ip) {
    sess.verified = true;
    await setex(`lv:sid:${sid}`, ttl, sess); // refresh
  }

  res.status(200).json({ valid: !!sess.verified });
}
