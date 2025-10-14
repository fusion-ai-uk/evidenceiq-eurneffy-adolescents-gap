"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const themes = [
  {
    theme: "Efficacy & Durability",
    mentions: 1847,
    sentiment: "Positive",
    change: "+12%",
  },
  {
    theme: "Photosensitivity Management",
    mentions: 1234,
    sentiment: "Neutral",
    change: "+23%",
  },
  {
    theme: "Treatment Sequencing",
    mentions: 987,
    sentiment: "Positive",
    change: "+8%",
  },
  {
    theme: "NHS Access & Funding",
    mentions: 876,
    sentiment: "Negative",
    change: "+15%",
  },
  {
    theme: "CAR-T vs Bispecific Comparison",
    mentions: 765,
    sentiment: "Neutral",
    change: "+5%",
  },
  {
    theme: "Real-world Evidence",
    mentions: 654,
    sentiment: "Positive",
    change: "+18%",
  },
]

export function TopThemes() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Top Themes</CardTitle>
        <p className="text-sm text-muted-foreground">Most discussed topics this week</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {themes.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-foreground">{item.theme}</span>
                  <Badge
                    variant={
                      item.sentiment === "Positive"
                        ? "default"
                        : item.sentiment === "Negative"
                          ? "destructive"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {item.sentiment}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{item.mentions} mentions</span>
                  <span className="text-xs text-green-500">{item.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
