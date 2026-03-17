export const SCORE_THRESHOLDS = {
  highUsefulness: 70,
  highGapUsefulness: 70,
  highEurRelevance: 60,
  adolescentSpecificity: 60,
  ukDirect: 70,
} as const

export const FILTER_DEFAULTS = {
  rowScope: "included",
  readiness: "ready_only",
  search: "",
} as const

export const FILTER_OPTIONS = {
  rowScope: [
    { value: "included", label: "Included only" },
    { value: "excluded", label: "Excluded only" },
    { value: "all", label: "All rows" },
  ],
  readiness: [
    { value: "ready_only", label: "Analysis ready only" },
    { value: "partial_only", label: "Partial / not ready only" },
    { value: "all", label: "All rows" },
  ],
  geographyFocus: [
    { value: "uk_direct", label: "UK direct" },
    { value: "europe_relevant", label: "Europe relevant" },
    { value: "non_uk_proxy", label: "Non-UK proxy" },
  ],
  populationDirectness: [
    { value: "adolescent direct", label: "Adolescent direct" },
    { value: "adolescent included", label: "Adolescent included" },
    { value: "paediatric proxy", label: "Paediatric proxy" },
    { value: "all-age proxy", label: "All-age proxy" },
  ],
} as const

export const TAXONOMY_FIELDS = {
  barrierTags: "brief_barrier_tags",
  settingTags: "brief_setting_tags",
  dosingTags: "brief_dosing_transition_tags",
  recognitionTags: "brief_recognition_response_tags",
  equityTags: "brief_equity_access_tags",
  gapTags: "brief_data_gap_tags",
  eurOpportunityTags: "eur_eurneffy_opportunity_tags",
} as const

