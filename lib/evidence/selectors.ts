import { SCORE_THRESHOLDS } from "@/lib/evidence/constants"
import type { ArticleRow, EvidenceExtract, FrequencyItem } from "@/lib/evidence/types"
import { listFrequency, toFrequency, valueFrequency } from "@/lib/evidence/aggregations"
import { BARRIER_FAMILIES, OPPORTUNITY_FAMILIES, SETTING_FAMILIES } from "@/lib/evidence/taxonomy"

export type SupportLevelClass = "direct_barrier_match" | "contextual_support" | "weak_connection" | "none"
export type EvidenceSortMode = "evidence" | "gap"

function safeNumber(value: number | null | undefined): number {
  return Number.isFinite(value ?? NaN) ? Number(value) : 0
}

export function getAverageScore(rows: ArticleRow[], getter: (row: ArticleRow) => number | null | undefined): number {
  if (rows.length === 0) return 0
  const values = rows.map(getter).filter((value): value is number => Number.isFinite(value ?? NaN))
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

export function getBooleanFlagCount(rows: ArticleRow[], flagKey: string): number {
  return rows.filter((row) => row.flags[flagKey]).length
}

export function getRowsForPillar(rows: ArticleRow[], pillarKey: string): ArticleRow[] {
  const flagKey = `flag_pillar_${pillarKey}`
  return rows.filter((row) => row.flags[flagKey] || safeNumber(row.pillarScores[pillarKey]) > 0)
}

export function getRowsForTopic(rows: ArticleRow[], topicKey: string): ArticleRow[] {
  const flagKey = `flag_topic_${topicKey}`
  return rows.filter((row) => row.flags[flagKey] || safeNumber(row.topicScores[topicKey]) > 0)
}

export function getRowsForBarrier(rows: ArticleRow[], barrierTag: string): ArticleRow[] {
  return rows.filter((row) => row.barrierTags.includes(barrierTag))
}

export function getRowsForSetting(rows: ArticleRow[], settingTag: string): ArticleRow[] {
  return rows.filter((row) => row.settingTags.includes(settingTag))
}

export function getRowsForOpportunityTag(rows: ArticleRow[], opportunityTag: string): ArticleRow[] {
  return rows.filter((row) => row.eurOpportunityTags.includes(opportunityTag))
}

export function getTagFrequency(rows: ArticleRow[], getter: (row: ArticleRow) => string[]): FrequencyItem[] {
  return listFrequency(rows, getter)
}

export function getWeightedTagFrequency(
  rows: ArticleRow[],
  getter: (row: ArticleRow) => string[],
  weight: (row: ArticleRow) => number,
): Array<FrequencyItem & { weightedScore: number }> {
  const weightedMap = new Map<string, { count: number; scoreSum: number }>()

  rows.forEach((row) => {
    const tags = getter(row)
    const rowWeight = weight(row)
    tags.forEach((tag) => {
      const current = weightedMap.get(tag) ?? { count: 0, scoreSum: 0 }
      weightedMap.set(tag, { count: current.count + 1, scoreSum: current.scoreSum + rowWeight })
    })
  })

  return Array.from(weightedMap.entries())
    .map(([key, value]) => ({
      key,
      count: value.count,
      percentage: rows.length > 0 ? (value.count / rows.length) * 100 : 0,
      weightedScore: value.count > 0 ? value.scoreSum / value.count : 0,
    }))
    .sort((a, b) => b.weightedScore - a.weightedScore || b.count - a.count)
}

export function getTopEvidenceRows(rows: ArticleRow[], mode: EvidenceSortMode, scoreKey?: string, limit = 12): ArticleRow[] {
  const sorted = [...rows].sort((a, b) => {
    if (mode === "gap") {
      const gapPriorityRank = (value: string) => {
        const key = value.toLowerCase()
        if (key === "critical") return 4
        if (key === "high") return 3
        if (key === "medium") return 2
        if (key === "low") return 1
        return 0
      }
      return (
        gapPriorityRank(b.gapPriority) - gapPriorityRank(a.gapPriority) ||
        safeNumber(b.gapUsefulnessScore) - safeNumber(a.gapUsefulnessScore) ||
        safeNumber(b.confidenceScore) - safeNumber(a.confidenceScore)
      )
    }

    const topicOrPillarA = scoreKey ? safeNumber(a.pillarScores[scoreKey] ?? a.topicScores[scoreKey]) : 0
    const topicOrPillarB = scoreKey ? safeNumber(b.pillarScores[scoreKey] ?? b.topicScores[scoreKey]) : 0

    return (
      topicOrPillarB - topicOrPillarA ||
      safeNumber(b.messageUsefulnessScore) - safeNumber(a.messageUsefulnessScore) ||
      safeNumber(b.confidenceScore) - safeNumber(a.confidenceScore)
    )
  })

  return sorted.slice(0, limit)
}

export function getTopGapRows(rows: ArticleRow[], limit = 12): ArticleRow[] {
  return getTopEvidenceRows(rows, "gap", undefined, limit)
}

function topTextItems(rows: ArticleRow[], getter: (row: ArticleRow) => string[], limit = 20): FrequencyItem[] {
  return toFrequency(rows.flatMap(getter), rows.length).slice(0, limit)
}

export function getTopStats(rows: ArticleRow[], limit = 20): FrequencyItem[] {
  return topTextItems(rows, (row) => row.keyStatistics, limit)
}

export function getTopQuotes(rows: ArticleRow[], limit = 20): FrequencyItem[] {
  return topTextItems(rows, (row) => row.keyQuotes, limit)
}

export function getTopExtracts(
  rows: ArticleRow[],
  evidenceByRowId: Record<string, EvidenceExtract[]>,
  options: { gapOnly?: boolean; limit?: number } = {},
): Array<{ row: ArticleRow; extract: EvidenceExtract }> {
  const { gapOnly = false, limit = 20 } = options
  const matches: Array<{ row: ArticleRow; extract: EvidenceExtract }> = []

  rows.forEach((row) => {
    const extracts = evidenceByRowId[row.rowId] ?? []
    extracts.forEach((extract) => {
      if (gapOnly && !extract.isGapExtract) return
      if (!gapOnly && extract.isGapExtract) return
      matches.push({ row, extract })
    })
  })

  return matches
    .sort((a, b) => (a.extract.extractRank ?? Number.MAX_SAFE_INTEGER) - (b.extract.extractRank ?? Number.MAX_SAFE_INTEGER))
    .slice(0, limit)
}

export function classifySupportLevel(row: ArticleRow): SupportLevelClass {
  const support = row.eurSupportLevel.toLowerCase()
  if (support.includes("direct")) return "direct_barrier_match"
  if (support.includes("context")) return "contextual_support"
  if (support.includes("weak")) return "weak_connection"

  if ((row.eurRelevanceScore ?? 0) >= SCORE_THRESHOLDS.highEurRelevance && row.barrierTags.length > 0) {
    return "direct_barrier_match"
  }
  if ((row.eurRelevanceScore ?? 0) >= 40) return "contextual_support"
  if ((row.eurRelevanceScore ?? 0) > 0) return "weak_connection"
  return "none"
}

export function getSupportLevelDistribution(rows: ArticleRow[]): FrequencyItem[] {
  return toFrequency(rows.map((row) => classifySupportLevel(row)), rows.length)
}

export function getPopulationDirectnessDistribution(rows: ArticleRow[]): FrequencyItem[] {
  return valueFrequency(rows, (row) => row.populationDirectness)
}

export function getGeographyDirectnessDistribution(rows: ArticleRow[]): FrequencyItem[] {
  return valueFrequency(rows, (row) => row.geographyDirectness)
}

export function getCooccurrenceMatrix(
  rows: ArticleRow[],
  xGetter: (row: ArticleRow) => string[],
  yGetter: (row: ArticleRow) => string[],
): Array<{ x: string; y: string; count: number }> {
  const pairs = new Map<string, number>()
  rows.forEach((row) => {
    const xValues = xGetter(row)
    const yValues = yGetter(row)
    xValues.forEach((x) => {
      yValues.forEach((y) => {
        const key = `${x}::${y}`
        pairs.set(key, (pairs.get(key) ?? 0) + 1)
      })
    })
  })

  return Array.from(pairs.entries())
    .map(([key, count]) => {
      const [x, y] = key.split("::")
      return { x, y, count }
    })
    .sort((a, b) => b.count - a.count)
}

export function getOpenQuestionsSummary(rows: ArticleRow[]) {
  return {
    kolQuestions: toFrequency(rows.map((row) => row.kolQuestion).filter(Boolean), rows.length),
    followupQuestions: toFrequency(rows.map((row) => row.followupResearchQuestion).filter(Boolean), rows.length),
    missingStats: toFrequency(rows.map((row) => row.missingStatWishWeHad).filter(Boolean), rows.length),
  }
}

export function getCautionsSummary(rows: ArticleRow[]) {
  return {
    cautions: toFrequency(rows.flatMap((row) => row.eurMessageCautions), rows.length),
    medLegal: toFrequency(rows.flatMap((row) => row.medLegalReviewFlags), rows.length),
    lowDirectnessRows: rows.filter(
      (row) =>
        row.populationDirectness.toLowerCase().includes("proxy") ||
        (row.adolescentSpecificityScore ?? 0) < SCORE_THRESHOLDS.adolescentSpecificity,
    ).length,
  }
}

export function getFamilyRows(
  rows: ArticleRow[],
  familyKey: string,
  familyType: "barrier" | "setting" | "opportunity",
): ArticleRow[] {
  const familySource =
    familyType === "barrier"
      ? BARRIER_FAMILIES
      : familyType === "setting"
        ? SETTING_FAMILIES
        : OPPORTUNITY_FAMILIES

  const family = familySource.find((entry) => entry.key === familyKey)
  if (!family) return []

  if (familyType === "barrier") return rows.filter((row) => row.barrierTags.some((tag) => family.tags.includes(tag)))
  if (familyType === "setting") return rows.filter((row) => row.settingTags.some((tag) => family.tags.includes(tag)))
  return rows.filter((row) => row.eurOpportunityTags.some((tag) => family.tags.includes(tag)))
}

export function getEvidenceVsAssumptionProfile(rows: ArticleRow[]) {
  const directAdolescent = rows.filter((row) => row.populationDirectness.toLowerCase().includes("adolescent direct")).length
  const proxy = rows.filter((row) => row.populationDirectness.toLowerCase().includes("proxy")).length
  const guidanceContext = rows.filter((row) => /guideline|regulator|quality/.test(row.sourceType.toLowerCase())).length
  const gapHeavy = rows.filter((row) => (row.gapUsefulnessScore ?? 0) > (row.messageUsefulnessScore ?? 0)).length
  return { directAdolescent, proxy, guidanceContext, gapHeavy }
}

