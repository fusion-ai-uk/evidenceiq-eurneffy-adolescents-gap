"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { FilterPane } from "@/components/alunbrig/filters/FilterPane"
import { ActiveFiltersBar, type ActiveFilterChip } from "@/components/alunbrig/filters/ActiveFiltersBar"
import { ExamplePostsDrawer } from "@/components/alunbrig/themes/ExamplePostsDrawer"
import { SexyRadar } from "@/components/alunbrig/charts/SexyRadar"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { parseISO, subMonths } from "date-fns"

type AudienceKey = "HCP" | "Patient" | "Caregiver" | "Payer" | "Other" | "All"

type SummaryResponse = {
  dateRange: { startDate: string; endDate: string }
  softShares: Record<Exclude<AudienceKey, "All">, number>
  hardShares: Record<Exclude<AudienceKey, "All">, { posts: number; share: number }>
  flagRatesOverall: {
    pctSequencing: number
    pctQoL: number
    pctNeurotox: number
    pctCaregiverBurden: number
    pctCNS: number
    pctUKAccess: number
  }
}

type LeaderboardResponse = {
  audience: AudienceKey
  topics: Array<{
    topic: string
    posts: number
    sentimentIndex: number
    pctSequencing: number
    pctQoL: number
    pctNeurotox: number
    pctCNS: number
    pctUKAccess: number
    topKeyTerms: { term: string; count: number }[]
  }>
  buckets: Array<{
    bucket: string
    posts: number
    sentimentIndex: number
    pctSequencing: number
    pctQoL: number
    pctNeurotox: number
    pctCNS: number
    pctUKAccess: number
    topDrivers: { driver: string; count: number }[]
    topHurdles: { hurdle: string; count: number }[]
    topOpportunities: { opp: string; count: number }[]
  }>
  flagRates: {
    pctSequencing: number
    pctQoL: number
    pctNeurotox: number
    pctCaregiverBurden: number
    pctCNS: number
    pctUKAccess: number
  }
}

type CompetitiveResponse = {
  audience: AudienceKey
  competitiveContextShare: { context: string; posts: number; share: number }[]
  stanceTowardAlunbrig: { stance: string; posts: number; share: number }[]
  topCompetitorsMentioned: { competitor: string; mentions: number }[]
  topBrandsMentioned: { brand: string; mentions: number }[]
}

type UkAccessResponse = {
  audience: AudienceKey
  totalUKAccessPosts: number
  nationBreakdown: { nation: string; posts: number; sentimentIndex: number }[]
  topAccessSignals: { signal: string; count: number }[]
  topHurdles: { hurdle: string; count: number }[]
  topOpportunities: { opp: string; count: number }[]
  topTopics: { topic: string; count: number }[]
  topEvidenceTypes: { type: string; count: number }[]
}

type DraftFilters = {
  startDate: string
  endDate: string
  includeLowRelevance: boolean
  sequencingOnly: boolean
  searchText: string
  flags: string[]
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

function pct(v: number) {
  return `${Math.round(v * 100)}%`
}

function toPct100(v: number) {
  const n = Number(v || 0)
  return n <= 1 ? n * 100 : n
}

const AUDIENCES: AudienceKey[] = ["HCP", "Patient", "Caregiver", "Payer", "Other"]

export function AudienceInsights() {
  const today = new Date()
  const yearAgo = subMonths(today, 12)

  const [draft, setDraft] = useState<DraftFilters>({
    startDate: toISODate(yearAgo),
    endDate: toISODate(today),
    includeLowRelevance: false,
    sequencingOnly: false,
    searchText: "",
    flags: [],
  })

  const [applied, setApplied] = useState<DraftFilters>(draft)
  const [softMode, setSoftMode] = useState(true)
  const [tab, setTab] = useState<AudienceKey>("HCP")

  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summary, setSummary] = useState<SummaryResponse | null>(null)

  const [leaderLoading, setLeaderLoading] = useState(false)
  const [leader, setLeader] = useState<LeaderboardResponse | null>(null)

  const [compLoading, setCompLoading] = useState(false)
  const [comp, setComp] = useState<CompetitiveResponse | null>(null)

  const [ukLoading, setUkLoading] = useState(false)
  const [uk, setUk] = useState<UkAccessResponse | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState("Examples")
  const [drawerDesc, setDrawerDesc] = useState<string | undefined>(undefined)
  const [drawerMode, setDrawerMode] = useState<"topic" | "bucket" | "competitive_context" | "stance" | "uk_signal">("topic")
  const [drawerValue, setDrawerValue] = useState<string>("")

  const apply = useCallback(() => {
    setApplied(draft)
  }, [draft])
  const discard = useCallback(() => setDraft(applied), [applied])

  const hasUnsavedChanges = useMemo(() => {
    try {
      return JSON.stringify(draft) !== JSON.stringify(applied)
    } catch {
      return true
    }
  }, [draft, applied])

  const activeChips = useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = []
    const q = draft.searchText.trim()
    if (q) chips.push({ key: "search", label: `Search: "${q}"`, onClear: () => setDraft((d) => ({ ...d, searchText: "" })) })
    if (draft.sequencingOnly) chips.push({ key: "seqOnly", label: "Sequencing only", onClear: () => setDraft((d) => ({ ...d, sequencingOnly: false })) })
    if (draft.includeLowRelevance) chips.push({ key: "low", label: "Include low relevance", onClear: () => setDraft((d) => ({ ...d, includeLowRelevance: false })) })
    if (draft.flags.length) chips.push({ key: "flags", label: `Flags: ${draft.flags.join(", ")}`, onClear: () => setDraft((d) => ({ ...d, flags: [] })) })
    return chips
  }, [draft])

  const baseParams = useMemo(
    () => ({
      startDate: applied.startDate,
      endDate: applied.endDate,
      includeLowRelevance: applied.includeLowRelevance,
      sequencingOnly: applied.sequencingOnly,
      searchText: applied.searchText,
      flags: applied.flags,
    }),
    [applied],
  )

  // Summary + comparator always refresh on Apply.
  useEffect(() => {
    const q = buildParams(baseParams)
    setSummaryLoading(true)
    fetch(`/api/alunbrig/audience/summary?${q}`)
      .then((r) => r.json())
      .then((d) => setSummary(d as SummaryResponse))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false))
  }, [baseParams])

  // Per-tab fetches.
  useEffect(() => {
    const q = buildParams({ ...baseParams, audience: tab })

    setLeaderLoading(true)
    fetch(`/api/alunbrig/audience/leaderboard?${q}&limitTopics=25&limitBuckets=10`)
      .then((r) => r.json())
      .then((d) => setLeader(d as LeaderboardResponse))
      .catch(() => setLeader(null))
      .finally(() => setLeaderLoading(false))

    setCompLoading(true)
    fetch(`/api/alunbrig/audience/competitive-attention?${q}`)
      .then((r) => r.json())
      .then((d) => setComp(d as CompetitiveResponse))
      .catch(() => setComp(null))
      .finally(() => setCompLoading(false))

    if (tab === "Payer") {
      setUkLoading(true)
      fetch(`/api/alunbrig/audience/uk-access?${q}`)
        .then((r) => r.json())
        .then((d) => setUk(d as UkAccessResponse))
        .catch(() => setUk(null))
        .finally(() => setUkLoading(false))
    } else {
      setUk(null)
      setUkLoading(false)
    }
  }, [baseParams, tab])

  const shareData = useMemo(() => {
    if (!summary) return []
    if (softMode) {
      return AUDIENCES.map((a) => ({ label: a, value: summary.softShares[a] || 0 }))
    }
    return AUDIENCES.map((a) => ({ label: a, value: summary.hardShares[a]?.share || 0, posts: summary.hardShares[a]?.posts || 0 }))
  }, [summary, softMode])

  const colors = ["#3b82f6", "#10b981", "#f59e0b", "#a855f7", "#64748b"]

  const openExamples = useCallback(
    (mode: typeof drawerMode, value: string) => {
      setDrawerMode(mode)
      setDrawerValue(value)
      setDrawerTitle(`${mode.replace("_", " ")} | ${value}`)
      setDrawerDesc(`Showing social media data for ${tab}.`)
      setDrawerOpen(true)
    },
    [tab],
  )

  const requestUrl = useCallback(
    (offset: number) => {
      const q = buildParams({
        ...baseParams,
        audience: tab,
        mode: drawerMode,
        value: drawerValue,
        limit: 50,
        offset,
      })
      return `/api/alunbrig/audience/examples?${q}`
    },
    [baseParams, tab, drawerMode, drawerValue],
  )

  const leaderTopicsDenom = useMemo(() => {
    return (leader?.topics || []).reduce((acc, t) => acc + Number(t.posts || 0), 0) || 0
  }, [leader])

  const leaderBucketsDenom = useMemo(() => {
    return (leader?.buckets || []).reduce((acc, b) => acc + Number(b.posts || 0), 0) || 0
  }, [leader])

  const shareOfListPct = useCallback((posts: number, denom: number) => {
    return denom > 0 ? (Number(posts || 0) / denom) * 100 : 0
  }, [])

  const comparatorRows = useMemo(() => {
    const rows: { key: string; label: string; get: (r: LeaderboardResponse) => number }[] = [
      { key: "pctSequencing", label: "Sequencing", get: (r) => r.flagRates.pctSequencing },
      { key: "pctQoL", label: "QoL", get: (r) => r.flagRates.pctQoL },
      { key: "pctNeurotox", label: "Neurotox", get: (r) => r.flagRates.pctNeurotox },
      { key: "pctCaregiverBurden", label: "Caregiver burden", get: (r) => r.flagRates.pctCaregiverBurden },
      { key: "pctCNS", label: "CNS / brain mets", get: (r) => r.flagRates.pctCNS },
      { key: "pctUKAccess", label: "UK access", get: (r) => r.flagRates.pctUKAccess },
    ]
    return rows
  }, [])

  const [cmpLoading, setCmpLoading] = useState(false)
  const [cmp, setCmp] = useState<Record<string, LeaderboardResponse | null>>({ HCP: null, Patient: null, Caregiver: null })

  useEffect(() => {
    const audiences: AudienceKey[] = ["HCP", "Patient", "Caregiver"]
    const qBase = buildParams(baseParams)
    setCmpLoading(true)
    Promise.all(
      audiences.map((a) =>
        fetch(`/api/alunbrig/audience/leaderboard?${qBase}&audience=${encodeURIComponent(a)}&limitTopics=0&limitBuckets=0`)
          .then((r) => r.json())
          .then((d) => [a, d as LeaderboardResponse] as const)
          .catch(() => [a, null] as const),
      ),
    )
      .then((pairs) => {
        const next: any = { HCP: null, Patient: null, Caregiver: null }
        for (const [a, d] of pairs) next[a] = d
        setCmp(next)
      })
      .finally(() => setCmpLoading(false))
  }, [baseParams])

  return (
    <div className="space-y-6">
      <div>
        <h1>Audience Insights</h1>
        <p className="lead">Understand who's driving conversation and what each group cares about in social media data.</p>
      </div>

      <FilterPane
        title="Filters"
        description={
          <span>Refine audience slice across charts (<span className="text-foreground">social media data</span>).</span>
        }
        hasUnsavedChanges={hasUnsavedChanges}
        rightSlot={
          <div className="flex items-center gap-2">
            {hasUnsavedChanges ? (
              <Button type="button" variant="outline" size="sm" onClick={discard}>Discard</Button>
            ) : null}
            <Button type="button" size="sm" onClick={apply}>Apply</Button>
          </div>
        }
        metaLine={applied ? <Badge variant="secondary">Applied</Badge> : null}
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
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">
              <span className="text-sm">Include low</span>
              <Switch checked={draft.includeLowRelevance} onCheckedChange={(v) => setDraft((d) => ({ ...d, includeLowRelevance: v }))} />
            </label>
            <label className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2">
              <span className="text-sm">Audience</span>
              <span className="text-sm text-muted-foreground">{draft.audience}</span>
            </label>
          </div>
          <div className="md:col-span-6">
            <ActiveFiltersBar chips={activeChips} />
          </div>
        </div>
      </FilterPane>      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-medium">Audience split</CardTitle>
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={softMode} onCheckedChange={setSoftMode} />
                {softMode ? "Soft (likelihood-weighted)" : "Hard (primary label)"}
              </label>
            </div>
          </CardHeader>
          <CardContent>
            {summaryLoading || !summary ? (
              <div className="text-sm text-muted-foreground">Loading audience split...</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={shareData} dataKey="value" nameKey="label" innerRadius={60} outerRadius={90}>
                        {shareData.map((_, i) => (
                          <Cell key={i} fill={colors[i % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any) => pct(Number(v))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {shareData.map((d, i) => (
                      <div key={`${String(d.label)}-${i}`} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ background: colors[i % colors.length] }} />
                          {d.label}
                        </div>
                        <div className="text-muted-foreground">{pct(d.value)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {summary ? (
                  <div className="w-full">
                    <SexyRadar
                      title="Signal mix (overall)"
                      categories={["Seq", "QoL", "Neurotox", "CNS", "UK"]}
                      values={[
                        toPct100(summary.flagRatesOverall.pctSequencing),
                        toPct100(summary.flagRatesOverall.pctQoL),
                        toPct100(summary.flagRatesOverall.pctNeurotox),
                        toPct100(summary.flagRatesOverall.pctCNS),
                        toPct100(summary.flagRatesOverall.pctUKAccess),
                      ]}
                      height={210}
                    />
                  </div>
                ) : null}
              </div>
            )}

            {summary ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {([
                  ["Sequencing", summary.flagRatesOverall.pctSequencing],
                  ["QoL", summary.flagRatesOverall.pctQoL],
                  ["Neurotox", summary.flagRatesOverall.pctNeurotox],
                  ["Caregiver", summary.flagRatesOverall.pctCaregiverBurden],
                  ["CNS", summary.flagRatesOverall.pctCNS],
                  ["UK access", summary.flagRatesOverall.pctUKAccess],
                ] as const).map(([k, v]) => (
                  <span key={k} className="text-xs rounded-full border px-2 py-1 text-muted-foreground">
                    {k}: {pct(v)}
                  </span>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">HCP vs Patient vs Caregiver</CardTitle>
          </CardHeader>
          <CardContent>
            {cmpLoading ? (
              <div className="text-sm text-muted-foreground">Loading comparator...</div>
            ) : (
              <div className="space-y-3">
                {comparatorRows.map((row) => {
                  const h = cmp.HCP
                  const p = cmp.Patient
                  const c = cmp.Caregiver
                  const vals = [
                    { label: "HCP", v: h ? row.get(h) : 0, color: colors[0] },
                    { label: "Patient", v: p ? row.get(p) : 0, color: colors[1] },
                    { label: "Caregiver", v: c ? row.get(c) : 0, color: colors[2] },
                  ]
                  return (
                    <div key={row.key} className="rounded-md border p-3">
                      <div className="text-sm font-medium">{row.label}</div>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {vals.map((x) => (
                          <div key={x.label} className="text-xs">
                            <div className="text-muted-foreground">{x.label}</div>
                            <div className="mt-1 h-2 rounded" style={{ background: "rgba(148,163,184,0.2)" }}>
                              <div className="h-2 rounded" style={{ width: `${Math.round(x.v * 100)}%`, background: x.color }} />
                            </div>
                            <div className="mt-1 text-muted-foreground">{pct(x.v)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as AudienceKey)}>
        <TabsList>
          <TabsTrigger value="HCP">HCP</TabsTrigger>
          <TabsTrigger value="Patient">Patient</TabsTrigger>
          <TabsTrigger value="Caregiver">Caregiver</TabsTrigger>
          <TabsTrigger value="Payer">Payer/Access</TabsTrigger>
          <TabsTrigger value="Other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-medium">Top topics</CardTitle>
              </CardHeader>
              <CardContent>
                {leaderLoading || !leader ? (
                  <div className="text-sm text-muted-foreground">Loading topics...</div>
                ) : leader.topics.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No topics in this slice.</div>
                ) : (
                  <div className="space-y-2">
                    {leader.topics.map((t, i) => (
                      <button key={`${String(t.topic)}-${i}`} className="w-full text-left rounded-md border p-3 hover:bg-accent/30" onClick={() => openExamples("topic", String(t.topic))}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium truncate" title={t.topic}>
                            {t.topic}
                          </div>
                          <div className="text-xs text-muted-foreground">{shareOfListPct(t.posts, leaderTopicsDenom).toFixed(1)}% share</div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">Sentiment index: {Math.round(t.sentimentIndex)} | Sequencing: {pct(t.pctSequencing)} | UK access: {pct(t.pctUKAccess)}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(t.topKeyTerms || []).slice(0, 6).map((kt, j) => (
                            <span key={`${String(kt.term)}-${j}`} className="text-xs rounded-full border px-2 py-0.5 text-muted-foreground">
                              {kt.term}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-medium">Top buckets</CardTitle>
              </CardHeader>
              <CardContent>
                {leaderLoading || !leader ? (
                  <div className="text-sm text-muted-foreground">Loading buckets...</div>
                ) : leader.buckets.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No buckets in this slice.</div>
                ) : (
                  <div className="space-y-2">
                    {leader.buckets.map((b, i) => (
                      <button key={`${String(b.bucket)}-${i}`} className="w-full text-left rounded-md border p-3 hover:bg-accent/30" onClick={() => openExamples("bucket", String(b.bucket))}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium truncate" title={b.bucket}>
                            {b.bucket}
                          </div>
                          <div className="text-xs text-muted-foreground">{shareOfListPct(b.posts, leaderBucketsDenom).toFixed(1)}% share</div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">Drivers: {(b.topDrivers || []).slice(0, 3).map((d) => d.driver).filter(Boolean).join(" | ") || "n/a"}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(b.topHurdles || []).slice(0, 3).map((h, j) => (
                            <span key={`${String(h.hurdle)}-${j}`} className="text-xs rounded-full border px-2 py-0.5 text-muted-foreground">
                              {h.hurdle}
                            </span>
                          ))}
                          {(b.topOpportunities || []).slice(0, 3).map((o, j) => (
                            <span key={`${String(o.opp)}-${j}`} className="text-xs rounded-full border px-2 py-0.5 text-muted-foreground">
                              {o.opp}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-medium">Key flag rates</CardTitle>
            </CardHeader>
            <CardContent>
              {!leader ? (
                <div className="text-sm text-muted-foreground">-</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {([
                    ["Sequencing", leader.flagRates.pctSequencing],
                    ["QoL", leader.flagRates.pctQoL],
                    ["Neurotox", leader.flagRates.pctNeurotox],
                    ["Caregiver", leader.flagRates.pctCaregiverBurden],
                    ["CNS", leader.flagRates.pctCNS],
                    ["UK access", leader.flagRates.pctUKAccess],
                  ] as const).map(([k, v]) => (
                    <div key={k} className="rounded-md border p-3">
                      <div className="text-xs text-muted-foreground">{k}</div>
                      <div className="mt-1 text-sm font-medium">{pct(v)}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-medium">Competitive context</CardTitle>
              </CardHeader>
              <CardContent>
                {compLoading || !comp ? (
                  <div className="text-sm text-muted-foreground">Loading competitive context...</div>
                ) : (
                  <div className="space-y-2">
                    {comp.competitiveContextShare.slice(0, 10).map((c, i) => (
                      <button key={`${String(c.context)}-${i}`} className="w-full text-left rounded-md border p-3 hover:bg-accent/30" onClick={() => openExamples("competitive_context", String(c.context))}>
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{String(c.context)}</div>
                          <div className="text-xs text-muted-foreground">{pct(c.share)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-medium">Stance toward Alunbrig</CardTitle>
              </CardHeader>
              <CardContent>
                {compLoading || !comp ? (
                  <div className="text-sm text-muted-foreground">Loading stance...</div>
                ) : (
                  <div className="space-y-2">
                    {comp.stanceTowardAlunbrig.slice(0, 10).map((s, i) => (
                      <button key={`${String((s as any)?.stance?.stance ?? (s as any)?.stance ?? "")}-${i}`} className="w-full text-left rounded-md border p-3 hover:bg-accent/30" onClick={() => openExamples("stance", String((s as any)?.stance?.stance ?? (s as any)?.stance ?? ""))}>
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{String((s as any)?.stance?.stance ?? (s as any)?.stance ?? "")}</div>
                          <div className="text-xs text-muted-foreground">{pct(s.share)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-medium">Top competitors mentioned</CardTitle>
              </CardHeader>
              <CardContent>
                {compLoading || !comp ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {comp.topCompetitorsMentioned.slice(0, 20).map((x, i) => (
                      <span key={`${String(x.competitor)}-${i}`} className="text-xs rounded-full border px-2 py-1 text-muted-foreground">
                        {x.competitor} | {x.mentions}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-medium">Top brands mentioned</CardTitle>
              </CardHeader>
              <CardContent>
                {compLoading || !comp ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {comp.topBrandsMentioned.slice(0, 20).map((x, i) => (
                      <span key={`${String(x.brand)}-${i}`} className="text-xs rounded-full border px-2 py-1 text-muted-foreground">
                        {x.brand} | {x.mentions}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {tab === "Payer" ? (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base font-medium">UK access / payer lens</CardTitle>
              </CardHeader>
              <CardContent>
                {ukLoading || !uk ? (
                  <div className="text-sm text-muted-foreground">Loading UK lens...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">Total UK-access posts: {uk.totalUKAccessPosts.toLocaleString()}</div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="rounded-md border p-3">
                        <div className="text-sm font-medium">Nation breakdown</div>
                        <ResponsiveContainer width="100%" height={240}>
                          <BarChart data={uk.nationBreakdown}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="nation" stroke="#666" hide />
                            <YAxis stroke="#666" />
                            <Tooltip />
                            <Bar dataKey="posts" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="rounded-md border p-3">
                        <div className="text-sm font-medium">Top access signals</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {uk.topAccessSignals.slice(0, 20).map((s, i) => (
                            <button key={`${String(s.signal)}-${i}`} className="text-xs rounded-full border px-2 py-1 text-muted-foreground hover:bg-accent/30" onClick={() => openExamples("uk_signal", String(s.signal))}>
                              {s.signal}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="rounded-md border p-3">
                        <div className="text-sm font-medium">Top hurdles</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {uk.topHurdles.slice(0, 20).map((h, i) => (
                            <span key={`${String(h.hurdle)}-${j}`} className="text-xs rounded-full border px-2 py-1 text-muted-foreground">
                              {h.hurdle}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-md border p-3">
                        <div className="text-sm font-medium">Top opportunities</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {uk.topOpportunities.slice(0, 20).map((o, i) => (
                            <span key={`${String(o.opp)}-${j}`} className="text-xs rounded-full border px-2 py-1 text-muted-foreground">
                              {o.opp}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-md border p-3">
                        <div className="text-sm font-medium">Top evidence types</div>
                        <div className="mt-2 space-y-1">
                          {uk.topEvidenceTypes.slice(0, 12).map((e, i) => (
                            <div key={`${String(e.type)}-${i}`} className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="truncate" title={e.type}>
                                {e.type}
                              </span>
                              <span>{e.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>

      <ExamplePostsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={drawerTitle} description={drawerDesc} requestUrl={requestUrl} />
    </div>
  )
}








