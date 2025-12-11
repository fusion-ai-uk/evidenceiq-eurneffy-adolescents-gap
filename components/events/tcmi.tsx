"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Item = { label: string; shift: number; note: string }

const items: Item[] = [
  { label: "ADC + Bispecific combos", shift: 2, note: "LOTIS‑7 momentum; combo frontier" },
  { label: "CAR‑T", shift: 1, note: "Durability reassurance; consolidation talk" },
  { label: "Bispecifics", shift: 1, note: "High volume; durability questions in practice" },
  { label: "ADC Monotherapy", shift: 0, note: "Stable, expected performance" },
  { label: "Chemo/Traditional", shift: -2, note: "Low presence; deprioritized" },
]

export function TCMI() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Treatment Class Momentum Index (ASH 2025)</CardTitle>
        <p className="text-sm text-muted-foreground">Shift vs prior months (−2 to +2)</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((it) => (
          <div key={it.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground">{it.label}</span>
              <span className={it.shift>0?"text-emerald-400":it.shift<0?"text-rose-400":"text-muted-foreground"}>
                {it.shift>0?`▲${it.shift}`:it.shift<0?`▼${Math.abs(it.shift)}`:"► 0"}
              </span>
            </div>
            <div className="h-2 w-full rounded bg-muted/40 overflow-hidden ring-1 ring-border/50">
              <div
                className={`h-full ${it.shift>0?"bg-emerald-500/60":it.shift<0?"bg-rose-500/60":"bg-primary/20"}`}
                style={{ width: `${(Math.abs(it.shift)/2)*100}%` }}
              />
            </div>
            <div className="text-[11px] text-muted-foreground">{it.note}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}


