"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const funnelData = [
  {
    stage: "Symptom Search & Diagnosis",
    patients: 892,
    percentage: 100,
    sentiment: "Anxious",
    keyTopics: ["What is DLBCL?", "Symptoms explained", "Prognosis questions"],
    dropoffReason: null,
  },
  {
    stage: "Treatment Decision & Initiation",
    patients: 734,
    percentage: 82,
    sentiment: "Hopeful",
    keyTopics: ["Treatment options", "Side effects", "Doctor recommendations"],
    dropoffReason: "18% not included in treatment decisions",
  },
  {
    stage: "Active Treatment & Adherence",
    patients: 567,
    percentage: 64,
    sentiment: "Mixed",
    keyTopics: ["Managing side effects", "QoL concerns", "Coping strategies"],
    dropoffReason: "18% stopped due to AEs or access issues",
  },
  {
    stage: "Treatment Switch or Stop",
    patients: 234,
    percentage: 26,
    sentiment: "Frustrated",
    keyTopics: ["Why switching?", "Alternative options", "Disease progression"],
    dropoffReason: "38% progressed or switched therapies",
  },
]

export function PatientJourneyFunnel() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Patient Journey Funnel</CardTitle>
        <p className="text-sm text-muted-foreground">
          Tracking patient discourse volume and sentiment across treatment stages
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {funnelData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{item.stage}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.patients} mentions ({item.percentage}%)
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    item.sentiment === "Hopeful"
                      ? "default"
                      : item.sentiment === "Frustrated"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {item.sentiment}
                </Badge>
              </div>

              {/* Funnel Bar */}
              <div className="ml-11">
                <div className="relative h-16 bg-secondary/30 rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center text-xs font-medium text-primary-foreground"
                    style={{ width: `${item.percentage}%` }}
                  >
                    {item.percentage}%
                  </div>
                </div>
              </div>

              {/* Key Topics */}
              <div className="ml-11 flex flex-wrap gap-2">
                {item.keyTopics.map((topic, idx) => (
                  <span key={idx} className="text-xs px-2 py-1 rounded-md bg-accent text-accent-foreground">
                    {topic}
                  </span>
                ))}
              </div>

      {/* Dropoff Reason removed per request */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
