import { NextResponse } from "next/server"

import { runQuery } from "@/lib/bigquery"
import { getExecutiveFilters } from "@/lib/alunbrig/executiveFilters"
import { getExecutiveBaseCteSql, getExecutiveBaseParams } from "@/lib/alunbrig/executiveSql"
import {
  buildExecutiveSections,
  isoWeekStartEnd,
  prevIsoWeek,
  type ExecutiveBaseRow,
  type ExecutiveCardsResponse,
} from "@/lib/alunbrig/executiveCardFactory"
import { getCachedCards, makeCacheKey, setCachedCards } from "@/lib/alunbrig/executiveCache"

export const runtime = "nodejs"

async function loadWeeks(filters: ReturnType<typeof getExecutiveFilters>) {
  const sql = `
    ${getExecutiveBaseCteSql()}
    SELECT created_week AS week, COUNT(*) AS posts
    FROM base
    GROUP BY week
    ORDER BY week
  `
  const rows = await runQuery<{ week: string; posts: number }>(sql, getExecutiveBaseParams(filters))
  const weeks = (rows || [])
    .map((r) => {
      const week = String(r.week || "").trim()
      const { startDate, endDate } = isoWeekStartEnd(week)
      return { week, startDate, endDate, posts: Number(r.posts || 0) }
    })
    .filter((w) => w.week && w.startDate && w.endDate)
  weeks.sort((a, b) => a.startDate.localeCompare(b.startDate))
  const defaultWeek = weeks.length ? weeks[weeks.length - 1].week : ""
  return { weeks, defaultWeek }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getExecutiveFilters(searchParams)

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  try {
    const { weeks: availableWeeks, defaultWeek } = await loadWeeks(filters)
    const requestedWeek = filters.week || defaultWeek

    const view = filters.view

    let week = requestedWeek
    let currentWeeks: string[] = []
    let baselineWeeks: string[] = []
    let baselineWeeksCount = 0
    let periodStartDate = ""
    let periodEndDate = ""

    if (view === "weekly") {
      currentWeeks = [week]
      baselineWeeks = []
      let w = week
      for (let i = 0; i < 6; i++) {
        w = prevIsoWeek(w)
        if (w) baselineWeeks.push(w)
      }
      baselineWeeksCount = 6
      const r = isoWeekStartEnd(week)
      periodStartDate = r.startDate
      periodEndDate = r.endDate
    } else {
      const lastN = Math.min(12, availableWeeks.length)
      const current = availableWeeks.slice(Math.max(0, availableWeeks.length - lastN))
      currentWeeks = current.map((w) => w.week)
      week = currentWeeks[currentWeeks.length - 1] || defaultWeek || ""
      periodStartDate = current[0]?.startDate || ""
      periodEndDate = current[current.length - 1]?.endDate || ""

      const baseStartIdx = Math.max(0, availableWeeks.length - lastN - 12)
      const baselineSlice = availableWeeks.slice(baseStartIdx, Math.max(0, availableWeeks.length - lastN))
      baselineWeeks = baselineSlice.map((w) => w.week)
      baselineWeeksCount = baselineWeeks.length
    }

    if (!week) {
      return NextResponse.json({ error: "No data in selected range" }, { status: 404 })
    }

    const cacheKey = makeCacheKey({
      t: "cards",
      view,
      week,
      currentWeeks,
      baselineWeeks,
      baselineWeeksCount,
      maxCardsPerSection: filters.maxCardsPerSection,
      includeAudienceSplit: filters.includeAudienceSplit,
      base: {
        startDate: filters.startDate,
        endDate: filters.endDate,
        includeLowRelevance: filters.includeLowRelevance,
        stakeholder: filters.stakeholder,
        sentimentLabel: filters.sentimentLabel,
        evidenceType: filters.evidenceType,
        searchText: filters.searchText,
        cardBucket: filters.cardBucket,
        ukOnly: filters.ukOnly,
        sequencingOnly: filters.sequencingOnly,
      },
    })

    const cached = getCachedCards(cacheKey)
    if (cached) return NextResponse.json(cached)

    const weeksToQuery = Array.from(new Set([...currentWeeks, ...baselineWeeks])).filter(Boolean)

    const sql = `
      ${getExecutiveBaseCteSql()},
      slice AS (
        SELECT * FROM base
        WHERE created_week IN UNNEST(@weeks)
      )
      SELECT
        created_ts,
        created_week,

        id,
        url,
        text,
        engagement,

        stakeholder_primary,
        stakeholder_bucket,

        sentiment_label,
        sentiment_polarity_minus1_to_1,
        sentiment_emotion_primary,
        sentiment_emotion_intensity_0_100,
        sentiment_drivers,

        topics_key_terms,
        topics_top_topics,
        topics_theme_summary,

        card_bucket,
        card_title,
        card_takeaway,
        card_signal_strength_0_100,
        card_content_angle_suggestions,
        insight_tags_hurdles,
        insight_tags_opportunities,

        competitive_positioning_comparative_context,
        competitive_positioning_stance_toward_alunbrig,
        entities_competitors,

        sequencing_is_sequencing_discussed,
        sequencing_pfs_or_pfs2_mentioned,
        sequencing_attrition_or_discontinuation,
        topics_brief_flags_quality_of_life,
        topics_brief_flags_neuro_or_cognitive_toxicity,
        topics_brief_flags_cns_or_brain_mets,
        topics_brief_flags_uk_access_or_reimbursement,
        uk_access_is_uk_related
      FROM slice
    `

    const rows = await runQuery<ExecutiveBaseRow>(sql, {
      ...getExecutiveBaseParams(filters),
      weeks: weeksToQuery,
    })

    const currentSet = new Set(currentWeeks)
    const currentRows = (rows || []).filter((r) => currentSet.has(String(r.created_week || "").trim()))

    const posts = currentRows.length
    const sequencingPosts = currentRows.filter((r) => r.sequencing_is_sequencing_discussed).length
    const ukAccessPosts = currentRows.filter((r) => r.uk_access_is_uk_related || r.topics_brief_flags_uk_access_or_reimbursement).length

    const sections = buildExecutiveSections({
      filters,
      rows: rows || [],
      view,
      week,
      currentWeeks,
      baselineWeeks,
      periodStartDate,
      periodEndDate,
      baselineWeeksCount,
      maxCardsPerSection: filters.maxCardsPerSection,
      includeAudienceSplit: filters.includeAudienceSplit,
    })

    const { startDate: weekStartDate, endDate: weekEndDate } = isoWeekStartEnd(week)

    const payload: ExecutiveCardsResponse = {
      meta: {
        view,
        week,
        weekStartDate,
        weekEndDate,
        baselineWeeks,
        filters: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          includeLowRelevance: filters.includeLowRelevance,
          stakeholder: filters.stakeholder,
          evidenceType: filters.evidenceType,
          sentimentLabel: filters.sentimentLabel,
          searchText: filters.searchText,
          cardBucket: filters.cardBucket,
          ukOnly: filters.ukOnly,
          sequencingOnly: filters.sequencingOnly,
          includeAudienceSplit: filters.includeAudienceSplit,
          maxCardsPerSection: filters.maxCardsPerSection,
        },
        counts: { posts, keptPosts: posts, sequencingPosts, ukAccessPosts },
      },
      sections,
    }

    setCachedCards(cacheKey, payload)
    return NextResponse.json(payload)
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
