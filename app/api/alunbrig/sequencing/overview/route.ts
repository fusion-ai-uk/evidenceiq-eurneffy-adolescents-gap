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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getSequencingFilters(searchParams)

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const lot = lotNormSql()
  const direction = directionNormSql()
  const stakeholderBucket = stakeholderBucketSql()

  const sql = `
    ${getSequencingBaseCteSql()},
    slice AS (
      SELECT * FROM base
      WHERE ${togglesWhereSql()}
    ),
    all_meta AS (
      SELECT
        COUNT(*) AS posts,
        COUNTIF(sequencing_is_sequencing_discussed) AS sequencingPosts
      FROM base
    ),
    slice_kpis AS (
      SELECT
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentimentIndex,
        SUM(engagement) AS engagement,
        AVG(CASE WHEN sequencing_pfs_or_pfs2_mentioned THEN 1 ELSE 0 END) AS pctPFS,
        AVG(CASE WHEN sequencing_attrition_or_discontinuation THEN 1 ELSE 0 END) AS pctAttrition,
        AVG(CASE WHEN (uk_access_is_uk_related OR topics_brief_flags_uk_access_or_reimbursement) THEN 1 ELSE 0 END) AS pctUKAccess
      FROM slice
    ),
    lot_rows AS (
      SELECT
        CASE WHEN NOT sequencing_is_sequencing_discussed THEN 'none' ELSE ${lot} END AS lot,
        COUNT(*) AS posts,
        AVG(CASE WHEN sequencing_pfs_or_pfs2_mentioned THEN 1 ELSE 0 END) AS pctPFS,
        AVG(CASE WHEN sequencing_attrition_or_discontinuation THEN 1 ELSE 0 END) AS pctAttrition
      FROM slice
      GROUP BY lot
    ),
    lot_total AS (SELECT SUM(posts) AS total FROM lot_rows),
    dir_rows AS (
      SELECT
        CASE WHEN NOT sequencing_is_sequencing_discussed THEN 'none' ELSE ${direction} END AS direction,
        COUNT(*) AS posts,
        AVG(CASE WHEN sequencing_pfs_or_pfs2_mentioned THEN 1 ELSE 0 END) AS pctPFS,
        AVG(CASE WHEN sequencing_attrition_or_discontinuation THEN 1 ELSE 0 END) AS pctAttrition
      FROM slice
      GROUP BY direction
    ),
    dir_total AS (SELECT SUM(posts) AS total FROM dir_rows),
    stakeholder_rows AS (
      SELECT
        ${stakeholderBucket} AS stakeholder,
        COUNT(*) AS posts,
        AVG(CASE WHEN sequencing_pfs_or_pfs2_mentioned THEN 1 ELSE 0 END) AS pctPFS,
        AVG(CASE WHEN sequencing_attrition_or_discontinuation THEN 1 ELSE 0 END) AS pctAttrition
      FROM slice
      GROUP BY stakeholder
    ),
    stakeholder_total AS (SELECT SUM(posts) AS total FROM stakeholder_rows),
    rationale_counts AS (
      SELECT TRIM(CAST(sequencing_rationale_short AS STRING)) AS rationale, COUNT(*) AS count
      FROM slice
      WHERE TRIM(CAST(sequencing_rationale_short AS STRING)) != ''
      GROUP BY rationale
    ),
    driver_tokens AS (
      SELECT TRIM(d) AS driver
      FROM slice, UNNEST(SPLIT(IFNULL(CAST(sentiment_drivers AS STRING), ''), ';')) AS d
      WHERE TRIM(d) != ''
    ),
    driver_counts AS (SELECT driver, COUNT(*) AS count FROM driver_tokens GROUP BY driver),
    term_tokens AS (
      SELECT TRIM(t) AS term
      FROM slice, UNNEST(SPLIT(IFNULL(CAST(topics_key_terms AS STRING), ''), ';')) AS t
      WHERE TRIM(t) != ''
    ),
    term_counts AS (SELECT term, COUNT(*) AS count FROM term_tokens GROUP BY term)
    SELECT
      (SELECT AS STRUCT
        am.posts AS posts,
        am.sequencingPosts AS sequencingPosts,
        SAFE_DIVIDE(am.sequencingPosts, NULLIF(am.posts,0)) AS pctSequencing,
        sk.pctPFS AS pctPFS,
        sk.pctAttrition AS pctAttrition,
        sk.pctUKAccess AS pctUKAccess,
        sk.sentimentIndex AS sentimentIndex,
        sk.engagement AS engagement
      FROM all_meta am CROSS JOIN slice_kpis sk) AS kpis,
      (SELECT ARRAY_AGG(STRUCT(lot, posts, SAFE_DIVIDE(posts, NULLIF(lt.total,0)) AS share, pctPFS, pctAttrition) ORDER BY posts DESC)
        FROM lot_rows, lot_total lt
      ) AS lineOfTherapy,
      (SELECT ARRAY_AGG(STRUCT(direction, posts, SAFE_DIVIDE(posts, NULLIF(dt.total,0)) AS share, pctPFS, pctAttrition) ORDER BY posts DESC)
        FROM dir_rows, dir_total dt
      ) AS sequenceDirections,
      (SELECT ARRAY_AGG(STRUCT(stakeholder, posts, SAFE_DIVIDE(posts, NULLIF(st.total,0)) AS share, pctPFS, pctAttrition) ORDER BY posts DESC)
        FROM stakeholder_rows, stakeholder_total st
      ) AS stakeholderSplit,
      (SELECT ARRAY_AGG(STRUCT(rationale, count) ORDER BY count DESC LIMIT 10) FROM rationale_counts) AS topRationales,
      (SELECT ARRAY_AGG(STRUCT(driver, count) ORDER BY count DESC LIMIT 10) FROM driver_counts) AS topDrivers,
      (SELECT ARRAY_AGG(STRUCT(term, count) ORDER BY count DESC LIMIT 15) FROM term_counts) AS topKeyTerms
  `

  try {
    const rows = await runQuery<any>(sql, getSequencingBaseParams(filters))
    return NextResponse.json(rows?.[0] || {})
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
