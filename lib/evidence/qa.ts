import type { ArticleRow } from "@/lib/evidence/types"
import { classifySupportLevel } from "@/lib/evidence/selectors"

export type QaIssue = {
  key: string
  label: string
  rowIds: string[]
}

export function buildQaIssues(rows: ArticleRow[]): QaIssue[] {
  const byId = new Map<string, number>()
  rows.forEach((row) => byId.set(row.rowId, (byId.get(row.rowId) ?? 0) + 1))

  const checks: Array<{ key: string; label: string; test: (row: ArticleRow) => boolean }> = [
    { key: "missing_row_id", label: "Missing _row_id", test: (row) => !row.rowId },
    { key: "duplicate_row_id", label: "Duplicated _row_id", test: (row) => !!row.rowId && (byId.get(row.rowId) ?? 0) > 1 },
    { key: "missing_source_url", label: "Missing source URL", test: (row) => !row.sourceUrl },
    { key: "missing_title", label: "Missing article title guess", test: (row) => !row.title },
    { key: "not_ready_but_high_usefulness", label: "analysis_ready false but high usefulness", test: (row) => !row.analysisReady && (row.usefulnessScore ?? 0) >= 70 },
    { key: "excluded_but_high_gap", label: "brief_keep false but high gap usefulness", test: (row) => !row.keep && (row.gapUsefulnessScore ?? 0) >= 70 },
    { key: "high_eur_but_no_support", label: "High EURneffy relevance but support level none", test: (row) => (row.eurRelevanceScore ?? 0) >= 60 && classifySupportLevel(row) === "none" },
    { key: "medlegal_without_caution", label: "Med/legal flags but no caution text", test: (row) => row.medLegalReviewFlags.length > 0 && row.eurMessageCautions.length === 0 },
    { key: "high_gap_no_questions", label: "High-priority gap but no KOL/follow-up question", test: (row) => ["high", "critical"].includes(row.gapPriority.toLowerCase()) && !row.kolQuestion && !row.followupResearchQuestion },
    { key: "low_text_rich_output", label: "Very low text length but rich output", test: (row) => (row.inputTextChars ?? 0) < 200 && ((row.keyQuotes.length > 0 || row.keyStatistics.length > 0) && (row.usefulnessScore ?? 0) >= 60) },
  ]

  return checks.map((check) => ({
    key: check.key,
    label: check.label,
    rowIds: rows.filter(check.test).map((row) => row.rowId),
  }))
}

