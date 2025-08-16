import { get, setex } from "./_redis.js";

export default async function handler(req, res) {
  const { sid } = req.query || {};
  const ttl = parseInt(process.env.TTL_SECS || "600", 10);
  if (!sid) return res.status(400).send("missing sid");
  const sess = await get(`lv:sid:${sid}`);
  if (!sess) return res.status(410).send("session expired");
  // refresh session TTL on click
  await setex(`lv:sid:${sid}`, ttl, sess);
  const lv = process.env.LINKVERTISE_PAGE_URL; // your Linkvertise page
  if (!lv) return res.status(500).send("server misconfig");
  // The Linkvertise Destination (in their dashboard) must be: https://<your-domain>/api/lv/complete
  res.writeHead(302, { Location: lv });
  res.end();
}
