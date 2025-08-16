// Single-process in-memory store (OK for testing). Data may reset on cold start.
const store = (globalThis.__LV_MEM ||= new Map());

export function setex(key, secs, val) {
  store.set(key, { v: val, e: Date.now() + secs * 1000 });
  return { ok: true };
}
export function get(key) {
  const it = store.get(key);
  if (!it) return null;
  if (Date.now() > it.e) { store.delete(key); return null; }
  return it.v;
}
export function refresh(key, secs) {
  const it = store.get(key);
  if (!it) return null;
  it.e = Date.now() + secs * 1000;
  return { ok: true };
}
