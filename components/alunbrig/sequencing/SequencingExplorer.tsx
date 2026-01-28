"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FilterPane } from "@/components/alunbrig/filters/FilterPane"
import { MultiSelect } from "@/components/alunbrig/filters/MultiSelect"
import { ActiveFiltersBar, type ActiveFilterChip } from "@/components/alunbrig/filters/ActiveFiltersBar"
import { ExamplePostsDrawer } from "@/components/alunbrig/themes/ExamplePostsDrawer"
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts"
import { parseISO, subMonths } from "date-fns"

type OptionsPayload = {
  stakeholder: string[]
  sentimentLabel: string[]
  ukNation: string[]
  evidenceType: string[]
  biomarker: string[]
  cnsContext: string[]
  meta: { totalPosts: number; minDate: string; maxDate: string }
}

type DraftFilters = {
  startDate: string
  endDate: string
  includeLowRelevance: boolean
  stakeholder: string[]
  sentimentLabel: string[]
  ukNation: string[]
  evidenceType: string[]
  biomarker: string[]
  cnsContext: string[]
  searchText: string

  sequencingOnly: boolean
  ukAccessOnly: boolean
  pfsOnly: boolean
  granularity: "week" | "month"

  xDim: "stakeholder" | "line_of_therapy" | "biomarker" | "uk_nation"
  yDim: "sequence_direction" | "attrition" | "pfs" | "cns_context"
  metric: "posts" | "pct"
}

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

const pct = (v: number) => `${Math.round(Number(v || 0) * 1000) / 10}%`

export function SequencingExplorer() {
  const today = new Date()
  const yearAgo = subMonths(today, 12)

  const [options, setOptions] = useState<OptionsPayload | null>(null)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [didInit, setDidInit] = useState(false)

  const [draft, setDraft] = useState<DraftFilters>({
    startDate: toISODate(yearAgo),
    endDate: toISODate(today),
    includeLowRelevance: false,
    stakeholder: [],
    sentimentLabel: [],
    ukNation: [],
    evidenceType: [],
    biomarker: [],
    cnsContext: [],
    searchText: "",

    sequencingOnly: true,
    ukAccessOnly: false,
    pfsOnly: false,
    granularity: "week",

    xDim: "stakeholder",
    yDim: "sequence_direction",
    metric: "pct",
  })

  const [applied, setApplied] = useState<DraftFilters | null>(null)

  const [overview, setOverview] = useState<any>(null)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [timeseries, setTimeseries] = useState<any>(null)
  const [timeseriesLoading, setTimeseriesLoading] = useState(false)
  const [flow, setFlow] = useState<any>(null)
  const [flowLoading, setFlowLoading] = useState(false)
  const [matrix, setMatrix] = useState<any>(null)
  const [matrixLoading, setMatrixLoading] = useState(false)
  const [ukOverlay, setUkOverlay] = useState<any>(null)
  const [ukLoading, setUkLoading] = useState(false)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState("Examples")
  const [drawerDesc, setDrawerDesc] = useState<string | undefined>(undefined)
  const [drawerMode, setDrawerMode] = useState<"lot" | "direction" | "matrix" | "flow" | "rationale" | "uk_signal" | "period">("lot")
  const [drawerArgs, setDrawerArgs] = useState<Record<string, string>>({})
  const [filtersAdvancedOpen, setFiltersAdvancedOpen] = useState(false)

  const apply = useCallback(() => setApplied(draft), [draft])

  const discard = useCallback(() => {
    if (applied) setDraft(applied)
  }, [applied])

  const hasUnsavedChanges = useMemo(() => {
    if (!applied) return false
    try {
      return JSON.stringify(draft) !== JSON.stringify(applied)
    } catch {
      return true
    }
  }, [draft, applied])

  const activeChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = []
    if (draft.searchText.trim()) chips.push({ key: "search", label: `Search: "${draft.searchText.trim()}"`, onClear: () => setDraft((d) => ({ ...d, searchText: "" })) })
    if (draft.includeLowRelevance) chips.push({ key: "low", label: "Include low relevance", onClear: () => setDraft((d) => ({ ...d, includeLowRelevance: false })) })
    if (draft.sequencingOnly) chips.push({ key: "seqOnly", label: "Sequencing only", onClear: () => setDraft((d) => ({ ...d, sequencingOnly: false })) })
    if (draft.pfsOnly) chips.push({ key: "pfsOnly", label: "PFS/PFS2 only", onClear: () => setDraft((d) => ({ ...d, pfsOnly: false })) })
    if (draft.ukAccessOnly) chips.push({ key: "ukOnly", label: "UK access only", onClear: () => setDraft((d) => ({ ...d, ukAccessOnly: false })) })
    if (draft.stakeholder.length) chips.push({ key: "stakeholder", label: `Stakeholder: ${draft.stakeholder.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, stakeholder: [] })) })
    if (draft.sentimentLabel.length) chips.push({ key: "sentiment", label: `Sentiment: ${draft.sentimentLabel.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, sentimentLabel: [] })) })
    if (draft.ukNation.length) chips.push({ key: "uk", label: `UK nation: ${draft.ukNation.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, ukNation: [] })) })
    if (draft.evidenceType.length) chips.push({ key: "evidence", label: `Evidence: ${draft.evidenceType.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, evidenceType: [] })) })
    if (draft.biomarker.length) chips.push({ key: "biomarker", label: `Biomarker: ${draft.biomarker.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, biomarker: [] })) })
    if (draft.cnsContext.length) chips.push({ key: "cns", label: `CNS: ${draft.cnsContext.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, cnsContext: [] })) })
    return chips
  }, [draft])

  const openExamples = useCallback((mode: typeof drawerMode, title: string, args: Record<string, string>) => {
    setDrawerMode(mode)
    setDrawerArgs(args)
    setDrawerTitle(title)
    setDrawerDesc("Showing social media data for the selected slice.")
    setDrawerOpen(true)
  }, [])

  const requestUrl = useCallback(
    (offset: number) => {
      if (!applied) return "/api/alunbrig/sequencing/examples?limit=50&offset=0"
      const q = buildParams({
        startDate: applied.startDate,
        endDate: applied.endDate,
        includeLowRelevance: applied.includeLowRelevance,
        stakeholder: applied.stakeholder,
        sentimentLabel: applied.sentimentLabel,
        ukNation: applied.ukNation,
        evidenceType: applied.evidenceType,
        biomarker: applied.biomarker,
        cnsContext: applied.cnsContext,
        searchText: applied.searchText,
        sequencingOnly: applied.sequencingOnly,
        ukAccessOnly: applied.ukAccessOnly,
        pfsOnly: applied.pfsOnly,
        mode: drawerMode,
        granularity: applied.granularity,
        limit: 50,
        offset,
        ...drawerArgs,
      })
      return `/api/alunbrig/sequencing/examples?${q}`
    },
    [applied, drawerMode, drawerArgs],
  )

  const toggleMulti = (arr: string[], value: string, on: boolean) => (on ? Array.from(new Set([...arr, value])) : arr.filter((x) => x !== value))

  // Options are data-driven within the selected date range.
  useEffect(() => {
    if (!draft.startDate || !draft.endDate) return
    const q = buildParams({
      startDate: draft.startDate,
      endDate: draft.endDate,
      includeLowRelevance: draft.includeLowRelevance,
      stakeholder: draft.stakeholder,
      sentimentLabel: draft.sentimentLabel,
      ukNation: draft.ukNation,
      evidenceType: draft.evidenceType,
      biomarker: draft.biomarker,
      cnsContext: draft.cnsContext,
      searchText: draft.searchText,
    })
    setOptionsLoading(true)
    fetch(`/api/alunbrig/sequencing/options?${q}`)
      .then((r) => r.json())
      .then((d) => setOptions(d as OptionsPayload))
      .catch(() => setOptions(null))
      .finally(() => setOptionsLoading(false))
  }, [draft.startDate, draft.endDate, draft.includeLowRelevance, draft.stakeholder, draft.sentimentLabel, draft.ukNation, draft.evidenceType, draft.biomarker, draft.cnsContext, draft.searchText])

  // Init defaults to data-driven maxDate/minDate, then apply once.
  useEffect(() => {
    if (didInit) return
    if (!options?.meta?.maxDate) return
    const maxDate = options.meta.maxDate
    const minDate = options.meta.minDate
    const max = parseISO(maxDate)
    const suggestedStart = subMonths(max, 12)
    const nextStart = toISODate(suggestedStart) < minDate ? minDate : toISODate(suggestedStart)

    const nextDraft: DraftFilters = {
      ...draft,
      startDate: nextStart,
      endDate: maxDate,
      sequencingOnly: true,
      stakeholder: (() => {
        const set = new Set(options.stakeholder || [])
        const preferred = ["HCP", "Patient", "Caregiver"].filter((x) => set.has(x))
        return preferred.length > 0 ? preferred : []
      })(),
    }
    setDraft(nextDraft)
    setApplied(nextDraft)
    setDidInit(true)
  }, [didInit, options?.meta?.maxDate, options?.meta?.minDate, options?.stakeholder, draft])

  const appliedParams = useMemo(() => {
    if (!applied) return null
    return {
      startDate: applied.startDate,
      endDate: applied.endDate,
      includeLowRelevance: applied.includeLowRelevance,
      stakeholder: applied.stakeholder,
      sentimentLabel: applied.sentimentLabel,
      ukNation: applied.ukNation,
      evidenceType: applied.evidenceType,
      biomarker: applied.biomarker,
      cnsContext: applied.cnsContext,
      searchText: applied.searchText,
      sequencingOnly: applied.sequencingOnly,
      ukAccessOnly: applied.ukAccessOnly,
      pfsOnly: applied.pfsOnly,
      granularity: applied.granularity,
    }
  }, [applied])

  useEffect(() => {
    if (!appliedParams) return
    const q = buildParams(appliedParams)

    setOverviewLoading(true)
    fetch(`/api/alunbrig/sequencing/overview?${q}`)
      .then((r) => r.json())
      .then(setOverview)
      .catch(() => setOverview(null))
      .finally(() => setOverviewLoading(false))

    setTimeseriesLoading(true)
    fetch(`/api/alunbrig/sequencing/timeseries?${q}`)
      .then((r) => r.json())
      .then(setTimeseries)
      .catch(() => setTimeseries(null))
      .finally(() => setTimeseriesLoading(false))

    setFlowLoading(true)
    fetch(`/api/alunbrig/sequencing/flow?${q}`)
      .then((r) => r.json())
      .then(setFlow)
      .catch(() => setFlow(null))
      .finally(() => setFlowLoading(false))

    setMatrixLoading(true)
    fetch(`/api/alunbrig/sequencing/matrix?${q}&xDim=${draft.xDim}&yDim=${draft.yDim}&metric=${draft.metric}`)
      .then((r) => r.json())
      .then(setMatrix)
      .catch(() => setMatrix(null))
      .finally(() => setMatrixLoading(false))

    setUkLoading(true)
    fetch(`/api/alunbrig/sequencing/uk-overlay?${q}`)
      .then((r) => r.json())
      .then(setUkOverlay)
      .catch(() => setUkOverlay(null))
      .finally(() => setUkLoading(false))
  }, [appliedParams, draft.xDim, draft.yDim, draft.metric])

  const timeseriesChartData = useMemo(() => {
    const series = timeseries?.series || []
    const baselineMap = new Map<string, number | null>(
      (timeseries?.baseline?.values || []).map((x: any) => [String(x.period), x.baselineSequencingPosts]),
    )

    return series.map((p: any) => {
      const baselineSequencingPosts = baselineMap.get(String(p.period)) ?? null
      const seq = Number(p.sequencingPosts || 0)
      const base = baselineSequencingPosts == null ? null : Number(baselineSequencingPosts || 0)
      const seqIndex = base && base > 0 ? (seq / base) * 100 : null
      return { ...p, baselineSequencingPosts, seqIndex, baselineIndex: base && base > 0 ? 100 : null }
    })
  }, [timeseries])

  const flowTotal = useMemo(() => (flow?.links || []).reduce((acc: number, l: any) => acc + Number(l.value || 0), 0) || 0, [flow])
  const rationaleTotal = useMemo(() => (overview?.topRationales || []).reduce((acc: number, r: any) => acc + Number(r.count || 0), 0) || 0, [overview])
  const ukNationTotal = useMemo(() => (ukOverlay?.nations || []).reduce((acc: number, n: any) => acc + Number(n.posts || 0), 0) || 0, [ukOverlay])

  const lotData = useMemo(() => {
    const arr = (overview?.lineOfTherapy || []).slice(0, 12)
    const total = arr.reduce((acc: number, x: any) => acc + Number(x.posts || 0), 0) || 0
    return arr.map((x: any) => ({ ...x, sharePct: total > 0 ? (Number(x.posts || 0) / total) * 100 : 0 }))
  }, [overview])

  const directionData = useMemo(() => {
    const arr = (overview?.sequenceDirections || []).slice(0, 12)
    const total = arr.reduce((acc: number, x: any) => acc + Number(x.posts || 0), 0) || 0
    return arr.map((x: any) => ({ ...x, sharePct: total > 0 ? (Number(x.posts || 0) / total) * 100 : 0 }))
  }, [overview])

  const matrixCellMap = useMemo(() => {
    const m = new Map<string, { posts: number; value: number }>()
    for (const c of matrix?.cells || []) m.set(`${c.y}|||${c.x}`, { posts: Number(c.posts || 0), value: Number(c.value || 0) })
    return m
  }, [matrix])

  const matrixMax = useMemo(() => {
    let max = 0
    for (const c of matrix?.cells || []) max = Math.max(max, Number(c.value || 0) || 0)
    return max || 1
  }, [matrix])

  return (
    <div className="space-y-6">
      <div>
        <h1>Sequencing &amp; Treatment Pathways</h1>
        <p className="lead">Explore sequencing prevalence, pathway flows, and constraints using social media data.</p>
      </div>

      <FilterPane
        title="Filters"
        description={
          <span>
            Refine sequencing and pathway slices (<span className="text-foreground">social media data</span>).
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
            <Button type="button" size="sm" onClick={apply} disabled={!draft.startDate || !draft.endDate}>
              Apply
            </Button>
          </div>
        }
        metaLine={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {optionsLoading ? (
              <span>Loading filter options...</span>
            ) : options?.meta ? (
              <span>
                {options.meta.minDate} -> {options.meta.maxDate}
              </span>
            ) : null}
            {applied ? <Badge variant="secondary">Applied</Badge> : null}
          </div>
        }
        advancedOpen={filtersAdvancedOpen}
        onAdvancedOpenChange={setFiltersAdvancedOpen}
        advanced={
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Stakeholder</div>
              <MultiSelect value={draft.stakeholder} options={options?.stakeholder || []} onChange={(v) => setDraft((d) => ({ ...d, stakeholder: v }))} placeholder="All stakeholders" />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Sentiment label</div>
              <MultiSelect value={draft.sentimentLabel} options={options?.sentimentLabel || []} onChange={(v) => setDraft((d) => ({ ...d, sentimentLabel: v }))} placeholder="All sentiment labels" />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">UK nation</div>
              <MultiSelect value={draft.ukNation} options={options?.ukNation || []} onChange={(v) => setDraft((d) => ({ ...d, ukNation: v }))} placeholder="All UK nations" />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Evidence type</div>
              <MultiSelect value={draft.evidenceType} options={options?.evidenceType || []} onChange={(v) => setDraft((d) => ({ ...d, evidenceType: v }))} placeholder="All evidence types" />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">Biomarker</div>
              <MultiSelect value={draft.biomarker} options={options?.biomarker || []} onChange={(v) => setDraft((d) => ({ ...d, biomarker: v }))} placeholder="All biomarkers" />
            </div>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">CNS context</div>
              <MultiSelect value={draft.cnsContext} options={options?.cnsContext || []} onChange={(v) => setDraft((d) => ({ ...d, cnsContext: v }))} placeholder="All CNS contexts" />
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
            <Input value={draft.searchText} onChange={(e) => setDraft((d) => ({ ...d, searchText: e.target.value }))} placeholder="Matches text, key terms, or top topics" />
          </div>
          <div className="md:col-span-2 space-y-1">
            <div className="text-xs text-muted-foreground">Granularity</div>
            <Select value={draft.granularity} onValueChange={(v) => setDraft((d) => ({ ...d, granularity: v }))}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="week">Week</SelectItem><SelectItem value="month">Month</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="md:col-span-6 grid gap-3 md:grid-cols-3">
            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">
              <span className="text-sm">Sequencing only</span>
              <Switch checked={draft.sequencingOnly} onCheckedChange={(v) => setDraft((d) => ({ ...d, sequencingOnly: v }))} />
            </label>
            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">
              <span className="text-sm">PFS/PFS2 only</span>
              <Switch checked={draft.pfsOnly} onCheckedChange={(v) => setDraft((d) => ({ ...d, pfsOnly: v }))} />
            </label>
            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">
              <span className="text-sm">UK access only</span>
              <Switch checked={draft.ukAccessOnly} onCheckedChange={(v) => setDraft((d) => ({ ...d, ukAccessOnly: v }))} />
            </label>
            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2 md:col-span-3">
              <span className="text-sm">Include low relevance</span>
              <Switch checked={draft.includeLowRelevance} onCheckedChange={(v) => setDraft((d) => ({ ...d, includeLowRelevance: v }))} />
            </label>
          </div>
          <div className="md:col-span-6">
            <ActiveFiltersBar chips={activeChips} />
          </div>
        </div>
      </FilterPane>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-medium">Sequencing</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{pct(overview?.kpis?.pctSequencing || 0)}</CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-medium">PFS/PFS2</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{pct(overview?.kpis?.pctPFS || 0)}</CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-medium">Attrition</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{pct(overview?.kpis?.pctAttrition || 0)}</CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-medium">UK access</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{pct(overview?.kpis?.pctUKAccess || 0)}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-medium">Sequencing over time</CardTitle></CardHeader>
          <CardContent className="flex flex-col">
            {timeseriesLoading || !timeseries ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeseriesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="period" hide />
                  <YAxis tickFormatter={(v: any) => `${Math.round(Number(v || 0))}%`} />
                  <Tooltip formatter={(v: any) => (v == null ? "n/a" : `${Number(v || 0).toFixed(1)}%`)} />
                  <Line dataKey="seqIndex" stroke="#3b82f6" dot={false} name="Index vs baseline" />
                  <Line dataKey="baselineIndex" stroke="#94a3b8" strokeDasharray="4 4" dot={false} name="Baseline (100)" />
                </LineChart>
              </ResponsiveContainer>
            )}
            <div className="mt-3 flex-1 min-h-[260px] max-h-[420px] overflow-auto space-y-2">
              {timeseriesChartData.slice(-12).reverse().map((p: any, i: number) => (
                <button key={`${p.period}-${i}`} className="w-full text-left rounded-md border p-2 hover:bg-accent/30" onClick={() => openExamples("period", `Period | ${p.period}`, { period: String(p.period) })}>
                  <div className="text-xs text-muted-foreground">
                    {p.period} | Index vs baseline: {p.seqIndex == null ? "n/a" : `${Math.round(Number(p.seqIndex || 0))}%`}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Sequencing share: {pct(p.pctSequencing)} | PFS: {pct(p.pctPFS)} | Attrition: {pct(p.pctAttrition)} | UK access: {pct(p.pctUKAccess)}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-medium">Pathway flow (top links)</CardTitle></CardHeader>
          <CardContent>
            {flowLoading || !flow ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (flow?.links || []).length === 0 ? (
              <div className="text-sm text-muted-foreground">No flow links in this slice.</div>
            ) : (
              <div className="space-y-2">
                {(flow.links || []).slice(0, 12).map((l: any, i: number) => (
                  <button key={`${l.source}-${l.target}-${i}`} className="w-full text-left rounded-md border p-2 hover:bg-accent/30" onClick={() => openExamples("flow", `Flow | ${l.source} -> ${l.target}`, { sourceNode: String(l.source), targetNode: String(l.target) })}>
                    <div className="text-sm font-medium">{l.source} -> {l.target}</div>
                    <div className="text-xs text-muted-foreground">{flowTotal > 0 ? `${((Number(l.value || 0) / flowTotal) * 100).toFixed(1)}% share` : "—"}</div>
                  </button>
                ))}
                <div className="text-xs text-muted-foreground">{flow?.meta?.notes}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">Pathway breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-sm font-medium">Line of therapy</div>
              <div className="mt-2">
                {overviewLoading || !overview ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={lotData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="lot" hide />
                      <YAxis tickFormatter={(v: any) => `${Math.round(Number(v || 0))}%`} />
                      <Tooltip formatter={(v: any) => `${Number(v || 0).toFixed(1)}%`} />
                      <Bar
                        dataKey="sharePct"
                        fill="#10b981"
                        onClick={(d: any) => openExamples("lot", `LoT | ${String(d?.lot)}`, { lotValue: String(d?.lot) })}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium">Sequence direction</div>
              <div className="mt-2">
                {overviewLoading || !overview ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={directionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="direction" hide />
                      <YAxis tickFormatter={(v: any) => `${Math.round(Number(v || 0))}%`} />
                      <Tooltip formatter={(v: any) => `${Number(v || 0).toFixed(1)}%`} />
                      <Bar
                        dataKey="sharePct"
                        fill="#f59e0b"
                        onClick={(d: any) => openExamples("direction", `Direction | ${String(d?.direction)}`, { directionValue: String(d?.direction) })}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-medium">Top rationales</CardTitle></CardHeader>
          <CardContent>
            {overviewLoading || !overview ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (overview.topRationales || []).length === 0 ? (
              <div className="text-sm text-muted-foreground">No rationales in this slice.</div>
            ) : (
              <div className="space-y-2">
                {(overview.topRationales || []).slice(0, 10).map((r: any, i: number) => (
                  <button
                    key={`${r.rationale}-${i}`}
                    className="w-full text-left rounded-md border p-2 hover:bg-accent/30"
                    onClick={() => openExamples("rationale", `Rationale | ${String(r.rationale)}`, { rationaleValue: String(r.rationale) })}
                  >
                    <div className="text-sm font-medium">{r.rationale}</div>
                    <div className="text-xs text-muted-foreground">{rationaleTotal > 0 ? `${((Number(r.count || 0) / rationaleTotal) * 100).toFixed(1)}% share` : "—"}</div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-base font-medium">Matrix heatmap</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1"><div className="text-xs text-muted-foreground">X dimension</div><Select value={draft.xDim} onValueChange={(v) => setDraft((d) => ({ ...d, xDim: v as any }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="stakeholder">Stakeholder</SelectItem><SelectItem value="line_of_therapy">Line of therapy</SelectItem><SelectItem value="biomarker">Biomarker</SelectItem><SelectItem value="uk_nation">UK nation</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><div className="text-xs text-muted-foreground">Y dimension</div><Select value={draft.yDim} onValueChange={(v) => setDraft((d) => ({ ...d, yDim: v as any }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="sequence_direction">Sequence direction</SelectItem><SelectItem value="attrition">Attrition</SelectItem><SelectItem value="pfs">PFS/PFS2</SelectItem><SelectItem value="cns_context">CNS context</SelectItem></SelectContent></Select></div>
            <div className="space-y-1"><div className="text-xs text-muted-foreground">Metric</div><Select value="pct" onValueChange={() => setDraft((d) => ({ ...d, metric: "pct" }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pct">Row share</SelectItem></SelectContent></Select></div>
          </div>

          {matrixLoading || !matrix ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (matrix.xValues || []).length === 0 || (matrix.yValues || []).length === 0 ? (
            <div className="text-sm text-muted-foreground">No matrix data for this slice.</div>
          ) : (
            <div className="overflow-auto rounded-md border">
              <table className="min-w-[720px] w-full text-xs">
                <thead className="bg-muted/20">
                  <tr>
                    <th className="p-2 text-left">Y \\ X</th>
                    {(matrix.xValues || []).slice(0, 12).map((x: string) => (<th key={x} className="p-2 text-left whitespace-nowrap">{x}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {(matrix.yValues || []).slice(0, 12).map((y: string) => (
                    <tr key={y} className="border-t">
                      <td className="p-2 font-medium whitespace-nowrap">{y}</td>
                      {(matrix.xValues || []).slice(0, 12).map((x: string) => {
                        const cell = matrixCellMap.get(`${y}|||${x}`)
                        const val = cell ? cell.value : 0
                        const intensity = Math.round((val / matrixMax) * 60)
                        return (
                          <td key={`${y}-${x}`} className="p-2">
                            <button
                              className="w-full rounded px-2 py-1 text-left"
                              style={{ backgroundColor: `rgba(59,130,246,${Math.min(0.6, intensity / 100)})` }}
                              onClick={() => openExamples("matrix", `Matrix | ${x} x ${y}`, { xDim: draft.xDim, yDim: draft.yDim, xValue: x, yValue: y })}
                            >
                              {pct(val)}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-base font-medium">UK access overlay</CardTitle></CardHeader>
        <CardContent>
          {ukLoading || !ukOverlay ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (ukOverlay.nations || []).length === 0 ? (
            <div className="text-sm text-muted-foreground">No UK access rows in this slice.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(ukOverlay.nations || []).slice(0, 6).map((n: any) => (
                <div key={n.nation} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{n.nation}</div>
                    <div className="text-xs text-muted-foreground">{ukNationTotal > 0 ? `${((Number(n.posts || 0) / ukNationTotal) * 100).toFixed(1)}% share` : "—"}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>PFS: <span className="text-foreground">{pct(n.pctPFS)}</span></div>
                    <div>Attrition: <span className="text-foreground">{pct(n.pctAttrition)}</span></div>
                    <div>Sequencing: <span className="text-foreground">{pct(n.pctSequencing)}</span></div>
                    <div>SI: <span className="text-foreground">{Math.round(Number(n.sentimentIndex || 0))}</span></div>
                  </div>
                  <div className="mt-2 text-xs font-medium">Top signals</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(n.topSignals || []).slice(0, 8).map((s: any) => (
                      <button key={s.signal} className="text-xs rounded-full border px-2 py-1 text-muted-foreground hover:bg-accent/30" onClick={() => openExamples("uk_signal", `UK signal | ${String(s.signal)}`, { signalValue: String(s.signal) })}>{s.signal}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ExamplePostsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={drawerTitle} description={drawerDesc} requestUrl={requestUrl} />
    </div>
  )
}

