"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { format, parseISO, startOfISOWeek, subMonths } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

import { ExamplePostsDrawer } from "@/components/alunbrig/themes/ExamplePostsDrawer"

type Granularity = "day" | "week" | "month"

type OptionsResponse = {
  evidenceType: string[]
  meta: { totalPosts: number; minDate: string; maxDate: string }
}

type ThemeEvolutionItem = {
  label: string
  type: "topic" | "bucket"
  startCount: number
  endCount: number
  delta: number
  pctChange: number
  sentimentIndexEnd: number
  topStakeholdersEnd: { label: string; count: number }[]
  topKeyTermsEnd: { term: string; count: number }[]
}

type ThemeEvolutionResponse = {
  granularity: Granularity
  rising: ThemeEvolutionItem[]
  falling: ThemeEvolutionItem[]
}

type BaseFilters = {
  granularity: Granularity
  startDate: string
  endDate: string
  stakeholder: string[]
  includeLowRelevance: boolean
  sequencingOnly: boolean
  ukOnly: boolean
  flags: string[]
  evidenceType: string[]
  searchText: string
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

function pct(n: number) {
  return `${Math.round(Number(n || 0) * 100)}%`
}

function cleanToken(s: string) {
  return String(s || "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function clampText(s: string, maxLen: number) {
  const t = cleanToken(s)
  if (t.length <= maxLen) return t
  return `${t.slice(0, Math.max(0, maxLen - 1)).trim()}…`
}

function normKey(s: string) {
  return cleanToken(s).toLowerCase()
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (a.size === 0 && b.size === 0) return 0
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  const union = a.size + b.size - inter
  return union ? inter / union : 0
}

function fmtInt(n: number) {
  return Math.round(Number(n || 0)).toLocaleString()
}

function fmtPct(p: number) {
  return `${Math.round(Number(p || 0) * 100)}%`
}

function fmtShare(n: number, total: number) {
  const denom = Number(total || 0)
  const num = Number(n || 0)
  if (!denom || denom <= 0) return "n/a"
  const pct = (num / denom) * 100
  // keep one decimal for small shares, integer when larger
  return pct < 2 ? `${pct.toFixed(1)}%` : `${Math.round(pct)}%`
}

function sentimentPhrase(index: number) {
  const v = Number(index || 0)
  if (v >= 75) return "strongly positive"
  if (v >= 65) return "positive"
  if (v >= 55) return "slightly positive"
  if (v >= 45) return "mixed"
  if (v >= 35) return "slightly negative"
  return "negative"
}

function changePhrase(p: number) {
  const pct = Math.round(Number(p || 0) * 100)
  if (pct >= 300) return "surged"
  if (pct >= 150) return "jumped sharply"
  if (pct >= 75) return "rose strongly"
  if (pct >= 35) return "moved up"
  if (pct <= -75) return "fell sharply"
  if (pct <= -35) return "cooled"
  if (pct <= -15) return "eased"
  return "was broadly flat"
}

function ensureSentence(s: string) {
  const t = String(s || "").trim()
  if (!t) return ""
  return /[.!?]$/.test(t) ? t : `${t}.`
}

function hashString(s: string) {
  // deterministic small hash for variant selection
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function inferFocusTokens(title: string, tags: string[]) {
  const t = `${cleanToken(title)} ${tags.map(cleanToken).join(" ")}`.toLowerCase()
  const f = new Set<string>()

  if (/(cns|brain|intracranial|mets)/.test(t)) f.add("cns")
  if (/(os|overall survival|pfs|progression|dfs|orr|mpr|pcr|endpoint|durable)/.test(t)) f.add("outcomes")
  if (/(safety|tolerab|tox|neuro|ae|adverse|hypercholesterolemia)/.test(t)) f.add("safety")
  if (/(nice|blueteq|nhs|reimbursement|access|uk)/.test(t)) f.add("access")
  if (/(sequenc|line of|first[- ]line|second[- ]line|adjuvant|post[- ]tki|pathway)/.test(t)) f.add("sequencing")
  if (/(competitor|vs |versus|compare|lorlatinib|alectinib|osimertinib|crizotinib|brigatinib)/.test(t)) f.add("competitive")
  if (/(biomarker|ngs|diagnostic|test|molecular|ros1|alk)/.test(t)) f.add("diagnostics")

  return Array.from(f)
}

function plainPeriodLabel(granularity: Granularity, period: string) {
  const p = cleanToken(period)
  if (!p) return ""
  try {
    if (granularity === "day") {
      // YYYY-MM-DD
      const d = parseISO(p)
      if (!isNaN(d.getTime())) return format(d, "d MMM yyyy")
      return p
    }
    if (granularity === "month") {
      // YYYY-MM
      const d = parseISO(`${p}-01`)
      if (!isNaN(d.getTime())) return format(d, "MMM yyyy")
      return p
    }
    // week: YYYY-Www (ISO week)
    const weekStart = startOfISOWeek(parseISO(`${p}-1`))
    if (!isNaN(weekStart.getTime())) return `week of ${format(weekStart, "d MMM yyyy")}`
    return p
  } catch {
    return p
  }
}

function fmtShare01(x: number) {
  const v = Number(x || 0)
  if (!isFinite(v)) return ""
  return `${Math.round(v * 100)}%`
}

function pickUnique(pool: string[], seed: string, used: Set<string>) {
  if (!pool.length) return ""
  const start = hashString(seed) % pool.length
  for (let i = 0; i < pool.length; i++) {
    const v = pool[(start + i) % pool.length]
    if (!used.has(v)) {
      used.add(v)
      return v
    }
  }
  // fall back: allow repeats if we exhausted pool
  const v = pool[start]
  used.add(v)
  return v
}

function alunbrigRelevanceKey(title: string, tags: string[]) {
  const t = `${cleanToken(title)} ${tags.map(cleanToken).join(" ")}`.toLowerCase()
  const hasBrand = /(alunbrig|brigatinib)\b/.test(t)
  if (hasBrand) return "direct"
  const hasComparatorOrClass = /(alk\b|lorlatinib|alectinib|crizotinib|osimertinib|ensartinib|trial|alina|alex|esmo|nice)/.test(t)
  return hasComparatorOrClass ? "indirect" : "unclear"
}

function relevanceNote(title: string, tags: string[], used: Set<string>) {
  const key = alunbrigRelevanceKey(title, tags)
  const pool =
    key === "direct"
      ? [
          "Alunbrig relevance: direct (explicit brand/generic mentions are present).",
          "Alunbrig relevance: direct (posts include Alunbrig/brigatinib references).",
        ]
      : key === "indirect"
        ? [
            "Alunbrig relevance: indirect (primarily ALK landscape/trial discourse; potential implications for positioning).",
            "Alunbrig relevance: indirect (context-setting discussion that may influence comparator framing).",
          ]
        : [
            "Alunbrig relevance: uncertain (review the examples to confirm whether brand-specific language is present).",
            "Alunbrig relevance: uncertain (confirm brand specificity in the underlying posts).",
          ]

  return pickUnique(pool, `rel:${key}:${title}`, used)
}

function sourcesNote(stakeholders: string[] | undefined, used: Set<string>, seed: string) {
  const s = (stakeholders || []).map(cleanToken).filter(Boolean)
  if (!s.length) return ""
  const label = s.slice(0, 2).join(" + ")
  const prefix = pickUnique(["Primary sources", "Dominant sources", "Most visible among"], `src:${seed}`, used)
  return `${prefix}: ${label}.`
}

function soWhatLine(kind: ExecCard["kind"], focus: string[], seed: string, used: Set<string>) {
  const prefixPool = ["Interpretation", "Implications", "Points to note", "Clinical context"]
  const prefix = pickUnique(prefixPool, `${seed}:prefix`, used)

  const focusPool: Record<string, string[]> = {
    outcomes: [
      "Endpoint-driven discussion is shaping the narrative; note which outcomes are emphasised and in which clinical setting.",
      "When outcomes dominate, comparative framing tends to follow; review the examples for the implicit comparator and claim boundaries.",
      "This pattern is consistent with an evidence-led signal; subsequent discussion often reuses the same endpoint language as shorthand.",
      "If the endpoint language persists across multiple periods, it may indicate a stabilising preference framework in the conversation.",
    ],
    cns: [
      "CNS/intracranial framing frequently acts as a decision anchor in ALK conversations; it can materially influence sequencing and comparative discussion.",
      "If CNS language is prominent, check whether it is framed as intracranial control, relapse prevention, or durability—each supports different interpretations.",
      "CNS themes can propagate into competitor context; confirm whether the comparator set and endpoints are consistent in example posts.",
      "Sustained CNS emphasis may indicate a shift in what the community treats as a minimum clinical standard.",
    ],
    safety: [
      "Safety/tolerability appears to be the trade-off lens; review which adverse events are referenced and whether mitigation/monitoring is discussed.",
      "When safety rises alongside efficacy, the conversation often shifts to risk–benefit thresholds and patient selection.",
      "Safety themes can be stakeholder-sensitive; confirm whether the signal is HCP-led, patient-led, or mixed in the examples.",
      "If safety remains elevated, it may indicate an emerging differentiation axis rather than transient commentary.",
    ],
    access: [
      "Access/policy discussion can materially constrain real-world adoption; review whether the posts reference eligibility, commissioning, or reimbursement criteria.",
      "System-level constraints can change the effective comparator and standard-of-care framing in the conversation.",
      "If access themes persist, implementation details (pathways, criteria, service capacity) tend to dominate the downstream discourse.",
      "Policy-related signals often diffuse across stakeholders; assess whether the signal is confined to HCPs or includes institutions/industry/media.",
    ],
    sequencing: [
      "Sequencing discussion reflects pathway-level decision making; review whether it is framed by resistance, line of therapy, or patient selection.",
      "When sequencing rises, decision rules typically become explicit; inspect whether the examples describe ‘if/then’ logic or pragmatic constraints.",
      "Sequencing often connects efficacy and tolerability; assess how trade-offs are stated and whether specific endpoints are used to justify transitions.",
      "Sustained sequencing emphasis may indicate that pathway optimisation is becoming the primary frame rather than single-asset evaluation.",
    ],
    competitive: [
      "Competitor references indicate active comparison; note the implicit comparator set and the attributes used to differentiate.",
      "Competitive framing can reset what is treated as ‘table stakes’; review whether the examples contain explicit vs implicit comparisons.",
      "Competitor context often co-occurs with endpoints and CNS; confirm whether the claim structure is consistent across posts.",
      "If competitor references remain elevated, it may indicate a stable comparative narrative rather than a one-off citation.",
    ],
    diagnostics: [
      "Testing/biomarker language often underpins patient-selection and access decisions; review whether NGS, assay choice, or workflow constraints are described.",
      "Diagnostics emphasis suggests a selection-and-timing frame; check for explicit criteria or biomarker-driven sequencing logic.",
      "When biomarkers rise, evidence and implementation are often linked; assess whether testing access and turnaround times are discussed.",
      "If diagnostics remains prominent, it may precede increases in sequencing and access-related discourse in adjacent cards.",
    ],
    general: [
      "This is a measurable shift; the key question is persistence across periods versus reversion to baseline.",
      "Review the example posts for the dominant framing and any explicit causal drivers (data, decisions, policy, comparative claims).",
      "Assess whether the signal is concentrated in a specific stakeholder group or broadly distributed.",
      "If this pattern repeats, it is likely to reflect a stable narrative rather than a transient artefact.",
    ],
  }

  // pick first matching focus pool; otherwise general
  const primary = focus.find((x) => focusPool[x]?.length) || "general"
  const line = pickUnique(focusPool[primary] || focusPool.general, `${seed}:${primary}`, used)

  // Slightly different nuance by kind to avoid cross-card sameness
  const kindPool: Record<string, string[]> = {
    alert: [
      "Spike periods are typically associated with specific catalysts; the examples help identify the primary trigger and framing.",
      "These periods often reveal the language that is most readily repeated; review the posts for claim structure and comparator cues.",
      "This is a transient peak by definition; confirm whether it is followed by sustained theme movement in other cards.",
    ],
    topic_rising: [
      "Because it is gaining share, it is likely to feature more prominently in subsequent periods.",
      "Rising topics often become default context; validate the dominant framing in the example posts.",
      "If the increase persists, it should be treated as a structural theme rather than a one-off signal.",
    ],
    topic_falling: [
      "Cooling topics may remain relevant, but are less likely to be the primary driver of current attention.",
      "This may be transitioning to background context; confirm whether it is still referenced as supporting rationale in other posts.",
      "If the decline persists, it may indicate displacement by emerging frames rather than loss of relevance.",
    ],
    bucket_rising: [
      "Bucket movement indicates a shift in framing, not just a single-topic fluctuation.",
      "When a bucket rises, it often reflects multiple sub-topics moving together; use the terms to identify the underlying drivers.",
      "This suggests a broader narrative reweighting, which can persist longer than isolated topic spikes.",
    ],
    bucket_falling: [
      "A falling bucket suggests the framing is cooling relative to other decision lenses.",
      "The end-window examples can indicate what is replacing the frame as primary context.",
      "If the decline continues, it indicates the conversation is reorganising around alternative decision criteria.",
    ],
    top_topic: [
      "High-volume themes provide the dominant context; they often shape baseline expectations for interpretation of new signals.",
      "Prominence by volume suggests broad exposure; confirm the framing to understand how the theme is being internalised.",
      "High-volume themes can set the default comparator and endpoint language; review whether the frame is efficacy-led, safety-led, or pathway-led.",
    ],
  }

  const kindLine = pickUnique(kindPool[kind] || kindPool.alert, `${seed}:kind:${kind}`, used)

  return `${prefix}: ${line} ${kindLine}`
}

function themeTakeaway(item: ThemeEvolutionItem, totalPostsInRange: number) {
  const stakeholders = (item.topStakeholdersEnd || []).slice(0, 2).map((s) => cleanToken(s.label)).filter(Boolean)
  const terms = (item.topKeyTermsEnd || []).slice(0, 5).map((t) => cleanToken(t.term)).filter(Boolean)

  const label = cleanToken(item.label)
  const share = fmtShare(item.endCount, totalPostsInRange)

  const stake = stakeholders.length ? `Who drove it: ${stakeholders.join(" + ")}.` : ""
  const key = terms.length ? `What people focused on: ${terms.join(", ")}.` : ""

  return (
    `${label} ${changePhrase(item.pctChange)} in the most recent window and represented about ${share} of the overall conversation in the selected range.` +
    ` Overall tone was ${sentimentPhrase(item.sentimentIndexEnd)}.` +
    (key ? ` ${key}` : "") +
    (stake ? ` ${stake}` : "")
  ).trim()
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
    topStakeholders?: { label: string; share: number }[]
    topBuckets: { bucket: string; share: number }[]
    topTopics: { topic: string; count: number }[]
    topDrivers: { driver: string; count: number }[]
    explanation: string
  }>
}

type ExecCard = {
  key: string
  title: string
  kind: "topic_rising" | "topic_falling" | "bucket_rising" | "bucket_falling" | "alert" | "top_topic"
  meta: string[]
  summary: string
  tags: string[]
  focus: string[]
  stakeholders?: string[]
  viewPosts:
    | { mode: "theme"; type: "topic" | "bucket"; label: string }
    | { mode: "alert"; period: string }
    | { mode: "themes"; groupBy: "topics_top_topics"; groupValue: string }
}

export function ExecutiveSummaryExplorer() {
  const today = new Date()
  const yearAgo = subMonths(today, 12)

  const [options, setOptions] = useState<OptionsResponse | null>(null)
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [didInit, setDidInit] = useState(false)

  const [applied, setApplied] = useState<BaseFilters | null>(null)

  const [draft, setDraft] = useState<BaseFilters>({
    granularity: "week",
    startDate: toISODate(yearAgo),
    endDate: toISODate(today),
    stakeholder: [],
    includeLowRelevance: false,
    sequencingOnly: false,
    ukOnly: false,
    flags: [],
    evidenceType: [],
    searchText: "",
  })

  const [evoLoading, setEvoLoading] = useState(false)
  const [evo, setEvo] = useState<ThemeEvolutionResponse | null>(null)
  const [evoError, setEvoError] = useState<string | null>(null)

  const [alertsLoading, setAlertsLoading] = useState(false)
  const [alerts, setAlerts] = useState<AlertsResponse | null>(null)
  const [alertsError, setAlertsError] = useState<string | null>(null)

  const [topTopicsLoading, setTopTopicsLoading] = useState(false)
  const [topTopics, setTopTopics] = useState<Array<any> | null>(null)
  const [topTopicsError, setTopTopicsError] = useState<string | null>(null)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerTitle, setDrawerTitle] = useState("Examples")
  const [drawerDesc, setDrawerDesc] = useState<string | undefined>(undefined)
  const [drawerReq, setDrawerReq] = useState<ExecCard["viewPosts"] | null>(null)

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

  useEffect(() => {
    if (didInit) return
    if (!options?.meta?.maxDate) return
    const maxDate = options.meta.maxDate
    const minDate = options.meta.minDate
    const max = parseISO(maxDate)
    const suggestedStart = subMonths(max, 12)
    const suggestedStartIso = toISODate(suggestedStart)
    const nextStart = suggestedStartIso < minDate ? minDate : suggestedStartIso
    const nextDraft = { ...draft, startDate: nextStart, endDate: maxDate }
    setDraft(nextDraft)
    setApplied(nextDraft)
    setDidInit(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [didInit, options?.meta?.maxDate, options?.meta?.minDate])

  useEffect(() => {
    if (!applied) return
    const q = buildParams({ ...applied, limit: 30 })
    setEvoLoading(true)
    setEvoError(null)
    fetch(`/api/alunbrig/trends/theme-evolution?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray((d as any).rising)) setEvo(d as ThemeEvolutionResponse)
        else {
          setEvo(null)
          setEvoError(String((d as any)?.error || "Failed to load trending topics"))
        }
      })
      .catch((e) => {
        setEvo(null)
        setEvoError((e as any)?.message || "Failed to load trending topics")
      })
      .finally(() => setEvoLoading(false))
  }, [applied])

  useEffect(() => {
    if (!applied) return
    const q = buildParams({ ...applied, limit: 30 })
    setAlertsLoading(true)
    setAlertsError(null)
    fetch(`/api/alunbrig/trends/alerts?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray((d as any).alerts)) setAlerts(d as AlertsResponse)
        else {
          setAlerts(null)
          setAlertsError(String((d as any)?.error || "Failed to load alerts"))
        }
      })
      .catch((e) => {
        setAlerts(null)
        setAlertsError((e as any)?.message || "Failed to load alerts")
      })
      .finally(() => setAlertsLoading(false))
  }, [applied])

  useEffect(() => {
    if (!applied) return
    const q = buildParams({
      startDate: applied.startDate,
      endDate: applied.endDate,
      includeLowRelevance: applied.includeLowRelevance,
      sequencingOnly: applied.sequencingOnly,
      flags: applied.flags,
      evidenceType: applied.evidenceType,
      searchText: applied.searchText,
      stakeholderPrimary: applied.stakeholder,
      groupBy: "topics_top_topics",
      metric: "volume",
      limit: 40,
    })
    setTopTopicsLoading(true)
    setTopTopicsError(null)
    fetch(`/api/alunbrig/themes/overview?${q}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray((d as any).items)) setTopTopics((d as any).items)
        else {
          setTopTopics(null)
          setTopTopicsError(String((d as any)?.error || "Failed to load top themes"))
        }
      })
      .catch((e) => {
        setTopTopics(null)
        setTopTopicsError((e as any)?.message || "Failed to load top themes")
      })
      .finally(() => setTopTopicsLoading(false))
  }, [applied])

  const cards = useMemo<ExecCard[]>(() => {
    const target = 10
    const max = 10
    const totalPostsInRange = Number(options?.meta?.totalPosts || 0)

    const alertCards: ExecCard[] = (alerts?.alerts || [])
      .slice()
      .sort((a, b) => (Number(b.pctChange || 0) - Number(a.pctChange || 0)) || (Number(b.delta || 0) - Number(a.delta || 0)))
      .map((a) => {
        const drivers = (a.topDrivers || []).slice(0, 4).map((d) => d.driver).filter(Boolean)
        const topics = (a.topTopics || []).slice(0, 4).map((t) => t.topic).filter(Boolean)
        const tags = Array.from(new Set([...drivers.map(cleanToken), ...topics.map(cleanToken)])).slice(0, 8)

        const topStakeholders = (a.topStakeholders || [])
          .slice(0, 3)
          .map((x: any) => `${cleanToken(x.label)}${x.share != null ? ` (${fmtShare01(x.share)})` : ""}`)
          .filter(Boolean)
        const stakeholder = cleanToken(a?.mostInvolvedStakeholder?.label || "")
        const d0 = cleanToken(drivers[0] || topics[0] || "key themes")
        const d1 = cleanToken(drivers[1] || topics[1] || "")

        const pctRounded = Math.round(Number(a.pctChange || 0) * 100)
        const sentimentRounded = Math.round(Number(a.sentimentIndex || 0))
        const share = fmtShare(Number(a.posts || 0), totalPostsInRange)
        const focus = inferFocusTokens(`${d0} ${d1}`.trim(), tags)
        const when = plainPeriodLabel(applied?.granularity || "week", a.period)

        const summary =
          `In the ${when || "most recent period"}, discussion increased materially versus baseline (approximately ${pctRounded}% above expected).` +
          ` This period accounted for ~${share} of total discussion in the selected range.` +
          ` The increase was most associated with ${d0}${d1 ? ` and ${d1}` : ""}.` +
          (topStakeholders.length
            ? ` Primary sources were ${topStakeholders.slice(0, 2).join(" and ")}.`
            : stakeholder
              ? ` The highest activity was observed among ${stakeholder}.`
              : "") +
          ` Sentiment was ${sentimentPhrase(sentimentRounded)} overall.`

        return {
          key: `alert:${a.period}`,
          kind: "alert",
          title: clampText(`Conversation spike: ${d0}${d1 ? ` + ${d1}` : ""}`, 60),
          meta: [
            when ? `Timing: ${when}` : "Timing: notable period",
            `Above baseline: ${fmtPct(Number(a.pctChange || 0))}`,
            `Conversation share: ${share}`,
            `Tone: ${sentimentPhrase(sentimentRounded)}`,
          ],
          summary,
          tags,
          focus,
          stakeholders: (a.topStakeholders || []).map((x: any) => cleanToken(x.label)).filter(Boolean).slice(0, 3),
          viewPosts: { mode: "alert", period: a.period },
        }
      })
      .filter((c) => !c.meta.join(" ").includes("0%"))

    const risingTopics: ExecCard[] = (evo?.rising || [])
      .filter((x) => x.type === "topic")
      .slice()
      .sort((a, b) => (Number(b.pctChange || 0) - Number(a.pctChange || 0)) || (Number(b.delta || 0) - Number(a.delta || 0)))
      .map((t) => ({
        key: `topic_rising:${cleanToken(t.label).toLowerCase()}`,
        kind: "topic_rising",
        title: cleanToken(t.label),
        meta: [`Trending up: ${fmtPct(t.pctChange)}`, `Conversation share: ${fmtShare(t.endCount, totalPostsInRange)}`, `Tone: ${sentimentPhrase(t.sentimentIndexEnd)}`],
        summary: themeTakeaway(t, totalPostsInRange),
        tags: (t.topKeyTermsEnd || []).map((k) => cleanToken(k.term)).filter(Boolean).slice(0, 8),
        focus: inferFocusTokens(t.label, (t.topKeyTermsEnd || []).map((k) => k.term).filter(Boolean)),
        stakeholders: (t.topStakeholdersEnd || []).map((s) => cleanToken(s.label)).filter(Boolean).slice(0, 3),
        viewPosts: { mode: "theme", type: "topic", label: cleanToken(t.label) },
      }))

    const fallingTopics: ExecCard[] = (evo?.falling || [])
      .filter((x) => x.type === "topic")
      .slice()
      .sort((a, b) => (Number(a.pctChange || 0) - Number(b.pctChange || 0)) || (Number(a.delta || 0) - Number(b.delta || 0)))
      .map((t) => ({
        key: `topic_falling:${cleanToken(t.label).toLowerCase()}`,
        kind: "topic_falling",
        title: `${cleanToken(t.label)} (cooling)`,
        meta: [`Cooling: ${fmtPct(t.pctChange)}`, `Conversation share: ${fmtShare(t.endCount, totalPostsInRange)}`, `Tone: ${sentimentPhrase(t.sentimentIndexEnd)}`],
        summary: themeTakeaway(t, totalPostsInRange),
        tags: (t.topKeyTermsEnd || []).map((k) => cleanToken(k.term)).filter(Boolean).slice(0, 8),
        focus: inferFocusTokens(t.label, (t.topKeyTermsEnd || []).map((k) => k.term).filter(Boolean)),
        stakeholders: (t.topStakeholdersEnd || []).map((s) => cleanToken(s.label)).filter(Boolean).slice(0, 3),
        viewPosts: { mode: "theme", type: "topic", label: cleanToken(t.label) },
      }))

    const risingBuckets: ExecCard[] = (evo?.rising || [])
      .filter((x) => x.type === "bucket")
      .slice()
      .sort((a, b) => (Number(b.pctChange || 0) - Number(a.pctChange || 0)) || (Number(b.delta || 0) - Number(a.delta || 0)))
      .map((t) => ({
        key: `bucket_rising:${cleanToken(t.label).toLowerCase()}`,
        kind: "bucket_rising",
        title: `${cleanToken(t.label)} (bucket)`,
        meta: [`Trending up: ${fmtPct(t.pctChange)}`, `Conversation share: ${fmtShare(t.endCount, totalPostsInRange)}`, `Tone: ${sentimentPhrase(t.sentimentIndexEnd)}`],
        summary: themeTakeaway(t, totalPostsInRange),
        tags: (t.topKeyTermsEnd || []).map((k) => cleanToken(k.term)).filter(Boolean).slice(0, 8),
        focus: inferFocusTokens(t.label, (t.topKeyTermsEnd || []).map((k) => k.term).filter(Boolean)),
        stakeholders: (t.topStakeholdersEnd || []).map((s) => cleanToken(s.label)).filter(Boolean).slice(0, 3),
        viewPosts: { mode: "theme", type: "bucket", label: cleanToken(t.label) },
      }))

    const fallingBuckets: ExecCard[] = (evo?.falling || [])
      .filter((x) => x.type === "bucket")
      .slice()
      .sort((a, b) => (Number(a.pctChange || 0) - Number(b.pctChange || 0)) || (Number(a.delta || 0) - Number(b.delta || 0)))
      .map((t) => ({
        key: `bucket_falling:${cleanToken(t.label).toLowerCase()}`,
        kind: "bucket_falling",
        title: `${cleanToken(t.label)} (bucket, cooling)`,
        meta: [`Cooling: ${fmtPct(t.pctChange)}`, `Conversation share: ${fmtShare(t.endCount, totalPostsInRange)}`, `Tone: ${sentimentPhrase(t.sentimentIndexEnd)}`],
        summary: themeTakeaway(t, totalPostsInRange),
        tags: (t.topKeyTermsEnd || []).map((k) => cleanToken(k.term)).filter(Boolean).slice(0, 8),
        focus: inferFocusTokens(t.label, (t.topKeyTermsEnd || []).map((k) => k.term).filter(Boolean)),
        stakeholders: (t.topStakeholdersEnd || []).map((s) => cleanToken(s.label)).filter(Boolean).slice(0, 3),
        viewPosts: { mode: "theme", type: "bucket", label: cleanToken(t.label) },
      }))

    const highVolumeTopics: ExecCard[] = (topTopics || [])
      .slice()
      .filter((r: any) => cleanToken(r?.group))
      .map((r: any) => {
        const title = cleanToken(r.group)
        const posts = Number(r.posts || 0)
        const share = fmtShare(posts, totalPostsInRange)
        const sentiment = Number(r.sentimentIndex || 0)
        const tone = sentimentPhrase(sentiment)
        const terms = (r.topKeyTerms || []).map((k: any) => cleanToken(k.term)).filter(Boolean).slice(0, 8)
        const stakeholders = (r.topStakeholders || []).map((s: any) => cleanToken(s.label)).filter(Boolean).slice(0, 2)
        const focus = inferFocusTokens(title, terms)

        const signalBits: string[] = []
        if (Number(r.pctCNS || 0) >= 0.35) signalBits.push("CNS-heavy")
        if (Number(r.pctSequencing || 0) >= 0.35) signalBits.push("Sequencing-heavy")
        if (Number(r.pctQoL || 0) >= 0.35) signalBits.push("QoL-heavy")
        if (Number(r.pctUKAccess || 0) >= 0.25) signalBits.push("Access/UK present")
        if (Number(r.pctNeurotox || 0) >= 0.2) signalBits.push("Neurotox present")

        const summary =
          `${title} was a prominent theme by volume in the selected range (approximately ${share} of discussion). ` +
          `Sentiment was ${tone}. ` +
          (signalBits.length ? `Signal composition: ${signalBits.join(", ")}. ` : "") +
          (terms.length ? `Common co-occurring concepts: ${terms.slice(0, 5).join(", ")}. ` : "") +
          (stakeholders.length ? `Stakeholder visibility: ${stakeholders.join(" + ")}.` : "")

        return {
          key: `top_topic:${title.toLowerCase()}`,
          kind: "top_topic" as const,
          title: `Prominent theme: ${title}`,
          meta: [`Conversation share: ${share}`, `Tone: ${tone}`],
          summary: cleanToken(summary),
          tags: terms.slice(0, 10),
          focus,
          stakeholders,
          viewPosts: { mode: "themes", groupBy: "topics_top_topics", groupValue: title },
        }
      })

    // Build a larger candidate pool, then select 10 with strict de-duplication.
    const candidates: ExecCard[] = [
      ...alertCards,
      ...risingTopics,
      ...fallingTopics,
      ...risingBuckets,
      ...fallingBuckets,
      ...highVolumeTopics,
    ]

    const quotas: Partial<Record<ExecCard["kind"], number>> = {
      alert: 3,
      topic_rising: 3,
      bucket_rising: 2,
      top_topic: 2,
      topic_falling: 0,
      bucket_falling: 0,
    }

    const selected: ExecCard[] = []
    const usedBase = new Set<string>()
    const usedTagSets: Set<string>[] = []
    const usedFocus = new Map<string, number>()
    const kindCounts: Partial<Record<ExecCard["kind"], number>> = {}

    const baseKeyOf = (c: ExecCard) =>
      normKey(
        c.key
          .replace(/^(topic_rising|topic_falling|bucket_rising|bucket_falling|top_topic):/, "")
          .replace(/^alert:/, ""),
      )

    const tagSetOf = (c: ExecCard) =>
      new Set(
        [...(c.tags || []), ...(c.focus || [])]
          .map((x) => normKey(x))
          .filter(Boolean)
          .slice(0, 16),
      )

    const isLowSignal = (c: ExecCard) => {
      const metaText = c.meta.join(" ").toLowerCase()
      if (metaText.includes("0%") || metaText.includes("broadly flat")) return true
      if (normKey(c.title) === "other" || normKey(c.title).startsWith("other (bucket")) return true
      return false
    }

    const kindPriority: ExecCard["kind"][] = ["alert", "topic_rising", "bucket_rising", "top_topic"]

    // Sort candidates within kind by strength proxies.
    const strength = (c: ExecCard) => {
      const m = c.meta.join(" ").toLowerCase()
      const pctMatch = m.match(/(\d+)%/)
      const pct = pctMatch ? Number(pctMatch[1]) : 0
      const shareMatch = m.match(/(\d+(\.\d+)?)%/)
      const share = shareMatch ? Number(shareMatch[1]) : 0
      return pct * 2 + share
    }

    const byKind = new Map<ExecCard["kind"], ExecCard[]>()
    for (const k of kindPriority) byKind.set(k, [])
    for (const c of candidates) {
      if (!byKind.has(c.kind)) continue
      byKind.get(c.kind)!.push(c)
    }
    for (const k of kindPriority) byKind.get(k)!.sort((a, b) => strength(b) - strength(a))

    const canTake = (c: ExecCard) => {
      if (isLowSignal(c)) return false
      const base = baseKeyOf(c)
      if (usedBase.has(base)) return false

      const nextKindCount = (kindCounts[c.kind] || 0) + 1
      const quota = quotas[c.kind]
      if (quota !== undefined && nextKindCount > quota) return false

      const tags = tagSetOf(c)
      // avoid near-duplicates by overlap
      for (const prev of usedTagSets) {
        if (jaccard(tags, prev) >= 0.55) return false
      }

      // avoid over-representing the same primary focus
      const primary = c.focus?.[0] || "general"
      if ((usedFocus.get(primary) || 0) >= 3) return false

      return true
    }

    const accept = (c: ExecCard) => {
      selected.push(c)
      usedBase.add(baseKeyOf(c))
      usedTagSets.push(tagSetOf(c))
      kindCounts[c.kind] = (kindCounts[c.kind] || 0) + 1
      const primary = c.focus?.[0] || "general"
      usedFocus.set(primary, (usedFocus.get(primary) || 0) + 1)
    }

    // First pass: satisfy quotas in priority order
    for (const k of kindPriority) {
      const quota = quotas[k] || 0
      for (const c of byKind.get(k) || []) {
        if (selected.length >= target) break
        if ((kindCounts[k] || 0) >= quota) break
        if (canTake(c)) accept(c)
      }
    }

    // Second pass: fill remaining with the strongest non-duplicate across priority kinds
    while (selected.length < target) {
      let picked: ExecCard | null = null
      for (const k of kindPriority) {
        for (const c of byKind.get(k) || []) {
          if (canTake(c)) {
            picked = c
            break
          }
        }
        if (picked) break
      }
      if (!picked) break
      accept(picked)
    }

    const sliced = selected.slice(0, target)

    // Add a unique "so what" line per card (no copy/paste repetition across cards).
    const used = new Set<string>()
    return sliced.map((c) => ({
      ...c,
      summary: [
        ensureSentence(c.summary),
        sourcesNote(c.stakeholders, used, c.key),
        relevanceNote(c.title, c.tags, used),
        soWhatLine(c.kind, c.focus, c.key, used),
      ]
        .filter(Boolean)
        .join(" "),
    }))
  }, [alerts, evo, options?.meta?.totalPosts, topTopics])

  const requestUrl = useCallback(
    (offset: number) => {
      if (!applied || !drawerReq) return "/api/alunbrig/trends/examples?limit=50&offset=0"
      if (drawerReq.mode === "alert") {
        return `/api/alunbrig/trends/examples?${buildParams({
          ...applied,
          mode: "alert",
          period: drawerReq.period,
          limit: 50,
          offset,
        })}`
      }
      if (drawerReq.mode === "themes") {
        return `/api/alunbrig/themes/examples?${buildParams({
          startDate: applied.startDate,
          endDate: applied.endDate,
          includeLowRelevance: applied.includeLowRelevance,
          sequencingOnly: applied.sequencingOnly,
          flags: applied.flags,
          evidenceType: applied.evidenceType,
          searchText: applied.searchText,
          stakeholderPrimary: applied.stakeholder,
          groupBy: drawerReq.groupBy,
          groupValue: drawerReq.groupValue,
          limit: 50,
          offset,
        })}`
      }
      return `/api/alunbrig/trends/examples?${buildParams({
        ...applied,
        mode: "theme",
        type: drawerReq.type,
        label: drawerReq.label,
        limit: 50,
        offset,
      })}`
    },
    [applied, drawerReq],
  )

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/[0.10] via-card/40 to-card/40 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Executive Summary</h1>
          <div className="text-sm text-muted-foreground">
            Summaries are derived from the same BigQuery-backed signals used across the app.
          </div>
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base font-medium">What matters right now</CardTitle>
              <div className="text-sm text-muted-foreground">
                A high-level, always-updated summary of the biggest conversation shifts and themes in this dataset. Each card is built from live data (it will change as the data changes) — use “View posts” to see the underlying examples.
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {optionsLoading && !options ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (evoLoading || alertsLoading) && !evo && !alerts ? (
            <div className="text-sm text-muted-foreground">Building highlights…</div>
          ) : evoError || alertsError ? (
            <div className="text-sm text-destructive">Error: {String(evoError || alertsError)}</div>
          ) : cards.length === 0 ? (
            <div className="text-sm text-muted-foreground">No notable items found in the current slice.</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {cards.map((c) => (
                <Card key={c.key} className="border-border/60 bg-card/40">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base leading-tight">{c.title}</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDrawerReq(c.viewPosts)
                          setDrawerTitle(c.viewPosts.mode === "alert" ? `Alert period | ${c.viewPosts.period}` : `${c.viewPosts.type === "topic" ? "Topic" : "Bucket"} | ${c.viewPosts.label}`)
                          setDrawerDesc(
                            c.viewPosts.mode === "alert"
                              ? "Showing social media data for this above-baseline alert period."
                              : "Showing social media data for the end-window slice of the selected range.",
                          )
                          setDrawerOpen(true)
                        }}
                      >
                        View posts
                      </Button>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {c.meta.map((m) => (
                        <span key={m}>{m}</span>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-muted-foreground">{c.summary}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(c.tags || []).slice(0, 10).map((t) => (
                        <Badge key={`${c.key}-${t}`} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ExamplePostsDrawer open={drawerOpen} onOpenChange={setDrawerOpen} title={drawerTitle} description={drawerDesc} requestUrl={requestUrl} />
    </div>
  )
}

