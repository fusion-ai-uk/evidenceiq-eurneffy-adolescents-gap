export type AlunbrigThemeGroupBy =
  | "card_bucket"
  | "topics_top_topics"
  | "clinical_context_biomarker"
  | "competitive_context"

export type AlunbrigThemeMetric = "volume" | "engagement" | "views"

export type AlunbrigThemeFlag =
  | "efficacy"
  | "safety"
  | "neurotox"
  | "qol"
  | "caregiver"
  | "cns"
  | "uk_access"

export type AlunbrigThemeFilters = {
  startDate: string
  endDate: string
  includeLowRelevance: boolean
  stakeholderPrimary: string[]
  sentimentLabel: string[]
  ukNation: string[]
  sequencingOnly: boolean
  flags: AlunbrigThemeFlag[]
  evidenceType: string[]
  searchText: string
}

export function parseBool(v: string | null): boolean {
  if (!v) return false
  return v === "1" || v.toLowerCase() === "true" || v.toLowerCase() === "yes"
}

export function parseRepeated(searchParams: URLSearchParams, key: string): string[] {
  const values = searchParams
    .getAll(key)
    .map((s) => s.trim())
    .filter(Boolean)
  // Canonicalize ordering for stable caching/query keys. Order is not meaningful for our filters.
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
}

export function getAlunbrigThemeFilters(searchParams: URLSearchParams): AlunbrigThemeFilters {
  const startDate = searchParams.get("startDate") || ""
  const endDate = searchParams.get("endDate") || ""

  return {
    startDate,
    endDate,
    includeLowRelevance: parseBool(searchParams.get("includeLowRelevance")),
    stakeholderPrimary: parseRepeated(searchParams, "stakeholderPrimary"),
    sentimentLabel: parseRepeated(searchParams, "sentimentLabel"),
    ukNation: parseRepeated(searchParams, "ukNation"),
    sequencingOnly: parseBool(searchParams.get("sequencingOnly")),
    flags: parseRepeated(searchParams, "flags") as AlunbrigThemeFlag[],
    evidenceType: parseRepeated(searchParams, "evidenceType"),
    searchText: (searchParams.get("searchText") || "").trim(),
  }
}

export function flagsToParams(flags: string[]) {
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
