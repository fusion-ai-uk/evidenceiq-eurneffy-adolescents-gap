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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExamplePostsDrawer } from "@/components/alunbrig/themes/ExamplePostsDrawer"
import { SexyRadar } from "@/components/alunbrig/charts/SexyRadar"
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { parseISO, subMonths } from "date-fns"

type OptionsPayload = {
  stakeholderPrimary: string[]
  sentimentLabel: string[]
  ukNation: string[]
  evidenceType: string[]
  meta: { totalPosts: number; minDate: string; maxDate: string }
}

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
  stanceFavorAlunbrig: number
  stanceFavorCompetitor: number
  stanceBalanced: number
  stanceBreakdown?: { stance: string; posts: number; share: number }[]
  sentimentIndex: number
  pctNeurotox: number
  pctQoL: number
  pctCNS: number
  pctUKAccess: number
  pctSequencing: number
  topDrivers: { driver: string; count: number }[]
  topKeyTerms: { term: string; count: number }[]
}

type ComparatorResponse = { rows: ComparatorRow[] }

type SummaryResponse = {
  targetBrand: string
  competitor: string | null
  kpis: {
    posts: number
    competitivePosts: number
    shareCompetitive: number
    sentimentIndex: number
    pctSequencing: number
    pctQoL: number
    pctNeurotox: number
    pctCNS: number
    pctUKAccess: number
  }
  contextBreakdown: { context: string; posts: number; share: number }[]
  stanceTowardAlunbrig: { stance: string; posts: number; share: number }[]
  attributeDrivers: { attribute: string; posts: number; share: number; sentimentIndex: number; topDrivers: { driver: string; count: number }[] }[]
  topStakeholders: { label: string; count: number }[]
  topKeyTerms: { term: string; count: number }[]
  topOpportunities: { opp: string; count: number }[]
  topHurdles: { hurdle: string; count: number }[]
}

type TrendsOverallResponse = {
  granularity: "week" | "month"
  series: { period: string; totalCompetitivePosts: number; topCompetitors: { name: string; mentions: number; share: number }[] }[]
  topCompetitorsOverall: { name: string; mentions: number }[]
}

type TrendsCompetitorResponse = {
  granularity: "week" | "month"
  competitor: string
  series: Array<{
    period: string
    posts: number
    stance: { stance: string; posts: number; share: number }[]
    sentimentIndex: number
    pctNeurotox: number
    pctQoL: number
    pctCNS: number
    pctUKAccess: number
    pctSequencing: number
  }>
}

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
const toPct100 = (v: number) => {
  const n = Number(v || 0)
  return n <= 1 ? n * 100 : n
}
  const pct100 = (v: number) => `${Math.round(Number(v || 0) * 10) / 10}%`

const FLAG_OPTIONS = [
  { key: "efficacy", label: "Efficacy" },
  { key: "safety", label: "Safety" },
  { key: "neurotox", label: "Neurotox" },
  { key: "qol", label: "QoL" },
  { key: "caregiver", label: "Caregiver burden" },
  { key: "cns", label: "CNS" },
  { key: "uk_access", label: "UK access" },
] as const

const toggleMulti = (arr: string[], value: string, on: boolean) => (on ? Array.from(new Set([...arr, value])) : arr.filter((x) => x !== value))

export function CompetitorLens() {
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
    sequencingOnly: false,
    flags: [],
    evidenceType: [],
    searchText: "",
    granularity: "week",
    competitor: "",
    targetBrand: "Alunbrig",
  })

  const [applied, setApplied] = useState<DraftFilters | null>(null)

  const [listLoading, setListLoading] = useState(false)
  const [list, setList] = useState<CompetitorListResponse | null>(null)

  const [tableLoading, setTableLoading] = useState(false)
  const [table, setTable] = useState<ComparatorResponse | null>(null)

  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summary, setSummary] = useState<SummaryResponse | null>(null)

  const [trendsLoading, setTrendsLoading] = useState(false)
  const [trendsOverall, setTrendsOverall] = useState<TrendsOverallResponse | null>(null)
  const [trendsCompetitor, setTrendsCompetitor] = useState<TrendsCompetitorResponse | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState("Examples")
  const [drawerDesc, setDrawerDesc] = useState<string | undefined>(undefined)
  const [drawerMode, setDrawerMode] = useState<"competitor" | "stance" | "attribute" | "context" | "driver" | "key_term">("competitor")
  const [drawerValue, setDrawerValue] = useState("")
  const [drawerCompetitor, setDrawerCompetitor] = useState<string>("")
  const [drawerPeriod, setDrawerPeriod] = useState<string>("")
  const [drawerPeriodGranularity, setDrawerPeriodGranularity] = useState<"week" | "month">("week")
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
    if (draft.targetBrand.trim()) chips.push({ key: "target", label: `Target: ${draft.targetBrand.trim()}`, onClear: () => setDraft((d) => ({ ...d, targetBrand: "" })) })
    if (draft.competitor) chips.push({ key: "competitor", label: `Competitor: ${draft.competitor}`, onClear: () => setDraft((d) => ({ ...d, competitor: "" })) })
    if (draft.includeLowRelevance) chips.push({ key: "low", label: "Include low relevance", onClear: () => setDraft((d) => ({ ...d, includeLowRelevance: false })) })
    if (draft.sequencingOnly) chips.push({ key: "seqOnly", label: "Sequencing only", onClear: () => setDraft((d) => ({ ...d, sequencingOnly: false })) })
    if (draft.searchText?.trim()) chips.push({ key: "search", label: `Search: "${draft.searchText.trim()}"`, onClear: () => setDraft((d) => ({ ...d, searchText: "" })) })
    if (draft.stakeholder?.length) chips.push({ key: "stakeholder", label: `Stakeholder: ${draft.stakeholder.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, stakeholder: [] })) })
    if (draft.sentimentLabel?.length) chips.push({ key: "sentiment", label: `Sentiment: ${draft.sentimentLabel.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, sentimentLabel: [] })) })
    if (draft.ukNation?.length) chips.push({ key: "uk", label: `UK nation: ${draft.ukNation.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, ukNation: [] })) })
    if (draft.evidenceType?.length) chips.push({ key: "evidence", label: `Evidence: ${draft.evidenceType.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, evidenceType: [] })) })
    return chips
  }, [draft])

  const openExamples = useCallback(
    (
      mode: typeof drawerMode,
      value: string,
      competitor?: string,
      period?: { period: string; granularity: "week" | "month" },
    ) => {
      const effectiveCompetitor = (competitor ?? applied?.competitor ?? draft.competitor) || ""
      const effectiveGranularity = period?.granularity || applied?.granularity || draft.granularity

      setDrawerMode(mode)
      setDrawerValue(value)
      setDrawerCompetitor(effectiveCompetitor)
      setDrawerPeriod(period?.period || "")
      setDrawerPeriodGranularity(effectiveGranularity)
      setDrawerTitle(`${mode.replaceAll("_", " ")} | ${value}`)
      setDrawerDesc(`Showing social media data${effectiveCompetitor ? ` for ${effectiveCompetitor}` : ""}.`)
      setDrawerOpen(true)
    },
    [applied?.competitor, applied?.granularity, draft.competitor, draft.granularity],
  )

  const requestUrl = useCallback(
    (offset: number) => {
      if (!applied) return "/api/alunbrig/competitors/examples?limit=50&offset=0"
      const q = buildParams({
        startDate: applied.startDate,
        endDate: applied.endDate,
        includeLowRelevance: applied.includeLowRelevance,
        stakeholder: applied.stakeholder,
        sentimentLabel: applied.sentimentLabel,
        ukNation: applied.ukNation,
        sequencingOnly: applied.sequencingOnly,
        flags: applied.flags,
        evidenceType: applied.evidenceType,
        searchText: applied.searchText,
        targetBrand: applied.targetBrand,
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
    [applied, drawerCompetitor, drawerMode, drawerValue, drawerPeriod, drawerPeriodGranularity],
  )

  // Options: reuse /themes/options to get data-driven bounds and filter lists (stakeholders/sentiment/uk/evidence).
  useEffect(() => {
    if (!draft.startDate || !draft.endDate) return
    const q = buildParams({
      startDate: draft.startDate,
      endDate: draft.endDate,
      includeLowRelevance: draft.includeLowRelevance,
      sequencingOnly: draft.sequencingOnly,
      flags: draft.flags,
      evidenceType: draft.evidenceType,
      searchText: draft.searchText,
    })
    setOptionsLoading(true)
    fetch(`/api/alunbrig/themes/options?${q}`)
      .then((r) => r.json())
      .then((d) => setOptions(d as OptionsPayload))
      .catch(() => setOptions(null))
      .finally(() => setOptionsLoading(false))
  }, [draft.startDate, draft.endDate, draft.includeLowRelevance, draft.sequencingOnly, draft.flags, draft.evidenceType, draft.searchText])

  // Init defaults to data-driven maxDate/minDate, then apply once.
  useEffect(() => {
    if (didInit) return
    if (!options?.meta?.maxDate) return
    const maxDate = options.meta.maxDate
    const minDate = options.meta.minDate
    const max = parseISO(maxDate)
    const suggestedStart = subMonths(max, 12)
    const nextStart = toISODate(suggestedStart) < minDate ? minDate : toISODate(suggestedStart)
    const nextDraft = { ...draft, startDate: nextStart, endDate: maxDate }
    setDraft(nextDraft)
    setApplied(nextDraft)
    setDidInit(true)
  }, [didInit, options?.meta?.maxDate, options?.meta?.minDate, draft])

  const appliedParams = useMemo(() => {
    if (!applied) return null
    return {
      startDate: applied.startDate,
      endDate: applied.endDate,
      includeLowRelevance: applied.includeLowRelevance,
      stakeholder: applied.stakeholder,
      sentimentLabel: applied.sentimentLabel,
      ukNation: applied.ukNation,
      sequencingOnly: applied.sequencingOnly,
      flags: applied.flags,
      evidenceType: applied.evidenceType,
      searchText: applied.searchText,
      targetBrand: applied.targetBrand,
      granularity: applied.granularity,
    }
  }, [applied])

  // Fetch list + comparator table whenever applied changes.
  useEffect(() => {
    if (!appliedParams) return
    const q = buildParams(appliedParams)
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
    fetch(`/api/alunbrig/competitors/comparator-table?${q}&limit=20`)
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray((d as any).rows)) setTable(d as ComparatorResponse)
        else setTable(null)
      })
      .catch(() => setTable(null))
      .finally(() => setTableLoading(false))
  }, [appliedParams])

  // Summary + trends whenever applied or competitor changes.
  useEffect(() => {
    if (!appliedParams) return
    const q = buildParams({ ...appliedParams, competitor: applied?.competitor || "" })

    setSummaryLoading(true)
    fetch(`/api/alunbrig/competitors/summary?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && (d as any).kpis) setSummary(d as SummaryResponse)
        else setSummary(null)
      })
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false))

    setTrendsLoading(true)
    fetch(`/api/alunbrig/competitors/trends?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (applied?.competitor) {
          if (d && Array.isArray((d as any).series)) setTrendsCompetitor(d as TrendsCompetitorResponse)
          else setTrendsCompetitor(null)
          setTrendsOverall(null)
        } else {
          if (d && Array.isArray((d as any).series)) setTrendsOverall(d as TrendsOverallResponse)
          else setTrendsOverall(null)
          setTrendsCompetitor(null)
        }
      })
      .catch(() => {
        setTrendsOverall(null)
        setTrendsCompetitor(null)
      })
      .finally(() => setTrendsLoading(false))
  }, [appliedParams, applied?.competitor])

  const stakeholderAll = draft.stakeholder.length === 0
  const allSentiment = draft.sentimentLabel.length === 0
  const allUkNation = draft.ukNation.length === 0
  const allEvidence = draft.evidenceType.length === 0

  const stanceStack = useMemo(() => {
    if (!trendsCompetitor?.series?.length) return null
    const counts = new Map<string, number>()
    for (const p of trendsCompetitor.series) {
      for (const s of p.stance || []) counts.set(String(s.stance), (counts.get(String(s.stance)) || 0) + Number(s.posts || 0))
    }
    const top = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([stance]) => stance)
      .filter((s) => s)

    const data = trendsCompetitor.series.map((p) => {
      const row: any = { period: p.period }
      const stanceShareMap = new Map<string, number>((p.stance || []).map((s) => [String(s.stance), Number(s.share || 0) * 100]))
      top.forEach((stance, idx) => {
        row[`s${idx}`] = stanceShareMap.get(stance) || 0
      })
      return row
    })

    return { top, data }
  }, [trendsCompetitor])

  const competitorTrendShare = useMemo(() => {
    const series = trendsCompetitor?.series || []
    const total = series.reduce((acc, p) => acc + Number(p.posts || 0), 0)
    return series.map((p) => ({
      ...p,
      shareOfRangePct: total > 0 ? (Number(p.posts || 0) / total) * 100 : 0,
    }))
  }, [trendsCompetitor])

  const overallCompetitiveShare = useMemo(() => {
    const series = trendsOverall?.series || []
    const total = series.reduce((acc, p) => acc + Number(p.totalCompetitivePosts || 0), 0)
    return series.map((p) => ({
      ...p,
      shareOfRangePct: total > 0 ? (Number(p.totalCompetitivePosts || 0) / total) * 100 : 0,
    }))
  }, [trendsOverall])

  return (
    <div className="space-y-6">
      <div>
        <h1>Competitor Lens</h1>
        <p className="lead">Explore competitor conversation dynamics and positioning from social media data.</p>
      </div>

      <FilterPane
        title="Filters"
        description={
          <span>
            Refine competitor slice and positioning signals (<span className="text-foreground">social media data</span>).
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
              <div className="text-xs text-muted-foreground">Stakeholder (primary)</div>
              <MultiSelect value={draft.stakeholder} options={options?.stakeholderPrimary || []} onChange={(v) => setDraft((d) => ({ ...d, stakeholder: v }))} placeholder="All stakeholders" />
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
            <div className="text-xs text-muted-foreground">Target brand</div>
            <Input value={draft.targetBrand} onChange={(e) => setDraft((d) => ({ ...d, targetBrand: e.target.value }))} placeholder="e.g., Alunbrig" />
          </div>
          <div className="md:col-span-2 space-y-1">
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
          <div className="md:col-span-2 space-y-1">
            <div className="text-xs text-muted-foreground">Search</div>
            <Input value={draft.searchText} onChange={(e) => setDraft((d) => ({ ...d, searchText: e.target.value }))} placeholder="Keyword across text + topics" />
          </div>
          <div className="md:col-span-2 space-y-1">
            <div className="text-xs text-muted-foreground">Trends granularity</div>
            <Select value={draft.granularity} onValueChange={(v) => setDraft((d) => ({ ...d, granularity: v }))}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="week">Week</SelectItem><SelectItem value="month">Month</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">
              <span className="text-sm">Sequencing only</span>
              <Switch checked={draft.sequencingOnly} onCheckedChange={(v) => setDraft((d) => ({ ...d, sequencingOnly: v }))} />
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
      </FilterPane>      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="border-border/50 xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-medium">Comparator table</CardTitle>
          </CardHeader>
          <CardContent>
            {tableLoading || !table ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : !Array.isArray(table.rows) || table.rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">No competitors found in this slice.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Competitor</TableHead>
                    <TableHead>Share</TableHead>
                    <TableHead>Sentiment</TableHead>
                    <TableHead>Favor Alunbrig</TableHead>
                    <TableHead>Favor competitor</TableHead>
                    <TableHead>Balanced</TableHead>
                    <TableHead>%Neurotox</TableHead>
                    <TableHead>%QoL</TableHead>
                    <TableHead>%CNS</TableHead>
                    <TableHead>%UK access</TableHead>
                    <TableHead>%Sequencing</TableHead>
                    <TableHead>Top drivers</TableHead>
                    <TableHead>Top key terms</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.rows.map((r, i) => (
                    <TableRow
                      key={`${r.competitor}-${i}`}
                      className="cursor-pointer"
                      onClick={() => {
                        setDraft((d) => ({ ...d, competitor: r.competitor }))
                        setApplied((a) => (a ? { ...a, competitor: r.competitor } : null))
                      }}
                    >
                      <TableCell className="font-medium">{r.competitor}</TableCell>
                      <TableCell>{pct(r.shareCompetitive)}</TableCell>
                      <TableCell>{Math.round(Number(r.sentimentIndex || 0))}</TableCell>
                      <TableCell>{pct(r.stanceFavorAlunbrig || 0)}</TableCell>
                      <TableCell>{pct(r.stanceFavorCompetitor || 0)}</TableCell>
                      <TableCell>{pct(r.stanceBalanced || 0)}</TableCell>
                      <TableCell>{pct(r.pctNeurotox || 0)}</TableCell>
                      <TableCell>{pct(r.pctQoL || 0)}</TableCell>
                      <TableCell>{pct(r.pctCNS || 0)}</TableCell>
                      <TableCell>{pct(r.pctUKAccess || 0)}</TableCell>
                      <TableCell>{pct(r.pctSequencing || 0)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(r.topDrivers || []).slice(0, 3).map((d, j) => (
                            <button
                              key={`${r.competitor}-drv-${String(d.driver)}-${j}`}
                              className="text-xs rounded-full border px-2 py-0.5 text-muted-foreground hover:bg-accent/30"
                              onClick={(e) => {
                                e.stopPropagation()
                                openExamples("driver", String(d.driver), r.competitor)
                              }}
                            >
                              {String(d.driver)}
                            </button>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(r.topKeyTerms || []).slice(0, 5).map((t, j) => (
                            <button
                              key={`${r.competitor}-term-${String(t.term)}-${j}`}
                              className="text-xs rounded-full border px-2 py-0.5 text-muted-foreground hover:bg-accent/30"
                              onClick={(e) => {
                                e.stopPropagation()
                                openExamples("key_term", String(t.term), r.competitor)
                              }}
                            >
                              {String(t.term)}
                            </button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {applied?.competitor ? `Competitor detail | ${applied.competitor}` : "Competitive landscape"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {summaryLoading || !summary ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Sentiment index</div>
                    <div className="mt-1 text-sm font-medium">{Math.round(summary.kpis.sentimentIndex)}</div>
                  </div>
                  <div className="rounded-md border p-3">
                    <div className="text-xs text-muted-foreground">Share competitive</div>
                    <div className="mt-1 text-sm font-medium">{pct(summary.kpis.shareCompetitive)}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div>%Neurotox: <span className="text-foreground">{pct(summary.kpis.pctNeurotox)}</span></div>
                  <div>%QoL: <span className="text-foreground">{pct(summary.kpis.pctQoL)}</span></div>
                  <div>%CNS: <span className="text-foreground">{pct(summary.kpis.pctCNS)}</span></div>
                  <div>%UK access: <span className="text-foreground">{pct(summary.kpis.pctUKAccess)}</span></div>
                  <div>%Sequencing: <span className="text-foreground">{pct(summary.kpis.pctSequencing)}</span></div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-[1fr,320px] items-start">
                  <div className="rounded-md border p-3">
                    <div className="text-sm font-medium">Signal mix</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      The share of competitive conversation carrying each analysis tag (based on the current filters).
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border px-2 py-1">Seq: {pct(summary.kpis.pctSequencing)}</span>
                      <span className="rounded-full border px-2 py-1">QoL: {pct(summary.kpis.pctQoL)}</span>
                      <span className="rounded-full border px-2 py-1">Neurotox: {pct(summary.kpis.pctNeurotox)}</span>
                      <span className="rounded-full border px-2 py-1">CNS: {pct(summary.kpis.pctCNS)}</span>
                      <span className="rounded-full border px-2 py-1">UK: {pct(summary.kpis.pctUKAccess)}</span>
                    </div>
                  </div>
                  <div className="sm:justify-self-end w-full">
                    <SexyRadar
                      title="Competitive signal mix"
                      categories={["Seq", "QoL", "Neurotox", "CNS", "UK"]}
                      values={[
                        toPct100(summary.kpis.pctSequencing),
                        toPct100(summary.kpis.pctQoL),
                        toPct100(summary.kpis.pctNeurotox),
                        toPct100(summary.kpis.pctCNS),
                        toPct100(summary.kpis.pctUKAccess),
                      ]}
                      height={210}
                    />
                  </div>
                </div>

                <div className="rounded-md border p-3">
                  <div className="text-sm font-medium">Competitive context</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {summary.contextBreakdown.slice(0, 6).map((c, i) => (
                      <button
                        key={`${String(c.context)}-${i}`}
                        className="text-xs rounded-full border px-2 py-1 text-muted-foreground hover:bg-accent/30"
                        onClick={() => openExamples("context", String(c.context))}
                      >
                        {String(c.context)} | {pct(c.share)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border p-3">
                  <div className="text-sm font-medium">Stance toward Alunbrig</div>
                  <div className="mt-2 space-y-2">
                    {summary.stanceTowardAlunbrig.slice(0, 6).map((s, i) => (
                      <button
                        key={`${String(s.stance)}-${i}`}
                        className="w-full text-left rounded-md border p-2 hover:bg-accent/30"
                        onClick={() => openExamples("stance", String(s.stance))}
                      >
                        <div className="flex items-center justify-between text-sm">
                          <div className="font-medium">{String(s.stance)}</div>
                          <div className="text-xs text-muted-foreground">{pct(s.share)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border p-3">
                  <div className="text-sm font-medium">Attribute drivers</div>
                  <div className="mt-2 space-y-2">
                    {summary.attributeDrivers.slice(0, 8).map((a, i) => (
                      <button
                        key={`${String(a.attribute)}-${i}`}
                        className="w-full text-left rounded-md border p-2 hover:bg-accent/30"
                        onClick={() => openExamples("attribute", String(a.attribute))}
                      >
                        <div className="flex items-center justify-between text-sm">
                          <div className="font-medium">{String(a.attribute)}</div>
                          <div className="text-xs text-muted-foreground">{pct(a.share)} | SI {Math.round(a.sentimentIndex)}</div>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {(a.topDrivers || []).slice(0, 3).map((d, j) => (
                            <span key={`${String(a.attribute)}-${String(d.driver)}-${j}`} className="text-xs rounded-full border px-2 py-0.5 text-muted-foreground">
                              {String(d.driver)}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border p-3">
                  <div className="text-sm font-medium">Top key terms</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {summary.topKeyTerms.slice(0, 12).map((t, i) => (
                      <button
                        key={`${String(t.term)}-${i}`}
                        className="text-xs rounded-full border px-2 py-1 text-muted-foreground hover:bg-accent/30"
                        onClick={() => openExamples("key_term", String(t.term))}
                      >
                        {String(t.term)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border p-3">
                  <div className="text-sm font-medium">Top opportunities</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {summary.topOpportunities.slice(0, 10).map((o, i) => (
                      <span key={`${String(o.opp)}-${i}`} className="text-xs rounded-full border px-2 py-1 text-muted-foreground">
                        {String(o.opp)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-md border p-3">
                  <div className="text-sm font-medium">Top hurdles</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {summary.topHurdles.slice(0, 10).map((h, i) => (
                      <span key={`${String(h.hurdle)}-${i}`} className="text-xs rounded-full border px-2 py-1 text-muted-foreground">
                        {String(h.hurdle)}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {trendsLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : applied?.competitor && trendsCompetitor ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-md border p-3">
                <div className="text-sm font-medium">Sentiment over time</div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendsCompetitor.series}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="period" stroke="#666" hide />
                    <YAxis stroke="#666" domain={[0, 100]} />
                    <Tooltip />
                    <Line dataKey="sentimentIndex" stroke="#3b82f6" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-sm font-medium">Stance over time</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={stanceStack?.data || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="period" stroke="#666" hide />
                    <YAxis stroke="#666" tickFormatter={(v: any) => `${Math.round(Number(v || 0))}%`} />
                    <Tooltip formatter={(v: any) => `${Number(v || 0).toFixed(1)}%`} />
                    <Legend />
                    {(stanceStack?.top || []).map((stance, idx) => (
                      <Bar
                        key={`${stance}-${idx}`}
                        dataKey={`s${idx}`}
                        stackId="stance"
                        fill={["#3b82f6", "#10b981", "#f59e0b", "#a855f7"][idx % 4]}
                        name={stance}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-2 max-h-[260px] overflow-auto">
                  {trendsCompetitor.series.slice(-12).reverse().map((p, i) => (
                    <button
                      key={`${p.period}-${i}`}
                      className="w-full text-left rounded-md border p-2 hover:bg-accent/30"
                      onClick={() => openExamples("competitor", draft.competitor || trendsCompetitor.competitor, draft.competitor || trendsCompetitor.competitor, { period: p.period, granularity: draft.granularity })}
                    >
                      <div className="text-xs text-muted-foreground">{p.period} | Share of range: {pct100(Number((competitorTrendShare.find((x: any) => x.period === p.period) as any)?.shareOfRangePct || 0))}</div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {(p.stance || []).slice(0, 4).map((s, j) => (
                          <span key={`${p.period}-${String(s.stance)}-${j}`} className="text-xs rounded-full border px-2 py-1 text-muted-foreground">
                            {String(s.stance)} | {pct(s.share)}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : trendsOverall ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-md border p-3">
                <div className="text-sm font-medium">Competitive activity share over time</div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={overallCompetitiveShare}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="period" stroke="#666" hide />
                    <YAxis stroke="#666" tickFormatter={(v: any) => `${Math.round(Number(v || 0))}%`} />
                    <Tooltip formatter={(v: any) => `${Number(v || 0).toFixed(1)}%`} />
                    <Line dataKey="shareOfRangePct" stroke="#10b981" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-md border p-3">
                <div className="text-sm font-medium">Top competitors by period</div>
                <div className="mt-2 space-y-2 max-h-[260px] overflow-auto">
                  {trendsOverall.series.slice(-12).reverse().map((p, i) => (
                    <div key={`${p.period}-${i}`} className="rounded-md border p-2">
                      <div className="text-xs text-muted-foreground">{p.period} | Share of range: {pct100(Number((overallCompetitiveShare.find((x: any) => x.period === p.period) as any)?.shareOfRangePct || 0))}</div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {p.topCompetitors.slice(0, 5).map((c, j) => (
                          <button
                            key={`${p.period}-${String(c.name)}-${j}`}
                            className="text-xs rounded-full border px-2 py-1 text-muted-foreground hover:bg-accent/30"
                            onClick={() => openExamples("competitor", String(c.name), String(c.name), { period: p.period, granularity: draft.granularity })}
                          >
                            {c.name} | {pct(c.share)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No trend data for this slice.</div>
          )}
        </CardContent>
      </Card>

      <ExamplePostsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={drawerTitle} description={drawerDesc} requestUrl={requestUrl} />
    </div>
  )
}



