export type RawCsvRow = Record<string, string>

export type NumericMaybe = number | null

export type NamedScoreMap = Record<string, NumericMaybe>

export type FrequencyItem = {
  key: string
  count: number
  percentage: number
}

export interface EvidenceExtract {
  rowId: string
  inputRowIndex: number | null
  sourceUrl: string
  extractRank: number | null
  extractText: string
  isGapExtract: boolean
  usefulnessScore: NumericMaybe
  gapUsefulnessScore: NumericMaybe
  messageUsefulnessScore: NumericMaybe
}

export interface ArticleRow {
  rowId: string
  groupId: string
  inputRowIndex: number | null
  sourceUrl: string
  canonicalUrl: string
  sourceFile: string
  processingStatus: string
  analysisReady: boolean
  analysisReadyReason: string
  keep: boolean
  filterOut: boolean
  filterReason: string
  title: string
  oneLineTakeaway: string
  evidenceSummary: string
  fitWhyItMatters: string
  fitWhatItIsNot: string
  articleKind: string
  sourceType: string
  evidenceType: string
  studyDesign: string
  evidenceStrength: string
  evidenceStrengthReason: string
  publicationYear: string
  sampleSize: string
  ageFocus: string
  ageSecondary: string[]
  adolescentSpecificityScore: NumericMaybe
  populationDirectness: string
  geographyPrimary: string
  geographyTags: string[]
  ukRelevanceScore: NumericMaybe
  europeRelevanceScore: NumericMaybe
  geographyDirectness: string
  audiencePrimary: string
  audienceSecondary: string[]
  barrierTags: string[]
  behaviouralDriverTags: string[]
  settingTags: string[]
  dosingTransitionTags: string[]
  recognitionResponseTags: string[]
  equityAccessTags: string[]
  socialPsychologyTags: string[]
  trainingErrorTags: string[]
  dataGapTags: string[]
  gapKindPrimary: string
  gapReasonStructured: string[]
  gapPriority: string
  gapSummary: string
  reportsNoAdolescentBreakout: boolean
  reportsNoUkBreakout: boolean
  reportsNoRealWorldErrorData: boolean
  reportsNoSettingSpecificData: boolean
  reportsNoEquitySubgroupData: boolean
  kolQuestion: string
  followupResearchQuestion: string
  missingStatWishWeHad: string
  eurRelevanceScore: NumericMaybe
  eurOpportunityTags: string[]
  eurSupportLevel: string
  eurMessageRoutes: string[]
  eurMessageCautions: string[]
  actionabilityForMessaging: string
  actionabilityReason: string
  bestUse: string
  recommendedUseCases: string[]
  medLegalReviewFlags: string[]
  keyStatistics: string[]
  hasUsableStat: boolean
  statCount: NumericMaybe
  bestStatForSlide: string
  keyQuotes: string[]
  bestGapQuote: string
  evidenceExtracts: string[]
  gapExtracts: string[]
  citedBodiesOrSources: string[]
  noveltyVsMedicalWriter: string
  incrementalValueScore: NumericMaybe
  downstreamAggregationKeys: string[]
  confidenceScore: NumericMaybe
  usefulnessScore: NumericMaybe
  messageUsefulnessScore: NumericMaybe
  gapUsefulnessScore: NumericMaybe
  usefulnessLabel: string
  textQualityLabel: string
  textQualityScore: NumericMaybe
  textProbablyPartial: boolean
  textNeedsRecrawl: boolean
  inputTextChars: NumericMaybe
  pillarScores: NamedScoreMap
  topicScores: NamedScoreMap
  fitAssessment: NamedScoreMap
  flags: Record<string, boolean>
  raw: RawCsvRow
}

export interface EvidenceDataset {
  allRows: ArticleRow[]
  includedRows: ArticleRow[]
  excludedRows: ArticleRow[]
  evidenceExtracts: EvidenceExtract[]
  evidenceByRowId: Record<string, EvidenceExtract[]>
  orphanExtracts: EvidenceExtract[]
  rowsWithoutExtracts: string[]
}

export interface OverviewMetrics {
  totalRows: number
  includedRows: number
  excludedRows: number
  analysisReadyRows: number
  highUsefulnessRows: number
  highGapUsefulnessRows: number
  highEurRows: number
  adolescentSpecificRows: number
  ukDirectRows: number
  needsKolInputRows: number
  rowsWithUsableStats: number
  rowsWithMedLegalFlags: number
}

