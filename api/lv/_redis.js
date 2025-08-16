// Upstash REST (GET-style) + safe in-memory fallback

const BASE = (process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/+$/,"");
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || "";
const HAS = BASE && TOKEN;

// dev fallback (not durable)
const mem = (globalThis.__MEM_REDIS ||= new Map());
function memSetex(key, secs, val){ mem.set(key,{v:val,e:Date.now()+secs*1000}); return { ok:true }; }
function memGet(key){ const it=mem.get(key); if(!it) return null; if(Date.now()>it.e){ mem.delete(key); return null; } return it.v; }
function memDel(key){ mem.delete(key); return { ok:true }; }

async function upstashGET(path){
  const res = await fetch(`${BASE}${path}`, { headers:{ Authorization:`Bearer ${TOKEN}` } });
  if (!res.ok) throw new Error(`UPSTASH_${res.status}`);
  return res.json();
}

export async function setex(key, secs, val){
  if (!HAS) return memSetex(key, secs, val);
  const k = encodeURIComponent(key);
  const v = encodeURIComponent(JSON.stringify(val));
  return upstashGET(`/setex/${k}/${secs}/${v}`);
}

export async function get(key){
  if (!HAS) return memGet(key);
  const k = encodeURIComponent(key);
  const r = await upstashGET(`/get/${k}`);
  if (!r || !r.result) return null;
  try { return JSON.parse(r.result); } catch { return r.result; }
}

export async function del(key){
  if (!HAS) return memDel(key);
  const k = encodeURIComponent(key);
  try { return await upstashGET(`/del/${k}`); } catch { return null; }
}
