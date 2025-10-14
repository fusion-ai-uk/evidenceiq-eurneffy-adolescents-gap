"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

const trials = [
  {
    name: "LOTIS-2",
    drug: "Zynlonta",
    phase: "Phase 2",
    mentions: 2134,
    sentiment: "positive",
    keyFindings: ["ORR 48.3%", "Median DOR 13.4 months", "Manageable safety profile"],
  },
  {
    name: "EPCORE NHL-1",
    drug: "Epcoritamab",
    phase: "Phase 1/2",
    mentions: 1892,
    sentiment: "positive",
    keyFindings: ["ORR 63%", "CR 39%", "CRS manageable"],
  },
  {
    name: "NP30179",
    drug: "Glofitamab",
    phase: "Phase 1/2",
    mentions: 1567,
    sentiment: "positive",
    keyFindings: ["ORR 52%", "CR 39%", "Step-up dosing reduces CRS"],
  },
  {
    name: "ZUMA-1",
    drug: "Axi-cel (CAR-T)",
    phase: "Phase 2",
    mentions: 1234,
    sentiment: "positive",
    keyFindings: ["Long-term durability", "5-year OS 43%", "High toxicity"],
  },
  {
    name: "TRANSCEND NHL 001",
    drug: "Liso-cel (CAR-T)",
    phase: "Phase 1",
    mentions: 987,
    sentiment: "positive",
    keyFindings: ["ORR 73%", "CR 53%", "Lower CRS vs other CAR-T"],
  },
]

export function TrialReferences() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Clinical Trial References</CardTitle>
        <p className="text-sm text-muted-foreground">Most frequently cited trials in HCP discussions</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {trials.map((trial, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-border/50 bg-accent/30 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground">{trial.name}</h4>
                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                </div>
                <Badge variant="outline" className="text-xs">
                  {trial.mentions}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs">
                  {trial.drug}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {trial.phase}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    trial.sentiment === "positive"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-orange-500/10 text-orange-500"
                  }`}
                >
                  {trial.sentiment}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {trial.keyFindings.map((finding, i) => (
                  <span key={i} className="text-xs text-muted-foreground">
                    {finding}
                    {i < trial.keyFindings.length - 1 && " •"}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
