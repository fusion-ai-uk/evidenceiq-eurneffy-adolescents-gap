"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FilterBar } from "@/components/trends/filter-bar"
import { useEffect, useMemo, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import { Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Legend, ResponsiveContainer } from "recharts"
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false })

type ViewMode = "sunburst" | "treemap" | "network"

type ThemeRow = {
  category: string
  topicTitle: string
  topicSummary: string
  groupName?: string
  retweetCount: number
  replyCount: number
  likeCount: number
  viewCount: number
  sentimentCompound: number
  hcpScore?: number
  patientScore?: number
  caregiverScore?: number
  payerScore?: number
}

export function ThemeExplorerViz() {
  const [view, setView] = useState<ViewMode>("treemap")
  const [rows, setRows] = useState<ThemeRow[]>([])
  const [loading, setLoading] = useState(false)
  const [metric, setMetric] = useState<"viewCount" | "likeCount" | "replyCount" | "retweetCount">("viewCount")
  const [audience, setAudience] = useState<"all" | "hcp" | "patient" | "caregiver" | "payer">("all")
  const [category, setCategory] = useState<string>("all")
  const [search, setSearch] = useState<string>("")
  const [minSentiment, setMinSentiment] = useState<number>(-1)
  const [selectedTopic, setSelectedTopic] = useState<ThemeRow | null>(null)
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])

  const { resolvedTheme } = useTheme()
  const axisColor = resolvedTheme === "dark" ? "#9CA3AF" : "#374151" // slate-400 vs gray-700
  const yAxisTextColor = resolvedTheme === "dark" ? "#E5E7EB" : "#111827" // gray-200 vs gray-900
  const gridBorderColor = resolvedTheme === "dark" ? "rgba(148,163,184,0.18)" : "#E5E7EB"

  useEffect(() => {
    setLoading(true)
    fetch(`/api/themes/query?limit=1000`)
      .then((r) => r.json())
      .then((d) => setRows(d.rows || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false))
  }, [])

  const sentimentColor = (s?: number) => {
    if (s === undefined || s === null) return "#94a3b8" // slate-400
    // map -1..1 to red..green
    const t = Math.max(-1, Math.min(1, s))
    const r = Math.round(255 * (1 - (t + 1) / 2))
    const g = Math.round(255 * ((t + 1) / 2))
    return `rgb(${r},${g},120)`
  }

  // Darker, high-contrast color for treemap tiles (HSL from red→green)
  const sentimentTreemapColor = (s?: number) => {
    if (s === undefined || s === null) return "hsl(210, 12%, 38%)"
    const t = (Math.max(-1, Math.min(1, s)) + 1) / 2 // 0..1
    const hue = 10 + (140 - 10) * t // 10=red/orange → 140=green
    const saturation = 70
    const lightness = 34 // darker for label contrast
    return `hsl(${hue} ${saturation}% ${lightness}%)`
  }

  const groupColor = (groupName?: string) => {
    if (!groupName) return "#64748b"
    const palette = [
      "#60a5fa",
      "#34d399",
      "#f472b6",
      "#f59e0b",
      "#a78bfa",
      "#22d3ee",
      "#fb7185",
      "#93c5fd",
    ]
    let hash = 0
    for (let i = 0; i < groupName.length; i++) hash = (hash * 31 + groupName.charCodeAt(i)) >>> 0
    return palette[hash % palette.length]
  }

  const truncate = (text: string, max = 28) =>
    text?.length > max ? `${text.slice(0, max - 1)}…` : text

  const isNoiseGroup = (r: ThemeRow) => {
    const g = String(r.groupName || '').toLowerCase()
    const t = String(r.topicTitle || '').toLowerCase()
    return (
      g.includes('noise') ||
      (g.includes('off') && g.includes('topic')) ||
      t.includes('noise / off-topic') ||
      t.includes('off-topic')
    )
  }

  const filtered = useMemo(() => {
    return rows
      .filter((r) => !isNoiseGroup(r))
      .filter((r) => (category === "all" ? true : r.category === category))
      .filter((r) => r.sentimentCompound === undefined || r.sentimentCompound >= minSentiment)
      .filter((r) => (selectedGroups.length ? selectedGroups.includes(r.groupName || "Ungrouped") : true))
      .filter((r) =>
        search.trim().length
          ? (r.topicTitle || "").toLowerCase().includes(search.toLowerCase()) ||
            (r.topicSummary || "").toLowerCase().includes(search.toLowerCase())
          : true,
      )
  }, [rows, category, minSentiment, search, audience, selectedGroups])

  const audienceWeight = (r: ThemeRow) => {
    const h = r.hcpScore ?? 0
    const p = r.patientScore ?? 0
    const c = r.caregiverScore ?? 0
    const y = r.payerScore ?? 0
    const sum = h + p + c + y
    if (sum <= 0) return 1
    if (audience === "hcp") return h / sum
    if (audience === "patient") return p / sum
    if (audience === "caregiver") return c / sum
    if (audience === "payer") return y / sum
    return 1
  }

  const valueFor = (r: ThemeRow) => ((r as any)[metric] || 0) * audienceWeight(r)

  const categories = useMemo(() => {
    const set = new Set(rows.map((r) => r.category).filter(Boolean))
    return ["all", ...Array.from(set)]
  }, [rows])

  const groups = useMemo(() => {
    const set = new Set(rows.map((r) => r.groupName || "Ungrouped").filter(Boolean))
    return Array.from(set)
  }, [rows])

  const legendGroups = useMemo(() => {
    const set = new Set(filtered.map((r) => r.groupName || "Ungrouped").filter(Boolean))
    return Array.from(set)
  }, [filtered])
  const metricLabel = useMemo(() => ({ viewCount: 'Views', likeCount: 'Likes', replyCount: 'Replies', retweetCount: 'Reshares' } as Record<string,string>)[metric] || metric, [metric])
  // Ensure tooltip fonts align with charts for hint icons

  const medianValue = useMemo(() => {
    const values = filtered.map((r) => valueFor(r)).sort((a, b) => a - b)
    if (values.length === 0) return 0
    const mid = Math.floor(values.length / 2)
    return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2
  }, [filtered, metric, audience, selectedGroups])

  // Relevance filter: keep items aligned to the Zynlonta brief (entities, AEs, access, sequencing)
  const isRelevant = (r: ThemeRow) => {
    const text = `${r.topicTitle || ''} ${r.topicSummary || ''} ${r.groupName || ''} ${r.category || ''}`.toLowerCase()
    const includePatterns = [
      /(zynlonta|loncastuximab|lonca\b|loncastux\b|adc|antibody[- ]?drug\s*conjugate)/i,
      /(epcoritamab|epkinly|epco\b)/i,
      /(glofitamab|columvi|glofi\b)/i,
      /(car[- ]?t|cell\s*therapy)/i,
      /(bispecifics?|bi[- ]?specifics?)/i,
      /(dlbcl|lymphoma|high[- ]grade\s*b[- ]cell)/i,
      /(nice|ta947|eligib|who\/?when)/i,
      /(nhs\b|trust|dgh|capacity|inpatient|outpatient)/i,
      /(qol|quality\s*of\s*life|side[- ]?effect|photosens|rash|crs|icans|infection)/i,
      /(2l|3l|sequenc|line\s*of\s*therapy)/i,
    ]
    const excludePatterns = [
      /(ivermectin|fenbendazole|homeopath|herbal|supplement|vitamin\s*c\b|alternative\s*(?:remedy|therapy))/i,
    ]
    if (excludePatterns.some((rx) => rx.test(text))) return false
    return includePatterns.some((rx) => rx.test(text))
  }

  const agg = useMemo(() => {
    const base = filtered.filter(isRelevant)
    const rowsForAgg = base.length ? base : filtered
    const totalTopics = rowsForAgg.length
    let totalValue = 0
    let pos = 0, neg = 0, neu = 0
    let sSum = 0, sCount = 0
    for (const r of rowsForAgg) {
      const v = valueFor(r)
      totalValue += v
      const s = Number(r.sentimentCompound ?? 0)
      if (!Number.isNaN(s)) { sSum += s; sCount += 1 }
      if (s >= 0.1) pos++
      else if (s <= -0.1) neg++
      else neu++
    }
    const avgSentiment = sCount ? sSum / sCount : 0
    const topPositive = [...rowsForAgg].filter(r => (r.sentimentCompound ?? 0) >= 0.1).sort((a,b) => valueFor(b) - valueFor(a))[0]
    const risks = [...rowsForAgg]
      .filter(r => (r.sentimentCompound ?? 0) <= 0 && valueFor(r) >= medianValue)
      .sort((a,b) => valueFor(b) - valueFor(a))
      .slice(0, 5)
    return { totalTopics, totalValue, pos, neg, neu, avgSentiment, topPositive, risks }
  }, [filtered, metric, audience, selectedGroups, medianValue])

  const textCalloutFor = (r?: ThemeRow) => {
    if (!r) return ""
    const t = `${r.topicTitle || ''} ${r.topicSummary || ''}`.toLowerCase()
    if (/durab/.test(t)) {
      return "Why it matters: Durability talk is rising with bispecifics—ensure Zynlonta is framed in 3L fit & real-world use, not against CAR-T alone."
    }
    if (/photosens|rash/.test(t)) {
      return "Watch-out: Rash/photosensitivity is small but negative—quick management tips can neutralise it before it shapes QoL."
    }
    if (/capacity|inpatient/.test(t)) {
      return "Access lens: Capacity & inpatient burden steer choices—highlight outpatient-friendly use in 3L to reduce friction."
    }
    if (/ta947|nice/.test(t)) {
      return "Eligibility clarity converts neutrals—short 'who/when' explainers reduce uncertainty for appropriate 3L use."
    }
    if (/car[- ]?t|cell therapy/.test(t)) {
      return "Context: CAR-T anchors efficacy expectations—position Zynlonta within 3L trade-offs (eligibility, logistics)."
    }
    if (/epcoritamab|glofitamab|bispecific/.test(t)) {
      return "2L shift: As bispecifics move earlier, 3L space opens—clarify who/when Zynlonta benefits most."
    }
    return ""
  }

  const riskBadgeFor = (r?: ThemeRow) => {
    if (!r) return ""
    const v = valueFor(r)
    const s = Number(r.sentimentCompound ?? 0)
    if (s <= 0 && v >= medianValue) return "High reach, weak sentiment—prioritise education or reframing."
    return ""
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center justify-between gap-4">
            <CardTitle>General Themes</CardTitle>
            <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="treemap">Overview</TabsTrigger>
                <TabsTrigger value="sunburst">Top Topics</TabsTrigger>
                <TabsTrigger value="network">Scatter</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <FilterBar
            groups={groups}
            metric={metric}
            audience={audience}
            selectedGroups={selectedGroups}
            minSentiment={minSentiment}
            search={search}
            onChange={({ category: c, groups: g, metric: m, audience: a, minSentiment: s, search: q }) => {
              setSelectedGroups(g)
              setMetric(m as any)
              setAudience(a as any)
              setMinSentiment(s)
              setSearch(q)
            }}
          />
          {audience !== "all" && (
            <div id="panel-header" className="-mt-1">
              <div className={`ribbon ${audience} text-[11px] rounded-md px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 w-fit`}
                   title={audience === 'hcp' ? 'HCP-weighted view' : audience === 'patient' ? 'Patient-weighted view' : audience === 'caregiver' ? 'Caregiver-weighted view' : 'Payer/NHS-weighted view'}>
                {audience === 'hcp' && 'HCP-weighted: Durability and capacity rise. Use this slice to stress sequencing clarity (2L bispecifics → room in 3L) and implementation ease for Zynlonta.'}
                {audience === 'patient' && 'Patient-weighted: More QoL and side-effects. If “rash” skews negative, prioritise support content and expectation-setting.'}
                {audience === 'caregiver' && 'Caregiver-weighted: Watch burden and logistics talk. Simplifying monitoring/appointments can lift sentiment.'}
                {audience === 'payer' && 'Payer/NHS-weighted: Eligibility and service capacity dominate. Concise NICE TA947 “who/when” reduces uncertainty.'}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative z-0">
          {view === "treemap" && (
            <div className="h-[780px] [transform:translateZ(0)]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground"><Skeleton className="h-2 w-2 rounded-full"/> Fetching data…</div>
                </div>
              ) : (
              <ReactApexChart
                key={`tm-${metric}-${audience}-${selectedGroups.join("|")}-${search}-${minSentiment}-${rows.length}`}
                type="treemap"
                height="100%"
                width="100%"
                options={{
                  theme: { mode: resolvedTheme === "dark" ? "dark" : "light" },
                  chart: { background: "transparent", toolbar: { show: false }, foreColor: axisColor, fontFamily: "Inter, ui-sans-serif, system-ui" },
                  legend: { show: false },
                  xaxis: { labels: { show: false }, axisBorder: { show: false }, axisTicks: { show: false } },
                  yaxis: { show: false },
                  dataLabels: { enabled: false },
                  tooltip: {
                    theme: "dark",
                    y: { formatter: (v: number) => v.toLocaleString() },
                    custom: ({ seriesIndex, dataPointIndex, w }: any) => {
                      const d = w.config.series[seriesIndex].data[dataPointIndex]
                      const r: ThemeRow | undefined = d?.raw
                      if (!r) return undefined
                      const s = r.sentimentCompound?.toFixed?.(2) ?? "n/a"
                      const callout = textCalloutFor(r)
                      const risk = riskBadgeFor(r)
                      return `<div class=\"px-3 py-2 text-xs\">`+
                             `<div class=\"font-medium\">${r.topicTitle}</div>`+
                             `<div class=\"text-slate-400\">${r.topicSummary || ""}</div>`+
                             `<div class=\"mt-1\">Sentiment: ${s}</div>`+
                             `${callout ? `<div class=\\"mt-1 text-amber-300\\">${callout}</div>` : ''}`+
                             `${risk ? `<div class=\\"mt-1 text-red-300\\">${risk}</div>` : ''}`+
                             `</div>`
                    },
                  },
                  plotOptions: {
                    treemap: {
                      enableShades: false,
                      distributed: true,
                      reverseNegativeShade: true,
                      useFillColorAsStroke: false,
                    },
                  },
                  grid: { show: false, borderColor: gridBorderColor, strokeDashArray: 2, padding: { top: 10, left: 10, right: 10, bottom: 10 } },
                }}
                series={[
                  {
                    data: filtered
                      .sort((a, b) => valueFor(b) - valueFor(a))
                      .slice(0, 80)
                      .map((r) => ({ x: truncate(r.topicTitle, 42), full: r.topicTitle, y: valueFor(r), fillColor: groupColor(r.groupName || "Ungrouped"), raw: r })),
                  },
                ]}
              />
              )}
            </div>
          )}

          {/* legend moved below the fixed-height chart container */}

          {view === "sunburst" && (
            <div className="h-[780px] overflow-y-auto overflow-x-hidden pr-2 [transform:translateZ(0)]">
              {(() => {
                const ranked = [...filtered].sort((a, b) => valueFor(b) - valueFor(a))
                const barChartHeight = Math.max(600, ranked.length * 36)
                return (
              <ReactApexChart
                type="bar"
                height={barChartHeight}
                width="100%"
                options={{
                  theme: { mode: resolvedTheme === "dark" ? "dark" : "light" },
                  chart: { background: "transparent", toolbar: { show: false }, foreColor: axisColor, fontFamily: "Inter, ui-sans-serif, system-ui" },
                  plotOptions: { bar: { horizontal: true, barHeight: "60%", borderRadius: 6 } },
                  dataLabels: { enabled: false },
                  xaxis: { position: 'top', labels: { style: { colors: axisColor, fontSize: "12px" } } },
                  yaxis: {
                    labels: {
                      style: { colors: yAxisTextColor, fontSize: "12px" },
                      maxWidth: 560,
                      formatter: (val: string) => {
                        const s = String(val || "")
                        if (s.length <= 42) return s
                        const parts: string[] = []
                        let rest = s
                        while (rest.length > 42) {
                          let idx = rest.lastIndexOf(" ", 42)
                          if (idx === -1) idx = 42
                          parts.push(rest.slice(0, idx))
                          rest = rest.slice(idx + 1)
                        }
                        parts.push(rest)
                        return parts.join("\n")
                      },
                    },
                  },
                  grid: { borderColor: gridBorderColor, strokeDashArray: 2, padding: { left: 16, right: 8, top: 8, bottom: 8 } },
                  tooltip: {
                    theme: "dark",
                    y: { formatter: (v: number) => v.toLocaleString() },
                    custom: ({ dataPointIndex, w }: any) => {
                      const r = ranked[dataPointIndex]
                      if (!r) return undefined
                      const s = r.sentimentCompound?.toFixed?.(2) ?? "n/a"
                      const callout = textCalloutFor(r)
                      const risk = riskBadgeFor(r)
                      return `<div class=\"px-3 py-2 text-xs\">`+
                             `<div class=\"font-medium\">${r.topicTitle}</div>`+
                             `<div class=\"text-slate-400\">${r.topicSummary || ""}</div>`+
                             `<div class=\"mt-1\">Sentiment: ${s}</div>`+
                             `${callout ? `<div class=\\"mt-1 text-amber-300\\">${callout}</div>` : ''}`+
                             `${risk ? `<div class=\\"mt-1 text-red-300\\">${risk}</div>` : ''}`+
                             `</div>`
                    },
                  },
                  fill: { type: "gradient", gradient: { shadeIntensity: 0.2, opacityFrom: 0.9, opacityTo: 0.7 } },
                  colors: undefined,
                }}
                series={[
                  {
                    name: metric,
                    data: ranked.map((r) => ({ x: r.topicTitle, y: valueFor(r), fillColor: groupColor(r.groupName || "Ungrouped") })),
                  },
                ]}
              />
              )})()}
            </div>
          )}

          {view === "network" && (
            <div className="h-[780px] [transform:translateZ(0)]">
              <div id="scatter-axes-info" className="mb-2 text-[11px] text-muted-foreground">
                <span className="px-1.5 py-0.5 mr-2 rounded bg-muted/20 text-muted-foreground">i</span>
                Read in quadrants — Top-right: amplify; Top-left: rebut/educate; Bottom-right: hidden gems (amplify); Bottom-left: monitor.
              </div>
              <ReactApexChart
                type="scatter"
                height="100%"
                width="100%"
                options={{
                  theme: { mode: resolvedTheme === "dark" ? "dark" : "light" },
                  chart: { background: "transparent", toolbar: { show: false }, foreColor: axisColor, fontFamily: "Inter, ui-sans-serif, system-ui", zoom: { enabled: false } },
                  xaxis: { min: -1, max: 1, title: { text: "Sentiment" } },
                  yaxis: { title: { text: metricLabel } },
                  grid: { borderColor: gridBorderColor, strokeDashArray: 2 },
                  tooltip: {
                    theme: "dark",
                    custom: ({ seriesIndex, dataPointIndex, w }: any) => {
                      const d = w.config.series[seriesIndex].data[dataPointIndex]
                      const r: ThemeRow | undefined = d?.raw
                      if (!r) return undefined
                      const s = r.sentimentCompound?.toFixed?.(2) ?? "n/a"
                      const callout = textCalloutFor(r)
                      const risk = riskBadgeFor(r)
                      return `<div class=\"px-3 py-2 text-xs\">`+
                             `<div class=\"font-medium\">${r.topicTitle}</div>`+
                             `<div class=\"text-slate-400\">${r.topicSummary || ""}</div>`+
                             `<div class=\"mt-1\">Sentiment: ${s}</div>`+
                             `${callout ? `<div class=\\"mt-1 text-amber-300\\">${callout}</div>` : ''}`+
                             `${risk ? `<div class=\\"mt-1 text-red-300\\">${risk}</div>` : ''}`+
                             `</div>`
                    },
                  },
                  markers: { size: 7, strokeWidth: 0, shape: "circle" },
                  colors: ["#60a5fa"],
                }}
                series={[
                  {
                    name: "Topics",
                    data: filtered.map((r) => ({ x: r.sentimentCompound ?? 0, y: valueFor(r), raw: r, fillColor: sentimentColor(r.sentimentCompound) })),
                  },
                ]}
              />
            </div>
          )}
        </div>

        {/* Group legend for treemap and bar only */}
        {view !== 'network' && legendGroups.length > 0 && (
          <div className="px-[10px]">
            <div className="rounded-lg border border-border/60 bg-card/20 supports-[backdrop-filter]:bg-card/10 backdrop-blur px-4 py-3 mt-5 mb-8">
              {view === 'treemap' && (
                <div id="treemap-legend-info" className="mb-2 text-[11px] text-muted-foreground">
                  <span className="px-1.5 py-0.5 mr-2 rounded bg-muted/20 text-muted-foreground" role="img" aria-label="Treemap legend">i</span>
                  Tile size = Views (reach). Color = sentiment (green positive, red negative). Big red tiles are high-visibility risks.
                </div>
              )}
              {view === 'sunburst' && (
                <div id="top-topics-legend-info" className="mb-2 text-[11px] text-muted-foreground">
                  <span className="px-1.5 py-0.5 mr-2 rounded bg-muted/20 text-muted-foreground" role="img" aria-label="Top topics legend">i</span>
                  Bars rank by Views. Push the sentiment filter up—topics that stay visible are low-friction messages.
                </div>
              )}
              <div className="flex flex-wrap gap-x-6 gap-y-3 items-center">
                {legendGroups.map((g) => (
                  <div key={g} className="flex items-center gap-2 text-xs">
                    <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: groupColor(g) }} />
                    <span className="text-muted-foreground">{g}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom summary + insights layout */}
        <div className="grid md:grid-cols-5 gap-6 mt-6">
          <div className="md:col-span-3 space-y-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Data slice summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Topics shown</div>
                    <div className="font-medium">{agg.totalTopics.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{metricLabel} (sum)</div>
                    <div className="font-medium">{Math.round(agg.totalValue).toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg sentiment</div>
                    <div className="font-medium">{agg.avgSentiment.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tone mix</div>
                    <div className="font-medium">{agg.pos} pos · {agg.neu} neu · {agg.neg} neg</div>
                  </div>
                </div>
                {agg.topPositive && (
                  <div className="mt-4 text-sm">
                    <div className="text-muted-foreground">Top positive theme</div>
                    <div className="font-medium">{agg.topPositive.topicTitle}</div>
                    <div className="text-xs text-muted-foreground">{agg.topPositive.topicSummary}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Watch items (high reach, low love)</CardTitle>
              </CardHeader>
              <CardContent>
                {agg.risks.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No high-reach negatives in this slice.</div>
                ) : (
                  <div className="space-y-3">
                    {agg.risks.map((r) => (
                      <div key={r.topicTitle} className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-medium">{r.topicTitle}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{r.topicSummary}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Sent.</div>
                          <div className="text-sm font-medium text-destructive">{(r.sentimentCompound ?? 0).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">What this means for Zynlonta</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-3 text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">Anchor 3L now:</span> As bispecifics move to 2L, room opens in 3L—spell out who benefits from Zynlonta and why (fit, logistics, outpatient convenience).
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Tame sticky negatives:</span> Photosensitivity rash is low reach but negative—quick management tips and expectation-setting protect QoL perceptions.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Compete with the frame:</span> Durability (CAR-T → bispecifics) sets the reference—position Zynlonta with real-world continuity in the UK system (NICE, DGH capacity).
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Eligibility clarity:</span> Short visuals for NICE TA947 “who/when” convert neutral attention into confident 3L use.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {selectedTopic && (
          <div className="grid gap-6 md:grid-cols-5 mt-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Selected Topic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-foreground font-medium">{selectedTopic.topicTitle}</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedTopic.topicSummary}</div>
                  <div className="text-xs text-muted-foreground">
                    Category: {selectedTopic.category} · Sentiment: {selectedTopic.sentimentCompound?.toFixed?.(2) ?? "n/a"}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">Audience Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      { name: "HCP", value: selectedTopic.hcpScore ?? 0 },
                      { name: "Patient", value: selectedTopic.patientScore ?? 0 },
                      { name: "Caregiver", value: selectedTopic.caregiverScore ?? 0 },
                      { name: "Payer/NHS", value: selectedTopic.payerScore ?? 0 },
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" stroke="#888" />
                      <PolarRadiusAxis domain={[0, 1]} stroke="#666" />
                      <Radar dataKey="value" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.4} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


