import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getSequencingFilters } from "@/lib/alunbrig/sequencingFilters"
import { directionNormSql, getSequencingBaseCteSql, getSequencingBaseParams, lotNormSql, stakeholderBucketSql, togglesWhereSql } from "@/lib/alunbrig/sequencingSql"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getSequencingFilters(searchParams)

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const lot = lotNormSql()
  const direction = directionNormSql()
  const stakeholder = stakeholderBucketSql()

  const sql = `
    ${getSequencingBaseCteSql()},
    all_slice AS (
      SELECT * FROM base
      WHERE ${togglesWhereSql()}
    ),
    seq AS (
      SELECT * FROM all_slice WHERE sequencing_is_sequencing_discussed = TRUE
    ),
    all_totals AS (
      SELECT
        COUNT(*) AS posts,
        COUNTIF(sequencing_is_sequencing_discussed) AS sequencingPosts,
        COUNTIF(LOWER(TRIM(COALESCE(clinical_context_biomarker, ''))) LIKE '%alk%') AS alkPosts,
        COUNTIF(LOWER(TRIM(COALESCE(clinical_context_biomarker, ''))) LIKE '%ros1%') AS ros1Posts,
        COUNTIF(
          TRIM(COALESCE(clinical_context_biomarker, '')) != ''
          AND LOWER(TRIM(COALESCE(clinical_context_biomarker, ''))) NOT LIKE '%alk%'
        ) AS offTargetBiomarkerPosts
      FROM all_slice
    ),
    seq_totals AS (SELECT COUNT(*) AS total FROM seq),
    lot_counts AS (
      SELECT ${lot} AS name, COUNT(*) AS count
      FROM seq
      GROUP BY name
    ),
    direction_counts AS (
      SELECT ${direction} AS name, COUNT(*) AS count
      FROM seq
      GROUP BY name
    ),
    rationale_counts AS (
      SELECT TRIM(CAST(sequencing_rationale_short AS STRING)) AS name, COUNT(*) AS count
      FROM seq
      WHERE TRIM(CAST(sequencing_rationale_short AS STRING)) != ''
      GROUP BY name
    ),
    stakeholder_counts AS (
      SELECT ${stakeholder} AS name, COUNT(*) AS count
      FROM seq
      GROUP BY name
    ),
    sentiment_counts AS (
      SELECT COALESCE(NULLIF(TRIM(CAST(sentiment_label AS STRING)), ''), 'unknown') AS name, COUNT(*) AS count
      FROM seq
      GROUP BY name
    ),
    evidence_counts AS (
      SELECT COALESCE(NULLIF(TRIM(CAST(post_type_evidence_type AS STRING)), ''), 'unknown') AS name, COUNT(*) AS count
      FROM seq
      GROUP BY name
    ),
    flags AS (
      SELECT
        AVG(CASE WHEN sequencing_pfs_or_pfs2_mentioned THEN 1 ELSE 0 END) AS pctPFS,
        AVG(CASE WHEN sequencing_attrition_or_discontinuation THEN 1 ELSE 0 END) AS pctAttrition,
        AVG(CASE WHEN topics_brief_flags_efficacy_outcomes THEN 1 ELSE 0 END) AS pctEfficacy,
        AVG(CASE WHEN topics_brief_flags_safety_or_tolerability THEN 1 ELSE 0 END) AS pctSafety,
        AVG(CASE WHEN topics_brief_flags_cns_or_brain_mets THEN 1 ELSE 0 END) AS pctCNS,
        AVG(CASE WHEN topics_brief_flags_quality_of_life THEN 1 ELSE 0 END) AS pctQoL,
        AVG(CASE WHEN topics_brief_flags_uk_access_or_reimbursement THEN 1 ELSE 0 END) AS pctUKAccess
      FROM seq
    )
    SELECT
      (SELECT AS STRUCT
        posts,
        sequencingPosts,
        SAFE_DIVIDE(sequencingPosts, NULLIF(posts,0)) AS pctSequencing,
        alkPosts,
        SAFE_DIVIDE(alkPosts, NULLIF(posts,0)) AS pctAlk,
        ros1Posts,
        SAFE_DIVIDE(ros1Posts, NULLIF(posts,0)) AS pctRos1,
        offTargetBiomarkerPosts,
        SAFE_DIVIDE(offTargetBiomarkerPosts, NULLIF(posts,0)) AS pctOffTargetBiomarker
      FROM all_totals) AS totals,
      (SELECT AS STRUCT
        pctPFS,
        pctAttrition,
        pctEfficacy,
        pctSafety,
        pctCNS,
        pctQoL,
        pctUKAccess
      FROM flags) AS topicSignals,
      (SELECT ARRAY_AGG(STRUCT(name, count, SAFE_DIVIDE(count, NULLIF(st.total,0)) AS share) ORDER BY count DESC LIMIT 8)
        FROM lot_counts, seq_totals st
      ) AS lot,
      (SELECT ARRAY_AGG(STRUCT(name, count, SAFE_DIVIDE(count, NULLIF(st.total,0)) AS share) ORDER BY count DESC LIMIT 8)
        FROM direction_counts, seq_totals st
      ) AS direction,
      (SELECT ARRAY_AGG(STRUCT(name, count, SAFE_DIVIDE(count, NULLIF(st.total,0)) AS share) ORDER BY count DESC LIMIT 8)
        FROM rationale_counts, seq_totals st
      ) AS rationale,
      (SELECT ARRAY_AGG(STRUCT(name, count, SAFE_DIVIDE(count, NULLIF(st.total,0)) AS share) ORDER BY count DESC LIMIT 6)
        FROM stakeholder_counts, seq_totals st
      ) AS stakeholder,
      (SELECT ARRAY_AGG(STRUCT(name, count, SAFE_DIVIDE(count, NULLIF(st.total,0)) AS share) ORDER BY count DESC LIMIT 6)
        FROM sentiment_counts, seq_totals st
      ) AS sentiment,
      (SELECT ARRAY_AGG(STRUCT(name, count, SAFE_DIVIDE(count, NULLIF(st.total,0)) AS share) ORDER BY count DESC LIMIT 6)
        FROM evidence_counts, seq_totals st
      ) AS evidence
  `

  try {
    const params = {
      ...getSequencingBaseParams(filters),
      sequencingOnly: false,
      ukAccessOnly: false,
      pfsOnly: false,
    }
    const rows = await runQuery<any>(sql, params)
    return NextResponse.json(rows?.[0] || {})
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
