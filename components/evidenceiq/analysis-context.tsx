"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEvidenceDataset } from "@/hooks/use-evidence-dataset"
import { applyFilters, DEFAULT_FILTERS, filtersToSearchParams, parseFiltersFromSearchParams, type EvidenceFilters } from "@/lib/evidence/filtering"
import {
  getBriefFitSnapshot,
  getGapSignalSummary,
  getOverviewMetrics,
  listFrequency,
  scoreAverages,
  valueFrequency,
} from "@/lib/evidence/aggregations"
import type { EvidenceDataset } from "@/lib/evidence/types"

type FilterOptions = {
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
}

type AnalysisContextValue = {
  isLoading: boolean
  error: string | null
  dataset: EvidenceDataset | null
  filters: EvidenceFilters
  setFilters: (next: EvidenceFilters) => void
  resetFilters: () => void
  filteredRows: ReturnType<typeof applyFilters>
  filterOptions: FilterOptions
  summaries: {
    overview: ReturnType<typeof getOverviewMetrics>
    briefFit: ReturnType<typeof getBriefFitSnapshot>
    pillarScores: Record<string, number>
    topicScores: Record<string, number>
    sourceTypeFrequency: ReturnType<typeof valueFrequency>
    evidenceTypeFrequency: ReturnType<typeof valueFrequency>
    bestUseFrequency: ReturnType<typeof valueFrequency>
    noveltyFrequency: ReturnType<typeof valueFrequency>
    gapSignals: ReturnType<typeof getGapSignalSummary>
    barrierFrequency: ReturnType<typeof listFrequency>
    settingFrequency: ReturnType<typeof listFrequency>
    eurOpportunityFrequency: ReturnType<typeof listFrequency>
  }
}

const AnalysisContext = React.createContext<AnalysisContextValue | null>(null)

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b))
}

function buildFilterOptions(rows: EvidenceDataset["allRows"]): FilterOptions {
  return {
    usefulnessLabels: uniqueValues(rows.map((row) => row.usefulnessLabel)),
    gapPriorities: uniqueValues(rows.map((row) => row.gapPriority)),
    sourceTypes: uniqueValues(rows.map((row) => row.sourceType)),
    articleKinds: uniqueValues(rows.map((row) => row.articleKind)),
    audiencePrimary: uniqueValues(rows.map((row) => row.audiencePrimary)),
    bestUse: uniqueValues(rows.map((row) => row.bestUse)),
    barrierTags: uniqueValues(rows.flatMap((row) => row.barrierTags)),
    settingTags: uniqueValues(rows.flatMap((row) => row.settingTags)),
    dosingTags: uniqueValues(rows.flatMap((row) => row.dosingTransitionTags)),
    recognitionTags: uniqueValues(rows.flatMap((row) => row.recognitionResponseTags)),
    equityTags: uniqueValues(rows.flatMap((row) => row.equityAccessTags)),
    dataGapTags: uniqueValues(rows.flatMap((row) => row.dataGapTags)),
    eurOpportunityTags: uniqueValues(rows.flatMap((row) => row.eurOpportunityTags)),
  }
}

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const { dataset, isLoading, error } = useEvidenceDataset()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = React.useState<EvidenceFilters>(DEFAULT_FILTERS)

  React.useEffect(() => {
    const parsed = parseFiltersFromSearchParams(new URLSearchParams(searchParams.toString()))
    setFilters(parsed)
  }, [searchParams])

  const updateFilters = React.useCallback(
    (next: EvidenceFilters) => {
      setFilters(next)
      const params = filtersToSearchParams(next)
      const query = params.toString()
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    },
    [pathname, router],
  )

  const resetFilters = React.useCallback(() => {
    updateFilters({ ...DEFAULT_FILTERS })
  }, [updateFilters])

  const filteredRows = React.useMemo(() => {
    if (!dataset) return []
    return applyFilters(dataset.allRows, dataset.evidenceByRowId, filters)
  }, [dataset, filters])

  const summaries = React.useMemo(() => {
    const rows = filteredRows
    return {
      overview: getOverviewMetrics(rows),
      briefFit: getBriefFitSnapshot(rows),
      pillarScores: scoreAverages(rows, (row) => row.pillarScores),
      topicScores: scoreAverages(rows, (row) => row.topicScores),
      sourceTypeFrequency: valueFrequency(rows, (row) => row.sourceType),
      evidenceTypeFrequency: valueFrequency(rows, (row) => row.evidenceType),
      bestUseFrequency: valueFrequency(rows, (row) => row.bestUse),
      noveltyFrequency: valueFrequency(rows, (row) => row.noveltyVsMedicalWriter),
      gapSignals: getGapSignalSummary(rows),
      barrierFrequency: listFrequency(rows, (row) => row.barrierTags),
      settingFrequency: listFrequency(rows, (row) => row.settingTags),
      eurOpportunityFrequency: listFrequency(rows, (row) => row.eurOpportunityTags),
    }
  }, [filteredRows])

  const value = React.useMemo<AnalysisContextValue>(
    () => ({
      isLoading,
      error,
      dataset,
      filters,
      setFilters: updateFilters,
      resetFilters,
      filteredRows,
      filterOptions: buildFilterOptions(dataset?.allRows ?? []),
      summaries,
    }),
    [isLoading, error, dataset, filters, updateFilters, resetFilters, filteredRows, summaries],
  )

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>
}

export function useAnalysisContext() {
  const context = React.useContext(AnalysisContext)
  if (!context) throw new Error("useAnalysisContext must be used inside AnalysisProvider.")
  return context
}

