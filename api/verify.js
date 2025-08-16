export default async function handler(req, res) {
  const { hash } = req.query || {};
  if (!hash) return res.status(400).json({ valid: false, error: "missing hash" });

  const token = process.env.LINKVERTISE_PUBLISHER_TOKEN;
  if (!token) return res.status(500).json({ valid: false, error: "server misconfig" });

  const url = `https://publisher.linkvertise.com/api/v1/anti_bypassing?token=${encodeURIComponent(token)}&hash=${encodeURIComponent(hash)}`;
  const resp = await fetch(url, { method: "POST" });
  const text = (await resp.text() || "").trim().toLowerCase();
  const ok = resp.ok && (text === "true" || text === "1" || text.includes('"true"'));

  res.status(200).json({ valid: ok });
}
