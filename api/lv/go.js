import { get, setex } from "./_redis.js";
export default async function handler(req, res) {
  try {
    const { sid } = req.query || {};
    if (!sid) return res.status(400).send("missing sid");
    const ttl = parseInt(process.env.TTL_SECS || "600", 10);
    const sess = await get(`lv:sid:${sid}`);
    if (!sess) return res.status(410).send("session expired");
    await setex(`lv:sid:${sid}`, ttl, sess);

    const lv = process.env.LINKVERTISE_PAGE_URL;
    if (!lv) return res.status(500).send("LINKVERTISE_PAGE_URL not set");
    res.writeHead(302, { Location: lv });
    res.end();
  } catch (e) {
    res.status(500).send("Internal error");
  }
}
