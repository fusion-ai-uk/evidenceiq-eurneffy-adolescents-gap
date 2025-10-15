"use client"

import { PatientJourneyFunnel } from "./patient-journey-funnel"
import { ThemeWheel } from "./theme-wheel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"

type OverviewRow = { category: string; patient_volume: number; patient_sentiment: number }
type QuoteRow = { quote: string; sentiment: number }

function sentimentBadge(s: number) {
  if (s >= 0.2) return { label: "Positive", variant: "default" as const }
  if (s <= -0.1) return { label: "Negative", variant: "destructive" as const }
  return { label: "Neutral", variant: "secondary" as const }
}

export function PatientInsights() {
  const [overview, setOverview] = useState<OverviewRow[]>([])

  useEffect(() => {
    fetch("/api/audience/overview").then((r) => r.json()).then((d) => setOverview(d.rows || [])).catch(() => setOverview([]))
  }, [])

  const pillars = useMemo(() => {
    const wanted = new Set(["treatmentthemes_efficacy", "treatmentthemes_access", "treatmentthemes_qol"]) 
    const rows = overview.filter((r) => wanted.has(r.category))
    const total = rows.reduce((a, r) => a + (r.patient_volume || 0), 0) || 1
    return rows
      .map((r) => {
        const { label, variant } = sentimentBadge(r.patient_sentiment ?? 0)
        const pct = Math.max(0, Math.min(100, Math.round(((r.patient_volume || 0) / total) * 100)))
        const pretty = r.category.replace("treatmentthemes_", "").toUpperCase()
        return { theme: pretty, sentiment: label, variant, mentions: Math.round(r.patient_volume || 0), percentage: pct }
      })
  }, [overview])

  return (
    <div className="space-y-6">
      <PatientJourneyFunnel />

      <ThemeWheel />

      {/* Patient Voice Examples removed per request */}

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">Theme focus (Patient‑weighted)</CardTitle>
            <span className="text-xs text-muted-foreground">How patient attention splits across Efficacy, Access and QoL.</span>
          </div>
          <div className="text-xs text-muted-foreground">Bars show share of patient mentions across pillars (normalised to 100%). Badge indicates overall tone for the pillar.</div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pillars.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{p.theme}</span>
                    <Badge variant={p.variant}>{p.sentiment}</Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-muted-foreground" title="Volume of patient mentions in this pillar">{p.mentions} weighted mentions</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${p.percentage}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground" title="Share of patient volume across pillars">{p.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
