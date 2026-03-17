import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoHint } from "@/components/evidenceiq/analysis-components"
import { humanizeLabel } from "@/lib/evidence/display"
import { getHelpSummaryText, getHelpTooltipText } from "@/lib/evidence/help-text"
import type { FrequencyItem } from "@/lib/evidence/types"

export function TaxonomyFrequencyPanel({
  title,
  items,
  top = 8,
}: {
  title: string
  items: FrequencyItem[]
  top?: number
}) {
  const lead = getHelpSummaryText(title)
  const tooltip = getHelpTooltipText(title)
  const display = [...items].sort((a, b) => b.count - a.count || b.percentage - a.percentage).slice(0, top)

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
          <div className="text-sm text-muted-foreground">No tags in current selection.</div>
        ) : (
          <div className="space-y-2">
            {display.map((item) => (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs leading-tight text-muted-foreground">{humanizeLabel(item.key)}</p>
                  <p className="text-xs font-medium tabular-nums">{item.percentage.toFixed(0)}%</p>
                </div>
                <div className="h-1.5 rounded-full bg-muted">
                  <div className="h-1.5 rounded-full bg-primary" style={{ width: `${Math.min(item.percentage, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

