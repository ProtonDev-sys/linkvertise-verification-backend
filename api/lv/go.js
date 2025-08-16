import { get, refresh } from "./_mem.js";

export default async function handler(req, res) {
  const { sid } = req.query || {};
  if (!sid) return res.status(400).send("missing sid");

  const ttl = parseInt(process.env.TTL_SECS || "600", 10);
  const sess = get(`sid:${sid}`);
  if (!sess) return res.status(410).send("session expired");
  refresh(`sid:${sid}`, ttl);

  const lv = process.env.LINKVERTISE_PAGE_URL;
  if (!lv) return res.status(500).send("LINKVERTISE_PAGE_URL not set");

  // Set Linkvertise Destination to: https://<your-domain>/api/lv/complete
  res.writeHead(302, { Location: lv });
  res.end();
}
