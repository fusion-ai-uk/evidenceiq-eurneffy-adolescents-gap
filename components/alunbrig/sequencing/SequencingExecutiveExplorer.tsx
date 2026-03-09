"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { subMonths } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExamplePostsDrawer } from "@/components/alunbrig/themes/ExamplePostsDrawer"
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Cell, ReferenceLine } from "recharts"
import { DateRangeControl } from "@/components/alunbrig/filters/DateRangeControl"
import { toDateInputValue } from "@/lib/date-input"
import { InfoTip } from "@/components/alunbrig/InfoTip"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type DraftFilters = {
  startDate: string
  endDate: string
}

type ShareItem = {
  name: string
  count: number
  share: number
}

const pct = (v: number) => `${Math.round(Number(v || 0) * 1000) / 10}%`
const num = (v: number) => Number(v || 0).toLocaleString()

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

function ShareList({
  items,
  onSelect,
}: {
  items: ShareItem[]
  onSelect?: (item: ShareItem) => void
}) {
  return (
    <div className="space-y-2">
      {items.slice(0, 5).map((item, i) => {
        const width = Math.max(2, Math.round(Number(item.share || 0) * 100))
        const body = (
          <>
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground">{i + 1}. {item.name}</span>
              <span className="text-muted-foreground">{pct(item.share)}</span>
            </div>
            <div className="mt-1 h-2 w-full rounded bg-muted">
              <div className="h-2 rounded bg-emerald-500" style={{ width: `${width}%` }} />
            </div>
          </>
        )

        if (!onSelect) {
          return (
            <div key={`${item.name}-${i}`} className="rounded border p-2">
              {body}
            </div>
          )
        }
        return (
          <Tooltip key={`${item.name}-${i}`}>
            <TooltipTrigger asChild>
              <button
                className="w-full cursor-pointer rounded border p-2 text-left transition-all hover:-translate-y-px hover:bg-accent/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                onClick={() => onSelect(item)}
              >
                {body}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={6}>
              Click to view example posts
            </TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}

export function SequencingExecutiveExplorer() {
  const today = new Date()
  const yearAgo = subMonths(today, 12)

  const [draft, setDraft] = useState<DraftFilters>({
    startDate: toDateInputValue(yearAgo),
    endDate: toDateInputValue(today),
  })

  const [briefing, setBriefing] = useState<any>(null)
  const [briefingLoading, setBriefingLoading] = useState(false)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState("Examples")
  const [drawerDesc, setDrawerDesc] = useState<string | undefined>(undefined)
  const [drawerMode, setDrawerMode] = useState<"lot" | "direction" | "rationale" | "period">("period")
  const [drawerArgs, setDrawerArgs] = useState<Record<string, string>>({})

  const openExamples = useCallback((mode: typeof drawerMode, title: string, args: Record<string, string>) => {
    setDrawerMode(mode)
    setDrawerArgs(args)
    setDrawerTitle(title)
    setDrawerDesc("Evidence posts for this section.")
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

  const baseParams = useMemo(
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

  useEffect(() => {
    if (!draft.startDate || !draft.endDate) return
    const q = buildParams(baseParams)

    setBriefingLoading(true)
    fetch(`/api/alunbrig/sequencing/briefing?${q}`)
      .then((r) => r.json())
      .then(setBriefing)
      .catch(() => setBriefing(null))
      .finally(() => setBriefingLoading(false))
  }, [baseParams, draft.startDate, draft.endDate])

  const lotData: ShareItem[] = (briefing?.lot || []).filter((x: ShareItem) => {
    const k = String(x?.name || "").toLowerCase()
    return k !== "none" && k !== "unspecified"
  })
  const directionData: ShareItem[] = (briefing?.direction || []).filter((x: ShareItem) => {
    const k = String(x?.name || "").toLowerCase()
    return k !== "none" && k !== "unknown"
  })
  const stakeholderData: ShareItem[] = briefing?.stakeholder || []
  const sentimentData: ShareItem[] = briefing?.sentiment || []
  const evidenceData: ShareItem[] = briefing?.evidence || []
  const topStakeholder = stakeholderData[0]
  const topSentiment = sentimentData[0]
  const topEvidence = evidenceData[0]
  const topLot = lotData[0]
  const topDirection = directionData[0]

  const alkFocusPct = Number(briefing?.totals?.pctAlk || 0) * 100
  const spilloverPct = Number(briefing?.totals?.pctOffTargetBiomarker || 0) * 100
  const purityGap = alkFocusPct - spilloverPct

  const narrativeConcentration = Math.max(Number(topLot?.share || 0), Number(topDirection?.share || 0)) * 100

  const evidenceMaturityPct =
    (evidenceData || [])
      .filter((e) => {
        const k = String(e.name || "").toLowerCase()
        return k === "trial" || k === "real_world_evidence"
      })
      .reduce((acc, e) => acc + Number(e.share || 0), 0) * 100

  const efficacyPct = Number(briefing?.topicSignals?.pctEfficacy || 0) * 100
  const safetyPct = Number(briefing?.topicSignals?.pctSafety || 0) * 100
  const balanceScore = efficacyPct <= 0 ? 0 : Math.min(100, (safetyPct / efficacyPct) * 100)

  const signalChartData = useMemo(
    () => [
      {
        label: "Efficacy outcomes",
        value: Number(briefing?.topicSignals?.pctEfficacy || 0) * 100,
        color: "#10b981",
        note: "How often results or performance outcomes are mentioned",
      },
      {
        label: "Safety/tolerability",
        value: Number(briefing?.topicSignals?.pctSafety || 0) * 100,
        color: "#22c55e",
        note: "How often adverse events or tolerability are discussed",
      },
      {
        label: "CNS context",
        value: Number(briefing?.topicSignals?.pctCNS || 0) * 100,
        color: "#14b8a6",
        note: "How often brain metastases or CNS considerations appear",
      },
      {
        label: "PFS framing",
        value: Number(briefing?.topicSignals?.pctPFS || 0) * 100,
        color: "#06b6d4",
        note: "How often progression-free survival language is used",
      },
      {
        label: "Attrition framing",
        value: Number(briefing?.topicSignals?.pctAttrition || 0) * 100,
        color: "#0ea5e9",
        note: "How often discontinuation/drop-off themes appear",
      },
      {
        label: "UK access",
        value: Number(briefing?.topicSignals?.pctUKAccess || 0) * 100,
        color: "#3b82f6",
        note: "How often reimbursement or UK access barriers appear",
      },
    ],
    [briefing],
  )
  const topSignal = useMemo(
    () => [...signalChartData].sort((a, b) => Number(b.value) - Number(a.value))[0],
    [signalChartData],
  )
  const secondSignal = useMemo(
    () => [...signalChartData].sort((a, b) => Number(b.value) - Number(a.value))[1],
    [signalChartData],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1>Sequencing &amp; Treatment Pathways</h1>
        <p className="lead">Executive briefing: what sequencing discussion is saying, where signal quality is strong, and what your team should tune now.</p>
      </div>

      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-base font-medium">Date range</CardTitle></CardHeader>
        <CardContent>
          <div className="max-w-xl space-y-1">
            <div className="text-xs text-muted-foreground">Date range</div>
            <DateRangeControl
              startDate={draft.startDate}
              endDate={draft.endDate}
              onChange={(nextStart, nextEnd) => setDraft((d) => ({ ...d, startDate: nextStart, endDate: nextEnd }))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-medium">Signal quality profile</CardTitle>
            <InfoTip text="This chart shows the percentage of sequencing posts that mention each clinical or access signal. It helps compare which themes are strongly represented versus underrepresented in current discussion." />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Each bar shows the share of sequencing posts that mention that topic signal. A higher value means that signal appears more consistently in the conversation.
          </p>
          {briefingLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={signalChartData} layout="vertical" margin={{ left: 24, right: 24, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2f2f2f" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v: any) => `${Math.round(Number(v || 0))}%`} />
                <YAxis dataKey="label" type="category" width={140} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => `${Number(v || 0).toFixed(1)}%`} />
                <ReferenceLine x={25} stroke="#9ca3af" strokeDasharray="4 4" />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {signalChartData.map((entry) => (
                    <Cell key={entry.label} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            {signalChartData.map((item) => (
              <div key={item.label} className="rounded border p-2">
                <div className="font-medium text-foreground">{item.label}: {item.value.toFixed(1)}%</div>
                <div className="text-muted-foreground">{item.note}</div>
              </div>
            ))}
          </div>
          <div className="rounded border bg-muted/20 p-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">How to read this:</span>{" "}
            The strongest current signals are <span className="font-medium text-foreground">{topSignal?.label || "n/a"}</span>
            {topSignal ? ` (${topSignal.value.toFixed(1)}%)` : ""} and{" "}
            <span className="font-medium text-foreground">{secondSignal?.label || "n/a"}</span>
            {secondSignal ? ` (${secondSignal.value.toFixed(1)}%)` : ""}.{" "}
            {Number(briefing?.totals?.pctOffTargetBiomarker || 0) > 0.2
              ? "Non-ALK spillover is elevated, so some signal may reflect adjacent biomarker discourse."
              : "Biomarker focus is relatively tight, so the profile mainly reflects ALK-relevant discussion."}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-medium">Top line-of-therapy narratives</CardTitle>
              <InfoTip text="Ranks the most common line-of-therapy contexts mentioned in sequencing posts. This indicates where discussion is concentrated across treatment-line framing." />
            </div>
          </CardHeader>
          <CardContent>{briefingLoading ? <div className="text-sm text-muted-foreground">Loading...</div> : <ShareList items={lotData} onSelect={(x) => openExamples("lot", `LoT | ${x.name}`, { lotValue: x.name })} />}</CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-medium">Top sequencing directions</CardTitle>
              <InfoTip text="Ranks the most frequently referenced sequence directions (for example, switch patterns). This helps identify which treatment transition narratives are most visible." />
            </div>
          </CardHeader>
          <CardContent>{briefingLoading ? <div className="text-sm text-muted-foreground">Loading...</div> : <ShareList items={directionData} onSelect={(x) => openExamples("direction", `Direction | ${x.name}`, { directionValue: x.name })} />}</CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-medium">Who is shaping this conversation</CardTitle>
              <InfoTip text="These bars show the distribution of stakeholder groups and sentiment labels within sequencing conversation. Use this to understand both audience composition and emotional tone." />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 text-xs text-muted-foreground">Stakeholder mix</div>
              <ShareList items={stakeholderData} />
            </div>
            <div>
              <div className="mb-2 text-xs text-muted-foreground">Sentiment mix</div>
              <ShareList items={sentimentData} />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader><CardTitle className="text-base font-medium">Conversation spotlight</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Most common stakeholder: <span className="font-medium text-foreground">{topStakeholder?.name || "n/a"}</span>{" "}
              ({pct(topStakeholder?.share || 0)}).
            </p>
            <p>
              Most common sentiment: <span className="font-medium text-foreground">{topSentiment?.name || "n/a"}</span>{" "}
              ({pct(topSentiment?.share || 0)}).
            </p>
            <p>
              Most common evidence type: <span className="font-medium text-foreground">{topEvidence?.name || "n/a"}</span>{" "}
              ({pct(topEvidence?.share || 0)}).
            </p>
            <div className="pt-2 text-xs">
              <div className="font-medium text-foreground mb-1">Evidence-type mix</div>
              <ShareList items={evidenceData} />
            </div>
            <div className="pt-2 flex flex-wrap gap-2">
              {(evidenceData || []).slice(0, 3).map((e) => (
                <Tooltip key={e.name}>
                  <TooltipTrigger asChild>
                    <button
                      className="cursor-pointer rounded border px-2 py-1 text-xs transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      onClick={() => openExamples("period", `Evidence | ${e.name}`, { searchText: e.name, sequencingOnly: "false" })}
                    >
                      View {e.name} examples
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={6}>
                    Click to open supporting posts
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <ExamplePostsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={drawerTitle} description={drawerDesc} requestUrl={requestUrl} />
    </div>
  )
}
