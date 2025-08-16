export async function redisFetch(path, body) {
  const url = `${process.env.UPSTASH_REDIS_REST_URL}${path}`;
  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body || {})
  }).then(r => r.json());
}
export async function setex(key, secs, val) {
  return redisFetch("/setex/" + encodeURIComponent(key) + "/" + secs, { value: JSON.stringify(val) });
}
export async function get(key) {
  const r = await redisFetch("/get/" + encodeURIComponent(key));
  if (!r || !r.result) return null;
  try { return JSON.parse(r.result); } catch { return r.result; }
}
export async function del(key) { return redisFetch("/del/" + encodeURIComponent(key)); }
