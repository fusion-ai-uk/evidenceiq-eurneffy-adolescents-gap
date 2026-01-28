import crypto from "node:crypto"

import type { ExecutiveFilters, ExecutiveViewMode } from "@/lib/alunbrig/executiveFilters"

export type ExecutiveWeekInfo = { week: string; startDate: string; endDate: string; posts: number }

export type ExecutiveCard = {
  cardId: string
  bucket: string
  title: string
  takeaway: string
  signalStrength: number
  sentimentIndex: number
  emotion: { primary: string; intensity: number }
  posts: number
  delta: { baselinePosts: number | null; deltaPosts: number | null; pctChange: number | null }
  audience: {
    topStakeholder: string
    stakeholderShares: { label: string; share: number }[]
  }
  flags: {
    sequencing: boolean
    pfs: boolean
    attrition: boolean
    qol: boolean
    neurotox: boolean
    cns: boolean
    uk_access: boolean
  }
  competitive: {
    context: string
    stanceTowardAlunbrig: string
    topCompetitors: { name: string; mentions: number }[]
  }
  evidence: {
    topDrivers: { driver: string; count: number }[]
    topKeyTerms: { term: string; count: number }[]
    topHurdles: { hurdle: string; count: number }[]
    topOpportunities: { opp: string; count: number }[]
    contentAngles: { angle: string; count: number }[]
  }
  examples: Array<{
    id: string
    created_ts: string
    stakeholder_primary: string
    sentiment_label: string
    engagement: number
    text: string
    url: string
  }>
  drilldown: {
    cluster: { bucket: string; clusterKey: string }
    period: { type: "week" | "full"; week: string; startDate: string; endDate: string }
  }
}

export type ExecutiveCardsResponse = {
  meta: {
    view: ExecutiveViewMode
    week: string
    weekStartDate: string
    weekEndDate: string
    baselineWeeks: string[]
    filters: any
    counts: { posts: number; keptPosts: number; sequencingPosts: number; ukAccessPosts: number }
  }
  sections: Array<{ id: string; title: string; cards: ExecutiveCard[] }>
}

export type ExecutiveBaseRow = {
  created_ts: any
  created_week: string
  created_date: any

  id: string
  url: string
  text: string
  engagement: number

  stakeholder_primary: string
  stakeholder_bucket: string

  sentiment_label: string
  sentiment_polarity_minus1_to_1: number | null
  sentiment_emotion_primary: string | null
  sentiment_emotion_intensity_0_100: number | null
  sentiment_drivers: string | null

  topics_key_terms: string | null
  topics_top_topics: string | null
  topics_theme_summary: string | null

  card_bucket: string | null
  card_title: string | null
  card_takeaway: string | null
  card_signal_strength_0_100: number | null
  card_content_angle_suggestions: string | null
  insight_tags_hurdles: string | null
  insight_tags_opportunities: string | null

  competitive_positioning_comparative_context: string | null
  competitive_positioning_stance_toward_alunbrig: string | null
  entities_competitors: string | null

  sequencing_is_sequencing_discussed: boolean
  sequencing_pfs_or_pfs2_mentioned: boolean
  sequencing_attrition_or_discontinuation: boolean
  topics_brief_flags_quality_of_life: boolean
  topics_brief_flags_neuro_or_cognitive_toxicity: boolean
  topics_brief_flags_cns_or_brain_mets: boolean
  topics_brief_flags_uk_access_or_reimbursement: boolean
  uk_access_is_uk_related: boolean
}

const STOPWORDS = new Set(["the", "a", "an", "and", "or", "of", "to", "in", "for", "with"])

export function normalizeText(input: unknown) {
  const raw = String(input ?? "")
  const lowered = raw.toLowerCase().trim()
  const collapsed = lowered.replace(/\s+/g, " ")
  return collapsed.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "")
}

export function getClusterTitleKey(row: ExecutiveBaseRow) {
  const title = (row.card_title ?? "").trim()
  const fallback = (row.topics_theme_summary ?? "").trim()
  return title ? normalizeText(title) : normalizeText(fallback)
}

export function getClusterKey(row: ExecutiveBaseRow) {
  const bucket = (row.card_bucket ?? "unspecified").trim() || "unspecified"
  const titleKey = getClusterTitleKey(row)
  return `${bucket}::${titleKey}`
}

export function sha1(input: string) {
  return crypto.createHash("sha1").update(input).digest("hex")
}

function toNumber(x: any) {
  const n = typeof x === "number" ? x : Number(x)
  return Number.isFinite(n) ? n : 0
}

function avg(nums: number[]) {
  if (!nums.length) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

function mode(strings: Array<string | null | undefined>) {
  const counts = new Map<string, number>()
  for (const s of strings) {
    const v = (s ?? "").trim()
    if (!v) continue
    counts.set(v, (counts.get(v) || 0) + 1)
  }
  let best = ""
  let bestN = 0
  for (const [k, n] of counts.entries()) {
    if (n > bestN) {
      bestN = n
      best = k
    }
  }
  return best
}

function splitTokens(v: string | null | undefined) {
  return String(v ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
}

function topCounts(items: string[], limit: number) {
  const map = new Map<string, number>()
  for (const it of items) map.set(it, (map.get(it) || 0) + 1)
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
}

function jaccard(a: Set<string>, b: Set<string>) {
  const union = new Set<string>()
  for (const x of a) union.add(x)
  for (const x of b) union.add(x)
  if (union.size === 0) return 0
  let inter = 0
  for (const x of a) if (b.has(x)) inter++
  return inter / union.size
}

function titleTokenSet(normalizedTitle: string) {
  const toks = normalizedTitle
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t && !STOPWORDS.has(t))
  return new Set(toks)
}

type ClusterAgg = {
  clusterKey: string
  bucket: string
  normalizedTitle: string
  title: string
  takeaway: string
  signalStrength: number
  sentimentIndex: number
  emotion: { primary: string; intensity: number }
  posts: number
  baselineAvg: number | null
  deltaPosts: number | null
  pctChange: number | null
  rates: {
    sequencing: number
    pfs: number
    attrition: number
    neurotox: number
    qol: number
    cns: number
    uk_access: number
    competitive_context: number
    competitor_mentions: number
  }
  audience: { topStakeholder: string; stakeholderShares: { label: string; share: number }[] }
  flags: ExecutiveCard["flags"]
  competitive: ExecutiveCard["competitive"]
  evidence: ExecutiveCard["evidence"]
  examples: ExecutiveCard["examples"]
}

function dedupeByJaccard(items: ClusterAgg[]) {
  const sorted = [...items].sort((a, b) => b.signalStrength - a.signalStrength)
  const kept: ClusterAgg[] = []
  for (const it of sorted) {
    const itSet = titleTokenSet(it.normalizedTitle)
    const isDup = kept.some((k) => k.bucket === it.bucket && jaccard(itSet, titleTokenSet(k.normalizedTitle)) >= 0.75)
    if (!isDup) kept.push(it)
  }
  return kept
}

function safePctChange(deltaPosts: number, baselinePosts: number) {
  if (!Number.isFinite(deltaPosts) || !Number.isFinite(baselinePosts)) return null
  if (baselinePosts <= 0) return null
  return (deltaPosts / baselinePosts) * 100
}

function scoreCluster({
  strengthAvg0to100,
  postsCurrent,
  noveltyRatio,
  engagementSum,
  rates,
}: {
  strengthAvg0to100: number
  postsCurrent: number
  noveltyRatio: number
  engagementSum: number
  rates: { sequencing: number; neurotox: number; qol: number; cns: number; uk_access: number }
}) {
  const log = (x: number) => Math.log(x)
  const raw =
    0.4 * (Math.max(0, Math.min(100, strengthAvg0to100)) / 100) +
    0.25 * (log(1 + Math.max(0, postsCurrent)) / log(1 + 50)) +
    0.25 * (Math.min(2, Math.max(0, noveltyRatio)) / 2) +
    0.1 * (log(1 + Math.max(0, engagementSum)) / log(1 + 500))

  let booster = 0
  if (rates.sequencing >= 0.25) booster += 0.03
  if (rates.neurotox >= 0.15) booster += 0.03
  if (rates.qol >= 0.15) booster += 0.02
  if (rates.cns >= 0.15) booster += 0.02
  if (rates.uk_access >= 0.1) booster += 0.02

  const final = 100 * Math.min(1, raw + booster)
  return Math.round(final)
}

function asIsoString(ts: any) {
  if (!ts) return ""
  if (typeof ts === "string") return ts
  if (ts instanceof Date) return ts.toISOString()
  const v = (ts as any)?.value
  if (typeof v === "string") return v
  if (v instanceof Date) return v.toISOString()
  return String(ts)
}

export function isoWeekStartEnd(weekStr: string) {
  const m = /^(\d{4})-W(\d{2})$/.exec(weekStr)
  if (!m) return { startDate: "", endDate: "" }
  const year = Number(m[1])
  const week = Number(m[2])
  if (!Number.isFinite(year) || !Number.isFinite(week)) return { startDate: "", endDate: "" }

  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7
  const week1Monday = new Date(jan4)
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1)

  const monday = new Date(week1Monday)
  monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)

  const toISODate = (d: Date) => d.toISOString().slice(0, 10)
  return { startDate: toISODate(monday), endDate: toISODate(sunday) }
}

export function isoWeekStringFromDate(date: Date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  const y = d.getUTCFullYear()
  const w = String(weekNo).padStart(2, "0")
  return `${y}-W${w}`
}

export function prevIsoWeek(weekStr: string) {
  const { startDate } = isoWeekStartEnd(weekStr)
  if (!startDate) return ""
  const d = new Date(`${startDate}T00:00:00.000Z`)
  d.setUTCDate(d.getUTCDate() - 7)
  return isoWeekStringFromDate(d)
}

function computeClusterAgg(
  clusterKey: string,
  bucket: string,
  normalizedTitle: string,
  currentRows: ExecutiveBaseRow[],
  baselineRows: ExecutiveBaseRow[],
  baselineWeeksCount: number,
  view: ExecutiveViewMode,
) {
  const posts = currentRows.length
  const strengthAvg = avg(currentRows.map((r) => (r.card_signal_strength_0_100 == null ? 0 : toNumber(r.card_signal_strength_0_100))))
  const engagementSum = currentRows.reduce((a, r) => a + toNumber(r.engagement), 0)
  const sentimentIndex = avg(
    currentRows
      .map((r) => r.sentiment_polarity_minus1_to_1)
      .filter((v) => v !== null && v !== undefined && Number.isFinite(Number(v)))
      .map((v) => (Number(v) + 1) * 50),
  )

  const sequencingRate = posts ? currentRows.filter((r) => r.sequencing_is_sequencing_discussed).length / posts : 0
  const pfsRate = posts ? currentRows.filter((r) => r.sequencing_pfs_or_pfs2_mentioned).length / posts : 0
  const attritionRate = posts ? currentRows.filter((r) => r.sequencing_attrition_or_discontinuation).length / posts : 0
  const neurotoxRate = posts ? currentRows.filter((r) => r.topics_brief_flags_neuro_or_cognitive_toxicity).length / posts : 0
  const qolRate = posts ? currentRows.filter((r) => r.topics_brief_flags_quality_of_life).length / posts : 0
  const cnsRate = posts ? currentRows.filter((r) => r.topics_brief_flags_cns_or_brain_mets).length / posts : 0
  const ukRate = posts ? currentRows.filter((r) => r.uk_access_is_uk_related || r.topics_brief_flags_uk_access_or_reimbursement).length / posts : 0

  const compContextRate =
    posts
      ? currentRows.filter((r) =>
          ["Alunbrig_vs_competitor", "competitor_only", "class_discussion"].includes(String(r.competitive_positioning_comparative_context ?? "").trim()),
        ).length / posts
      : 0
  const competitorMentionsRate = posts ? currentRows.filter((r) => splitTokens(r.entities_competitors).length > 0).length / posts : 0

  const baselineTotal = baselineRows.length
  const baselineAvg = baselineWeeksCount > 0 ? baselineTotal / baselineWeeksCount : 0

  const noveltyRatio = baselineAvg > 0 ? posts / baselineAvg : posts > 0 ? 2 : 0
  const signalStrength = scoreCluster({
    strengthAvg0to100: strengthAvg,
    postsCurrent: posts,
    noveltyRatio,
    engagementSum,
    rates: { sequencing: sequencingRate, neurotox: neurotoxRate, qol: qolRate, cns: cnsRate, uk_access: ukRate },
  })

  const deltaPosts = baselineWeeksCount > 0 ? posts - baselineAvg : null
  const pctChange = baselineAvg > 0 && deltaPosts !== null ? safePctChange(deltaPosts, baselineAvg) : null

  const repTitle = mode(currentRows.map((r) => (r.card_title ?? "").trim())) || mode(currentRows.map((r) => (r.topics_theme_summary ?? "").trim()))
  const title = repTitle ? (repTitle.length > 120 ? repTitle.slice(0, 117) + "..." : repTitle) : normalizedTitle
  const repTakeaway =
    mode(currentRows.filter((r) => (r.card_title ?? "").trim() === repTitle).map((r) => (r.card_takeaway ?? "").trim())) ||
    mode(currentRows.map((r) => (r.card_takeaway ?? "").trim())) ||
    mode(currentRows.map((r) => (r.topics_theme_summary ?? "").trim())) ||
    ""

  const primaryEmotion = mode(currentRows.map((r) => r.sentiment_emotion_primary)) || "unknown"
  const intensity = avg(
    currentRows
      .filter((r) => (r.sentiment_emotion_primary ?? "").trim() === primaryEmotion)
      .map((r) => r.sentiment_emotion_intensity_0_100)
      .filter((v) => v !== null && v !== undefined)
      .map((v) => toNumber(v)),
  )

  const bucketCounts = new Map<string, number>()
  for (const r of currentRows) {
    const b = (r.stakeholder_bucket || "Other").trim() || "Other"
    bucketCounts.set(b, (bucketCounts.get(b) || 0) + 1)
  }
  const shares = Array.from(bucketCounts.entries())
    .map(([label, count]) => ({ label, share: posts ? count / posts : 0 }))
    .sort((a, b) => b.share - a.share)
  const topStakeholder = shares[0]?.label || "Other"

  const flags = {
    sequencing: currentRows.some((r) => r.sequencing_is_sequencing_discussed),
    pfs: currentRows.some((r) => r.sequencing_pfs_or_pfs2_mentioned),
    attrition: currentRows.some((r) => r.sequencing_attrition_or_discontinuation),
    qol: currentRows.some((r) => r.topics_brief_flags_quality_of_life),
    neurotox: currentRows.some((r) => r.topics_brief_flags_neuro_or_cognitive_toxicity),
    cns: currentRows.some((r) => r.topics_brief_flags_cns_or_brain_mets),
    uk_access: currentRows.some((r) => r.uk_access_is_uk_related || r.topics_brief_flags_uk_access_or_reimbursement),
  }

  const context = mode(currentRows.map((r) => r.competitive_positioning_comparative_context))?.trim() || "unknown"
  const stance = mode(currentRows.map((r) => r.competitive_positioning_stance_toward_alunbrig))?.trim() || "unknown"
  const competitorTokens = currentRows.flatMap((r) => splitTokens(r.entities_competitors))
  const topCompetitors = topCounts(competitorTokens, 5).map(([name, mentions]) => ({ name, mentions }))

  const driverTokens = currentRows.flatMap((r) => splitTokens(r.sentiment_drivers))
  const keyTermTokens = currentRows.flatMap((r) => splitTokens(r.topics_key_terms))
  const hurdleTokens = currentRows.flatMap((r) => splitTokens(r.insight_tags_hurdles))
  const oppTokens = currentRows.flatMap((r) => splitTokens(r.insight_tags_opportunities))
  const angleTokens = currentRows.flatMap((r) => splitTokens(r.card_content_angle_suggestions))

  const evidence = {
    topDrivers: topCounts(driverTokens, 6).map(([driver, count]) => ({ driver, count })),
    topKeyTerms: topCounts(keyTermTokens, 8).map(([term, count]) => ({ term, count })),
    topHurdles: topCounts(hurdleTokens, 6).map(([hurdle, count]) => ({ hurdle, count })),
    topOpportunities: topCounts(oppTokens, 6).map(([opp, count]) => ({ opp, count })),
    contentAngles: topCounts(angleTokens, 6).map(([angle, count]) => ({ angle, count })),
  }

  const examples = [...currentRows]
    .sort((a, b) => toNumber(b.engagement) - toNumber(a.engagement) || asIsoString(b.created_ts).localeCompare(asIsoString(a.created_ts)))
    .slice(0, 6)
    .map((r) => ({
      id: String(r.id),
      created_ts: asIsoString(r.created_ts),
      stakeholder_primary: (r.stakeholder_primary ?? "").trim(),
      sentiment_label: (r.sentiment_label ?? "").trim(),
      engagement: toNumber(r.engagement),
      text: String(r.text ?? ""),
      url: String(r.url ?? ""),
    }))

  return {
    clusterKey,
    bucket,
    normalizedTitle,
    title,
    takeaway: repTakeaway,
    signalStrength,
    sentimentIndex: Math.round(sentimentIndex),
    emotion: { primary: primaryEmotion, intensity: Math.round(intensity) },
    posts,
    baselineAvg: baselineWeeksCount > 0 ? baselineAvg : null,
    deltaPosts: baselineWeeksCount > 0 ? posts - baselineAvg : null,
    pctChange,
    rates: {
      sequencing: sequencingRate,
      pfs: pfsRate,
      attrition: attritionRate,
      neurotox: neurotoxRate,
      qol: qolRate,
      cns: cnsRate,
      uk_access: ukRate,
      competitive_context: compContextRate,
      competitor_mentions: competitorMentionsRate,
    },
    audience: { topStakeholder, stakeholderShares: shares.slice(0, 5) },
    flags,
    competitive: { context: context || "unknown", stanceTowardAlunbrig: stance || "unknown", topCompetitors },
    evidence,
    examples,
  } satisfies ClusterAgg
}

function buildCardsFromAggs(aggs: ClusterAgg[], view: ExecutiveViewMode, period: { type: "week" | "full"; week: string; startDate: string; endDate: string }) {
  return aggs.map((a) => {
    const cardId = sha1(`${view}|${period.week}|${a.bucket}|${a.normalizedTitle}`)
    return {
      cardId,
      bucket: a.bucket,
      title: a.title,
      takeaway: a.takeaway,
      signalStrength: a.signalStrength,
      sentimentIndex: a.sentimentIndex,
      emotion: a.emotion,
      posts: a.posts,
      delta: {
        baselinePosts: a.baselineAvg == null ? null : Math.round(a.baselineAvg),
        deltaPosts: a.deltaPosts == null ? null : Math.round(a.deltaPosts),
        pctChange: a.pctChange == null ? null : Math.round(a.pctChange * 10) / 10,
      },
      audience: a.audience,
      flags: a.flags,
      competitive: a.competitive,
      evidence: a.evidence,
      examples: a.examples,
      drilldown: {
        cluster: { bucket: a.bucket, clusterKey: a.clusterKey },
        period,
      },
    } satisfies ExecutiveCard
  })
}

export function buildClusters({
  rows,
  currentWeeks,
  baselineWeeks,
  baselineWeeksCount,
  view,
  period,
}: {
  rows: ExecutiveBaseRow[]
  currentWeeks: string[]
  baselineWeeks: string[]
  baselineWeeksCount: number
  view: ExecutiveViewMode
  period: { type: "week" | "full"; week: string; startDate: string; endDate: string }
}) {
  const currentSet = new Set(currentWeeks)
  const baselineSet = new Set(baselineWeeks)

  const clusters = new Map<string, { bucket: string; normalizedTitle: string; current: ExecutiveBaseRow[]; baseline: ExecutiveBaseRow[] }>()

  for (const r of rows) {
    const bucket = (r.card_bucket ?? "unspecified").trim() || "unspecified"
    const normalizedTitle = getClusterTitleKey(r)
    const clusterKey = `${bucket}::${normalizedTitle}`
    const createdWeek = (r.created_week || "").trim()
    const inCur = currentSet.has(createdWeek)
    const inBase = baselineSet.has(createdWeek)
    if (!inCur && !inBase) continue
    const entry = clusters.get(clusterKey) || { bucket, normalizedTitle, current: [], baseline: [] }
    if (inCur) entry.current.push(r)
    if (inBase) entry.baseline.push(r)
    clusters.set(clusterKey, entry)
  }

  const aggs: ClusterAgg[] = []
  for (const [clusterKey, v] of clusters.entries()) {
    if (!v.current.length) continue
    aggs.push(computeClusterAgg(clusterKey, v.bucket, v.normalizedTitle, v.current, v.baseline, baselineWeeksCount, view))
  }

  return aggs
}

export function buildExecutiveSections({
  filters,
  rows,
  view,
  week,
  currentWeeks,
  baselineWeeks,
  periodStartDate,
  periodEndDate,
  baselineWeeksCount,
  maxCardsPerSection,
  includeAudienceSplit,
}: {
  filters: ExecutiveFilters
  rows: ExecutiveBaseRow[]
  view: ExecutiveViewMode
  week: string
  currentWeeks: string[]
  baselineWeeks: string[]
  periodStartDate: string
  periodEndDate: string
  baselineWeeksCount: number
  maxCardsPerSection: number
  includeAudienceSplit: boolean
}) {
  const period = { type: view === "full" ? ("full" as const) : ("week" as const), week, startDate: periodStartDate, endDate: periodEndDate }
  const aggs = buildClusters({ rows, currentWeeks, baselineWeeks, baselineWeeksCount, view, period })

  const byScore = (a: ClusterAgg, b: ClusterAgg) => b.signalStrength - a.signalStrength

  const all = dedupeByJaccard(aggs).sort(byScore)
  const sequencing = dedupeByJaccard(aggs.filter((a) => a.rates.sequencing >= 0.2)).sort(byScore)
  const safety = dedupeByJaccard(aggs.filter((a) => a.rates.neurotox >= 0.15 || a.rates.qol >= 0.15 || a.rates.cns >= 0.15)).sort(byScore)
  const uk = dedupeByJaccard(aggs.filter((a) => a.rates.uk_access >= 0.1)).sort(byScore)
  const competitive = dedupeByJaccard(aggs.filter((a) => a.rates.competitive_context >= 0.15 || a.rates.competitor_mentions >= 0.1)).sort(byScore)

  const sections: Array<{ id: string; title: string; cards: ExecutiveCard[] }> = []

  if (view === "weekly") {
    sections.push({
      id: "weekly_key_takeaways",
      title: "This week's key takeaways",
      cards: buildCardsFromAggs(all.slice(0, maxCardsPerSection), view, period),
    })
    sections.push({
      id: "weekly_sequencing",
      title: "Sequencing signals",
      cards: buildCardsFromAggs(sequencing.slice(0, Math.min(maxCardsPerSection, 6)), view, period),
    })
    sections.push({
      id: "weekly_safety_qol_cns",
      title: "Safety, neurotox and QoL",
      cards: buildCardsFromAggs(safety.slice(0, Math.min(maxCardsPerSection, 6)), view, period),
    })
    sections.push({
      id: "weekly_uk_access",
      title: "UK access snapshot",
      cards: buildCardsFromAggs(uk.slice(0, Math.min(maxCardsPerSection, 5)), view, period),
    })
    sections.push({
      id: "weekly_competitive",
      title: "Competitive shifts",
      cards: buildCardsFromAggs(competitive.slice(0, Math.min(maxCardsPerSection, 6)), view, period),
    })

    if (includeAudienceSplit) {
      const audienceOrder = [
        { id: "audience_hcp", title: "What lands with HCPs", bucket: "HCP" },
        { id: "audience_patient", title: "What lands with patients", bucket: "Patient" },
        { id: "audience_caregiver", title: "What lands with caregivers", bucket: "Caregiver" },
        { id: "audience_payer", title: "What lands with payers / access", bucket: "Payer" },
      ] as const

      for (const a of audienceOrder) {
        const sliceRows = rows.filter((r) => (r.stakeholder_bucket || "Other") === a.bucket)
        const sliceAggs = buildClusters({ rows: sliceRows, currentWeeks, baselineWeeks, baselineWeeksCount, view, period })
        const cards = buildCardsFromAggs(dedupeByJaccard(sliceAggs).sort(byScore).slice(0, 4), view, period)
        sections.push({ id: a.id, title: a.title, cards })
      }
    }
  } else {
    sections.push({
      id: "full_picture",
      title: "Full picture",
      cards: buildCardsFromAggs(all.slice(0, 8), view, period),
    })
  }

  return sections
}
