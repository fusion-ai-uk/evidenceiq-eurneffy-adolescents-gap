"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { topTrendingThemes } from "@/lib/content-plan"

export function TopTrendingQuickLinks() {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Top Trending Themes</CardTitle>
        <p className="text-sm text-muted-foreground">Quick links to narrative hotspots</p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-3">
          {topTrendingThemes.items.map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-border/50 bg-accent/30">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-foreground leading-tight">{item.title}</h4>
                <Badge variant="secondary" className="shrink-0">Hot</Badge>
              </div>
              <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside space-y-1">
                {item.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-accent/40 border border-border/50">
          <p className="text-sm text-foreground">{topTrendingThemes.insight}</p>
        </div>
      </CardContent>
    </Card>
  )
}


