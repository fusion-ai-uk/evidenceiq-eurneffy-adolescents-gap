"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const zones = [
  { topic: "CAR‑T PR consolidation", intensity: 3, why: "Trial readouts + unmet need" },
  { topic: "BsAb real‑world durability", intensity: 3, why: "US multicenter PFS/OS data" },
  { topic: "Fixed‑duration economics", intensity: 2, why: "Glofitamab cost talk" },
  { topic: "ADC + bsAb synergy", intensity: 2, why: "LOTIS‑7 update + KOLs" },
  { topic: "CD20 loss crisis", intensity: 2, why: "88% loss reports at progression" },
  { topic: "Operational stress (centers)", intensity: 1, why: "Staffing/monitoring load" },
]

export function HotZones() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Conversation Hot Zones</CardTitle>
        <p className="text-sm text-muted-foreground">High‑intensity topics at ASH 2025</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {zones.map((z) => (
            <div
              key={z.topic}
              className={`rounded-lg border border-border/50 p-3 ${z.intensity===3?"bg-red-500/10 ring-1 ring-red-400/30 shadow-[0_0_0_1px_rgba(248,113,113,0.15),0_6px_24px_rgba(248,113,113,0.15)]":z.intensity===2?"bg-amber-500/10 ring-1 ring-amber-400/30":"bg-primary/5 ring-1 ring-primary/20"}`}
            >
              <div className="text-sm font-medium">{z.topic}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{z.why}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


