"use client"

type CacheEntry<T> = {
  expiresAt: number
  value: T
}

type InflightEntry<T> = {
  promise: Promise<T>
  abort?: AbortController
}

declare global {
  // eslint-disable-next-line no-var
  var __clientJsonCache: Map<string, CacheEntry<unknown>> | undefined
  // eslint-disable-next-line no-var
  var __clientInflight: Map<string, InflightEntry<unknown>> | undefined
}

function getJsonCache() {
  if (!globalThis.__clientJsonCache) globalThis.__clientJsonCache = new Map()
  return globalThis.__clientJsonCache
}

function getInflight() {
  if (!globalThis.__clientInflight) globalThis.__clientInflight = new Map()
  return globalThis.__clientInflight
}

function normalizeUrlKey(input: string): string {
  // Ensure logically identical requests (param order, repeated params) share a cache key.
  // This is intentionally lossy w.r.t. ordering because filter param order isn't meaningful.
  try {
    const base =
      typeof window !== "undefined" && window.location?.origin
        ? window.location.origin
        : "http://localhost"

    const u = new URL(input, base)
    const pairs: Array<[string, string]> = []
    u.searchParams.forEach((value, key) => {
      const v = String(value ?? "").trim()
      if (v) pairs.push([key, v])
    })

    pairs.sort(([aK, aV], [bK, bV]) => {
      const k = aK.localeCompare(bK)
      if (k !== 0) return k
      return aV.localeCompare(bV)
    })

    const sp = new URLSearchParams()
    for (const [k, v] of pairs) sp.append(k, v)

    const pathname = u.pathname
    const search = sp.toString()
    const hash = u.hash || ""
    return `${pathname}${search ? `?${search}` : ""}${hash}`
  } catch {
    return input
  }
}

export async function cachedJson<T>(
  url: string,
  opts?: {
    /** TTL for in-memory cache (ms). */
    ttlMs?: number
    /** Provide an AbortSignal to cancel this request. */
    signal?: AbortSignal
    /** Force bypass cache (still de-dupes in-flight unless you change the URL). */
    bypassCache?: boolean
  },
): Promise<T> {
  const ttlMs = opts?.ttlMs ?? 30_000
  const now = Date.now()
  const key = normalizeUrlKey(url)
  const cache = getJsonCache()

  if (!opts?.bypassCache && ttlMs > 0) {
    const hit = cache.get(key) as CacheEntry<T> | undefined
    if (hit && hit.expiresAt > now) return hit.value
    if (hit) cache.delete(key)
  }

  const inflight = getInflight()
  const existing = inflight.get(key) as InflightEntry<T> | undefined
  if (existing) return existing.promise

  // Note: We don't automatically abort shared in-flight requests; callers can abort their own signal.
  const controller = new AbortController()
  const signals: AbortSignal[] = [controller.signal]
  if (opts?.signal) signals.push(opts.signal)

  // Combine signals (simple approach)
  const combined = new AbortController()
  const onAbort = () => combined.abort()
  for (const s of signals) {
    if (s.aborted) combined.abort()
    else s.addEventListener("abort", onAbort, { once: true })
  }

  const promise = fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal: combined.signal,
  })
    .then(async (r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return (await r.json()) as T
    })
    .then((data) => {
      if (!opts?.bypassCache && ttlMs > 0) cache.set(key, { expiresAt: Date.now() + ttlMs, value: data })
      return data
    })
    .finally(() => {
      inflight.delete(key)
      for (const s of signals) s.removeEventListener?.("abort", onAbort as any)
    })

  inflight.set(key, { promise, abort: controller })
  return promise
}

