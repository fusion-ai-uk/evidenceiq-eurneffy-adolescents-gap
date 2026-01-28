import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getSequencingFilters } from "@/lib/alunbrig/sequencingFilters"
import { getSequencingBaseCteSql, getSequencingBaseParams } from "@/lib/alunbrig/sequencingSql"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getSequencingFilters(searchParams)

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const sql = `
    ${getSequencingBaseCteSql()},
    meta AS (
      SELECT
        COUNT(*) AS totalPosts,
        MIN(created_date) AS minDate,
        MAX(created_date) AS maxDate
      FROM base
    ),
    stakeholder_counts AS (
      SELECT TRIM(CAST(stakeholder_primary AS STRING)) AS label, COUNT(*) AS c
      FROM base
      WHERE TRIM(CAST(stakeholder_primary AS STRING)) != ''
      GROUP BY label
    ),
    sentiment_counts AS (
      SELECT TRIM(CAST(sentiment_label AS STRING)) AS label, COUNT(*) AS c
      FROM base
      WHERE TRIM(CAST(sentiment_label AS STRING)) != ''
      GROUP BY label
    ),
    nation_counts AS (
      SELECT TRIM(CAST(uk_access_nation_hint AS STRING)) AS label, COUNT(*) AS c
      FROM base
      WHERE TRIM(CAST(uk_access_nation_hint AS STRING)) != ''
      GROUP BY label
    ),
    evidence_counts AS (
      SELECT TRIM(CAST(post_type_evidence_type AS STRING)) AS label, COUNT(*) AS c
      FROM base
      WHERE TRIM(CAST(post_type_evidence_type AS STRING)) != ''
      GROUP BY label
    ),
    biomarker_counts AS (
      SELECT TRIM(CAST(clinical_context_biomarker AS STRING)) AS label, COUNT(*) AS c
      FROM base
      WHERE TRIM(CAST(clinical_context_biomarker AS STRING)) != ''
      GROUP BY label
    ),
    cns_counts AS (
      SELECT TRIM(CAST(clinical_context_cns_context AS STRING)) AS label, COUNT(*) AS c
      FROM base
      WHERE TRIM(CAST(clinical_context_cns_context AS STRING)) != ''
      GROUP BY label
    )
    SELECT
      (SELECT ARRAY_AGG(label ORDER BY c DESC) FROM stakeholder_counts) AS stakeholder,
      (SELECT ARRAY_AGG(label ORDER BY c DESC) FROM sentiment_counts) AS sentimentLabel,
      (SELECT ARRAY_AGG(label ORDER BY c DESC) FROM nation_counts) AS ukNation,
      (SELECT ARRAY_AGG(label ORDER BY c DESC) FROM evidence_counts) AS evidenceType,
      (SELECT ARRAY_AGG(label ORDER BY c DESC) FROM biomarker_counts) AS biomarker,
      (SELECT ARRAY_AGG(label ORDER BY c DESC) FROM cns_counts) AS cnsContext,
      (SELECT AS STRUCT
        totalPosts,
        FORMAT_DATE('%Y-%m-%d', minDate) AS minDate,
        FORMAT_DATE('%Y-%m-%d', maxDate) AS maxDate
      FROM meta) AS meta
  `

  try {
    const rows = await runQuery<any>(sql, getSequencingBaseParams(filters))
    const r = rows?.[0] || {}
    return NextResponse.json({
      stakeholder: r.stakeholder || [],
      sentimentLabel: r.sentimentLabel || [],
      ukNation: r.ukNation || [],
      evidenceType: r.evidenceType || [],
      biomarker: r.biomarker || [],
      cnsContext: r.cnsContext || [],
      meta: {
        totalPosts: Number(r?.meta?.totalPosts || 0),
        minDate: String(r?.meta?.minDate || ""),
        maxDate: String(r?.meta?.maxDate || ""),
      },
    })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
