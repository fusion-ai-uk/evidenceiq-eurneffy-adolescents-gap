"use client"

import * as React from "react"
import { useAnalysisContext } from "@/components/evidenceiq/analysis-context"
import { AnalysisSectionHeader, EvidenceRowList } from "@/components/evidenceiq/analysis-components"
import { CohortBuilder, CohortComparisonSummary, DeltaComparisonList } from "@/components/evidenceiq/workflow-components"
import { buildCohort, cohortPresetToConfig, compareCohorts, type CohortConfig } from "@/lib/evidence/workflow"
import { getTopEvidenceRows, getTopGapRows } from "@/lib/evidence/selectors"
import type { ArticleRow } from "@/lib/evidence/types"
import { ArticleDetailDrawer } from "@/components/evidenceiq/article-detail-drawer"
import { useAnalystWorkspace } from "@/components/evidenceiq/analyst-workspace"
import { formatShare } from "@/lib/evidence/display"

const DEFAULT_A: CohortConfig = {
  name: "Cohort A",
  includeScope: "included",
  analysisReadyOnly: true,
  adolescentDirectOnly: false,
  ukDirectOnly: false,
}

const DEFAULT_B: CohortConfig = {
  name: "Cohort B",
  includeScope: "included",
  analysisReadyOnly: true,
  adolescentDirectOnly: true,
  ukDirectOnly: true,
}

function toNum(value: number) {
  return value.toFixed(1)
}

export default function ComparisonLabPage() {
  const { filteredRows, filterOptions, dataset, isLoading, error } = useAnalysisContext()
  const { saveCohort } = useAnalystWorkspace()
  const [aConfig, setAConfig] = React.useState<CohortConfig>(DEFAULT_A)
  const [bConfig, setBConfig] = React.useState<CohortConfig>(DEFAULT_B)
  const [selectedRow, setSelectedRow] = React.useState<ArticleRow | null>(null)

  const aRows = React.useMemo(() => buildCohort(filteredRows, aConfig), [filteredRows, aConfig])
  const bRows = React.useMemo(() => buildCohort(filteredRows, bConfig), [filteredRows, bConfig])
  const comparison = React.useMemo(() => compareCohorts(aRows, bRows), [aRows, bRows])

  const comparisonSnapshot = React.useMemo(() => {
    const strongestSharedThemes = comparison.barrierDiff.filter((item) => item.a > 0 && item.b > 0).slice(0, 3).map((item) => item.key).join(", ")
    const strongestDifferences = comparison.barrierDiff.slice(0, 3).map((item) => `${item.key} (${item.delta > 0 ? "+" : ""}${item.delta.toFixed(1)}pp)`).join(", ")
    const evidenceQualityDifference = `${(comparison.averages.confidence.a - comparison.averages.confidence.b).toFixed(1)} confidence delta`
    const directnessDifference = `${(comparison.averages.adolescent.a - comparison.averages.adolescent.b).toFixed(1)} adolescent specificity delta`
    const gapPressureDifference = `${(comparison.averages.gap.a - comparison.averages.gap.b).toFixed(1)} gap-signal delta`
    return { strongestSharedThemes, strongestDifferences, evidenceQualityDifference, directnessDifference, gapPressureDifference }
  }, [comparison])
  const totalRows = filteredRows.length

  if (isLoading) return <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Loading comparison lab...</div>
  if (error) return <div className="rounded-lg border border-destructive/40 p-6 text-sm text-destructive">{error}</div>

  return (
    <div className="space-y-4">
      <AnalysisSectionHeader title="Comparison Lab" description="Side-by-side cohort comparison for direct vs contextual evidence and gap pressure." />
      <div id="comparison-builders" className="scroll-mt-24 grid gap-3 xl:grid-cols-2">
        <CohortBuilder title="Cohort A" config={aConfig} filterOptions={filterOptions} onChange={setAConfig} onApplyPreset={(preset) => setAConfig(cohortPresetToConfig(preset as never))} />
        <CohortBuilder title="Cohort B" config={bConfig} filterOptions={filterOptions} onChange={setBConfig} onApplyPreset={(preset) => setBConfig(cohortPresetToConfig(preset as never))} />
      </div>
      {(aRows.length === 0 || bRows.length === 0) ? (
        <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          One or both cohorts are empty under current settings. This may reflect strict filters rather than lack of evidence.
        </div>
      ) : null}
      <div className="flex gap-2">
        <button className="rounded-md border px-3 py-1 text-xs" onClick={() => saveCohort({ id: "cohort-a", name: aConfig.name, config: JSON.stringify(aConfig) })}>Save Cohort A</button>
        <button className="rounded-md border px-3 py-1 text-xs" onClick={() => saveCohort({ id: "cohort-b", name: bConfig.name, config: JSON.stringify(bConfig) })}>Save Cohort B</button>
      </div>

      <section id="comparison-summary" className="scroll-mt-24">
        <CohortComparisonSummary
        title="Cohort comparison summary"
        items={[
          { label: "Cohort share", a: formatShare(comparison.counts.a, totalRows), b: formatShare(comparison.counts.b, totalRows), delta: `${((comparison.counts.a - comparison.counts.b) / Math.max(totalRows, 1) * 100).toFixed(1)} pp` },
          { label: "Avg evidence signal", a: toNum(comparison.averages.message.a), b: toNum(comparison.averages.message.b), delta: toNum(comparison.averages.message.a - comparison.averages.message.b) },
          { label: "Avg gap signal", a: toNum(comparison.averages.gap.a), b: toNum(comparison.averages.gap.b), delta: toNum(comparison.averages.gap.a - comparison.averages.gap.b) },
          { label: "Avg adolescent specificity", a: toNum(comparison.averages.adolescent.a), b: toNum(comparison.averages.adolescent.b), delta: toNum(comparison.averages.adolescent.a - comparison.averages.adolescent.b) },
          { label: "Avg UK relevance", a: toNum(comparison.averages.uk.a), b: toNum(comparison.averages.uk.b), delta: toNum(comparison.averages.uk.a - comparison.averages.uk.b) },
          { label: "Avg EURneffy relevance", a: toNum(comparison.averages.eur.a), b: toNum(comparison.averages.eur.b), delta: toNum(comparison.averages.eur.a - comparison.averages.eur.b) },
          { label: "Avg confidence", a: toNum(comparison.averages.confidence.a), b: toNum(comparison.averages.confidence.b), delta: toNum(comparison.averages.confidence.a - comparison.averages.confidence.b) },
        ]}
        />
      </section>

      <div id="comparison-deltas" className="scroll-mt-24 grid gap-3 xl:grid-cols-2">
        <DeltaComparisonList title="Barrier differences (A vs B)" items={comparison.barrierDiff.slice(0, 10)} />
        <DeltaComparisonList title="Setting differences (A vs B)" items={comparison.settingDiff.slice(0, 10)} />
        <DeltaComparisonList title="Gap differences (A vs B)" items={comparison.gapDiff.slice(0, 10)} />
        <DeltaComparisonList title="EURneffy opportunity differences (A vs B)" items={comparison.eurDiff.slice(0, 10)} />
      </div>

      <div id="comparison-snapshot" className="scroll-mt-24 rounded-md border p-3 text-xs">
        <p><strong>Strongest shared themes:</strong> {comparisonSnapshot.strongestSharedThemes || "n/a"}</p>
        <p><strong>Strongest differences:</strong> {comparisonSnapshot.strongestDifferences || "n/a"}</p>
        <p><strong>Biggest evidence-quality difference:</strong> {comparisonSnapshot.evidenceQualityDifference}</p>
        <p><strong>Biggest directness difference:</strong> {comparisonSnapshot.directnessDifference}</p>
        <p><strong>Biggest gap-pressure difference:</strong> {comparisonSnapshot.gapPressureDifference}</p>
      </div>

      <div id="comparison-evidence" className="scroll-mt-24 grid gap-3 xl:grid-cols-2">
        <EvidenceRowList title="Top evidence rows in Cohort A" rows={getTopEvidenceRows(aRows, "evidence", undefined, 10)} onOpen={setSelectedRow} rightCol="bestStatForSlide" />
        <EvidenceRowList title="Top evidence rows in Cohort B" rows={getTopEvidenceRows(bRows, "evidence", undefined, 10)} onOpen={setSelectedRow} rightCol="bestStatForSlide" />
        <EvidenceRowList title="Top gaps in Cohort A" rows={getTopGapRows(aRows, 10)} onOpen={setSelectedRow} rightCol="gapSummary" />
        <EvidenceRowList title="Top gaps in Cohort B" rows={getTopGapRows(bRows, 10)} onOpen={setSelectedRow} rightCol="gapSummary" />
      </div>

      <ArticleDetailDrawer row={selectedRow} extracts={selectedRow ? dataset?.evidenceByRowId[selectedRow.rowId] ?? [] : []} open={Boolean(selectedRow)} onOpenChange={(open) => !open && setSelectedRow(null)} />
    </div>
  )
}

