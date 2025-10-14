"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useMemo, useState } from "react"

type Row = {
  therapy: string
  aspect: string
  tag: string
  volume: number
  stance: "Positive" | "Negative" | "Mixed"
  confidence: number
}

export function NarrativeAnalysis() {
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    fetch(`/api/competitors/narratives?limit=60`).then((r) => r.json()).then((d) => setRows(d.rows || [])).catch(() => setRows([]))
  }, [])

  const grouped = useMemo(() => {
    const map = new Map<string, Row[]>()
    for (const r of rows) {
      const key = `${r.therapy}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(r)
    }
    return Array.from(map.entries()).map(([therapy, items]) => ({ therapy, items: items.slice(0, 6) }))
  }, [rows])

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Dominant Narratives by Therapy</CardTitle>
        <p className="text-sm text-muted-foreground">How each therapy is being framed in public discourse</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {grouped.map((group, index) => (
            <div key={index} className="p-4 rounded-lg bg-accent/50 border border-border/50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-medium text-foreground">{group.therapy}</h4>
                  <p className="text-xs text-muted-foreground mt-1">Top narrative tags</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{group.items.length}</Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {group.items.map((it, idx) => (
                  <span key={idx} className={`text-xs px-2 py-1 rounded-md ${it.stance === 'Positive' ? 'bg-emerald-500/15 text-emerald-300' : it.stance === 'Negative' ? 'bg-red-500/15 text-red-300' : 'bg-primary/10 text-primary'}`} title={`${it.aspect} · conf ${it.confidence.toFixed(2)} · n=${it.volume}`}>
                    {it.tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
