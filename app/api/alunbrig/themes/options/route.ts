import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getAlunbrigThemeFilters, flagsToParams } from "@/lib/alunbrig/themeFilters"

const truthy = (field: string) => `(LOWER(TRIM(CAST(${field} AS STRING))) IN ('true','1','yes'))`

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getAlunbrigThemeFilters(searchParams)

  if (!process.env.BQ_MAIN_TABLE) {
    return NextResponse.json({ error: "Missing env var BQ_MAIN_TABLE" }, { status: 500 })
  }

  const sql = `
    WITH all_base AS (
      SELECT
        SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt) AS created_ts,
        DATE(SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt)) AS created_date,

        stakeholder_primary,
        sentiment_label,
        uk_access_nation_hint,
        post_type_evidence_type,
        topics_key_terms,
        topics_top_topics,
        text,

        ${truthy("sequencing_is_sequencing_discussed")} AS sequencing_is_sequencing_discussed,
        ${truthy("topics_brief_flags_efficacy_outcomes")} AS topics_brief_flags_efficacy_outcomes,
        ${truthy("topics_brief_flags_safety_or_tolerability")} AS topics_brief_flags_safety_or_tolerability,
        ${truthy("topics_brief_flags_neuro_or_cognitive_toxicity")} AS topics_brief_flags_neuro_or_cognitive_toxicity,
        ${truthy("topics_brief_flags_quality_of_life")} AS topics_brief_flags_quality_of_life,
        ${truthy("topics_brief_flags_caregiver_burden")} AS topics_brief_flags_caregiver_burden,
        ${truthy("topics_brief_flags_cns_or_brain_mets")} AS topics_brief_flags_cns_or_brain_mets,
        ${truthy("topics_brief_flags_uk_access_or_reimbursement")} AS topics_brief_flags_uk_access_or_reimbursement,
        ${truthy("uk_access_is_uk_related")} AS uk_access_is_uk_related
      FROM \`${process.env.BQ_MAIN_TABLE}\`
      WHERE ${truthy("data_quality_keep_for_analysis")} = TRUE
        AND SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt) IS NOT NULL
        AND (
          (@includeLow = TRUE AND relevance_label IN ('high','medium','low'))
          OR (@includeLow = FALSE AND relevance_label IN ('high','medium'))
        )
        AND (NOT @sequencingOnly OR ${truthy("sequencing_is_sequencing_discussed")} = TRUE)
        AND (@evidenceType IS NULL OR ARRAY_LENGTH(@evidenceType) = 0 OR post_type_evidence_type IN UNNEST(@evidenceType))

        AND (NOT @flagEfficacy OR ${truthy("topics_brief_flags_efficacy_outcomes")} = TRUE)
        AND (NOT @flagSafety OR ${truthy("topics_brief_flags_safety_or_tolerability")} = TRUE)
        AND (NOT @flagNeurotox OR ${truthy("topics_brief_flags_neuro_or_cognitive_toxicity")} = TRUE)
        AND (NOT @flagQol OR ${truthy("topics_brief_flags_quality_of_life")} = TRUE)
        AND (NOT @flagCaregiver OR ${truthy("topics_brief_flags_caregiver_burden")} = TRUE)
        AND (NOT @flagCns OR ${truthy("topics_brief_flags_cns_or_brain_mets")} = TRUE)
        AND (
          NOT @flagUkAccess
          OR (${truthy("topics_brief_flags_uk_access_or_reimbursement")} = TRUE OR ${truthy("uk_access_is_uk_related")} = TRUE)
        )
        AND (
          @searchText = ''
          OR (
            LOWER(text) LIKE CONCAT('%', LOWER(@searchText), '%')
            OR LOWER(IFNULL(topics_key_terms,'')) LIKE CONCAT('%', LOWER(@searchText), '%')
            OR LOWER(IFNULL(topics_top_topics,'')) LIKE CONCAT('%', LOWER(@searchText), '%')
          )
        )
    ),
    meta AS (
      SELECT
        COUNT(*) AS totalPosts,
        MIN(created_date) AS minDate,
        MAX(created_date) AS maxDate
      FROM all_base
    ),
    stakeholder_counts AS (
      SELECT TRIM(CAST(stakeholder_primary AS STRING)) AS label, COUNT(*) AS c
      FROM all_base
      WHERE TRIM(CAST(stakeholder_primary AS STRING)) != ''
      GROUP BY label
    ),
    sentiment_counts AS (
      SELECT TRIM(CAST(sentiment_label AS STRING)) AS label, COUNT(*) AS c
      FROM all_base
      WHERE TRIM(CAST(sentiment_label AS STRING)) != ''
      GROUP BY label
    ),
    nation_counts AS (
      SELECT TRIM(CAST(uk_access_nation_hint AS STRING)) AS label, COUNT(*) AS c
      FROM all_base
      WHERE TRIM(CAST(uk_access_nation_hint AS STRING)) != ''
      GROUP BY label
    ),
    evidence_counts AS (
      SELECT TRIM(CAST(post_type_evidence_type AS STRING)) AS label, COUNT(*) AS c
      FROM all_base
      WHERE TRIM(CAST(post_type_evidence_type AS STRING)) != ''
      GROUP BY label
    )
    SELECT
      (SELECT ARRAY_AGG(label ORDER BY c DESC) FROM stakeholder_counts) AS stakeholderPrimary,
      (SELECT ARRAY_AGG(label ORDER BY c DESC) FROM sentiment_counts) AS sentimentLabel,
      (SELECT ARRAY_AGG(label ORDER BY c DESC) FROM nation_counts) AS ukNation,
      (SELECT ARRAY_AGG(label ORDER BY c DESC) FROM evidence_counts) AS evidenceType,
      (SELECT AS STRUCT
        totalPosts,
        FORMAT_DATE('%Y-%m-%d', minDate) AS minDate,
        FORMAT_DATE('%Y-%m-%d', maxDate) AS maxDate
      FROM meta) AS meta
  `

  try {
    const params = {
      includeLow: filters.includeLowRelevance,
      sequencingOnly: filters.sequencingOnly,
      evidenceType: filters.evidenceType,
      searchText: filters.searchText,
      ...flagsToParams(filters.flags),
    }

    const rows = await runQuery<any>(sql, params)
    const r = rows?.[0] || {}

    return NextResponse.json({
      stakeholderPrimary: r.stakeholderPrimary || [],
      sentimentLabel: r.sentimentLabel || [],
      ukNation: r.ukNation || [],
      evidenceType: r.evidenceType || [],
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
