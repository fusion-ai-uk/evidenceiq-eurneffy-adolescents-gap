"use client"

import * as React from "react"
import { useAnalysisContext } from "@/components/evidenceiq/analysis-context"
import { OPPORTUNITY_FAMILIES } from "@/lib/evidence/taxonomy"
import {
  AnalysisSectionHeader,
  EvidenceRowList,
  FrequencyListWithChips,
  MetricStrip,
  OpportunityThemeCard,
  RankedTaxonomyBars,
} from "@/components/evidenceiq/analysis-components"
import {
  classifySupportLevel,
  getAverageScore,
  getOpenQuestionsSummary,
  getTagFrequency,
  getTopEvidenceRows,
} from "@/lib/evidence/selectors"
import type { ArticleRow } from "@/lib/evidence/types"
import { ArticleDetailDrawer } from "@/components/evidenceiq/article-detail-drawer"
import { formatShare } from "@/lib/evidence/display"

export default function EurneffyOpportunityPage() {
  const { filteredRows, dataset, isLoading, error } = useAnalysisContext()
  const [selectedRow, setSelectedRow] = React.useState<ArticleRow | null>(null)

  const eurRows = React.useMemo(() => {
    return filteredRows.filter((row) => (row.eurRelevanceScore ?? 0) > 0 || row.eurOpportunityTags.length > 0 || row.eurMessageRoutes.length > 0)
  }, [filteredRows])
  const totalEurRows = eurRows.length

  const overviewItems = React.useMemo(
    () => [
      { label: "Average gap signal", value: getAverageScore(eurRows, (row) => row.gapUsefulnessScore).toFixed(1) },
      { label: "High-priority gap share", value: formatShare(eurRows.filter((row) => ["high", "critical"].includes(row.gapPriority.toLowerCase())).length, totalEurRows) },
      { label: "Critical gap share", value: formatShare(eurRows.filter((row) => row.gapPriority.toLowerCase() === "critical").length, totalEurRows) },
      { label: "No adolescent breakout share", value: formatShare(eurRows.filter((row) => row.reportsNoAdolescentBreakout).length, totalEurRows) },
      { label: "No UK breakout share", value: formatShare(eurRows.filter((row) => row.reportsNoUkBreakout).length, totalEurRows) },
      { label: "No real-world error data share", value: formatShare(eurRows.filter((row) => row.reportsNoRealWorldErrorData).length, totalEurRows) },
      { label: "Med/legal flag share", value: formatShare(eurRows.filter((row) => row.medLegalReviewFlags.length > 0).length, totalEurRows) },
      { label: "KOL question signal share", value: formatShare(eurRows.filter((row) => Boolean(row.kolQuestion)).length, totalEurRows) },
    ],
    [eurRows, totalEurRows],
  )

  const opportunityTags = React.useMemo(
    () =>
      getTagFrequency(eurRows, (row) => row.eurOpportunityTags).map((tag) => {
        const rows = eurRows.filter((row) => row.eurOpportunityTags.includes(tag.key))
        const directOrContext = rows.filter((row) => ["direct_barrier_match", "contextual_support"].includes(classifySupportLevel(row))).length
        return {
          ...tag,
          weightedScore: getAverageScore(rows, (row) => row.gapUsefulnessScore),
          supportRatio: rows.length > 0 ? (directOrContext / rows.length) * 100 : 0,
        }
      }),
    [eurRows],
  )

  const openQuestions = React.useMemo(() => getOpenQuestionsSummary(eurRows), [eurRows])

  if (isLoading) return <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Loading EURneffy opportunity view...</div>
  if (error) return <div className="rounded-lg border border-destructive/40 p-6 text-sm text-destructive">{error}</div>

  return (
    <div className="space-y-4">
      <AnalysisSectionHeader title="EURneffy Opportunity View" description="View EURneffy-related themes through a gap lens: where support is thin and what follow-up is needed." />
      <section id="opportunity-kpis" className="scroll-mt-24">
        <MetricStrip items={overviewItems} />
      </section>

      <div id="opportunity-rankings" className="scroll-mt-24 grid gap-3 xl:grid-cols-2">
        <RankedTaxonomyBars
          title="Opportunity tag ranking"
          items={opportunityTags}
          showWeighted
        />
        <RankedTaxonomyBars title="Data gap tags" items={getTagFrequency(eurRows, (row) => row.dataGapTags)} />
      </div>

      <div id="opportunity-families" className="scroll-mt-24 grid gap-3 xl:grid-cols-3">
        {OPPORTUNITY_FAMILIES.map((family) => {
          const familyRows = eurRows.filter((row) => row.eurOpportunityTags.some((tag) => family.tags.includes(tag)))
          return (
            <OpportunityThemeCard
              key={family.key}
              title={family.label}
              onOpenExplorer={family.tags[0]}
              metrics={[
                { label: "Cohort share", value: formatShare(familyRows.length, totalEurRows) },
                { label: "High-priority gap share", value: formatShare(familyRows.filter((row) => ["high", "critical"].includes(row.gapPriority.toLowerCase())).length, familyRows.length) },
                { label: "No UK breakout share", value: formatShare(familyRows.filter((row) => row.reportsNoUkBreakout).length, familyRows.length) },
                { label: "KOL question signal share", value: formatShare(familyRows.filter((row) => Boolean(row.kolQuestion)).length, familyRows.length) },
              ]}
            >
              <FrequencyListWithChips title="Top related barriers" items={getTagFrequency(familyRows, (row) => row.barrierTags)} />
              <FrequencyListWithChips title="Top caution statements" items={getTagFrequency(familyRows, (row) => row.eurMessageCautions)} humanizeKeys={false} />
            </OpportunityThemeCard>
          )
        })}
      </div>

      <div id="opportunity-questions" className="scroll-mt-24 grid gap-3 xl:grid-cols-3">
        <FrequencyListWithChips title="Top KOL questions" items={openQuestions.kolQuestions} humanizeKeys={false} />
        <FrequencyListWithChips title="Top follow-up research questions" items={openQuestions.followupQuestions} humanizeKeys={false} />
        <FrequencyListWithChips title="Top missing stats" items={openQuestions.missingStats} humanizeKeys={false} />
      </div>

      <section id="opportunity-evidence" className="scroll-mt-24">
        <EvidenceRowList title="EURneffy evidence table" rows={getTopEvidenceRows(eurRows, "evidence", undefined, 40)} onOpen={setSelectedRow} rightCol="bestStatForSlide" />
      </section>

      <ArticleDetailDrawer
        row={selectedRow}
        extracts={selectedRow ? dataset?.evidenceByRowId[selectedRow.rowId] ?? [] : []}
        open={Boolean(selectedRow)}
        onOpenChange={(open) => !open && setSelectedRow(null)}
      />
    </div>
  )
}

