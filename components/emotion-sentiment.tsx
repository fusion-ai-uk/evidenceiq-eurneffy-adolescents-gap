"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const emotions = [
  { emotion: "Hope", count: 2847, percentage: 35, color: "bg-green-500" },
  { emotion: "Trust", count: 2156, percentage: 26, color: "bg-blue-500" },
  { emotion: "Fear", count: 1892, percentage: 23, color: "bg-orange-500" },
  { emotion: "Frustration", count: 1352, percentage: 16, color: "bg-red-500" },
]

export function EmotionSentiment() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Emotional Tone Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">Emotion tagging across patient and caregiver discussions</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {emotions.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{item.emotion}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{item.count} mentions</span>
                  <Badge variant="outline" className="text-xs">
                    {item.percentage}%
                  </Badge>
                </div>
              </div>
              <div className="h-2 rounded-full bg-accent overflow-hidden">
                <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-accent/30 border border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Insight:</strong> Hope and trust dominate HCP discussions, while fear
            and frustration are more prevalent in patient forums, particularly around treatment access and side effect
            management.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
