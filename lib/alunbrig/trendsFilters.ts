import { parseBool, parseRepeated } from "@/lib/alunbrig/themeFilters"

export type TrendsGranularity = "day" | "week" | "month"

export type TrendsFlag = "efficacy" | "safety" | "neurotox" | "qol" | "caregiver" | "cns" | "uk_access"

export type TrendsFilters = {
  startDate: string
  endDate: string
  granularity: TrendsGranularity
  includeLowRelevance: boolean
  cardBucket: string[] // card_bucket values
  stakeholder: string[] // UI group values: HCP, Patient, Caregiver, Payer, Other
  sentimentLabel: string[] // raw sentiment_label values
  sequencingOnly: boolean
  ukOnly: boolean
  flags: TrendsFlag[]
  evidenceType: string[]
  searchText: string
}

export function parseGranularity(v: string | null): TrendsGranularity {
  if (v === "day" || v === "week" || v === "month") return v
  return "week"
}

export function stakeholderUiToPrimary(values: string[]): string[] {
  const set = new Set(values.map((s) => s.trim()).filter(Boolean))
  // "All" means no stakeholder filter.
  if (set.size === 0 || set.has("All")) return []

  const out = new Set<string>()
  if (set.has("HCP")) out.add("HCP")
  if (set.has("Patient")) out.add("Patient")
  if (set.has("Caregiver")) out.add("Caregiver")
  if (set.has("Payer")) out.add("Payer")
  if (set.has("Other")) {
    ;["Advocacy", "Org/Institution", "Industry/Pharma", "Investor", "Media", "Other", "Unknown"].forEach((v) => out.add(v))
  }
  return Array.from(out)
}

export function trendsFlagsToParams(flags: string[]) {
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

export function getTrendsFilters(searchParams: URLSearchParams): TrendsFilters {
  const startDate = (searchParams.get("startDate") || "").trim()
  const endDate = (searchParams.get("endDate") || "").trim()

  return {
    startDate,
    endDate,
    granularity: parseGranularity(searchParams.get("granularity")),
    includeLowRelevance: parseBool(searchParams.get("includeLowRelevance")),
    cardBucket: parseRepeated(searchParams, "cardBucket"),
    stakeholder: parseRepeated(searchParams, "stakeholder"),
    sentimentLabel: parseRepeated(searchParams, "sentimentLabel"),
    sequencingOnly: parseBool(searchParams.get("sequencingOnly")),
    ukOnly: parseBool(searchParams.get("ukOnly")),
    flags: parseRepeated(searchParams, "flags") as TrendsFlag[],
    evidenceType: parseRepeated(searchParams, "evidenceType"),
    searchText: (searchParams.get("searchText") || "").trim(),
  }
}
