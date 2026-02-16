import { NextResponse } from "next/server"
import { runQuery } from "@/lib/bigquery"
import { getTrendsFilters } from "@/lib/alunbrig/trendsFilters"
import { getTrendsBaseCteSql, getTrendsBaseParams, periodOrderExpr } from "@/lib/alunbrig/trendsSql"

function windowSize(granularity: "day" | "week" | "month") {
  if (granularity === "day") return 30
  return 6
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filters = getTrendsFilters(searchParams)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 10)))

  if (!filters.startDate || !filters.endDate) {
    return NextResponse.json({ error: "Missing startDate/endDate" }, { status: 400 })
  }

  const win = windowSize(filters.granularity)
  const orderExpr = periodOrderExpr(filters.granularity)

  const sql = `
    ${getTrendsBaseCteSql(filters.granularity)},
    period_agg AS (
      SELECT
        period,
        COUNT(*) AS posts,
        AVG((sentiment_polarity_minus1_to_1 + 1) * 50) AS sentimentIndex,
        AVG(sentiment_polarity_minus1_to_1) AS avgPolarity
      FROM period_rows
      GROUP BY period
    ),
    with_order AS (
      SELECT
        *,
        ${orderExpr} AS period_order
      FROM period_agg
    ),
    with_baseline AS (
      SELECT
        *,
        CASE
          WHEN COUNT(posts) OVER (ORDER BY period_order ROWS BETWEEN ${win} PRECEDING AND 1 PRECEDING) = ${win}
          THEN AVG(posts) OVER (ORDER BY period_order ROWS BETWEEN ${win} PRECEDING AND 1 PRECEDING)
          ELSE NULL
        END AS baselinePosts
      FROM with_order
    ),
    alerts AS (
      SELECT
        period,
        period_order,
        posts,
        baselinePosts,
        (posts - baselinePosts) AS delta,
        SAFE_DIVIDE((posts - baselinePosts), baselinePosts) AS pctChange,
        sentimentIndex,
        avgPolarity
      FROM with_baseline
      WHERE baselinePosts IS NOT NULL
        AND posts >= baselinePosts * 1.25
        AND (posts - baselinePosts) >= 10
    ),
    alert_rows AS (
      SELECT pr.*
      FROM period_rows pr
      JOIN alerts a USING(period)
    ),
    stakeholder_counts AS (
      SELECT
        period,
        stakeholder_primary AS label,
        COUNT(*) AS count
      FROM alert_rows
      WHERE stakeholder_primary IS NOT NULL AND TRIM(stakeholder_primary) != ''
      GROUP BY period, label
    ),
    stakeholder_top AS (
      SELECT
        a.period,
        ARRAY_AGG(
          STRUCT(
            sc.label AS label,
            SAFE_DIVIDE(sc.count, a.posts) AS share
          )
          ORDER BY sc.count DESC
          LIMIT 1
        )[OFFSET(0)] AS mostInvolvedStakeholder
      FROM alerts a
      LEFT JOIN stakeholder_counts sc ON sc.period = a.period
      GROUP BY a.period, a.posts
    ),
    bucket_counts AS (
      SELECT
        period,
        card_bucket AS bucket,
        COUNT(*) AS count
      FROM alert_rows
      WHERE card_bucket IS NOT NULL AND TRIM(CAST(card_bucket AS STRING)) != ''
      GROUP BY period, bucket
    ),
    bucket_top AS (
      SELECT
        a.period,
        ARRAY_AGG(STRUCT(bc.bucket AS bucket, SAFE_DIVIDE(bc.count, a.posts) AS share) ORDER BY bc.count DESC LIMIT 3) AS topBuckets
      FROM alerts a
      LEFT JOIN bucket_counts bc ON bc.period = a.period
      GROUP BY a.period, a.posts
    ),
    topic_rows AS (
      SELECT
        period,
        TRIM(topic) AS topic
      FROM alert_rows, UNNEST(SPLIT(IFNULL(topics_top_topics,''), ';')) AS topic
      WHERE TRIM(topic) != ''
    ),
    topic_counts AS (
      SELECT period, topic, COUNT(*) AS count
      FROM topic_rows
      GROUP BY period, topic
    ),
    topic_top AS (
      SELECT
        period,
        ARRAY_AGG(STRUCT(topic, count) ORDER BY count DESC LIMIT 5) AS topTopics
      FROM topic_counts
      GROUP BY period
    ),
    driver_rows AS (
      SELECT
        period,
        TRIM(driver) AS driver
      FROM alert_rows, UNNEST(SPLIT(IFNULL(sentiment_drivers,''), ';')) AS driver
      WHERE TRIM(driver) != ''
    ),
    driver_counts AS (
      SELECT period, driver, COUNT(*) AS count
      FROM driver_rows
      GROUP BY period, driver
    ),
    driver_top AS (
      SELECT
        period,
        ARRAY_AGG(STRUCT(driver, count) ORDER BY count DESC LIMIT 5) AS topDrivers
      FROM driver_counts
      GROUP BY period
    )
    SELECT
      a.period,
      a.posts,
      a.baselinePosts,
      a.delta,
      a.pctChange,
      a.sentimentIndex,
      a.avgPolarity,
      IFNULL(st.mostInvolvedStakeholder, STRUCT('Unknown' AS label, 0.0 AS share)) AS mostInvolvedStakeholder,
      IFNULL(bt.topBuckets, []) AS topBuckets,
      IFNULL(tt.topTopics, []) AS topTopics,
      IFNULL(dt.topDrivers, []) AS topDrivers
    FROM alerts a
    LEFT JOIN stakeholder_top st USING(period)
    LEFT JOIN bucket_top bt USING(period)
    LEFT JOIN topic_top tt USING(period)
    LEFT JOIN driver_top dt USING(period)
    ORDER BY pctChange DESC, delta DESC
    LIMIT @limit
  `

  try {
    const rows = await runQuery<any>(sql, { ...getTrendsBaseParams(filters), limit })

    const alerts = (rows || []).map((r: any) => {
      const topDrivers = (r.topDrivers || []).slice(0, 2).map((d: any) => d.driver).filter(Boolean)
      const topStakeholderLabel = r?.mostInvolvedStakeholder?.label || "Unknown"
      const explanation = `Conversation spiked +${pct(Number(r.pctChange || 0))} vs baseline, driven by ${topDrivers.join(" and ") || "key discussion drivers"} with strongest activity from ${topStakeholderLabel}.`

      return {
        period: r.period,
        posts: Number(r.posts || 0),
        baselinePosts: Number(r.baselinePosts || 0),
        delta: Number(r.delta || 0),
        pctChange: Number(r.pctChange || 0),
        sentimentIndex: Number(r.sentimentIndex || 0),
        avgPolarity: Number(r.avgPolarity || 0),
        mostInvolvedStakeholder: r.mostInvolvedStakeholder || { label: "Unknown", share: 0 },
        topBuckets: r.topBuckets || [],
        topTopics: r.topTopics || [],
        topDrivers: r.topDrivers || [],
        explanation,
        drilldown: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          period: r.period,
          filters: { ...filters },
        },
      }
    })

    return NextResponse.json({ granularity: filters.granularity, alerts })
  } catch (e) {
    console.error(e)
    const message = (e as any)?.message || "BigQuery error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
