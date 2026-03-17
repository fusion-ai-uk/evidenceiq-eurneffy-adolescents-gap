"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAnalysisContext } from "@/components/evidenceiq/analysis-context"
import { AnalysisSectionHeader, EvidenceRowList } from "@/components/evidenceiq/analysis-components"
import { GapClusterCard, QuestionBankPanel } from "@/components/evidenceiq/workflow-components"
import { getGapClusters, getQuestionBank, rankGapItems } from "@/lib/evidence/workflow"
import { getTopGapRows } from "@/lib/evidence/selectors"
import { ArticleDetailDrawer } from "@/components/evidenceiq/article-detail-drawer"
import type { ArticleRow } from "@/lib/evidence/types"
import { useAnalystWorkspace } from "@/components/evidenceiq/analyst-workspace"
import { formatShare, humanizeLabel } from "@/lib/evidence/display"

const CLUSTER_COPY: Record<string, { title: string; description: string; tooltip: string }> = {
  adolescent_specificity_gaps: {
    title: "Adolescent Specificity Gaps",
    description:
      "Cohort share where evidence does not separate adolescent outcomes from broader populations. Higher share indicates heavier reliance on proxy evidence.",
    tooltip:
      "This cluster tracks missing adolescent breakout. Use it to identify where conclusions are likely being inferred from mixed-age or paediatric-broad evidence rather than direct adolescent data.",
  },
  uk_data_gaps: {
    title: "UK Data Gaps",
    description:
      "Cohort share where evidence lacks UK-specific breakout or UK-grounded detail. Higher share indicates stronger transfer-risk from broader geography context.",
    tooltip:
      "This cluster shows where UK-specific interpretation is constrained. Prioritize these rows when the decision context requires UK-first confidence.",
  },
  real_world_behaviour_gaps: {
    title: "Real-World Behaviour Gaps",
    description:
      "Cohort share where practical behavior and execution data are missing, especially around carriage, delayed action, and emergency-use errors.",
    tooltip:
      "This cluster highlights where guidance exists but real-world adherence/performance data are thin. It is usually the highest-value area for follow-up research.",
  },
  dosing_transition_gaps: {
    title: "Dosing Transition Gaps",
    description:
      "Cohort share tied to dose-change uncertainty, under-dosing risk, and threshold transitions with limited decision-grade evidence.",
    tooltip:
      "This cluster tracks unresolved dosing transition evidence. Use it to prioritize follow-up where dose thresholds and real-world execution are still under-described.",
  },
  setting_specific_gaps: {
    title: "Setting-Specific Gaps",
    description:
      "Cohort share where evidence is present but not broken out by setting (for example school, travel, home, or sport).",
    tooltip:
      "This cluster indicates where setting-level interpretation is weak. High share values mean interventions may be planned without enough context-specific evidence.",
  },
  equity_access_gaps: {
    title: "Equity & Access Gaps",
    description:
      "Cohort share where subgroup equity and access differences are not adequately captured in the current evidence base.",
    tooltip:
      "This cluster surfaces missing subgroup and access detail. Use it to identify where conclusions may hide important inequality patterns.",
  },
  training_technique_gaps: {
    title: "Training & Technique Gaps",
    description:
      "Cohort share showing repeated training or administration-error themes with unresolved practical evidence.",
    tooltip:
      "This cluster maps gaps in practical readiness. It is useful for prioritizing remediation around training design, reinforcement cadence, and stress-condition execution.",
  },
  device_comparison_gaps: {
    title: "Device Comparison Gaps",
    description:
      "Cohort share indicating limited comparative evidence across device options, handling outcomes, and real-world performance differences.",
    tooltip:
      "This cluster highlights where device-level comparison remains incomplete. Use it to prioritize evidence requests before making comparative interpretation claims.",
  },
}

export default function GapPrioritizationPage() {
  const { filteredRows, dataset, isLoading, error } = useAnalysisContext()
  const { addQuestion } = useAnalystWorkspace()
  const [selectedRow, setSelectedRow] = React.useState<ArticleRow | null>(null)

  const gapRows = React.useMemo(() => filteredRows.filter((row) => row.gapUsefulnessScore !== null && (row.gapUsefulnessScore ?? 0) > 0), [filteredRows])
  const rankedGaps = React.useMemo(() => rankGapItems(gapRows), [gapRows])
  const clusters = React.useMemo(() => getGapClusters(gapRows), [gapRows])
  const questionBank = React.useMemo(() => getQuestionBank(gapRows), [gapRows])

  const getTopGapThemes = React.useCallback((rows: ArticleRow[]) => {
    const counts = new Map<string, number>()
    rows.forEach((row) => {
      row.dataGapTags.forEach((tag) => {
        if (!tag) return
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      })
    })

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([tag]) => humanizeLabel(tag))
      .join(" | ")
  }, [])

  if (isLoading) return <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Loading gap prioritization...</div>
  if (error) return <div className="rounded-lg border border-destructive/40 p-6 text-sm text-destructive">{error}</div>

  return (
    <div className="space-y-4">
      <AnalysisSectionHeader
        title="Gap Prioritization"
        description="Prioritize the highest-impact unresolved evidence gaps and convert them into concrete follow-up questions."
      />
      {gapRows.length < 5 ? (
        <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
          Gap workspace currently has a very small cohort share. Rankings may be unstable under current filters.
        </div>
      ) : null}

      <div id="gap-priority-table" className="scroll-mt-24 rounded-md border">
        <table className="w-full text-xs">
          <thead className="bg-muted/50"><tr><th className="p-2 text-left">Gap item</th><th className="p-2 text-left">Share</th><th className="p-2 text-left">Gap signal</th><th className="p-2 text-left">Evidence signal</th><th className="p-2 text-left">Confidence</th></tr></thead>
          <tbody>
            {rankedGaps.slice(0, 20).map((item) => (
              <tr key={item.key} className="border-t">
                <td className="p-2">{humanizeLabel(item.key)}</td>
                <td className="p-2">{formatShare(item.count, gapRows.length)}</td>
                <td className="p-2">{item.weightedGapUsefulness.toFixed(1)}</td>
                <td className="p-2">{item.weightedUsefulness.toFixed(1)}</td>
                <td className="p-2">{item.confidence.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section id="gap-priority-clusters" className="scroll-mt-24 space-y-2">
        <div>
          <h2 className="text-base font-semibold">Gap Cluster Priorities</h2>
          <p className="text-xs text-muted-foreground">
            Grouped view of the main evidence-gap families, shown as cohort share rather than raw article counts.
          </p>
        </div>
        <div className="grid gap-3 xl:grid-cols-4">
          {Object.entries(clusters).map(([key, rows]) => {
            const urgent = rows.filter((row) => row.gapPriority.toLowerCase() === "critical").length > 0
            const foundational = rows.length > 0 && rows.filter((row) => (row.usefulnessScore ?? 0) >= 60).length > rows.length / 2
            const copy = CLUSTER_COPY[key] ?? {
              title: humanizeLabel(key),
              description: "Clustered rows grouped by recurring evidence-gap pattern.",
              tooltip: "This cluster groups rows with a shared evidence-gap pattern so follow-up priorities can be scoped quickly.",
            }
            const topThemes = getTopGapThemes(rows)

            return (
              <GapClusterCard
                key={key}
                title={copy.title}
                description={copy.description}
                tooltip={copy.tooltip}
                status={urgent ? "urgent" : foundational ? "foundational" : "secondary"}
                items={[
                  { label: "Cohort share", value: formatShare(rows.length, gapRows.length) },
                  { label: "Top gap themes", value: topThemes || "n/a" },
                  { label: "KOL question share", value: formatShare(rows.filter((row) => Boolean(row.kolQuestion)).length, rows.length) },
                ]}
              />
            )
          })}
        </div>
      </section>

      <Tabs id="gap-priority-questions" defaultValue="kol" className="scroll-mt-24">
        <TabsList>
          <TabsTrigger value="kol">KOL questions</TabsTrigger>
          <TabsTrigger value="followup">Follow-up desk research</TabsTrigger>
          <TabsTrigger value="missing">Missing stats</TabsTrigger>
        </TabsList>
        <TabsContent value="kol"><QuestionBankPanel title="KOL question bank" items={questionBank.kol} onPick={(text) => addQuestion({ id: `kol-${text}`, kind: "kol", text })} /></TabsContent>
        <TabsContent value="followup"><QuestionBankPanel title="Follow-up research question bank" items={questionBank.followup} onPick={(text) => addQuestion({ id: `followup-${text}`, kind: "followup", text })} /></TabsContent>
        <TabsContent value="missing"><QuestionBankPanel title="Missing stats bank" items={questionBank.missingStats} onPick={(text) => addQuestion({ id: `missing-${text}`, kind: "missing_stat", text })} /></TabsContent>
      </Tabs>

      <div id="gap-priority-evidence" className="scroll-mt-24 grid gap-3">
        <EvidenceRowList title="Gap evidence drilldown rows" rows={getTopGapRows(gapRows, 16)} onOpen={setSelectedRow} rightCol="gapSummary" />
      </div>

      <ArticleDetailDrawer row={selectedRow} extracts={selectedRow ? dataset?.evidenceByRowId[selectedRow.rowId] ?? [] : []} open={Boolean(selectedRow)} onOpenChange={(open) => !open && setSelectedRow(null)} />
    </div>
  )
}

