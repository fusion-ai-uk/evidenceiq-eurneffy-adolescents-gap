"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExamplePostsDrawer } from "@/components/alunbrig/themes/ExamplePostsDrawer"
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts"
import { subMonths } from "date-fns"
import { DateRangeControl } from "@/components/alunbrig/filters/DateRangeControl"
import { toDateInputValue } from "@/lib/date-input"

type DraftFilters = {
  startDate: string
  endDate: string
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

export function SequencingExplorer() {
  const today = new Date()
  const yearAgo = subMonths(today, 12)

  const [draft, setDraft] = useState<DraftFilters>({
    startDate: toDateInputValue(yearAgo),
    endDate: toDateInputValue(today),
  })

  const [overview, setOverview] = useState<any>(null)
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [timeseries, setTimeseries] = useState<any>(null)
  const [timeseriesLoading, setTimeseriesLoading] = useState(false)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState("Examples")
  const [drawerDesc, setDrawerDesc] = useState<string | undefined>(undefined)
  const [drawerMode, setDrawerMode] = useState<"lot" | "direction" | "rationale" | "period">("lot")
  const [drawerArgs, setDrawerArgs] = useState<Record<string, string>>({})

  const openExamples = useCallback((mode: typeof drawerMode, title: string, args: Record<string, string>) => {
    setDrawerMode(mode)
    setDrawerArgs(args)
    setDrawerTitle(title)
    setDrawerDesc("Showing social media data for the selected slice.")
    setDrawerOpen(true)
  }, [])

  const requestUrl = useCallback(
    (offset: number) => {
      const q = buildParams({
        startDate: draft.startDate,
        endDate: draft.endDate,
        includeLowRelevance: false,
        stakeholder: [],
        sentimentLabel: [],
        ukNation: [],
        evidenceType: [],
        biomarker: [],
        cnsContext: [],
        searchText: "",
        sequencingOnly: drawerMode === "period" ? false : true,
        ukAccessOnly: false,
        pfsOnly: false,
        mode: drawerMode,
        granularity: "week",
        limit: 50,
        offset,
        ...drawerArgs,
      })
      return `/api/alunbrig/sequencing/examples?${q}`
    },
    [draft.startDate, draft.endDate, drawerMode, drawerArgs],
  )
  const overviewParams = useMemo(
    () => ({
      startDate: draft.startDate,
      endDate: draft.endDate,
      includeLowRelevance: false,
      stakeholder: [],
      sentimentLabel: [],
      ukNation: [],
      evidenceType: [],
      biomarker: [],
      cnsContext: [],
      searchText: "",
      sequencingOnly: false,
      ukAccessOnly: false,
      pfsOnly: false,
      granularity: "week" as const,
    }),
    [draft.startDate, draft.endDate],
  )
  const patternsParams = useMemo(
    () => ({
      ...overviewParams,
      sequencingOnly: true,
    }),
    [overviewParams],
  )

  useEffect(() => {
    if (!draft.startDate || !draft.endDate) return
    const qOverview = buildParams(overviewParams)
    const qPatterns = buildParams(patternsParams)

    setOverviewLoading(true)
    Promise.all([fetch(`/api/alunbrig/sequencing/overview?${qOverview}`).then((r) => r.json()), fetch(`/api/alunbrig/sequencing/overview?${qPatterns}`).then((r) => r.json())])
      .then(([allData, seqData]) => {
        setOverview({
          all: allData || null,
          sequenced: seqData || null,
        })
      })
      .catch(() => setOverview(null))
      .finally(() => setOverviewLoading(false))

    setTimeseriesLoading(true)
    fetch(`/api/alunbrig/sequencing/timeseries?${qOverview}`)
      .then((r) => r.json())
      .then(setTimeseries)
      .catch(() => setTimeseries(null))
      .finally(() => setTimeseriesLoading(false))
  }, [overviewParams, patternsParams, draft.startDate, draft.endDate])

  const overviewAll = overview?.all
  const overviewSequenced = overview?.sequenced

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

  const rationaleTotal = useMemo(() => (overviewSequenced?.topRationales || []).reduce((acc: number, r: any) => acc + Number(r.count || 0), 0) || 0, [overviewSequenced])

  const lotData = useMemo(() => {
    const arr = (overviewSequenced?.lineOfTherapy || []).filter((x: any) => String(x?.lot || "").toLowerCase() !== "none").slice(0, 8)
    const total = arr.reduce((acc: number, x: any) => acc + Number(x.posts || 0), 0) || 0
    return arr.map((x: any) => ({ ...x, sharePct: total > 0 ? (Number(x.posts || 0) / total) * 100 : 0 }))
  }, [overviewSequenced])

  const directionData = useMemo(() => {
    const arr = (overviewSequenced?.sequenceDirections || []).filter((x: any) => String(x?.direction || "").toLowerCase() !== "none").slice(0, 8)
    const total = arr.reduce((acc: number, x: any) => acc + Number(x.posts || 0), 0) || 0
    return arr.map((x: any) => ({ ...x, sharePct: total > 0 ? (Number(x.posts || 0) / total) * 100 : 0 }))
  }, [overviewSequenced])

  const topLot = lotData[0]
  const topDirection = directionData[0]
  const topRationale = (overviewSequenced?.topRationales || [])[0]
  const latestPoint = (timeseriesChartData || [])[timeseriesChartData.length - 1]
  const priorPoint = (timeseriesChartData || [])[timeseriesChartData.length - 2]
  const trendDelta = latestPoint && priorPoint && latestPoint.seqIndex != null && priorPoint.seqIndex != null ? Number(latestPoint.seqIndex) - Number(priorPoint.seqIndex) : null
  const trendDirectionText =
    trendDelta == null ? "stable vs recent baseline" : trendDelta > 10 ? "rising above baseline" : trendDelta < -10 ? "cooling vs baseline" : "stable vs baseline"
  const topDriver = (overviewSequenced?.topDrivers || [])[0]?.driver || "n/a"
  const hasAdequateVolume = Number(overviewAll?.kpis?.posts || 0) >= 30

  const shortPeriod = (v: string) => String(v || "").replace(/^(\d{4})-W/, "W")

  const trendLabelData = useMemo(() => {
    const source = timeseriesChartData.slice(-12)
    return source.map((p: any) => ({ ...p, shortPeriod: shortPeriod(p.period) }))
  }, [timeseriesChartData])

  return (
    <div className="space-y-6">
      <div>
        <h1>Sequencing &amp; Treatment Pathways</h1>
        <p className="lead">A strategic readout of how often sequencing is being discussed, where attention is concentrated, and which treatment rationale is shaping the conversation.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">Date range</CardTitle>
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
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-medium">Executive interpretation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            This window includes <span className="font-medium text-foreground">{Number(overviewAll?.kpis?.posts || 0).toLocaleString()}</span> in-scope posts, of which{" "}
            <span className="font-medium text-foreground">{Number(overviewAll?.kpis?.sequencingPosts || 0).toLocaleString()}</span> discuss sequencing (
            <span className="font-medium text-foreground">{pct(overviewAll?.kpis?.pctSequencing || 0)}</span>).
          </p>
          <p>
            Relative to recent baseline behavior, sequencing attention is currently{" "}
            <span className="font-medium text-foreground">{trendDirectionText}</span>
            {latestPoint?.seqIndex != null ? ` (latest index ${Math.round(Number(latestPoint.seqIndex || 0))}%).` : "."}
          </p>
          <p>
            Within sequencing-specific discussion, the dominant pathway is{" "}
            <span className="font-medium text-foreground">{topLot?.lot || "n/a"}</span> and the dominant direction is{" "}
            <span className="font-medium text-foreground">{topDirection?.direction || "n/a"}</span>.
          </p>
          <p>
            The most common explicit rationale is <span className="font-medium text-foreground">{topRationale?.rationale || "n/a"}</span>, with a leading discussion driver of{" "}
            <span className="font-medium text-foreground">{topDriver}</span>.
          </p>
          <p>
            Data-confidence check: <span className="font-medium text-foreground">{hasAdequateVolume ? "adequate volume for directional interpretation" : "low volume; interpret directional changes cautiously"}</span>.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-medium">In-scope posts</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{Number(overviewAll?.kpis?.posts || 0).toLocaleString()}</CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-medium">Sequencing share</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{pct(overviewAll?.kpis?.pctSequencing || 0)}</CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-medium">PFS/PFS2 mention</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{pct(overviewSequenced?.kpis?.pctPFS || 0)}</CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-medium">Attrition mention</CardTitle></CardHeader>
          <CardContent className="text-2xl font-semibold">{pct(overviewSequenced?.kpis?.pctAttrition || 0)}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-medium">Sequencing trend vs baseline</CardTitle></CardHeader>
          <CardContent className="flex flex-col">
            {timeseriesLoading || !timeseries ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendLabelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="shortPeriod" tick={{ fontSize: 11 }} interval={1} />
                  <YAxis tickFormatter={(v: any) => `${Math.round(Number(v || 0))}%`} />
                  <Tooltip formatter={(v: any) => (v == null ? "n/a" : `${Number(v || 0).toFixed(1)}%`)} />
                  <Line dataKey="seqIndex" stroke="#3b82f6" dot={false} name="Sequencing index" />
                  <Line dataKey="baselineIndex" stroke="#94a3b8" strokeDasharray="4 4" dot={false} name="Baseline (100)" />
                </LineChart>
              </ResponsiveContainer>
            )}
            <div className="mt-3 space-y-2">
              {timeseriesChartData.slice(-4).reverse().map((p: any, i: number) => (
                <button key={`${p.period}-${i}`} className="w-full text-left rounded-md border p-2 hover:bg-accent/30" onClick={() => openExamples("period", `Period | ${p.period}`, { period: String(p.period) })}>
                  <div className="text-xs text-muted-foreground">
                    {p.period} | Index: {p.seqIndex == null ? "n/a" : `${Math.round(Number(p.seqIndex || 0))}%`} | Sequencing share: {pct(p.pctSequencing)}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">Sequencing pathway mix</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-sm font-medium">Line of therapy distribution</div>
              <div className="mt-2">
                {overviewLoading || !overviewSequenced ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={lotData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="lot" tick={{ fontSize: 11 }} interval={0} />
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
              <div className="text-sm font-medium">Direction distribution</div>
              <div className="mt-2">
                {overviewLoading || !overviewSequenced ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={directionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="direction" tick={{ fontSize: 11 }} interval={0} />
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
      </div>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-base font-medium">Most-cited sequencing rationales</CardTitle></CardHeader>
        <CardContent>
          {overviewLoading || !overviewSequenced ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (overviewSequenced.topRationales || []).length === 0 ? (
            <div className="text-sm text-muted-foreground">No rationale themes in this slice.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(overviewSequenced.topRationales || []).slice(0, 8).map((r: any, i: number) => (
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

      <ExamplePostsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={drawerTitle} description={drawerDesc} requestUrl={requestUrl} />
    </div>
  )
}

