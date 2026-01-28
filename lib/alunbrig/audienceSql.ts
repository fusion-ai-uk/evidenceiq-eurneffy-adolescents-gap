import type { AudienceGlobalFilters } from "@/lib/alunbrig/audienceFilters"
import { audienceFlagsToParams } from "@/lib/alunbrig/audienceFilters"

const truthy = (field: string) => `(LOWER(TRIM(CAST(${field} AS STRING))) IN ('true','1','yes'))`

export const OTHER_PRIMARY = ["Advocacy", "Org/Institution", "Industry/Pharma", "Investor", "Media", "Other", "Unknown"] as const

export function audienceWhereSql(audience: string) {
  if (audience === "All") return "TRUE"
  if (audience === "HCP") return "stakeholder_primary = 'HCP'"
  if (audience === "Patient") return "stakeholder_primary = 'Patient'"
  if (audience === "Caregiver") return "stakeholder_primary = 'Caregiver'"
  if (audience === "Payer") return "stakeholder_primary = 'Payer'"
  return `stakeholder_primary IN ('Advocacy','Org/Institution','Industry/Pharma','Investor','Media','Other','Unknown')`
}

export function getAudienceBaseCteSql() {
  if (!process.env.BQ_MAIN_TABLE) throw new Error("Missing env var BQ_MAIN_TABLE")

  return `
    WITH base AS (
      SELECT
        SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt) AS created_ts,
        DATE(SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt)) AS created_date,

        stakeholder_primary,
        SAFE_CAST(stakeholder_likelihood_scores_sum_100_HCP AS FLOAT64) AS l_hcp,
        SAFE_CAST(stakeholder_likelihood_scores_sum_100_Patient AS FLOAT64) AS l_patient,
        SAFE_CAST(stakeholder_likelihood_scores_sum_100_Caregiver AS FLOAT64) AS l_caregiver,
        SAFE_CAST(stakeholder_likelihood_scores_sum_100_Payer AS FLOAT64) AS l_payer,
        SAFE_CAST(stakeholder_likelihood_scores_sum_100_Other AS FLOAT64) AS l_other,

        sentiment_label,
        SAFE_CAST(sentiment_polarity_minus1_to_1 AS FLOAT64) AS sentiment_polarity_minus1_to_1,

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
        uk_access_signals,
        insight_tags_hurdles,
        insight_tags_opportunities,
        sentiment_drivers,

        card_bucket,
        topics_top_topics,
        topics_key_terms,
        entities_competitors,
        entities_drugs_brands,
        competitive_positioning_comparative_context,
        competitive_positioning_stance_toward_alunbrig,
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
        AND (@ukNation IS NULL OR ARRAY_LENGTH(@ukNation) = 0 OR uk_access_nation_hint IN UNNEST(@ukNation))
        AND (@evidenceType IS NULL OR ARRAY_LENGTH(@evidenceType) = 0 OR post_type_evidence_type IN UNNEST(@evidenceType))
        AND (NOT @sequencingOnly OR ${truthy("sequencing_is_sequencing_discussed")} = TRUE)

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
    )
  `
}

export function getAudienceBaseParams(filters: AudienceGlobalFilters) {
  return {
    startDate: filters.startDate,
    endDate: filters.endDate,
    includeLow: filters.includeLowRelevance,
    ukNation: filters.ukNation,
    evidenceType: filters.evidenceType,
    sequencingOnly: filters.sequencingOnly,
    searchText: filters.searchText,
    ...audienceFlagsToParams(filters.flags),
  }
}

export function hardGroupSql() {
  return `
    CASE
      WHEN stakeholder_primary = 'HCP' THEN 'HCP'
      WHEN stakeholder_primary = 'Patient' THEN 'Patient'
      WHEN stakeholder_primary = 'Caregiver' THEN 'Caregiver'
      WHEN stakeholder_primary = 'Payer' THEN 'Payer'
      WHEN stakeholder_primary IN ('Advocacy','Org/Institution','Industry/Pharma','Investor','Media','Other','Unknown') THEN 'Other'
      ELSE 'Other'
    END
  `
}
