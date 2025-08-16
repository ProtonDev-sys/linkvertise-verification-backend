const URL = process.env.UPSTASH_REDIS_REST_URL || "";
const TOK = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const HAS = URL && TOK;

// In-memory dev fallback (NOT durable, ok for testing)
const mem = (globalThis.__MEM_REDIS ||= new Map());
function memSetex(key, secs, val) { mem.set(key, { v: val, e: Date.now()+secs*1000 }); return { ok:true }; }
function memGet(key){ const it=mem.get(key); if(!it) return null; if(Date.now()>it.e){ mem.delete(key); return null; } return it.v; }
function memDel(key){ mem.delete(key); return { ok:true }; }

export async function setex(key, secs, val) {
  if (!HAS) return memSetex(key, secs, val);
  const res = await fetch(`${URL}/setex/${encodeURIComponent(key)}/${secs}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOK}`, "Content-Type": "application/json" },
    body: JSON.stringify({ value: JSON.stringify(val) })
  });
  if (!res.ok) throw new Error("UPSTASH_SETEX");
  return res.json();
}
export async function get(key) {
  if (!HAS) return memGet(key);
  const res = await fetch(`${URL}/get/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOK}` }
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (!json || !json.result) return null;
  try { return JSON.parse(json.result); } catch { return json.result; }
}
export async function del(key) {
  if (!HAS) return memDel(key);
  try {
    return await fetch(`${URL}/del/${encodeURIComponent(key)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${TOK}` }
    });
  } catch { return null; }
}
