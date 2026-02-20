"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExamplePostsDrawer } from "@/components/alunbrig/themes/ExamplePostsDrawer"
import { subMonths } from "date-fns"
import { DateRangeControl } from "@/components/alunbrig/filters/DateRangeControl"
import { toDateInputValue } from "@/lib/date-input"

type CompetitorListResponse = {
  targetBrand: string
  competitors: { name: string; mentions: number; shareOfCompetitivePosts: number }[]
  brandsMentioned: { name: string; mentions: number }[]
  meta: { competitivePosts: number; totalPosts: number }
}

type ComparatorRow = {
  competitor: string
  mentions: number
  shareCompetitive: number
  sentimentIndex: number
  topDrivers: { driver: string; count: number }[]
  topKeyTerms: { term: string; count: number }[]
  bucketMix?: { bucket: string; posts: number; share: number }[]
}

type ComparatorResponse = { rows: ComparatorRow[] }

type DraftFilters = {
  startDate: string
  endDate: string
  includeLowRelevance: boolean
  stakeholder: string[]
  sentimentLabel: string[]
  ukNation: string[]
  sequencingOnly: boolean
  flags: string[]
  evidenceType: string[]
  searchText: string
  granularity: "week" | "month"
  competitor: string
  targetBrand: string
}

function buildParams(obj: Record<string, any>) {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v)) {
      for (const item of v) sp.append(k, String(item))
      continue
    }
    sp.set(k, String(v))
  }
  return sp.toString()
}

  const pct = (v: number) => `${Math.round(Number(v || 0) * 1000) / 10}%`

export function CompetitorLens() {
  const today = new Date()
  const yearAgo = subMonths(today, 12)

  const [draft, setDraft] = useState<DraftFilters>({
    startDate: toDateInputValue(yearAgo),
    endDate: toDateInputValue(today),
    includeLowRelevance: false,
    stakeholder: [],
    sentimentLabel: [],
    ukNation: [],
    sequencingOnly: false,
    flags: [],
    evidenceType: [],
    searchText: "",
    granularity: "week",
    competitor: "",
    targetBrand: "Alunbrig",
  })

  const [listLoading, setListLoading] = useState(false)
  const [list, setList] = useState<CompetitorListResponse | null>(null)

  const [tableLoading, setTableLoading] = useState(false)
  const [table, setTable] = useState<ComparatorResponse | null>(null)
  const [tableError, setTableError] = useState<string | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState("Examples")
  const [drawerDesc, setDrawerDesc] = useState<string | undefined>(undefined)
  const [drawerMode, setDrawerMode] = useState<"competitor" | "stance" | "attribute" | "context" | "driver" | "key_term">("competitor")
  const [drawerValue, setDrawerValue] = useState("")
  const [drawerCompetitor, setDrawerCompetitor] = useState<string>("")
  const [drawerPeriod, setDrawerPeriod] = useState<string>("")
  const [drawerPeriodGranularity, setDrawerPeriodGranularity] = useState<"week" | "month">("week")

  const openExamples = useCallback(
    (
      mode: typeof drawerMode,
      value: string,
      competitor?: string,
      period?: { period: string; granularity: "week" | "month" },
    ) => {
      const effectiveCompetitor = (competitor ?? draft.competitor) || ""
      const effectiveGranularity = period?.granularity || draft.granularity

      setDrawerMode(mode)
      setDrawerValue(value)
      setDrawerCompetitor(effectiveCompetitor)
      setDrawerPeriod(period?.period || "")
      setDrawerPeriodGranularity(effectiveGranularity)
      setDrawerTitle(`${mode.replaceAll("_", " ")} | ${value}`)
      setDrawerDesc(`Showing social media data${effectiveCompetitor ? ` for ${effectiveCompetitor}` : ""}.`)
      setDrawerOpen(true)
    },
    [draft.competitor, draft.granularity],
  )

  const requestUrl = useCallback(
    (offset: number) => {
      const q = buildParams({
        startDate: draft.startDate,
        endDate: draft.endDate,
        includeLowRelevance: draft.includeLowRelevance,
        stakeholder: draft.stakeholder,
        sentimentLabel: draft.sentimentLabel,
        ukNation: draft.ukNation,
        sequencingOnly: draft.sequencingOnly,
        flags: draft.flags,
        evidenceType: draft.evidenceType,
        searchText: draft.searchText,
        targetBrand: draft.targetBrand,
        competitor: drawerCompetitor,
        mode: drawerMode,
        value: drawerValue,
        period: drawerPeriod,
        granularity: drawerPeriod ? drawerPeriodGranularity : undefined,
        limit: 50,
        offset,
      })
      return `/api/alunbrig/competitors/examples?${q}`
    },
    [draft, drawerCompetitor, drawerMode, drawerValue, drawerPeriod, drawerPeriodGranularity],
  )

  const baseParams = useMemo(
    () => ({
      startDate: draft.startDate,
      endDate: draft.endDate,
      includeLowRelevance: draft.includeLowRelevance,
      stakeholder: draft.stakeholder,
      sentimentLabel: draft.sentimentLabel,
      ukNation: draft.ukNation,
      sequencingOnly: draft.sequencingOnly,
      flags: draft.flags,
      evidenceType: draft.evidenceType,
      searchText: draft.searchText,
      targetBrand: draft.targetBrand,
      granularity: draft.granularity,
    }),
    [
      draft.startDate,
      draft.endDate,
      draft.includeLowRelevance,
      draft.sequencingOnly,
      draft.searchText,
      draft.targetBrand,
      draft.granularity,
      // arrays are stable by reference unless changed
      draft.stakeholder,
      draft.sentimentLabel,
      draft.ukNation,
      draft.flags,
      draft.evidenceType,
    ],
  )

  // Fetch list + comparator table whenever applied changes.
  useEffect(() => {
    if (!draft.startDate || !draft.endDate) return
    const q = buildParams(baseParams)
    setListLoading(true)
    fetch(`/api/alunbrig/competitors/list?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray((d as any).competitors)) setList(d as CompetitorListResponse)
        else setList(null)
      })
      .catch(() => setList(null))
      .finally(() => setListLoading(false))

    setTableLoading(true)
    setTableError(null)
    fetch(`/api/alunbrig/competitors/comparator-table?${q}&limit=20`)
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray((d as any).rows)) {
          setTable(d as ComparatorResponse)
        } else {
          setTable(null)
          setTableError(String((d as any)?.error || "Failed to load comparator table"))
        }
      })
      .catch((e) => {
        setTable(null)
        setTableError((e as any)?.message || "Failed to load comparator table")
      })
      .finally(() => setTableLoading(false))
  }, [baseParams, draft.startDate, draft.endDate])

  const selectedRow = useMemo(() => {
    const c = draft.competitor?.trim()
    if (!c) return null
    return (table?.rows || []).find((r) => String(r.competitor) === c) || null
  }, [draft.competitor, table])

  const competitivePostDenom = Number(list?.meta?.competitivePosts || 0)
  const shareFromMentions = useCallback(
    (mentions: number, fallbackShare: number) => {
      if (competitivePostDenom > 0) return Number(mentions || 0) / competitivePostDenom
      return Number(fallbackShare || 0)
    },
    [competitivePostDenom],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1>Competitor Lens</h1>
        <p className="lead">Explore competitor conversation dynamics and positioning from social media data.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base font-medium">Filters</CardTitle>
              <div className="text-sm text-muted-foreground">Filter Competitor Lens by date range and competitor.</div>
            </div>
            <div className="text-xs text-muted-foreground">
              {listLoading ? "Loading…" : list?.meta?.totalPosts ? `${Number(list.meta.totalPosts).toLocaleString()} posts in range` : null}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-6">
            <div className="md:col-span-3 space-y-1">
              <div className="text-xs text-muted-foreground">Date range</div>
              <DateRangeControl
                startDate={draft.startDate}
                endDate={draft.endDate}
                onChange={(nextStart, nextEnd) => setDraft((d) => ({ ...d, startDate: nextStart, endDate: nextEnd }))}
              />
            </div>
            <div className="md:col-span-3 space-y-1">
              <div className="text-xs text-muted-foreground">Competitor</div>
              <Select value={draft.competitor || "__overall__"} onValueChange={(v) => setDraft((d) => ({ ...d, competitor: v === "__overall__" ? "" : v }))}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__overall__">Overall competitive landscape</SelectItem>
                  {(list?.competitors || []).slice(0, 50).map((c, i) => (
                    <SelectItem key={`${c.name}-${i}`} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="border-border/50 xl:col-span-2">
          <CardHeader>
            <div>
              <CardTitle className="text-base font-medium">Competitor comparison</CardTitle>
              <div className="text-sm text-muted-foreground">Compare competitors by share of competitive conversation and their `card_bucket` theme mix.</div>
            </div>
          </CardHeader>
          <CardContent>
            {tableLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : tableError ? (
              <div className="text-sm text-destructive">Error: {tableError}</div>
            ) : !table ? (
              <div className="text-sm text-muted-foreground">No data.</div>
            ) : !Array.isArray(table.rows) || table.rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">No competitors found in this slice.</div>
            ) : (
              <Table className="w-full table-fixed" containerClassName="overflow-x-hidden">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Competitor</TableHead>
                    <TableHead className="w-[150px]">Share</TableHead>
                    <TableHead className="w-[260px]">Theme mix (`card_bucket`)</TableHead>
                    <TableHead>Top drivers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.rows.map((r, i) => {
                    const share = shareFromMentions(Number(r.mentions || 0), Number(r.shareCompetitive || 0))
                    return (
                      <TableRow
                        key={`${r.competitor}-${i}`}
                        className={`cursor-pointer ${draft.competitor === r.competitor ? "bg-muted/30" : "hover:bg-muted/20"}`}
                        onClick={() => {
                          setDraft((d) => ({ ...d, competitor: r.competitor }))
                        }}
                      >
                        <TableCell className="font-medium max-w-[180px] truncate">{r.competitor}</TableCell>
                        <TableCell>
                          <div>
                            <div className="text-sm font-medium">{pct(share)}</div>
                            <div className="text-[11px] text-muted-foreground">SI {Math.round(Number(r.sentimentIndex || 0))}</div>
                            <div className="mt-1 h-1.5 w-full rounded bg-muted/40">
                              <div className="h-1.5 rounded bg-emerald-500/70" style={{ width: `${Math.min(100, Math.max(0, Number(share || 0) * 100))}%` }} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <div className="flex flex-wrap gap-1">
                            {(r.bucketMix || []).slice(0, 4).map((b, j) => (
                              <span key={`${r.competitor}-bucket-${String(b.bucket)}-${j}`} className="text-xs rounded-full border px-2 py-0.5 text-muted-foreground">
                                {String(b.bucket)} {pct(Number(b.share || 0))}
                              </span>
                            ))}
                            {(r.bucketMix || []).length === 0 ? <span className="text-xs text-muted-foreground">—</span> : null}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-normal">
                          <div className="text-xs text-muted-foreground leading-5 break-words">
                            {(r.topDrivers || []).slice(0, 2).map((d) => d.driver).filter(Boolean).join(" • ") || "—"}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">Competitor focus</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!draft.competitor ? (
              <div className="text-sm text-muted-foreground">
                Select a competitor from the table (or the dropdown above) to see its theme mix by <span className="text-foreground">card_bucket</span> and open example posts.
              </div>
            ) : !selectedRow ? (
              <div className="text-sm text-muted-foreground">Loading competitor detail…</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Share of competitive</div>
                    <div className="mt-1 text-sm font-medium">{pct(shareFromMentions(Number(selectedRow.mentions || 0), Number(selectedRow.shareCompetitive || 0)))}</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Sentiment index</div>
                    <div className="mt-1 text-sm font-medium">{Math.round(Number(selectedRow.sentimentIndex || 0))}</div>
                  </div>
                </div>

                <div className="rounded-md border p-3">
                  <div className="text-sm font-medium">Theme mix (`card_bucket`)</div>
                  <div className="mt-2 space-y-2">
                    {(selectedRow.bucketMix || []).slice(0, 8).map((b, i) => {
                      const share = Number(b.share || 0)
                      return (
                        <div key={`${String(b.bucket)}-${i}`} className="grid grid-cols-[1fr,60px] gap-2 items-center">
                          <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="truncate" title={String(b.bucket)}>{String(b.bucket)}</span>
                              <span className="text-foreground">{pct(share)}</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full rounded bg-muted/40">
                              <div className="h-1.5 rounded bg-primary/70" style={{ width: `${Math.min(100, Math.max(0, share * 100))}%` }} />
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground text-right">{Number(b.posts || 0).toLocaleString()}</div>
                        </div>
                      )
                    })}
                    {(selectedRow.bucketMix || []).length === 0 ? <div className="text-sm text-muted-foreground">No `card_bucket` labels found for this competitor in the slice.</div> : null}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">Right column shows posts; bars show share within this competitor’s slice.</div>
                </div>

                <div className="rounded-md border p-3">
                  <div className="text-sm font-medium">Top drivers (in this slice)</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(selectedRow.topDrivers || []).slice(0, 6).map((d, i) => (
                      <span key={`${String(d.driver)}-${i}`} className="text-xs rounded-full border px-2 py-1 text-muted-foreground">
                        {String(d.driver)}
                      </span>
                    ))}
                    {(selectedRow.topDrivers || []).length === 0 ? <span className="text-xs text-muted-foreground">—</span> : null}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => setDraft((d) => ({ ...d, competitor: "" }))}>
                    Clear selection
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ExamplePostsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={drawerTitle} description={drawerDesc} requestUrl={requestUrl} />
    </div>
  )
}



