"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react"
import type { ArticleRow, FrequencyItem } from "@/lib/evidence/types"
import { RowQualityBadge } from "@/components/evidenceiq/row-quality-badge"
import { cn } from "@/lib/utils"
import { formatShare, humanizeLabel } from "@/lib/evidence/display"
import { getHelpSummaryText, getHelpTooltipText } from "@/lib/evidence/help-text"

export function AnalysisSectionHeader({ title, description }: { title: string; description: string }) {
  const pageHelp = getHelpSummaryText(title)
  const pageTooltip = getHelpTooltipText(title)
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold">{title}</h1>
        {pageTooltip ? <InfoHint text={pageTooltip} /> : null}
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      {pageHelp ? <p className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">{pageHelp}</p> : null}
    </div>
  )
}

export function InfoHint({ text }: { text: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="More information"
            className="inline-flex items-center rounded-full p-0.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm text-xs leading-relaxed">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function TitleWithHint({ title, hint }: { title: string; hint?: string }) {
  const autoHint = hint ?? getHelpTooltipText(title)
  return (
    <div className="flex items-center gap-1.5">
      <span>{title}</span>
      {autoHint ? <InfoHint text={autoHint} /> : null}
    </div>
  )
}

export function CurrentViewSummaryStrip({
  scopeLabel,
  readinessLabel,
  activeFilterCount,
  localFilterLabel,
}: {
  scopeLabel: string
  readinessLabel: string
  activeFilterCount: number
  localFilterLabel?: string | null
}) {
  return (
    <Card className="py-2">
      <CardContent className="flex flex-wrap items-center gap-2 px-4 text-xs">
        <Badge variant="outline">Scope: {humanizeLabel(scopeLabel)}</Badge>
        <Badge variant="outline">Readiness: {humanizeLabel(readinessLabel)}</Badge>
        <Badge variant="outline">Active filters: {activeFilterCount}</Badge>
        {localFilterLabel ? <Badge className="bg-primary/20 text-primary">Focus: {humanizeLabel(localFilterLabel)}</Badge> : null}
      </CardContent>
    </Card>
  )
}

export function MetricStrip({
  items,
  infoByLabel,
}: {
  items: Array<{ label: string; value: string | number }>
  infoByLabel?: Record<string, string>
}) {
  const stripHelp = getHelpSummaryText("Gap signal summary")
  return (
    <Card className="py-4">
      <CardContent className="grid gap-2 px-4 sm:grid-cols-2 xl:grid-cols-4">
        {stripHelp ? <p className="sm:col-span-2 xl:col-span-4 text-xs leading-relaxed text-muted-foreground">{stripHelp}</p> : null}
        {items.map((item) => (
          <div key={item.label} className="rounded-md border p-2">
            {(() => {
              const metricHelp = infoByLabel?.[item.label] ?? getHelpTooltipText(item.label)
              return (
            <div className="flex items-center gap-1">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
              {metricHelp ? <InfoHint text={metricHelp} /> : null}
            </div>
              )
            })()}
            <p className="mt-1 text-lg font-semibold tabular-nums">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function ActiveLocalFilterBar({
  label,
  onClear,
}: {
  label: string | null
  onClear: () => void
}) {
  if (!label) return null
  return (
    <div className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
      <span>
        Active local filter: <span className="font-medium">{label}</span>
      </span>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear
      </Button>
    </div>
  )
}

export function RankedTaxonomyBars({
  title,
  items,
  onClick,
  activeKey,
  top = 10,
  showWeighted = false,
}: {
  title: string
  items: Array<FrequencyItem & { weightedScore?: number }>
  onClick?: (key: string) => void
  activeKey?: string | null
  top?: number
  showWeighted?: boolean
}) {
  const lead = getHelpSummaryText(title)
  const rows = [...items]
    .sort((a, b) => {
      const pctDelta = b.percentage - a.percentage
      if (Math.abs(pctDelta) > 0.0001) return pctDelta
      const weightedDelta = (b.weightedScore ?? 0) - (a.weightedScore ?? 0)
      if (showWeighted && Math.abs(weightedDelta) > 0.0001) return weightedDelta
      return b.count - a.count
    })
    .slice(0, top)
  const clickable = Boolean(onClick)
  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-sm">
          <TitleWithHint title={title} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        {lead ? <p className="text-xs leading-relaxed text-muted-foreground">{lead}</p> : null}
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rows under active filters.</p>
        ) : (
          rows.map((item) =>
            clickable ? (
              <button
                key={item.key}
                type="button"
                onClick={() => onClick?.(item.key)}
                className={cn(
                  "w-full rounded-md border p-2 text-left transition hover:border-primary/40",
                  activeKey === item.key && "border-primary bg-primary/5",
                )}
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-muted-foreground">{humanizeLabel(item.key)}</span>
                  <span className="font-medium tabular-nums">
                    {item.percentage.toFixed(0)}%
                    {showWeighted && item.weightedScore !== undefined ? ` · ${item.weightedScore.toFixed(1)}` : ""}
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, item.percentage)}%` }} />
                </div>
              </button>
            ) : (
              <div key={item.key} className="w-full rounded-md border p-2 text-left">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-muted-foreground">{humanizeLabel(item.key)}</span>
                  <span className="font-medium tabular-nums">
                    {item.percentage.toFixed(0)}%
                    {showWeighted && item.weightedScore !== undefined ? ` · ${item.weightedScore.toFixed(1)}` : ""}
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(100, item.percentage)}%` }} />
                </div>
              </div>
            ),
          )
        )}
      </CardContent>
    </Card>
  )
}

export function DrilldownableBarChart(props: Parameters<typeof RankedTaxonomyBars>[0]) {
  return <RankedTaxonomyBars {...props} />
}

export function FrequencyListWithChips({
  title,
  items,
  top = 8,
  humanizeKeys = true,
}: {
  title: string
  items: FrequencyItem[]
  top?: number
  humanizeKeys?: boolean
}) {
  const lead = getHelpSummaryText(title)
  const display = [...items]
    .sort((a, b) => b.count - a.count || b.percentage - a.percentage)
    .slice(0, top)

  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-sm">
          <TitleWithHint title={title} />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {lead ? <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{lead}</p> : null}
        <div className="flex flex-wrap gap-1.5">
          {display.map((item) => (
            <Badge key={item.key} variant="secondary" className="max-w-full truncate">
              {humanizeKeys ? humanizeLabel(item.key) : item.key}
            </Badge>
          ))}
          {items.length === 0 ? <span className="text-sm text-muted-foreground">No signals.</span> : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function ScoreComparisonCards({
  items,
  activeKey,
  onSelect,
}: {
  items: Array<{
    key: string
    label: string
    score: number
    rows?: number
    gapRows?: number
    usefulness?: number
  }>
  activeKey?: string
  onSelect?: (key: string) => void
}) {
  const lead = getHelpSummaryText("Coverage vs Gap Matrix")
  const sortedItems = [...items].sort((a, b) => b.score - a.score || (b.gapRows ?? 0) - (a.gapRows ?? 0))

  return (
    <div className="space-y-2">
      {lead ? <p className="text-xs leading-relaxed text-muted-foreground">{lead}</p> : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {sortedItems.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onSelect?.(item.key)}
          className={cn(
            "rounded-xl border bg-card/60 p-3 text-left transition hover:border-primary/40",
            activeKey === item.key && "border-primary bg-primary/5",
          )}
        >
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{item.score.toFixed(1)}</p>
          {item.gapRows !== undefined && item.rows !== undefined ? (
            <p className="mt-1 text-xs text-muted-foreground">High-priority gap share: {formatShare(item.gapRows, item.rows)}</p>
          ) : null}
        </button>
      ))}
      </div>
    </div>
  )
}

export function SupportVsGapMatrix({
  rows,
}: {
  rows: Array<{ label: string; coverage: number; gapPressure: number }>
}) {
  const lead = getHelpSummaryText("Coverage vs Gap Matrix")
  const sortedRows = [...rows].sort((a, b) => b.gapPressure - a.gapPressure || b.coverage - a.coverage)

  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-sm">
          <TitleWithHint title="Coverage vs Gap Matrix" />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {lead ? <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{lead}</p> : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Topic</TableHead>
              <TableHead><div className="flex items-center gap-1">Coverage <InfoHint text={getHelpTooltipText("Coverage vs Gap Matrix") ?? ""} /></div></TableHead>
              <TableHead><div className="flex items-center gap-1">Gap pressure <InfoHint text={getHelpTooltipText("Gap pressure") ?? ""} /></div></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.map((row) => (
              <TableRow key={row.label}>
                <TableCell>{humanizeLabel(row.label)}</TableCell>
                <TableCell>{row.coverage.toFixed(1)}</TableCell>
                <TableCell>{row.gapPressure.toFixed(1)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function SourceQualityBreakdown({
  sourceType,
  evidenceType,
  articleKind,
  populationDirectness,
  geographyDirectness,
}: {
  sourceType: FrequencyItem[]
  evidenceType?: FrequencyItem[]
  articleKind?: FrequencyItem[]
  populationDirectness?: FrequencyItem[]
  geographyDirectness?: FrequencyItem[]
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <FrequencyListWithChips title="Source type" items={sourceType} />
      {evidenceType ? <FrequencyListWithChips title="Evidence type" items={evidenceType} /> : null}
      {articleKind ? <FrequencyListWithChips title="Article kind" items={articleKind} /> : null}
      {populationDirectness ? <FrequencyListWithChips title="Population directness" items={populationDirectness} /> : null}
      {geographyDirectness ? <FrequencyListWithChips title="Geography directness" items={geographyDirectness} /> : null}
    </div>
  )
}

export function EvidenceRowList({
  title,
  rows,
  onOpen,
  rightCol = "bestStatForSlide",
}: {
  title: string
  rows: ArticleRow[]
  onOpen: (row: ArticleRow) => void
  rightCol?: "bestStatForSlide" | "gapSummary" | "kolQuestion"
}) {
  const lead = getHelpSummaryText(title)
  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">
            <TitleWithHint title={title} />
          </CardTitle>
          <div className="flex items-center gap-1">
            {rows.length > 0 && rows.length < 5 ? <Badge className="bg-amber-600 text-white">Low share subset</Badge> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4">
        {lead ? <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{lead}</p> : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><div className="flex items-center gap-1">Article <InfoHint text={getHelpTooltipText("Title") ?? ""} /></div></TableHead>
              <TableHead><div className="flex items-center gap-1">Takeaway <InfoHint text={getHelpTooltipText("One-line takeaway") ?? ""} /></div></TableHead>
              <TableHead><div className="flex items-center gap-1">Adolescent <InfoHint text={getHelpTooltipText("Average adolescent specificity") ?? ""} /></div></TableHead>
              <TableHead><div className="flex items-center gap-1">UK <InfoHint text={getHelpTooltipText("UK relevance") ?? ""} /></div></TableHead>
              <TableHead><div className="flex items-center gap-1">Detail <InfoHint text={getHelpTooltipText("Best use") ?? ""} /></div></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.rowId}>
                <TableCell className="max-w-[250px] whitespace-normal">
                  <div className="space-y-1">
                    <p className="line-clamp-2 text-sm font-medium">{row.title || "Untitled"}</p>
                    <RowQualityBadge row={row} />
                  </div>
                </TableCell>
                <TableCell className="max-w-[280px] whitespace-normal text-xs text-muted-foreground">{row.oneLineTakeaway}</TableCell>
                <TableCell>{row.adolescentSpecificityScore ?? "n/a"}</TableCell>
                <TableCell>{row.ukRelevanceScore ?? "n/a"}</TableCell>
                <TableCell className="max-w-[300px] whitespace-normal text-xs text-muted-foreground">
                  {rightCol === "bestStatForSlide" ? row.bestStatForSlide : rightCol === "gapSummary" ? row.gapSummary : row.kolQuestion}
                  <div className="mt-1">
                    <Button size="sm" variant="outline" onClick={() => onOpen(row)}>
                      Open detail
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {rows.length === 0 ? <p className="py-6 text-sm text-muted-foreground">No evidence rows for this selection.</p> : null}
      </CardContent>
    </Card>
  )
}

export function EvidenceSnippetStack({
  title,
  snippets,
  onOpen,
}: {
  title: string
  snippets: Array<{ text: string; count?: number; row?: ArticleRow }>
  onOpen?: (row: ArticleRow) => void
}) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-sm">
          <TitleWithHint title={title} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        {snippets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No snippets under this selection.</p>
        ) : (
          snippets.slice(0, 8).map((snippet) => (
            <div key={snippet.text} className="rounded-md border p-2">
              <p className="text-xs leading-relaxed">{snippet.text}</p>
              <div className="mt-1 flex items-center justify-between">
                {snippet.count !== undefined ? <span className="text-[11px] text-muted-foreground">Repeated signal across cohort</span> : <span />}
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (typeof navigator !== "undefined" && navigator.clipboard) {
                        navigator.clipboard.writeText(snippet.text).catch(() => null)
                      }
                    }}
                  >
                    Copy
                  </Button>
                  {snippet.row && onOpen ? (
                    <Button size="sm" variant="ghost" onClick={() => onOpen(snippet.row!)}>
                      Inspect
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export function GapQuestionPanel({
  title,
  questions,
}: {
  title: string
  questions: FrequencyItem[]
}) {
  const lead = getHelpSummaryText(title)
  const displayQuestions = [...questions].sort((a, b) => b.count - a.count || b.percentage - a.percentage).slice(0, 6)

  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-sm">
          <TitleWithHint title={title} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        {lead ? <p className="text-xs leading-relaxed text-muted-foreground">{lead}</p> : null}
        {displayQuestions.map((item) => (
          <div key={item.key} className="rounded-md border p-2">
            <p className="text-xs leading-relaxed">{item.key}</p>
          </div>
        ))}
        {questions.length === 0 ? <p className="text-sm text-muted-foreground">No question signals under current filters.</p> : null}
      </CardContent>
    </Card>
  )
}

export function CautionPanel({
  cautions,
  medLegal,
  lowDirectnessRows,
}: {
  cautions: FrequencyItem[]
  medLegal: FrequencyItem[]
  lowDirectnessRows?: number
}) {
  const sortedCautions = [...cautions].sort((a, b) => b.count - a.count || b.percentage - a.percentage).slice(0, 12)
  const sortedMedLegal = [...medLegal].sort((a, b) => b.count - a.count || b.percentage - a.percentage).slice(0, 12)

  return (
    <Card className="py-4 border-amber-500/40">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-sm">
          <TitleWithHint title="Cautions & Med/Legal Review" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        {lowDirectnessRows !== undefined ? (
          <Badge className="bg-amber-600 text-white">Proxy/context-heavy evidence requires conservative interpretation</Badge>
        ) : null}
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Message cautions</p>
          <div className="flex flex-wrap gap-1.5">
            {sortedCautions.map((item) => (
              <Badge key={item.key} variant="secondary">{humanizeLabel(item.key)}</Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Med/legal flags</p>
          <div className="flex flex-wrap gap-1.5">
            {sortedMedLegal.map((item) => (
              <Badge key={item.key} className="bg-red-700/80 text-white">{humanizeLabel(item.key)}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PillarDetailPanel({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>
}

export function TopicDetailPanel({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>
}

export function BarrierDetailPanel({ children }: { children: React.ReactNode }) {
  return <div className="space-y-3">{children}</div>
}

export function OpportunityThemeCard({
  title,
  metrics,
  onOpenExplorer,
  children,
}: {
  title: string
  metrics: Array<{ label: string; value: string | number }>
  onOpenExplorer?: string
  children: React.ReactNode
}) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm">{title}</CardTitle>
          <InfoHint text={getHelpTooltipText(title) ?? "Opportunity cards summarize support signals, caution context, and drilldown access for each opportunity theme."} />
          {onOpenExplorer ? (
            <Link href={`/evidence-explorer?eurOpportunityTags=${encodeURIComponent(onOpenExplorer)}`} className="text-xs text-primary hover:underline">
              Open in evidence explorer
            </Link>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-md border p-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{metric.label}</p>
              <p className="text-sm font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>
        {children}
      </CardContent>
    </Card>
  )
}

