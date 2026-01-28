import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getAlunbrigThemeFilters } from "@/lib/alunbrig/themeFilters"
import type { AlunbrigThemeGroupBy, AlunbrigThemeMetric } from "@/lib/alunbrig/themeFilters"
import { getBaseCteSql, getBaseParams } from "@/lib/alunbrig/themeSql"

type XMetric = "posts" | "metricValue"

type SizeMetric = "engagement" | "views"

function isGroupBy(v: string): v is AlunbrigThemeGroupBy {
  return v === "card_bucket" || v === "topics_top_topics" || v === "clinical_context_biomarker" || v === "competitive_context"
}
function isMetric(v: string): v is AlunbrigThemeMetric {
  return v === "volume" || v === "engagement" || v === "views"
}
function isXMetric(v: string): v is XMetric {
  return v === "posts" || v === "metricValue"
}
function isSizeMetric(v: string): v is SizeMetric {
  return v === "engagement" || v === "views"
}

function groupRowsSql(groupBy: AlunbrigThemeGroupBy) {
  if (groupBy === "topics_top_topics") {
    return `
      group_rows AS (
        SELECT
          TRIM(topic) AS grp,
          sentiment_polarity_minus1_to_1,
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
        sentiment_polarity_minus1_to_1,
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
  const xMetricRaw = searchParams.get("xMetric") || "posts"
  const sizeMetricRaw = searchParams.get("sizeMetric") || "engagement"
  const limit = Math.min(2000, Math.max(1, Number(searchParams.get("limit") || 500)))

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }
  if (!isGroupBy(groupByRaw)) return NextResponse.json({ error: "Invalid groupBy" }, { status: 400 })
  if (!isMetric(metricRaw)) return NextResponse.json({ error: "Invalid metric" }, { status: 400 })
  if (!isXMetric(xMetricRaw)) return NextResponse.json({ error: "Invalid xMetric" }, { status: 400 })
  if (!isSizeMetric(sizeMetricRaw)) return NextResponse.json({ error: "Invalid sizeMetric" }, { status: 400 })

  const groupBy = groupByRaw
  const metric = metricRaw
  const xMetric = xMetricRaw
  const sizeMetric = sizeMetricRaw

  const sql = `
    ${getBaseCteSql()},
    ${groupRowsSql(groupBy)},
    grouped AS (
      SELECT
        grp,
        COUNT(*) AS posts,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentiment_index,
        AVG(sentiment_polarity_minus1_to_1) AS avg_polarity,
        SUM(engagement) AS engagement_sum,
        SUM(viewCount) AS views_sum
      FROM group_rows
      GROUP BY grp
    )
    SELECT
      grp AS groupLabel,
      CASE @metric
        WHEN 'volume' THEN posts
        WHEN 'engagement' THEN engagement_sum
        WHEN 'views' THEN views_sum
        ELSE posts
      END AS metricValue,
      posts,
      sentiment_index AS sentimentIndex,
      avg_polarity AS avgPolarity,
      CASE @xMetric
        WHEN 'posts' THEN posts
        ELSE
          CASE @metric
            WHEN 'volume' THEN posts
            WHEN 'engagement' THEN engagement_sum
            WHEN 'views' THEN views_sum
            ELSE posts
          END
      END AS x,
      sentiment_index AS y,
      CASE @sizeMetric
        WHEN 'views' THEN views_sum
        ELSE engagement_sum
      END AS size
    FROM grouped
    ORDER BY posts DESC
    LIMIT @limit
  `

  try {
    const rawPoints = await runQuery<any>(sql, { ...getBaseParams(filters), groupBy, metric, xMetric, sizeMetric, limit })
    const points = (rawPoints || []).map((p: any) => {
      const { groupLabel, ...rest } = p || {}
      return { group: groupLabel, ...rest }
    })
    return NextResponse.json({ points })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
