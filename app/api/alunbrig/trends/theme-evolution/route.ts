import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getTrendsFilters } from "@/lib/alunbrig/trendsFilters"
import type { TrendsGranularity } from "@/lib/alunbrig/trendsFilters"
import { getTrendsBaseCteSql, getTrendsBaseParams, periodOrderExpr } from "@/lib/alunbrig/trendsSql"

function endWindowSizeExpr() {
  // 25% of total periods, minimum 1
  return "GREATEST(1, CAST(CEIL(totalPeriods * 0.25) AS INT64))"
}

function periodOrder(granularity: TrendsGranularity) {
  return periodOrderExpr(granularity)
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getTrendsFilters(searchParams)
  const granularity = filters.granularity

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const orderExpr = periodOrder(granularity)

  const sql = `
    ${getTrendsBaseCteSql(granularity)},
    periods AS (
      SELECT DISTINCT period, ${orderExpr} AS period_order
      FROM period_rows
    ),
    periods_ranked AS (
      SELECT
        period,
        period_order,
        ROW_NUMBER() OVER (ORDER BY period_order) AS rn,
        COUNT(*) OVER () AS totalPeriods
      FROM periods
    ),
    bounds AS (
      SELECT
        totalPeriods,
        ${endWindowSizeExpr()} AS windowPeriods
      FROM periods_ranked
      WHERE rn = 1
    ),
    start_set AS (
      SELECT pr.period
      FROM periods_ranked pr, bounds b
      WHERE pr.rn <= b.windowPeriods
    ),
    end_set AS (
      SELECT pr.period
      FROM periods_ranked pr, bounds b
      WHERE pr.rn > (b.totalPeriods - b.windowPeriods)
    ),
    bucket_counts AS (
      SELECT
        'bucket' AS type,
        CAST(card_bucket AS STRING) AS label,
        SUM(CASE WHEN period IN (SELECT period FROM start_set) THEN 1 ELSE 0 END) AS startCount,
        SUM(CASE WHEN period IN (SELECT period FROM end_set) THEN 1 ELSE 0 END) AS endCount
      FROM period_rows
      WHERE card_bucket IS NOT NULL AND TRIM(CAST(card_bucket AS STRING)) != ''
      GROUP BY label
    ),
    topic_rows AS (
      SELECT
        period,
        TRIM(topic) AS topic,
        stakeholder_primary,
        topics_key_terms,
        sentiment_polarity_minus1_to_1
      FROM period_rows, UNNEST(SPLIT(IFNULL(topics_top_topics,''), ';')) AS topic
      WHERE TRIM(topic) != ''
    ),
    topic_counts AS (
      SELECT
        'topic' AS type,
        topic AS label,
        SUM(CASE WHEN period IN (SELECT period FROM start_set) THEN 1 ELSE 0 END) AS startCount,
        SUM(CASE WHEN period IN (SELECT period FROM end_set) THEN 1 ELSE 0 END) AS endCount
      FROM topic_rows
      GROUP BY label
    ),
    counts AS (
      SELECT * FROM bucket_counts
      UNION ALL
      SELECT * FROM topic_counts
    ),
    filtered AS (
      SELECT
        type,
        label,
        startCount,
        endCount,
        (endCount - startCount) AS delta,
        SAFE_DIVIDE((endCount - startCount), GREATEST(startCount, 1)) AS pctChange
      FROM counts
      WHERE endCount >= 10
    ),
    end_bucket_rows AS (
      SELECT pr.*
      FROM period_rows pr
      JOIN end_set e USING(period)
      WHERE pr.card_bucket IS NOT NULL AND TRIM(CAST(pr.card_bucket AS STRING)) != ''
    ),
    end_topic_rows AS (
      SELECT tr.*
      FROM topic_rows tr
      JOIN end_set e USING(period)
    ),
    end_sentiment AS (
      SELECT
        'bucket' AS type,
        CAST(card_bucket AS STRING) AS label,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentimentIndexEnd
      FROM end_bucket_rows
      GROUP BY label
      UNION ALL
      SELECT
        'topic' AS type,
        topic AS label,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentimentIndexEnd
      FROM end_topic_rows
      GROUP BY label
    ),
    end_stakeholders AS (
      SELECT
        'bucket' AS type,
        CAST(card_bucket AS STRING) AS label,
        stakeholder_primary AS stakeholder,
        COUNT(*) AS count
      FROM end_bucket_rows
      WHERE stakeholder_primary IS NOT NULL AND TRIM(stakeholder_primary) != ''
      GROUP BY label, stakeholder
      UNION ALL
      SELECT
        'topic' AS type,
        topic AS label,
        stakeholder_primary AS stakeholder,
        COUNT(*) AS count
      FROM end_topic_rows
      WHERE stakeholder_primary IS NOT NULL AND TRIM(stakeholder_primary) != ''
      GROUP BY label, stakeholder
    ),
    end_stakeholder_top AS (
      SELECT
        type,
        label,
        ARRAY_AGG(STRUCT(stakeholder AS label, count) ORDER BY count DESC LIMIT 3) AS topStakeholdersEnd
      FROM end_stakeholders
      GROUP BY type, label
    ),
    end_key_terms AS (
      SELECT
        'bucket' AS type,
        CAST(card_bucket AS STRING) AS label,
        TRIM(term) AS term
      FROM end_bucket_rows, UNNEST(SPLIT(IFNULL(topics_key_terms,''), ';')) AS term
      WHERE TRIM(term) != ''
      UNION ALL
      SELECT
        'topic' AS type,
        topic AS label,
        TRIM(term) AS term
      FROM end_topic_rows, UNNEST(SPLIT(IFNULL(topics_key_terms,''), ';')) AS term
      WHERE TRIM(term) != ''
    ),
    end_key_term_counts AS (
      SELECT type, label, term, COUNT(*) AS count
      FROM end_key_terms
      GROUP BY type, label, term
    ),
    end_key_term_top AS (
      SELECT
        type,
        label,
        ARRAY_AGG(STRUCT(term, count) ORDER BY count DESC LIMIT 8) AS topKeyTermsEnd
      FROM end_key_term_counts
      GROUP BY type, label
    )
    SELECT
      f.type,
      f.label,
      f.startCount,
      f.endCount,
      f.delta,
      f.pctChange,
      IFNULL(s.sentimentIndexEnd, 50) AS sentimentIndexEnd,
      IFNULL(st.topStakeholdersEnd, []) AS topStakeholdersEnd,
      IFNULL(kt.topKeyTermsEnd, []) AS topKeyTermsEnd
    FROM filtered f
    LEFT JOIN end_sentiment s USING(type, label)
    LEFT JOIN end_stakeholder_top st USING(type, label)
    LEFT JOIN end_key_term_top kt USING(type, label)
  `

  try {
    const rows = await runQuery<any>(sql, getTrendsBaseParams(filters))
    const items = (rows || []).map((r: any) => ({
      label: r.label,
      type: r.type,
      startCount: Number(r.startCount || 0),
      endCount: Number(r.endCount || 0),
      delta: Number(r.delta || 0),
      pctChange: Number(r.pctChange || 0),
      sentimentIndexEnd: Number(r.sentimentIndexEnd || 0),
      topStakeholdersEnd: r.topStakeholdersEnd || [],
      topKeyTermsEnd: r.topKeyTermsEnd || [],
    }))

    const rising = [...items].sort((a, b) => (b.pctChange - a.pctChange) || (b.delta - a.delta)).slice(0, 10)
    const falling = [...items].sort((a, b) => (a.pctChange - b.pctChange) || (a.delta - b.delta)).slice(0, 10)

    return NextResponse.json({ granularity, rising, falling })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

