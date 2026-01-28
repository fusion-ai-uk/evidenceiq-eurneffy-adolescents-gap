"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ExamplePostsDrawer } from "@/components/alunbrig/themes/ExamplePostsDrawer"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterPane } from "@/components/alunbrig/filters/FilterPane"
import { MultiSelect } from "@/components/alunbrig/filters/MultiSelect"
import { ActiveFiltersBar, type ActiveFilterChip } from "@/components/alunbrig/filters/ActiveFiltersBar"
import { InfoTip } from "@/components/alunbrig/InfoTip"
import { cachedJson } from "@/lib/client-cache"

// Ensure we resolve the actual component across module formats (CJS/ESM).
const ReactApexChart = dynamic(() => import("react-apexcharts").then((m: any) => m?.default ?? m), { ssr: false })

type GroupBy = "card_bucket" | "topics_top_topics" | "clinical_context_biomarker" | "competitive_context"

type Metric = "volume" | "engagement" | "views"

type TabKey = "overview" | "top_topics" | "scatter"

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

type OptionsPayload = {
  stakeholderPrimary: string[]
  sentimentLabel: string[]
  ukNation: string[]
  evidenceType: string[]
  meta: { totalPosts: number; minDate: string; maxDate: string }
}

type ScatterPoint = {
  group: string
  x: number
  y: number
  size: number
  posts: number
  sentimentIndex: number
  avgPolarity: number
}

const toISODate = (d: Date) => d.toISOString().slice(0, 10)

function polarityToColor(p?: number) {
  if (p === undefined || p === null || Number.isNaN(p)) return "hsl(210 12% 38%)"
  const t = (Math.max(-1, Math.min(1, p)) + 1) / 2
  const hue = 10 + (140 - 10) * t
  return `hsl(${hue} 70% 34%)`
}

function metricLabel(m: Metric) {
  if (m === "volume") return "Posts"
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

  // Global filters
  const [startDate, setStartDate] = useState(toISODate(yearAgo))
  const [endDate, setEndDate] = useState(toISODate(today))
  const [includeLowRelevance, setIncludeLowRelevance] = useState(false)
  const [stakeholderPrimary, setStakeholderPrimary] = useState<string[]>([])
  const [sentimentLabel, setSentimentLabel] = useState<string[]>([])
  const [ukNation, setUkNation] = useState<string[]>([])
  const [sequencingOnly, setSequencingOnly] = useState(false)
  const [flags, setFlags] = useState<string[]>([])
  const [evidenceType, setEvidenceType] = useState<string[]>([])
  const [searchText, setSearchText] = useState("")

  // Theme controls
  const [groupBy, setGroupBy] = useState<GroupBy>("card_bucket")
  const [metric, setMetric] = useState<Metric>("volume")
  const [tab, setTab] = useState<TabKey>("overview")
  const [sentimentThreshold, setSentimentThreshold] = useState(0)

  const [optionsLoading, setOptionsLoading] = useState(false)
  const [options, setOptions] = useState<OptionsPayload | null>(null)

  const [overviewLoading, setOverviewLoading] = useState(false)
  const [overviewItems, setOverviewItems] = useState<OverviewItem[]>([])

  const [topTopicsLoading, setTopTopicsLoading] = useState(false)
  const [topTopicsRows, setTopTopicsRows] = useState<any[]>([])

  const [scatterLoading, setScatterLoading] = useState(false)
  const [scatterPoints, setScatterPoints] = useState<ScatterPoint[]>([])

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
  const [filtersAdvancedOpen, setFiltersAdvancedOpen] = useState(false)

  const baseFilterParams = useMemo(
    () => ({
      startDate,
      endDate,
      includeLowRelevance,
      stakeholderPrimary,
      sentimentLabel,
      ukNation,
      sequencingOnly,
      flags,
      evidenceType,
      searchText,
    }),
    [startDate, endDate, includeLowRelevance, stakeholderPrimary, sentimentLabel, ukNation, sequencingOnly, flags, evidenceType, searchText],
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
    setOptionsLoading(true)
    const ac = new AbortController()
    const q = buildParams({
      startDate,
      endDate,
      includeLowRelevance,
      sequencingOnly,
      flags,
      evidenceType,
      searchText,
    })
    cachedJson(`/api/alunbrig/themes/options?${q}`, { ttlMs: 5 * 60_000, signal: ac.signal })
      .then((d) => setOptions(d as any))
      .catch(() => setOptions(null))
      .finally(() => setOptionsLoading(false))

    return () => ac.abort()
  }, [startDate, endDate, includeLowRelevance, sequencingOnly, flags, evidenceType, searchText])

  useEffect(() => {
    if (!startDate || !endDate) return
    const ac = new AbortController()
    // Kick off all heavy requests in parallel to reduce total load time.
    setOverviewLoading(true)
    setTopTopicsLoading(true)
    setScatterLoading(true)

    const qOverview = buildParams({ ...baseFilterParams, groupBy, metric, limit: 600 })
    const qTop = buildParams({ ...baseFilterParams, metric, limit: 50 })
    const qScatter = buildParams({ ...baseFilterParams, groupBy, metric, xMetric: "posts", sizeMetric: "engagement", limit: 500 })

    Promise.allSettled([
      cachedJson(`/api/alunbrig/themes/overview?${qOverview}`, { ttlMs: 30_000, signal: ac.signal }),
      cachedJson(`/api/alunbrig/themes/top-topics?${qTop}`, { ttlMs: 30_000, signal: ac.signal }),
      cachedJson(`/api/alunbrig/themes/scatter?${qScatter}`, { ttlMs: 30_000, signal: ac.signal }),
    ]).then((results) => {
      const [r0, r1, r2] = results
      if (r0.status === "fulfilled") setOverviewItems((r0.value as any)?.items || [])
      else setOverviewItems([])
      if (r1.status === "fulfilled") setTopTopicsRows((r1.value as any)?.rows || [])
      else setTopTopicsRows([])
      if (r2.status === "fulfilled") setScatterPoints((r2.value as any)?.points || [])
      else setScatterPoints([])
    }).finally(() => {
      setOverviewLoading(false)
      setTopTopicsLoading(false)
      setScatterLoading(false)
    })

    return () => ac.abort()
  }, [baseFilterParams, groupBy, metric, startDate, endDate])

  const overviewFiltered = useMemo(
    () => overviewItems.filter((it) => Number(it.sentimentIndex || 0) >= sentimentThreshold),
    [overviewItems, sentimentThreshold],
  )

  const topTopicsFiltered = useMemo(
    () => topTopicsRows.filter((r: any) => Number(r.sentimentIndex || 0) >= sentimentThreshold),
    [topTopicsRows, sentimentThreshold],
  )

  const scatterFiltered = useMemo(
    () => scatterPoints.filter((p) => Number(p.sentimentIndex || 0) >= sentimentThreshold),
    [scatterPoints, sentimentThreshold],
  )

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
          const metricName = metricLabel(metric)
          // Avoid duplicate "Posts" rows when Volume is selected.
          const showMetricRow = metricName !== "Posts"
          return `
            <div class="px-3 py-2 text-xs">
              <div class="font-medium">${r.group}</div>
              <div class="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                <div>Posts</div><div class="text-right">${Number(r.posts || 0).toLocaleString()}</div>
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
  }, [resolvedTheme, axisColor, gridBorderColor, groupBy, openExamples, metric])

  const bubbleSeries = useMemo(() => {
    const top10 = [...scatterFiltered].sort((a, b) => Number(b.posts || 0) - Number(a.posts || 0)).slice(0, 10)
    const labelSet = new Set(top10.map((p) => p.group))
    return [
      {
        name: "Themes",
        data: scatterFiltered.map((p) => ({
          x: Number(p.x || 0),
          y: Number(p.y || 0),
          z: Math.max(1, Number(p.size || 0)),
          group: p.group,
          label: labelSet.has(p.group) ? p.group : "",
          raw: p,
        })),
      },
    ]
  }, [scatterFiltered])

  const bubbleOptions = useMemo(() => {
    return {
      theme: { mode: resolvedTheme === "dark" ? "dark" : "light" },
      chart: {
        background: "transparent",
        toolbar: { show: false },
        foreColor: axisColor,
        fontFamily: "Inter, ui-sans-serif, system-ui",
        events: {
          dataPointSelection: (_e: any, _ctx: any, cfg: any) => {
            const d = cfg?.w?.config?.series?.[cfg.seriesIndex]?.data?.[cfg.dataPointIndex]
            if (d?.group) openExamples(groupBy, d.group)
          },
        },
      },
      xaxis: { title: { text: "Posts" } },
      yaxis: { title: { text: "Sentiment index" }, min: 0, max: 100 },
      grid: { borderColor: gridBorderColor, strokeDashArray: 2 },
      dataLabels: {
        enabled: true,
        formatter: (_v: any, opts: any) => {
          const d = opts?.w?.config?.series?.[opts.seriesIndex]?.data?.[opts.dataPointIndex]
          return d?.label || ""
        },
        style: { fontSize: "10px", fontWeight: 600 },
        background: { enabled: false },
      },
      tooltip: {
        theme: "dark",
        custom: ({ seriesIndex, dataPointIndex, w }: any) => {
          const d = w.config.series[seriesIndex].data[dataPointIndex]
          const r: ScatterPoint | undefined = d?.raw
          if (!r) return undefined
          return `
            <div class="px-3 py-2 text-xs">
              <div class="font-medium">${r.group}</div>
              <div class="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                <div>Posts</div><div class="text-right">${Number(r.posts || 0).toLocaleString()}</div>
                <div>Sentiment index</div><div class="text-right">${Number(r.sentimentIndex || 0).toFixed(1)}</div>
                <div>Avg polarity</div><div class="text-right">${Number(r.avgPolarity || 0).toFixed(2)}</div>
              </div>
              <div class="mt-2 text-[11px] text-slate-400">Click to view example posts</div>
            </div>
          `
        },
      },
      colors: ["#60a5fa"],
    }
  }, [resolvedTheme, axisColor, gridBorderColor, groupBy, openExamples])

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

  const activeChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = []
    if (searchText.trim()) chips.push({ key: "search", label: `Search: \"${searchText.trim()}\"`, onClear: () => setSearchText("") })
    if (includeLowRelevance) chips.push({ key: "low", label: "Include low relevance", onClear: () => setIncludeLowRelevance(false) })
    if (sequencingOnly) chips.push({ key: "seqOnly", label: "Sequencing only", onClear: () => setSequencingOnly(false) })
    if (stakeholderPrimary.length) chips.push({ key: "stakeholder", label: `Stakeholder: ${stakeholderPrimary.join(", ")}`, onClear: () => setStakeholderPrimary([]) })
    if (sentimentLabel.length) chips.push({ key: "sentiment", label: `Sentiment: ${sentimentLabel.join(", ")}`, onClear: () => setSentimentLabel([]) })
    if (ukNation.length) chips.push({ key: "uk", label: `UK nation: ${ukNation.join(", ")}`, onClear: () => setUkNation([]) })
    if (evidenceType.length) chips.push({ key: "evidence", label: `Evidence: ${evidenceType.join(", ")}`, onClear: () => setEvidenceType([]) })
    if (flags.length) chips.push({ key: "flags", label: `Flags: ${flags.join(", ")}`, onClear: () => setFlags([]) })
    return chips
  }, [searchText, includeLowRelevance, sequencingOnly, stakeholderPrimary, sentimentLabel, ukNation, evidenceType, flags])

  const resetAll = useCallback(() => {
    setStakeholderPrimary([])
    setSentimentLabel([])
    setUkNation([])
    setEvidenceType([])
    setFlags([])
    setSequencingOnly(false)
    setIncludeLowRelevance(false)
    setSearchText("")
    setSentimentThreshold(0)
  }, [])

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
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Group</div>
              <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card_bucket">card_bucket</SelectItem>
                  <SelectItem value="topics_top_topics">topics_top_topics</SelectItem>
                  <SelectItem value="clinical_context_biomarker">clinical_context_biomarker</SelectItem>
                  <SelectItem value="competitive_context">competitive_context</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">Sentiment threshold</div>
                <div className="text-xs text-muted-foreground">
                  <span className="text-foreground">{sentimentThreshold}</span>/100
                </div>
              </div>
              <Slider value={[sentimentThreshold]} min={0} max={100} step={1} onValueChange={(v) => setSentimentThreshold(v?.[0] ?? 0)} />
            </div>
          </div>

          {/* Global filters */}
          <FilterPane
            title="Filters"
            description={
              <span>
                Refine the slice used across charts and tables (<span className="text-foreground">social media data</span>).
              </span>
            }
            rightSlot={
              <Button variant="outline" size="sm" onClick={resetAll}>
                Reset
              </Button>
            }
            metaLine={
              optionsLoading ? (
                <span className="flex items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" /> Loading filter options...
                </span>
              ) : options?.meta ? (
                <span>
                  Slice contains <span className="text-foreground">{options.meta.totalPosts.toLocaleString()}</span> posts (min {options.meta.minDate}, max{" "}
                  {options.meta.maxDate})
                </span>
              ) : null
            }
            advanced={
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Stakeholder (primary)</div>
                  <MultiSelect value={stakeholderPrimary} options={options?.stakeholderPrimary || []} onChange={setStakeholderPrimary} placeholder="All stakeholders" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Sentiment label</div>
                  <MultiSelect value={sentimentLabel} options={options?.sentimentLabel || []} onChange={setSentimentLabel} placeholder="All sentiment labels" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">UK nation</div>
                  <MultiSelect value={ukNation} options={options?.ukNation || []} onChange={setUkNation} placeholder="All UK nations" />
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Evidence type</div>
                  <MultiSelect value={evidenceType} options={options?.evidenceType || []} onChange={setEvidenceType} placeholder="All evidence types" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <div className="text-xs text-muted-foreground">Flags</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { id: "efficacy", label: "Efficacy" },
                      { id: "safety", label: "Safety" },
                      { id: "neurotox", label: "Neurotox" },
                      { id: "qol", label: "QoL" },
                      { id: "caregiver", label: "Caregiver" },
                      { id: "cns", label: "CNS" },
                      { id: "uk_access", label: "UK access" },
                    ].map((f) => {
                      const active = flags.includes(f.id)
                      return (
                        <label key={f.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={active}
                            onCheckedChange={(v) => {
                              const next = new Set(flags)
                              v ? next.add(f.id) : next.delete(f.id)
                              setFlags(Array.from(next))
                            }}
                          />
                          <span>{f.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              </div>
            }
            advancedOpen={filtersAdvancedOpen}
            onAdvancedOpenChange={setFiltersAdvancedOpen}
          >
            <div className="grid gap-3 md:grid-cols-6">
              <div className="md:col-span-2 space-y-1">
                <div className="text-xs text-muted-foreground">Date range</div>
                <div className="flex items-center gap-2">
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <div className="text-xs text-muted-foreground">→</div>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="md:col-span-2 space-y-1">
                <div className="text-xs text-muted-foreground">Search</div>
                <Input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Keyword across text + topics" />
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-3">
                <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">
                  <span className="text-sm">Include low</span>
                  <Switch checked={includeLowRelevance} onCheckedChange={setIncludeLowRelevance} />
                </label>
                <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">
                  <span className="text-sm">Sequencing only</span>
                  <Switch checked={sequencingOnly} onCheckedChange={setSequencingOnly} />
                </label>
              </div>
              <div className="md:col-span-6">
                <ActiveFiltersBar chips={activeChips} onClearAll={resetAll} />
              </div>
            </div>
          </FilterPane>

          <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="top_topics">Top Topics</TabsTrigger>
              <TabsTrigger value="scatter">Scatter</TabsTrigger>
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
                          <th className="text-right p-2">Posts</th>
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
                            <td className="p-2 text-right">{Number(r.posts || 0).toLocaleString()}</td>
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

            <TabsContent value="scatter" className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="text-sm font-medium">Scatter</div>
                <InfoTip text="Shows how groups relate across two dimensions (e.g., volume vs sentiment). Use it to identify clusters and outliers; point size reflects the selected size metric. Click a point to open example posts." />
              </div>
              <div className="h-[760px]">
                {scatterLoading ? (
                  <div className="h-full flex items-center justify-center"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Skeleton className="h-2 w-2 rounded-full" /> Loading…</div></div>
                ) : (
                  <ReactApexChart type="bubble" height="100%" width="100%" options={bubbleOptions as any} series={bubbleSeries as any} />
                )}
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
