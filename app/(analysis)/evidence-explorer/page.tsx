"use client"

import * as React from "react"
import { ArrowUpDown, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAnalysisContext } from "@/components/evidenceiq/analysis-context"
import { RowQualityBadge } from "@/components/evidenceiq/row-quality-badge"
import { ArticleDetailDrawer } from "@/components/evidenceiq/article-detail-drawer"
import type { ArticleRow } from "@/lib/evidence/types"
import { useAnalystWorkspace } from "@/components/evidenceiq/analyst-workspace"
import { ExtractPreviewInline, QuickTriageChips, SmartSortControl } from "@/components/evidenceiq/workflow-components"
import { getModeAdjustedSortOrder, getRepresentativeExtractForRow } from "@/lib/evidence/workflow"
import { humanizeLabel } from "@/lib/evidence/display"
import { AnalysisSectionHeader, InfoHint } from "@/components/evidenceiq/analysis-components"
import { getHelpSummaryText, getHelpTooltipText } from "@/lib/evidence/help-text"

type SortKey = "message" | "gap" | "uk" | "eur" | "confidence" | "title"

export default function EvidenceExplorerPage() {
  const { dataset, filteredRows, isLoading, error } = useAnalysisContext()
  const [sortKey, setSortKey] = React.useState<SortKey>("confidence")
  const [sortDesc, setSortDesc] = React.useState(true)
  const [selected, setSelected] = React.useState<ArticleRow | null>(null)
  const [triageChips, setTriageChips] = React.useState<string[]>([])
  const [smartSort, setSmartSort] = React.useState("highest_usefulness")
  const [excerptFirstMode, setExcerptFirstMode] = React.useState(false)
  const { state: workspaceState, registerRecentlyViewed } = useAnalystWorkspace()

  const triageFilteredRows = React.useMemo(() => {
    let rows = [...filteredRows]
    triageChips.forEach((chip) => {
      if (chip === "Direct adolescent evidence") rows = rows.filter((row) => row.populationDirectness.toLowerCase().includes("adolescent direct"))
      if (chip === "UK-direct") rows = rows.filter((row) => (row.ukRelevanceScore ?? 0) >= 70)
      if (chip === "High message value") rows = rows.filter((row) => (row.messageUsefulnessScore ?? 0) >= 70)
      if (chip === "High gap value") rows = rows.filter((row) => (row.gapUsefulnessScore ?? 0) >= 70)
      if (chip === "Needs KOL input") rows = rows.filter((row) => Boolean(row.kolQuestion))
      if (chip === "Has usable stats") rows = rows.filter((row) => row.hasUsableStat || (row.statCount ?? 0) > 0)
      if (chip === "Has med/legal cautions") rows = rows.filter((row) => row.medLegalReviewFlags.length > 0)
      if (chip === "Needs recrawl") rows = rows.filter((row) => row.textNeedsRecrawl || row.textProbablyPartial)
      if (chip === "EURneffy relevant") rows = rows.filter((row) => (row.eurRelevanceScore ?? 0) >= 60)
      if (chip === "Dosing-specific") rows = rows.filter((row) => row.dosingTransitionTags.length > 0)
      if (chip === "Recognition/response-specific") rows = rows.filter((row) => row.recognitionResponseTags.length > 0)
      if (chip === "Settings-of-risk-specific") rows = rows.filter((row) => row.settingTags.length > 0)
    })
    return rows
  }, [filteredRows, triageChips])

  const sortedRows = React.useMemo(() => {
    const rows = getModeAdjustedSortOrder(triageFilteredRows, workspaceState.workingMode)
    rows.sort((a, b) => {
      if (smartSort === "highest_usefulness") return (b.usefulnessScore ?? -1) - (a.usefulnessScore ?? -1)
      if (smartSort === "highest_gap_value") return (b.gapUsefulnessScore ?? -1) - (a.gapUsefulnessScore ?? -1)
      if (smartSort === "highest_eur_relevance") return (b.eurRelevanceScore ?? -1) - (a.eurRelevanceScore ?? -1)
      if (smartSort === "highest_confidence") return (b.confidenceScore ?? -1) - (a.confidenceScore ?? -1)
      if (smartSort === "most_adolescent_direct") return (b.adolescentSpecificityScore ?? -1) - (a.adolescentSpecificityScore ?? -1)
      if (smartSort === "most_uk_direct") return (b.ukRelevanceScore ?? -1) - (a.ukRelevanceScore ?? -1)
      if (smartSort === "most_caution_heavy") return b.medLegalReviewFlags.length - a.medLegalReviewFlags.length
      if (smartSort === "most_likely_ingestion_problem") return Number(b.textProbablyPartial || b.textNeedsRecrawl) - Number(a.textProbablyPartial || a.textNeedsRecrawl)
      return 0
    })
    rows.sort((a, b) => {
      const direction = sortDesc ? -1 : 1
      if (sortKey === "title") return direction * a.title.localeCompare(b.title)
      if (sortKey === "confidence") return direction * ((a.confidenceScore ?? -1) - (b.confidenceScore ?? -1))
      if (sortKey === "message") return direction * ((a.messageUsefulnessScore ?? -1) - (b.messageUsefulnessScore ?? -1))
      if (sortKey === "gap") return direction * ((a.gapUsefulnessScore ?? -1) - (b.gapUsefulnessScore ?? -1))
      if (sortKey === "uk") return direction * ((a.ukRelevanceScore ?? -1) - (b.ukRelevanceScore ?? -1))
      if (sortKey === "eur") return direction * ((a.eurRelevanceScore ?? -1) - (b.eurRelevanceScore ?? -1))
      return direction * ((a.confidenceScore ?? -1) - (b.confidenceScore ?? -1))
    })
    return rows
  }, [triageFilteredRows, sortDesc, sortKey, workspaceState.workingMode, smartSort])

  function changeSort(next: SortKey) {
    if (sortKey === next) {
      setSortDesc((prev) => !prev)
      return
    }
    setSortKey(next)
    setSortDesc(true)
  }

  if (isLoading) return <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Loading evidence explorer...</div>
  if (error) return <div className="rounded-lg border border-destructive/40 p-6 text-sm text-destructive">{error}</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <AnalysisSectionHeader title="Evidence Explorer" description="Inspect article-level context and linked curated extracts." />
      </div>
      <div id="evidence-triage" className="scroll-mt-24 flex flex-wrap items-center gap-2">
        <QuickTriageChips
          chips={[
            "Direct adolescent evidence",
            "UK-direct",
            "High message value",
            "High gap value",
            "Needs KOL input",
            "Has usable stats",
            "Has med/legal cautions",
            "Needs recrawl",
            "EURneffy relevant",
            "Dosing-specific",
            "Recognition/response-specific",
            "Settings-of-risk-specific",
          ]}
          active={triageChips}
          onChange={setTriageChips}
        />
      </div>
      <div id="evidence-sort" className="scroll-mt-24 flex items-center gap-2">
        <SmartSortControl value={smartSort} onChange={setSmartSort} />
        <Button size="sm" variant={excerptFirstMode ? "default" : "outline"} onClick={() => setExcerptFirstMode((prev) => !prev)}>
          Excerpt-first triage
        </Button>
      </div>

      <div id="evidence-table" className="scroll-mt-24 rounded-lg border">
        {getHelpSummaryText("Evidence Explorer") ? (
          <p className="px-4 pt-3 text-xs leading-relaxed text-muted-foreground">{getHelpSummaryText("Evidence Explorer")}</p>
        ) : null}
        <Table containerClassName="max-h-[72vh]">
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-1">
                  Quality <InfoHint text={getHelpTooltipText("Quality") ?? ""} />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => changeSort("title")}>
                    Title <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
                  </Button>
                  <InfoHint text={getHelpTooltipText("Title") ?? ""} />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  One-line takeaway <InfoHint text={getHelpTooltipText("One-line takeaway") ?? ""} />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => changeSort("confidence")}>Confidence <ArrowUpDown className="ml-1 h-3.5 w-3.5" /></Button>
                  <InfoHint text={getHelpTooltipText("Confidence") ?? ""} />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => changeSort("message")}>Evidence signal <ArrowUpDown className="ml-1 h-3.5 w-3.5" /></Button>
                  <InfoHint text={getHelpTooltipText("Evidence signal") ?? ""} />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => changeSort("gap")}>Gap signal <ArrowUpDown className="ml-1 h-3.5 w-3.5" /></Button>
                  <InfoHint text={getHelpTooltipText("Gap signal") ?? ""} />
                </div>
              </TableHead>
              <TableHead><div className="flex items-center gap-1">Gap priority <InfoHint text={getHelpTooltipText("Gap priority") ?? ""} /></div></TableHead>
              <TableHead><div className="flex items-center gap-1">Source type <InfoHint text={getHelpTooltipText("Source type") ?? ""} /></div></TableHead>
              {!workspaceState.reviewMode ? <TableHead><div className="flex items-center gap-1">Age focus <InfoHint text={getHelpTooltipText("Age focus") ?? ""} /></div></TableHead> : null}
              <TableHead><div className="flex items-center gap-1">Population directness <InfoHint text={getHelpTooltipText("Population directness") ?? ""} /></div></TableHead>
              {!workspaceState.reviewMode ? <TableHead><div className="flex items-center gap-1">Geography <InfoHint text={getHelpTooltipText("Geography") ?? ""} /></div></TableHead> : null}
              <TableHead>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => changeSort("uk")}>UK relevance <ArrowUpDown className="ml-1 h-3.5 w-3.5" /></Button>
                  <InfoHint text={getHelpTooltipText("UK relevance") ?? ""} />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => changeSort("eur")}>EURneffy relevance <ArrowUpDown className="ml-1 h-3.5 w-3.5" /></Button>
                  <InfoHint text={getHelpTooltipText("EURneffy relevance") ?? ""} />
                </div>
              </TableHead>
              {!workspaceState.reviewMode ? <TableHead><div className="flex items-center gap-1">Best use <InfoHint text={getHelpTooltipText("Best use") ?? ""} /></div></TableHead> : null}
              {!workspaceState.reviewMode ? <TableHead><div className="flex items-center gap-1">Processing status <InfoHint text={getHelpTooltipText("Processing status") ?? ""} /></div></TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row) => (
              <TableRow key={row.rowId} className="cursor-pointer" onClick={() => { setSelected(row); registerRecentlyViewed(row.rowId) }}>
                <TableCell><RowQualityBadge row={row} /></TableCell>
                <TableCell className="max-w-[280px] whitespace-normal">
                  <div className="space-y-1">
                    <p className="line-clamp-2 text-sm font-medium">{row.title || "Untitled"}</p>
                    {excerptFirstMode ? <ExtractPreviewInline text={getRepresentativeExtractForRow(row, dataset?.evidenceByRowId ?? {})?.extractText ?? null} /> : null}
                    {row.sourceUrl ? (
                      <a href={row.sourceUrl} onClick={(event) => event.stopPropagation()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        Source <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="max-w-[300px] whitespace-normal text-xs text-muted-foreground">{row.oneLineTakeaway}</TableCell>
                <TableCell>{row.confidenceScore ?? "n/a"}</TableCell>
                <TableCell>{row.messageUsefulnessScore ?? "n/a"}</TableCell>
                <TableCell>{row.gapUsefulnessScore ?? "n/a"}</TableCell>
                <TableCell>{row.gapPriority ? humanizeLabel(row.gapPriority) : "n/a"}</TableCell>
                <TableCell>{row.sourceType ? humanizeLabel(row.sourceType) : "n/a"}</TableCell>
                {!workspaceState.reviewMode ? <TableCell>{row.ageFocus || "n/a"}</TableCell> : null}
                <TableCell>{row.populationDirectness ? humanizeLabel(row.populationDirectness) : "n/a"}</TableCell>
                {!workspaceState.reviewMode ? <TableCell>{row.geographyPrimary ? humanizeLabel(row.geographyPrimary) : "n/a"}</TableCell> : null}
                <TableCell>{row.ukRelevanceScore ?? "n/a"}</TableCell>
                <TableCell>{row.eurRelevanceScore ?? "n/a"}</TableCell>
                {!workspaceState.reviewMode ? <TableCell>{row.bestUse ? humanizeLabel(row.bestUse) : "n/a"}</TableCell> : null}
                {!workspaceState.reviewMode ? <TableCell>{row.processingStatus ? humanizeLabel(row.processingStatus) : "n/a"}</TableCell> : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ArticleDetailDrawer
        row={selected}
        extracts={selected ? dataset?.evidenceByRowId[selected.rowId] ?? [] : []}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      />
    </div>
  )
}

