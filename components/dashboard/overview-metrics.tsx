"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, MessageSquare, Users, AlertTriangle, Target } from "lucide-react"

const metrics = [
  {
    title: "Total Mentions",
    value: "12,847",
    change: "+18%",
    trend: "up",
    icon: MessageSquare,
  },
  {
    title: "Active HCPs",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Patient Posts",
    value: "3,456",
    change: "+23%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Safety Signals",
    value: "47",
    change: "+8",
    trend: "up",
    icon: AlertTriangle,
  },
  {
    title: "Sentiment Score",
    value: "68%",
    change: "+5%",
    trend: "up",
    icon: Target,
  },
  {
    title: "Competitor Mentions",
    value: "8,923",
    change: "-3%",
    trend: "down",
    icon: MessageSquare,
  },
]

export function OverviewMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={index} className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                {metric.trend === "up" ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>{metric.change}</span>
                <span>vs last week</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
