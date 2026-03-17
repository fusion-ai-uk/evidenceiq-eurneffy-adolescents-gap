"use client"

import * as React from "react"
import { useAnalysisContext } from "@/components/evidenceiq/analysis-context"
import { BARRIER_FAMILIES } from "@/lib/evidence/taxonomy"
import {
  AnalysisSectionHeader,
  BarrierDetailPanel,
  EvidenceRowList,
  FrequencyListWithChips,
  MetricStrip,
  RankedTaxonomyBars,
  SupportVsGapMatrix,
} from "@/components/evidenceiq/analysis-components"
import {
  getAverageScore,
  getCooccurrenceMatrix,
  getEvidenceVsAssumptionProfile,
  getFamilyRows,
  getTagFrequency,
  getTopEvidenceRows,
  getTopGapRows,
  getWeightedTagFrequency,
} from "@/lib/evidence/selectors"
import type { ArticleRow } from "@/lib/evidence/types"
import { ArticleDetailDrawer } from "@/components/evidenceiq/article-detail-drawer"
import { formatShare } from "@/lib/evidence/display"

export default function BarrierBehaviourExplorerPage() {
  const { filteredRows, dataset, isLoading, error } = useAnalysisContext()
  const [selectedRow, setSelectedRow] = React.useState<ArticleRow | null>(null)
  const focusRows = filteredRows
  const totalFocusRows = focusRows.length

  const barrierOverview = React.useMemo(
    () =>
      getWeightedTagFrequency(
        filteredRows,
        (row) => row.barrierTags,
        (row) => (row.usefulnessScore ?? 0) * 0.45 + (row.adolescentSpecificityScore ?? 0) * 0.25 + (row.ukRelevanceScore ?? 0) * 0.3,
      ),
    [filteredRows],
  )

  const familySummaryRows = React.useMemo(
    () =>
      BARRIER_FAMILIES.map((family) => {
        const rows = getFamilyRows(filteredRows, family.key, "barrier")
        return {
          label: family.label,
          coverage: filteredRows.length > 0 ? (rows.length / filteredRows.length) * 100 : 0,
          gapPressure: getAverageScore(rows, (row) => row.gapUsefulnessScore),
        }
      }),
    [filteredRows],
  )

  const profile = React.useMemo(() => getEvidenceVsAssumptionProfile(focusRows), [focusRows])
  const cooccurrenceSetting = React.useMemo(
    () => getCooccurrenceMatrix(focusRows, (row) => row.barrierTags, (row) => row.settingTags).slice(0, 12),
    [focusRows],
  )
  const cooccurrenceDrivers = React.useMemo(
    () => getCooccurrenceMatrix(focusRows, (row) => row.barrierTags, (row) => row.behaviouralDriverTags).slice(0, 12),
    [focusRows],
  )
  const cooccurrenceTraining = React.useMemo(
    () => getCooccurrenceMatrix(focusRows, (row) => row.barrierTags, (row) => row.trainingErrorTags).slice(0, 12),
    [focusRows],
  )

  if (isLoading) return <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Loading barrier explorer...</div>
  if (error) return <div className="rounded-lg border border-destructive/40 p-6 text-sm text-destructive">{error}</div>

  return (
    <div className="space-y-4">
      <AnalysisSectionHeader title="Barrier & Behaviour Explorer" description="Track where barrier evidence is strongest but the gap pressure remains highest." />

      <section id="barrier-kpis" className="scroll-mt-24">
        <MetricStrip
          items={[
            { label: "Avg gap signal", value: getAverageScore(focusRows, (row) => row.gapUsefulnessScore).toFixed(1) },
            { label: "High-priority gap share", value: formatShare(focusRows.filter((row) => ["high", "critical"].includes(row.gapPriority.toLowerCase())).length, totalFocusRows) },
            { label: "Critical gap share", value: formatShare(focusRows.filter((row) => row.gapPriority.toLowerCase() === "critical").length, totalFocusRows) },
            { label: "No adolescent breakout share", value: formatShare(focusRows.filter((row) => row.reportsNoAdolescentBreakout).length, totalFocusRows) },
            { label: "No UK breakout share", value: formatShare(focusRows.filter((row) => row.reportsNoUkBreakout).length, totalFocusRows) },
            { label: "No real-world error data share", value: formatShare(focusRows.filter((row) => row.reportsNoRealWorldErrorData).length, totalFocusRows) },
            { label: "No setting-specific data share", value: formatShare(focusRows.filter((row) => row.reportsNoSettingSpecificData).length, totalFocusRows) },
            { label: "No equity subgroup data share", value: formatShare(focusRows.filter((row) => row.reportsNoEquitySubgroupData).length, totalFocusRows) },
            { label: "Gap-heavy share", value: formatShare(profile.gapHeavy, totalFocusRows) },
          ]}
        />
      </section>

      <div id="barrier-overview" className="scroll-mt-24 grid gap-3 xl:grid-cols-2">
        <RankedTaxonomyBars
          title="Barrier overview (weighted)"
          items={barrierOverview}
          showWeighted
        />
        <SupportVsGapMatrix rows={familySummaryRows} />
      </div>

      <div id="barrier-families" className="scroll-mt-24 grid gap-3 xl:grid-cols-3">
        {BARRIER_FAMILIES.map((family) => {
          const familyRows = getFamilyRows(filteredRows, family.key, "barrier")
          return (
            <div
              key={family.key}
              className="rounded-xl border p-3 text-left"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{family.label}</p>
              <p className="mt-1 text-xl font-semibold">{formatShare(familyRows.length, totalFocusRows)}</p>
              <p className="text-xs text-muted-foreground">Avg evidence signal: {getAverageScore(familyRows, (row) => row.messageUsefulnessScore).toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Top tags: {family.tags.slice(0, 3).join(", ")}</p>
            </div>
          )
        })}
      </div>

      <BarrierDetailPanel>
        <div id="barrier-tags" className="scroll-mt-24 grid gap-3 xl:grid-cols-3">
          <RankedTaxonomyBars title="Behavioural drivers" items={getTagFrequency(focusRows, (row) => row.behaviouralDriverTags)} />
          <RankedTaxonomyBars title="Social psychology tags" items={getTagFrequency(focusRows, (row) => row.socialPsychologyTags)} />
          <RankedTaxonomyBars title="Training error tags" items={getTagFrequency(focusRows, (row) => row.trainingErrorTags)} />
        </div>

        <div id="barrier-cooccurrence" className="scroll-mt-24 grid gap-3 xl:grid-cols-3">
          <FrequencyListWithChips title="Barrier x setting co-occurrence" items={cooccurrenceSetting.map((row) => ({ key: `${row.x} -> ${row.y}`, count: row.count, percentage: 0 }))} />
          <FrequencyListWithChips title="Barrier x behavioural-driver co-occurrence" items={cooccurrenceDrivers.map((row) => ({ key: `${row.x} -> ${row.y}`, count: row.count, percentage: 0 }))} />
          <FrequencyListWithChips title="Barrier x training-error co-occurrence" items={cooccurrenceTraining.map((row) => ({ key: `${row.x} -> ${row.y}`, count: row.count, percentage: 0 }))} />
        </div>

        <div id="barrier-evidence" className="scroll-mt-24 space-y-3">
          <EvidenceRowList title="Top supporting evidence rows" rows={getTopEvidenceRows(focusRows, "evidence", undefined, 12)} onOpen={setSelectedRow} rightCol="bestStatForSlide" />
          <EvidenceRowList title="Top gap rows for barrier context" rows={getTopGapRows(focusRows, 12)} onOpen={setSelectedRow} rightCol="gapSummary" />
          <EvidenceRowList title="Barrier evidence ledger" rows={focusRows.slice(0, 40)} onOpen={setSelectedRow} rightCol="kolQuestion" />
        </div>
      </BarrierDetailPanel>

      <ArticleDetailDrawer
        row={selectedRow}
        extracts={selectedRow ? dataset?.evidenceByRowId[selectedRow.rowId] ?? [] : []}
        open={Boolean(selectedRow)}
        onOpenChange={(open) => !open && setSelectedRow(null)}
      />
    </div>
  )
}

