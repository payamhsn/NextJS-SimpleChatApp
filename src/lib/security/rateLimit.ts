type Entry = { count: number; windowStart: number };
const store = new Map<string, Entry>();

export function rateLimit(ip: string, limit = 60, windowMs = 60_000) {
  const now = Date.now();
  const e = store.get(ip);
  if (!e || now - e.windowStart > windowMs) {
    store.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (e.count >= limit) return false;
  e.count += 1; store.set(ip, e); return true;
}