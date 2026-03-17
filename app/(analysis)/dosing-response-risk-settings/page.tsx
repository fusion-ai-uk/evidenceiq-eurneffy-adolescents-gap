"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAnalysisContext } from "@/components/evidenceiq/analysis-context"
import {
  AnalysisSectionHeader,
  EvidenceRowList,
  FrequencyListWithChips,
  MetricStrip,
  RankedTaxonomyBars,
} from "@/components/evidenceiq/analysis-components"
import {
  getAverageScore,
  getCooccurrenceMatrix,
  getRowsForTopic,
  getTagFrequency,
  getTopEvidenceRows,
  getTopGapRows,
} from "@/lib/evidence/selectors"
import type { ArticleRow } from "@/lib/evidence/types"
import { ArticleDetailDrawer } from "@/components/evidenceiq/article-detail-drawer"
import { formatShare } from "@/lib/evidence/display"

export default function DosingResponseRiskSettingsPage() {
  const { filteredRows, dataset, isLoading, error } = useAnalysisContext()
  const [activeTab, setActiveTab] = React.useState("dosing")
  const [selectedRow, setSelectedRow] = React.useState<ArticleRow | null>(null)

  React.useEffect(() => {
    const syncTabToHash = () => {
      if (typeof window === "undefined") return
      const hash = window.location.hash.replace("#", "")
      if (hash.startsWith("response-")) {
        setActiveTab("response")
        return
      }
      if (hash.startsWith("settings-")) {
        setActiveTab("settings")
        return
      }
      if (hash.startsWith("dosing-")) {
        setActiveTab("dosing")
      }
    }

    syncTabToHash()
    window.addEventListener("hashchange", syncTabToHash)
    return () => window.removeEventListener("hashchange", syncTabToHash)
  }, [])

  const dosingRows = React.useMemo(() => getRowsForTopic(filteredRows, "dosing_transitions"), [filteredRows])
  const totalDosingRows = dosingRows.length

  const responseRows = React.useMemo(() => getRowsForTopic(filteredRows, "recognition_response"), [filteredRows])
  const totalResponseRows = responseRows.length

  const settingsRows = React.useMemo(() => getRowsForTopic(filteredRows, "settings_of_risk"), [filteredRows])
  const totalSettingsRows = settingsRows.length

  const responseCrossovers = React.useMemo(
    () => getCooccurrenceMatrix(responseRows, (row) => row.recognitionResponseTags, (row) => row.trainingErrorTags).slice(0, 10),
    [responseRows],
  )
  const dosingBarrierCross = React.useMemo(
    () => getCooccurrenceMatrix(dosingRows, (row) => row.dosingTransitionTags, (row) => row.barrierTags).slice(0, 12),
    [dosingRows],
  )
  const settingBarrierCross = React.useMemo(
    () => getCooccurrenceMatrix(settingsRows, (row) => row.settingTags, (row) => row.barrierTags).slice(0, 12),
    [settingsRows],
  )

  if (isLoading) return <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Loading dosing/response/settings analysis...</div>
  if (error) return <div className="rounded-lg border border-destructive/40 p-6 text-sm text-destructive">{error}</div>

  return (
    <div className="space-y-4">
      <AnalysisSectionHeader title="Dosing / Response / Risk Settings" description="Use each tab to identify high-priority evidence gaps and missing breakouts in critical care moments." />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dosing">Dosing Transitions</TabsTrigger>
          <TabsTrigger value="response">Recognition & Response</TabsTrigger>
          <TabsTrigger value="settings">Settings of Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="dosing" className="space-y-3">
          <section id="dosing-kpis" className="scroll-mt-24">
            <MetricStrip
              items={[
                { label: "Average gap signal", value: getAverageScore(dosingRows, (row) => row.gapUsefulnessScore).toFixed(1) },
                { label: "High-priority gap share", value: formatShare(dosingRows.filter((row) => ["high", "critical"].includes(row.gapPriority.toLowerCase())).length, totalDosingRows) },
                { label: "Critical gap share", value: formatShare(dosingRows.filter((row) => row.gapPriority.toLowerCase() === "critical").length, totalDosingRows) },
                { label: "No adolescent breakout share", value: formatShare(dosingRows.filter((row) => row.reportsNoAdolescentBreakout).length, totalDosingRows) },
                { label: "No UK breakout share", value: formatShare(dosingRows.filter((row) => row.reportsNoUkBreakout).length, totalDosingRows) },
                { label: "No real-world error data share", value: formatShare(dosingRows.filter((row) => row.reportsNoRealWorldErrorData).length, totalDosingRows) },
                { label: "KOL question signal share", value: formatShare(dosingRows.filter((row) => Boolean(row.kolQuestion)).length, totalDosingRows) },
                { label: "Missing-stat signal share", value: formatShare(dosingRows.filter((row) => Boolean(row.missingStatWishWeHad)).length, totalDosingRows) },
              ]}
            />
          </section>
          <div id="dosing-maps" className="scroll-mt-24 grid gap-3 xl:grid-cols-3">
            <RankedTaxonomyBars title="Dosing tag distribution" items={getTagFrequency(dosingRows, (row) => row.dosingTransitionTags)} />
            <RankedTaxonomyBars title="Dosing x gap relationship" items={getTagFrequency(dosingRows, (row) => row.dataGapTags)} />
            <FrequencyListWithChips title="Dosing x barrier relationship" items={dosingBarrierCross.map((row) => ({ key: `${row.x} -> ${row.y}`, count: row.count, percentage: 0 }))} />
          </div>
          <div id="dosing-evidence" className="scroll-mt-24 space-y-3">
            <EvidenceRowList title="Dosing proof points" rows={getTopEvidenceRows(dosingRows, "evidence", "dosing_transitions", 12)} onOpen={setSelectedRow} rightCol="bestStatForSlide" />
            <EvidenceRowList title="Dosing gaps" rows={getTopGapRows(dosingRows, 12)} onOpen={setSelectedRow} rightCol="gapSummary" />
          </div>
        </TabsContent>

        <TabsContent value="response" className="space-y-3">
          <section id="response-kpis" className="scroll-mt-24">
            <MetricStrip
              items={[
                { label: "Average gap signal", value: getAverageScore(responseRows, (row) => row.gapUsefulnessScore).toFixed(1) },
                { label: "High-priority gap share", value: formatShare(responseRows.filter((row) => ["high", "critical"].includes(row.gapPriority.toLowerCase())).length, totalResponseRows) },
                { label: "Critical gap share", value: formatShare(responseRows.filter((row) => row.gapPriority.toLowerCase() === "critical").length, totalResponseRows) },
                { label: "No adolescent breakout share", value: formatShare(responseRows.filter((row) => row.reportsNoAdolescentBreakout).length, totalResponseRows) },
                { label: "No UK breakout share", value: formatShare(responseRows.filter((row) => row.reportsNoUkBreakout).length, totalResponseRows) },
                { label: "No real-world error data share", value: formatShare(responseRows.filter((row) => row.reportsNoRealWorldErrorData).length, totalResponseRows) },
                { label: "KOL question signal share", value: formatShare(responseRows.filter((row) => Boolean(row.kolQuestion)).length, totalResponseRows) },
                { label: "Missing-stat signal share", value: formatShare(responseRows.filter((row) => Boolean(row.missingStatWishWeHad)).length, totalResponseRows) },
              ]}
            />
          </section>
          <div id="response-maps" className="scroll-mt-24 grid gap-3 xl:grid-cols-3">
            <RankedTaxonomyBars title="Recognition/response tags" items={getTagFrequency(responseRows, (row) => row.recognitionResponseTags)} />
            <RankedTaxonomyBars title="Training error crossover" items={getTagFrequency(responseRows, (row) => row.trainingErrorTags)} />
            <FrequencyListWithChips title="Recognition x training co-occurrence" items={responseCrossovers.map((row) => ({ key: `${row.x} -> ${row.y}`, count: row.count, percentage: 0 }))} />
          </div>
          <div id="response-evidence" className="scroll-mt-24 space-y-3">
            <EvidenceRowList title="Response proof points" rows={getTopEvidenceRows(responseRows, "evidence", "recognition_response", 12)} onOpen={setSelectedRow} rightCol="bestStatForSlide" />
            <EvidenceRowList title="Response gaps" rows={getTopGapRows(responseRows, 12)} onOpen={setSelectedRow} rightCol="gapSummary" />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-3">
          <section id="settings-kpis" className="scroll-mt-24">
            <MetricStrip
              items={[
                { label: "Average gap signal", value: getAverageScore(settingsRows, (row) => row.gapUsefulnessScore).toFixed(1) },
                { label: "High-priority gap share", value: formatShare(settingsRows.filter((row) => ["high", "critical"].includes(row.gapPriority.toLowerCase())).length, totalSettingsRows) },
                { label: "Critical gap share", value: formatShare(settingsRows.filter((row) => row.gapPriority.toLowerCase() === "critical").length, totalSettingsRows) },
                { label: "No adolescent breakout share", value: formatShare(settingsRows.filter((row) => row.reportsNoAdolescentBreakout).length, totalSettingsRows) },
                { label: "No UK breakout share", value: formatShare(settingsRows.filter((row) => row.reportsNoUkBreakout).length, totalSettingsRows) },
                { label: "No setting-specific data share", value: formatShare(settingsRows.filter((row) => row.reportsNoSettingSpecificData).length, totalSettingsRows) },
                { label: "No equity subgroup data share", value: formatShare(settingsRows.filter((row) => row.reportsNoEquitySubgroupData).length, totalSettingsRows) },
                { label: "KOL question signal share", value: formatShare(settingsRows.filter((row) => Boolean(row.kolQuestion)).length, totalSettingsRows) },
              ]}
            />
          </section>
          <div id="settings-maps" className="scroll-mt-24 grid gap-3 xl:grid-cols-3">
            <RankedTaxonomyBars title="Settings ranking" items={getTagFrequency(settingsRows, (row) => row.settingTags)} />
            <RankedTaxonomyBars title="Setting x gap relationship" items={getTagFrequency(settingsRows, (row) => row.dataGapTags)} />
            <FrequencyListWithChips title="Setting x barrier relationship" items={settingBarrierCross.map((row) => ({ key: `${row.x} -> ${row.y}`, count: row.count, percentage: 0 }))} />
          </div>
          <div id="settings-evidence" className="scroll-mt-24 space-y-3">
            <EvidenceRowList title="Setting supporting evidence" rows={getTopEvidenceRows(settingsRows, "evidence", "settings_of_risk", 12)} onOpen={setSelectedRow} rightCol="bestStatForSlide" />
            <EvidenceRowList title="Setting gap evidence" rows={getTopGapRows(settingsRows, 12)} onOpen={setSelectedRow} rightCol="gapSummary" />
          </div>
        </TabsContent>
      </Tabs>

      <ArticleDetailDrawer
        row={selectedRow}
        extracts={selectedRow ? dataset?.evidenceByRowId[selectedRow.rowId] ?? [] : []}
        open={Boolean(selectedRow)}
        onOpenChange={(open) => !open && setSelectedRow(null)}
      />
    </div>
  )
}

