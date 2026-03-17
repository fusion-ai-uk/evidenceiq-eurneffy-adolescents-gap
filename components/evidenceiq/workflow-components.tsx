"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MultiSelect } from "@/components/evidenceiq/multi-select"
import { InfoHint } from "@/components/evidenceiq/analysis-components"
import type { CohortConfig } from "@/lib/evidence/workflow"
import type { FrequencyItem } from "@/lib/evidence/types"
import { humanizeLabel } from "@/lib/evidence/display"
import { getHelpSummaryText, getHelpTooltipText } from "@/lib/evidence/help-text"

function TitleWithHint({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span>{title}</span>
      <InfoHint text={hint ?? getHelpTooltipText(title) ?? "Plain-language definition unavailable for this module."} />
    </div>
  )
}

export function CohortBuilder({
  title,
  config,
  filterOptions,
  onChange,
  onApplyPreset,
}: {
  title: string
  config: CohortConfig
  filterOptions: { sourceTypes: string[]; barrierTags: string[]; settingTags: string[]; gapTags: string[]; opportunityTags: string[] }
  onChange: (next: CohortConfig) => void
  onApplyPreset: (preset: string) => void
}) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-sm">
          <TitleWithHint title={title} hint="Build and compare custom evidence cohorts. This tests how conclusions shift when criteria are tightened for directness, confidence, or specific themes." />
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 px-4">
        <Input value={config.name} onChange={(e) => onChange({ ...config, name: e.target.value })} placeholder="Cohort name" />
        <Select value={config.includeScope} onValueChange={(value) => onChange({ ...config, includeScope: value as CohortConfig["includeScope"] })}>
          <SelectTrigger className="w-full"><SelectValue placeholder="Row scope" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All rows</SelectItem>
            <SelectItem value="included">Included rows</SelectItem>
            <SelectItem value="excluded">Excluded rows</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant={config.analysisReadyOnly ? "default" : "outline"} onClick={() => onChange({ ...config, analysisReadyOnly: !config.analysisReadyOnly })}>Analysis ready only</Button>
          <Button size="sm" variant={config.adolescentDirectOnly ? "default" : "outline"} onClick={() => onChange({ ...config, adolescentDirectOnly: !config.adolescentDirectOnly })}>Adolescent direct only</Button>
          <Button size="sm" variant={config.ukDirectOnly ? "default" : "outline"} onClick={() => onChange({ ...config, ukDirectOnly: !config.ukDirectOnly })}>UK direct only</Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input type="number" value={config.minMessageUsefulness ?? ""} onChange={(e) => onChange({ ...config, minMessageUsefulness: e.target.value ? Number(e.target.value) : undefined })} placeholder="Min evidence signal" />
          <Input type="number" value={config.minGapUsefulness ?? ""} onChange={(e) => onChange({ ...config, minGapUsefulness: e.target.value ? Number(e.target.value) : undefined })} placeholder="Min gap score" />
        </div>
        <MultiSelect value={config.sourceTypes ?? []} options={filterOptions.sourceTypes} onChange={(next) => onChange({ ...config, sourceTypes: next })} placeholder="Source type" />
        <MultiSelect value={config.barrierTags ?? []} options={filterOptions.barrierTags} onChange={(next) => onChange({ ...config, barrierTags: next })} placeholder="Barrier tags" />
        <MultiSelect value={config.settingTags ?? []} options={filterOptions.settingTags} onChange={(next) => onChange({ ...config, settingTags: next })} placeholder="Setting tags" />
        <MultiSelect value={config.gapTags ?? []} options={filterOptions.gapTags} onChange={(next) => onChange({ ...config, gapTags: next })} placeholder="Gap tags" />
        <MultiSelect value={config.opportunityTags ?? []} options={filterOptions.opportunityTags} onChange={(next) => onChange({ ...config, opportunityTags: next })} placeholder="Opportunity tags" />
        <div className="flex flex-wrap gap-1">
          {[
            ["uk_direct_adolescent", "UK-direct adolescent"],
            ["high_message_value", "High message value"],
            ["high_gap_value", "High gap value"],
            ["dosing_focused", "Dosing-focused"],
            ["recognition_response_focused", "Recognition/response"],
            ["settings_risk_focused", "Settings-risk"],
            ["eurneffy_contextual_support", "EURneffy contextual"],
          ].map(([value, label]) => (
            <Button key={value} size="sm" variant="outline" onClick={() => onApplyPreset(value)}>{label}</Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function CohortComparisonSummary({
  title,
  items,
}: {
  title: string
  items: Array<{ label: string; a: number | string; b: number | string; delta?: number | string }>
}) {
  const lead = getHelpSummaryText(title)
  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-sm">
          <TitleWithHint title={title} hint="Side-by-side comparison of both cohorts across the same metrics to highlight where evidence-profile differences are material." />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {lead ? <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{lead}</p> : null}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead><div className="flex items-center gap-1">Cohort A <InfoHint text="This column shows the selected metric for cohort A only. Read it as the baseline profile before comparing directional differences against cohort B." /></div></TableHead>
              <TableHead><div className="flex items-center gap-1">Cohort B <InfoHint text="This column shows the selected metric for cohort B only. Compare this directly with cohort A to see where signals are concentrated or diluted under a different cohort definition." /></div></TableHead>
              <TableHead><div className="flex items-center gap-1">Delta <InfoHint text="Delta is the difference between cohort A and cohort B for the same metric. Use the sign and magnitude together: larger absolute values indicate the strongest split between the two cohorts." /></div></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.label}><TableCell>{item.label}</TableCell><TableCell>{item.a}</TableCell><TableCell>{item.b}</TableCell><TableCell>{item.delta ?? "-"}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function DeltaComparisonList({ title, items }: { title: string; items: Array<{ key: string; delta: number; a: number; b: number }> }) {
  const lead = getHelpSummaryText(title)
  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-sm">
          <TitleWithHint title={title} hint="Largest directional differences between cohorts for this dimension." />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 px-4">
        {lead ? <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{lead}</p> : null}
        {items.slice(0, 10).map((item) => (
          <div key={item.key} className="flex items-center justify-between text-xs">
            <span className="truncate">{humanizeLabel(item.key)}</span>
            <span className={item.delta >= 0 ? "text-emerald-600" : "text-rose-600"}>{item.delta >= 0 ? "+" : ""}{item.delta.toFixed(1)} pp</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function GapClusterCard({
  title,
  status,
  description,
  tooltip,
  items,
}: {
  title: string
  status: "urgent" | "foundational" | "secondary"
  description?: string
  tooltip?: string
  items: Array<{ label: string; value: string | number }>
}) {
  const lead = description ?? getHelpSummaryText(title)
  const hint =
    tooltip ??
    getHelpTooltipText(title) ??
    "This card groups related gaps into one theme and shows why that cluster is strategically important. Use the status badge and metrics together to decide where follow-up research should start first."

  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">{title}</CardTitle>
          <InfoHint text={hint} />
          <Badge variant={status === "urgent" ? "destructive" : status === "foundational" ? "default" : "secondary"}>{humanizeLabel(status)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-2 px-4">
        {lead ? <p className="text-xs leading-relaxed text-muted-foreground">{lead}</p> : null}
        {items.map((item) => (
          <div key={item.label} className="rounded-md border p-2">
            <p className="text-[11px] text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-xs font-medium leading-relaxed break-words">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function QuestionBankPanel({
  title,
  items,
  onPick,
}: {
  title: string
  items: FrequencyItem[]
  onPick?: (text: string) => void
}) {
  const lead = getHelpSummaryText(title)
  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-sm">
          <TitleWithHint title={title} hint="Prioritized open questions suggested by current evidence gaps. Use this as a starting point for KOL interviews or desk research briefs." />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        {lead ? <p className="text-xs leading-relaxed text-muted-foreground">{lead}</p> : null}
        {items.slice(0, 12).map((item) => (
          <button key={item.key} type="button" className="w-full rounded-md border p-2 text-left text-xs" onClick={() => onPick?.(item.key)}>
            <p className="line-clamp-3">{item.key}</p>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}

export function HandoffBlock({ title, children }: { title: string; children: React.ReactNode }) {
  const lead = getHelpSummaryText(title)
  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-sm">
          <TitleWithHint title={title} hint="Structured handoff block for downstream synthesis and strategy work." />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {lead ? <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{lead}</p> : null}
        {children}
      </CardContent>
    </Card>
  )
}

export function ManualPlaceholderCard({ title }: { title: string }) {
  return (
    <Card className="border-dashed py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-sm">
          <TitleWithHint title={title} hint="Intentional placeholder for analyst-written narrative or project-specific interpretation." />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4"><p className="text-xs text-muted-foreground">Manual input placeholder (intentionally empty).</p></CardContent>
    </Card>
  )
}

export function DataQualityBadge({ label }: { label: string }) {
  const variant = /stub|partial|recrawl|error/i.test(label) ? "destructive" : "secondary"
  return <Badge variant={variant}>{label}</Badge>
}

export function DiagnosticsSummary({ items }: { items: Array<{ label: string; value: string | number }> }) {
  return (
    <Card className="py-4">
      <CardContent className="grid gap-2 px-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className="rounded-md border p-2">
            <div className="flex items-center gap-1">
              <p className="text-[11px] text-muted-foreground">{i.label}</p>
              <InfoHint text={getHelpTooltipText(i.label) ?? "Diagnostic metric for capture quality and analysis reliability."} />
            </div>
            <p className="text-lg font-semibold">{i.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function ValidationShortlistTable({
  rows,
  onOpen,
}: {
  rows: Array<{ id: string; title: string; sourceUrl: string; sourceFile: string; textChars: number | null; qualityLabel: string; whyItMatters: string; recrawl: boolean }>
  onOpen?: (id: string) => void
}) {
  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="text-sm">
          <TitleWithHint title="Recrawl / Validation Shortlist" />
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead><div className="flex items-center gap-1">Source file <InfoHint text="This shows which import batch the row came from, so extraction issues can be traced to a specific file. It is useful for identifying whether capture problems cluster in one batch." /></div></TableHead>
              <TableHead><div className="flex items-center gap-1">Chars <InfoHint text="This is the length of captured source text used for enrichment. Very low values usually indicate partial capture, so weak strategic signals may reflect ingestion quality rather than a true evidence gap." /></div></TableHead>
              <TableHead><div className="flex items-center gap-1">Quality <InfoHint text={getHelpTooltipText("Quality") ?? ""} /></div></TableHead>
              <TableHead><div className="flex items-center gap-1">Recrawl <InfoHint text="This flag identifies rows that should be re-extracted before making strategic decisions. A marked row often has enough relevance to matter, but not enough captured text to trust the current interpretation." /></div></TableHead>
              <TableHead><div className="flex items-center gap-1">Why it matters <InfoHint text="This explains the practical risk of leaving the row unvalidated. Use it to prioritize remediation work that can materially change the gap narrative after recrawl." /></div></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} onClick={() => onOpen?.(row.id)} className="cursor-pointer">
                <TableCell className="max-w-[240px] whitespace-normal">{row.title}</TableCell>
                <TableCell>{row.sourceFile}</TableCell>
                <TableCell>{row.textChars ?? "n/a"}</TableCell>
                <TableCell><DataQualityBadge label={row.qualityLabel} /></TableCell>
                <TableCell>{row.recrawl ? "Yes" : "No"}</TableCell>
                <TableCell className="max-w-[320px] whitespace-normal text-xs text-muted-foreground">{row.whyItMatters}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function QuickTriageChips({ chips, active, onChange }: { chips: string[]; active: string[]; onChange: (next: string[]) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>Quick triage filters</span>
        <InfoHint text="These chips provide quick prebuilt slices of the evidence set for triage. Combining chips narrows the cohort to focused decision contexts without manually rebuilding filters from scratch." />
      </div>
      <div className="flex flex-wrap gap-1">
      {chips.map((chip) => {
        const on = active.includes(chip)
        return (
          <Button
            key={chip}
            size="sm"
            variant={on ? "default" : "outline"}
            title={getHelpTooltipText(chip) ?? chip}
            onClick={() => onChange(on ? active.filter((entry) => entry !== chip) : [...active, chip])}
          >
            {chip}
          </Button>
        )
      })}
      </div>
    </div>
  )
}

export function SmartSortControl({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>Smart sort</span>
        <InfoHint text="Smart sort applies a predefined ranking lens to the current rows, such as gap concentration or quality risk. Use it to rapidly change analytical perspective before opening row-level detail." />
      </div>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[260px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="highest_usefulness" title={getHelpTooltipText("highest_usefulness")}>Strongest evidence signal</SelectItem>
          <SelectItem value="highest_gap_value" title={getHelpTooltipText("highest_gap_value")}>Highest gap value</SelectItem>
          <SelectItem value="highest_eur_relevance" title={getHelpTooltipText("highest_eur_relevance")}>Highest EURneffy relevance</SelectItem>
          <SelectItem value="highest_confidence" title={getHelpTooltipText("highest_confidence")}>Highest confidence</SelectItem>
          <SelectItem value="most_adolescent_direct" title={getHelpTooltipText("most_adolescent_direct")}>Most adolescent-direct</SelectItem>
          <SelectItem value="most_uk_direct" title={getHelpTooltipText("most_uk_direct")}>Most UK-direct</SelectItem>
          <SelectItem value="most_caution_heavy" title={getHelpTooltipText("most_caution_heavy")}>Most caution-heavy</SelectItem>
          <SelectItem value="most_likely_ingestion_problem" title={getHelpTooltipText("most_likely_ingestion_problem")}>Most likely ingestion problem</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

export function ExtractPreviewInline({ text }: { text: string | null }) {
  if (!text) return null
  return <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{text}</p>
}

