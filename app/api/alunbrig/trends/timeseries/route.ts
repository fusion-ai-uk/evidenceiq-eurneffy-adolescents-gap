import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getTrendsFilters } from "@/lib/alunbrig/trendsFilters"
import { getTrendsBaseCteSql, getTrendsBaseParams, periodOrderExpr } from "@/lib/alunbrig/trendsSql"

function windowSize(granularity: "day" | "week" | "month") {
  if (granularity === "day") return 30
  return 6
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getTrendsFilters(searchParams)

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const win = windowSize(filters.granularity)
  const orderExpr = periodOrderExpr(filters.granularity)

  const sql = `
    ${getTrendsBaseCteSql(filters.granularity)},
    period_agg AS (
      SELECT
        period,
        COUNT(*) AS posts,
        SUM(engagement) AS engagement,
        SUM(viewCount) AS views,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentimentIndex,
        AVG(sentiment_polarity_minus1_to_1) AS avgPolarity,
        AVG(CASE WHEN sequencing_is_sequencing_discussed THEN 1 ELSE 0 END) AS pctSequencing,
        AVG(CASE WHEN topics_brief_flags_quality_of_life THEN 1 ELSE 0 END) AS pctQoL,
        AVG(CASE WHEN topics_brief_flags_neuro_or_cognitive_toxicity THEN 1 ELSE 0 END) AS pctNeurotox,
        AVG(CASE WHEN topics_brief_flags_cns_or_brain_mets THEN 1 ELSE 0 END) AS pctCNS,
        AVG(CASE WHEN (topics_brief_flags_uk_access_or_reimbursement OR uk_access_is_uk_related) THEN 1 ELSE 0 END) AS pctUKAccess
      FROM period_rows
      GROUP BY period
    ),
    with_order AS (
      SELECT
        *,
        ${orderExpr} AS period_order
      FROM period_agg
    ),
    with_baseline AS (
      SELECT
        *,
        CASE
          WHEN COUNT(posts) OVER (ORDER BY period_order ROWS BETWEEN ${win} PRECEDING AND 1 PRECEDING) = ${win}
          THEN AVG(posts) OVER (ORDER BY period_order ROWS BETWEEN ${win} PRECEDING AND 1 PRECEDING)
          ELSE NULL
        END AS baselinePosts
      FROM with_order
    )
    SELECT
      period,
      posts,
      engagement,
      views,
      sentimentIndex,
      avgPolarity,
      pctSequencing,
      pctQoL,
      pctNeurotox,
      pctCNS,
      pctUKAccess,
      baselinePosts
    FROM with_baseline
    ORDER BY period_order ASC
  `

  try {
    const rows = await runQuery<any>(sql, getTrendsBaseParams(filters))
    const series = (rows || []).map((r: any) => {
      const { baselinePosts, ...rest } = r
      return rest
    })
    const baselineValues = (rows || []).map((r: any) => ({
      period: r.period,
      baselinePosts: r.baselinePosts ?? null,
    }))
    return NextResponse.json({
      granularity: filters.granularity,
      startDate: filters.startDate,
      endDate: filters.endDate,
      series,
      baseline: { method: filters.granularity === "day" ? "rolling_30_period_avg" : "rolling_6_period_avg", values: baselineValues },
    })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
