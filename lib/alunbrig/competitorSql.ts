import type { CompetitorLensFilters } from "@/lib/alunbrig/competitorFilters"
import { flagsToParams } from "@/lib/alunbrig/themeFilters"

const truthy = (field: string) => `(LOWER(TRIM(CAST(${field} AS STRING))) IN ('true','1','yes'))`

/**
 * Normalize a token for stable grouping/comparison:
 * - lower-case
 * - trim
 * - collapse repeated whitespace
 */
export function normalizeEntityTokenSql(expr: string) {
  return `REGEXP_REPLACE(LOWER(TRIM(CAST(${expr} AS STRING))), r'\\s+', ' ')`
}

/**
 * Canonicalize a token for grouping:
 * - normalize whitespace/case
 * - strip trailing parenthetical qualifiers (e.g. "brigatinib (implied)" -> "brigatinib")
 */
export function tokenKeySql(expr: string) {
  const n = normalizeEntityTokenSql(expr)
  return `REGEXP_REPLACE(${n}, r'\\s*\\([^)]*\\)\\s*$', '')`
}

/**
 * Canonical key for competitor/drug tokens so we can:
 * - dedupe accidental duplicates (case/whitespace)
 * - group brand/generic for the same asset (e.g. Alunbrig == brigatinib)
 *
 * NOTE: This is intentionally small and can be extended as needed.
 */
export function competitorAssetKeySql(expr: string) {
  const k = tokenKeySql(expr)
  // brand_to_generic_map is defined in getCompetitorBaseCteSql() for all competitor endpoints.
  return `COALESCE((SELECT generic_key FROM brand_to_generic_map WHERE brand_key = ${k} LIMIT 1), ${k})`
}

export function competitorAssetLabelSql(keyExpr: string, fallbackLabelExpr: string) {
  // Provide a human-friendly combined label for the target asset.
  // (We keep other assets' labels stable, to avoid unintended UI churn.)
  return `
    CASE
      WHEN ${keyExpr} = 'brigatinib' THEN 'Alunbrig (brigatinib)'
      ELSE ${fallbackLabelExpr}
    END
  `
}

export function getCompetitorBaseCteSql() {
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
        card_bucket,
        post_type_evidence_type,

        ${truthy("uk_access_is_uk_related")} AS uk_access_is_uk_related,
        uk_access_nation_hint,

        competitive_positioning_comparative_context,
        competitive_positioning_stance_toward_alunbrig,

        entities_competitors,
        entities_drugs_brands,
        entities_drugs_generics,

        ${truthy("sequencing_is_sequencing_discussed")} AS sequencing_is_sequencing_discussed,
        ${truthy("topics_brief_flags_efficacy_outcomes")} AS topics_brief_flags_efficacy_outcomes,
        ${truthy("topics_brief_flags_safety_or_tolerability")} AS topics_brief_flags_safety_or_tolerability,
        ${truthy("topics_brief_flags_neuro_or_cognitive_toxicity")} AS topics_brief_flags_neuro_or_cognitive_toxicity,
        ${truthy("topics_brief_flags_quality_of_life")} AS topics_brief_flags_quality_of_life,
        ${truthy("topics_brief_flags_caregiver_burden")} AS topics_brief_flags_caregiver_burden,
        ${truthy("topics_brief_flags_cns_or_brain_mets")} AS topics_brief_flags_cns_or_brain_mets,
        ${truthy("topics_brief_flags_uk_access_or_reimbursement")} AS topics_brief_flags_uk_access_or_reimbursement,

        insight_tags_opportunities,
        insight_tags_hurdles,

        text,
        url,
        CAST(id AS STRING) AS id,
        COALESCE(SAFE_CAST(likeCount AS INT64),0)
          + COALESCE(SAFE_CAST(retweetCount AS INT64),0)
          + COALESCE(SAFE_CAST(replyCount AS INT64),0)
          + COALESCE(SAFE_CAST(quoteCount AS INT64),0)
          + COALESCE(SAFE_CAST(bookmarkCount AS INT64),0) AS engagement,
        COALESCE(SAFE_CAST(viewCount AS INT64),0) AS viewCount
      FROM \`${process.env.BQ_MAIN_TABLE}\`
      WHERE ${truthy("data_quality_keep_for_analysis")} = TRUE
        AND SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt) IS NOT NULL
        AND DATE(SAFE.PARSE_TIMESTAMP('%a %b %d %H:%M:%S %z %Y', createdAt)) BETWEEN DATE(@startDate) AND DATE(@endDate)
        AND (
          (COALESCE(SAFE_CAST(@includeLow AS BOOL), FALSE) = TRUE AND relevance_label IN ('high','medium','low'))
          OR (COALESCE(SAFE_CAST(@includeLow AS BOOL), FALSE) = FALSE AND relevance_label IN ('high','medium'))
        )
        AND (@stakeholder IS NULL OR ARRAY_LENGTH(@stakeholder) = 0 OR stakeholder_primary IN UNNEST(@stakeholder))
        AND (@sentimentLabel IS NULL OR ARRAY_LENGTH(@sentimentLabel) = 0 OR sentiment_label IN UNNEST(@sentimentLabel))
        AND (@ukNation IS NULL OR ARRAY_LENGTH(@ukNation) = 0 OR uk_access_nation_hint IN UNNEST(@ukNation))
        AND (
          NOT COALESCE(SAFE_CAST(@sequencingOnly AS BOOL), FALSE)
          OR ${truthy("sequencing_is_sequencing_discussed")} = TRUE
        )
        AND (@evidenceType IS NULL OR ARRAY_LENGTH(@evidenceType) = 0 OR post_type_evidence_type IN UNNEST(@evidenceType))

        AND (NOT COALESCE(SAFE_CAST(@flagEfficacy AS BOOL), FALSE) OR ${truthy("topics_brief_flags_efficacy_outcomes")} = TRUE)
        AND (NOT COALESCE(SAFE_CAST(@flagSafety AS BOOL), FALSE) OR ${truthy("topics_brief_flags_safety_or_tolerability")} = TRUE)
        AND (NOT COALESCE(SAFE_CAST(@flagNeurotox AS BOOL), FALSE) OR ${truthy("topics_brief_flags_neuro_or_cognitive_toxicity")} = TRUE)
        AND (NOT COALESCE(SAFE_CAST(@flagQol AS BOOL), FALSE) OR ${truthy("topics_brief_flags_quality_of_life")} = TRUE)
        AND (NOT COALESCE(SAFE_CAST(@flagCaregiver AS BOOL), FALSE) OR ${truthy("topics_brief_flags_caregiver_burden")} = TRUE)
        AND (NOT COALESCE(SAFE_CAST(@flagCns AS BOOL), FALSE) OR ${truthy("topics_brief_flags_cns_or_brain_mets")} = TRUE)
        AND (
          NOT COALESCE(SAFE_CAST(@flagUkAccess AS BOOL), FALSE)
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
    __brand_tokens AS (
      SELECT
        id,
        TRIM(b) AS brand_raw,
        ${tokenKeySql("b")} AS brand_key
      FROM base,
      UNNEST(SPLIT(IFNULL(CAST(entities_drugs_brands AS STRING), ''), ';')) AS b
      WHERE TRIM(b) != ''
        AND LOWER(TRIM(b)) NOT IN ('unknown')
    ),
    __generic_tokens AS (
      SELECT
        id,
        TRIM(g) AS generic_raw,
        ${tokenKeySql("g")} AS generic_key
      FROM base,
      UNNEST(SPLIT(IFNULL(CAST(entities_drugs_generics AS STRING), ''), ';')) AS g
      WHERE TRIM(g) != ''
        AND LOWER(TRIM(g)) NOT IN ('unknown')
    ),
    __brand_label_variants AS (
      SELECT brand_key, brand_raw, COUNT(DISTINCT id) AS mentions
      FROM __brand_tokens
      WHERE brand_key != ''
      GROUP BY brand_key, brand_raw
    ),
    __generic_label_variants AS (
      SELECT generic_key, generic_raw, COUNT(DISTINCT id) AS mentions
      FROM __generic_tokens
      WHERE generic_key != ''
      GROUP BY generic_key, generic_raw
    ),
    __brand_label_pick AS (
      SELECT
        brand_key,
        ARRAY_AGG(STRUCT(brand_raw, mentions) ORDER BY mentions DESC, brand_raw LIMIT 1)[OFFSET(0)].brand_raw AS brand_label
      FROM __brand_label_variants
      GROUP BY brand_key
    ),
    __generic_label_pick AS (
      SELECT
        generic_key,
        ARRAY_AGG(STRUCT(generic_raw, mentions) ORDER BY mentions DESC, generic_raw LIMIT 1)[OFFSET(0)].generic_raw AS generic_label
      FROM __generic_label_variants
      GROUP BY generic_key
    ),
    __brand_generic_counts AS (
      SELECT
        b.brand_key,
        g.generic_key,
        COUNT(DISTINCT b.id) AS cnt
      FROM __brand_tokens b
      JOIN __generic_tokens g USING(id)
      WHERE b.brand_key != ''
        AND g.generic_key != ''
        AND b.brand_key != g.generic_key
      GROUP BY b.brand_key, g.generic_key
    ),
    __brand_generic_ranked AS (
      SELECT
        *,
        SUM(cnt) OVER (PARTITION BY brand_key) AS total_cnt,
        SAFE_DIVIDE(cnt, NULLIF(SUM(cnt) OVER (PARTITION BY brand_key),0)) AS share
      FROM __brand_generic_counts
    ),
    __brand_to_generic AS (
      -- Data-driven brand->generic mapping based on co-occurrence in the same post.
      -- Conservative thresholds reduce the risk of incorrect merges.
      SELECT brand_key, generic_key
      FROM __brand_generic_ranked
      WHERE cnt >= 3
        AND share >= 0.5
      QUALIFY ROW_NUMBER() OVER (PARTITION BY brand_key ORDER BY cnt DESC, generic_key) = 1
    ),
    brand_to_generic_map AS (
      SELECT
        m.brand_key,
        m.generic_key,
        bl.brand_label,
        gl.generic_label
      FROM __brand_to_generic m
      LEFT JOIN __brand_label_pick bl USING(brand_key)
      LEFT JOIN __generic_label_pick gl USING(generic_key)
    )
  `
}

export function getCompetitorBaseParams(filters: CompetitorLensFilters) {
  const flagParams = flagsToParams(filters.flags)
  return {
    startDate: filters.startDate,
    endDate: filters.endDate,
    includeLow: filters.includeLowRelevance,
    stakeholder: filters.stakeholder,
    sentimentLabel: filters.sentimentLabel,
    ukNation: filters.ukNation,
    sequencingOnly: filters.sequencingOnly,
    evidenceType: filters.evidenceType,
    searchText: filters.searchText,
    ...flagParams,
  }
}
