import { SCORE_THRESHOLDS } from "@/lib/evidence/constants"
import type { ArticleRow, FrequencyItem, NamedScoreMap, OverviewMetrics } from "@/lib/evidence/types"

function average(values: Array<number | null | undefined>): number {
  const cleaned = values.filter((value): value is number => Number.isFinite(value ?? NaN))
  if (cleaned.length === 0) return 0
  return cleaned.reduce((sum, value) => sum + value, 0) / cleaned.length
}

export function toFrequency(items: string[], totalRows: number): FrequencyItem[] {
  const counts = items.reduce<Map<string, number>>((acc, item) => {
    const key = item.trim()
    if (!key) return acc
    acc.set(key, (acc.get(key) ?? 0) + 1)
    return acc
  }, new Map())

  return Array.from(counts.entries())
    .map(([key, count]) => ({
      key,
      count,
      percentage: totalRows > 0 ? (count / totalRows) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
}

export function valueFrequency(rows: ArticleRow[], getter: (row: ArticleRow) => string): FrequencyItem[] {
  return toFrequency(rows.map(getter).filter(Boolean), rows.length)
}

export function listFrequency(rows: ArticleRow[], getter: (row: ArticleRow) => string[]): FrequencyItem[] {
  const flattened = rows.flatMap((row) => getter(row))
  return toFrequency(flattened, rows.length)
}

export function scoreAverages(rows: ArticleRow[], mapGetter: (row: ArticleRow) => NamedScoreMap): Record<string, number> {
  const keys = new Set<string>()
  rows.forEach((row) => {
    Object.keys(mapGetter(row)).forEach((key) => keys.add(key))
  })

  return Array.from(keys).reduce<Record<string, number>>((acc, key) => {
    acc[key] = average(rows.map((row) => mapGetter(row)[key]))
    return acc
  }, {})
}

export function getOverviewMetrics(rows: ArticleRow[]): OverviewMetrics {
  return {
    totalRows: rows.length,
    includedRows: rows.filter((row) => row.keep).length,
    excludedRows: rows.filter((row) => !row.keep).length,
    analysisReadyRows: rows.filter((row) => row.analysisReady).length,
    highUsefulnessRows: rows.filter((row) => (row.usefulnessScore ?? 0) >= SCORE_THRESHOLDS.highUsefulness).length,
    highGapUsefulnessRows: rows.filter((row) => (row.gapUsefulnessScore ?? 0) >= SCORE_THRESHOLDS.highGapUsefulness).length,
    highEurRows: rows.filter((row) => (row.eurRelevanceScore ?? 0) >= SCORE_THRESHOLDS.highEurRelevance).length,
    adolescentSpecificRows: rows.filter(
      (row) => (row.adolescentSpecificityScore ?? 0) >= SCORE_THRESHOLDS.adolescentSpecificity,
    ).length,
    ukDirectRows: rows.filter((row) => (row.ukRelevanceScore ?? 0) >= SCORE_THRESHOLDS.ukDirect).length,
    needsKolInputRows: rows.filter(
      (row) => row.kolQuestion || row.dataGapTags.some((entry) => entry.toLowerCase().includes("kol")),
    ).length,
    rowsWithUsableStats: rows.filter((row) => row.hasUsableStat || (row.statCount ?? 0) > 0).length,
    rowsWithMedLegalFlags: rows.filter((row) => row.medLegalReviewFlags.length > 0).length,
  }
}

export function getBriefFitSnapshot(rows: ArticleRow[]) {
  return {
    usefulness: average(rows.map((row) => row.usefulnessScore)),
    messageUsefulness: average(rows.map((row) => row.messageUsefulnessScore)),
    gapUsefulness: average(rows.map((row) => row.gapUsefulnessScore)),
    adolescentSpecificity: average(rows.map((row) => row.adolescentSpecificityScore)),
    ukRelevance: average(rows.map((row) => row.ukRelevanceScore)),
    eurRelevance: average(rows.map((row) => row.eurRelevanceScore)),
    confidence: average(rows.map((row) => row.confidenceScore)),
  }
}

export function getGapSignalSummary(rows: ArticleRow[]) {
  return {
    topGapTags: listFrequency(rows, (row) => row.dataGapTags),
    gapKind: valueFrequency(rows, (row) => row.gapKindPrimary),
    gapPriority: valueFrequency(rows, (row) => row.gapPriority),
    noAdolescentBreakout: rows.filter((row) => row.reportsNoAdolescentBreakout).length,
    noUkBreakout: rows.filter((row) => row.reportsNoUkBreakout).length,
    noRealWorldErrorData: rows.filter((row) => row.reportsNoRealWorldErrorData).length,
    noSettingSpecificData: rows.filter((row) => row.reportsNoSettingSpecificData).length,
    noEquitySubgroupData: rows.filter((row) => row.reportsNoEquitySubgroupData).length,
  }
}

