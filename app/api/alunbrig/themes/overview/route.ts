import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getAlunbrigThemeFilters } from "@/lib/alunbrig/themeFilters"
import type { AlunbrigThemeGroupBy, AlunbrigThemeMetric } from "@/lib/alunbrig/themeFilters"
import { getBaseCteSql, getBaseParams } from "@/lib/alunbrig/themeSql"

function isGroupBy(v: string): v is AlunbrigThemeGroupBy {
  return v === "card_bucket" || v === "topics_top_topics" || v === "clinical_context_biomarker" || v === "competitive_context"
}

function isMetric(v: string): v is AlunbrigThemeMetric {
  return v === "volume" || v === "engagement" || v === "views"
}

function groupRowsSql(groupBy: AlunbrigThemeGroupBy) {
  if (groupBy === "topics_top_topics") {
    return `
      group_rows AS (
        SELECT
          TRIM(topic) AS grp,
          stakeholder_primary,
          topics_key_terms,
          sentiment_polarity_minus1_to_1,
          sequencing_is_sequencing_discussed,
          topics_brief_flags_quality_of_life,
          topics_brief_flags_neuro_or_cognitive_toxicity,
          topics_brief_flags_cns_or_brain_mets,
          topics_brief_flags_uk_access_or_reimbursement,
          uk_access_is_uk_related,
          engagement,
          viewCount
        FROM base, UNNEST(SPLIT(IFNULL(topics_top_topics,''), ';')) AS topic
        WHERE TRIM(topic) != ''
      )
    `
  }

  const col =
    groupBy === "card_bucket"
      ? "card_bucket"
      : groupBy === "clinical_context_biomarker"
        ? "clinical_context_biomarker"
        : "competitive_positioning_comparative_context"

  return `
    group_rows AS (
      SELECT
        ${col} AS grp,
        stakeholder_primary,
        topics_key_terms,
        sentiment_polarity_minus1_to_1,
        sequencing_is_sequencing_discussed,
        topics_brief_flags_quality_of_life,
        topics_brief_flags_neuro_or_cognitive_toxicity,
        topics_brief_flags_cns_or_brain_mets,
        topics_brief_flags_uk_access_or_reimbursement,
        uk_access_is_uk_related,
        engagement,
        viewCount
      FROM base
      WHERE ${col} IS NOT NULL AND TRIM(CAST(${col} AS STRING)) != ''
    )
  `
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getAlunbrigThemeFilters(searchParams)

  const groupByRaw = searchParams.get("groupBy") || "card_bucket"
  const metricRaw = searchParams.get("metric") || "volume"
  const limit = Math.min(2000, Math.max(1, Number(searchParams.get("limit") || 400)))

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }
  if (!isGroupBy(groupByRaw)) return NextResponse.json({ error: "Invalid groupBy" }, { status: 400 })
  if (!isMetric(metricRaw)) return NextResponse.json({ error: "Invalid metric" }, { status: 400 })

  const groupBy = groupByRaw
  const metric = metricRaw

  const sql = `
    ${getBaseCteSql()},
    ${groupRowsSql(groupBy)},
    grouped AS (
      SELECT
        grp,
        COUNT(*) AS posts,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentiment_index,
        AVG(sentiment_polarity_minus1_to_1) AS avg_polarity,
        AVG(CASE WHEN sequencing_is_sequencing_discussed THEN 1 ELSE 0 END) AS pct_sequencing,
        AVG(CASE WHEN topics_brief_flags_quality_of_life THEN 1 ELSE 0 END) AS pct_qol,
        AVG(CASE WHEN topics_brief_flags_neuro_or_cognitive_toxicity THEN 1 ELSE 0 END) AS pct_neurotox,
        AVG(CASE WHEN topics_brief_flags_cns_or_brain_mets THEN 1 ELSE 0 END) AS pct_cns,
        AVG(CASE WHEN (topics_brief_flags_uk_access_or_reimbursement OR uk_access_is_uk_related) THEN 1 ELSE 0 END) AS pct_uk_access,
        SUM(engagement) AS engagement_sum,
        SUM(viewCount) AS views_sum
      FROM group_rows
      GROUP BY grp
    ),
    stakeholder_counts AS (
      SELECT
        grp,
        stakeholder_primary AS label,
        COUNT(*) AS count
      FROM group_rows
      WHERE stakeholder_primary IS NOT NULL AND TRIM(stakeholder_primary) != ''
      GROUP BY grp, label
    ),
    stakeholder_top AS (
      SELECT
        grp,
        ARRAY_AGG(STRUCT(label, count) ORDER BY count DESC LIMIT 3) AS topStakeholders
      FROM stakeholder_counts
      GROUP BY grp
    ),
    term_rows AS (
      SELECT
        grp,
        TRIM(term) AS term
      FROM group_rows, UNNEST(SPLIT(IFNULL(topics_key_terms,''), ';')) AS term
      WHERE TRIM(term) != ''
    ),
    term_counts AS (
      SELECT grp, term, COUNT(*) AS count
      FROM term_rows
      GROUP BY grp, term
    ),
    term_top AS (
      SELECT
        grp,
        ARRAY_AGG(STRUCT(term, count) ORDER BY count DESC LIMIT 8) AS topKeyTerms
      FROM term_counts
      GROUP BY grp
    )
    SELECT
      g.grp AS groupLabel,
      CASE @metric
        WHEN 'volume' THEN g.posts
        WHEN 'engagement' THEN g.engagement_sum
        WHEN 'views' THEN g.views_sum
        ELSE g.posts
      END AS metricValue,
      g.posts AS posts,
      g.sentiment_index AS sentimentIndex,
      g.avg_polarity AS avgPolarity,
      g.pct_sequencing AS pctSequencing,
      g.pct_qol AS pctQoL,
      g.pct_neurotox AS pctNeurotox,
      g.pct_cns AS pctCNS,
      g.pct_uk_access AS pctUKAccess,
      IFNULL(s.topStakeholders, []) AS topStakeholders,
      IFNULL(t.topKeyTerms, []) AS topKeyTerms
    FROM grouped g
    LEFT JOIN stakeholder_top s USING(grp)
    LEFT JOIN term_top t USING(grp)
    ORDER BY metricValue DESC
    LIMIT @limit
  `

  const metaSql = `
    ${getBaseCteSql()}
    SELECT
      COUNT(*) AS totalPosts,
      FORMAT_DATE('%Y-%m-%d', MIN(created_date)) AS minDate,
      FORMAT_DATE('%Y-%m-%d', MAX(created_date)) AS maxDate
    FROM base
  `

  try {
    const params = { ...getBaseParams(filters), metric, limit }
    const [rawItems, metaRows] = await Promise.all([
      runQuery<any>(sql, params),
      runQuery<any>(metaSql, getBaseParams(filters)),
    ])
    const items = (rawItems || []).map((r: any) => {
      const { groupLabel, ...rest } = r || {}
      return { group: groupLabel, ...rest }
    })
    const meta = metaRows?.[0] || { totalPosts: 0, minDate: filters.startDate, maxDate: filters.endDate }
    return NextResponse.json({ groupBy, metric, items, meta })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
