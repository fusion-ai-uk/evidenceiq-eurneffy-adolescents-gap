import type { TrendsFilters, TrendsGranularity } from "@/lib/alunbrig/trendsFilters"
import { stakeholderUiToPrimary, trendsFlagsToParams } from "@/lib/alunbrig/trendsFilters"

const truthy = (field: string) => `(LOWER(TRIM(CAST(${field} AS STRING))) IN ('true','1','yes'))`

export function periodExpr(granularity: TrendsGranularity) {
  if (granularity === "day") return "FORMAT_DATE('%Y-%m-%d', created_date)"
  if (granularity === "week") return "created_week"
  return "created_month"
}

export function periodOrderExpr(granularity: TrendsGranularity) {
  // Provides a DATE value for stable ordering across granularities.
  if (granularity === "day") return "PARSE_DATE('%Y-%m-%d', period)"
  if (granularity === "month") return "PARSE_DATE('%Y-%m-%d', CONCAT(period, '-01'))"
  // ISO week string like YYYY-Www
  return "PARSE_DATE('%G-W%V-%u', CONCAT(period, '-1'))"
}

export function getTrendsBaseCteSql(granularity: TrendsGranularity) {
  if (!process.env.BQ_MAIN_TABLE) throw new Error("Missing env var BQ_MAIN_TABLE")

  return `
    WITH base AS (
      SELECT
        SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt) AS created_ts,
        DATE(SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt)) AS created_date,
        FORMAT_DATE('%G-W%V', DATE(SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt))) AS created_week,
        FORMAT_DATE('%Y-%m', DATE(SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt))) AS created_month,

        stakeholder_primary,
        sentiment_label,
        SAFE_CAST(sentiment_polarity_minus1_to_1 AS FLOAT64) AS sentiment_polarity_minus1_to_1,
        sentiment_drivers,

        ${truthy("sequencing_is_sequencing_discussed")} AS sequencing_is_sequencing_discussed,
        ${truthy("topics_brief_flags_efficacy_outcomes")} AS topics_brief_flags_efficacy_outcomes,
        ${truthy("topics_brief_flags_safety_or_tolerability")} AS topics_brief_flags_safety_or_tolerability,
        ${truthy("topics_brief_flags_neuro_or_cognitive_toxicity")} AS topics_brief_flags_neuro_or_cognitive_toxicity,
        ${truthy("topics_brief_flags_quality_of_life")} AS topics_brief_flags_quality_of_life,
        ${truthy("topics_brief_flags_caregiver_burden")} AS topics_brief_flags_caregiver_burden,
        ${truthy("topics_brief_flags_cns_or_brain_mets")} AS topics_brief_flags_cns_or_brain_mets,
        ${truthy("topics_brief_flags_uk_access_or_reimbursement")} AS topics_brief_flags_uk_access_or_reimbursement,

        ${truthy("uk_access_is_uk_related")} AS uk_access_is_uk_related,
        uk_access_nation_hint,

        card_bucket,
        topics_top_topics,
        topics_key_terms,
        post_type_evidence_type,
        text,
        url,
        CAST(id AS STRING) AS id,

        COALESCE(SAFE_CAST(likeCount AS INT64), 0)
          + COALESCE(SAFE_CAST(retweetCount AS INT64), 0)
          + COALESCE(SAFE_CAST(replyCount AS INT64), 0)
          + COALESCE(SAFE_CAST(quoteCount AS INT64), 0)
          + COALESCE(SAFE_CAST(bookmarkCount AS INT64), 0) AS engagement,
        COALESCE(SAFE_CAST(viewCount AS INT64), 0) AS viewCount
      FROM \`${process.env.BQ_MAIN_TABLE}\`
      WHERE ${truthy("data_quality_keep_for_analysis")} = TRUE
        AND SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt) IS NOT NULL
        AND DATE(SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt)) BETWEEN DATE(@startDate) AND DATE(@endDate)
        AND (
          (@includeLow = TRUE AND relevance_label IN ('high','medium','low'))
          OR (@includeLow = FALSE AND relevance_label IN ('high','medium'))
        )
        AND (
          NOT @cardBucketEnabled
          OR TRIM(CAST(card_bucket AS STRING)) IN UNNEST(@cardBuckets)
        )
        AND (
          NOT @stakeholderEnabled
          OR stakeholder_primary IN UNNEST(@stakeholders)
        )
        AND (
          NOT @sentimentEnabled
          OR sentiment_label IN UNNEST(@sentimentLabels)
        )
        AND (
          NOT @sequencingOnly
          OR ${truthy("sequencing_is_sequencing_discussed")} = TRUE
        )
        AND (
          NOT @ukOnly
          OR (${truthy("topics_brief_flags_uk_access_or_reimbursement")} = TRUE OR ${truthy("uk_access_is_uk_related")} = TRUE)
        )
        AND (
          NOT @evidenceEnabled
          OR post_type_evidence_type IN UNNEST(@evidenceTypes)
        )

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
    period_rows AS (
      SELECT
        ${periodExpr(granularity)} AS period,
        *
      FROM base
    )
  `
}

export function getTrendsBaseParams(filters: TrendsFilters) {
  const cardBuckets = (filters.cardBucket || []).map((s) => s.trim()).filter(Boolean)
  const cardBucketEnabled = cardBuckets.length > 0
  const stakeholders = stakeholderUiToPrimary(filters.stakeholder)
  const stakeholderEnabled = stakeholders.length > 0
  const sentimentEnabled = filters.sentimentLabel.length > 0
  const evidenceEnabled = filters.evidenceType.length > 0
  const flagParams = trendsFlagsToParams(filters.flags)

  return {
    startDate: filters.startDate,
    endDate: filters.endDate,
    includeLow: filters.includeLowRelevance,

    cardBucketEnabled,
    cardBuckets,

    stakeholderEnabled,
    stakeholders,
    sentimentEnabled,
    sentimentLabels: filters.sentimentLabel,
    sequencingOnly: filters.sequencingOnly,
    ukOnly: filters.ukOnly,

    evidenceEnabled,
    evidenceTypes: filters.evidenceType,

    searchText: filters.searchText,
    ...flagParams,
  }
}
