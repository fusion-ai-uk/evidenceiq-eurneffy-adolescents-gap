import { parseBool, parseRepeated } from "@/lib/alunbrig/themeFilters"

export type CompetitorGranularity = "week" | "month"

export type CompetitorFlag =
  | "efficacy"
  | "safety"
  | "neurotox"
  | "qol"
  | "caregiver"
  | "cns"
  | "uk_access"

export type CompetitorLensFilters = {
  startDate: string
  endDate: string
  includeLowRelevance: boolean
  stakeholder: string[]
  sentimentLabel: string[]
  ukNation: string[]
  sequencingOnly: boolean
  flags: CompetitorFlag[]
  evidenceType: string[]
  searchText: string
  targetBrand: string
}

export function getCompetitorLensFilters(searchParams: URLSearchParams): CompetitorLensFilters {
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
    sequencingOnly: parseBool(searchParams.get("sequencingOnly")),
    flags: parseRepeated(searchParams, "flags") as CompetitorFlag[],
    evidenceType: parseRepeated(searchParams, "evidenceType"),
    searchText: (searchParams.get("searchText") || "").trim(),
    targetBrand: (searchParams.get("targetBrand") || "Alunbrig").trim() || "Alunbrig",
  }
}
