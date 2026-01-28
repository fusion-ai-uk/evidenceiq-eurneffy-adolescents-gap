import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getTrendsFilters } from "@/lib/alunbrig/trendsFilters"
import type { TrendsGranularity } from "@/lib/alunbrig/trendsFilters"
import { getTrendsBaseCteSql, getTrendsBaseParams, periodOrderExpr } from "@/lib/alunbrig/trendsSql"
import { endOfISOWeek, endOfMonth, formatISO, parseISO, startOfISOWeek, startOfMonth } from "date-fns"

function isoDate(d: Date) {
  return formatISO(d, { representation: "date" })
}

function parsePeriodBounds(granularity: TrendsGranularity, period: string): { start: string; end: string } {
  if (granularity === "day") return { start: period, end: period }
  if (granularity === "month") {
    const start = startOfMonth(parseISO(`${period}-01`))
    const end = endOfMonth(start)
    return { start: isoDate(start), end: isoDate(end) }
  }
  // week: YYYY-Www (ISO week)
  const weekStart = startOfISOWeek(parseISO(`${period}-1`))
  const weekEnd = endOfISOWeek(weekStart)
  return { start: isoDate(weekStart), end: isoDate(weekEnd) }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getTrendsFilters(searchParams)

  const mode = (searchParams.get("mode") || "period") as "period" | "alert" | "theme"
  const period = (searchParams.get("period") || "").trim()
  const type = (searchParams.get("type") || "") as "topic" | "bucket"
  const label = (searchParams.get("label") || "").trim()
  const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") || 50)))
  const offset = Math.max(0, Number(searchParams.get("offset") || 0))

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  // Effective range for mode=period/alert uses the expanded period bounds.
  let effectiveStart = filters.startDate
  let effectiveEnd = filters.endDate
  if ((mode === "period" || mode === "alert") && period) {
    const b = parsePeriodBounds(filters.granularity, period)
    effectiveStart = b.start
    effectiveEnd = b.end
  }

  const baseFilters = { ...filters, startDate: effectiveStart, endDate: effectiveEnd }
  const baseParams = getTrendsBaseParams(baseFilters)

  const orderExpr = periodOrderExpr(filters.granularity)

  const baseSql = getTrendsBaseCteSql(filters.granularity)

  // Theme default: end window (last 25% of periods) within the *user-selected* range.
  const endWindowCtes = `
    periods AS (
      SELECT DISTINCT period, ${orderExpr} AS period_order
      FROM period_rows
    ),
    periods_ranked AS (
      SELECT
        period,
        period_order,
        ROW_NUMBER() OVER (ORDER BY period_order) AS rn,
        COUNT(*) OVER () AS totalPeriods
      FROM periods
    ),
    bounds AS (
      SELECT
        totalPeriods,
        GREATEST(1, CAST(CEIL(totalPeriods * 0.25) AS INT64)) AS windowPeriods
      FROM periods_ranked
      WHERE rn = 1
    ),
    end_set AS (
      SELECT pr.period
      FROM periods_ranked pr, bounds b
      WHERE pr.rn > (b.totalPeriods - b.windowPeriods)
    )
  `

  const labelPredicate =
    mode === "theme" && type === "bucket"
      ? "card_bucket = @label"
      : mode === "theme" && type === "topic"
        ? "EXISTS (SELECT 1 FROM UNNEST(SPLIT(IFNULL(topics_top_topics,''), ';')) AS t WHERE TRIM(t) = @label)"
        : "TRUE"

  const fromRows =
    mode === "theme"
      ? `
        FROM period_rows
        WHERE period IN (SELECT period FROM end_set)
          AND ${labelPredicate}
      `
      : `
        FROM period_rows
        WHERE ${period ? "period = @period" : "TRUE"}
      `

  const countSql = `
    ${baseSql},
    ${mode === "theme" ? endWindowCtes + "," : ""}
    filtered AS (
      SELECT id
      ${fromRows}
    )
    SELECT COUNT(*) AS total
    FROM filtered
  `

  const itemsSql = `
    ${baseSql},
    ${mode === "theme" ? endWindowCtes + "," : ""}
    filtered AS (
      SELECT
        id,
        url,
        text,
        CAST(created_ts AS STRING) AS created_ts,
        stakeholder_primary,
        sentiment_label,
        sentiment_polarity_minus1_to_1,
        engagement,
        viewCount,
        card_bucket,
        topics_top_topics,
        topics_key_terms,
        sentiment_drivers,
        post_type_evidence_type,
        uk_access_is_uk_related,
        uk_access_nation_hint,
        created_ts AS sort_ts
      ${fromRows}
    )
    SELECT * EXCEPT(sort_ts)
    FROM filtered
    ORDER BY sort_ts DESC
    LIMIT @limit
    OFFSET @offset
  `

  try {
    const params = {
      ...baseParams,
      period,
      label,
      limit,
      offset,
    }
    const [countRows, itemRows] = await Promise.all([runQuery<any>(countSql, params), runQuery<any>(itemsSql, params)])

    return NextResponse.json({
      total: Number(countRows?.[0]?.total || 0),
      items: itemRows || [],
    })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

