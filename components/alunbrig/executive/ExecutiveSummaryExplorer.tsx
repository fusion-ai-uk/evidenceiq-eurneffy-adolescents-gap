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

function soWhatLine(kind: ExecCard["kind"], focus: string[], seed: string, used: Set<string>) {
  const prefixPool = ["Client takeaway", "Practical implication", "What to watch", "So what"]
  const prefix = pickUnique(prefixPool, `${seed}:prefix`, used)

  const focusPool: Record<string, string[]> = {
    outcomes: [
      "Efficacy proof points are doing the heavy lifting here—pay attention to which endpoints are being quoted and in what setting.",
      "Outcome language is setting the frame; this is the kind of signal that influences preference and switching narratives.",
      "When endpoints dominate the conversation, comparative claims tend to harden—watch what gets positioned as ‘best-in-class’.",
      "This looks like an evidence-led moment; expect follow-on discussion to reference the same endpoints as shorthand.",
    ],
    cns: [
      "CNS framing acts as an attention magnet in ALK conversations; intracranial control language often steers comparisons and sequencing.",
      "If CNS is driving attention, look for ‘brain control’ to become the default yardstick in peer-to-peer discussion.",
      "CNS narratives travel fast because they feel clinically decisive—expect them to show up in competitor mentions and pathway logic.",
      "This is a ‘brain benefit’ moment; it can shift which attributes people treat as non-negotiable.",
    ],
    safety: [
      "Safety/tolerability is being used as the trade-off lens; watch which AEs are called out and how they’re framed as manageable (or not).",
      "When safety rises, messaging quality matters—specific AE language and mitigation details can change the tone quickly.",
      "This is likely a risk–benefit discussion; small differences in tolerability can become decisive in sequencing talk.",
      "Safety themes often pull patients/caregivers into the conversation—worth tracking who is amplifying the point.",
    ],
    access: [
      "Access and policy cues can move adoption faster than clinical nuance—track how NICE/Blueteq-type language shifts the practicality of the story.",
      "This looks like a system-level constraint conversation; it can change what ‘best’ means in the real world.",
      "When access heats up, implementation details matter; expect ‘who can get what, where’ to dominate follow-on posts.",
      "Policy moments tend to ripple—watch for spillover into stakeholder conversations beyond HCPs.",
    ],
    sequencing: [
      "The conversation is shifting from ‘best drug’ to ‘best pathway’; sequencing logic will matter as much as endpoints.",
      "When sequencing rises, decision rules appear—look for patient-selection and resistance framing to show up more.",
      "This is pathway thinking: what comes next, and why. That tends to drive tool/education needs for clients.",
      "Sequencing talk often becomes the bridge between efficacy and safety—watch how trade-offs are described.",
    ],
    competitive: [
      "Competitor references signal active comparison; note who becomes the default comparator and what attributes are used to differentiate.",
      "This is a head-to-head framing moment—even implicit comparisons can reset which claims feel ‘table stakes’.",
      "Competitive language usually co-moves with endpoints and CNS; watch for a ‘winner narrative’ forming.",
      "If competitor mentions persist, clients will ask ‘why not X?’—it’s a good time to sharpen differentiation.",
    ],
    diagnostics: [
      "Testing/biomarker language often precedes decision and access conversations; watch for NGS and selection criteria as the narrative backbone.",
      "Diagnostics focus suggests a ‘right patient, right time’ frame—useful for positioning around decision support.",
      "When biomarkers rise, evidence and implementation get linked; expect talk about testing access and workflow.",
      "This is patient-selection logic taking shape; it tends to show up next in sequencing and payer/access posts.",
    ],
    general: [
      "This is a clear attention signal; the key is whether it persists across weeks or fades after the initial moment.",
      "If this holds, it becomes part of the default client narrative—worth checking the examples for the strongest phrasing.",
      "This pattern often points to a new ‘headline’ idea; track whether it spreads across stakeholders.",
      "This looks like a meaningful framing shift; it can influence what questions clients bring to the next discussion.",
    ],
  }

  // pick first matching focus pool; otherwise general
  const primary = focus.find((x) => focusPool[x]?.length) || "general"
  const line = pickUnique(focusPool[primary] || focusPool.general, `${seed}:${primary}`, used)

  // Slightly different nuance by kind to avoid cross-card sameness
  const kindPool: Record<string, string[]> = {
    alert: [
      "Spikes like this are where narratives ‘break through’—they’re usually worth opening the posts drawer to see the exact wording.",
      "Alert weeks are often triggered by a specific catalyst; the examples typically show the trigger clearly.",
      "This is an attention peak—helpful for understanding what is cutting through right now.",
    ],
    topic_rising: [
      "Because it’s gaining share, this is likely to show up more in future client questions and comparisons.",
      "Rising topics tend to become default context; the phrasing in example posts is what clients will echo.",
      "If it keeps rising, it becomes a stable pillar rather than a one-off mention.",
    ],
    topic_falling: [
      "Cooling topics still matter, but they’re less likely to be the headline driver right now.",
      "This may be moving into ‘background’ status—useful context, but not today’s main lever.",
      "If it stays down, it can free up narrative space for emerging themes.",
    ],
    bucket_rising: [
      "Bucket movement is a signal of the *frame* changing, not just a single topic spiking.",
      "When a bucket rises, it usually pulls multiple sub-topics along with it—worth checking the terms for the underlying drivers.",
      "This indicates a broader framing shift, which tends to persist longer than a single-topic blip.",
    ],
    bucket_falling: [
      "A falling bucket suggests the frame is cooling; clients may still care, but it may not lead the conversation.",
      "This frame is losing momentum relative to others; the end-window examples show what replaced it.",
      "If this keeps falling, it’s a sign the conversation is reorganising around different decision lenses.",
    ],
    top_topic: [
      "High-volume themes are the ‘background context’ clients will keep hearing; it’s useful to know what they’re most exposed to.",
      "Because it’s prominent by volume, this is likely to be part of the default storyline clients bring into meetings.",
      "High-volume themes often set expectations; the key is whether the framing is efficacy-led, safety-led, or pathway-led.",
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
    const target = 30
    const max = 32
    const totalPostsInRange = Number(options?.meta?.totalPosts || 0)

    const alertCards: ExecCard[] = (alerts?.alerts || [])
      .slice()
      .sort((a, b) => (Number(b.pctChange || 0) - Number(a.pctChange || 0)) || (Number(b.delta || 0) - Number(a.delta || 0)))
      .map((a) => {
        const drivers = (a.topDrivers || []).slice(0, 4).map((d) => d.driver).filter(Boolean)
        const topics = (a.topTopics || []).slice(0, 4).map((t) => t.topic).filter(Boolean)
        const tags = Array.from(new Set([...drivers.map(cleanToken), ...topics.map(cleanToken)])).slice(0, 8)

        const stakeholder = cleanToken(a?.mostInvolvedStakeholder?.label || "")
        const d0 = cleanToken(drivers[0] || topics[0] || "key themes")
        const d1 = cleanToken(drivers[1] || topics[1] || "")

        const pctRounded = Math.round(Number(a.pctChange || 0) * 100)
        const sentimentRounded = Math.round(Number(a.sentimentIndex || 0))
        const share = fmtShare(Number(a.posts || 0), totalPostsInRange)
        const focus = inferFocusTokens(`${d0} ${d1}`.trim(), tags)
        const when = plainPeriodLabel(applied?.granularity || "week", a.period)

        const summary =
          `In the ${when || "latest period"}, conversation rose well above what we’d normally expect for this slice (around ${pctRounded}% higher than baseline).` +
          ` This accounted for roughly ${share} of total discussion in the selected range, so it reads as a genuine attention moment rather than background variation.` +
          ` The conversation concentrated on ${d0}${d1 ? ` and ${d1}` : ""}, which helps explain what specifically pulled interest.` +
          (stakeholder ? ` Activity was led primarily by ${stakeholder}, suggesting where the narrative is being set.` : "") +
          ` Overall tone was ${sentimentPhrase(sentimentRounded)}.`

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
          `${title} was one of the biggest themes by volume in the selected range (about ${share} of the conversation). ` +
          `Overall tone was ${tone}. ` +
          (signalBits.length ? `This theme skewed ${signalBits.join(", ")}. ` : "") +
          (terms.length ? `People most often referenced ${terms.slice(0, 5).join(", ")}. ` : "") +
          (stakeholders.length ? `The conversation was most visible among ${stakeholders.join(" + ")}.` : "")

        return {
          key: `top_topic:${title.toLowerCase()}`,
          kind: "top_topic" as const,
          title: `High-volume theme: ${title}`,
          meta: [`Conversation share: ${share}`, `Tone: ${tone}`],
          summary: cleanToken(summary),
          tags: terms.slice(0, 10),
          focus,
          viewPosts: { mode: "themes", groupBy: "topics_top_topics", groupValue: title },
        }
      })

    const out: ExecCard[] = []
    const pushUnique = (arr: ExecCard[]) => {
      for (const c of arr) {
        // De-dupe by base label so the same topic/bucket doesn't appear twice (e.g. rising + cooling).
        const baseKey = c.key.replace(/^(topic_rising|topic_falling|bucket_rising|bucket_falling|top_topic):/, "")
        const isDup = out.some((x) => x.key.includes(`:${baseKey}`) || x.key === c.key)
        if (isDup) continue
        // Skip obvious low-signal cards (flat change or zero delta).
        const metaText = c.meta.join(" ").toLowerCase()
        if (metaText.includes("0%") || metaText.includes("broadly flat")) continue
        if (c.title.toLowerCase().trim() === "other" || c.title.toLowerCase().startsWith("other (bucket")) continue
        out.push(c)
        if (out.length >= max) break
      }
    }

    // Priority: alerts + rising topics + cooling topics, then buckets as filler.
    pushUnique(alertCards)
    pushUnique(
      risingTopics.filter((t) => Number(evo?.rising?.find((x) => x.type === "topic" && cleanToken(x.label).toLowerCase() === t.title.toLowerCase())?.pctChange || 0) >= 0.2),
    )
    pushUnique(
      fallingTopics.filter((t) => {
        const base = t.title.replace(/\s*\(cooling\)\s*$/i, "").toLowerCase()
        const src = (evo?.falling || []).find((x) => x.type === "topic" && cleanToken(x.label).toLowerCase() === base)
        return Number(src?.pctChange || 0) <= -0.2
      }),
    )
    pushUnique(risingBuckets.filter((b) => b.title.toLowerCase().includes("sequencing") || b.title.toLowerCase().includes("efficacy") || b.title.toLowerCase().includes("cns") || b.title.toLowerCase().includes("safety")))
    pushUnique(fallingBuckets.filter((b) => Number(b.meta.join(" ").includes("10%")) ? false : true))
    // Additional distinct cards: high-volume themes (broad view)
    pushUnique(highVolumeTopics)

    // Backfill if we got too strict.
    if (out.length < 12) {
      pushUnique(risingTopics)
      pushUnique(fallingTopics)
      pushUnique(risingBuckets)
      pushUnique(fallingBuckets)
      pushUnique(highVolumeTopics)
    }

    const sliced = out.slice(0, Math.min(max, Math.max(8, target)))

    // Add a unique "so what" line per card (no copy/paste repetition across cards).
    const used = new Set<string>()
    return sliced.map((c) => ({
      ...c,
      summary: `${ensureSentence(c.summary)} ${soWhatLine(c.kind, c.focus, c.key, used)}`,
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

