import type { SequencingFilters } from "@/lib/alunbrig/sequencingFilters"

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

export function lotNormSql() {
  return `COALESCE(NULLIF(TRIM(CAST(sequencing_line_of_therapy AS STRING)), ''), 'unspecified')`
}

export function directionNormSql() {
  return `COALESCE(NULLIF(TRIM(CAST(sequencing_sequence_direction AS STRING)), ''), 'unknown')`
}

export function destinationFromDirectionSql(directionExpr: string) {
  return `
    CASE
      WHEN STRPOS(${directionExpr}, '_to_') > 0 THEN SPLIT(${directionExpr}, '_to_')[OFFSET(1)]
      ELSE ${directionExpr}
    END
  `
}

export function getSequencingBaseCteSql() {
  if (!process.env.BQ_MAIN_TABLE) throw new Error("Missing env var BQ_MAIN_TABLE")

  return `
    WITH base AS (
      SELECT
        SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt) AS created_ts,
        DATE(SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt)) AS created_date,
        FORMAT_DATE('%G-W%V', DATE(SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt))) AS created_week,
        FORMAT_DATE('%Y-%m',  DATE(SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt))) AS created_month,

        stakeholder_primary,
        sentiment_label,
        SAFE_CAST(sentiment_polarity_minus1_to_1 AS FLOAT64) AS sentiment_polarity_minus1_to_1,
        sentiment_drivers,
        topics_key_terms,
        topics_top_topics,
        post_type_evidence_type,

        clinical_context_biomarker,
        clinical_context_cns_context,

        ${truthy("sequencing_is_sequencing_discussed")} AS sequencing_is_sequencing_discussed,
        sequencing_line_of_therapy,
        sequencing_sequence_direction,
        ${truthy("sequencing_pfs_or_pfs2_mentioned")} AS sequencing_pfs_or_pfs2_mentioned,
        ${truthy("sequencing_attrition_or_discontinuation")} AS sequencing_attrition_or_discontinuation,
        sequencing_rationale_short,

        ${truthy("uk_access_is_uk_related")} AS uk_access_is_uk_related,
        uk_access_nation_hint,
        uk_access_signals,
        ${truthy("topics_brief_flags_uk_access_or_reimbursement")} AS topics_brief_flags_uk_access_or_reimbursement,

        ${truthy("topics_brief_flags_quality_of_life")} AS topics_brief_flags_quality_of_life,
        ${truthy("topics_brief_flags_efficacy_outcomes")} AS topics_brief_flags_efficacy_outcomes,
        ${truthy("topics_brief_flags_safety_or_tolerability")} AS topics_brief_flags_safety_or_tolerability,
        ${truthy("topics_brief_flags_neuro_or_cognitive_toxicity")} AS topics_brief_flags_neuro_or_cognitive_toxicity,
        ${truthy("topics_brief_flags_cns_or_brain_mets")} AS topics_brief_flags_cns_or_brain_mets,

        entities_drugs_brands,
        entities_drugs_generics,
        entities_competitors,

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
        AND (@stakeholder IS NULL OR ARRAY_LENGTH(@stakeholder) = 0 OR stakeholder_primary IN UNNEST(@stakeholder))
        AND (@sentimentLabel IS NULL OR ARRAY_LENGTH(@sentimentLabel) = 0 OR sentiment_label IN UNNEST(@sentimentLabel))
        AND (@ukNation IS NULL OR ARRAY_LENGTH(@ukNation) = 0 OR uk_access_nation_hint IN UNNEST(@ukNation))
        AND (@evidenceType IS NULL OR ARRAY_LENGTH(@evidenceType) = 0 OR post_type_evidence_type IN UNNEST(@evidenceType))
        AND (@biomarker IS NULL OR ARRAY_LENGTH(@biomarker) = 0 OR clinical_context_biomarker IN UNNEST(@biomarker))
        AND (@cnsContext IS NULL OR ARRAY_LENGTH(@cnsContext) = 0 OR clinical_context_cns_context IN UNNEST(@cnsContext))
        AND (
          @searchText = ''
          OR (
            LOWER(text) LIKE CONCAT('%', LOWER(@searchText), '%')
            OR LOWER(IFNULL(topics_key_terms,'')) LIKE CONCAT('%', LOWER(@searchText), '%')
            OR LOWER(IFNULL(topics_top_topics,'')) LIKE CONCAT('%', LOWER(@searchText), '%')
          )
        )
    )
  `
}

export function togglesWhereSql() {
  return `
    (NOT @sequencingOnly OR sequencing_is_sequencing_discussed = TRUE)
    AND (
      NOT @ukAccessOnly
      OR (uk_access_is_uk_related = TRUE OR topics_brief_flags_uk_access_or_reimbursement = TRUE)
    )
    AND (NOT @pfsOnly OR sequencing_pfs_or_pfs2_mentioned = TRUE)
  `
}

export function getSequencingBaseParams(filters: SequencingFilters) {
  return {
    startDate: filters.startDate,
    endDate: filters.endDate,
    includeLow: filters.includeLowRelevance,
    stakeholder: filters.stakeholder,
    sentimentLabel: filters.sentimentLabel,
    ukNation: filters.ukNation,
    evidenceType: filters.evidenceType,
    biomarker: filters.biomarker,
    cnsContext: filters.cnsContext,
    searchText: filters.searchText,
    sequencingOnly: filters.sequencingOnly,
    ukAccessOnly: filters.ukAccessOnly,
    pfsOnly: filters.pfsOnly,
  }
}
