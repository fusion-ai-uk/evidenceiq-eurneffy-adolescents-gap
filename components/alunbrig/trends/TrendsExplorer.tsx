"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { FilterPane } from "@/components/alunbrig/filters/FilterPane"
import { MultiSelect } from "@/components/alunbrig/filters/MultiSelect"
import { ActiveFiltersBar, type ActiveFilterChip } from "@/components/alunbrig/filters/ActiveFiltersBar"
import { ExamplePostsDrawer } from "@/components/alunbrig/themes/ExamplePostsDrawer"
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { parseISO, subMonths } from "date-fns"

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

type ThemeEvolutionResponse = {
  granularity: Granularity
  rising: Array<{
    label: string
    type: "topic" | "bucket"
    startCount: number
    endCount: number
    delta: number
    pctChange: number
    sentimentIndexEnd: number
    topStakeholdersEnd: { label: string; count: number }[]
    topKeyTermsEnd: { term: string; count: number }[]
  }>
  falling: ThemeEvolutionResponse["rising"]
}

type OptionsResponse = {
  sentimentLabel: string[]
  evidenceType: string[]
  meta: { totalPosts: number; minDate: string; maxDate: string }
}

type DraftFilters = {
  granularity: Granularity
  startDate: string
  endDate: string
  stakeholder: string[]
  sentimentGroup: "all" | "positive" | "neutral" | "negative" | "mixed"
  sequencingOnly: boolean
  ukOnly: boolean
  includeLowRelevance: boolean
  flags: string[]
  evidenceType: string[]
  searchText: string
}

type AppliedFilters = DraftFilters & { sentimentLabel: string[] }

const toISODate = (d: Date) => d.toISOString().slice(0, 10)

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

function classifySentimentLabel(label: string): "positive" | "negative" | "mixed" | "neutral" {
  const s = label.toLowerCase()
  if (s.includes("positive")) return "positive"
  if (s.includes("negative")) return "negative"
  if (s.includes("mixed")) return "mixed"
  return "neutral"
}

export function TrendsExplorer() {
  const today = new Date()
  const yearAgo = subMonths(today, 12)

  const [options, setOptions] = useState<OptionsResponse | null>(null)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [didInit, setDidInit] = useState(false)

  const [draft, setDraft] = useState<DraftFilters>({
    granularity: "week",
    startDate: toISODate(yearAgo),
    endDate: toISODate(today),
    stakeholder: [],
    sentimentGroup: "all",
    sequencingOnly: false,
    ukOnly: false,
    includeLowRelevance: false,
    flags: [],
    evidenceType: [],
    searchText: "",
  })

  const [applied, setApplied] = useState<AppliedFilters | null>(null)

  const [showBaseline, setShowBaseline] = useState(true)
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const [tsLoading, setTsLoading] = useState(false)
  const [ts, setTs] = useState<TimeseriesResponse | null>(null)

  const [alertsLoading, setAlertsLoading] = useState(false)
  const [alerts, setAlerts] = useState<AlertsResponse | null>(null)

  const [evoLoading, setEvoLoading] = useState(false)
  const [evo, setEvo] = useState<ThemeEvolutionResponse | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState("Examples")
  const [drawerDesc, setDrawerDesc] = useState<string | undefined>(undefined)
  const [drawerMode, setDrawerMode] = useState<"period" | "alert" | "theme">("period")
  const [drawerPeriod, setDrawerPeriod] = useState<string>("")
  const [drawerTheme, setDrawerTheme] = useState<{ type: "topic" | "bucket"; label: string } | null>(null)

  const sentimentLabelPool = useMemo(() => options?.sentimentLabel || [], [options])

  // Fetch options (meta bounds + label/evidence options) for the current draft date range and stable toggles.
  useEffect(() => {
    if (!draft.startDate || !draft.endDate) return
    const q = buildParams({
      startDate: draft.startDate,
      endDate: draft.endDate,
      granularity: draft.granularity,
      includeLowRelevance: draft.includeLowRelevance,
      sequencingOnly: draft.sequencingOnly,
      ukOnly: draft.ukOnly,
      flags: draft.flags,
    })

    setOptionsLoading(true)
    fetch(`/api/alunbrig/trends/options?${q}`)
      .then((r) => r.json())
      .then((d) => setOptions(d as OptionsResponse))
      .catch(() => setOptions(null))
      .finally(() => setOptionsLoading(false))
  }, [draft.startDate, draft.endDate, draft.granularity, draft.includeLowRelevance, draft.sequencingOnly, draft.ukOnly, draft.flags])

  const deriveSentimentLabels = useCallback(
    (d: DraftFilters) => {
      const group = d.sentimentGroup
      return group === "all" ? [] : sentimentLabelPool.filter((l) => classifySentimentLabel(l) === group)
    },
    [sentimentLabelPool],
  )

  // Initialize defaults once we have options meta (to use data-driven maxDate) and immediately apply.
  useEffect(() => {
    if (didInit) return
    if (!options?.meta?.maxDate) return

    const maxDate = options.meta.maxDate
    const minDate = options.meta.minDate
    const max = parseISO(maxDate)
    const suggestedStart = subMonths(max, 12)
    const suggestedStartIso = toISODate(suggestedStart)
    const nextStart = suggestedStartIso < minDate ? minDate : suggestedStartIso

    const nextDraft: DraftFilters = { ...draft, startDate: nextStart, endDate: maxDate }
    setDraft(nextDraft)
    setApplied({ ...nextDraft, sentimentLabel: deriveSentimentLabels(nextDraft) })
    setDidInit(true)
  }, [didInit, options?.meta?.maxDate, options?.meta?.minDate, deriveSentimentLabels, draft])

  const buildAppliedFilters = useCallback(
    (): AppliedFilters => ({ ...draft, sentimentLabel: deriveSentimentLabels(draft) }),
    [draft, deriveSentimentLabels],
  )

  const apply = useCallback(() => {
    const next = buildAppliedFilters()
    setApplied(next)
  }, [buildAppliedFilters])
  const discard = useCallback(() => {
    if (!applied) return
    const { sentimentLabel: _sl, ...rest } = applied
    setDraft(rest)
  }, [applied])

  const hasUnsavedChanges = useMemo(() => {
    if (!applied) return false
    try {
      const { sentimentLabel: _sl, ...appliedComparable } = applied
      return JSON.stringify(draft) !== JSON.stringify(appliedComparable)
    } catch {
      return true
    }
  }, [draft, applied])

  const activeChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = []
    const q = draft.searchText.trim()
    if (q) chips.push({ key: "search", label: `Search: \"${q}\"`, onClear: () => setDraft((d) => ({ ...d, searchText: "" })) })
    if (draft.sequencingOnly) chips.push({ key: "seqOnly", label: "Sequencing only", onClear: () => setDraft((d) => ({ ...d, sequencingOnly: false })) })
    if (draft.ukOnly) chips.push({ key: "ukOnly", label: "UK-related only", onClear: () => setDraft((d) => ({ ...d, ukOnly: false })) })
    if (draft.includeLowRelevance) chips.push({ key: "low", label: "Include low relevance", onClear: () => setDraft((d) => ({ ...d, includeLowRelevance: false })) })
    if (draft.stakeholder.length) chips.push({ key: "stakeholder", label: `Stakeholder: ${draft.stakeholder.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, stakeholder: [] })) })
    if (draft.sentimentGroup !== "all") chips.push({ key: "sentimentGroup", label: `Sentiment: ${draft.sentimentGroup}`, onClear: () => setDraft((d) => ({ ...d, sentimentGroup: "all" })) })
    if (draft.flags.length) chips.push({ key: "flags", label: `Flags: ${draft.flags.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, flags: [] })) })
    if (draft.evidenceType.length) chips.push({ key: "evidence", label: `Evidence: ${draft.evidenceType.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, evidenceType: [] })) })
    return chips
  }, [draft])

  const baseAppliedParams = useMemo(() => {
    if (!applied) return null
    return {
      startDate: applied.startDate,
      endDate: applied.endDate,
      granularity: applied.granularity,
      includeLowRelevance: applied.includeLowRelevance,
      stakeholder: applied.stakeholder,
      sentimentLabel: applied.sentimentLabel,
      sequencingOnly: applied.sequencingOnly,
      ukOnly: applied.ukOnly,
      flags: applied.flags,
      evidenceType: applied.evidenceType,
      searchText: applied.searchText,
    }
  }, [applied])

  // Fetch all three panels only when Apply is clicked.
  useEffect(() => {
    if (!baseAppliedParams) return

    const q = buildParams(baseAppliedParams)

    setTsLoading(true)
    setAlertsLoading(true)
    setEvoLoading(true)

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

    fetch(`/api/alunbrig/trends/theme-evolution?${q}`)
      .then((r) => r.json())
      .then((d) => setEvo(d as ThemeEvolutionResponse))
      .catch(() => setEvo(null))
      .finally(() => setEvoLoading(false))
  }, [baseAppliedParams])

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
      setDrawerTheme(null)
      setDrawerTitle(mode === "alert" ? `Alert period | ${period}` : `Period | ${period}`)
      setDrawerDesc("Showing social media data for this period.")
      setDrawerOpen(true)
    },
    [],
  )

  const openExamplesForTheme = useCallback((type: "topic" | "bucket", label: string) => {
    setDrawerMode("theme")
    setDrawerTheme({ type, label })
    setDrawerPeriod("")
    setDrawerTitle(`${type === "topic" ? "Topic" : "Bucket"} | ${label}`)
    setDrawerDesc("Showing social media data for the end-window slice of the selected range.")
    setDrawerOpen(true)
  }, [])

  const requestUrl = useCallback(
    (offset: number) => {
      if (!applied) return "/api/alunbrig/trends/examples?limit=50&offset=0"
      const base = {
        startDate: applied.startDate,
        endDate: applied.endDate,
        granularity: applied.granularity,
        includeLowRelevance: applied.includeLowRelevance,
        stakeholder: applied.stakeholder,
        sentimentLabel: applied.sentimentLabel,
        sequencingOnly: applied.sequencingOnly,
        ukOnly: applied.ukOnly,
        flags: applied.flags,
        evidenceType: applied.evidenceType,
        searchText: applied.searchText,
        mode: drawerMode,
        period: drawerMode === "theme" ? undefined : drawerPeriod,
        type: drawerMode === "theme" ? drawerTheme?.type : undefined,
        label: drawerMode === "theme" ? drawerTheme?.label : undefined,
        limit: 50,
        offset,
      }
      return `/api/alunbrig/trends/examples?${buildParams(base)}`
    },
    [applied, drawerMode, drawerPeriod, drawerTheme],
  )

  const stakeholderAll = draft.stakeholder.length === 0

  const sentimentButtons: Array<{ key: DraftFilters["sentimentGroup"]; label: string }> = [
    { key: "all", label: "All" },
    { key: "positive", label: "Positive" },
    { key: "neutral", label: "Neutral" },
    { key: "negative", label: "Negative" },
    { key: "mixed", label: "Mixed" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1>Trends Explorer</h1>
        <p className="lead">Track conversation volume, above-baseline alerts, and theme evolution from social media data.</p>
      </div>

      <FilterPane
        title="Filters"
        description={
          <span>
            Configure trend slice and alerting thresholds (<span className="text-foreground">social media data</span>).
          </span>
        }
        hasUnsavedChanges={hasUnsavedChanges}
        rightSlot={
          <div className="flex items-center gap-2">
            {hasUnsavedChanges ? (
              <Button type="button" variant="outline" size="sm" onClick={discard}>
                Discard
              </Button>
            ) : null}
            <Button type="button" size="sm" onClick={apply} disabled={optionsLoading}>
              Apply
            </Button>
          </div>
        }
        metaLine={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {optionsLoading ? <span>Loading filter options...</span> : options?.meta ? (
              <span>{options.meta.minDate} -> {options.meta.maxDate}</span>
            ) : null}
            {applied ? <Badge variant="secondary">Applied</Badge> : null}
          </div>
        }
        advancedOpen={advancedOpen}
        onAdvancedOpenChange={setAdvancedOpen}
        advanced={
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Stakeholder</div>
              <MultiSelect value={draft.stakeholder} options={["HCP","Patient","Caregiver","Payer","Other"]} onChange={(v) => setDraft((d) => ({ ...d, stakeholder: v }))} placeholder="All stakeholders" />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Evidence type</div>
              <MultiSelect value={draft.evidenceType} options={options?.evidenceType || []} onChange={(v) => setDraft((d) => ({ ...d, evidenceType: v }))} placeholder="All evidence types" />
            </div>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-6">
          <div className="md:col-span-2 space-y-1">
            <div className="text-xs text-muted-foreground">Date range</div>
            <div className="flex items-center gap-2">
              <Input type="date" value={draft.startDate} onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))} />
              <div className="text-xs text-muted-foreground">-></div>
              <Input type="date" value={draft.endDate} onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))} />
            </div>
          </div>
          <div className="md:col-span-2 space-y-1">
            <div className="text-xs text-muted-foreground">Search</div>
            <Input value={draft.searchText} onChange={(e) => setDraft((d) => ({ ...d, searchText: e.target.value }))} placeholder="Keyword across text + topics" />
          </div>
          <div className="md:col-span-2 space-y-1">
            <div className="text-xs text-muted-foreground">Granularity</div>
            <Select value={draft.granularity} onValueChange={(v) => setDraft((d) => ({ ...d, granularity: v }))}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="day">Day</SelectItem><SelectItem value="week">Week</SelectItem><SelectItem value="month">Month</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 space-y-1">
            <div className="text-xs text-muted-foreground">Sentiment group</div>
            <Select value={draft.sentimentGroup} onValueChange={(v) => setDraft((d) => ({ ...d, sentimentGroup: v }))}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">
              <span className="text-sm">Sequencing only</span>
              <Switch checked={draft.sequencingOnly} onCheckedChange={(v) => setDraft((d) => ({ ...d, sequencingOnly: v }))} />
            </label>
            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">
              <span className="text-sm">UK only</span>
              <Switch checked={draft.ukOnly} onCheckedChange={(v) => setDraft((d) => ({ ...d, ukOnly: v }))} />
            </label>
            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">
              <span className="text-sm">Include low</span>
              <Switch checked={draft.includeLowRelevance} onCheckedChange={(v) => setDraft((d) => ({ ...d, includeLowRelevance: v }))} />
            </label>
          </div>
          <div className="md:col-span-6">
            <ActiveFiltersBar chips={activeChips} />
          </div>
        </div>
      </FilterPane>

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">Theme evolution | Rising</CardTitle>
          </CardHeader>
          <CardContent>
            {evoLoading ? (
              <div className="text-sm text-muted-foreground">Loading rising themes...</div>
            ) : !evo || evo.rising.length === 0 ? (
              <div className="text-sm text-muted-foreground">No rising themes in this slice.</div>
            ) : (
              <div className="space-y-2">
                {evo.rising.map((r) => (
                  <button
                    key={`${r.type}:${r.label}`}
                    className="w-full text-left rounded-md border p-3 hover:bg-accent/30"
                    onClick={() => openExamplesForTheme(r.type, r.label)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium truncate" title={r.label}>
                        {r.label}
                      </div>
                      <div className="text-xs text-muted-foreground">{r.type}</div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Change vs baseline: +{Math.round(r.pctChange * 100)}% | Sentiment end: {Math.round(r.sentimentIndexEnd)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">Theme evolution | Falling</CardTitle>
          </CardHeader>
          <CardContent>
            {evoLoading ? (
              <div className="text-sm text-muted-foreground">Loading falling themes...</div>
            ) : !evo || evo.falling.length === 0 ? (
              <div className="text-sm text-muted-foreground">No falling themes in this slice.</div>
            ) : (
              <div className="space-y-2">
                {evo.falling.map((r) => (
                  <button
                    key={`${r.type}:${r.label}`}
                    className="w-full text-left rounded-md border p-3 hover:bg-accent/30"
                    onClick={() => openExamplesForTheme(r.type, r.label)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium truncate" title={r.label}>
                        {r.label}
                      </div>
                      <div className="text-xs text-muted-foreground">{r.type}</div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Change vs baseline: {Math.round(r.pctChange * 100)}% | Sentiment end: {Math.round(r.sentimentIndexEnd)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ExamplePostsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={drawerTitle} description={drawerDesc} requestUrl={requestUrl} />
    </div>
  )
}



