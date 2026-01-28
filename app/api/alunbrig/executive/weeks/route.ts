import { NextResponse } from "next/server"

import { runQuery } from "@/lib/bigquery"
import { getExecutiveFilters } from "@/lib/alunbrig/executiveFilters"
import { getExecutiveBaseCteSql, getExecutiveBaseParams } from "@/lib/alunbrig/executiveSql"
import { isoWeekStartEnd } from "@/lib/alunbrig/executiveCardFactory"
import { getCachedWeeks, makeCacheKey, setCachedWeeks } from "@/lib/alunbrig/executiveCache"

export const runtime = "nodejs"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getExecutiveFilters(searchParams)

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const cacheKey = makeCacheKey({
    t: "weeks",
    startDate: filters.startDate,
    endDate: filters.endDate,
    includeLowRelevance: filters.includeLowRelevance,
    stakeholder: filters.stakeholder,
    sentimentLabel: filters.sentimentLabel,
    evidenceType: filters.evidenceType,
    searchText: filters.searchText,
    cardBucket: filters.cardBucket,
    ukOnly: filters.ukOnly,
    sequencingOnly: filters.sequencingOnly,
  })

  const cached = getCachedWeeks(cacheKey)
  if (cached) return NextResponse.json(cached)

  const sql = `
    ${getExecutiveBaseCteSql()}
    SELECT
      created_week AS week,
      COUNT(*) AS posts
    FROM base
    GROUP BY week
    ORDER BY week
  `

  try {
    const rows = await runQuery<{ week: string; posts: number }>(sql, getExecutiveBaseParams(filters))
    const weeks = (rows || [])
      .map((r) => {
        const w = String(r.week || "").trim()
        const { startDate, endDate } = isoWeekStartEnd(w)
        return { week: w, startDate, endDate, posts: Number(r.posts || 0) }
      })
      .filter((w) => w.week && w.startDate && w.endDate)

    weeks.sort((a, b) => a.startDate.localeCompare(b.startDate))
    const defaultWeek = weeks.length ? weeks[weeks.length - 1].week : ""

    const payload = { weeks, defaultWeek }
    setCachedWeeks(cacheKey, payload)
    return NextResponse.json(payload)
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
