"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { headlineMetrics } from "@/lib/content-plan"

export function HeadlineMetrics() {
  const totals = headlineMetrics.totalTopics
  const split = headlineMetrics.audienceSplit
  const s = headlineMetrics.sentimentRanges

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Headline Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Total Mentions (topics)</div>
            <div className="grid grid-cols-3 gap-3">
              <MetricPill label="Zynlonta" value={String(totals.zynlonta)} color="text-blue-400" />
              <MetricPill label="Epcoritamab" value={String(totals.epcoritamab)} color="text-rose-400" />
              <MetricPill label="Glofitamab" value={String(totals.glofitamab)} color="text-amber-400" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Audience Split (avg score)</div>
            <div className="grid grid-cols-3 gap-3">
              <MetricPill label="HCP" value={split.hcp.toFixed(1)} color="text-sky-400" />
              <MetricPill label="Patient" value={split.patient.toFixed(1)} color="text-emerald-400" />
              <MetricPill label="Caregiver" value={split.caregiver.toFixed(1)} color="text-violet-400" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">Sentiment Ranges</div>
            <div className="grid grid-cols-3 gap-3">
              <RangePill label="Zynlonta" range={s.zynlonta} color="text-blue-400" />
              <RangePill label="Epcoritamab" range={s.epcoritamab} color="text-rose-400" />
              <RangePill label="Glofitamab" range={s.glofitamab} color="text-amber-400" />
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-accent/40 border border-border/50">
          <p className="text-sm text-muted-foreground">Analysis Insight</p>
          <p className="text-foreground text-sm mt-1">{headlineMetrics.insight}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 bg-accent/30 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-lg font-semibold ${color}`}>{value}</span>
    </div>
  )
}

function RangePill({ label, range, color }: { label: string; range: { min: number; max: number }; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/50 bg-accent/30 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="text-right">
        <Badge variant="outline" className={`border-border ${color}`}>
          {range.min.toFixed(2)} – {range.max.toFixed(2)}
        </Badge>
      </div>
    </div>
  )
}


