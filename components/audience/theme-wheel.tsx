"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const themes = [
  {
    theme: "Involvement in Decisions",
    mentions: 487,
    sentiment: "Negative",
    angle: 0,
    color: "hsl(var(--destructive))",
  },
  {
    theme: "Affordability Confusion",
    mentions: 412,
    sentiment: "Neutral",
    angle: 72,
    color: "hsl(var(--muted-foreground))",
  },
  { theme: "QoL Trade-offs", mentions: 389, sentiment: "Mixed", angle: 144, color: "hsl(var(--chart-3))" },
  {
    theme: "Side Effect Coping",
    mentions: 356,
    sentiment: "Neutral",
    angle: 216,
    color: "hsl(var(--muted-foreground))",
  },
  { theme: "Treatment Access", mentions: 298, sentiment: "Negative", angle: 288, color: "hsl(var(--destructive))" },
]

export function ThemeWheel() {
  const total = themes.reduce((sum, t) => sum + t.mentions, 0)

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Patient Theme Wheel</CardTitle>
        <p className="text-sm text-muted-foreground">Distribution of key patient discussion topics</p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Visual Wheel */}
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {themes.map((item, index) => {
                  const percentage = (item.mentions / total) * 100
                  const startAngle = themes.slice(0, index).reduce((sum, t) => sum + (t.mentions / total) * 360, 0)
                  const endAngle = startAngle + (percentage / 100) * 360

                  const startRad = (startAngle - 90) * (Math.PI / 180)
                  const endRad = (endAngle - 90) * (Math.PI / 180)

                  const x1 = 100 + 80 * Math.cos(startRad)
                  const y1 = 100 + 80 * Math.sin(startRad)
                  const x2 = 100 + 80 * Math.cos(endRad)
                  const y2 = 100 + 80 * Math.sin(endRad)

                  const largeArc = percentage > 50 ? 1 : 0

                  return (
                    <path
                      key={index}
                      d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                      fill={item.color}
                      opacity={0.7}
                      className="hover:opacity-100 transition-opacity cursor-pointer"
                    />
                  )
                })}
                <circle cx="100" cy="100" r="40" fill="hsl(var(--background))" />
                <text x="100" y="95" textAnchor="middle" className="text-xs fill-foreground font-medium">
                  Total
                </text>
                <text x="100" y="110" textAnchor="middle" className="text-lg fill-foreground font-bold">
                  {total}
                </text>
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {themes.map((item, index) => {
              const percentage = ((item.mentions / total) * 100).toFixed(1)
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-foreground">{item.theme}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{percentage}%</span>
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
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
