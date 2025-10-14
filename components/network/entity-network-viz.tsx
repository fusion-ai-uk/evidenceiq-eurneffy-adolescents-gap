"use client"
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useMemo, useState } from "react"

type NodeRow = {
  entity: string
  type: string
  mentions: number
  avg_sentiment: number
  hcp_mean?: number
  patient_mean?: number
  caregiver_mean?: number
  payer_mean?: number
}

type EdgeRow = {
  source: string
  target: string
  weight: number
  avg_sentiment: number
  sentiment_bucket: "positive" | "neutral" | "negative"
  top_topics?: string[]
  top_categories?: string[]
}

export function EntityNetworkViz() {
  const [nodes, setNodes] = useState<NodeRow[]>([])
  const [edges, setEdges] = useState<EdgeRow[]>([])
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<EdgeRow | null>(null)

  useEffect(() => {
    fetch(`/api/network/nodes`).then((r) => r.json()).then((d) => setNodes(d.rows || [])).catch(() => setNodes([]))
    fetch(`/api/network/edges`).then((r) => r.json()).then((d) => setEdges(d.rows || [])).catch(() => setEdges([]))
  }, [])

  const layout = useMemo(() => {
    if (nodes.length === 0) return { positioned: [] as any[], edges: [] as EdgeRow[] }
    const maxMentions = Math.max(...nodes.map((n) => n.mentions)) || 1
    const N = Math.min(nodes.length, 24)
    const sorted = [...nodes].sort((a, b) => b.mentions - a.mentions).slice(0, N)
    const center = { x: 50, y: 50 }
    const radius = 32
    const positioned = sorted.map((n, i) => {
      if (i === 0) return { ...n, x: center.x, y: center.y, r: 14 + (n.mentions / maxMentions) * 14 }
      const theta = (2 * Math.PI * (i - 1)) / (N - 1)
      const x = center.x + radius * Math.cos(theta)
      const y = center.y + radius * Math.sin(theta)
      return { ...n, x, y, r: 10 + (n.mentions / maxMentions) * 12 }
    })
    return { positioned, edges }
  }, [nodes, edges])

  const getEntityColor = (type: string) => {
    switch (type) {
      case "Drug":
        return "#3b82f6"
      case "Indication":
        return "#10b981"
      case "Payer":
        return "#f59e0b"
      case "Trial":
        return "#8b5cf6"
      case "Event":
        return "#ec4899"
      default:
        return "#6b7280"
    }
  }

  const getEdgeColor = (bucket: EdgeRow["sentiment_bucket"], value: number) => {
    const alpha = Math.min(0.9, 0.3 + Math.abs(value) * 0.7)
    if (bucket === "positive") return `rgba(16,185,129,${alpha})`
    if (bucket === "negative") return `rgba(239,68,68,${alpha})`
    return `rgba(148,163,184,${0.5})`
  }

  const nodeByName = useMemo(() => {
    const map = new Map<string, any>()
    layout.positioned.forEach((n) => map.set(n.entity, n))
    return map
  }, [layout])

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-base font-medium">Entity Network Map</CardTitle>
        <p className="text-sm text-muted-foreground">
          Interactive visualization of connections between drugs, trials, institutions, and events
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative h-[400px] bg-accent/20 rounded-lg border border-border/50 overflow-hidden">
          <svg className="w-full h-full">
            {/* Draw connections from live edges */}
            {layout.edges.slice(0, 150).map((e, idx) => {
              const from = nodeByName.get(e.source)
              const to = nodeByName.get(e.target)
              if (!from || !to) return null
              return (
                <line
                  key={idx}
                  x1={`${from.x}%`}
                  y1={`${from.y}%`}
                  x2={`${to.x}%`}
                  y2={`${to.y}%`}
                  stroke={getEdgeColor(e.sentiment_bucket, e.avg_sentiment)}
                  strokeWidth={Math.max(1, Math.log2(2 + e.weight))}
                  opacity={0.8}
                  className="cursor-pointer"
                  onClick={() => setSelectedEdge(e)}
                />
              )
            })}

            {/* Draw nodes */}
            {layout.positioned.map((entity: any) => (
              <g key={entity.entity}>
                <circle
                  cx={`${entity.x}%`}
                  cy={`${entity.y}%`}
                  r={entity.r}
                  fill={getEntityColor(entity.type)}
                  opacity={selectedEntity === entity.entity || !selectedEntity ? 0.9 : 0.3}
                  className="cursor-pointer transition-all hover:opacity-100"
                  onClick={() => {
                    setSelectedEntity(selectedEntity === entity.entity ? null : entity.entity)
                    setSelectedEdge(null)
                  }}
                />
                <text
                  x={`${entity.x}%`}
                  y={`${entity.y}%`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="10"
                  className="pointer-events-none font-medium"
                >
                  {entity.entity}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#3b82f6]" />
            <span className="text-xs text-muted-foreground">Drugs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#10b981]" />
            <span className="text-xs text-muted-foreground">Indications</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#f59e0b]" />
            <span className="text-xs text-muted-foreground">Payers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#8b5cf6]" />
            <span className="text-xs text-muted-foreground">Trials</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ec4899]" />
            <span className="text-xs text-muted-foreground">Events</span>
          </div>
        </div>

        {selectedEntity && (
          <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-foreground">
              Selected: <span className="font-medium">{selectedEntity}</span>
            </p>
            {(() => {
              const n = nodes.find((x) => x.entity === selectedEntity)
              if (!n) return null
              return (
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <Badge variant="outline">{n.type}</Badge>
                  <span>{n.mentions} mentions</span>
                  <span>sent {n.avg_sentiment?.toFixed(2)}</span>
                  <span>HCP {n.hcp_mean?.toFixed(2)}</span>
                  <span>Patient {n.patient_mean?.toFixed(2)}</span>
                  <span>Caregiver {n.caregiver_mean?.toFixed(2)}</span>
                  <span>Payer {n.payer_mean?.toFixed(2)}</span>
                </div>
              )
            })()}
          </div>
        )}

        {selectedEdge && (
          <div className="mt-4 p-3 rounded-lg bg-accent/30 border border-border/50">
            <p className="text-sm text-foreground font-medium">
              {selectedEdge.source} ↔ {selectedEdge.target}
            </p>
            <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-3">
              <span>connections {selectedEdge.weight}</span>
              <span>sent {selectedEdge.avg_sentiment.toFixed(2)} ({selectedEdge.sentiment_bucket})</span>
            </div>
            {(selectedEdge.top_topics?.length || selectedEdge.top_categories?.length) && (
              <div className="mt-2 text-xs">
                {selectedEdge.top_topics?.length ? (
                  <div className="mb-1"><span className="text-muted-foreground">Top topics:</span> {selectedEdge.top_topics!.join(", ")}</div>
                ) : null}
                {selectedEdge.top_categories?.length ? (
                  <div><span className="text-muted-foreground">Top categories:</span> {selectedEdge.top_categories!.join(", ")}</div>
                ) : null}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
