"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAnalysisContext } from "@/components/evidenceiq/analysis-context"
import { ScoreCard } from "@/components/evidenceiq/score-card"
import { TaxonomyFrequencyPanel } from "@/components/evidenceiq/taxonomy-frequency-panel"
import { ScoreDistributionPanel } from "@/components/evidenceiq/score-distribution-panel"
import { AnalysisSectionHeader, InfoHint } from "@/components/evidenceiq/analysis-components"
import { formatShare, humanizeLabel } from "@/lib/evidence/display"
import { getHelpSummaryText, getHelpTooltipText } from "@/lib/evidence/help-text"

function ScoreBars({ title, values }: { title: string; values: Record<string, number> }) {
  const lead = getHelpSummaryText(title)
  const tooltip = getHelpTooltipText(title)
  const entries = Object.entries(values).sort((a, b) => b[1] - a[1])
  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="flex items-center gap-1 text-sm">
          {title}
          {tooltip ? <InfoHint text={tooltip} /> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        {lead ? <p className="text-xs leading-relaxed text-muted-foreground">{lead}</p> : null}
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No score data in current selection.</p>
        ) : (
          entries.map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{humanizeLabel(key)}</span>
                <span className="font-medium tabular-nums">{value.toFixed(1)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted">
                <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default function OverviewPage() {
  const { isLoading, error, filteredRows, summaries } = useAnalysisContext()

  if (isLoading) return <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Loading evidence datasets...</div>
  if (error) return <div className="rounded-lg border border-destructive/40 p-6 text-sm text-destructive">{error}</div>

  const { overview, pillarScores, topicScores, gapSignals } = summaries
  const total = filteredRows.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <AnalysisSectionHeader title="Overview" description="EURneffy adolescent anaphylaxis evidence fit and gap snapshot." />
      </div>

      <section id="overview-kpis" className="scroll-mt-24 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ScoreCard label="High-priority gap share" value={formatShare(overview.highGapUsefulnessRows, total)} />
        <ScoreCard label="Critical gap share" value={formatShare(filteredRows.filter((row) => row.gapPriority.toLowerCase() === "critical").length, total)} />
        <ScoreCard label="KOL input share" value={formatShare(overview.needsKolInputRows, total)} />
        <ScoreCard label="No adolescent breakout share" value={formatShare(gapSignals.noAdolescentBreakout, total)} />
        <ScoreCard label="No UK breakout share" value={formatShare(gapSignals.noUkBreakout, total)} />
        <ScoreCard label="No real-world error data share" value={formatShare(gapSignals.noRealWorldErrorData, total)} />
        <ScoreCard label="No setting-specific data share" value={formatShare(gapSignals.noSettingSpecificData, total)} />
        <ScoreCard label="No equity subgroup data share" value={formatShare(gapSignals.noEquitySubgroupData, total)} />
      </section>

      <section id="overview-scores" className="scroll-mt-24 grid gap-3 lg:grid-cols-2">
        <ScoreBars title="Pillar score averages" values={pillarScores} />
        <ScoreBars title="Topic score averages" values={topicScores} />
      </section>

      <section id="overview-distributions" className="scroll-mt-24 grid gap-3 lg:grid-cols-2">
        <ScoreDistributionPanel title="Source type distribution" items={summaries.sourceTypeFrequency} />
        <ScoreDistributionPanel title="Evidence type distribution" items={summaries.evidenceTypeFrequency} />
      </section>

      <section id="overview-taxonomy" className="scroll-mt-24 grid gap-3 lg:grid-cols-2">
        <TaxonomyFrequencyPanel title="Top data gap tags" items={gapSignals.topGapTags} />
        <TaxonomyFrequencyPanel title="Top barrier tags" items={summaries.barrierFrequency} />
        <TaxonomyFrequencyPanel title="Top setting tags" items={summaries.settingFrequency} />
        <TaxonomyFrequencyPanel title="Top EURneffy opportunity tags" items={summaries.eurOpportunityFrequency} />
      </section>
    </div>
  )
}

