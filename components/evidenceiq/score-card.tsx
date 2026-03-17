import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InfoHint } from "@/components/evidenceiq/analysis-components"
import { getHelpSummaryText, getHelpTooltipText } from "@/lib/evidence/help-text"

export function ScoreCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string | number
  detail?: string
}) {
  const summary = getHelpSummaryText(label)
  const tooltip = getHelpTooltipText(label)

  return (
    <Card className="py-4">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          {label}
          {tooltip ? <InfoHint text={tooltip} /> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pt-1">
        {summary ? <p className="mb-2 text-xs leading-relaxed text-muted-foreground">{summary}</p> : null}
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        {detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}
      </CardContent>
    </Card>
  )
}

