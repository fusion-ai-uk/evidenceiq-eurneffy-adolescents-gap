import { parseBool, parseRepeated } from "@/lib/alunbrig/themeFilters"

export type ExecutiveViewMode = "weekly" | "full"

export type ExecutiveFilters = {
  startDate: string
  endDate: string
  includeLowRelevance: boolean

  // Global filters (subset)
  stakeholder: string[]
  evidenceType: string[]
  sentimentLabel: string[]
  searchText: string
  cardBucket: string[]

  // Exec toggles
  ukOnly: boolean
  sequencingOnly: boolean

  // Exec view controls
  week: string
  view: ExecutiveViewMode
  includeAudienceSplit: boolean
  maxCardsPerSection: number
}

export function parseViewMode(v: string | null): ExecutiveViewMode {
  return v === "full" ? "full" : "weekly"
}

export function parseIntClamped(v: string | null, fallback: number, min: number, max: number) {
  const n = Number(v)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, Math.floor(n)))
}

export function getExecutiveFilters(searchParams: URLSearchParams): ExecutiveFilters {
  const startDate = (searchParams.get("startDate") || "").trim()
  const endDate = (searchParams.get("endDate") || "").trim()

  return {
    startDate,
    endDate,
    includeLowRelevance: parseBool(searchParams.get("includeLowRelevance")),

    // Support both `stakeholder[]` (spec) and older `stakeholderPrimary[]` naming.
    stakeholder: Array.from(
      new Set([...parseRepeated(searchParams, "stakeholder"), ...parseRepeated(searchParams, "stakeholderPrimary")]),
    ),
    evidenceType: parseRepeated(searchParams, "evidenceType"),
    sentimentLabel: parseRepeated(searchParams, "sentimentLabel"),
    searchText: (searchParams.get("searchText") || "").trim(),
    cardBucket: [...parseRepeated(searchParams, "cardBucket"), ...parseRepeated(searchParams, "cardBucket[]")],

    ukOnly: parseBool(searchParams.get("ukOnly")),
    sequencingOnly: parseBool(searchParams.get("sequencingOnly")),

    week: (searchParams.get("week") || "").trim(),
    view: parseViewMode(searchParams.get("view")),
    includeAudienceSplit: searchParams.get("includeAudienceSplit") === null ? true : parseBool(searchParams.get("includeAudienceSplit")),
    maxCardsPerSection: parseIntClamped(searchParams.get("maxCardsPerSection"), 6, 2, 12),
  }
}
