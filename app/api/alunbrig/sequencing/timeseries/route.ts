import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getSequencingFilters, parseGranularity } from "@/lib/alunbrig/sequencingFilters"
import { getSequencingBaseCteSql, getSequencingBaseParams, togglesWhereSql } from "@/lib/alunbrig/sequencingSql"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getSequencingFilters(searchParams)
  const granularity = parseGranularity(searchParams.get("granularity"))

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const periodExpr = granularity === "month" ? "created_month" : "created_week"

  const sql = `
    ${getSequencingBaseCteSql()},
    slice AS (
      SELECT ${periodExpr} AS period, * FROM base
      WHERE ${togglesWhereSql()}
    ),
    agg AS (
      SELECT
        period,
        COUNT(*) AS posts,
        COUNTIF(sequencing_is_sequencing_discussed) AS sequencingPosts,
        SAFE_DIVIDE(COUNTIF(sequencing_is_sequencing_discussed), NULLIF(COUNT(*),0)) AS pctSequencing,
        AVG(CASE WHEN sequencing_pfs_or_pfs2_mentioned THEN 1 ELSE 0 END) AS pctPFS,
        AVG(CASE WHEN sequencing_attrition_or_discontinuation THEN 1 ELSE 0 END) AS pctAttrition,
        AVG(CASE WHEN (uk_access_is_uk_related OR topics_brief_flags_uk_access_or_reimbursement) THEN 1 ELSE 0 END) AS pctUKAccess,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentimentIndex
      FROM slice
      GROUP BY period
    ),
    with_baseline AS (
      SELECT
        *,
        CASE
          WHEN COUNT(*) OVER (ORDER BY period ROWS BETWEEN 6 PRECEDING AND 1 PRECEDING) < 6 THEN NULL
          ELSE AVG(sequencingPosts) OVER (ORDER BY period ROWS BETWEEN 6 PRECEDING AND 1 PRECEDING)
        END AS baselineSequencingPosts
      FROM agg
    )
    SELECT
      @granularity AS granularity,
      (SELECT ARRAY_AGG(STRUCT(period, posts, sequencingPosts, pctSequencing, pctPFS, pctAttrition, pctUKAccess, sentimentIndex) ORDER BY period)
        FROM with_baseline
      ) AS series,
      (SELECT AS STRUCT
        'rolling_6_period_avg_of_sequencingPosts' AS method,
        (SELECT ARRAY_AGG(STRUCT(period, baselineSequencingPosts) ORDER BY period) FROM with_baseline) AS values
      ) AS baseline
  `

  try {
    const params = { ...getSequencingBaseParams(filters), granularity }
    const rows = await runQuery<any>(sql, params)
    return NextResponse.json(rows?.[0] || { granularity, series: [], baseline: { method: "rolling_6_period_avg_of_sequencingPosts", values: [] } })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
