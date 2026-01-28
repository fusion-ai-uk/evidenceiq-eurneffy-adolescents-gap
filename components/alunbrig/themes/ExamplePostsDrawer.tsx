"use client"

import { useEffect, useMemo, useState } from "react"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { SexyRadar } from "@/components/alunbrig/charts/SexyRadar"

export type ExamplePost = {
  id: string
  url: string
  text: string
  created_ts: string
  stakeholder_primary: string
  sentiment_label: string
  sentiment_polarity_minus1_to_1: number
  engagement: number
  viewCount: number
  post_type_evidence_type: string
  card_bucket: string
  topics_top_topics: string
  topics_key_terms: string
  uk_access_is_uk_related: boolean
  uk_access_nation_hint: string
}

export function ExamplePostsDrawer({
  open,
  onOpenChange,
  title,
  description,
  requestUrl,
  summary,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: string
  requestUrl: (offset: number) => string
  summary?: {
    sentimentIndex?: number
    pctSequencing?: number
    pctQoL?: number
    pctNeurotox?: number
    pctCNS?: number
    pctUKAccess?: number
  } | null
}) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<ExamplePost[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const limit = 50

  const page = Math.floor(offset / limit) + 1
  const totalPages = Math.max(1, Math.ceil(total / limit))

  useEffect(() => {
    if (!open) return
    setOffset(0)
  }, [open])

  useEffect(() => {
    if (!open) return
    const url = requestUrl(offset)
    setLoading(true)
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items || [])
        setTotal(Number(d.total || 0))
      })
      .catch(() => {
        setItems([])
        setTotal(0)
      })
      .finally(() => setLoading(false))
  }, [open, offset, requestUrl])

  const canPrev = offset > 0
  const canNext = offset + limit < total

  const headerRight = useMemo(() => {
    if (!open) return null
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={!canPrev || loading} onClick={() => setOffset((o) => Math.max(0, o - limit))}>
          Prev
        </Button>
        <div className="text-xs text-muted-foreground">
          Page <span className="text-foreground">{page}</span> / {totalPages}
        </div>
        <Button variant="outline" size="sm" disabled={!canNext || loading} onClick={() => setOffset((o) => o + limit)}>
          Next
        </Button>
      </div>
    )
  }, [open, canPrev, canNext, loading, page, totalPages])

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-[92vw] sm:w-[720px] max-w-[92vw]">
        <DrawerHeader className="border-b">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <DrawerTitle>{title}</DrawerTitle>
              {description ? <DrawerDescription>{description}</DrawerDescription> : null}
              <div className="mt-1 text-xs text-muted-foreground">Showing social media data</div>
            </div>
            {headerRight}
          </div>

          {summary ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr,260px] items-start">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-muted-foreground">
                  Sentiment index: <span className="text-foreground">{Number(summary.sentimentIndex || 0).toFixed(1)}</span>
                </span>
                <span className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-muted-foreground">
                  % sequencing: <span className="text-foreground">{Math.round(Number(summary.pctSequencing || 0) * 100)}%</span>
                </span>
                <span className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-muted-foreground">
                  % QoL: <span className="text-foreground">{Math.round(Number(summary.pctQoL || 0) * 100)}%</span>
                </span>
                <span className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-muted-foreground">
                  % neurotox: <span className="text-foreground">{Math.round(Number(summary.pctNeurotox || 0) * 100)}%</span>
                </span>
                <span className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-muted-foreground">
                  % CNS: <span className="text-foreground">{Math.round(Number(summary.pctCNS || 0) * 100)}%</span>
                </span>
                <span className="rounded-full border border-border/60 bg-background/40 px-3 py-1 text-muted-foreground">
                  % UK access: <span className="text-foreground">{Math.round(Number(summary.pctUKAccess || 0) * 100)}%</span>
                </span>
              </div>
              <div className="sm:justify-self-end w-full">
                <SexyRadar
                  title="Signal mix"
                  categories={["Sequencing", "QoL", "Neurotox", "CNS", "UK"]}
                  values={[
                    Number(summary.pctSequencing || 0) * 100,
                    Number(summary.pctQoL || 0) * 100,
                    Number(summary.pctNeurotox || 0) * 100,
                    Number(summary.pctCNS || 0) * 100,
                    Number(summary.pctUKAccess || 0) * 100,
                  ]}
                  height={190}
                />
              </div>
            </div>
          ) : null}
        </DrawerHeader>

        <div className="p-4 overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-md border p-3">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="mt-2 h-3 w-full" />
                  <Skeleton className="mt-2 h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-sm text-muted-foreground">No matching results in this slice.</div>
          ) : (
            <div className="space-y-3">
              {items.map((p, idx) => (
                <div key={`${String(p.id ?? "")}::${String(p.created_ts ?? "")}::${idx}`} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      {p.created_ts} · {p.stakeholder_primary || "Unknown"}
                    </div>
                  </div>
                  <div className="mt-2 text-sm whitespace-pre-wrap">{p.text}</div>
                  <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                    <span>Engagement: {Number(p.engagement || 0).toLocaleString()}</span>
                    <span>Views: {Number(p.viewCount || 0).toLocaleString()}</span>
                    {p.post_type_evidence_type ? <span>Evidence: {p.post_type_evidence_type}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
