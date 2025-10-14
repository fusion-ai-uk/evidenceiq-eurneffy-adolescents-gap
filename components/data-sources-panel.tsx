"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Calendar } from "lucide-react"

const dataSources = [
  {
    category: "Social Media",
    icon: Users,
    sources: ["Twitter/X", "LinkedIn", "Reddit (r/lymphoma)", "Facebook Groups"],
    coverage: "Public posts only",
  },
  {
    category: "Patient Communities",
    icon: Users,
    sources: ["Lymphoma Action UK", "Blood Cancer UK", "HealthUnlocked", "Macmillan Forums"],
    coverage: "Public forums",
  },
  {
    category: "HCP Platforms",
    icon: FileText,
    sources: ["Medscape", "Doximity", "ESMO Open", "Public medical blogs"],
    coverage: "Public discussions",
  },
  {
    category: "Congress & Events",
    icon: Calendar,
    sources: ["ASH abstracts", "EHA proceedings", "ICML presentations", "Public webcasts"],
    coverage: "Published materials",
  },
]

export function DataSourcesPanel() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Data Sources</CardTitle>
        <p className="text-sm text-muted-foreground">Passive collection from public-domain sources only</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dataSources.map((source, index) => {
            const Icon = source.icon
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{source.category}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    {source.coverage}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 ml-6">
                  {source.sources.map((s, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-accent/30 border border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Compliance:</strong> All data is aggregated and anonymized. No
            identifiable individuals. AEs flagged per PV SOP.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
