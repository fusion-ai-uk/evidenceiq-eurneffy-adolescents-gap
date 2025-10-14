"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HintIcon } from "@/components/ui/hint"
import { TrendingUp, AlertCircle, Info } from "lucide-react"
import { useEffect, useState } from "react"

type AlertRow = {
  category: string
  current_volume: number
  baseline_volume: number
  pct_change: number
  sentiment_current?: number
  sentiment_baseline?: number
  sentiment_delta?: number
  leader_audience?: 'hcp' | 'patient' | 'caregiver' | 'payer' | 'mixed'
  drivers?: string[]
}

export function BaselineAlerts() {
  const [rows, setRows] = useState<AlertRow[]>([])

  useEffect(() => {
    fetch("/api/timeseries/alerts?minBaseline=10&limit=6")
      .then((r) => r.json())
      .then((d) => setRows(d.rows || []))
      .catch(() => setRows([]))
  }, [])

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Above-Baseline Alerts</CardTitle>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            Highlights topics whose latest complete month is materially different from the recent run-rate.
          </p>
          <p className="flex items-start gap-2 text-xs">
            <HintIcon content={"Alerts fire when current month deviates ≥±15% vs the previous 6‑month average with baseline ≥10 mentions. A practical signal‑over‑noise check."} />
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rows.map((r, index) => {
            const severity = r.pct_change >= 30 ? "high" : "medium"
            const direction = r.pct_change >= 0 ? "up" : "down"
            const absChange = Math.round(Math.abs(r.pct_change))
            const delta = r.current_volume - r.baseline_volume
            const deltaDisplay = `${delta > 0 ? "+" : ""}${Math.round(delta)}`
            const tone = r.sentiment_delta ?? 0
            const toneText = tone > 0.05 ? 'improving tone' : tone < -0.05 ? 'worsening tone' : 'steady tone'
            return (
              <div key={index} className="p-3 rounded-lg border border-border/50 bg-accent/30 hover:bg-accent/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{formatCategory(r.category)}</span>
                      {severity === "high" && <AlertCircle className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Baseline (6‑mo avg): {Math.round(r.baseline_volume)}</span>
                      <span>→ Current: {r.current_volume}</span>
                      <span>Δ: {deltaDisplay}</span>
                      {typeof r.sentiment_current === 'number' && typeof r.sentiment_baseline === 'number' && (
                        <span>Sentiment: {r.sentiment_current?.toFixed(2)} ({toneText})</span>
                      )}
                      {r.leader_audience && r.leader_audience !== 'mixed' && (
                        <span>Driver: {r.leader_audience}</span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground/90">
                      {direction === "up" ? (
                        <span>
                          Rising interest — {r.leader_audience && r.leader_audience !== 'mixed' ? `${r.leader_audience.toUpperCase()}-led; ` : ''}
                          {r.drivers && r.drivers.length ? `drivers: ${r.drivers.slice(0, 3).join(', ')}. ` : ''}
                          {tone < -0.05 ? 'Tone deteriorating — address objections.' : 'Lean in with context; watch safety/access threads.'}
                        </span>
                      ) : (
                        <span>
                          Cooling off — consider re‑seeding with proof points; {tone < -0.05 ? 'tone also softening.' : 'tone steady.'}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant={severity === "high" ? "destructive" : "secondary"} className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {r.pct_change > 0 ? "+" : ""}
                    {absChange}%
                  </Badge>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

function formatCategory(raw: string): string {
  const s = String(raw || '').trim().toLowerCase()
  const titleize = (txt: string) => txt.split(/\s+/).map(w => {
    if (["qol","crs","icans","nhs","uk","ta947"].includes(w)) return w.toUpperCase()
    if (w === 'cart' || w === 'car-t' || (w === 'car' && txt.includes('car t'))) return 'CAR-T'
    return w.charAt(0).toUpperCase() + w.slice(1)
  }).join(' ')

  if (s.startsWith('treatmentthemes')) {
    const rest = s.replace(/^treatmentthemes[_:-]?/, '').replace(/[_-]+/g, ' ').trim()
    const nice = titleize(rest.replace(/qol/,'QoL'))
    return `Treatment Themes: ${nice}`
  }

  // Drug and common keys title-cased
  const generic = titleize(s.replace(/[_-]+/g, ' '))
  return generic
}
