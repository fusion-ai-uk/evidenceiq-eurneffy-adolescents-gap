"use client"

import { Card, CardContent } from "@/components/ui/card"

const kpis = [
  { k: "Share of Voice", v: "4.9%" },
  { k: "Median Engagement", v: "4 / post" },
  { k: "Clinical Positivity Tone", v: "62%" },
  { k: "Investor Negativity", v: "38%" },
  { k: "Unique KOLs Engaged", v: "27" },
  { k: "Session Mentions (Lonca)", v: "12" },
]

export function MicroKPIs() {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {kpis.map((m) => (
            <div key={m.k} className="rounded-lg border border-border/50 bg-card/60 p-3">
              <div className="text-[11px] text-muted-foreground">{m.k}</div>
              <div className="text-sm font-semibold mt-1">{m.v}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


