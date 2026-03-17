"use client"

import * as React from "react"
import { parseCsv } from "@/lib/evidence/csv"
import { normalizeArticleRow, normalizeEvidenceExtract } from "@/lib/evidence/normalize"
import type { ArticleRow, EvidenceDataset, EvidenceExtract } from "@/lib/evidence/types"

const ENRICHED_PATH = "/data/enriched_rows.csv"
const EXTRACTS_PATH = "/data/evidence_extracts.csv"

function sortExtracts(entries: EvidenceExtract[]): EvidenceExtract[] {
  return [...entries].sort((a, b) => (a.extractRank ?? Number.MAX_SAFE_INTEGER) - (b.extractRank ?? Number.MAX_SAFE_INTEGER))
}

export function useEvidenceDataset() {
  const [dataset, setDataset] = React.useState<EvidenceDataset | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    async function load() {
      setIsLoading(true)
      setError(null)

      try {
        const [enrichedResponse, extractsResponse] = await Promise.all([fetch(ENRICHED_PATH), fetch(EXTRACTS_PATH)])
        if (!enrichedResponse.ok || !extractsResponse.ok) {
          throw new Error(
            `Could not load CSV files. Ensure ${ENRICHED_PATH} and ${EXTRACTS_PATH} are available in the app's static /data path.`,
          )
        }

        const [enrichedText, extractsText] = await Promise.all([enrichedResponse.text(), extractsResponse.text()])

        const rawRows = parseCsv(enrichedText)
        const rawExtracts = parseCsv(extractsText)

        const allRows: ArticleRow[] = rawRows.map(normalizeArticleRow)
        const evidenceExtracts: EvidenceExtract[] = rawExtracts.map(normalizeEvidenceExtract)

        const evidenceByRowId = evidenceExtracts.reduce<Record<string, EvidenceExtract[]>>((acc, entry) => {
          if (!entry.rowId) return acc
          if (!acc[entry.rowId]) acc[entry.rowId] = []
          acc[entry.rowId].push(entry)
          return acc
        }, {})

        Object.keys(evidenceByRowId).forEach((key) => {
          evidenceByRowId[key] = sortExtracts(evidenceByRowId[key])
        })

        const includedRows = allRows.filter((row) => row.keep)
        const excludedRows = allRows.filter((row) => !row.keep)
        const rowIdSet = new Set(allRows.map((row) => row.rowId))
        const orphanExtracts = evidenceExtracts.filter((entry) => entry.rowId && !rowIdSet.has(entry.rowId))
        const rowsWithoutExtracts = allRows.filter((row) => (evidenceByRowId[row.rowId] ?? []).length === 0).map((row) => row.rowId)

        if (!active) return
        setDataset({
          allRows,
          includedRows,
          excludedRows,
          evidenceExtracts,
          evidenceByRowId,
          orphanExtracts,
          rowsWithoutExtracts,
        })
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Failed to load evidence data.")
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  return { dataset, isLoading, error }
}

