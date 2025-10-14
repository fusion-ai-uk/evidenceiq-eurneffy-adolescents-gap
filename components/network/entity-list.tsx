"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type NodeRow = {
  entity: string
  type: string
  mentions: number
  avg_sentiment: number
}

export function EntityList() {
  const [rows, setRows] = useState<NodeRow[]>([])
  const [q, setQ] = useState("")

  useEffect(() => {
    fetch(`/api/network/nodes`).then((r) => r.json()).then((d) => setRows(d.rows || [])).catch(() => setRows([]))
  }, [])

  const filtered = useMemo(() => {
    const query = q.toLowerCase()
    return rows.filter((r) => r.entity.toLowerCase().includes(query) || r.type.toLowerCase().includes(query))
  }, [rows, q])

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Entity Directory</CardTitle>
        <p className="text-sm text-muted-foreground">All entities ranked by mention frequency</p>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search entities..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filtered.map((entity, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{entity.entity}</span>
                  <Badge variant="outline" className="text-xs">
                    {entity.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-muted-foreground">{entity.mentions} mentions</span>
                  <span className="text-xs text-muted-foreground">sent {entity.avg_sentiment?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
