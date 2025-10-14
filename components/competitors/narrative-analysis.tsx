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

  // Hidden per request – the durability chart will occupy full width
  return null
}
