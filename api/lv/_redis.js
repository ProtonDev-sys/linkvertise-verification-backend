const URL = process.env.UPSTASH_REDIS_REST_URL || "";
const TOK = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const HAS = URL && TOK;

export async function redisFetch(path, body) {
  if (!HAS) throw new Error("NO_UPSTASH");
  const res = await fetch(`${URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOK}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body || {})
  });
  if (!res.ok) throw new Error(`UPSTASH_${res.status}`);
  return res.json();
}

export async function setex(key, secs, val) {
  return redisFetch("/setex/" + encodeURIComponent(key) + "/" + secs, { value: JSON.stringify(val) });
}

export async function get(key) {
  const r = await redisFetch("/get/" + encodeURIComponent(key));
  if (!r || !r.result) return null;
  try { return JSON.parse(r.result); } catch { return r.result; }
}

export async function del(key) {
  try { return await redisFetch("/del/" + encodeURIComponent(key)); }
  catch { return null; }
}
