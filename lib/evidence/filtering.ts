import { FILTER_DEFAULTS, SCORE_THRESHOLDS } from "@/lib/evidence/constants"
import type { ArticleRow, EvidenceExtract } from "@/lib/evidence/types"

export type RowScope = "included" | "excluded" | "all"
export type ReadinessScope = "ready_only" | "partial_only" | "all"

export interface EvidenceFilters {
  rowScope: RowScope
  readiness: ReadinessScope
  geographyFocus: string[]
  populationDirectness: string[]
  usefulnessLabels: string[]
  gapPriorities: string[]
  sourceTypes: string[]
  articleKinds: string[]
  audiencePrimary: string[]
  bestUse: string[]
  barrierTags: string[]
  settingTags: string[]
  dosingTags: string[]
  recognitionTags: string[]
  equityTags: string[]
  dataGapTags: string[]
  eurOpportunityTags: string[]
  search: string
}

export const DEFAULT_FILTERS: EvidenceFilters = {
  rowScope: FILTER_DEFAULTS.rowScope,
  readiness: FILTER_DEFAULTS.readiness,
  geographyFocus: [],
  populationDirectness: [],
  usefulnessLabels: [],
  gapPriorities: [],
  sourceTypes: [],
  articleKinds: [],
  audiencePrimary: [],
  bestUse: [],
  barrierTags: [],
  settingTags: [],
  dosingTags: [],
  recognitionTags: [],
  equityTags: [],
  dataGapTags: [],
  eurOpportunityTags: [],
  search: FILTER_DEFAULTS.search,
}

const MULTI_KEYS: Array<keyof EvidenceFilters> = [
  "geographyFocus",
  "populationDirectness",
  "usefulnessLabels",
  "gapPriorities",
  "sourceTypes",
  "articleKinds",
  "audiencePrimary",
  "bestUse",
  "barrierTags",
  "settingTags",
  "dosingTags",
  "recognitionTags",
  "equityTags",
  "dataGapTags",
  "eurOpportunityTags",
]

function includesAny(active: string[], candidate: string[]): boolean {
  if (active.length === 0) return true
  if (candidate.length === 0) return false
  const set = new Set(candidate.map((entry) => entry.toLowerCase()))
  return active.some((entry) => set.has(entry.toLowerCase()))
}

function includesValue(active: string[], candidate: string): boolean {
  if (active.length === 0) return true
  return active.some((entry) => entry.toLowerCase() === candidate.toLowerCase())
}

function matchesGeographyFocus(row: ArticleRow, selected: string[]): boolean {
  if (selected.length === 0) return true

  return selected.some((option) => {
    if (option === "uk_direct") return (row.ukRelevanceScore ?? 0) >= SCORE_THRESHOLDS.ukDirect
    if (option === "europe_relevant") return (row.europeRelevanceScore ?? 0) >= 50
    if (option === "non_uk_proxy") return row.geographyPrimary && !/uk/i.test(row.geographyPrimary)
    return false
  })
}

function matchesSearch(row: ArticleRow, extracts: EvidenceExtract[], search: string): boolean {
  const term = search.trim().toLowerCase()
  if (!term) return true

  const rowTexts = [
    row.title,
    row.oneLineTakeaway,
    row.evidenceSummary,
    row.gapSummary,
    row.kolQuestion,
    row.followupResearchQuestion,
    row.missingStatWishWeHad,
    ...row.keyStatistics,
    ...row.keyQuotes,
  ]

  const extractTexts = extracts.map((entry) => entry.extractText)
  return [...rowTexts, ...extractTexts].some((value) => value.toLowerCase().includes(term))
}

export function applyFilters(
  rows: ArticleRow[],
  evidenceByRowId: Record<string, EvidenceExtract[]>,
  filters: EvidenceFilters,
): ArticleRow[] {
  return rows.filter((row) => {
    if (filters.rowScope === "included" && !row.keep) return false
    if (filters.rowScope === "excluded" && row.keep) return false

    if (filters.readiness === "ready_only" && !row.analysisReady) return false
    if (filters.readiness === "partial_only" && row.analysisReady) return false

    if (!matchesGeographyFocus(row, filters.geographyFocus)) return false
    if (!includesValue(filters.populationDirectness, row.populationDirectness)) return false
    if (!includesValue(filters.usefulnessLabels, row.usefulnessLabel)) return false
    if (!includesValue(filters.gapPriorities, row.gapPriority)) return false
    if (!includesValue(filters.sourceTypes, row.sourceType)) return false
    if (!includesValue(filters.articleKinds, row.articleKind)) return false
    if (!includesValue(filters.audiencePrimary, row.audiencePrimary)) return false
    if (!includesValue(filters.bestUse, row.bestUse)) return false

    if (!includesAny(filters.barrierTags, row.barrierTags)) return false
    if (!includesAny(filters.settingTags, row.settingTags)) return false
    if (!includesAny(filters.dosingTags, row.dosingTransitionTags)) return false
    if (!includesAny(filters.recognitionTags, row.recognitionResponseTags)) return false
    if (!includesAny(filters.equityTags, row.equityAccessTags)) return false
    if (!includesAny(filters.dataGapTags, row.dataGapTags)) return false
    if (!includesAny(filters.eurOpportunityTags, row.eurOpportunityTags)) return false

    if (!matchesSearch(row, evidenceByRowId[row.rowId] ?? [], filters.search)) return false
    return true
  })
}

export function parseFiltersFromSearchParams(params: URLSearchParams): EvidenceFilters {
  const parsed: EvidenceFilters = { ...DEFAULT_FILTERS }

  const rowScope = params.get("rowScope")
  if (rowScope === "included" || rowScope === "excluded" || rowScope === "all") {
    parsed.rowScope = rowScope
  }

  const readiness = params.get("readiness")
  if (readiness === "ready_only" || readiness === "partial_only" || readiness === "all") {
    parsed.readiness = readiness
  }

  MULTI_KEYS.forEach((key) => {
    const value = params.get(key)
    if (!value) return
    parsed[key] = value.split(",").map((entry) => entry.trim()).filter(Boolean)
  })

  parsed.search = params.get("search") ?? ""
  return parsed
}

export function filtersToSearchParams(filters: EvidenceFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.rowScope !== DEFAULT_FILTERS.rowScope) params.set("rowScope", filters.rowScope)
  if (filters.readiness !== DEFAULT_FILTERS.readiness) params.set("readiness", filters.readiness)
  if (filters.search.trim()) params.set("search", filters.search.trim())

  MULTI_KEYS.forEach((key) => {
    const values = filters[key]
    if (values.length > 0) params.set(key, values.join(","))
  })

  return params
}

