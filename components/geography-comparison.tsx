import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown } from "lucide-react"

const geographyData = [
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    mentions: 8247,
    sentiment: { positive: 42, neutral: 38, negative: 20 },
    topThemes: ["Photosensitivity concerns", "NICE approval", "3L positioning"],
    trend: 12,
  },
  {
    country: "Germany",
    flag: "🇩🇪",
    mentions: 6892,
    sentiment: { positive: 48, neutral: 35, negative: 17 },
    topThemes: ["Reimbursement clarity", "Efficacy data", "Patient access"],
    trend: 8,
  },
  {
    country: "Italy",
    flag: "🇮🇹",
    mentions: 5634,
    sentiment: { positive: 45, neutral: 36, negative: 19 },
    topThemes: ["Regional access variation", "QoL discussions", "Safety profile"],
    trend: -3,
  },
]

export function GeographyComparison() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Geography Comparison</CardTitle>
        <p className="text-sm text-muted-foreground">Zynlonta discourse across UK, Germany, and Italy (24 months)</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {geographyData.map((geo, index) => (
            <div key={index} className="p-4 rounded-lg bg-accent/50 border border-border/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{geo.flag}</span>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{geo.country}</h4>
                    <p className="text-xs text-muted-foreground">{geo.mentions.toLocaleString()} mentions</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {geo.trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-chart-2" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <span className={`text-sm font-medium ${geo.trend > 0 ? "text-chart-2" : "text-destructive"}`}>
                    {geo.trend > 0 ? "+" : ""}
                    {geo.trend}%
                  </span>
                </div>
              </div>

              {/* Sentiment Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Sentiment Distribution</span>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden">
                  <div className="bg-chart-2" style={{ width: `${geo.sentiment.positive}%` }} />
                  <div className="bg-muted" style={{ width: `${geo.sentiment.neutral}%` }} />
                  <div className="bg-destructive" style={{ width: `${geo.sentiment.negative}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-chart-2">{geo.sentiment.positive}% Positive</span>
                  <span className="text-muted-foreground">{geo.sentiment.neutral}% Neutral</span>
                  <span className="text-destructive">{geo.sentiment.negative}% Negative</span>
                </div>
              </div>

              {/* Top Themes */}
              <div className="flex flex-wrap gap-2">
                {geo.topThemes.map((theme, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
