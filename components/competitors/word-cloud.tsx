"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function WordCloud() {
  const [selectedDrug, setSelectedDrug] = useState<"zynlonta" | "epcoritamab" | "glofitamab" | "car-t">("zynlonta")
  const [terms, setTerms] = useState<{ word: string; size: number; sentiment: "positive" | "negative" | "neutral" }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/competitors/wordcloud?therapy=${selectedDrug}&limit=200`)
      .then((r) => r.json())
      .then((d) => {
        const rows = d.rows || []
        const max = Math.max(1, ...rows.map((x: any) => x.n || 1))
        const ts = rows.map((x: any) => ({
          word: x.term,
          size: Math.round(14 + (x.n / max) * 24),
          sentiment: x.mean_sent > 0.05 ? "positive" : x.mean_sent < -0.05 ? "negative" : "neutral",
        }))
        setTerms(ts)
      })
      .catch(() => setTerms([]))
      .finally(() => setLoading(false))
  }, [selectedDrug])

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium">Descriptor Word Cloud</CardTitle>
            <p className="text-sm text-muted-foreground">Most common terms used to describe each therapy</p>
          </div>
          <Select value={selectedDrug} onValueChange={(value) => setSelectedDrug(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zynlonta">Zynlonta</SelectItem>
              <SelectItem value="epcoritamab">Epcoritamab</SelectItem>
              <SelectItem value="glofitamab">Glofitamab</SelectItem>
              <SelectItem value="car-t">CAR-T</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Skeleton className="h-2 w-2 rounded-full"/> Fetching data…</div>
          </div>
        ) : (
        <div className="flex flex-wrap items-center justify-center gap-4 p-6 min-h-[300px]">
          {terms.map((item, index) => (
            <span
              key={index}
              className={`font-medium transition-all hover:scale-110 cursor-default ${
                item.sentiment === "positive"
                  ? "text-chart-2"
                  : item.sentiment === "negative"
                    ? "text-destructive"
                    : "text-foreground"
              }`}
              style={{ fontSize: `${item.size}px` }}
            >
              {item.word}
            </span>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  )
}
