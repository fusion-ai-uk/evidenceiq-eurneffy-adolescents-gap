"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HintIcon } from "@/components/ui/hint"

type TopicRow = {
  topic_title: string
  posts: number
  hcp_volume: number
  patient_volume: number
  hcp_sentiment: number
  patient_sentiment: number
  topic_summary?: string
  Category?: string
  topic_group?: string
}

export function TopicLeaderboard() {
  const [rows, setRows] = useState<TopicRow[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    fetch("/api/audience/topics")
      .then((r) => r.json())
      .then((d) => setRows(d.rows || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  const items = useMemo(() => {
    return rows
      .filter((r) => r.posts >= 15)
      .filter((r) => !/noise|off[- ]?topic/i.test(r.topic_title || ''))
      .slice(0, 12)
      .map((r) => ({
        title: r.topic_title,
        summary: r.topic_summary || "",
        posts: r.posts,
        delta: (r.hcp_sentiment ?? 0) - (r.patient_sentiment ?? 0),
        group: r.topic_group || r.Category || "",
      }))
  }, [rows])

  return (
    <Card className="border-border/50 h-[520px] flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-medium">Topic Leaderboard (HCP vs Patient)</CardTitle>
        <div className="text-xs text-muted-foreground">
          <HintIcon content={"Topics ranked by posts and engagement. Badge shows which audience’s tone is stronger this month. Use alongside the audience filter to compare viewpoints."} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pr-2">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary animate-pulse"/> Fetching data…</span></div>
        ) : (
        <div className="space-y-3">
          {items.map((t, i) => {
            const up = t.delta >= 0.02
            const down = t.delta <= -0.02
            const variant = up ? "default" : down ? "destructive" : "secondary"
            const label = up ? "+ HCP tone" : down ? "+ Patient tone" : "Parity"
            return (
              <div key={i} className="p-3 rounded-lg bg-accent/50 border border-border/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{t.title}</span>
                      <Badge variant={variant}>{label}</Badge>
                    </div>
                    {t.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.summary}</p>}
                  </div>
                  <div className="text-xs text-muted-foreground">{t.posts} posts</div>
                </div>
              </div>
            )
          })}
        </div>
        )}
      </CardContent>
    </Card>
  )
}


