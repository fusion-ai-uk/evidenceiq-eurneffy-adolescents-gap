"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ExamplePostsDrawer } from "@/components/alunbrig/themes/ExamplePostsDrawer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { InfoTip } from "@/components/alunbrig/InfoTip"
import { cachedJson } from "@/lib/client-cache"
import { DateRangeControl } from "@/components/alunbrig/filters/DateRangeControl"
import { toDateInputValue } from "@/lib/date-input"

// Ensure we resolve the actual component across module formats (CJS/ESM).
const ReactApexChart = dynamic(() => import("react-apexcharts").then((m: any) => m?.default ?? m), { ssr: false })

type GroupBy = "card_bucket" | "topics_top_topics" | "clinical_context_biomarker" | "competitive_context"

type Metric = "volume" | "engagement" | "views"

type TabKey = "overview" | "top_topics"

type OverviewItem = {
  group: string
  metricValue: number
  posts: number
  sentimentIndex: number
  avgPolarity: number
  pctSequencing: number
  pctQoL: number
  pctNeurotox: number
  pctCNS: number
  pctUKAccess: number
  topStakeholders: { label: string; count: number }[]
  topKeyTerms: { term: string; count: number }[]
}

function polarityToColor(p?: number) {
  if (p === undefined || p === null || Number.isNaN(p)) return "hsl(210 12% 38%)"
  const t = (Math.max(-1, Math.min(1, p)) + 1) / 2
  const hue = 10 + (140 - 10) * t
  return `hsl(${hue} 70% 34%)`
}

function metricLabel(m: Metric) {
  if (m === "volume") return "Share"
  if (m === "engagement") return "Engagement"
  return "Views"
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

export function GeneralThemesExplorer() {
  const today = new Date()
  const yearAgo = new Date()
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)

  // Filters
  const [startDate, setStartDate] = useState(toDateInputValue(yearAgo))
  const [endDate, setEndDate] = useState(toDateInputValue(today))

  // Theme controls
  const groupBy: GroupBy = "card_bucket"
  const [metric, setMetric] = useState<Metric>("volume")
  const [tab, setTab] = useState<TabKey>("overview")

  const [overviewLoading, setOverviewLoading] = useState(false)
  const [overviewItems, setOverviewItems] = useState<OverviewItem[]>([])
  const [overviewMeta, setOverviewMeta] = useState<{ totalPosts: number; minDate: string; maxDate: string } | null>(null)

  const [topTopicsLoading, setTopTopicsLoading] = useState(false)
  const [topTopicsRows, setTopTopicsRows] = useState<any[]>([])

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerGroupBy, setDrawerGroupBy] = useState<GroupBy>("card_bucket")
  const [drawerGroupValue, setDrawerGroupValue] = useState("")
  const [drawerSummary, setDrawerSummary] = useState<
    | {
        sentimentIndex?: number
        pctSequencing?: number
        pctQoL?: number
        pctNeurotox?: number
        pctCNS?: number
        pctUKAccess?: number
      }
    | null
  >(null)

  const baseFilterParams = useMemo(
    () => ({
      startDate,
      endDate,
    }),
    [startDate, endDate],
  )

  const openExamples = useCallback((gBy: GroupBy, gVal: string, summary?: any) => {
    setDrawerGroupBy(gBy)
    setDrawerGroupValue(gVal)
    setDrawerSummary(summary ? {
      sentimentIndex: summary.sentimentIndex,
      pctSequencing: summary.pctSequencing,
      pctQoL: summary.pctQoL,
      pctNeurotox: summary.pctNeurotox,
      pctCNS: summary.pctCNS,
      pctUKAccess: summary.pctUKAccess,
    } : null)
    setDrawerOpen(true)
  }, [])

  useEffect(() => {
    if (!startDate || !endDate) return
    const ac = new AbortController()
    // Kick off all heavy requests in parallel to reduce total load time.
    setOverviewLoading(true)
    setTopTopicsLoading(true)

    const qOverview = buildParams({ ...baseFilterParams, groupBy, metric, limit: 600 })
    const qTop = buildParams({ ...baseFilterParams, metric, limit: 50 })

    Promise.allSettled([
      cachedJson(`/api/alunbrig/themes/overview?${qOverview}`, { ttlMs: 30_000, signal: ac.signal }),
      cachedJson(`/api/alunbrig/themes/top-topics?${qTop}`, { ttlMs: 30_000, signal: ac.signal }),
    ]).then((results) => {
      const [r0, r1] = results
      if (r0.status === "fulfilled") {
        setOverviewItems((r0.value as any)?.items || [])
        setOverviewMeta((r0.value as any)?.meta || null)
      } else {
        setOverviewItems([])
        setOverviewMeta(null)
      }
      if (r1.status === "fulfilled") setTopTopicsRows((r1.value as any)?.rows || [])
      else setTopTopicsRows([])
    }).finally(() => {
      setOverviewLoading(false)
      setTopTopicsLoading(false)
    })

    return () => ac.abort()
  }, [baseFilterParams, groupBy, metric, startDate, endDate])

  const overviewFiltered = overviewItems
  const topTopicsFiltered = topTopicsRows

  const { resolvedTheme } = useTheme()
  const axisColor = resolvedTheme === "dark" ? "#9CA3AF" : "#374151"
  const gridBorderColor = resolvedTheme === "dark" ? "rgba(148,163,184,0.18)" : "#E5E7EB"

  const treemapSeries = useMemo(() => {
    return [
      {
        data: overviewFiltered
          .filter((it) => it.group)
          .sort((a, b) => Number(b.metricValue || 0) - Number(a.metricValue || 0))
          .slice(0, 250)
          .map((it) => ({
            x: it.group,
            y: Number(it.metricValue || 0),
            fillColor: polarityToColor(it.avgPolarity),
            raw: it,
          })),
      },
    ]
  }, [overviewFiltered])

  const treemapOptions = useMemo(() => {
    const sliceTotalPosts = Number(overviewMeta?.totalPosts || 0)
    return {
      theme: { mode: resolvedTheme === "dark" ? "dark" : "light" },
      chart: {
        background: "transparent",
        toolbar: { show: false },
        foreColor: axisColor,
        fontFamily: "Inter, ui-sans-serif, system-ui",
        events: {
          dataPointSelection: (_e: any, _ctx: any, cfg: any) => {
            const d = cfg?.w?.config?.series?.[0]?.data?.[cfg.dataPointIndex]
            const raw: OverviewItem | undefined = d?.raw
          if (raw?.group) openExamples(groupBy, raw.group, raw)
          },
        },
      },
      legend: { show: false },
      tooltip: {
        theme: "dark",
        custom: ({ seriesIndex, dataPointIndex, w }: any) => {
          const d = w.config.series[seriesIndex].data[dataPointIndex]
          const r: OverviewItem | undefined = d?.raw
          if (!r) return undefined
          const pct = (x: number) => `${Math.round(Number(x || 0) * 1000) / 10}%`
          const sharePct = sliceTotalPosts > 0 ? (Number(r.posts || 0) / sliceTotalPosts) * 100 : 0
          const metricName = metricLabel(metric)
          const showMetricRow = metric !== "volume"
          return `
            <div class="px-3 py-2 text-xs">
              <div class="font-medium">${r.group}</div>
              <div class="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                <div>Share of slice</div><div class="text-right">${sharePct.toFixed(1)}%</div>
                ${
                  showMetricRow
                    ? `<div>${metricName}</div><div class="text-right">${Number(r.metricValue || 0).toLocaleString()}</div>`
                    : ""
                }
                <div>Sentiment index</div><div class="text-right">${Number(r.sentimentIndex || 0).toFixed(1)}</div>
                <div>% sequencing</div><div class="text-right">${pct(r.pctSequencing)}</div>
                <div>% QoL</div><div class="text-right">${pct(r.pctQoL)}</div>
                <div>% neurotox</div><div class="text-right">${pct(r.pctNeurotox)}</div>
                <div>% CNS</div><div class="text-right">${pct(r.pctCNS)}</div>
                <div>% UK access</div><div class="text-right">${pct(r.pctUKAccess)}</div>
              </div>
              <div class="mt-2 text-[11px] text-slate-400">Click to view example posts</div>
            </div>
          `
        },
      },
      plotOptions: { treemap: { distributed: true, enableShades: false } },
      grid: { show: false, borderColor: gridBorderColor, strokeDashArray: 2 },
    }
  }, [resolvedTheme, axisColor, gridBorderColor, groupBy, openExamples, metric, overviewMeta?.totalPosts])

  const examplesUrl = useCallback(
    (offset: number) => {
      const q = buildParams({
        ...baseFilterParams,
        groupBy: drawerGroupBy,
        groupValue: drawerGroupValue,
        limit: 50,
        offset,
      })
      return `/api/alunbrig/themes/examples?${q}`
    },
    [baseFilterParams, drawerGroupBy, drawerGroupValue],
  )

  return (
    <div className="space-y-6">
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <CardTitle>Theme Explorer</CardTitle>
              <InfoTip text="Use this page to explore how themes and topics are distributed within the selected slice of social media data. Switch tabs to view a high-level overview, a ranked table, or a relationship view, and click into items to open example posts." />
            </div>
            <div className="text-sm text-muted-foreground">Explore themes from <span className="text-foreground">social media data</span>.</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="grid gap-3 md:grid-cols-3 rounded-md border border-border/60 p-3 bg-background/40">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Metric</div>
              <Select value={metric} onValueChange={(v) => setMetric(v as Metric)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-xs text-muted-foreground">Date range</div>
              <DateRangeControl startDate={startDate} endDate={endDate} onChange={(nextStart, nextEnd) => {
                setStartDate(nextStart)
                setEndDate(nextEnd)
              }} />
            </div>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="top_topics">Top Topics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-sm font-medium">Overview treemap</div>
                <InfoTip text="Each tile represents a theme/topic group. Tile size reflects the selected metric (Volume/Engagement/Views), and color reflects average polarity. Click a tile to open example posts for that group." />
              </div>
              <div className="h-[760px]">
                {overviewLoading ? (
                  <div className="h-full flex items-center justify-center"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Skeleton className="h-2 w-2 rounded-full" /> Loading…</div></div>
                ) : (
                  <ReactApexChart type="treemap" height="100%" width="100%" options={treemapOptions as any} series={treemapSeries as any} />
                )}
              </div>
            </TabsContent>

            <TabsContent value="top_topics" className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-sm font-medium">Top topics table</div>
                <InfoTip text="Ranks topics within the selected slice. Use it to compare volume and supporting % signals across topics, then click a row to open example posts." />
              </div>
              <div className="rounded-md border overflow-hidden">
                <div className="px-3 py-2 text-xs text-muted-foreground border-b">Click a row to view example posts (social media data)</div>
                <div className="max-h-[760px] overflow-auto">
                  {topTopicsLoading ? (
                    <div className="p-4"><Skeleton className="h-4 w-40" /><Skeleton className="mt-2 h-4 w-full" /><Skeleton className="mt-2 h-4 w-3/4" /></div>
                  ) : topTopicsFiltered.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground">No topics match the current slice.</div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-background border-b">
                        <tr className="text-xs text-muted-foreground">
                          <th className="text-left p-2">Topic</th>
                          <th className="text-right p-2">Share</th>
                          {metric !== "volume" ? <th className="text-right p-2">{metricLabel(metric)}</th> : null}
                          <th className="text-right p-2">Sentiment</th>
                          <th className="text-right p-2">% Seq</th>
                          <th className="text-right p-2">% QoL</th>
                          <th className="text-right p-2">% Neurotox</th>
                          <th className="text-right p-2">% CNS</th>
                          <th className="text-right p-2">% UK access</th>
                          <th className="text-left p-2">Top stakeholders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topTopicsFiltered.map((r: any) => (
                          <tr key={r.topic} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => openExamples("topics_top_topics", r.topic, r)}>
                            <td className="p-2 font-medium">{r.topic}</td>
                            <td className="p-2 text-right">
                              {overviewMeta?.totalPosts ? `${(((Number(r.posts || 0) / Number(overviewMeta.totalPosts || 1)) * 100) || 0).toFixed(1)}%` : "—"}
                            </td>
                            {metric !== "volume" ? <td className="p-2 text-right">{Number(r.metricValue || 0).toLocaleString()}</td> : null}
                            <td className="p-2 text-right">{Number(r.sentimentIndex || 0).toFixed(1)}</td>
                            <td className="p-2 text-right">{Math.round(Number(r.pctSequencing || 0) * 100)}%</td>
                            <td className="p-2 text-right">{Math.round(Number(r.pctQoL || 0) * 100)}%</td>
                            <td className="p-2 text-right">{Math.round(Number(r.pctNeurotox || 0) * 100)}%</td>
                            <td className="p-2 text-right">{Math.round(Number(r.pctCNS || 0) * 100)}%</td>
                            <td className="p-2 text-right">{Math.round(Number(r.pctUKAccess || 0) * 100)}%</td>
                            <td className="p-2 text-xs text-muted-foreground">{(r.topStakeholders || []).map((s: any) => s.label).filter(Boolean).join(", ") || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>

      <ExamplePostsDrawer
        open={drawerOpen}
        onOpenChange={(v) => {
          setDrawerOpen(v)
          if (!v) setDrawerSummary(null)
        }}
        title={drawerGroupValue}
        description={`Group: ${drawerGroupBy}`}
        requestUrl={examplesUrl}
        summary={drawerSummary}
      />
    </div>
  )
}
