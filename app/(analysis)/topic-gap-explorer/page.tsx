"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAnalysisContext } from "@/components/evidenceiq/analysis-context"
import { TOPICS } from "@/lib/evidence/taxonomy"
import {
  AnalysisSectionHeader,
  EvidenceRowList,
  GapQuestionPanel,
  MetricStrip,
  RankedTaxonomyBars,
  ScoreComparisonCards,
  SupportVsGapMatrix,
  TopicDetailPanel,
} from "@/components/evidenceiq/analysis-components"
import {
  getAverageScore,
  getOpenQuestionsSummary,
  getRowsForTopic,
  getTagFrequency,
  getTopEvidenceRows,
  getTopGapRows,
} from "@/lib/evidence/selectors"
import { toFrequency, valueFrequency } from "@/lib/evidence/aggregations"
import type { ArticleRow } from "@/lib/evidence/types"
import { ArticleDetailDrawer } from "@/components/evidenceiq/article-detail-drawer"
import { formatShare } from "@/lib/evidence/display"

export default function TopicGapExplorerPage() {
  const { filteredRows, dataset, isLoading, error } = useAnalysisContext()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [selectedTopic, setSelectedTopic] = React.useState(TOPICS[0].key)
  const [selectedRow, setSelectedRow] = React.useState<ArticleRow | null>(null)

  React.useEffect(() => {
    const topic = searchParams.get("topic")
    if (topic && TOPICS.some((entry) => entry.key === topic)) setSelectedTopic(topic as typeof selectedTopic)
  }, [searchParams])

  React.useEffect(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
    params.set("topic", selectedTopic)
    params.delete("tag")
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [selectedTopic, pathname, router])

  const topicRows = React.useMemo(() => getRowsForTopic(filteredRows, selectedTopic), [filteredRows, selectedTopic])
  const totalTopicRows = topicRows.length
  const highPriorityTopicRows = React.useMemo(
    () => topicRows.filter((row) => ["high", "critical"].includes(row.gapPriority.toLowerCase())),
    [topicRows],
  )

  const topicCards = React.useMemo(() => {
    return TOPICS.map((topic) => {
      const rows = getRowsForTopic(filteredRows, topic.key)
      return {
        key: topic.key,
        label: topic.label,
        score: getAverageScore(rows, (row) => row.gapUsefulnessScore),
        rows: rows.length,
        gapRows: rows.filter((row) => ["high", "critical"].includes(row.gapPriority.toLowerCase())).length,
      }
    })
  }, [filteredRows])

  const matrixRows = React.useMemo(
    () =>
      TOPICS.map((topic) => {
        const rows = getRowsForTopic(filteredRows, topic.key)
        return {
          label: topic.label,
          coverage: getAverageScore(rows, (row) => row.topicScores[topic.key]),
          gapPressure: getAverageScore(rows, (row) => row.gapUsefulnessScore),
        }
      }),
    [filteredRows],
  )

  const snapshot = React.useMemo(
    () => [
      { label: "Average gap signal", value: getAverageScore(topicRows, (row) => row.gapUsefulnessScore).toFixed(1) },
      { label: "High-priority gap share", value: formatShare(topicRows.filter((row) => ["high", "critical"].includes(row.gapPriority.toLowerCase())).length, totalTopicRows) },
      { label: "Critical gap share", value: formatShare(topicRows.filter((row) => row.gapPriority.toLowerCase() === "critical").length, totalTopicRows) },
      { label: "No adolescent breakout share", value: formatShare(topicRows.filter((row) => row.reportsNoAdolescentBreakout).length, totalTopicRows) },
      { label: "No UK breakout share", value: formatShare(topicRows.filter((row) => row.reportsNoUkBreakout).length, totalTopicRows) },
      { label: "No real-world error data share", value: formatShare(topicRows.filter((row) => row.reportsNoRealWorldErrorData).length, totalTopicRows) },
      { label: "No setting-specific data share", value: formatShare(topicRows.filter((row) => row.reportsNoSettingSpecificData).length, totalTopicRows) },
      { label: "No equity subgroup data share", value: formatShare(topicRows.filter((row) => row.reportsNoEquitySubgroupData).length, totalTopicRows) },
    ],
    [topicRows, totalTopicRows],
  )

  const bestEvidence = React.useMemo(
    () => getTopEvidenceRows(topicRows, "gap", selectedTopic, 12),
    [topicRows, selectedTopic],
  )
  const bestGaps = React.useMemo(() => getTopGapRows(topicRows, 12), [topicRows])
  const openQuestions = React.useMemo(() => getOpenQuestionsSummary(topicRows), [topicRows])
  const unresolvedGapQuestions = React.useMemo(() => {
    const unresolved = highPriorityTopicRows
      .map((row) => row.followupResearchQuestion || row.kolQuestion || row.gapSummary || "")
      .filter(Boolean)
    return unresolved.length > 0 ? unresolved : topicRows.map((row) => row.gapSummary).filter(Boolean)
  }, [highPriorityTopicRows, topicRows])

  if (isLoading) return <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Loading topic explorer...</div>
  if (error) return <div className="rounded-lg border border-destructive/40 p-6 text-sm text-destructive">{error}</div>

  return (
    <div className="space-y-4">
      <AnalysisSectionHeader title="Topic & Gap Explorer" description="Focus each topic on gap pressure, missing breakouts, and follow-up research needs." />
      <section id="topic-comparison" className="scroll-mt-24">
        <ScoreComparisonCards items={topicCards} activeKey={selectedTopic} onSelect={(key) => setSelectedTopic(key as typeof selectedTopic)} />
      </section>
      <section id="topic-matrix" className="scroll-mt-24">
        <SupportVsGapMatrix rows={matrixRows} />
      </section>

      <section id="topic-kpis" className="scroll-mt-24">
        <MetricStrip items={snapshot} />
      </section>

      <TopicDetailPanel>
        <div id="topic-themes" className="scroll-mt-24 grid gap-3 xl:grid-cols-2">
          <RankedTaxonomyBars title="Top gap themes (high-priority rows)" items={getTagFrequency(highPriorityTopicRows, (row) => row.dataGapTags)} />
          <GapQuestionPanel title="What still needs answering" questions={toFrequency(unresolvedGapQuestions, topicRows.length)} />
        </div>

        <div id="topic-questions" className="scroll-mt-24 grid gap-3 xl:grid-cols-3">
          <GapQuestionPanel title="KOL questions" questions={openQuestions.kolQuestions} />
          <GapQuestionPanel title="Follow-up research questions" questions={openQuestions.followupQuestions} />
          <GapQuestionPanel title="Missing stats we wish we had" questions={openQuestions.missingStats} />
        </div>

        <div id="topic-evidence" className="scroll-mt-24 space-y-3">
          <EvidenceRowList title="Best evidence for selected topic" rows={bestEvidence} onOpen={setSelectedRow} rightCol="bestStatForSlide" />
          <EvidenceRowList title="Best gap evidence for selected topic" rows={bestGaps} onOpen={setSelectedRow} rightCol="gapSummary" />
          <EvidenceRowList title="Topic evidence ledger" rows={topicRows.slice(0, 40)} onOpen={setSelectedRow} rightCol="kolQuestion" />
        </div>
      </TopicDetailPanel>

      <ArticleDetailDrawer
        row={selectedRow}
        extracts={selectedRow ? dataset?.evidenceByRowId[selectedRow.rowId] ?? [] : []}
        open={Boolean(selectedRow)}
        onOpenChange={(open) => !open && setSelectedRow(null)}
      />
    </div>
  )
}

