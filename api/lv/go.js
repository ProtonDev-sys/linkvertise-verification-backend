import { get, refresh, setex } from "./_mem.js";

export default async function handler(req, res) {
  const { sid } = req.query || {};
  if (!sid) return res.status(400).send("missing sid");

  const ttl = parseInt(process.env.TTL_SECS || "600", 10);
  let sess = get(`sid:${sid}`);
  if (!sess) {
    const xf = req.headers["x-forwarded-for"];
    const ip = (xf ? xf.split(",")[0].trim() : "") || req.socket?.remoteAddress || "0.0.0.0";
    sess = { ip, createdAt: Date.now(), verified: false };
  }
  setex(`sid:${sid}`, ttl, sess);         // (re)store/refresh

  // set cookie so the browser carries sid into /complete
  res.setHeader("Set-Cookie", [`sid=${sid}; Max-Age=${ttl}; Path=/; SameSite=Lax`]);

  const lv = process.env.LINKVERTISE_PAGE_URL;
  if (!lv) return res.status(500).send("LINKVERTISE_PAGE_URL not set");
  res.writeHead(302, { Location: lv });
  res.end();
}
