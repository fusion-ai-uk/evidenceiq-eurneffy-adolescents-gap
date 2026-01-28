import type { ExecutiveFilters } from "@/lib/alunbrig/executiveFilters"

const truthy = (field: string) => `(LOWER(TRIM(CAST(${field} AS STRING))) IN ('true','1','yes'))`

export function stakeholderBucketSql() {
  return `
    CASE
      WHEN stakeholder_primary = 'HCP' THEN 'HCP'
      WHEN stakeholder_primary = 'Patient' THEN 'Patient'
      WHEN stakeholder_primary = 'Caregiver' THEN 'Caregiver'
      WHEN stakeholder_primary = 'Payer' THEN 'Payer'
      ELSE 'Other'
    END
  `
}

export function normalizeSql(expr: string) {
  // lower-case, trim, collapse whitespace, remove surrounding punctuation/symbols
  return `
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        LOWER(TRIM(CAST(${expr} AS STRING))),
        r'\\s+',
        ' '
      ),
      r'^[\\p{P}\\p{S}]+|[\\p{P}\\p{S}]+$',
      ''
    )
  `
}

export function clusterTitleSql() {
  // Cluster title uses card_title when present, otherwise topics_theme_summary
  return `
    CASE
      WHEN TRIM(CAST(card_title AS STRING)) != '' THEN ${normalizeSql("card_title")}
      ELSE ${normalizeSql("topics_theme_summary")}
    END
  `
}

export function getExecutiveBaseCteSql() {
  if (!process.env.BQ_MAIN_TABLE) throw new Error("Missing env var BQ_MAIN_TABLE")

  const stakeholderBucket = stakeholderBucketSql()

  return `
    WITH base AS (
      SELECT
        SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt) AS created_ts,
        DATE(SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt)) AS created_date,
        FORMAT_DATE('%G-W%V', DATE(SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt))) AS created_week,

        stakeholder_primary,
        ${stakeholderBucket} AS stakeholder_bucket,

        sentiment_label,
        SAFE_CAST(sentiment_polarity_minus1_to_1 AS FLOAT64) AS sentiment_polarity_minus1_to_1,
        sentiment_emotion_primary,
        SAFE_CAST(sentiment_emotion_intensity_0_100 AS FLOAT64) AS sentiment_emotion_intensity_0_100,
        sentiment_drivers,

        topics_key_terms,
        topics_top_topics,
        topics_theme_summary,

        card_bucket,
        card_title,
        card_takeaway,
        SAFE_CAST(card_signal_strength_0_100 AS FLOAT64) AS card_signal_strength_0_100,
        card_content_angle_suggestions,
        insight_tags_hurdles,
        insight_tags_opportunities,

        competitive_positioning_comparative_context,
        competitive_positioning_stance_toward_alunbrig,
        entities_competitors,
        entities_drugs_brands,

        ${truthy("sequencing_is_sequencing_discussed")} AS sequencing_is_sequencing_discussed,
        sequencing_line_of_therapy,
        sequencing_sequence_direction,
        ${truthy("sequencing_pfs_or_pfs2_mentioned")} AS sequencing_pfs_or_pfs2_mentioned,
        ${truthy("sequencing_attrition_or_discontinuation")} AS sequencing_attrition_or_discontinuation,

        ${truthy("topics_brief_flags_quality_of_life")} AS topics_brief_flags_quality_of_life,
        ${truthy("topics_brief_flags_neuro_or_cognitive_toxicity")} AS topics_brief_flags_neuro_or_cognitive_toxicity,
        ${truthy("topics_brief_flags_cns_or_brain_mets")} AS topics_brief_flags_cns_or_brain_mets,
        ${truthy("topics_brief_flags_uk_access_or_reimbursement")} AS topics_brief_flags_uk_access_or_reimbursement,

        ${truthy("uk_access_is_uk_related")} AS uk_access_is_uk_related,
        uk_access_nation_hint,

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
        AND (@stakeholder IS NULL OR ARRAY_LENGTH(@stakeholder) = 0 OR (${stakeholderBucket}) IN UNNEST(@stakeholder))
        AND (@sentimentLabel IS NULL OR ARRAY_LENGTH(@sentimentLabel) = 0 OR sentiment_label IN UNNEST(@sentimentLabel))
        AND (@evidenceType IS NULL OR ARRAY_LENGTH(@evidenceType) = 0 OR post_type_evidence_type IN UNNEST(@evidenceType))
        AND (@cardBucket IS NULL OR ARRAY_LENGTH(@cardBucket) = 0 OR card_bucket IN UNNEST(@cardBucket))
        AND (
          @searchText = ''
          OR (
            LOWER(text) LIKE CONCAT('%', LOWER(@searchText), '%')
            OR LOWER(IFNULL(topics_key_terms,'')) LIKE CONCAT('%', LOWER(@searchText), '%')
            OR LOWER(IFNULL(topics_top_topics,'')) LIKE CONCAT('%', LOWER(@searchText), '%')
          )
        )
        AND (NOT @sequencingOnly OR ${truthy("sequencing_is_sequencing_discussed")})
        AND (
          NOT @ukOnly
          OR (${truthy("uk_access_is_uk_related")} OR ${truthy("topics_brief_flags_uk_access_or_reimbursement")})
        )
    )
  `
}

export function getExecutiveBaseParams(filters: ExecutiveFilters) {
  return {
    startDate: filters.startDate,
    endDate: filters.endDate,
    includeLow: filters.includeLowRelevance,
    stakeholder: filters.stakeholder,
    sentimentLabel: filters.sentimentLabel,
    evidenceType: filters.evidenceType,
    cardBucket: filters.cardBucket,
    searchText: filters.searchText,
    sequencingOnly: filters.sequencingOnly,
    ukOnly: filters.ukOnly,
  }
}


