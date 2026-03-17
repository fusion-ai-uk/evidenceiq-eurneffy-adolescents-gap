import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoHint } from "@/components/evidenceiq/analysis-components"
import { humanizeLabel } from "@/lib/evidence/display"
import { getHelpSummaryText, getHelpTooltipText } from "@/lib/evidence/help-text"
import type { FrequencyItem } from "@/lib/evidence/types"

export function ScoreDistributionPanel({
  title,
  items,
}: {
  title: string
  items: FrequencyItem[]
}) {
  const lead = getHelpSummaryText(title)
  const tooltip = getHelpTooltipText(title)
  const display = [...items].sort((a, b) => b.count - a.count || b.percentage - a.percentage).slice(0, 8)

  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-2">
        <CardTitle className="flex items-center gap-1 text-sm">
          {title}
          {tooltip ? <InfoHint text={tooltip} /> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        {lead ? <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{lead}</p> : null}
        {display.length === 0 ? (
          <p className="text-sm text-muted-foreground">No distribution data under current filters.</p>
        ) : (
          <div className="space-y-2">
            {display.map((item) => {
              const pct = item.percentage
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="truncate text-muted-foreground">{humanizeLabel(item.key)}</span>
                    <span className="font-medium tabular-nums">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className="h-1.5 rounded-full bg-primary/80" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

