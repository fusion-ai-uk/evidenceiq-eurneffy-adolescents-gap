"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useMemo, useState } from "react"

type VariantRow = { variant: string; count: number; status: "Correct" | "Misspelling" }

export function MisspellingsTracker() {
  const [rows, setRows] = useState<VariantRow[]>([])

  useEffect(() => {
    fetch(`/api/network/variants`).then((r) => r.json()).then((d) => setRows(d.rows || [])).catch(() => setRows([]))
  }, [])

  const total = useMemo(() => rows.reduce((s, r) => s + (r.count || 0), 0), [rows])

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Zynlonta Name Variants</CardTitle>
        <p className="text-sm text-muted-foreground">Tracking correct names and common misspellings</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rows.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-accent/30 hover:bg-accent/50">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-foreground">{item.variant}</span>
                {item.status === "Correct" ? (
                  <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500">Correct</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-500">Misspelling</Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">{item.count}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-accent/30 border border-border/50">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Total captured:</strong> {total} mentions across all variants
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
