"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

const discussions = [
  {
    topic: "NICE TA947 implementation barriers",
    mentions: 234,
    trend: "up",
    sentiment: "negative",
    keyPoints: ["Funding delays at trust level", "Unclear eligibility criteria", "IFR process confusion"],
  },
  {
    topic: "CAR-T vs bispecific cost comparisons",
    mentions: 189,
    trend: "up",
    sentiment: "neutral",
    keyPoints: ["Bispecifics seen as cost-effective", "Inpatient vs outpatient costs", "Long-term value debate"],
  },
  {
    topic: "NHS capacity constraints for bispecifics",
    mentions: 156,
    trend: "up",
    sentiment: "negative",
    keyPoints: ["DGH staffing shortages", "Monitoring requirements", "CRS management capacity"],
  },
  {
    topic: "Zynlonta affordability for patients",
    mentions: 98,
    trend: "down",
    sentiment: "positive",
    keyPoints: ["NHS coverage improving", "Less concern post-NICE", "Outpatient convenience valued"],
  },
]

export function PayerCostDiscussions() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Payer & Cost Discussions</CardTitle>
        <p className="text-sm text-muted-foreground">NHS Trust and affordability conversations</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {discussions.map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-lg border border-border/50 bg-accent/30 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm font-medium text-foreground">{item.topic}</h4>
                <div className="flex items-center gap-2">
                  {item.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-green-500" />
                  )}
                  <Badge variant="outline" className="text-xs">
                    {item.mentions}
                  </Badge>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`text-xs mb-2 ${
                  item.sentiment === "positive"
                    ? "bg-green-500/10 text-green-500"
                    : item.sentiment === "negative"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-blue-500/10 text-blue-500"
                }`}
              >
                {item.sentiment}
              </Badge>
              <div className="space-y-1">
                {item.keyPoints.map((point, i) => (
                  <p key={i} className="text-xs text-muted-foreground">
                    • {point}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
