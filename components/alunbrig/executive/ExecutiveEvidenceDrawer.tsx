"use client"

import { useEffect, useMemo, useState } from "react"

import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type EvidenceItem = {
  id: string
  url: string
  text: string
  created_ts: string
  stakeholder_primary: string
  sentiment_label: string
  sentiment_polarity_minus1_to_1: number
  engagement: number
  viewCount: number
  card_bucket: string
  card_title: string
  card_takeaway: string
  card_signal_strength_0_100: number
  topics_key_terms: string
  sentiment_drivers: string
  insight_tags_hurdles: string
  insight_tags_opportunities: string
  card_content_angle_suggestions: string
  sequencing_is_sequencing_discussed: boolean
  sequencing_line_of_therapy: string
  sequencing_sequence_direction: string
  sequencing_pfs_or_pfs2_mentioned: boolean
  sequencing_attrition_or_discontinuation: boolean
  uk_access_is_uk_related: boolean
  uk_access_nation_hint: string
  entities_competitors: string
  entities_drugs_brands: string
  post_type_evidence_type: string
}

function fmtTs(ts: string) {
  if (!ts) return ""
  return ts.replace(" UTC", "")
}

function splitSemi(v?: string) {
  return String(v || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
}

export function ExecutiveEvidenceDrawer({
  open,
  onOpenChange,
  title,
  description,
  requestUrl,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description?: string
  requestUrl: (offset: number) => string
}) {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<EvidenceItem[]>([])
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
      <DrawerContent className="w-[92vw] sm:w-[760px] max-w-[92vw]">
        <DrawerHeader className="border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DrawerTitle>{title}</DrawerTitle>
              {description ? <DrawerDescription>{description}</DrawerDescription> : null}
              <div className="mt-1 text-xs text-muted-foreground">Showing social media data | {total.toLocaleString()} posts</div>
            </div>
            {headerRight}
          </div>
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
            <div className="text-sm text-muted-foreground">No matching posts in this slice.</div>
          ) : (
            <div className="space-y-3">
              {items.map((p) => {
                const keyTerms = splitSemi(p.topics_key_terms).slice(0, 6)
                const drivers = splitSemi(p.sentiment_drivers).slice(0, 4)
                return (
                  <div key={p.id} className="rounded-md border border-border/60 bg-card/40 p-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="text-foreground">{fmtTs(p.created_ts)}</span>
                      <span>|</span>
                      <span>{p.stakeholder_primary || "Unknown"}</span>
                      <span className="ml-auto text-foreground">Engagement: {Number(p.engagement || 0).toLocaleString()}</span>
                    </div>
                    <div className="mt-2 text-sm whitespace-pre-wrap">{p.text}</div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.post_type_evidence_type ? <Badge variant="secondary">{p.post_type_evidence_type}</Badge> : null}
                      {p.sequencing_is_sequencing_discussed ? <Badge variant="secondary">Sequencing</Badge> : null}
                      {p.sequencing_pfs_or_pfs2_mentioned ? <Badge variant="secondary">PFS/PFS2</Badge> : null}
                      {p.sequencing_attrition_or_discontinuation ? <Badge variant="secondary">Attrition</Badge> : null}
                      {p.uk_access_is_uk_related ? <Badge variant="secondary">UK access</Badge> : null}
                      {p.uk_access_nation_hint ? <Badge variant="outline">{p.uk_access_nation_hint}</Badge> : null}
                      {p.entities_competitors ? <Badge variant="outline">Competitive</Badge> : null}
                    </div>

                    {drivers.length || keyTerms.length ? (
                      <div className="mt-3 space-y-2">
                        {drivers.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs text-muted-foreground mr-1">Drivers</span>
                            {drivers.map((d) => (
                              <Badge key={d} variant="outline">
                                {d}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                        {keyTerms.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-xs text-muted-foreground mr-1">Key terms</span>
                            {keyTerms.map((t) => (
                              <Badge key={t} variant="outline">
                                {t}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}


