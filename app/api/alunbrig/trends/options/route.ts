import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getTrendsFilters } from "@/lib/alunbrig/trendsFilters"
import { getTrendsBaseCteSql, getTrendsBaseParams } from "@/lib/alunbrig/trendsSql"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getTrendsFilters(searchParams)

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  // Options should be data-driven but stable; do not apply stakeholder/sentiment selections to the options call.
  const stableFilters = {
    ...filters,
    stakeholder: [],
    sentimentLabel: [],
  }

  const sql = `
    ${getTrendsBaseCteSql(filters.granularity)}
    SELECT
      ARRAY_AGG(DISTINCT sentiment_label IGNORE NULLS ORDER BY sentiment_label) AS sentimentLabel,
      ARRAY_AGG(DISTINCT post_type_evidence_type IGNORE NULLS ORDER BY post_type_evidence_type) AS evidenceType,
      COUNT(*) AS totalPosts,
      FORMAT_DATE('%Y-%m-%d', MIN(created_date)) AS minDate,
      FORMAT_DATE('%Y-%m-%d', MAX(created_date)) AS maxDate
    FROM base
  `

  try {
    const rows = await runQuery<any>(sql, getTrendsBaseParams(stableFilters))
    const r = rows?.[0] || {}
    return NextResponse.json({
      sentimentLabel: r.sentimentLabel || [],
      evidenceType: r.evidenceType || [],
      meta: {
        totalPosts: Number(r.totalPosts || 0),
        minDate: r.minDate || filters.startDate,
        maxDate: r.maxDate || filters.endDate,
      },
    })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
