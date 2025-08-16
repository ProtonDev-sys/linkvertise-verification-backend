import crypto from "node:crypto";
import { setex } from "./_redis.js";

export default async function handler(req, res) {
  const ttl = parseInt(process.env.TTL_SECS || "600", 10);
  const sid = crypto.randomUUID();
  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "0.0.0.0";
  // Store a pending session keyed by sid
  await setex(`lv:sid:${sid}`, ttl, { ip: clientIp, createdAt: Date.now(), verified: false });
  const go = new URL(`${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/api/lv/go`);
  go.searchParams.set("sid", sid);
  res.status(200).json({ sid, go_url: go.toString(), ttl_seconds: ttl });
}
