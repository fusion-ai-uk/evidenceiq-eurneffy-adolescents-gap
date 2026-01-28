import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getAlunbrigThemeFilters } from "@/lib/alunbrig/themeFilters"
import type { AlunbrigThemeMetric } from "@/lib/alunbrig/themeFilters"
import { getBaseCteSql, getBaseParams } from "@/lib/alunbrig/themeSql"

function isMetric(v: string): v is AlunbrigThemeMetric {
  return v === "volume" || v === "engagement" || v === "views"
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getAlunbrigThemeFilters(searchParams)
  const metricRaw = searchParams.get("metric") || "volume"
  const limit = Math.min(500, Math.max(1, Number(searchParams.get("limit") || 50)))

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }
  if (!isMetric(metricRaw)) return NextResponse.json({ error: "Invalid metric" }, { status: 400 })

  const metric = metricRaw

  const sql = `
    ${getBaseCteSql()},
    group_rows AS (
      SELECT
        TRIM(topic) AS topic,
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
    ),
    grouped AS (
      SELECT
        topic,
        COUNT(*) AS posts,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentiment_index,
        AVG(CASE WHEN sequencing_is_sequencing_discussed THEN 1 ELSE 0 END) AS pct_sequencing,
        AVG(CASE WHEN topics_brief_flags_quality_of_life THEN 1 ELSE 0 END) AS pct_qol,
        AVG(CASE WHEN topics_brief_flags_neuro_or_cognitive_toxicity THEN 1 ELSE 0 END) AS pct_neurotox,
        AVG(CASE WHEN topics_brief_flags_cns_or_brain_mets THEN 1 ELSE 0 END) AS pct_cns,
        AVG(CASE WHEN (topics_brief_flags_uk_access_or_reimbursement OR uk_access_is_uk_related) THEN 1 ELSE 0 END) AS pct_uk_access,
        SUM(engagement) AS engagement_sum,
        SUM(viewCount) AS views_sum
      FROM group_rows
      GROUP BY topic
    ),
    stakeholder_counts AS (
      SELECT
        topic,
        stakeholder_primary AS label,
        COUNT(*) AS count
      FROM group_rows
      WHERE stakeholder_primary IS NOT NULL AND TRIM(stakeholder_primary) != ''
      GROUP BY topic, label
    ),
    stakeholder_top AS (
      SELECT
        topic,
        ARRAY_AGG(STRUCT(label, count) ORDER BY count DESC LIMIT 3) AS topStakeholders
      FROM stakeholder_counts
      GROUP BY topic
    ),
    term_rows AS (
      SELECT
        topic,
        TRIM(term) AS term
      FROM group_rows, UNNEST(SPLIT(IFNULL(topics_key_terms,''), ';')) AS term
      WHERE TRIM(term) != ''
    ),
    term_counts AS (
      SELECT topic, term, COUNT(*) AS count
      FROM term_rows
      GROUP BY topic, term
    ),
    term_top AS (
      SELECT
        topic,
        ARRAY_AGG(STRUCT(term, count) ORDER BY count DESC LIMIT 8) AS topKeyTerms
      FROM term_counts
      GROUP BY topic
    )
    SELECT
      g.topic AS topic,
      g.posts AS posts,
      CASE @metric
        WHEN 'volume' THEN g.posts
        WHEN 'engagement' THEN g.engagement_sum
        WHEN 'views' THEN g.views_sum
        ELSE g.posts
      END AS metricValue,
      g.sentiment_index AS sentimentIndex,
      g.pct_sequencing AS pctSequencing,
      g.pct_qol AS pctQoL,
      g.pct_neurotox AS pctNeurotox,
      g.pct_cns AS pctCNS,
      g.pct_uk_access AS pctUKAccess,
      IFNULL(s.topStakeholders, []) AS topStakeholders,
      IFNULL(t.topKeyTerms, []) AS topKeyTerms
    FROM grouped g
    LEFT JOIN stakeholder_top s USING(topic)
    LEFT JOIN term_top t USING(topic)
    ORDER BY metricValue DESC
    LIMIT @limit
  `

  try {
    const rows = await runQuery<any>(sql, { ...getBaseParams(filters), metric, limit })
    return NextResponse.json({ rows })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
