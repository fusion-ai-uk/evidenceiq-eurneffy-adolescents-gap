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
import { FilterPane } from "@/components/alunbrig/filters/FilterPane"
import { MultiSelect } from "@/components/alunbrig/filters/MultiSelect"
import { ActiveFiltersBar, type ActiveFilterChip } from "@/components/alunbrig/filters/ActiveFiltersBar"

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

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

  const openExamples = useCallback((gBy: GroupBy, gVal: string) => {
    setDrawerGroupBy(gBy)
    setDrawerGroupValue(gVal)
    setDrawerOpen(true)
  }, [])

  useEffect(() => {
    if (!startDate || !endDate) return
    setOptionsLoading(true)
    const q = buildParams({
      startDate,
      endDate,
      includeLowRelevance,
      sequencingOnly,
      flags,
      evidenceType,
      searchText,
    })
    fetch(`/api/alunbrig/themes/options?${q}`)
      .then((r) => r.json())
      .then((d) => setOptions(d))
      .catch(() => setOptions(null))
      .finally(() => setOptionsLoading(false))
  }, [startDate, endDate, includeLowRelevance, sequencingOnly, flags, evidenceType, searchText])

  useEffect(() => {
    if (!startDate || !endDate) return
    setOverviewLoading(true)
    const q = buildParams({ ...baseFilterParams, groupBy, metric, limit: 600 })
    fetch(`/api/alunbrig/themes/overview?${q}`)
      .then((r) => r.json())
      .then((d) => setOverviewItems(d.items || []))
      .catch(() => setOverviewItems([]))
      .finally(() => setOverviewLoading(false))
  }, [baseFilterParams, groupBy, metric, startDate, endDate])

  useEffect(() => {
    if (!startDate || !endDate) return
    setTopTopicsLoading(true)
    const q = buildParams({ ...baseFilterParams, metric, limit: 50 })
    fetch(`/api/alunbrig/themes/top-topics?${q}`)
      .then((r) => r.json())
      .then((d) => setTopTopicsRows(d.rows || []))
      .catch(() => setTopTopicsRows([]))
      .finally(() => setTopTopicsLoading(false))
  }, [baseFilterParams, metric, startDate, endDate])

  useEffect(() => {
    if (!startDate || !endDate) return
    setScatterLoading(true)
    const q = buildParams({ ...baseFilterParams, groupBy, metric, xMetric: "posts", sizeMetric: "engagement", limit: 500 })
    fetch(`/api/alunbrig/themes/scatter?${q}`)
      .then((r) => r.json())
      .then((d) => setScatterPoints(d.points || []))
      .catch(() => setScatterPoints([]))
      .finally(() => setScatterLoading(false))
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
            if (raw?.group) openExamples(groupBy, raw.group)
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
          return `
            <div class="px-3 py-2 text-xs">
              <div class="font-medium">${r.group}</div>
              <div class="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                <div>Posts</div><div class="text-right">${Number(r.posts || 0).toLocaleString()}</div>
                <div>${metricLabel(metric)}</div><div class="text-right">${Number(r.metricValue || 0).toLocaleString()}</div>
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
    if (searchText.trim()) chips.push({ key: "search", label: `Search: "${searchText.trim()}"`, onClear: () => setSearchText("") })
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
            <CardTitle>Theme Explorer</CardTitle>
            <div className="text-sm text-muted-foreground">Explore themes from <span className="text-foreground">social media data</span>.</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Controls */}
          <div className="grid gap-3 md:grid-cols-3 rounded-md border p-3 bg-card/40">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Metric</span>
              <select className="h-8 rounded-md bg-background border px-2 text-sm" value={metric} onChange={(e) => setMetric(e.target.value as Metric)}>
                <option value="volume">Volume</option>
                <option value="engagement">Engagement</option>
                <option value="views">Views</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Group</span>
              <select className="h-8 rounded-md bg-background border px-2 text-sm" value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupBy)}>
                <option value="card_bucket">card_bucket</option>
                <option value="topics_top_topics">topics_top_topics</option>
                <option value="clinical_context_biomarker">clinical_context_biomarker</option>
                <option value="competitive_context">competitive_context</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Sentiment threshold</span>
                <span className="text-xs text-muted-foreground"><span className="text-foreground">{sentimentThreshold}</span>/100</span>
              </div>
              <input type="range" min={0} max={100} step={1} value={sentimentThreshold} onChange={(e) => setSentimentThreshold(Number(e.target.value))} />
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
                  Slice contains <span className="text-foreground">{options.meta.totalPosts.toLocaleString()}</span> posts (min {options.meta.minDate}, max {options.meta.maxDate})
                </span>
              ) : null
            }
            advancedOpen={filtersAdvancedOpen}
            onAdvancedOpenChange={setFiltersAdvancedOpen}
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
          >
            <div className="grid gap-3 md:grid-cols-6">
              <div className="md:col-span-2 space-y-1">
                <div className="text-xs text-muted-foreground">Date range</div>
                <div className="flex items-center gap-2">
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <div className="text-xs text-muted-foreground">-></div>
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
              <div className="h-[760px]">
                {overviewLoading ? (
                  <div className="h-full flex items-center justify-center"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Skeleton className="h-2 w-2 rounded-full" /> Loading...</div></div>
                ) : (
                  <ReactApexChart type="treemap" height="100%" width="100%" options={treemapOptions as any} series={treemapSeries as any} />
                )}
              </div>
            </TabsContent>

            <TabsContent value="top_topics" className="mt-4">
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
                          <th className="text-right p-2">{metricLabel(metric)}</th>
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
                          <tr key={r.topic} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => openExamples("topics_top_topics", r.topic)}>
                            <td className="p-2 font-medium">{r.topic}</td>
                            <td className="p-2 text-right">{Number(r.posts || 0).toLocaleString()}</td>
                            <td className="p-2 text-right">{Number(r.metricValue || 0).toLocaleString()}</td>
                            <td className="p-2 text-right">{Number(r.sentimentIndex || 0).toFixed(1)}</td>
                            <td className="p-2 text-right">{Math.round(Number(r.pctSequencing || 0) * 100)}%</td>
                            <td className="p-2 text-right">{Math.round(Number(r.pctQoL || 0) * 100)}%</td>
                            <td className="p-2 text-right">{Math.round(Number(r.pctNeurotox || 0) * 100)}%</td>
                            <td className="p-2 text-right">{Math.round(Number(r.pctCNS || 0) * 100)}%</td>
                            <td className="p-2 text-right">{Math.round(Number(r.pctUKAccess || 0) * 100)}%</td>
                            <td className="p-2 text-xs text-muted-foreground">{(r.topStakeholders || []).map((s: any) => s.label).filter(Boolean).join(", ") || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scatter" className="mt-4">
              <div className="h-[760px]">
                {scatterLoading ? (
                  <div className="h-full flex items-center justify-center"><div className="flex items-center gap-2 text-xs text-muted-foreground"><Skeleton className="h-2 w-2 rounded-full" /> Loading...</div></div>
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
        onOpenChange={setDrawerOpen}
        title={drawerGroupValue}
        description={`Group: ${drawerGroupBy}`}
        requestUrl={examplesUrl}
      />
    </div>
  )
}

