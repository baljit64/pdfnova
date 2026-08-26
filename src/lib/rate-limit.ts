type LimitResult = { allowed: boolean; retryAfter?: number };
type LocalEntry = { count: number; resetAt: number };

const localLimits = new Map<string, LocalEntry>();

function clientAddress(request: Request): string {
  return request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-real-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
}

async function durableLimit(key: string, windowMs: number, maximum: number): Promise<LimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const script = [
    "local count = redis.call('INCR', KEYS[1])",
    "if count == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end",
    "local ttl = redis.call('PTTL', KEYS[1])",
    "return {count, ttl}",
  ].join(" ");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(["EVAL", script, "1", key, String(windowMs)]),
      signal: AbortSignal.timeout(3_000),
      cache: "no-store",
    });
    if (!response.ok) return null;
    const payload = await response.json() as { result?: [number, number] };
    const [rawCount, ttl] = payload.result ?? [];
    if (!Number.isFinite(rawCount)) return null;
    const count = Number(rawCount);
    return {
      allowed: count <= maximum,
      retryAfter: count > maximum ? Math.max(1, Math.ceil((ttl || windowMs) / 1_000)) : undefined,
    };
  } catch {
    return null;
  }
}

export async function takeRateLimit(
  request: Request,
  namespace: string,
  maximum = 6,
  windowMs = 60_000
): Promise<LimitResult> {
  const key = `pdfnova:${namespace}:${clientAddress(request)}`;
  const durable = await durableLimit(key, windowMs, maximum);
  if (durable) return durable;

  const now = Date.now();
  const entry = localLimits.get(key);
  if (!entry || entry.resetAt <= now) {
    localLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (entry.count >= maximum) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1_000)) };
  }
  entry.count += 1;
  return { allowed: true };
}
