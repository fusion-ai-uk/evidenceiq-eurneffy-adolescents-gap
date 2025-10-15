"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HintIcon } from "@/components/ui/hint"

type Insight = { title: string; summary: string }

const insights: Insight[] = [
  {
    title: "CAR‑T sets the durability benchmark",
    summary:
      "In discourse, CAR‑T still anchors what ‘lasting benefit’ means. Bispecifics are closing the gap on complete, durable remissions, so readers compare new data back to the CAR‑T frame rather than head‑to‑head claims.",
  },
  {
    title: "Access gap drives alternatives",
    summary:
      "Across major EU markets, 29–71% of medically eligible patients never receive CAR‑T. This capacity gap fuels interest in off‑the‑shelf options (bispecifics, ADCs) that can start quickly and closer to home.",
  },
  {
    title: "Hub‑and‑spoke behaviour",
    summary:
      "Early cycles of bispecifics cluster at CAR‑T hubs (CRS readiness), then hand‑off to local units by cycle 3. Community posts show more ‘CRS anxiety’; ADCs read as easier to run in DGH settings.",
  },
  {
    title: "Sequencing pattern (UK lens)",
    summary:
      "Typical path: R‑CHOP → Pola‑based 2L → 3L immunotherapy (glofitamab/epco). Zynlonta appears when CRS risk, speed, or logistics dominate—or post‑CAR‑T. Data suggest Zynlonta does not preclude later CAR‑T.",
  },
  {
    title: "What lands with patients",
    summary:
      "Fixed duration and care close to home score highly (glofitamab narrative). Tone shifts positive when posts show continuity‑of‑care and QoL regained, not just response rates.",
  },
]

export function HCPCarTCentres() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">CAR‑T centre insights</CardTitle>
          <HintIcon content={"Key takeaways from UK/EU discourse about how CAR‑T hubs shape practice: access gaps, hub‑and‑spoke behaviours, sequencing with bispecifics/ADCs, and what resonates with patients."} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {insights.map((it, i) => (
            <div key={i} className="p-3 rounded-lg bg-accent/40">
              <div className="text-sm font-medium text-foreground">{it.title}</div>
              <div className="mt-1 text-xs text-muted-foreground leading-5">{it.summary}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


