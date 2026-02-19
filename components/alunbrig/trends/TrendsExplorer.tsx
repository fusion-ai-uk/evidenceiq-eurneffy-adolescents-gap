"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ExamplePostsDrawer } from "@/components/alunbrig/themes/ExamplePostsDrawer"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { subMonths } from "date-fns"
import { DateRangeControl } from "@/components/alunbrig/filters/DateRangeControl"
import { toDateInputValue } from "@/lib/date-input"

type Granularity = "day" | "week" | "month"

type TimeseriesPoint = {
  period: string
  posts: number
  engagement: number
  views: number
  sentimentIndex: number
  avgPolarity: number
  pctSequencing: number
  pctQoL: number
  pctNeurotox: number
  pctCNS: number
  pctUKAccess: number
}

type TimeseriesResponse = {
  granularity: Granularity
  startDate: string
  endDate: string
  series: TimeseriesPoint[]
  baseline: { method: string; values: { period: string; baselinePosts: number | null }[] }
}

type AlertsResponse = {
  granularity: Granularity
  alerts: Array<{
    period: string
    posts: number
    baselinePosts: number
    delta: number
    pctChange: number
    sentimentIndex: number
    avgPolarity: number
    mostInvolvedStakeholder: { label: string; share: number }
    topBuckets: { bucket: string; share: number }[]
    topTopics: { topic: string; count: number }[]
    topDrivers: { driver: string; count: number }[]
    explanation: string
  }>
}

type OptionsResponse = {
  cardBuckets: string[]
  meta: { totalPosts: number; minDate: string; maxDate: string }
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

export function TrendsExplorer() {
  const today = new Date()
  const yearAgo = subMonths(today, 12)

  const [options, setOptions] = useState<OptionsResponse | null>(null)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const granularity: Granularity = "week"
  const [startDate, setStartDate] = useState(toDateInputValue(yearAgo))
  const [endDate, setEndDate] = useState(toDateInputValue(today))
  const [cardBucket, setCardBucket] = useState<string>("all")

  const [showBaseline, setShowBaseline] = useState(true)

  const [tsLoading, setTsLoading] = useState(false)
  const [ts, setTs] = useState<TimeseriesResponse | null>(null)

  const [alertsLoading, setAlertsLoading] = useState(false)
  const [alerts, setAlerts] = useState<AlertsResponse | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState("Examples")
  const [drawerDesc, setDrawerDesc] = useState<string | undefined>(undefined)
  const [drawerMode, setDrawerMode] = useState<"period" | "alert">("period")
  const [drawerPeriod, setDrawerPeriod] = useState<string>("")

  const appliedParams = useMemo(() => {
    return {
      startDate,
      endDate,
      granularity,
      cardBucket: cardBucket === "all" ? [] : [cardBucket],
    }
  }, [startDate, endDate, granularity, cardBucket])

  // Fetch available card buckets for the selected date range.
  useEffect(() => {
    if (!startDate || !endDate) return
    const q = buildParams({
      startDate,
      endDate,
      granularity,
    })

    setOptionsLoading(true)
    fetch(`/api/alunbrig/trends/options?${q}`)
      .then((r) => r.json())
      .then((d) => {
        const next = d as OptionsResponse
        setOptions(next)
        const pool = new Set((next?.cardBuckets || []).filter(Boolean))
        if (cardBucket !== "all" && !pool.has(cardBucket)) setCardBucket("all")
      })
      .catch(() => setOptions(null))
      .finally(() => setOptionsLoading(false))
  }, [startDate, endDate, granularity, cardBucket])

  // Fetch panels when filters change.
  useEffect(() => {
    if (!startDate || !endDate) return
    const q = buildParams(appliedParams)

    setTsLoading(true)
    setAlertsLoading(true)

    fetch(`/api/alunbrig/trends/timeseries?${q}`)
      .then((r) => r.json())
      .then((d) => setTs(d as TimeseriesResponse))
      .catch(() => setTs(null))
      .finally(() => setTsLoading(false))

    fetch(`/api/alunbrig/trends/alerts?${q}`)
      .then((r) => r.json())
      .then((d) => setAlerts(d as AlertsResponse))
      .catch(() => setAlerts(null))
      .finally(() => setAlertsLoading(false))
  }, [appliedParams, startDate, endDate])

  const chartData = useMemo(() => {
    const series = ts?.series || []
    const baselineMap = new Map<string, number | null>()
    for (const b of ts?.baseline?.values || []) baselineMap.set(b.period, b.baselinePosts ?? null)
    const totalPosts = series.reduce((acc, p) => acc + Number(p.posts || 0), 0)
    const baselineTotal = (ts?.baseline?.values || []).reduce((acc, b) => acc + Number(b.baselinePosts || 0), 0)

    return series.map((p) => ({
      ...p,
      baselinePosts: baselineMap.get(p.period) ?? null,
      sharePct: totalPosts > 0 ? (Number(p.posts || 0) / totalPosts) * 100 : 0,
      baselineSharePct:
        baselineTotal > 0 && (baselineMap.get(p.period) ?? null) != null
          ? (Number(baselineMap.get(p.period) || 0) / baselineTotal) * 100
          : null,
    }))
  }, [ts])

  const openExamplesForPeriod = useCallback(
    (period: string, mode: "period" | "alert" = "period") => {
      setDrawerMode(mode)
      setDrawerPeriod(period)
      setDrawerTitle(mode === "alert" ? `Alert period | ${period}` : `Period | ${period}`)
      setDrawerDesc("Showing social media data for this period.")
      setDrawerOpen(true)
    },
    [],
  )

  const requestUrl = useCallback(
    (offset: number) => {
      const base = {
        ...appliedParams,
        mode: drawerMode,
        period: drawerPeriod,
        limit: 50,
        offset,
      }
      return `/api/alunbrig/trends/examples?${buildParams(base)}`
    },
    [appliedParams, drawerMode, drawerPeriod],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1>Trends Explorer</h1>
        <p className="lead">Track conversation volume and above-baseline alerts from social media data.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base font-medium">Filters</CardTitle>
              <div className="text-sm text-muted-foreground">Filter trends by date range and card bucket.</div>
            </div>
            <div className="text-xs text-muted-foreground">
              {optionsLoading ? "Loading…" : options?.meta?.totalPosts ? `${Number(options.meta.totalPosts).toLocaleString()} posts in range` : null}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-6">
            <div className="md:col-span-3 space-y-1">
              <div className="text-xs text-muted-foreground">Date range</div>
              <DateRangeControl startDate={startDate} endDate={endDate} onChange={(nextStart, nextEnd) => {
                setStartDate(nextStart)
                setEndDate(nextEnd)
              }} />
            </div>
            <div className="md:col-span-3 space-y-1">
              <div className="text-xs text-muted-foreground">Card bucket</div>
              <Select value={cardBucket} onValueChange={setCardBucket}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All buckets</SelectItem>
                  {(options?.cardBuckets || []).map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-medium">Conversation volume over time</CardTitle>
              <div className="text-sm text-muted-foreground">Click a point to open example posts.</div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={showBaseline} onCheckedChange={setShowBaseline} />
              Baseline
            </label>
          </div>
        </CardHeader>
        <CardContent>
          {tsLoading ? (
            <div className="text-sm text-muted-foreground">Loading time series...</div>
          ) : !ts || chartData.length === 0 ? (
            <div className="text-sm text-muted-foreground">No time series data for the current filters. Try expanding the date range.</div>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
              <LineChart
                data={chartData}
                onClick={(e: any) => {
                  const payload = e?.activePayload?.[0]?.payload
                  const period = payload?.period
                  if (period) openExamplesForPeriod(String(period), "period")
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="period" stroke="#666" style={{ fontSize: "12px" }} />
                <YAxis stroke="#666" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    color: "hsl(var(--popover-foreground))",
                    boxShadow: "0 12px 36px rgba(0,0,0,0.22)",
                  }}
                  labelStyle={{ color: "hsl(var(--popover-foreground))", fontWeight: 600 }}
                  itemStyle={{ color: "hsl(var(--popover-foreground))" }}
                  formatter={(value: any, name: any, props: any) => {
                    if (name === "baselineSharePct") return [value == null ? "n/a" : `${Number(value).toFixed(1)}%`, "Baseline share"]
                    if (name === "sharePct") return [`${Number(value).toFixed(1)}%`, "Share of range"]
                    return [value, name]
                  }}
                  labelFormatter={(v: any) => String(v)}
                />
                <Line type="monotone" dataKey="sharePct" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
                {showBaseline ? (
                  <Line
                    type="monotone"
                    dataKey="baselineSharePct"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="6 4"
                    isAnimationActive={false}
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">Above-baseline alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="text-sm text-muted-foreground">Loading alerts...</div>
          ) : !alerts || alerts.alerts.length === 0 ? (
            <div className="text-sm text-muted-foreground">No alerts triggered in this slice.</div>
          ) : (
            <div className="space-y-2">
              {alerts.alerts.map((a) => (
                <button
                  key={a.period}
                  className="w-full text-left rounded-md border p-3 hover:bg-accent/30"
                  onClick={() => openExamplesForPeriod(a.period, "alert")}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-medium">{a.period}</div>
                    <div className="text-xs text-muted-foreground">
                      Lift vs baseline: +{Math.round(a.pctChange * 100)}%
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Sentiment index: {Math.round(a.sentimentIndex)} | Most involved: {a.mostInvolvedStakeholder?.label || "Unknown"}
                  </div>
                  <div className="mt-2 text-sm">{a.explanation}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Drivers: {(a.topDrivers || []).slice(0, 2).map((d) => d.driver).filter(Boolean).join(" | ") || "n/a"} | Topics: {(a.topTopics || []).slice(0, 3).map((t) => t.topic).filter(Boolean).join(" | ") || "n/a"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ExamplePostsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={drawerTitle} description={drawerDesc} requestUrl={requestUrl} />
    </div>
  )
}



