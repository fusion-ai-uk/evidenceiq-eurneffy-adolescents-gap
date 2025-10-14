"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react"

const insights = [
  {
    title: "Photosensitivity Mentions Rising",
    description: "23% increase in patient-reported photosensitivity rash vs baseline",
    trend: "up",
    priority: "high",
    icon: AlertTriangle,
  },
  {
    title: "Positive Efficacy Sentiment",
    description: "68% positive sentiment on durability data from CAR-T centres",
    trend: "up",
    priority: "positive",
    icon: CheckCircle2,
  },
  {
    title: "DGH Capacity Concerns",
    description: "72% of DGH discussions mention staffing/capacity constraints for bispecifics",
    trend: "up",
    priority: "medium",
    icon: TrendingUp,
  },
  {
    title: "NICE Implementation Barriers",
    description: "NHS Trust funding delays and IFR confusion mentioned 234 times",
    trend: "up",
    priority: "high",
    icon: AlertTriangle,
  },
  {
    title: "Sequencing Strategy Interest",
    description: "42% of CAR-T centre discussions focus on optimal treatment sequencing",
    trend: "stable",
    priority: "positive",
    icon: CheckCircle2,
  },
]

export function QuickInsights() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Quick Insights</CardTitle>
        <p className="text-sm text-muted-foreground">Key findings from the past 7 days</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const Icon = insight.icon
            return (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-colors ${
                  insight.priority === "high"
                    ? "border-orange-500/50 bg-orange-500/5"
                    : insight.priority === "positive"
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-border/50 bg-accent/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon
                    className={`h-5 w-5 mt-0.5 ${
                      insight.priority === "high"
                        ? "text-orange-500"
                        : insight.priority === "positive"
                          ? "text-green-500"
                          : "text-primary"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-foreground">{insight.title}</h4>
                      {insight.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-orange-500 shrink-0" />
                      ) : insight.trend === "down" ? (
                        <TrendingDown className="h-4 w-4 text-green-500 shrink-0" />
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
