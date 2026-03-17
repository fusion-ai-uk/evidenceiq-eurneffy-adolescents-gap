import type { ArticleRow, EvidenceExtract, RawCsvRow } from "@/lib/evidence/types"

const LIST_SPLIT_REGEX = /\s*(?:\||;)\s*/

const LIST_FIELD_KEYS = new Set([
  "brief_age_secondary",
  "brief_geography_tags",
  "brief_audience_secondary",
  "brief_barrier_tags",
  "brief_behavioural_driver_tags",
  "brief_setting_tags",
  "brief_dosing_transition_tags",
  "brief_recognition_response_tags",
  "brief_equity_access_tags",
  "brief_social_psychology_tags",
  "brief_training_error_tags",
  "brief_data_gap_tags",
  "eur_eurneffy_opportunity_tags",
  "eur_message_routes",
  "eur_message_cautions",
  "brief_key_statistics",
  "brief_key_quotes",
  "brief_evidence_extracts",
  "brief_gap_extracts",
  "brief_cited_bodies_or_sources",
  "brief_recommended_use_cases",
  "brief_med_legal_review_flags",
  "brief_gap_reason_structured",
  "brief_downstream_aggregation_keys",
])

function normalizeString(value: unknown): string {
  if (value === null || value === undefined) return ""
  const next = String(value).trim()
  if (next === "NA" || next === "N/A" || next === "null" || next === "undefined") return ""
  return next
}

export function toBoolean(value: unknown): boolean {
  const next = normalizeString(value).toLowerCase()
  if (!next) return false
  return ["true", "1", "yes", "y"].includes(next)
}

export function toNumber(value: unknown): number | null {
  const next = normalizeString(value)
  if (!next) return null
  const stripped = next.replace(/,/g, "")
  const parsed = Number(stripped)
  return Number.isFinite(parsed) ? parsed : null
}

function stripQuotes(value: string): string {
  return value.replace(/^["'`]+|["'`]+$/g, "").trim()
}

export function parseList(value: unknown): string[] {
  const raw = normalizeString(value)
  if (!raw) return []

  if (raw.startsWith("[") && raw.endsWith("]")) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map((item) => stripQuotes(normalizeString(item))).filter(Boolean)
      }
    } catch {
      // Fall through to delimiter parsing.
    }
  }

  const noOuterQuotes = stripQuotes(raw)
  if (!noOuterQuotes) return []

  if (LIST_SPLIT_REGEX.test(noOuterQuotes)) {
    return noOuterQuotes
      .split(LIST_SPLIT_REGEX)
      .map((item) => stripQuotes(item))
      .filter(Boolean)
  }

  return [noOuterQuotes]
}

function readText(row: RawCsvRow, key: string): string {
  return normalizeString(row[key])
}

function readList(row: RawCsvRow, key: string): string[] {
  return parseList(row[key])
}

function readScoreMap(row: RawCsvRow, prefix: string): Record<string, number | null> {
  return Object.entries(row).reduce<Record<string, number | null>>((acc, [key, value]) => {
    if (!key.startsWith(prefix)) return acc
    const nestedKey = key.replace(prefix, "")
    acc[nestedKey] = toNumber(value)
    return acc
  }, {})
}

function readFlags(row: RawCsvRow): Record<string, boolean> {
  return Object.entries(row).reduce<Record<string, boolean>>((acc, [key, value]) => {
    if (!key.startsWith("flag_")) return acc
    acc[key] = toBoolean(value)
    return acc
  }, {})
}

function normalizeListsInRawRow(row: RawCsvRow): RawCsvRow {
  const next: RawCsvRow = {}
  Object.entries(row).forEach(([key, value]) => {
    if (!LIST_FIELD_KEYS.has(key)) {
      next[key] = normalizeString(value)
      return
    }
    next[key] = parseList(value).join(" | ")
  })
  return next
}

export function normalizeArticleRow(input: RawCsvRow): ArticleRow {
  const row = normalizeListsInRawRow(input)

  return {
    rowId: readText(row, "_row_id"),
    groupId: readText(row, "_group_id"),
    inputRowIndex: toNumber(row["_input_row_index"]),
    sourceUrl: readText(row, "_source_url"),
    canonicalUrl: readText(row, "_canonical_url"),
    sourceFile: readText(row, "_source_file"),
    processingStatus: readText(row, "_processing_status"),
    analysisReady: toBoolean(row["analysis_ready"]),
    analysisReadyReason: readText(row, "analysis_ready_reason"),
    keep: toBoolean(row["brief_keep"]),
    filterOut: toBoolean(row["brief_filter_out"]),
    filterReason: readText(row, "brief_filter_reason"),
    title: readText(row, "article_title_guess"),
    oneLineTakeaway: readText(row, "brief_one_line_takeaway"),
    evidenceSummary: readText(row, "brief_evidence_summary"),
    fitWhyItMatters: readText(row, "brief_fit_summary.why_it_matters_for_brief"),
    fitWhatItIsNot: readText(row, "brief_fit_summary.what_it_is_not"),
    articleKind: readText(row, "brief_article_kind"),
    sourceType: readText(row, "brief_source_type"),
    evidenceType: readText(row, "brief_evidence_type"),
    studyDesign: readText(row, "brief_study_design"),
    evidenceStrength: readText(row, "brief_evidence_strength"),
    evidenceStrengthReason: readText(row, "brief_evidence_strength_reason"),
    publicationYear: readText(row, "brief_publication_year"),
    sampleSize: readText(row, "brief_sample_size"),
    ageFocus: readText(row, "brief_age_focus"),
    ageSecondary: readList(row, "brief_age_secondary"),
    adolescentSpecificityScore: toNumber(row["brief_adolescent_specificity_score_0_100"]),
    populationDirectness: readText(row, "brief_population_directness"),
    geographyPrimary: readText(row, "brief_geography_primary"),
    geographyTags: readList(row, "brief_geography_tags"),
    ukRelevanceScore: toNumber(row["brief_uk_relevance_score_0_100"]),
    europeRelevanceScore: toNumber(row["brief_europe_relevance_score_0_100"]),
    geographyDirectness: readText(row, "brief_geography_directness"),
    audiencePrimary: readText(row, "brief_audience_primary"),
    audienceSecondary: readList(row, "brief_audience_secondary"),
    barrierTags: readList(row, "brief_barrier_tags"),
    behaviouralDriverTags: readList(row, "brief_behavioural_driver_tags"),
    settingTags: readList(row, "brief_setting_tags"),
    dosingTransitionTags: readList(row, "brief_dosing_transition_tags"),
    recognitionResponseTags: readList(row, "brief_recognition_response_tags"),
    equityAccessTags: readList(row, "brief_equity_access_tags"),
    socialPsychologyTags: readList(row, "brief_social_psychology_tags"),
    trainingErrorTags: readList(row, "brief_training_error_tags"),
    dataGapTags: readList(row, "brief_data_gap_tags"),
    gapKindPrimary: readText(row, "brief_gap_kind_primary"),
    gapReasonStructured: readList(row, "brief_gap_reason_structured"),
    gapPriority: readText(row, "brief_gap_priority"),
    gapSummary: readText(row, "brief_gap_summary"),
    reportsNoAdolescentBreakout: toBoolean(row["brief_reports_no_adolescent_breakout"]),
    reportsNoUkBreakout: toBoolean(row["brief_reports_no_uk_breakout"]),
    reportsNoRealWorldErrorData: toBoolean(row["brief_reports_no_real_world_error_data"]),
    reportsNoSettingSpecificData: toBoolean(row["brief_reports_no_setting_specific_data"]),
    reportsNoEquitySubgroupData: toBoolean(row["brief_reports_no_equity_subgroup_data"]),
    kolQuestion: readText(row, "brief_kol_question"),
    followupResearchQuestion: readText(row, "brief_followup_research_question"),
    missingStatWishWeHad: readText(row, "brief_missing_stat_we_wish_we_had"),
    eurRelevanceScore: toNumber(row["eur_eurneffy_relevance_score_0_100"]),
    eurOpportunityTags: readList(row, "eur_eurneffy_opportunity_tags"),
    eurSupportLevel: readText(row, "eur_eurneffy_support_level"),
    eurMessageRoutes: readList(row, "eur_message_routes"),
    eurMessageCautions: readList(row, "eur_message_cautions"),
    actionabilityForMessaging: readText(row, "brief_actionability_for_messaging"),
    actionabilityReason: readText(row, "brief_actionability_reason"),
    bestUse: readText(row, "brief_best_use"),
    recommendedUseCases: readList(row, "brief_recommended_use_cases"),
    medLegalReviewFlags: readList(row, "brief_med_legal_review_flags"),
    keyStatistics: readList(row, "brief_key_statistics"),
    hasUsableStat: toBoolean(row["brief_has_usable_stat"]),
    statCount: toNumber(row["brief_stat_count"]),
    bestStatForSlide: readText(row, "brief_best_stat_for_slide"),
    keyQuotes: readList(row, "brief_key_quotes"),
    bestGapQuote: readText(row, "brief_best_gap_quote"),
    evidenceExtracts: readList(row, "brief_evidence_extracts"),
    gapExtracts: readList(row, "brief_gap_extracts"),
    citedBodiesOrSources: readList(row, "brief_cited_bodies_or_sources"),
    noveltyVsMedicalWriter: readText(row, "brief_novelty_vs_medical_writer"),
    incrementalValueScore: toNumber(row["brief_incremental_value_score_0_100"]),
    downstreamAggregationKeys: readList(row, "brief_downstream_aggregation_keys"),
    confidenceScore: toNumber(row["brief_confidence_0_100"]),
    usefulnessScore: toNumber(row["brief_usefulness_score_0_100"]),
    messageUsefulnessScore: toNumber(row["brief_message_usefulness_score_0_100"]),
    gapUsefulnessScore: toNumber(row["brief_gap_analysis_usefulness_score_0_100"]),
    usefulnessLabel: readText(row, "brief_usefulness_label"),
    textQualityLabel: readText(row, "_input_text_quality_label"),
    textQualityScore: toNumber(row["_input_text_quality_score_0_100"]),
    textProbablyPartial: toBoolean(row["_input_text_probably_partial"]),
    textNeedsRecrawl: toBoolean(row["_input_text_needs_recrawl"]),
    inputTextChars: toNumber(row["_input_text_chars"]),
    pillarScores: readScoreMap(row, "brief_pillar_scores."),
    topicScores: readScoreMap(row, "brief_topic_scores."),
    fitAssessment: readScoreMap(row, "brief_fit_assessment."),
    flags: readFlags(row),
    raw: row,
  }
}

export function normalizeEvidenceExtract(input: RawCsvRow): EvidenceExtract {
  return {
    rowId: normalizeString(input["_row_id"]),
    inputRowIndex: toNumber(input["_input_row_index"]),
    sourceUrl: normalizeString(input["_source_url"]),
    extractRank: toNumber(input["extract_rank"]),
    extractText: normalizeString(input["extract_text"]),
    isGapExtract: toBoolean(input["is_gap_extract"]),
    usefulnessScore: toNumber(input["brief_usefulness_score_0_100"]),
    gapUsefulnessScore: toNumber(input["brief_gap_analysis_usefulness_score_0_100"]),
    messageUsefulnessScore: toNumber(input["brief_message_usefulness_score_0_100"]),
  }
}

