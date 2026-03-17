import type { ArticleRow, EvidenceExtract, FrequencyItem } from "@/lib/evidence/types"
import { getAverageScore, getRowsForOpportunityTag, getRowsForPillar, getRowsForTopic, getTagFrequency } from "@/lib/evidence/selectors"
import { SCORE_THRESHOLDS } from "@/lib/evidence/constants"
import { toFrequency, valueFrequency } from "@/lib/evidence/aggregations"

export type CohortPreset =
  | "uk_direct_adolescent"
  | "uk_guidance_context"
  | "high_message_value"
  | "high_gap_value"
  | "dosing_focused"
  | "recognition_response_focused"
  | "settings_risk_focused"
  | "eurneffy_contextual_support"
  | "high_priority_gaps"

export interface CohortConfig {
  name: string
  includeScope: "all" | "included" | "excluded"
  analysisReadyOnly: boolean
  adolescentDirectOnly: boolean
  ukDirectOnly: boolean
  minUsefulness?: number
  minMessageUsefulness?: number
  minGapUsefulness?: number
  minConfidence?: number
  pillarKey?: string
  topicKey?: string
  barrierTags?: string[]
  settingTags?: string[]
  gapTags?: string[]
  opportunityTags?: string[]
  sourceTypes?: string[]
}

export function buildCohort(rows: ArticleRow[], config: CohortConfig): ArticleRow[] {
  let result = [...rows]
  if (config.includeScope === "included") result = result.filter((row) => row.keep)
  if (config.includeScope === "excluded") result = result.filter((row) => !row.keep)
  if (config.analysisReadyOnly) result = result.filter((row) => row.analysisReady)
  if (config.adolescentDirectOnly) result = result.filter((row) => row.populationDirectness.toLowerCase().includes("adolescent direct"))
  if (config.ukDirectOnly) result = result.filter((row) => (row.ukRelevanceScore ?? 0) >= SCORE_THRESHOLDS.ukDirect)
  if (config.minUsefulness !== undefined) result = result.filter((row) => (row.usefulnessScore ?? 0) >= config.minUsefulness!)
  if (config.minMessageUsefulness !== undefined) result = result.filter((row) => (row.messageUsefulnessScore ?? 0) >= config.minMessageUsefulness!)
  if (config.minGapUsefulness !== undefined) result = result.filter((row) => (row.gapUsefulnessScore ?? 0) >= config.minGapUsefulness!)
  if (config.minConfidence !== undefined) result = result.filter((row) => (row.confidenceScore ?? 0) >= config.minConfidence!)
  if (config.pillarKey) result = getRowsForPillar(result, config.pillarKey)
  if (config.topicKey) result = getRowsForTopic(result, config.topicKey)
  if (config.barrierTags?.length) result = result.filter((row) => row.barrierTags.some((tag) => config.barrierTags!.includes(tag)))
  if (config.settingTags?.length) result = result.filter((row) => row.settingTags.some((tag) => config.settingTags!.includes(tag)))
  if (config.gapTags?.length) result = result.filter((row) => row.dataGapTags.some((tag) => config.gapTags!.includes(tag)))
  if (config.opportunityTags?.length) result = result.filter((row) => row.eurOpportunityTags.some((tag) => config.opportunityTags!.includes(tag)))
  if (config.sourceTypes?.length) result = result.filter((row) => config.sourceTypes!.includes(row.sourceType))
  return result
}

export function cohortPresetToConfig(preset: CohortPreset): CohortConfig {
  if (preset === "uk_direct_adolescent") return { name: "UK-direct adolescent evidence", includeScope: "included", analysisReadyOnly: true, adolescentDirectOnly: true, ukDirectOnly: true }
  if (preset === "uk_guidance_context") return { name: "UK guidance/regulator context", includeScope: "included", analysisReadyOnly: true, adolescentDirectOnly: false, ukDirectOnly: true, sourceTypes: ["guideline / quality standard (UK)", "UK government / regulator (MHRA via GOV.UK)", "guideline/quality standard (NICE)"] }
  if (preset === "high_message_value") return { name: "High message value", includeScope: "included", analysisReadyOnly: true, adolescentDirectOnly: false, ukDirectOnly: false, minMessageUsefulness: 70 }
  if (preset === "high_gap_value") return { name: "High gap value", includeScope: "included", analysisReadyOnly: true, adolescentDirectOnly: false, ukDirectOnly: false, minGapUsefulness: 70 }
  if (preset === "dosing_focused") return { name: "Dosing-focused evidence", includeScope: "included", analysisReadyOnly: true, adolescentDirectOnly: false, ukDirectOnly: false, topicKey: "dosing_transitions" }
  if (preset === "recognition_response_focused") return { name: "Recognition/response evidence", includeScope: "included", analysisReadyOnly: true, adolescentDirectOnly: false, ukDirectOnly: false, topicKey: "recognition_response" }
  if (preset === "settings_risk_focused") return { name: "Settings-of-risk evidence", includeScope: "included", analysisReadyOnly: true, adolescentDirectOnly: false, ukDirectOnly: false, topicKey: "settings_of_risk" }
  if (preset === "eurneffy_contextual_support") return { name: "EURneffy contextual support", includeScope: "included", analysisReadyOnly: true, adolescentDirectOnly: false, ukDirectOnly: false, minConfidence: 40, opportunityTags: [] }
  return { name: "High-priority gaps", includeScope: "included", analysisReadyOnly: true, adolescentDirectOnly: false, ukDirectOnly: false, minGapUsefulness: 70 }
}

export function compareCohorts(aRows: ArticleRow[], bRows: ArticleRow[]) {
  return {
    counts: { a: aRows.length, b: bRows.length, delta: aRows.length - bRows.length },
    averages: {
      usefulness: { a: getAverageScore(aRows, (row) => row.usefulnessScore), b: getAverageScore(bRows, (row) => row.usefulnessScore) },
      message: { a: getAverageScore(aRows, (row) => row.messageUsefulnessScore), b: getAverageScore(bRows, (row) => row.messageUsefulnessScore) },
      gap: { a: getAverageScore(aRows, (row) => row.gapUsefulnessScore), b: getAverageScore(bRows, (row) => row.gapUsefulnessScore) },
      adolescent: { a: getAverageScore(aRows, (row) => row.adolescentSpecificityScore), b: getAverageScore(bRows, (row) => row.adolescentSpecificityScore) },
      uk: { a: getAverageScore(aRows, (row) => row.ukRelevanceScore), b: getAverageScore(bRows, (row) => row.ukRelevanceScore) },
      eur: { a: getAverageScore(aRows, (row) => row.eurRelevanceScore), b: getAverageScore(bRows, (row) => row.eurRelevanceScore) },
      confidence: { a: getAverageScore(aRows, (row) => row.confidenceScore), b: getAverageScore(bRows, (row) => row.confidenceScore) },
    },
    bySourceType: { a: valueFrequency(aRows, (row) => row.sourceType), b: valueFrequency(bRows, (row) => row.sourceType) },
    byPopulationDirectness: { a: valueFrequency(aRows, (row) => row.populationDirectness), b: valueFrequency(bRows, (row) => row.populationDirectness) },
    byGeographyDirectness: { a: valueFrequency(aRows, (row) => row.geographyDirectness), b: valueFrequency(bRows, (row) => row.geographyDirectness) },
    barrierDiff: diffFrequency(getTagFrequency(aRows, (row) => row.barrierTags), getTagFrequency(bRows, (row) => row.barrierTags)),
    settingDiff: diffFrequency(getTagFrequency(aRows, (row) => row.settingTags), getTagFrequency(bRows, (row) => row.settingTags)),
    gapDiff: diffFrequency(getTagFrequency(aRows, (row) => row.dataGapTags), getTagFrequency(bRows, (row) => row.dataGapTags)),
    eurDiff: diffFrequency(getTagFrequency(aRows, (row) => row.eurOpportunityTags), getTagFrequency(bRows, (row) => row.eurOpportunityTags)),
  }
}

function diffFrequency(a: FrequencyItem[], b: FrequencyItem[]) {
  const map = new Map<string, { a: number; b: number; aPct: number; bPct: number }>()
  a.forEach((item) => map.set(item.key, { a: item.count, b: map.get(item.key)?.b ?? 0, aPct: item.percentage, bPct: map.get(item.key)?.bPct ?? 0 }))
  b.forEach((item) =>
    map.set(item.key, {
      a: map.get(item.key)?.a ?? 0,
      b: item.count,
      aPct: map.get(item.key)?.aPct ?? 0,
      bPct: item.percentage,
    }),
  )
  return Array.from(map.entries())
    .map(([key, counts]) => ({ key, ...counts, delta: counts.aPct - counts.bPct }))
    .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta) || y.aPct - x.aPct)
}

export function getGapClusters(rows: ArticleRow[]) {
  const groups = {
    adolescent_specificity_gaps: rows.filter((row) => row.reportsNoAdolescentBreakout),
    uk_data_gaps: rows.filter((row) => row.reportsNoUkBreakout),
    real_world_behaviour_gaps: rows.filter((row) => row.reportsNoRealWorldErrorData || row.dataGapTags.some((tag) => tag.includes("real_world"))),
    dosing_transition_gaps: rows.filter((row) => row.dosingTransitionTags.length > 0 && row.dataGapTags.length > 0),
    setting_specific_gaps: rows.filter((row) => row.reportsNoSettingSpecificData),
    equity_access_gaps: rows.filter((row) => row.reportsNoEquitySubgroupData || row.equityAccessTags.length > 0),
    training_technique_gaps: rows.filter((row) => row.trainingErrorTags.length > 0 && row.dataGapTags.length > 0),
    device_comparison_gaps: rows.filter((row) => row.dataGapTags.some((tag) => tag.includes("device_comparison"))),
  }
  return groups
}

export function rankGapItems(rows: ArticleRow[]) {
  const tagFrequency = getTagFrequency(rows, (row) => row.dataGapTags)
  return tagFrequency.map((item) => {
    const supporting = rows.filter((row) => row.dataGapTags.includes(item.key))
    return {
      key: item.key,
      count: item.count,
      weightedGapUsefulness: getAverageScore(supporting, (row) => row.gapUsefulnessScore),
      weightedUsefulness: getAverageScore(supporting, (row) => row.usefulnessScore),
      confidence: getAverageScore(supporting, (row) => row.confidenceScore),
      adolescentSpecificity: getAverageScore(supporting, (row) => row.adolescentSpecificityScore),
      ukRelevance: getAverageScore(supporting, (row) => row.ukRelevanceScore),
      directRows: supporting.filter((row) => row.populationDirectness.toLowerCase().includes("adolescent direct")).length,
      proxyRows: supporting.filter((row) => row.populationDirectness.toLowerCase().includes("proxy")).length,
      kolQuestions: supporting.filter((row) => Boolean(row.kolQuestion)).length,
      missingStats: supporting.filter((row) => Boolean(row.missingStatWishWeHad)).length,
    }
  })
}

export function getQuestionBank(rows: ArticleRow[]) {
  return {
    kol: toFrequency(rows.map((row) => row.kolQuestion).filter(Boolean), rows.length),
    followup: toFrequency(rows.map((row) => row.followupResearchQuestion).filter(Boolean), rows.length),
    missingStats: toFrequency(rows.map((row) => row.missingStatWishWeHad).filter(Boolean), rows.length),
  }
}

export function getMostHandoffWorthyRows(rows: ArticleRow[]) {
  const scored = rows.map((row) => {
    const handoffScore =
      0.25 * (row.usefulnessScore ?? 0) +
      0.15 * (row.incrementalValueScore ?? 0) +
      0.15 * (row.confidenceScore ?? 0) +
      0.15 * (row.adolescentSpecificityScore ?? 0) +
      0.1 * (row.ukRelevanceScore ?? 0) +
      0.1 * (row.eurRelevanceScore ?? 0) +
      0.1 * (row.gapUsefulnessScore ?? 0)
    return { row, handoffScore }
  })
  return scored.sort((a, b) => b.handoffScore - a.handoffScore)
}

export function getLikelyCaptureGapRows(rows: ArticleRow[]) {
  return rows
    .filter(
      (row) =>
        !row.analysisReady &&
        (row.textProbablyPartial || row.textNeedsRecrawl || row.textQualityLabel.includes("stub") || row.processingStatus === "partial"),
    )
    .sort((a, b) => (b.ukRelevanceScore ?? 0) + (b.usefulnessScore ?? 0) - ((a.ukRelevanceScore ?? 0) + (a.usefulnessScore ?? 0)))
}

export function getTrueGapVsCaptureGapBreakdown(rows: ArticleRow[]) {
  const captureGap = rows.filter((row) => !row.analysisReady && (row.textProbablyPartial || row.textNeedsRecrawl || row.processingStatus === "partial"))
  const trueGap = rows.filter((row) => row.analysisReady && row.gapUsefulnessScore !== null && (row.gapUsefulnessScore ?? 0) >= 70)
  const mixed = rows.filter((row) => !captureGap.includes(row) && !trueGap.includes(row))
  return { captureGap: captureGap.length, trueGap: trueGap.length, mixed: mixed.length }
}

export function getBasketFriendlyRowSummary(row: ArticleRow) {
  return {
    rowId: row.rowId,
    title: row.title,
    takeaway: row.oneLineTakeaway,
    sourceType: row.sourceType,
    usefulness: row.usefulnessScore,
    gapUsefulness: row.gapUsefulnessScore,
    eurRelevance: row.eurRelevanceScore,
    tags: [...row.barrierTags.slice(0, 2), ...row.settingTags.slice(0, 2)],
    whyItMatters: row.fitWhyItMatters,
    bestStat: row.bestStatForSlide,
  }
}

export function getRepresentativeExtractForRow(row: ArticleRow, evidenceByRowId: Record<string, EvidenceExtract[]>) {
  const extracts = evidenceByRowId[row.rowId] ?? []
  if (extracts.length === 0) return null
  return [...extracts].sort((a, b) => (a.extractRank ?? 99) - (b.extractRank ?? 99))[0]
}

export function getModeAdjustedSortOrder(rows: ArticleRow[], mode: "evidence" | "gap" | "opportunity") {
  if (mode === "gap") {
    return [...rows].sort(
      (a, b) =>
        (b.gapUsefulnessScore ?? 0) - (a.gapUsefulnessScore ?? 0) ||
        (b.gapPriority.toLowerCase() === "critical" ? 1 : 0) - (a.gapPriority.toLowerCase() === "critical" ? 1 : 0),
    )
  }
  if (mode === "opportunity") {
    return [...rows].sort((a, b) => (b.eurRelevanceScore ?? 0) - (a.eurRelevanceScore ?? 0) || (b.messageUsefulnessScore ?? 0) - (a.messageUsefulnessScore ?? 0))
  }
  return [...rows].sort((a, b) => (b.usefulnessScore ?? 0) - (a.usefulnessScore ?? 0) || (b.confidenceScore ?? 0) - (a.confidenceScore ?? 0))
}

