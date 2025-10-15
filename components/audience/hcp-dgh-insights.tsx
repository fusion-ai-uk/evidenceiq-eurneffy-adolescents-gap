"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HintIcon } from "@/components/ui/hint"

type Insight = { title: string; summary: string }

const dghInsights: Insight[] = [
  {
    title: "Operational lens dominates",
    summary:
      "Most DGH posts are about running services: capacity, staff training, step‑up checks and AE protocols. Less drug‑vs‑drug; more ‘can we do this safely here?’.",
  },
  {
    title: "CRS anxiety in local units",
    summary:
      "Early bispecific doses happen at hubs; DGH teams are cautious about fever/CRS steps and stocking tocilizumab. ADCs feel easier to run locally.",
  },
  {
    title: "Access/eligibility questions spike",
    summary:
      "Outside hubs the top questions are simple: who qualifies, where do we start, what happens next. Clear referral rules lift engagement.",
  },
  {
    title: "Near‑home care drives tone",
    summary:
      "Tone improves when care continues locally after the first cycles. Finite courses are liked for planning clinic load and for patient QoL.",
  },
  {
    title: "Sequencing is practical, not doctrinal",
    summary:
      "From a DGH view: Pola in 2L is common. In 3L the choice splits by feasibility—bispecific at the hub or ADC locally. Data that ADC use doesn’t block later CAR‑T reassures boards.",
  },
]

export function HCPDghInsights() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-medium">DGH insights</CardTitle>
          <HintIcon content={"What DGH discourse actually says: operational constraints, CRS readiness, eligibility clarity, near‑home care drivers, and pragmatic sequencing from district hospitals."} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {dghInsights.map((it, i) => (
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


