import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

const themes = [
  { name: "Durability & Long-term Outcomes", mentions: 1247, trend: 23, isUp: true },
  { name: "CRS & ICANS Management", mentions: 892, trend: 15, isUp: true },
  { name: "Photosensitivity Rash", mentions: 634, trend: 8, isUp: true },
  { name: "3L Treatment Sequencing", mentions: 521, trend: -5, isUp: false },
  { name: "NHS Capacity Constraints", mentions: 487, trend: 12, isUp: true },
  { name: "Patient QoL Trade-offs", mentions: 423, trend: 7, isUp: true },
]

export function TrendingThemes() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Top Trending Themes</CardTitle>
        <p className="text-sm text-muted-foreground">Most discussed topics in the last 30 days</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {themes.map((theme, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{theme.name}</span>
                  {theme.isUp ? (
                    <TrendingUp className="h-3 w-3 text-chart-2" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{theme.mentions} mentions</p>
              </div>
              <Badge variant={theme.isUp ? "default" : "secondary"} className="ml-4">
                {theme.isUp ? "+" : ""}
                {theme.trend}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
