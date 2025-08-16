import { get, setex } from "../_redis.js";

export default async function handler(req, res) {
  try {
    const { sid } = req.query || {};
    if (!sid) return res.status(400).json({ valid:false, error:"missing sid" });

    const xf = req.headers["x-forwarded-for"];
    const ip = (xf ? xf.split(",")[0].trim() : "") || req.socket?.remoteAddress || "0.0.0.0";
    const ttl = parseInt(process.env.TTL_SECS || "600", 10);

    const sess = await get(`lv:sid:${sid}`);
    if (!sess) return res.status(410).json({ valid:false, error:"session expired" });

    const ipRec = await get(`lv:ip:${ip}`);
    if (ipRec && sess.ip === ip) {
      sess.verified = true;
      await setex(`lv:sid:${sid}`, ttl, sess);
    }
    res.status(200).json({ valid: !!sess.verified });
  } catch {
    res.status(500).json({ valid:false, error:"internal" });
  }
}
