import { parseBool, parseRepeated } from "@/lib/alunbrig/themeFilters"

export type AudienceKey = "HCP" | "Patient" | "Caregiver" | "Payer" | "Other" | "All"

export type AudienceFlag = "efficacy" | "safety" | "neurotox" | "qol" | "caregiver" | "cns" | "uk_access"

export type AudienceGlobalFilters = {
  startDate: string
  endDate: string
  includeLowRelevance: boolean
  ukNation: string[]
  evidenceType: string[]
  sequencingOnly: boolean
  flags: AudienceFlag[]
  searchText: string
}

export function parseAudience(v: string | null): AudienceKey {
  if (v === "HCP" || v === "Patient" || v === "Caregiver" || v === "Payer" || v === "Other" || v === "All") return v
  return "All"
}

export function audienceFlagsToParams(flags: string[]) {
  const set = new Set(flags)
  return {
    flagEfficacy: set.has("efficacy"),
    flagSafety: set.has("safety"),
    flagNeurotox: set.has("neurotox"),
    flagQol: set.has("qol"),
    flagCaregiver: set.has("caregiver"),
    flagCns: set.has("cns"),
    flagUkAccess: set.has("uk_access"),
  }
}

export function getAudienceGlobalFilters(searchParams: URLSearchParams): AudienceGlobalFilters {
  const startDate = (searchParams.get("startDate") || "").trim()
  const endDate = (searchParams.get("endDate") || "").trim()
  return {
    startDate,
    endDate,
    includeLowRelevance: parseBool(searchParams.get("includeLowRelevance")),
    ukNation: parseRepeated(searchParams, "ukNation"),
    evidenceType: parseRepeated(searchParams, "evidenceType"),
    sequencingOnly: parseBool(searchParams.get("sequencingOnly")),
    flags: parseRepeated(searchParams, "flags") as AudienceFlag[],
    searchText: (searchParams.get("searchText") || "").trim(),
  }
}
