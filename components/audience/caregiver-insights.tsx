"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Clock, DollarSign, AlertCircle } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type OverviewRow = { category: string; caregiver_volume: number; caregiver_sentiment: number }
type QuoteRow = { quote: string; sentiment: number }

function sentimentBadge(s: number) {
  if (s >= 0.2) return { label: "Positive", variant: "default" as const }
  if (s <= -0.1) return { label: "Negative", variant: "destructive" as const }
  return { label: "Neutral", variant: "secondary" as const }
}

export function CaregiverInsights() {
  const [overview, setOverview] = useState<OverviewRow[]>([])

  useEffect(() => {
    fetch("/api/audience/overview").then((r) => r.json()).then((d) => setOverview(d.rows || [])).catch(() => setOverview([]))
  }, [])

  const pillars = useMemo(() => {
    const wanted = new Set(["treatmentthemes_efficacy", "treatmentthemes_access", "treatmentthemes_qol"]) 
    const rows = overview.filter((r) => wanted.has(r.category))
    const total = rows.reduce((a, r) => a + (r.caregiver_volume || 0), 0) || 1
    return rows
      .map((r) => {
        const { label, variant } = sentimentBadge(r.caregiver_sentiment ?? 0)
        const pct = Math.max(0, Math.min(100, Math.round(((r.caregiver_volume || 0) / total) * 100)))
        const pretty = r.category.replace("treatmentthemes_", "").toUpperCase()
        return { theme: pretty, sentiment: label, variant, mentions: Math.round(r.caregiver_volume || 0), percentage: pct }
      })
  }, [overview])

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">Caregiver Burden Themes</CardTitle>
          <p className="text-sm text-muted-foreground">Key concerns and challenges expressed by caregivers</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {pillars.map((p, index) => {
              const Icon = index % 2 === 0 ? Heart : Clock
              return (
                <div key={index} className="p-4 rounded-lg bg-accent/50 border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground">{p.theme}</h4>
                        <Badge variant={p.variant} className="text-xs">{p.sentiment}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Mentions reflect soft caregiver weighting.</p>
                      <p className="text-xs text-muted-foreground">{p.mentions} weighted mentions</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Caregiver Voice Examples removed per request */}

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">Lifestyle Compatibility</CardTitle>
          <p className="text-sm text-muted-foreground">How treatment impacts daily life for caregivers</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <span className="text-sm text-foreground">Work-life balance disruption</span>
              <Badge variant="destructive">High Impact</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <span className="text-sm text-foreground">Social isolation</span>
              <Badge variant="destructive">High Impact</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <span className="text-sm text-foreground">Sleep disruption</span>
              <Badge variant="secondary">Medium Impact</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <span className="text-sm text-foreground">Travel burden for appointments</span>
              <Badge variant="secondary">Medium Impact</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
