import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getSequencingFilters } from "@/lib/alunbrig/sequencingFilters"
import {
  directionNormSql,
  getSequencingBaseCteSql,
  getSequencingBaseParams,
  lotNormSql,
  stakeholderBucketSql,
  togglesWhereSql,
} from "@/lib/alunbrig/sequencingSql"

type XDim = "stakeholder" | "line_of_therapy" | "biomarker" | "uk_nation"
type YDim = "sequence_direction" | "attrition" | "pfs" | "cns_context"
type Metric = "posts" | "pct"

function parseXDim(v: string | null): XDim {
  if (v === "line_of_therapy" || v === "biomarker" || v === "uk_nation") return v
  return "stakeholder"
}

function parseYDim(v: string | null): YDim {
  if (v === "sequence_direction" || v === "attrition" || v === "pfs" || v === "cns_context") return v
  return "sequence_direction"
}

function parseMetric(v: string | null): Metric {
  return v === "pct" ? "pct" : "posts"
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getSequencingFilters(searchParams)
  const xDim = parseXDim(searchParams.get("xDim"))
  const yDim = parseYDim(searchParams.get("yDim"))
  const metric = parseMetric(searchParams.get("metric"))

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const stakeholderBucket = stakeholderBucketSql()
  const lot = lotNormSql()
  const direction = directionNormSql()

  const xExpr =
    xDim === "stakeholder"
      ? stakeholderBucket
      : xDim === "line_of_therapy"
        ? `CASE WHEN NOT sequencing_is_sequencing_discussed THEN 'none' ELSE ${lot} END`
        : xDim === "biomarker"
          ? `COALESCE(NULLIF(TRIM(CAST(clinical_context_biomarker AS STRING)), ''), 'unknown')`
          : `COALESCE(NULLIF(TRIM(CAST(uk_access_nation_hint AS STRING)), ''), 'not_uk_or_unknown')`

  const yExpr =
    yDim === "sequence_direction"
      ? `CASE WHEN NOT sequencing_is_sequencing_discussed THEN 'none' ELSE ${direction} END`
      : yDim === "attrition"
        ? `CASE WHEN sequencing_attrition_or_discontinuation THEN 'attrition_mentioned' ELSE 'attrition_not_mentioned' END`
        : yDim === "pfs"
          ? `CASE WHEN sequencing_pfs_or_pfs2_mentioned THEN 'pfs_or_pfs2_mentioned' ELSE 'not_mentioned' END`
          : `COALESCE(NULLIF(TRIM(CAST(clinical_context_cns_context AS STRING)), ''), 'unknown')`

  const sql = `
    ${getSequencingBaseCteSql()},
    slice AS (
      SELECT
        ${xExpr} AS x,
        ${yExpr} AS y
      FROM base
      WHERE ${togglesWhereSql()}
    ),
    cells AS (
      SELECT x, y, COUNT(*) AS posts
      FROM slice
      GROUP BY x, y
    ),
    x_totals AS (
      SELECT x, SUM(posts) AS totalPosts
      FROM cells
      GROUP BY x
    ),
    y_totals AS (
      SELECT y, SUM(posts) AS totalPosts
      FROM cells
      GROUP BY y
    ),
    x_ordered AS (SELECT x FROM x_totals ORDER BY totalPosts DESC),
    y_ordered AS (SELECT y FROM y_totals ORDER BY totalPosts DESC)
    SELECT
      @xDim AS xDim,
      @yDim AS yDim,
      @metric AS metric,
      (SELECT ARRAY_AGG(STRUCT(c.x AS x, c.y AS y, c.posts AS posts,
        CASE WHEN @metric = 'pct' THEN SAFE_DIVIDE(c.posts, NULLIF(xt.totalPosts,0)) ELSE CAST(c.posts AS FLOAT64) END AS value
      ) ORDER BY c.posts DESC)
       FROM cells c
       JOIN x_totals xt USING(x)
      ) AS cells,
      (SELECT ARRAY_AGG(x ORDER BY x) FROM x_ordered) AS xValues,
      (SELECT ARRAY_AGG(y ORDER BY y) FROM y_ordered) AS yValues
  `

  try {
    const params = { ...getSequencingBaseParams(filters), xDim, yDim, metric }
    const rows = await runQuery<any>(sql, params)
    return NextResponse.json(rows?.[0] || { xDim, yDim, metric, cells: [], xValues: [], yValues: [] })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
