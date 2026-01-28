import { BigQuery } from "@google-cloud/bigquery"
import type { QueryParamTypeStruct } from "@google-cloud/bigquery"
import fs from "node:fs"

declare global {
  // eslint-disable-next-line no-var
  var __bqClient: BigQuery | undefined
  // eslint-disable-next-line no-var
  var __bqQueryCache:
    | Map<
        string,
        {
          expiresAt: number
          rows: unknown[]
        }
      >
    | undefined
  // eslint-disable-next-line no-var
  var __bqInflight: Map<string, Promise<unknown[]>> | undefined
}

function getQueryCache() {
  if (!globalThis.__bqQueryCache) globalThis.__bqQueryCache = new Map()
  return globalThis.__bqQueryCache
}

function getInflight() {
  if (!globalThis.__bqInflight) globalThis.__bqInflight = new Map()
  return globalThis.__bqInflight
}

function stableStringify(v: unknown): string {
  if (v === null || v === undefined) return String(v)
  if (typeof v !== "object") return JSON.stringify(v)
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`
  const obj = v as Record<string, unknown>
  const keys = Object.keys(obj).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`
}

function makeCacheKey(sql: string, params?: Record<string, unknown>, types?: QueryParamTypeStruct) {
  return `${sql}\n--params:${stableStringify(params || {})}\n--types:${stableStringify(types || {})}`
}

export function getBigQueryClient() {
  // Prefer inline JSON creds in Vercel env
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.BIGQUERY_PROJECT_ID
  const inlineJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || process.env.GOOGLE_CLOUD_CREDENTIALS

  const options: ConstructorParameters<typeof BigQuery>[0] = {}
  if (projectId) options.projectId = projectId

  if (inlineJson) {
    const creds = JSON.parse(inlineJson)
    options.credentials = {
      client_email: creds.client_email,
      private_key: (creds.private_key as string)?.replace(/\\n/g, "\n"),
    }

    // Also write a temp credentials file for any library path lookups (ADC)
    try {
      const tmpPath = "/tmp/gcp-key.json"
      fs.writeFileSync(tmpPath, inlineJson)
      process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpPath
    } catch {}
  }

  // Reuse client across requests and (in dev) across hot reloads.
  if (!globalThis.__bqClient) globalThis.__bqClient = new BigQuery(options)
  return globalThis.__bqClient
}

function inferScalarType(key: string, value: unknown): string | undefined {
  if (typeof value === "boolean") return "BOOL"
  if (typeof value === "number") return Number.isInteger(value) ? "INT64" : "FLOAT64"
  if (typeof value === "string") {
    // We cast date strings in SQL (DATE(@startDate)), so treat dates as STRING here.
    if (key === "startDate" || key === "endDate") return "STRING"
    return "STRING"
  }
  return undefined
}

export async function runQuery<T = unknown>(
  sql: string,
  params?: Record<string, unknown>,
  opts?: {
    /** In-memory cache TTL for this query (ms). Default is env-driven. Set 0 to disable. */
    ttlMs?: number
  },
) {
  const client = getBigQueryClient()

  const types: QueryParamTypeStruct = {}

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        // BigQuery requires explicit types for empty arrays.
        if (value.length === 0) {
          types[key] = ["STRING"]
        }
      } else if (value === null) {
        // BigQuery requires explicit types for nulls.
        // Default to STRING unless overridden by caller SQL casting.
        types[key] = "STRING"
      } else {
        const t = inferScalarType(key, value)
        if (t) types[key] = t
      }
    }
  }

  const ttlMs =
    typeof opts?.ttlMs === "number"
      ? opts.ttlMs
      : Number(process.env.BQ_QUERY_CACHE_TTL_MS || (process.env.NODE_ENV === "development" ? 5 * 60_000 : 15 * 60_000))

  const cacheKey = makeCacheKey(sql, params, Object.keys(types).length > 0 ? types : undefined)
  const cache = getQueryCache()
  const inflight = getInflight()
  const now = Date.now()

  if (ttlMs > 0) {
    const hit = cache.get(cacheKey)
    if (hit && hit.expiresAt > now) return hit.rows as T[]
    if (hit && hit.expiresAt <= now) cache.delete(cacheKey)
  }

  const existing = inflight.get(cacheKey)
  if (existing) return (await existing) as T[]

  const p = (async () => {
    const [job] = await client.createQueryJob({
      query: sql,
      params,
      ...(Object.keys(types).length > 0 ? { types } : {}),
      useQueryCache: true,
    })
    const [rows] = await job.getQueryResults()
    return rows as unknown[]
  })()

  inflight.set(cacheKey, p)
  const rows = await p.finally(() => inflight.delete(cacheKey))

  if (ttlMs > 0) {
    cache.set(cacheKey, { expiresAt: now + ttlMs, rows: rows as unknown[] })
  }

  return rows as T[]
}
