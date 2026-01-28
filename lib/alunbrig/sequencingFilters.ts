import { parseBool, parseRepeated } from "@/lib/alunbrig/themeFilters"

export type SequencingGranularity = "week" | "month"

export type SequencingFilters = {
  startDate: string
  endDate: string
  includeLowRelevance: boolean
  stakeholder: string[]
  sentimentLabel: string[]
  ukNation: string[]
  evidenceType: string[]
  biomarker: string[]
  cnsContext: string[]
  searchText: string

  sequencingOnly: boolean
  ukAccessOnly: boolean
  pfsOnly: boolean
}

export function getSequencingFilters(searchParams: URLSearchParams): SequencingFilters {
  const startDate = (searchParams.get("startDate") || "").trim()
  const endDate = (searchParams.get("endDate") || "").trim()

  // Support both `stakeholder[]` (spec) and the older `stakeholderPrimary[]` naming.
  const stakeholder = [...parseRepeated(searchParams, "stakeholder"), ...parseRepeated(searchParams, "stakeholderPrimary")]

  return {
    startDate,
    endDate,
    includeLowRelevance: parseBool(searchParams.get("includeLowRelevance")),
    stakeholder: Array.from(new Set(stakeholder)),
    sentimentLabel: parseRepeated(searchParams, "sentimentLabel"),
    ukNation: parseRepeated(searchParams, "ukNation"),
    evidenceType: parseRepeated(searchParams, "evidenceType"),
    biomarker: parseRepeated(searchParams, "biomarker"),
    cnsContext: parseRepeated(searchParams, "cnsContext"),
    searchText: (searchParams.get("searchText") || "").trim(),

    sequencingOnly: parseBool(searchParams.get("sequencingOnly")),
    ukAccessOnly: parseBool(searchParams.get("ukAccessOnly")),
    pfsOnly: parseBool(searchParams.get("pfsOnly")),
  }
}

export function parseGranularity(v: string | null): SequencingGranularity {
  return v === "month" ? "month" : "week"
}
